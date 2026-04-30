"""
load_data.py  –  StockSense Database Seeder
=========================================
Two modes:
  1. XLSX mode (original): reads Stocks_data.xlsx from project root
  2. Live mode: downloads 2 years of data from yfinance for all 20 stocks

Run from the database/ folder:
  python load_data.py          # tries XLSX first, then falls back to yfinance
  python load_data.py --live   # forces yfinance download
"""
import sys, os, sqlite3, time
import pandas as pd

DB_PATH   = os.path.join(os.path.dirname(__file__), "..", "backend", "stock.db")
XLSX_PATH = os.path.join(os.path.dirname(__file__), "..", "Stocks_data.xlsx")

MAJOR_STOCKS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META",
    "NVDA", "AMD",  "INTC",  "TSLA", "JPM",
    "BAC",  "GS",   "WMT",   "COST", "NKE",
    "DIS",  "PEP",  "KO",    "GM",   "F"
]

print("=== StockSense Database Pipeline ===")

def load_from_xlsx():
    if not os.path.exists(XLSX_PATH):
        return None
    print(f"📂 Reading {XLSX_PATH}...")
    try:
        df_raw = pd.read_excel(XLSX_PATH, sheet_name="20_stocks_2018_2025", header=None)
    except Exception as e:
        print(f"❌ Error reading Excel: {e}")
        return None

    ticker_row  = df_raw.iloc[1].fillna("").astype(str).str.strip()
    data_df     = df_raw.iloc[3:].copy().reset_index(drop=True)
    data_df.columns = range(data_df.shape[1])

    known = set(MAJOR_STOCKS)
    tickers, col_groups, current = [], [], None
    for col, val in enumerate(ticker_row):
        if val in known and val != current:
            current = val; tickers.append(val); col_groups.append(col)

    print(f"✅ Detected {len(tickers)} stocks: {tickers}")
    long_dfs = []
    for i, ticker in enumerate(tickers):
        sc = col_groups[i]
        cols = [0, sc, sc+1, sc+2, sc+3, sc+4]
        sdf = data_df[cols].copy()
        sdf.columns = ["date","close","high","low","open","volume"]
        sdf["symbol"] = ticker
        sdf = sdf.dropna(subset=["close"])
        long_dfs.append(sdf)

    df = pd.concat(long_dfs, ignore_index=True)
    if pd.api.types.is_numeric_dtype(df["date"]):
        df["date"] = pd.to_datetime(df["date"], unit="d", origin="1899-12-30")
    else:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])
    df["date"] = df["date"].dt.strftime("%Y-%m-%d")
    df = df[["symbol","date","open","high","low","close","volume"]]
    df = df.sort_values(["symbol","date"]).reset_index(drop=True)
    print(f"✅ Converted: {len(df):,} rows")
    return df

def load_from_yfinance():
    try:
        import yfinance as yf
    except ImportError:
        print("❌ yfinance not installed. Run: pip install yfinance")
        return None

    print("🌐 Downloading 2 years of data from yfinance...")
    long_dfs = []
    for i, sym in enumerate(MAJOR_STOCKS):
        try:
            ticker = yf.Ticker(sym)
            hist   = ticker.history(period="2y", interval="1d", auto_adjust=True)
            if hist.empty:
                print(f"  ⚠️  No data for {sym}")
                continue
            df = hist.reset_index()
            df = df.rename(columns={"Date":"date","Open":"open","High":"high",
                                     "Low":"low","Close":"close","Volume":"volume"})
            df["date"]   = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
            df["symbol"] = sym
            df = df[["symbol","date","open","high","low","close","volume"]]
            long_dfs.append(df)
            print(f"  ✅ {sym}: {len(df)} rows  ({i+1}/{len(MAJOR_STOCKS)})")
            time.sleep(0.3)
        except Exception as e:
            print(f"  ❌ {sym}: {e}")

    if not long_dfs:
        return None
    df = pd.concat(long_dfs, ignore_index=True)
    df = df.sort_values(["symbol","date"]).reset_index(drop=True)
    print(f"✅ Total: {len(df):,} rows downloaded")
    return df

def save_to_db(df):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    print(f"💾 Saving to {DB_PATH}...")
    df.to_sql("stocks", conn, if_exists="replace", index=False)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_sym_date ON stocks(symbol, date)")
    conn.commit()
    stats = pd.read_sql_query(
        "SELECT symbol, COUNT(*) rows, MIN(date) from_date, MAX(date) to_date FROM stocks GROUP BY symbol",
        conn
    )
    conn.close()
    print("\n📊 Database summary:")
    print(stats.to_string(index=False))
    print(f"\n✅ SUCCESS! DB ready at {DB_PATH}")

if __name__ == "__main__":
    force_live = "--live" in sys.argv
    df = None

    if not force_live:
        df = load_from_xlsx()
        if df is None:
            print("ℹ️  No XLSX found, falling back to yfinance download...")

    if df is None:
        df = load_from_yfinance()

    if df is not None:
        save_to_db(df)
    else:
        print("❌ Could not load data from any source. Check your setup.")