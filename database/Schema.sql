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