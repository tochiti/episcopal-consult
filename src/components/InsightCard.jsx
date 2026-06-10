export default function InsightCard({ icon: Icon, label, value, accent, note }) {
  return (
    <div className="surface-glass p-4 transition hover:border-[var(--line-strong)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{label}</p>
          <p className="stat-numeral mt-2.5 text-3xl sm:text-4xl lg:text-5xl">{value}</p>
          {note ? <p className="mt-1.5 text-[11px] text-[var(--muted)] sm:text-xs">{note}</p> : null}
        </div>
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
