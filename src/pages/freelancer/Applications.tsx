import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useStore } from '../../lib/store';
import { StatusBadge, Empty, btnPrimary } from '../../components/ui';
import { money, timeAgo } from '../../lib/utils';

export default function Applications() {
  const { db, user } = useStore();
  if (!user) return null;
  const apps = db.applications.filter(a => a.freelancerId === user.id).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 font-display text-3xl font-bold text-white">My Applications</h1>
      <p className="mb-8 text-sm text-muted">Track the status of every proposal you’ve sent.</p>
      {apps.length === 0 ? (
        <Empty icon={<FileText size={32} />} title="No applications yet" sub="Browse open projects and send your first proposal."
          action={<Link to="/browse" className={btnPrimary}>Browse Projects</Link>} />
      ) : (
        <div className="space-y-4">
          {apps.map(a => {
            const p = db.projects.find(x => x.id === a.projectId);
            if (!p) return null;
            return (
              <div key={a.id} className="card-hover rounded-2xl border border-lined bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link to={`/projects/${p.id}`} className="font-display text-lg font-bold text-white transition hover:text-violet2">{p.title}</Link>
                    <p className="mt-0.5 text-xs text-muted">Applied {timeAgo(a.createdAt)} · your bid: <span className="text-cyan2">{money(a.expectedBudget)}</span> · {a.estimatedTime}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-3 rounded-xl border border-lined bg-surface p-4 text-sm leading-relaxed text-silver/80">{a.proposal}</p>
                {a.status === 'accepted' && (
                  <Link to="/messages" className="mt-3 inline-block text-sm font-medium text-success hover:underline">→ Chat with the client</Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
