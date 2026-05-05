# StockSense v2.0 — Smart Stock Trend Prediction Platform

> Dark-theme dashboard with live yfinance data, candlestick charts, RSI/MACD indicators,
> Random Forest ML prediction with Train & Predict button, stock comparison, and live ticker.

---

## 📁 Project Structure

```
StockSense/
├── backend/
│   ├── main.py              ← FastAPI app (all API routes + ML engine)
│   └── requirements.txt     ← Python dependencies
├── database/
│   ├── load_data.py         ← DB seeder (XLSX or yfinance download)
│   └── Schema.sql           ← SQLite schema reference
└── frontend/
    ├── src/
    │   ├── App.jsx           ← Main dashboard
    │   ├── auth/             ← Login context + protected routes
    │   ├── components/
    │   │   ├── layout/       ← Card, Grid, TopBar
    │   │   └── panels/       ← PricePanel, RSI, MACD, Prediction, Compare…
    │   ├── mock/mockData.js  ← Fallback mock data
    │   └── pages/            ← Login, Signup pages
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Prerequisites

Make sure you have installed:

| Tool    | Version | Install |
|---------|---------|---------|
| Python  | 3.9+    | python.org |
| Node.js | 18+     | nodejs.org |
| pip     | latest  | comes with Python |
| npm     | latest  | comes with Node.js |

---

## 🚀 Step-by-Step Execution

### STEP 1 — Clone / Extract the project

If you downloaded the zip, extract it. If cloning:
```bash
git clone https://github.com/hmasjad29/StockSense.git
cd StockSense
```

---

### STEP 2 — Set up the Python backend

#### 2a. Create a virtual environment (recommended)

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate
```

#### 2b. Install Python dependencies

```bash
pip install -r requirements.txt
```

This installs: `fastapi`, `uvicorn`, `sqlalchemy`, `pandas`, `yfinance`,
`scikit-learn`, `numpy`, `pydantic[email]`, `passlib[bcrypt]`, `python-jose`.

---

### STEP 3 — Load the database

**Option A — If you have `Stocks_data.xlsx`** (place it in the project root):
```bash
cd database
python load_data.py
```

**Option B — Download live from Yahoo Finance** (no xlsx needed):
```bash
cd database
python load_data.py --live
```

This downloads 2 years of daily OHLCV data for all 20 stocks and saves to
`backend/stock.db`. Takes ~30-60 seconds with internet.

> ⚠️  The database is **optional** — the backend always tries yfinance live data first.
> If yfinance is available, the app works even without running load_data.py.

---

### STEP 4 — Start the backend server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
✅ StockSense API v2.0 started | XXXX rows in DB
```

Test it: open http://127.0.0.1:8000 in your browser → should show `{"status":"StockSense backend v2.0 is running 🚀"}`

API docs: http://127.0.0.1:8000/docs (FastAPI auto-generated Swagger UI)

---

### STEP 5 — Set up and start the frontend

Open a **new terminal** (keep the backend running):

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

### STEP 6 — Use the app

1. **Sign Up** — Create an account on the signup page
2. **Login** — Sign in with your credentials
3. **Dashboard** — You'll see:
   - 📈 Live candlestick chart with timeframe selector (1H / 1D / 1W / 1M / 6M / ALL)
   - 📊 RSI and MACD charts from live yfinance data
   - 🧠 Prediction card showing UP/DOWN trend
   - 📉 Model Performance metrics
   - 🔀 Stock Comparison panel (pick up to 5 stocks, normalized to 100)
   - 📋 Prediction History table
   - 💹 Live price ticker at the top
4. **Train & Predict** — Click "🧠 Train & Predict" button in the Prediction card
   - Trains a Random Forest on 2 years of data
   - Shows real accuracy/precision/recall/F1 metrics
   - Updates feature importance chart
   - Predicts next-day direction with confidence score

---

## 🔌 Key API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/stocks/symbols` | List of 20 stock symbols |
| `GET /api/stocks/{symbol}?period=1y&interval=1d` | OHLCV data (live from yfinance) |
| `GET /api/stocks/price/{symbol}` | Live current price |
| `GET /api/indicator/{symbol}/rsi` | RSI series |
| `GET /api/indicator/{symbol}/macd` | MACD series |
| `POST /api/ml/train/{symbol}` | Train Random Forest model |
| `GET /api/ml/predict/{symbol}` | Get ML prediction |
| `GET /api/ml/metrics/{symbol}` | Model accuracy metrics |
| `GET /api/ml/history/{symbol}` | Prediction history |
| `GET /api/compare?symbols=AAPL,MSFT,NVDA` | Normalized comparison |
| `POST /api/auth/signup` | Create account |
| `POST /api/auth/login` | Login |

---

## 🤖 ML Model Details

- **Algorithm**: Random Forest Classifier (scikit-learn)
- **Features** (14 total): RSI, MACD, MACD Signal, MACD Histogram, SMA-10, SMA-20, EMA-12, EMA-26, 1d/3d/5d Returns, 10-day Volatility, Distance from SMA-20, OBV
- **Training Data**: 2 years of daily OHLCV from yfinance
- **Validation**: 5-fold Time-Series Cross-Validation (no data leakage)
- **Hyperparameters**: 200 estimators, max_depth=8, class_weight=balanced
- **Target**: Next-day close UP (1) or DOWN (0)

---

## 🔧 Troubleshooting

**Backend won't start:**
- Make sure you're in the `backend/` folder and your venv is activated
- Check Python version: `python --version` (needs 3.9+)

**Frontend can't connect to backend:**
- Confirm backend is running on port 8000
- Check browser console for CORS errors
- The `vite.config.js` proxies `/api` → `http://127.0.0.1:8000`

**yfinance rate limit:**
- Yahoo Finance occasionally throttles requests
- Wait a minute and try again, or use the DB fallback

**"Not enough data" from ML training:**
- The stock needs at least 60 rows of data
- Run `python load_data.py --live` to populate the DB

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS |
| Charts | lightweight-charts (candlestick) + Recharts (RSI/MACD/Compare) |
| Backend | FastAPI + Uvicorn |
| Database | SQLite via SQLAlchemy |
| Live Data | yfinance (Yahoo Finance) |
| ML | scikit-learn (Random Forest, StandardScaler, TimeSeriesSplit) |
| Auth | JWT (python-jose) + bcrypt (passlib) |
