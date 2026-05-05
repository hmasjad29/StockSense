import { useEffect, useState } from "react";
import Card from "../layout/Card";
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const API = "http://127.0.0.1:8000";

export default function MACDChartCard({ symbol }) {
  const [macdData, setMacdData] = useState([]);
  const [latest,   setLatest]   = useState(null);

  useEffect(() => {
    if (!symbol) return;
    async function fetch_() {
      try {
        const res  = await fetch(`${API}/api/indicator/${symbol}/macd?period=6mo&interval=1d`);
        const data = await res.json();
        if (data.series) {
          setMacdData(data.series.slice(-90));
          setLatest(data.latest);
        }
      } catch (e) { console.error("MACD fetch:", e); }
    }
    fetch_();
  }, [symbol]);

  return (
    <Card title="MACD Indicator" right={latest != null ? latest.toFixed(4) : "—"}>
      <div className="mb-2 flex gap-4 text-xs text-white/40">
        <span><span className="text-emerald-400">—</span> MACD Line</span>
        <span><span className="text-yellow-400">—</span> Signal Line</span>
        <span><span className="text-white/40">▌</span> Histogram</span>
      </div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={macdData}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              labelStyle={{ color: "#94a3b8", fontSize: 11 }}
              itemStyle={{ fontSize: 11 }}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
            <Bar
              dataKey="hist"
              fill="rgba(255,255,255,0.15)"
              radius={[2, 2, 0, 0]}
            />
            <Line type="monotone" dataKey="macd"   stroke="#34d399" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="signal" stroke="#facc15" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
