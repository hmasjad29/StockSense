import { useEffect, useState, useRef } from "react";

const SYMBOLS = ["AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSLA","JPM","AMD","INTC"];
const API = "http://127.0.0.1:8000";

export default function StockTicker() {
  const [prices,   setPrices]   = useState({});
  const intervalRef = useRef(null);

  async function fetchPrices() {
    for (const sym of SYMBOLS) {
      try {
        const res  = await fetch(`${API}/api/stocks/price/${sym}`);
        const data = await res.json();
        if (data.price != null) {
          setPrices(prev => ({ ...prev, [sym]: data }));
        }
      } catch {}
      await new Promise(r => setTimeout(r, 100));
    }
  }

  useEffect(() => {
    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const items = SYMBOLS.map(s => ({ sym: s, ...(prices[s] ?? {}) }));

  return (
    <div className="overflow-hidden border-b border-white/5 bg-slate-950/80 py-2">
      <div className="flex animate-[marquee_40s_linear_infinite] gap-10 whitespace-nowrap"
           style={{ animation: "marquee 50s linear infinite" }}>
        {[...items, ...items].map((it, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-xs">
            <span className="font-semibold text-white/70">{it.sym}</span>
            {it.price != null ? (
              <>
                <span className="text-white/90">${it.price.toFixed(2)}</span>
                <span className={it.change >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {it.change >= 0 ? "▲" : "▼"} {Math.abs(it.changePct ?? 0).toFixed(2)}%
                </span>
              </>
            ) : (
              <span className="text-white/30">—</span>
            )}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
