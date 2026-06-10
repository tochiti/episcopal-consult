import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/* Editorial page header for admin pages — eyebrow + title + copy + actions. */
export default function AdminPageHeader({ eyebrow, title, accent, copy, tags = [], actions = [] }) {
  return (
    <header className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-heading mt-2 text-[2.25rem] leading-[0.95] text-[var(--text-bright)] sm:text-[3.25rem] lg:text-[3.75rem]">
            {title}
            {accent ? <> <span className="display-accent">{accent}</span></> : null}
          </h1>
          {copy ? (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-[15px]">
              {copy}
            </p>
          ) : null}
          {tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          ) : null}
        </div>
        {actions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {actions.map((a) => (
              <ActionButton key={a.label} {...a} />
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function ActionButton({ to, onClick, label, icon: Icon, kind = 'primary' }) {
  const cls = kind === 'primary' ? 'primary-button' : 'secondary-button';
  const inner = (
    <>
      {label}
      {Icon ? <Icon className="h-4 w-4" /> : null}
    </>
  );
  if (to) {
    return <Link to={to} className={cls}>{inner}</Link>;
  }
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

/* Small panel header used inside admin cards. */
export function PanelHeader({ label, title, action }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="eyebrow">{label}</p>
        <h2 className="display-heading mt-1.5 text-xl text-[var(--text-bright)]">{title}.</h2>
      </div>
      {action || null}
    </div>
  );
}
