export default function Skeleton({ rows = 3 }) {
  return (
    <div className="panel animate-pulse space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  );
}
