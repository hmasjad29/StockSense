from fastapi import FastAPI
from flask import jsonify
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, MetaData, Table, Column
from sqlalchemy import Integer, String, Float, text


# Initialize FastAPI app
app = FastAPI()

# Allow frontend (React) to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Database Setup
# -------------------------

DATABASE_URL = "sqlite:///stock.db"
engine = create_engine(DATABASE_URL)
metadata = MetaData()

# Stocks table definition
stocks_table = Table(
    "stocks",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("symbol", String(10)),
    Column("price", Float),
    Column("trend", String(10))
)

# Create table if it doesn't already exist
metadata.create_all(engine)


# -------------------------
# Helper Function
# -------------------------

def get_connection():
    return engine.connect()


# -------------------------
# Routes
# -------------------------

@app.get("/")
def home():
    return {"status": "StockSense backend is running"}


@app.get("/indicator/{indicator_type}")
def fetch_indicator(indicator_type: str):

    indicator_type = indicator_type.lower()

    # Dummy values for Sprint 1
    indicators = {
        "rsi": {"name": "RSI", "value": 62.4},
        "macd": {"name": "MACD", "value": 1.25},
        "custom": {"name": "Custom Trend Strength", "value": 0.78},
    }

    if indicator_type in indicators:
        return {
            "indicator": indicators[indicator_type]["name"],
            "value": indicators[indicator_type]["value"]
        }

    return {"error": "Indicator not supported"}


@app.post("/add-sample")
def insert_sample_data():

    with get_connection() as conn:
        insert_query = text(
            "INSERT INTO stocks (symbol, price, trend) VALUES (:symbol, :price, :trend)"
        )

        conn.execute(
            insert_query,
            {"symbol": "AAPL", "price": 185.23, "trend": "UP"}
        )

        conn.commit()

    return {"message": "Sample data inserted successfully"}

    ## Sample prediction function
def predict_forex():
    return {"prediction": 1.25}

@app.route("/predict", methods=["GET"])
def get_prediction():
    return jsonify(predict_forex())

# Endpoint to get the most recent prediction
@app.route("/latest", methods=["GET"])
def latest_prediction():
    prediction_history=[]
    if prediction_history:
        return jsonify(prediction_history[-1])
    else:
        return jsonify({"message": "No predictions yet"})