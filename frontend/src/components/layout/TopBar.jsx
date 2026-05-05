import { RefreshCw } from "lucide-react";

export default function TopBar({ symbol, setSymbol, stocks, lastUpdated, onRefresh }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/50">Stock:</span>
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-white outline-none cursor-pointer hover:bg-white/15 transition-colors"
        >
          {stocks.map((s) => (
            <option key={s} value={s} className="bg-slate-900 text-white">
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-white/40">
          Last updated: <span className="text-white/60">{lastUpdated}</span>
        </span>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>
    </div>
  );
}
