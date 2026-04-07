import pandas as pd
import sqlite3
import os
from datetime import datetime

# Paths (relative to database/ folder)
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "stock.db")
XLSX_PATH = os.path.join(os.path.dirname(__file__), "..", "Stocks_data.xlsx")

def convert_wide_to_long():
    if not os.path.exists(XLSX_PATH):
        print(f"❌ Stocks_data.xlsx not found at {XLSX_PATH}")
        print("   Put the xlsx file in the root folder (next to backend/ and database/)")
        return None

    print("📂 Reading Stocks_data.xlsx (wide format)...")
    df_raw = pd.read_excel(XLSX_PATH, sheet_name="20_stocks_2018_2025", header=None)

    # Ticker row is row index 1
    ticker_row = df_raw.iloc[1].fillna('').astype(str).str.strip()

    # Data starts at row index 3
    data_df = df_raw.iloc[3:].copy().reset_index(drop=True)
    data_df.columns = range(data_df.shape[1])   # numeric columns

    # Detect ticker start columns dynamically
    tickers = []
    col_groups = []
    current = None
    known_tickers = {'AAPL','MSFT','GOOGL','AMZN','META','NVDA','AMD','INTC','TSLA',
                     'GM','F','JPM','BAC','GS','WMT','COST','NKE','DIS','PEP','KO'}

    for col in range(len(ticker_row)):
        val = ticker_row[col]
        if val in known_tickers and val != current:
            current = val
            tickers.append(val)
            col_groups.append(col)   # start of Close column for this stock

    print(f"✅ Detected {len(tickers)} stocks: {tickers}")

    # Convert each stock block to long format
    long_dfs = []
    for i, ticker in enumerate(tickers):
        start_col = col_groups[i]
        cols = [0, start_col, start_col+1, start_col+2, start_col+3, start_col+4]  # date + Close,High,Low,Open,Volume
        stock_df = data_df[cols].copy()
        stock_df.columns = ['date', 'close', 'high', 'low', 'open', 'volume']
        stock_df['symbol'] = ticker

        # Drop rows with no data for this stock
        stock_df = stock_df.dropna(subset=['close'])
        long_dfs.append(stock_df)

    # Combine all
    long_df = pd.concat(long_dfs, ignore_index=True)

    # Convert Excel serial date → proper datetime
    if pd.api.types.is_numeric_dtype(long_df['date']):
     long_df['date'] = pd.to_datetime(long_df['date'], unit='d', origin='1899-12-30')
    else:
     long_df['date'] = pd.to_datetime(long_df['date'], errors='coerce')
     
    # long_df['date'] = pd.to_datetime(long_df['date'], unit='d', origin='1899-12-30', errors='coerce')
    long_df = long_df.dropna(subset=['date'])
    long_df['date'] = long_df['date'].dt.strftime('%Y-%m-%d')

    # Final column order
    long_df = long_df[['symbol', 'date', 'open', 'high', 'low', 'close', 'volume']]
    long_df = long_df.sort_values(['symbol', 'date']).reset_index(drop=True)

    print(f"✅ Converted to long format: {len(long_df):,} rows")
    return long_df

def load_data():
    long_df = convert_wide_to_long()
    if long_df is None:
        return

    conn = sqlite3.connect(DB_PATH)
    long_df.to_sql("stocks", conn, if_exists="replace", index=False)
    conn.close()

    # Quick verification
    conn = sqlite3.connect(DB_PATH)
    stats = pd.read_sql_query("SELECT symbol, COUNT(*) as rows, MIN(date) as from_date, MAX(date) as to_date FROM stocks GROUP BY symbol", conn)
    conn.close()
    print("\n📊 Database summary:")
    print(stats.to_string(index=False))
    print(f"\n✅ SUCCESS! Database ready at {DB_PATH}")

if __name__ == "__main__":
    load_data()