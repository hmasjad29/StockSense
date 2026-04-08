from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import pandas as pd

app = FastAPI(title="StockSense API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///stock.db"
engine = create_engine(DATABASE_URL, echo=False)


def compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def compute_macd(series: pd.Series) -> pd.DataFrame:
    ema12 = series.ewm(span=12, adjust=False).mean()
    ema26 = series.ewm(span=26, adjust=False).mean()
    macd = ema12 - ema26
    signal = macd.ewm(span=9, adjust=False).mean()
    hist = macd - signal

    return pd.DataFrame({
        "macd": macd,
        "signal": signal,
        "hist": hist,
    })


@app.on_event("startup")
async def startup_event():
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM stocks")).scalar()
        print(f"✅ StockSense API started | {count} rows in DB")


@app.get("/")
def home():
    return {"status": "StockSense backend is running 🚀"}


@app.get("/api/stocks/symbols")
def get_symbols():
    with engine.connect() as conn:
        symbols = [
            row[0]
            for row in conn.execute(
                text("SELECT DISTINCT symbol FROM stocks ORDER BY symbol")
            ).fetchall()
        ]
    return {"symbols": symbols}

@app.get("/api/stocks/{symbol}")
def get_stock_data(symbol: str, limit: int = Query(365, description="Number of days")):
    query = text(
        "SELECT date, open, high, low, close, volume "
        "FROM stocks WHERE symbol = :symbol "
        "ORDER BY date DESC LIMIT :limit"
    )
    with engine.connect() as conn:
        df = pd.read_sql_query(query, conn, params={"symbol": symbol.upper(), "limit": limit})

    df = df.sort_values("date")
    return df.to_dict(orient="records")

@app.get("/api/indicator/{symbol}/{indicator}")
def get_indicator(symbol: str, indicator: str):
    query = text(
        "SELECT date, open, high, low, close, volume "
        "FROM stocks WHERE symbol = :symbol "
        "ORDER BY date DESC LIMIT 120"
    )

    with engine.connect() as conn:
        df = pd.read_sql_query(query, conn, params={"symbol": symbol.upper()})

    if df.empty:
        return {"error": "No data"}

    df = df.sort_values("date").copy()
    df["close"] = pd.to_numeric(df["close"], errors="coerce")
    df = df.dropna(subset=["close"])

    if len(df) < 30:
        return {"error": "Not enough data to compute indicators"}

    if indicator.lower() == "rsi":
        df["indicator_value"] = compute_rsi(df["close"], period=14)
        df = df.dropna(subset=["indicator_value"])

        series = [
            {"date": row["date"], "value": round(float(row["indicator_value"]), 2)}
            for _, row in df.iterrows()
        ]

        return {
            "symbol": symbol.upper(),
            "indicator": "RSI",
            "latest": series[-1]["value"] if series else None,
            "series": series,
        }

    elif indicator.lower() == "macd":
        macd_df = compute_macd(df["close"])
        df["macd"] = macd_df["macd"]
        df["signal"] = macd_df["signal"]
        df["hist"] = macd_df["hist"]
        df = df.dropna(subset=["macd", "signal"])

        series = [
            {
                "date": row["date"],
                "macd": round(float(row["macd"]), 2),
                "signal": round(float(row["signal"]), 2),
                "hist": round(float(row["hist"]), 2),
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


@app.get("/api/predict/{symbol}")
def predict_next(symbol: str):
    with engine.connect() as conn:
        df = pd.read_sql_query(
            text("SELECT close FROM stocks WHERE symbol = :symbol ORDER BY date DESC LIMIT 20"),
            conn,
            params={"symbol": symbol.upper()},
        )

    if len(df) < 5:
        return {"error": "Not enough data"}

    last_close = float(df["close"].iloc[0])
    trend = "UP" if df["close"].iloc[0] > df["close"].iloc[4] else "DOWN"
    confidence = 0.72 + (0.05 if trend == "UP" else -0.03)

    return {
        "symbol": symbol.upper(),
        "next_trend": trend,
        "predicted_close": round(last_close * (1.012 if trend == "UP" else 0.988), 2),
        "confidence": round(confidence, 2),
        "note": "Replace with full ML model (RandomForest + ICT/FVG) in final demo"
    }

@app.get("/api/model/metrics/{symbol}")
def get_model_metrics(symbol: str):
    # Placeholder metrics for now
    # Later replace with real model evaluation results
    return {
        "symbol": symbol.upper(),
        "accuracy": 0.61,
        "precision": 0.58,
        "recall": 0.63,
        "f1": 0.60,
        "validation": "Time-series split"
    }











# from fastapi import FastAPI, Query
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy import create_engine, text
# import pandas as pd
# from typing import Optional

# app = FastAPI(title="StockSense API", version="1.0.0")

# # CORS for React (Vite default port)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# DATABASE_URL = "sqlite:///stock.db"
# engine = create_engine(DATABASE_URL, echo=False)

# @app.on_event("startup")
# async def startup_event():
#     with engine.connect() as conn:
#         count = conn.execute(text("SELECT COUNT(*) FROM stocks")).scalar()
#         print(f"✅ StockSense API started | {count} rows in DB")

# @app.get("/")
# def home():
#     return {"status": "StockSense backend is running 🚀"}

# # Get all unique symbols
# @app.get("/api/stocks/symbols")
# def get_symbols():
#     with engine.connect() as conn:
#         symbols = [row[0] for row in conn.execute(text("SELECT DISTINCT symbol FROM stocks")).fetchall()]
#     return {"symbols": symbols}

# # Get OHLCV data for a symbol (used by charts)
# @app.get("/api/stocks/{symbol}")
# def get_stock_data(
#     symbol: str,
#     limit: int = Query(365, description="Number of days")
# ):
#     query = text("SELECT date, open, high, low, close, volume FROM stocks WHERE symbol = :symbol ORDER BY date DESC LIMIT :limit")
#     with engine.connect() as conn:
#         df = pd.read_sql_query(query, conn, params={"symbol": symbol.upper(), "limit": limit})
#     df = df.sort_values("date")  # ascending for charts
#     return df.to_dict(orient="records")

# # Technical indicators (real calculation with pandas_ta)
# @app.get("/api/indicator/{symbol}/{indicator}")
# def get_indicator(symbol: str, indicator: str):
#     # Fetch last 100 days for calculation
#     query = text("SELECT date, open, high, low, close, volume FROM stocks WHERE symbol = :symbol ORDER BY date DESC LIMIT 100")
#     with engine.connect() as conn:
#         df = pd.read_sql_query(query, conn, params={"symbol": symbol.upper()})
#     if df.empty:
#         return {"error": "No data"}

#     import pandas_ta as ta
#     df = df.sort_index(ascending=False)  # for ta
#     if indicator.lower() == "rsi":
#         df["rsi"] = ta.rsi(df["close"], length=14)
#         value = float(df["rsi"].iloc[0])
#     elif indicator.lower() == "macd":
#         macd = ta.macd(df["close"])
#         value = float(macd["MACD_12_26_9"].iloc[0])
#     else:
#         value = 0.0

#     return {"symbol": symbol, "indicator": indicator.upper(), "value": round(value, 2)}

# # Next-candle prediction (simple + extensible for your RandomForest later)
# @app.get("/api/predict/{symbol}")
# def predict_next(symbol: str):
#     # Fetch recent data
#     with engine.connect() as conn:
#         df = pd.read_sql_query(
#             text("SELECT close FROM stocks WHERE symbol = :symbol ORDER BY date DESC LIMIT 20"),
#             conn, params={"symbol": symbol.upper()}
#         )
#     if len(df) < 5:
#         return {"error": "Not enough data"}

#     # Simple momentum prediction (replace with your full RF + ICT/FVG later)
#     last_close = float(df["close"].iloc[0])
#     trend = "UP" if df["close"].iloc[0] > df["close"].iloc[4] else "DOWN"
#     confidence = 0.72 + (0.05 if trend == "UP" else -0.03)  # placeholder

#     return {
#         "symbol": symbol,
#         "next_trend": trend,
#         "predicted_close": round(last_close * (1.012 if trend == "UP" else 0.988), 2),
#         "confidence": round(confidence, 2),
#         "note": "Replace with full ML model (RandomForest + ICT/FVG) in final demo"
#     }



# # Run with: uvicorn main:app --reload --port 8000