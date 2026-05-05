import { useEffect, useState } from "react";
import Card from "../layout/Card";

const API = "http://127.0.0.1:8000";

export default function PredictionHistory({ symbol, fallbackRows }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    async function fetch_() {
      try {
        const res  = await fetch(`${API}/api/ml/history/${symbol}?n=10`);
        const data = await res.json();
        if (data.history?.length) {
          setRows(data.history);
        } else {
          setRows(fallbackRows ?? []);
        }
      } catch {
        setRows(fallbackRows ?? []);
      } finally { setLoading(false); }
    }
    fetch_();
  }, [symbol]);

  const displayRows = rows.length ? rows : (fallbackRows ?? []);

  return (
    <Card title="Prediction History" right="Last 10">
      {loading ? (
        <div className="py-8 text-center text-xs text-white/40 animate-pulse">Loading history…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/50 text-xs uppercase tracking-wide">
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-4">Date / Time</th>
                <th className="text-left py-2 pr-4">Price</th>
                <th className="text-left py-2 pr-4">Prediction</th>
                <th className="text-left py-2 pr-4">Confidence</th>
                <th className="text-left py-2 pr-4">Actual</th>
                <th className="text-left py-2">Result</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {displayRows.map((r, idx) => {
                const correct = r.pred === r.actual;
                const predUp  = r.pred === "UP";
                const actUp   = r.actual === "UP";
                return (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2.5 pr-4 text-white/50 text-xs">{r.time}</td>
                    <td className="py-2.5 pr-4 font-medium">${typeof r.price === "number" ? r.price.toFixed(2) : r.price}</td>
                    <td className="py-2.5 pr-4">
                      <span className={[
                        "px-2.5 py-1 rounded-lg text-xs font-semibold border",
                        predUp
                          ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
                          : "text-rose-300 border-rose-400/30 bg-rose-400/10",
                      ].join(" ")}>
                        {predUp ? "▲" : "▼"} {r.pred}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-white/60">
                      {typeof r.conf === "number" ? `${Math.round(r.conf * 100)}%` : r.conf}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={actUp ? "text-emerald-400" : "text-rose-400"}>
                        {actUp ? "▲" : "▼"} {r.actual}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={correct ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                        {correct ? "✓" : "✗"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
