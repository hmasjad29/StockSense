import { useEffect, useState } from "react";
import Card from "../layout/Card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const API    = "http://127.0.0.1:8000";
const COLORS = ["#60a5fa", "#34d399", "#facc15", "#f87171", "#a78bfa"];
const ALL_SYM = ["AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSLA","JPM","AMD","KO"];

export default function ComparePanel() {
  const [selected, setSelected] = useState(["AAPL", "MSFT", "NVDA"]);
  const [data,     setData]     = useState({});
  const [loading,  setLoading]  = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!selected.length) return;
    setLoading(true);
    async function fetch_() {
      try {
        const res = await fetch(`${API}/api/compare?symbols=${selected.join(",")}`);
        const d   = await res.json();
        setData(d.comparison ?? {});
      } catch (e) { console.error("Compare fetch:", e); }
      finally { setLoading(false); }
    }
    fetch_();
  }, [selected.join(",")]);

  // Merge all symbol series into one array by date
  useEffect(() => {
    if (!Object.keys(data).length) return;
    const dateMap = {};
    for (const [sym, series] of Object.entries(data)) {
      for (const pt of series) {
        if (!dateMap[pt.date]) dateMap[pt.date] = { date: pt.date };
        dateMap[pt.date][sym] = pt.value;
      }
    }
    const merged = Object.values(dateMap).sort((a, b) => a.date < b.date ? -1 : 1);
    setChartData(merged);
  }, [data]);

  function toggleSym(sym) {
    setSelected(prev =>
      prev.includes(sym)
        ? prev.filter(s => s !== sym)
        : prev.length < 5 ? [...prev, sym] : prev
    );
  }

  return (
    <Card title="Stock Comparison (Normalized to 100)">
      {/* Symbol selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {ALL_SYM.map((sym, i) => {
          const idx = selected.indexOf(sym);
          const active = idx >= 0;
          return (
            <button
              key={sym}
              onClick={() => toggleSym(sym)}
              className={[
                "rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors",
                active
                  ? `border-transparent text-white`
                  : "border-white/10 text-white/40 hover:text-white/70",
              ].join(" ")}
              style={active ? { backgroundColor: COLORS[idx] + "33", borderColor: COLORS[idx] + "66", color: COLORS[idx] } : {}}
            >
              {sym}
            </button>
          );
        })}
        <span className="self-center text-xs text-white/30">Pick up to 5</span>
      </div>

      {loading ? (
        <div className="h-[200px] flex items-center justify-center text-xs text-white/40 animate-pulse">
          Loading comparison…
        </div>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis domain={["auto", "auto"]} hide />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                labelStyle={{ color: "#94a3b8", fontSize: 11 }}
                itemStyle={{ fontSize: 11 }}
                formatter={(v) => `${v?.toFixed(1)}`}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
                iconType="line"
              />
              {selected.map((sym, i) => (
                <Line
                  key={sym}
                  type="monotone"
                  dataKey={sym}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
