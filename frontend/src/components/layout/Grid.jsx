export default function Grid({ children, cols = 12, gap = 4, className = "" }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-${cols} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}
