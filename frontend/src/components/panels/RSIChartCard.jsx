import { useEffect, useState } from "react";
import Card from "../layout/Card";
import { LineChart, Line, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from "recharts";

const API = "http://127.0.0.1:8000";

export default function RSIChartCard({ symbol }) {
  const [rsiData, setRsiData] = useState([]);
  const [latest,  setLatest]  = useState(null);

  useEffect(() => {
    if (!symbol) return;
    async function fetch_() {
      try {
        const res  = await fetch(`${API}/api/indicator/${symbol}/rsi?period=6mo&interval=1d`);
        const data = await res.json();
        if (data.series) {
          setRsiData(data.series.slice(-90)); // last 90 days
          setLatest(data.latest);
        }
      } catch (e) { console.error("RSI fetch:", e); }
    }
    fetch_();
  }, [symbol]);

  const latestRSI = latest ?? (rsiData.length ? rsiData[rsiData.length-1]?.value : null);
  const rsiColor  = latestRSI >= 70 ? "#f43f5e" : latestRSI <= 30 ? "#10b981" : "#60a5fa";

  return (
    <Card title="RSI Indicator" right={latestRSI ? `${latestRSI.toFixed(1)}` : "—"}>
      <div className="mb-2 flex gap-4 text-xs text-white/40">
        <span><span className="text-rose-400">─ ─</span> Overbought (70)</span>
        <span><span className="text-emerald-400">─ ─</span> Oversold (30)</span>
        <span style={{ color: rsiColor }}>■ Current: {latestRSI?.toFixed(1) ?? "—"}</span>
      </div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rsiData}>
            <XAxis dataKey="date" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              labelStyle={{ color: "#94a3b8", fontSize: 11 }}
              itemStyle={{ color: "#60a5fa", fontSize: 11 }}
            />
            <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="4 4" strokeOpacity={0.6} />
            <ReferenceLine y={30} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.6} />
            <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
