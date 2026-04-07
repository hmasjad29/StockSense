CREATE TABLE IF NOT EXISTS Stocks_data (
    id INT PRIMARY KEY,
    date DATE,
    currency_pair VARCHAR(10),
    open FLOAT,
    high FLOAT,
    low FLOAT,
    close FLOAT,
    volume FLOAT
);

CREATE INDEX idx_currency_date ON Stocks_data(currency_pair, date);
CREATE TABLE IF NOT EXISTS stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    date TEXT NOT NULL,
    open REAL,
    high REAL,
    low REAL,
    close REAL,
    volume INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_symbol_date 
ON stocks (symbol, date);
