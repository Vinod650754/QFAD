export default function StatCard({ label, value, accent = "bg-mint" }) {
  return (
    <div className="panel">
      <div className={`mb-4 h-2 w-14 rounded-full ${accent}`} />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}
