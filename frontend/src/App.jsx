import { useState } from "react";
import "./index.css";
import TopBar from "./components/layout/TopBar";
import PricePanel from "./components/panels/PricePanel";
import PredictionCard from "./components/panels/PredictionCard";
import { RSIChartCard, MACDChartCard } from "./components/panels/RSIChartCard";
import ModelPerformance from "./components/panels/ModelPerformance";
import FeatureImportance from "./components/panels/FeatureImportance";
import PredictionHistory from "./components/panels/PredictionHistory";
import Footer from "./components/panels/Footer";
import { mock } from "./mock/mockData";

export default function App() {
  const [symbol, setSymbol] = useState("AAPL");
  const [lastUpdated, setLastUpdated] = useState(mock.header.lastUpdated);

  const onRefresh = () => {
    // later: call backend endpoints and update state
    setLastUpdated("Just now");
    setTimeout(() => setLastUpdated("1 min ago"), 1200);
  };

  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 ">
        <TopBar
          symbol={symbol}
          setSymbol={setSymbol}
          lastUpdated={lastUpdated}
          onRefresh={onRefresh}
        />

        {/* Main grid like the mockup */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <PricePanel />
          </div>
          <div className="lg:col-span-4">
            <PredictionCard data={mock.prediction} />
          </div>

          <div className="lg:col-span-6">
            <RSIChartCard />
          </div>
          <div className="lg:col-span-6">
            <MACDChartCard />
          </div>

          <div className="lg:col-span-8">
            <ModelPerformance data={mock.model} />
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
