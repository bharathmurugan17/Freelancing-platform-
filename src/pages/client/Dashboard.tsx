import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Users, CheckCircle2, PlusCircle, Pencil, Trash2, UserCheck, FolderOpen, Star } from 'lucide-react';
import { useStore } from '../../lib/store';
import { StatCard, StatusBadge, Empty, btnPrimary, Modal, btnDanger, btnGhost, Field, inputCls } from '../../components/ui';
import { money, timeAgo } from '../../lib/utils';

export default function ClientDashboard() {
  const { db, user, deleteProject, completeProject, addReview } = useStore();
  const [delId, setDelId] = useState<string | null>(null);
  const [reviewFor, setReviewFor] = useState<{ freelancerId: string; name: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  if (!user) return null;
  const myProjects = db.projects.filter(p => p.clientId === user.id).sort((a, b) => b.createdAt - a.createdAt);
  const active = myProjects.filter(p => p.status === 'in_progress');
  const completed = myProjects.filter(p => p.status === 'completed');
  const applicantsTotal = db.applications.filter(a => myProjects.some(p => p.id === a.projectId)).length;
  const selectedFreelancers = new Set(myProjects.flatMap(p => p.selectedFreelancerIds)).size;

  const submitReview = () => {
    if (reviewFor && reviewText.trim()) {
      addReview(reviewFor.freelancerId, rating, reviewText.trim());
      setReviewFor(null);
      setReviewText('');
      setRating(5);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-muted">{user.company ? `${user.company} · ` : ''}Manage your projects and hires.</p>
        </div>
        <Link to="/client/post" className={btnPrimary}><PlusCircle size={15} /> Post New Project</Link>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Posted" value={myProjects.length} icon={<FolderOpen size={18} />} />
        <StatCard label="Active" value={active.length} icon={<Briefcase size={18} />} accent="cyan" />
        <StatCard label="Applicants" value={applicantsTotal} icon={<Users size={18} />} />
        <StatCard label="Hired" value={selectedFreelancers} icon={<UserCheck size={18} />} accent="cyan" />
        <StatCard label="Completed" value={completed.length} icon={<CheckCircle2 size={18} />} />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold text-white">Your Projects</h2>
        {myProjects.length === 0 ? (
          <Empty icon={<Briefcase size={32} />} title="No projects yet" sub="Post your first project to start receiving proposals from talented freelancers."
            action={<Link to="/client/post" className={btnPrimary}><PlusCircle size={15} /> Post a Project</Link>} />
        ) : (
          <div className="space-y-4">
            {myProjects.map(p => {
              const apps = db.applications.filter(a => a.projectId === p.id);
              const hired = p.selectedFreelancerIds.map(fid => db.users.find(u => u.id === fid)).filter(Boolean);
              return (
                <div key={p.id} className="card-hover rounded-2xl border border-lined bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <StatusBadge status={p.status} />
                        <span className="text-xs text-muted">Posted {timeAgo(p.createdAt)}</span>
                      </div>
                      <Link to={`/projects/${p.id}`} className="font-display text-lg font-bold text-white transition hover:text-violet2">{p.title}</Link>
                      <p className="mt-0.5 text-xs text-muted">{money(p.budget)}{p.type === 'hourly' && '/hr'} · {p.category} · due {p.deadline}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/client/projects/${p.id}/applicants`} className="inline-flex items-center gap-1.5 rounded-xl border border-violet/35 bg-violet/10 px-3.5 py-2 text-sm font-medium text-violet2 transition hover:bg-violet/20">
                        <Users size={14} /> {apps.length} Applicant{apps.length !== 1 && 's'}
                      </Link>
                      {p.status !== 'completed' && (
                        <Link to={`/client/projects/${p.id}/edit`} className={btnGhost + ' !px-3.5 !py-2'}><Pencil size={14} /></Link>
                      )}
                      {p.status === 'in_progress' && (
                        <button onClick={() => completeProject(p.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-success/35 bg-success/10 px-3.5 py-2 text-sm font-medium text-success transition hover:bg-success/20">
                          <CheckCircle2 size={14} /> Mark Complete
                        </button>
                      )}
                      <button onClick={() => setDelId(p.id)} className={btnDanger + ' !px-3.5 !py-2'}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {hired.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-lined pt-4">
                      <span className="text-xs uppercase tracking-wider text-muted">Hired:</span>
                      {hired.map(h => (
                        <div key={h!.id} className="flex items-center gap-2">
                          <Link to={`/freelancers/${h!.id}`} className="flex items-center gap-2 rounded-lg border border-lined bg-surface px-2.5 py-1.5 text-xs text-silver transition hover:border-violet/40">
                            <img src={h!.avatar} alt="" className="h-5 w-5 rounded-md" /> {h!.name}
                          </Link>
                          {p.status === 'completed' && (
                            <button onClick={() => setReviewFor({ freelancerId: h!.id, name: h!.name })}
                              className="inline-flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 text-xs text-amber-300 transition hover:bg-amber-400/20">
                              <Star size={12} /> Rate
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete project?">
        <p className="text-sm text-muted">This will permanently remove the project and all its applications. This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setDelId(null)} className={btnGhost}>Cancel</button>
          <button onClick={() => { if (delId) deleteProject(delId); setDelId(null); }} className={btnDanger}><Trash2 size={14} /> Delete</button>
        </div>
      </Modal>

      <Modal open={!!reviewFor} onClose={() => setReviewFor(null)} title={`Rate ${reviewFor?.name ?? ''}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRating(n)} className="transition hover:scale-110">
                <Star size={30} className={n <= rating ? 'text-amber-400' : 'text-white/15'} fill="currentColor" strokeWidth={0} />
              </button>
            ))}
          </div>
          <Field label="Review">
            <textarea className={inputCls + ' min-h-24'} value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="How was working with this freelancer?" />
          </Field>
          <button onClick={submitReview} className={btnPrimary + ' w-full'} disabled={!reviewText.trim()}><Star size={15} /> Submit Review</button>
        </div>
      </Modal>
    </div>
  );
}
