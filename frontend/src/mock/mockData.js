export const mock = {
  header: { lastUpdated: "2 min ago" },
  prediction: {
    direction: "UP",
    confidence: 0.64,
    price: 189.42,
    time: "12:35 PM",
    signals: ["RSI rising", "MACD bullish crossover", "Price above EMA"],
  },
  model: {
    accuracy: 0.61,
    precision: 0.58,
    recall: 0.63,
    f1: 0.6,
    validation: "Time-series split",
  },
  featureImportance: [
    { name: "RSI", value: 0.75 },
    { name: "MACD", value: 0.5 },
    { name: "SMA", value: 0.45 },
    { name: "EMA", value: 0.35 },
    { name: "OBV", value: 0.22 },
  ],
  history: [
    { time: "12:30 PM", price: 188.52, pred: "UP", conf: 0.64, actual: "UP" },
    {
      time: "12:35 PM",
      price: 188.93,
      pred: "DOWN",
      conf: 0.57,
      actual: "DOWN",
    },
    { time: "12:39 PM", price: 188.79, pred: "UP", conf: 0.68, actual: "DOWN" },
    {
      time: "12:29 PM",
      price: 188.61,
      pred: "DOWN",
      conf: 0.57,
      actual: "DOWN",
    },
    { time: "12:15 PM", price: 188.29, pred: "UP", conf: 0.64, actual: "UP" },
  ],
};
