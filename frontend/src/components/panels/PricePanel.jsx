import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
import Card from "../layout/Card";

const API = "http://127.0.0.1:8000";

const TIMEFRAMES = [
  { label: "1H",  period: "5d",  interval: "1h"  },
  { label: "1D",  period: "1mo", interval: "1d"  },
  { label: "1W",  period: "6mo", interval: "1wk" },
  { label: "1M",  period: "1y",  interval: "1mo" },
  { label: "6M",  period: "2y",  interval: "1d"  },
  { label: "ALL", period: "5y",  interval: "1wk" },
];

function calcSMA(data, period) {
  return data.map((d, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((acc, x) => acc + x.close, 0) / period;
    return { time: d.time, value: parseFloat(avg.toFixed(4)) };
  }).filter(Boolean);
}

function calcEMA(data, period) {
  const k = 2 / (period + 1);
  const result = [];
  let ema = null;
  for (const d of data) {
    if (ema === null) { ema = d.close; }
    else { ema = d.close * k + ema * (1 - k); }
    result.push({ time: d.time, value: parseFloat(ema.toFixed(4)) });
  }
  return result.slice(period - 1);
}

export default function PricePanel({ symbol }) {
  const containerRef = useRef(null);
  const chartRef     = useRef(null);
  const [tfIdx, setTfIdx]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [priceInfo, setPriceInfo] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !symbol) return;
    setLoading(true);

    const tf = TIMEFRAMES[tfIdx];

    async function loadChart() {
      try {
        // Fetch OHLCV
        const res  = await fetch(
          `${API}/api/stocks/${symbol}?source=live&period=${tf.period}&interval=${tf.interval}`
        );
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          setLoading(false); return;
        }

        // Format for lightweight-charts
        const candleData = data
          .map((r) => ({
            time:  r.date,
            open:  Number(r.open),
            high:  Number(r.high),
            low:   Number(r.low),
            close: Number(r.close),
          }))
          .filter((d) => d.open && d.high && d.low && d.close)
          .sort((a, b) => (a.time < b.time ? -1 : 1));

        // Set current price info
        const last = candleData[candleData.length - 1];
        const prev = candleData[candleData.length - 2];
        if (last && prev) {
          const chg    = last.close - prev.close;
          const chgPct = ((chg / prev.close) * 100).toFixed(2);
          setPriceInfo({
            price:    last.close.toFixed(2),
            change:   chg.toFixed(2),
            changePct: chgPct,
            up:        chg >= 0,
          });
        }

        // Destroy existing chart
        if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }

        const chart = createChart(containerRef.current, {
          width:  containerRef.current.clientWidth || 600,
          height: 340,
          layout: { background: { color: "transparent" }, textColor: "#94a3b8" },
          grid: {
            vertLines: { color: "rgba(255,255,255,0.05)" },
            horzLines: { color: "rgba(255,255,255,0.05)" },
          },
          rightPriceScale: { borderColor: "rgba(255,255,255,0.1)" },
          timeScale:        { borderColor: "rgba(255,255,255,0.1)", timeVisible: true },
          crosshair: { mode: 1 },
        });
        chartRef.current = chart;

        // Candles
        const candles = chart.addSeries(CandlestickSeries, {
          upColor:      "#10b981",
          downColor:    "#f43f5e",
          borderVisible: false,
          wickUpColor:   "#10b981",
          wickDownColor: "#f43f5e",
        });
        candles.setData(candleData);

        // SMA 20
        const smaData = calcSMA(candleData, 20);
        if (smaData.length) {
          const smaLine = chart.addSeries(LineSeries, {
            color: "#60a5fa", lineWidth: 1.5, lastValueVisible: false, priceLineVisible: false,
          });
          smaLine.setData(smaData);
        }

        // EMA 20
        const emaData = calcEMA(candleData, 20);
        if (emaData.length) {
          const emaLine = chart.addSeries(LineSeries, {
            color: "#facc15", lineWidth: 1.5, lastValueVisible: false, priceLineVisible: false,
          });
          emaLine.setData(emaData);
        }

        chart.timeScale().fitContent();

        // Responsive resize
        const ro = new ResizeObserver(() => {
          if (containerRef.current && chartRef.current) {
            chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
          }
        });
        ro.observe(containerRef.current);

        setLoading(false);
        return () => ro.disconnect();
      } catch (err) {
        console.error("Chart load error:", err);
        setLoading(false);
      }
    }

    const cleanup = loadChart();
    return () => {
      cleanup?.then?.(fn => fn?.());
      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }
    };
  }, [symbol, tfIdx]);

  return (
    <Card title="Stock Price">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {/* Price info */}
        {priceInfo && (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">${priceInfo.price}</span>
            <span className={`text-sm font-medium ${priceInfo.up ? "text-emerald-400" : "text-rose-400"}`}>
              {priceInfo.up ? "▲" : "▼"} {priceInfo.change} ({priceInfo.changePct}%)
            </span>
          </div>
        )}
        {/* Timeframe selector */}
        <div className="flex gap-1">
          {TIMEFRAMES.map((tf, i) => (
            <button
              key={tf.label}
              onClick={() => setTfIdx(i)}
              className={[
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                i === tfIdx
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-white/50 hover:text-white/80 border border-transparent",
              ].join(" ")}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-2 flex gap-4 text-xs text-white/50">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-5 bg-blue-400 rounded" /> SMA-20
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-5 bg-yellow-400 rounded" /> EMA-20
        </span>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/60 z-10">
            <span className="text-xs text-white/50 animate-pulse">Loading chart...</span>
          </div>
        )}
        <div
          ref={containerRef}
          className="h-[340px] w-full rounded-xl border border-white/10 overflow-hidden"
        />
      </div>
    </Card>
  );
}
