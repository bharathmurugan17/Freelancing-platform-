import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, FileText, CheckCircle2, Bookmark, DollarSign, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store';
import { StatCard, StatusBadge, Empty, btnPrimary } from '../../components/ui';
import { money, timeAgo } from '../../lib/utils';

export default function FreelancerDashboard() {
  const { db, user, getProfile } = useStore();
  if (!user) return null;
  const profile = getProfile(user.id);
  const myApps = db.applications.filter(a => a.freelancerId === user.id);
  const activeProjects = db.projects.filter(p => p.selectedFreelancerIds.includes(user.id) && p.status === 'in_progress');
  const completedProjects = db.projects.filter(p => p.selectedFreelancerIds.includes(user.id) && p.status === 'completed');
  const pending = myApps.filter(a => a.status === 'pending');
  const accepted = myApps.filter(a => a.status === 'accepted');
  const savedCount = db.saved.filter(s => s.userId === user.id).length;
  const earnings = completedProjects.reduce((s, p) => s + p.budget, 0) + activeProjects.reduce((s, p) => s + p.budget, 0);

  const profileComplete = profile && profile.title && profile.bio && profile.skills.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Hey, {user.name.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-sm text-muted">Here’s what’s happening with your freelance work.</p>
        </div>
        <Link to="/browse" className={btnPrimary}>Browse Projects <ArrowRight size={15} /></Link>
      </motion.div>

      {!profileComplete && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet/30 bg-violet/10 p-5">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-violet2" />
            <div>
              <p className="font-semibold text-white">Complete your profile to stand out</p>
              <p className="text-xs text-muted">Add your title, bio, and skills so clients can find you.</p>
            </div>
          </div>
          <Link to="/freelancer/profile" className="rounded-xl border border-violet/40 bg-violet/15 px-4 py-2 text-sm font-medium text-violet2 transition hover:bg-violet/25">Edit Profile</Link>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Active Projects" value={activeProjects.length} icon={<Briefcase size={18} />} />
        <StatCard label="Pending Apps" value={pending.length} icon={<FileText size={18} />} accent="cyan" />
        <StatCard label="Accepted" value={accepted.length} icon={<CheckCircle2 size={18} />} />
        <StatCard label="Saved Jobs" value={savedCount} icon={<Bookmark size={18} />} accent="cyan" />
        <StatCard label="Earnings" value={money(earnings)} icon={<DollarSign size={18} />} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Active Projects</h2>
            <Link to="/messages" className="text-sm text-cyan2 hover:underline">Go to messages</Link>
          </div>
          {activeProjects.length === 0 && completedProjects.length === 0 ? (
            <Empty icon={<Briefcase size={30} />} title="No active projects" sub="Apply to projects to start working." action={<Link to="/browse" className={btnPrimary}>Find work</Link>} />
          ) : (
            <div className="space-y-3">
              {[...activeProjects, ...completedProjects].map(p => (
                <Link key={p.id} to={`/projects/${p.id}`} className="card-hover flex items-center justify-between gap-3 rounded-2xl border border-lined bg-card p-4">
                  <div>
                    <p className="font-semibold text-white">{p.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{money(p.budget)}{p.type === 'hourly' && '/hr'} · due {p.deadline}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Recent Applications</h2>
            <Link to="/freelancer/applications" className="text-sm text-cyan2 hover:underline">View all</Link>
          </div>
          {myApps.length === 0 ? (
            <Empty icon={<FileText size={30} />} title="No applications yet" sub="Your submitted proposals will appear here." />
          ) : (
            <div className="space-y-3">
              {myApps.slice(0, 5).map(a => {
                const p = db.projects.find(x => x.id === a.projectId);
                if (!p) return null;
                return (
                  <Link key={a.id} to={`/projects/${p.id}`} className="card-hover flex items-center justify-between gap-3 rounded-2xl border border-lined bg-card p-4">
                    <div>
                      <p className="font-semibold text-white">{p.title}</p>
                      <p className="mt-0.5 text-xs text-muted">Applied {timeAgo(a.createdAt)} · bid {money(a.expectedBudget)}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
