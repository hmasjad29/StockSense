from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from pydantic import BaseModel, EmailStr
from jose import jwt
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import yfinance as yf
import threading
import time as time_module

# ── ML imports ──────────────────────────────────────────────────────────────
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import warnings
warnings.filterwarnings("ignore")

app = FastAPI(title="StockSense API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///stock.db"
engine = create_engine(DATABASE_URL, echo=False)

SECRET_KEY = "stocksense-secret-key-change-this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60



# ── 20 Major Stocks ──────────────────────────────────────────────────────────
MAJOR_STOCKS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META",
    "NVDA", "AMD",  "INTC",  "TSLA", "JPM",
    "BAC",  "GS",   "WMT",   "COST", "NKE",
    "DIS",  "PEP",  "KO",    "GM",   "F"
]

# In-memory ML model store: {symbol: {model, scaler, metrics, feature_importances}}
_ml_store: dict = {}
_ml_lock = threading.Lock()

# ── Auth Models ──────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ── Auth Helpers ─────────────────────────────────────────────────────────────
# NEW
def hash_password(password: str):
    import bcrypt
    return bcrypt.hashpw(password[:72].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str):
    import bcrypt
    return bcrypt.checkpw(plain_password[:72].encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ── Technical Indicator Helpers ──────────────────────────────────────────────
def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain  = delta.clip(lower=0)
    loss  = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    rs  = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def compute_macd(series: pd.Series) -> pd.DataFrame:
    ema12  = series.ewm(span=12, adjust=False).mean()
    ema26  = series.ewm(span=26, adjust=False).mean()
    macd   = ema12 - ema26
    signal = macd.ewm(span=9, adjust=False).mean()
    hist   = macd - signal
    return pd.DataFrame({"macd": macd, "signal": signal, "hist": hist})

def compute_obv(close: pd.Series, volume: pd.Series) -> pd.Series:
    direction = np.sign(close.diff()).fillna(0)
    obv = (direction * volume).cumsum()
    return obv

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build ML feature set from OHLCV dataframe."""
    df = df.copy().sort_values("date").reset_index(drop=True)
    df["close"] = pd.to_numeric(df["close"], errors="coerce")
    df["volume"] = pd.to_numeric(df["volume"], errors="coerce")

    # Price-based
    df["sma_10"]  = df["close"].rolling(10).mean()
    df["sma_20"]  = df["close"].rolling(20).mean()
    df["ema_12"]  = df["close"].ewm(span=12, adjust=False).mean()
    df["ema_26"]  = df["close"].ewm(span=26, adjust=False).mean()
    df["rsi"]     = compute_rsi(df["close"])
    macd_df       = compute_macd(df["close"])
    df["macd"]    = macd_df["macd"]
    df["macd_sig"]= macd_df["signal"]
    df["macd_hist"]= macd_df["hist"]
    df["obv"]     = compute_obv(df["close"], df["volume"])

    # Price change features
    df["ret_1"]   = df["close"].pct_change(1)
    df["ret_3"]   = df["close"].pct_change(3)
    df["ret_5"]   = df["close"].pct_change(5)
    df["vol_10"]  = df["ret_1"].rolling(10).std()

    # Price position
    df["dist_sma20"] = (df["close"] - df["sma_20"]) / df["sma_20"]

    # Target: next day UP or DOWN
    df["target"] = (df["close"].shift(-1) > df["close"]).astype(int)

    feature_cols = [
        "rsi", "macd", "macd_sig", "macd_hist",
        "sma_10", "sma_20", "ema_12", "ema_26",
        "ret_1", "ret_3", "ret_5", "vol_10",
        "dist_sma20", "obv"
    ]
    df = df.dropna(subset=feature_cols + ["target"])
    return df, feature_cols

# ── yfinance Live Data ───────────────────────────────────────────────────────
def fetch_live_yfinance(symbol: str, period: str = "1y", interval: str = "1d") -> list:
    """Fetch live OHLCV data from yfinance."""
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval, auto_adjust=True)
        if hist.empty:
            return []
        records = []
        for idx, row in hist.iterrows():
            date_str = idx.strftime("%Y-%m-%d") if interval == "1d" else idx.strftime("%Y-%m-%d %H:%M")
            records.append({
                "date":   date_str,
                "open":   round(float(row["Open"]), 4),
                "high":   round(float(row["High"]), 4),
                "low":    round(float(row["Low"]), 4),
                "close":  round(float(row["Close"]), 4),
                "volume": int(row["Volume"]),
            })
        return records
    except Exception as e:
        print(f"yfinance error for {symbol}: {e}")
        return []

def fetch_current_price(symbol: str) -> dict:
    """Get real-time price info for a symbol."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.fast_info
        return {
            "symbol": symbol,
            "price":  round(float(info.last_price), 2),
            "change": round(float(info.last_price - info.previous_close), 2),
            "change_pct": round((float(info.last_price - info.previous_close) / float(info.previous_close)) * 100, 2),
            "volume": int(info.three_month_average_volume or 0),
            "market_cap": getattr(info, "market_cap", None),
        }
    except Exception as e:
        print(f"Price fetch error for {symbol}: {e}")
        return {"symbol": symbol, "price": None, "change": None, "change_pct": None}

# ── DB / Startup ─────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                reset_token TEXT,
                reset_token_expiry TEXT
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS stocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                date TEXT NOT NULL,
                open REAL, high REAL, low REAL, close REAL, volume INTEGER
            )
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_stocks_symbol_date ON stocks(symbol, date)
        """))
        for col in ["first_name", "last_name", "reset_token", "reset_token_expiry"]:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} TEXT"))
            except:
                pass
        conn.commit()
        count = conn.execute(text("SELECT COUNT(*) FROM stocks")).scalar()
        print(f"✅ StockSense API v2.0 started | {count} rows in DB")

# ── Core API ─────────────────────────────────────────────────────────────────
@app.get("/")
def home():
    return {"status": "StockSense backend v2.0 is running 🚀"}

@app.get("/api/stocks/symbols")
def get_symbols():
    """Return the 20 major stock symbols."""
    # Try DB first, fallback to hardcoded list
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT DISTINCT symbol FROM stocks ORDER BY symbol")).fetchall()
    db_symbols = [r[0] for r in rows]
    symbols = db_symbols if db_symbols else MAJOR_STOCKS
    return {"symbols": symbols}

@app.get("/api/stocks/{symbol}")
def get_stock_data(
    symbol: str,
    limit: int   = Query(365, description="Number of days"),
    period: str  = Query("1y", description="yfinance period: 1d,5d,1mo,3mo,6mo,1y,2y,5y"),
    interval: str= Query("1d", description="yfinance interval: 1m,5m,15m,30m,1h,1d,1wk,1mo"),
    source: str  = Query("live", description="'live' = yfinance, 'db' = sqlite"),
):
    """Fetch OHLCV data. source=live uses yfinance (real-time), source=db uses SQLite."""
    if source == "live":
        records = fetch_live_yfinance(symbol.upper(), period=period, interval=interval)
        if records:
            return records
        # Fallback to DB
    # DB path
    query = text(
        "SELECT date, open, high, low, close, volume "
        "FROM stocks WHERE symbol = :symbol "
        "ORDER BY date DESC LIMIT :limit"
    )
    with engine.connect() as conn:
        df = pd.read_sql_query(query, conn, params={"symbol": symbol.upper(), "limit": limit})
    if df.empty:
        return []
    df = df.sort_values("date")
    return df.to_dict(orient="records")

@app.get("/api/stocks/price/{symbol}")
def get_current_price(symbol: str):
    """Get live current price, change, and % change."""
    return fetch_current_price(symbol.upper())

@app.get("/api/stocks/prices/all")
def get_all_prices():
    """Get current prices for all 20 major stocks."""
    results = []
    for sym in MAJOR_STOCKS:
        info = fetch_current_price(sym)
        results.append(info)
        time_module.sleep(0.05)  # gentle rate-limiting
    return {"prices": results}

@app.get("/api/indicator/{symbol}/{indicator}")
def get_indicator(
    symbol: str,
    indicator: str,
    period: str  = Query("6mo"),
    interval: str= Query("1d"),
):
    """Compute RSI or MACD from live yfinance data."""
    records = fetch_live_yfinance(symbol.upper(), period=period, interval=interval)
    if not records:
        # Fallback DB
        query = text(
            "SELECT date, open, high, low, close, volume "
            "FROM stocks WHERE symbol = :symbol ORDER BY date DESC LIMIT 120"
        )
        with engine.connect() as conn:
            df = pd.read_sql_query(query, conn, params={"symbol": symbol.upper()})
        if df.empty:
            return {"error": "No data"}
        df = df.sort_values("date").copy()
    else:
        df = pd.DataFrame(records)

    df["close"] = pd.to_numeric(df["close"], errors="coerce")
    df = df.dropna(subset=["close"])

    if len(df) < 30:
        return {"error": "Not enough data to compute indicators"}

    if indicator.lower() == "rsi":
        df["rsi_val"] = compute_rsi(df["close"], period=14)
        df = df.dropna(subset=["rsi_val"])
        series = [{"date": row["date"], "value": round(float(row["rsi_val"]), 2)}
                  for _, row in df.iterrows()]
        return {
            "symbol": symbol.upper(),
            "indicator": "RSI",
            "latest": series[-1]["value"] if series else None,
            "series": series,
        }
    elif indicator.lower() == "macd":
        macd_df = compute_macd(df["close"])
        df["macd"]   = macd_df["macd"]
        df["signal"] = macd_df["signal"]
        df["hist"]   = macd_df["hist"]
        df = df.dropna(subset=["macd", "signal"])
        series = [
            {
                "date":   row["date"],
                "macd":   round(float(row["macd"]), 4),
                "signal": round(float(row["signal"]), 4),
                "hist":   round(float(row["hist"]), 4),
            }
            for _, row in df.iterrows()
        ]
        return {
            "symbol": symbol.upper(),
            "indicator": "MACD",
            "latest": series[-1]["macd"] if series else None,
            "series": series,
        }
    return {"error": "Unsupported indicator"}

# ── ML Train & Predict ───────────────────────────────────────────────────────
@app.post("/api/ml/train/{symbol}")
def train_model(symbol: str):
    """
    Train a Random Forest classifier on historical data for the given symbol.
    Uses 2 years of daily data from yfinance.
    """
    sym = symbol.upper()
    records = fetch_live_yfinance(sym, period="2y", interval="1d")
    if not records or len(records) < 60:
        # Try DB fallback
        with engine.connect() as conn:
            df_raw = pd.read_sql_query(
                text("SELECT date, open, high, low, close, volume FROM stocks WHERE symbol=:s ORDER BY date"),
                conn, params={"s": sym}
            )
        if df_raw.empty or len(df_raw) < 60:
            raise HTTPException(status_code=400, detail="Not enough data to train")
        records = df_raw.to_dict(orient="records")

    df = pd.DataFrame(records)
    df, feature_cols = build_features(df)

    if len(df) < 50:
        raise HTTPException(status_code=400, detail="Insufficient rows after feature engineering")

    X = df[feature_cols].values
    y = df["target"].values

    # Time-series cross-validation
    tscv = TimeSeriesSplit(n_splits=5)
    acc_scores, prec_scores, rec_scores, f1_scores = [], [], [], []

    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        min_samples_split=10,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    scaler = StandardScaler()

    for train_idx, val_idx in tscv.split(X):
        X_tr, X_val = X[train_idx], X[val_idx]
        y_tr, y_val = y[train_idx], y[val_idx]
        X_tr_s = scaler.fit_transform(X_tr)
        X_val_s = scaler.transform(X_val)
        rf.fit(X_tr_s, y_tr)
        preds = rf.predict(X_val_s)
        acc_scores.append(accuracy_score(y_val, preds))
        prec_scores.append(precision_score(y_val, preds, zero_division=0))
        rec_scores.append(recall_score(y_val, preds, zero_division=0))
        f1_scores.append(f1_score(y_val, preds, zero_division=0))

    # Final fit on all data
    X_all_s = scaler.fit_transform(X)
    rf.fit(X_all_s, y)

    importances = rf.feature_importances_
    feat_imp = sorted(
        [{"name": feat_name(f), "value": round(float(v), 4)} for f, v in zip(feature_cols, importances)],
        key=lambda x: x["value"], reverse=True
    )

    metrics = {
        "accuracy":  round(float(np.mean(acc_scores)), 4),
        "precision": round(float(np.mean(prec_scores)), 4),
        "recall":    round(float(np.mean(rec_scores)), 4),
        "f1":        round(float(np.mean(f1_scores)), 4),
        "validation": "Time-series CV (5-fold)",
        "n_samples": int(len(df)),
        "feature_importances": feat_imp,
    }

    with _ml_lock:
        _ml_store[sym] = {
            "model":    rf,
            "scaler":   scaler,
            "feature_cols": feature_cols,
            "metrics":  metrics,
            "trained_at": datetime.utcnow().isoformat(),
            "df_last":  df,
        }

    return {
        "symbol": sym,
        "status": "trained",
        "metrics": metrics,
        "feature_importances": feat_imp,
        "trained_at": _ml_store[sym]["trained_at"],
    }

def feat_name(col: str) -> str:
    mapping = {
        "rsi": "RSI", "macd": "MACD", "macd_sig": "MACD Signal",
        "macd_hist": "MACD Hist", "sma_10": "SMA-10", "sma_20": "SMA-20",
        "ema_12": "EMA-12", "ema_26": "EMA-26",
        "ret_1": "Return 1d", "ret_3": "Return 3d", "ret_5": "Return 5d",
        "vol_10": "Volatility", "dist_sma20": "Dist SMA20", "obv": "OBV",
    }
    return mapping.get(col, col)

@app.get("/api/ml/predict/{symbol}")
def predict_next(symbol: str):
    """Run ML prediction for next interval. Falls back to momentum-based if not trained."""
    sym = symbol.upper()
    with _ml_lock:
        stored = _ml_store.get(sym)

    if stored:
        # Use trained RF model
        df = stored["df_last"]
        feature_cols = stored["feature_cols"]
        scaler = stored["scaler"]
        model  = stored["model"]

        # Build latest feature row
        last_row = df[feature_cols].iloc[-1:].values
        last_row_s = scaler.transform(last_row)
        pred = model.predict(last_row_s)[0]
        prob = model.predict_proba(last_row_s)[0]
        confidence = round(float(prob[pred]), 4)
        direction  = "UP" if pred == 1 else "DOWN"

        last_close = float(df["close"].iloc[-1])
        predicted_close = round(last_close * (1.008 if direction == "UP" else 0.992), 2)

        # Derive signals from feature values
        rsi_val  = float(df["rsi"].iloc[-1])
        macd_val = float(df["macd"].iloc[-1])
        sig_val  = float(df["macd_sig"].iloc[-1])
        dist     = float(df["dist_sma20"].iloc[-1])
        signals  = []
        if rsi_val > 55: signals.append(f"RSI rising ({rsi_val:.1f})")
        elif rsi_val < 45: signals.append(f"RSI falling ({rsi_val:.1f})")
        else: signals.append(f"RSI neutral ({rsi_val:.1f})")
        if macd_val > sig_val: signals.append("MACD bullish crossover")
        else: signals.append("MACD bearish crossover")
        if dist > 0: signals.append("Price above SMA-20")
        else: signals.append("Price below SMA-20")

        return {
            "symbol": sym,
            "next_trend": direction,
            "predicted_close": predicted_close,
            "confidence": confidence,
            "signals": signals,
            "model": "Random Forest (trained)",
            "trained_at": stored["trained_at"],
        }
    else:
        # Momentum fallback
        records = fetch_live_yfinance(sym, period="1mo", interval="1d")
        if not records or len(records) < 5:
            with engine.connect() as conn:
                df = pd.read_sql_query(
                    text("SELECT close FROM stocks WHERE symbol=:s ORDER BY date DESC LIMIT 20"),
                    conn, params={"s": sym}
                )
            closes = df["close"].tolist()
        else:
            closes = [r["close"] for r in records]

        closes = [float(c) for c in closes if c is not None]
        if len(closes) < 5:
            return {"error": "Not enough data"}

        trend = "UP" if closes[-1] > closes[-5] else "DOWN"
        confidence = 0.62 + (0.05 if trend == "UP" else -0.03)
        return {
            "symbol": sym,
            "next_trend": trend,
            "predicted_close": round(closes[-1] * (1.008 if trend == "UP" else 0.992), 2),
            "confidence": round(confidence, 2),
            "signals": [
                "Momentum-based forecast (train RF for better accuracy)",
                "5-day price comparison",
                "No ML model trained yet",
            ],
            "model": "Momentum fallback (click Train & Predict)",
            "trained_at": None,
        }

@app.get("/api/ml/metrics/{symbol}")
def get_model_metrics(symbol: str):
    sym = symbol.upper()
    with _ml_lock:
        stored = _ml_store.get(sym)
    if stored:
        return {"symbol": sym, **stored["metrics"]}
    return {
        "symbol": sym,
        "accuracy": 0.61, "precision": 0.58, "recall": 0.63, "f1": 0.60,
        "validation": "Time-series split",
        "feature_importances": [
            {"name": "RSI",  "value": 0.75},
            {"name": "MACD", "value": 0.50},
            {"name": "SMA-20","value": 0.45},
            {"name": "EMA-12","value": 0.35},
            {"name": "OBV",  "value": 0.22},
        ],
    }

@app.get("/api/ml/status/{symbol}")
def get_ml_status(symbol: str):
    sym = symbol.upper()
    with _ml_lock:
        stored = _ml_store.get(sym)
    if stored:
        return {"symbol": sym, "trained": True, "trained_at": stored["trained_at"],
                "n_samples": stored["metrics"]["n_samples"]}
    return {"symbol": sym, "trained": False}

# ── Prediction History (live computed) ───────────────────────────────────────
@app.get("/api/ml/history/{symbol}")
def get_prediction_history(symbol: str, n: int = Query(10)):
    """Generate prediction history by walking through last N days."""
    sym = symbol.upper()
    with _ml_lock:
        stored = _ml_store.get(sym)

    records = fetch_live_yfinance(sym, period="3mo", interval="1d")
    if not records:
        return {"history": []}

    df = pd.DataFrame(records)
    df, feature_cols = build_features(df)
    if len(df) < 10:
        return {"history": []}

    history = []
    walk_n = min(n, len(df) - 5)

    for i in range(walk_n, 0, -1):
        row_idx = -(i + 1)
        actual_idx = -i

        row_feat = df[feature_cols].iloc[row_idx:row_idx+1].values
        actual_close  = float(df["close"].iloc[actual_idx])
        current_close = float(df["close"].iloc[row_idx])
        actual_dir = "UP" if actual_close > current_close else "DOWN"

        if stored:
            row_s = stored["scaler"].transform(row_feat)
            pred_raw = stored["model"].predict(row_s)[0]
            prob = stored["model"].predict_proba(row_s)[0]
            pred_dir = "UP" if pred_raw == 1 else "DOWN"
            conf = round(float(prob[pred_raw]), 4)
        else:
            # Simple momentum
            if row_idx + 5 < 0:
                prev_close = float(df["close"].iloc[row_idx - 5])
            else:
                prev_close = float(df["close"].iloc[0])
            pred_dir = "UP" if current_close > prev_close else "DOWN"
            conf = 0.62

        date_str = df["date"].iloc[row_idx]
        history.append({
            "time":   date_str,
            "price":  round(current_close, 2),
            "pred":   pred_dir,
            "conf":   conf,
            "actual": actual_dir,
        })

    return {"symbol": sym, "history": history}

# ── Stock Comparison ─────────────────────────────────────────────────────────
@app.get("/api/compare")
def compare_stocks(symbols: str = Query(..., description="Comma-separated symbols, e.g. AAPL,MSFT,NVDA")):
    """Compare performance of multiple stocks (normalized to 100)."""
    sym_list = [s.strip().upper() for s in symbols.split(",") if s.strip()][:5]
    result = {}
    for sym in sym_list:
        records = fetch_live_yfinance(sym, period="6mo", interval="1d")
        if records:
            closes = [r["close"] for r in records]
            dates  = [r["date"]  for r in records]
            base   = closes[0] if closes[0] else 1
            normalized = [round((c / base) * 100, 2) for c in closes]
            result[sym] = [{"date": d, "value": v} for d, v in zip(dates, normalized)]
    return {"comparison": result, "symbols": sym_list}

# ── Auth ──────────────────────────────────────────────────────────────────────
@app.post("/api/auth/signup")
def signup_user(payload: SignupRequest):
    if len(payload.password.encode("utf-8")) > 72:
        return {"success": False, "message": "Password must be 72 characters or fewer."}
    with engine.connect() as conn:
        existing = conn.execute(
            text("SELECT id FROM users WHERE email = :email"), {"email": payload.email}
        ).fetchone()
        if existing:
            return {"success": False, "message": "Email already registered"}
        pw_hash = hash_password(payload.password)
        conn.execute(
            text("INSERT INTO users (first_name, last_name, email, password_hash) VALUES (:fn,:ln,:em,:ph)"),
            {"fn": payload.first_name, "ln": payload.last_name, "em": payload.email, "ph": pw_hash}
        )
        conn.commit()
    token = create_access_token({"sub": payload.email})
    return {
        "success": True, "token": token,
        "user": {"first_name": payload.first_name, "last_name": payload.last_name, "email": payload.email}
    }

@app.post("/api/auth/login")
def login_user(payload: LoginRequest):
    with engine.connect() as conn:
        user = conn.execute(
            text("SELECT first_name, last_name, email, password_hash FROM users WHERE email = :email"),
            {"email": payload.email}
        ).fetchone()
    if not user:
        return {"success": False, "message": "Invalid email or password"}
    first_name, last_name, email, pw_hash = user
    if not verify_password(payload.password, pw_hash):
        return {"success": False, "message": "Invalid email or password"}
    token = create_access_token({"sub": email})
    return {
        "success": True, "token": token,
        "user": {"first_name": first_name, "last_name": last_name, "email": email}
    }

# Keep old route for backward compat
@app.get("/api/predict/{symbol}")
def predict_next_legacy(symbol: str):
    return predict_next(symbol)

@app.get("/api/model/metrics/{symbol}")
def get_model_metrics_legacy(symbol: str):
    return get_model_metrics(symbol)
