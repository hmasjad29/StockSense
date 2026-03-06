import pandas as pd
import os

# Get path to CSV in the same folder as this script
file_path = os.path.join(os.path.dirname(__file__), "Stocks_data.csv")

# Function to load stock/forex data
def load_Stocks_data():
    df = pd.read_csv(file_path)
    print("Dataset loaded successfully!")
    return df


# === Script entry point ===
if __name__ == "__main__":
    data = load_Stocks_data()
    
