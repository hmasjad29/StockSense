import { RefreshCw, ChevronDown } from "lucide-react";

export default function TopBar({
  symbol,
  setSymbol,
  stocks = [],
  lastUpdated,
  onRefresh,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Stock Sense Trend Prediction Dashboard
        </h1>
        <p className="text-sm text-white/60">
          Analytics dashboard (UP/DOWN prediction)
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="appearance-none rounded-xl bg-white/10 border border-white/10 text-white px-4 py-2 pr-10 text-sm"
          >
            {stocks.length > 0 ? (
              stocks.map((stock) => (
                <option key={stock} value={stock} className="bg-slate-900">
                  {stock}
                </option>
              ))
            ) : (
              <option value="" className="bg-slate-900">
                Loading...
              </option>
            )}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-white/60" />
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>

        <div className="text-xs text-white/60">
          Last updated: {lastUpdated}
        </div>
      </div>
    </div>
  );
}