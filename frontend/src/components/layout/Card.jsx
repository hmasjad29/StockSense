export default function Card({ title, right, children, className = "" }) {
  return (
    <section
      className={[
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur",
        "shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
        className,
      ].join(" ")}
    >
      {(title || right) && (
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white/90">{title}</h2>
          <div className="text-xs text-white/60">{right}</div>
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
