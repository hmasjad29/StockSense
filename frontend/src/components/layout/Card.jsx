export default function Card({ title, right, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      {(title || right) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-sm font-semibold tracking-wide text-white/80 uppercase">
              {title}
            </h2>
          )}
          {right && (
            <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-xs text-white/50">
              {right}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
