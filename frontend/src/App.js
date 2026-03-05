import React, { useState, useEffect } from "react";

function App() {
  const [selectedIndicator, setSelectedIndicator] = useState("rsi");
  const [indicatorResult, setIndicatorResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Function to fetch indicator data from backend
  const loadIndicatorData = async (type) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`http://localhost:8000/indicator/${type}`);
      
      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      setIndicatorResult(data);
    } catch (error) {
      setErrorMsg("Unable to fetch indicator data.");
      setIndicatorResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Run whenever dropdown changes
  useEffect(() => {
    loadIndicatorData(selectedIndicator);
  }, [selectedIndicator]);

  return (
    <div style={{ padding: "30px", fontFamily: "Segoe UI" }}>
      <h1>StockSense Dashboard</h1>

      {/* Indicator Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>Select Indicator:</label>
        <select
          value={selectedIndicator}
          onChange={(e) => setSelectedIndicator(e.target.value)}
        >
          <option value="rsi">RSI</option>
          <option value="macd">MACD</option>
          <option value="custom">Custom Indicator</option>
        </select>
      </div>

      {/* Chart Section */}
      <div
        style={{
          height: "280px",
          border: "1px solid #ccc",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa"
        }}
      >
        📈 Chart area (to be implemented in next sprint)
      </div>

      {/* Indicator Output */}
      {loading && <p>Loading indicator...</p>}

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      {indicatorResult && !loading && (
        <div style={{ marginBottom: "20px" }}>
          <h3>{indicatorResult.indicator}</h3>
          <p>Current Value: {indicatorResult.value}</p>
        </div>
      )}

      {/* Prediction Section */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f0f0f0",
          borderRadius: "5px"
        }}
      >
        <h2>Prediction</h2>
        <p>Trend: 🟢 UP</p>
        <p>Confidence: 72%</p>
      </div>
    </div>
  );
}

export default App;