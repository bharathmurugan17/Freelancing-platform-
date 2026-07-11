import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Users, Eye, MessageSquare } from 'lucide-react';
import { useStore } from '../../lib/store';
import { avgRating, money, timeAgo } from '../../lib/utils';
import { Rating, StatusBadge, Empty, SkillTag } from '../../components/ui';

export default function Applicants() {
  const { id } = useParams();
  const { db, decideApplication } = useStore();
  const navigate = useNavigate();
  const project = db.projects.find(p => p.id === id);

  if (!project) return <div className="px-4 py-20 text-center text-muted">Project not found.</div>;

  const apps = db.applications.filter(a => a.projectId === project.id).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-white"><ArrowLeft size={15} /> Back</button>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Applicants</h1>
        <p className="mt-1 text-sm text-muted">for “<Link to={`/projects/${project.id}`} className="text-violet2 hover:underline">{project.title}</Link>” · {apps.length} proposal{apps.length !== 1 && 's'}</p>
      </div>

      {apps.length === 0 ? (
        <Empty icon={<Users size={32} />} title="No applications yet" sub="Freelancers who apply to this project will appear here for review." />
      ) : (
        <div className="space-y-5">
          {apps.map((a, i) => {
            const freelancer = db.users.find(u => u.id === a.freelancerId);
            const profile = db.profiles.find(p => p.userId === a.freelancerId);
            if (!freelancer || !profile) return null;
            const rating = avgRating(profile.reviews);
            const done = profile.completedProjects.length;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * .06, .3) }}
                className="rounded-2xl border border-lined bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={freelancer.avatar} alt={freelancer.name} className="h-14 w-14 rounded-2xl border border-lined object-cover" />
                    <div>
                      <Link to={`/freelancers/${freelancer.id}`} className="font-display text-lg font-bold text-white transition hover:text-violet2">{freelancer.name}</Link>
                      <p className="text-xs text-muted">{profile.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Rating value={rating} size={12} />
                        <span className="text-[11px] text-muted">{rating.toFixed(1)} · {done} completed project{done !== 1 && 's'}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <div className="mt-4 grid gap-3 rounded-xl border border-lined bg-surface p-4 sm:grid-cols-3">
                  <div><p className="text-[11px] uppercase tracking-wider text-muted">Bid</p><p className="font-display text-lg font-bold text-cyan2">{money(a.expectedBudget)}{project.type === 'hourly' && <span className="text-xs text-muted">/hr</span>}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wider text-muted">Timeline</p><p className="font-semibold text-white">{a.estimatedTime}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wider text-muted">Applied</p><p className="font-semibold text-white">{timeAgo(a.createdAt)}</p></div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-silver/85">{a.proposal}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {profile.skills.slice(0, 6).map(s => <SkillTag key={s} skill={s} />)}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-lined pt-5">
                  <Link to={`/freelancers/${freelancer.id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-lined bg-surface px-4 py-2 text-sm font-medium text-silver transition hover:border-violet/40 hover:text-white">
                    <Eye size={14} /> View Full Profile
                  </Link>
                  {a.status === 'pending' && (
                    <>
                      <button onClick={() => decideApplication(a.id, 'accepted')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet to-cyan px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet/25 transition hover:brightness-110">
                        <Check size={14} /> Accept & Hire
                      </button>
                      <button onClick={() => decideApplication(a.id, 'rejected')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/20">
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}
                  {a.status === 'accepted' && (
                    <Link to="/messages" className="inline-flex items-center gap-1.5 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm font-medium text-success transition hover:bg-success/20">
                      <MessageSquare size={14} /> Open Chat
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
