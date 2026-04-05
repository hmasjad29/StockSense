import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
} from "lightweight-charts";
import Card from "../layout/Card";

const candleData = [
  { time: "2026-04-01", open: 182, high: 186, low: 180, close: 184 },
  { time: "2026-04-02", open: 184, high: 188, low: 183, close: 187 },
  { time: "2026-04-03", open: 187, high: 189, low: 185, close: 186 },
  { time: "2026-04-04", open: 186, high: 191, low: 184, close: 190 },
  { time: "2026-04-05", open: 190, high: 193, low: 188, close: 192 },
];

const smaData = [
  { time: "2026-04-01", value: 183.0 },
  { time: "2026-04-02", value: 184.0 },
  { time: "2026-04-03", value: 185.2 },
  { time: "2026-04-04", value: 186.8 },
  { time: "2026-04-05", value: 187.8 },
];

const emaData = [
  { time: "2026-04-01", value: 183.5 },
  { time: "2026-04-02", value: 185.0 },
  { time: "2026-04-03", value: 185.7 },
  { time: "2026-04-04", value: 188.0 },
  { time: "2026-04-05", value: 189.6 },
];

export default function PricePanel() {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 600,
      height: 360,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.08)" },
        horzLines: { color: "rgba(255,255,255,0.08)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.15)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.15)",
      },
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#f43f5e",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#f43f5e",
    });
    candles.setData(candleData);

    const sma = chart.addSeries(LineSeries, {
      color: "#60a5fa",
      lineWidth: 2,
    });
    sma.setData(smaData);

    const ema = chart.addSeries(LineSeries, {
      color: "#facc15",
      lineWidth: 2,
    });
    ema.setData(emaData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (!chartContainerRef.current) return;
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth || 600,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return (
    <Card title="Stock Price" right="Candles • SMA • EMA">
      <div
        ref={chartContainerRef}
        className="h-[360px] w-full rounded-xl border border-white/10"
      />
    </Card>
  );
}