import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200/80 pt-6 pb-10 text-sm text-slate-500">
      <div className="shell-container flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>Episcopal Consult DNDN</p>
        <div className="flex items-center gap-5">
          <Link to="/dashboard" className="ghost-link">Check status</Link>
          <Link to="/login" className="ghost-link">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
