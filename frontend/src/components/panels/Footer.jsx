export default function Footer() {
  return (
    <div className="mt-8 border-t border-white/5 pt-4 pb-6 flex flex-wrap gap-6 text-xs text-white/30">
      <span>Data Source: Yahoo Finance (yfinance)</span>
      <span>ML Model: Random Forest Classifier</span>
      <span>Update Frequency: On Refresh / Train</span>
      <span className="ml-auto">StockSense v2.0</span>
    </div>
  );
}
