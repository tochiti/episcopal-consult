export default function InsightCard({ icon: Icon, label, value, accent, note }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_-24px_rgba(26,31,44,0.35)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          {note ? <p className="mt-2 text-sm text-slate-500">{note}</p> : null}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
