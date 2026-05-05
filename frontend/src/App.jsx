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
import ComparePanel from "./components/panels/ComparePanel";
import StockTicker from "./components/panels/StockTicker";
import Footer from "./components/panels/Footer";
import { mock } from "./mock/mockData";
import { useAuth } from "./auth/AuthContext";

const API = "http://127.0.0.1:8000";

export default function App() {
  const { user, logout } = useAuth();

  const [stocks,      setStocks]      = useState([]);
  const [symbol,      setSymbol]      = useState("");
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [prediction,  setPrediction]  = useState(null);
  const [modelMetrics,setModelMetrics]= useState(null);
  const [featureImp,  setFeatureImp]  = useState(mock.featureImportance);
  const [mlStatus,    setMlStatus]    = useState(null);
  const [training,    setTraining]    = useState(false);
  const [toast,       setToast]       = useState(null);

  // ── Fetch symbol list ────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchSymbols() {
      try {
        const res  = await fetch(`${API}/api/stocks/symbols`);
        const data = await res.json();
        const syms = data.symbols || [];
        setStocks(syms);
        if (syms.length > 0) setSymbol(syms[0]);
      } catch {
        setStocks(["AAPL","MSFT","GOOGL","AMZN","META","NVDA","AMD","INTC","TSLA","JPM",
                   "BAC","GS","WMT","COST","NKE","DIS","PEP","KO","GM","F"]);
        setSymbol("AAPL");
      }
    }
    fetchSymbols();
  }, []);

  // ── Fetch prediction + metrics when symbol changes ───────────────────────
  useEffect(() => {
    if (!symbol) return;
    fetchPrediction();
    fetchMetrics();
    fetchMlStatus();
  }, [symbol]);

  async function fetchPrediction() {
    try {
      const res  = await fetch(`${API}/api/ml/predict/${symbol}`);
      const data = await res.json();
      setPrediction({
        direction:  data.next_trend,
        confidence: data.confidence,
        price:      data.predicted_close,
        time:       new Date().toLocaleTimeString(),
        signals:    data.signals || [],
        model:      data.model,
      });
    } catch {
      setPrediction(mock.prediction);
    }
  }

  async function fetchMetrics() {
    try {
      const res  = await fetch(`${API}/api/ml/metrics/${symbol}`);
      const data = await res.json();
      setModelMetrics(data);
      if (data.feature_importances?.length) {
        setFeatureImp(data.feature_importances);
      }
    } catch {
      setModelMetrics(mock.model);
    }
  }

  async function fetchMlStatus() {
    try {
      const res  = await fetch(`${API}/api/ml/status/${symbol}`);
      const data = await res.json();
      setMlStatus(data);
    } catch {}
  }

  // ── Train & Predict ──────────────────────────────────────────────────────
  async function handleTrainAndPredict() {
    if (!symbol || training) return;
    setTraining(true);
    showToast("⏳ Training Random Forest on 2y of data…", "info");
    try {
      const res  = await fetch(`${API}/api/ml/train/${symbol}`, { method: "POST" });
      const data = await res.json();
      if (data.metrics) {
        setModelMetrics({ ...data.metrics, feature_importances: data.feature_importances });
        if (data.feature_importances?.length) setFeatureImp(data.feature_importances);
      }
      // Re-fetch prediction with trained model
      await fetchPrediction();
      await fetchMlStatus();
      showToast(`✅ ${symbol} model trained! Acc: ${Math.round((data.metrics?.accuracy ?? 0) * 100)}%`, "success");
    } catch (e) {
      showToast("❌ Training failed. Is backend running?", "error");
      console.error("Train error:", e);
    } finally {
      setTraining(false);
    }
  }

  // ── Refresh ──────────────────────────────────────────────────────────────
  async function onRefresh() {
    setLastUpdated("Refreshing…");
    await Promise.all([fetchPrediction(), fetchMetrics(), fetchMlStatus()]);
    setLastUpdated("Just now");
    setTimeout(() => setLastUpdated("1 min ago"), 60000);
  }

  // ── Toast ────────────────────────────────────────────────────────────────
  function showToast(msg, type = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  const toastColors = {
    info:    "bg-slate-800 border-white/10 text-white/80",
    success: "bg-emerald-900/80 border-emerald-500/30 text-emerald-300",
    error:   "bg-rose-900/80 border-rose-500/30 text-rose-300",
  };

  return (
    <div className="bg-slate-950 min-h-screen">
      {/* Live ticker */}
      <StockTicker />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl border px-5 py-3 text-sm shadow-xl backdrop-blur transition-all ${toastColors[toast.type]}`}>
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header row */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Smart Stock Trend Prediction Dashboard
            </h1>
            <p className="text-xs text-white/40 mt-0.5">
              Welcome,{" "}
              <span className="text-white/70 font-medium">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}
              </span>
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>

        {/* TopBar */}
        <TopBar
          symbol={symbol}
          setSymbol={setSymbol}
          stocks={stocks}
          lastUpdated={lastUpdated}
          onRefresh={onRefresh}
        />

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Price Chart */}
          <div className="lg:col-span-8">
            <PricePanel symbol={symbol} />
          </div>

          {/* Prediction */}
          <div className="lg:col-span-4">
            <PredictionCard
              data={prediction || mock.prediction}
              mlStatus={mlStatus}
              onTrain={handleTrainAndPredict}
              training={training}
            />
          </div>

          {/* RSI */}
          <div className="lg:col-span-6">
            <RSIChartCard symbol={symbol} />
          </div>

          {/* MACD */}
          <div className="lg:col-span-6">
            <MACDChartCard symbol={symbol} />
          </div>

          {/* Model Performance */}
          <div className="lg:col-span-8">
            <ModelPerformance data={modelMetrics || mock.model} />
          </div>

          {/* Feature Importance */}
          <div className="lg:col-span-4">
            <FeatureImportance items={featureImp} />
          </div>

          {/* Comparison */}
          <div className="lg:col-span-12">
            <ComparePanel />
          </div>

          {/* Prediction History */}
          <div className="lg:col-span-12">
            <PredictionHistory symbol={symbol} fallbackRows={mock.history} />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
