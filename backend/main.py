from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import pandas as pd
from typing import Optional

app = FastAPI(title="StockSense API", version="1.0.0")

# CORS for React (Vite default port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///stock.db"
engine = create_engine(DATABASE_URL, echo=False)

@app.on_event("startup")
async def startup_event():
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM stocks")).scalar()
        print(f"✅ StockSense API started | {count} rows in DB")

@app.get("/")
def home():
    return {"status": "StockSense backend is running 🚀"}

# Get all unique symbols
@app.get("/api/stocks/symbols")
def get_symbols():
    with engine.connect() as conn:
        symbols = [row[0] for row in conn.execute(text("SELECT DISTINCT symbol FROM stocks")).fetchall()]
    return {"symbols": symbols}

# Get OHLCV data for a symbol (used by charts)
@app.get("/api/stocks/{symbol}")
def get_stock_data(
    symbol: str,
    limit: int = Query(365, description="Number of days")
):
    query = text("SELECT date, open, high, low, close, volume FROM stocks WHERE symbol = :symbol ORDER BY date DESC LIMIT :limit")
    with engine.connect() as conn:
        df = pd.read_sql_query(query, conn, params={"symbol": symbol.upper(), "limit": limit})
    df = df.sort_values("date")  # ascending for charts
    return df.to_dict(orient="records")

# Technical indicators (real calculation with pandas_ta)
@app.get("/api/indicator/{symbol}/{indicator}")
def get_indicator(symbol: str, indicator: str):
    # Fetch last 100 days for calculation
    query = text("SELECT date, open, high, low, close, volume FROM stocks WHERE symbol = :symbol ORDER BY date DESC LIMIT 100")
    with engine.connect() as conn:
        df = pd.read_sql_query(query, conn, params={"symbol": symbol.upper()})
    if df.empty:
        return {"error": "No data"}

    import pandas_ta as ta
    df = df.sort_index(ascending=False)  # for ta
    if indicator.lower() == "rsi":
        df["rsi"] = ta.rsi(df["close"], length=14)
        value = float(df["rsi"].iloc[0])
    elif indicator.lower() == "macd":
        macd = ta.macd(df["close"])
        value = float(macd["MACD_12_26_9"].iloc[0])
    else:
        value = 0.0

    return {"symbol": symbol, "indicator": indicator.upper(), "value": round(value, 2)}

# Next-candle prediction (simple + extensible for your RandomForest later)
@app.get("/api/predict/{symbol}")
def predict_next(symbol: str):
    # Fetch recent data
    with engine.connect() as conn:
        df = pd.read_sql_query(
            text("SELECT close FROM stocks WHERE symbol = :symbol ORDER BY date DESC LIMIT 20"),
            conn, params={"symbol": symbol.upper()}
        )
    if len(df) < 5:
        return {"error": "Not enough data"}

    # Simple momentum prediction (replace with your full RF + ICT/FVG later)
    last_close = float(df["close"].iloc[0])
    trend = "UP" if df["close"].iloc[0] > df["close"].iloc[4] else "DOWN"
    confidence = 0.72 + (0.05 if trend == "UP" else -0.03)  # placeholder

    return {
        "symbol": symbol,
        "next_trend": trend,
        "predicted_close": round(last_close * (1.012 if trend == "UP" else 0.988), 2),
        "confidence": round(confidence, 2),
        "note": "Replace with full ML model (RandomForest + ICT/FVG) in final demo"
    }

# Run with: uvicorn main:app --reload --port 8000