export default function StatsCard({ title, value, icon }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow border">
      <div className="text-4xl">{icon}</div>
      <p className="text-slate-500 text-sm mt-1">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
