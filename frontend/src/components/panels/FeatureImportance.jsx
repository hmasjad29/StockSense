import Card from "../layout/Card";

export default function FeatureImportance({ items }) {
  return (
    <Card title="Feature Importance">
      <div className="space-y-3">
        <div className="text-sm text-white/60">
          Top features influencing prediction
        </div>

        {items.map((it) => (
          <div key={it.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-white/80">
              <span>{it.name}</span>
              <span className="text-white/60">
                {Math.round(it.value * 100)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400/70"
                style={{ width: `${Math.round(it.value * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
