import Card from "../layout/Card";

export default function PricePanel() {
  return (
    <Card title="Stock Price" right="SMA • EMA">
      <div className="h-[360px] rounded-xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 flex items-center justify-center">
        <div className="text-white/60 text-sm">
          Candlestick chart placeholder 
        </div>
      </div>

      <div className="mt-3 text-xs text-white/50">
        {/* Tip: Add toggles for SMA/EMA overlays on the chart. */}
      </div>
    </Card>
  );
}
