-- StockSense Database Schema

CREATE TABLE IF NOT EXISTS stocks (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol  TEXT    NOT NULL,
    date    TEXT    NOT NULL,
    open    REAL,
    high    REAL,
    low     REAL,
    close   REAL,
    volume  INTEGER
);

CREATE INDEX IF NOT EXISTS idx_stocks_symbol_date ON stocks (symbol, date);

CREATE TABLE IF NOT EXISTS users (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name          TEXT NOT NULL,
    last_name           TEXT NOT NULL,
    email               TEXT UNIQUE NOT NULL,
    password_hash       TEXT NOT NULL,
    reset_token         TEXT,
    reset_token_expiry  TEXT
);