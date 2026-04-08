import { useEffect, useState } from "react";
import "./index.css";
import TopBar from "./components/layout/TopBar";
import PricePanel from "./components/panels/PricePanel";
import PredictionCard from "./components/panels/PredictionCard";
import RSIChartCard from "./components/panels/RSIChartCard";
import MACDChartCard from "./components/panels/MACDChartCard";
import ModelPerformance from "./components/panels/ModelPerformance";
import FeatureImportance from "./components/panels/FeatureImportance";
import PredictionHistory from "./components/panels/PredictionHistory";
import Footer from "./components/panels/Footer";
import { mock } from "./mock/mockData";

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [prediction, setPrediction] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);

  useEffect(() => {
    async function fetchSymbols() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/stocks/symbols");
        const data = await res.json();

        setStocks(data.symbols || []);

        if (data.symbols?.length > 0) {
          setSymbol(data.symbols[0]);
        }
      } catch (error) {
        console.error("Failed to fetch symbols:", error);
      }
    }

    fetchSymbols();
  }, []);

  useEffect(() => {
    async function fetchPrediction() {
      if (!symbol) return;

      try {
        const res = await fetch(`http://127.0.0.1:8000/api/predict/${symbol}`);
        const data = await res.json();

        setPrediction({
          direction: data.next_trend,
          confidence: data.confidence,
          price: data.predicted_close,
          time: new Date().toLocaleTimeString(),
          signals: [
            "Momentum-based forecast",
            "Backend prediction engine",
            "Current market trend signal",
          ],
        });

        setLastUpdated("Just now");
      } catch (error) {
        console.error("Failed to fetch prediction:", error);
      }
    }

    fetchPrediction();
  }, [symbol]);

  useEffect(() => {
    async function fetchModelMetrics() {
      if (!symbol) return;

      try {
        const res = await fetch(`http://127.0.0.1:8000/api/model/metrics/${symbol}`);
        const data = await res.json();
        setModelMetrics(data);
      } catch (error) {
        console.error("Failed to fetch model metrics:", error);
      }
    }

    fetchModelMetrics();
  }, [symbol]);

  const onRefresh = async () => {
    if (!symbol) return;

    try {
      const [predictionRes, metricsRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/predict/${symbol}`),
        fetch(`http://127.0.0.1:8000/api/model/metrics/${symbol}`),
      ]);

      const predictionData = await predictionRes.json();
      const metricsData = await metricsRes.json();

      setPrediction({
        direction: predictionData.next_trend,
        confidence: predictionData.confidence,
        price: predictionData.predicted_close,
        time: new Date().toLocaleTimeString(),
        signals: [
          "Momentum-based forecast",
          "Backend prediction engine",
          "Current market trend signal",
        ],
      });

      setModelMetrics(metricsData);

      setLastUpdated("Just now");
      setTimeout(() => setLastUpdated("1 min ago"), 1200);
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <TopBar
          symbol={symbol}
          setSymbol={setSymbol}
          stocks={stocks}
          lastUpdated={lastUpdated}
          onRefresh={onRefresh}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <PricePanel symbol={symbol} />
          </div>

          <div className="lg:col-span-4">
            <PredictionCard data={prediction || mock.prediction} />
          </div>

          <div className="lg:col-span-6">
            <RSIChartCard symbol={symbol} />
          </div>

          <div className="lg:col-span-6">
            <MACDChartCard symbol={symbol} />
          </div>

          <div className="lg:col-span-8">
            <ModelPerformance data={modelMetrics || mock.model} />
          </div>

          <div className="lg:col-span-4">
            <FeatureImportance items={mock.featureImportance} />
          </div>

          <div className="lg:col-span-12">
            <PredictionHistory rows={mock.history} />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}











// import { useState } from "react";
// import "./index.css";
// import TopBar from "./components/layout/TopBar";
// import PricePanel from "./components/panels/PricePanel";
// import PredictionCard from "./components/panels/PredictionCard";
// import RSIChartCard from "./components/panels/RSIChartCard";
// import MACDChartCard from "./components/panels/MACDChartCard";
// import ModelPerformance from "./components/panels/ModelPerformance";
// import FeatureImportance from "./components/panels/FeatureImportance";
// import PredictionHistory from "./components/panels/PredictionHistory";
// import Footer from "./components/panels/Footer";
// import { mock } from "./mock/mockData";

// export default function App() {
//   const [symbol, setSymbol] = useState("AAPL");
//   const [lastUpdated, setLastUpdated] = useState(mock.header.lastUpdated);

//   const onRefresh = () => {
//     // later: call backend endpoints and update state
//     setLastUpdated("Just now");
//     setTimeout(() => setLastUpdated("1 min ago"), 1200);
//   };

//   return (
//     <div className="bg-slate-950 min-h-screen">
//       <div className="mx-auto max-w-6xl px-4 py-6 ">
//         <TopBar
//           symbol={symbol}
//           setSymbol={setSymbol}
//           lastUpdated={lastUpdated}
//           onRefresh={onRefresh}
//         />

//         {/* Main grid like the mockup */}
//         <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
//           <div className="lg:col-span-8">
//             <PricePanel />
//           </div>
//           <div className="lg:col-span-4">
//             <PredictionCard data={mock.prediction} />
//           </div>

//           <div className="lg:col-span-6">
//             <RSIChartCard />
//           </div>
//           <div className="lg:col-span-6">
//             <MACDChartCard />
//           </div>

//           <div className="lg:col-span-8">
//             <ModelPerformance data={mock.model} />
//           </div>
//           <div className="lg:col-span-4">
//             <FeatureImportance items={mock.featureImportance} />
//           </div>

//           <div className="lg:col-span-12">
//             <PredictionHistory rows={mock.history} />
//           </div>
//         </div>

//         <Footer />
//       </div>
//     </div>
//   );
// }
