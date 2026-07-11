import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, CalendarDays, Paperclip, Users, Briefcase, Send, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '../lib/store';
import { money, timeAgo } from '../lib/utils';
import { Badge, StatusBadge, SkillTag, Modal, Field, inputCls, btnPrimary, btnGhost } from '../components/ui';

export default function ProjectDetail() {
  const { id } = useParams();
  const { db, user, apply, toggleSave, isSaved } = useStore();
  const navigate = useNavigate();
  const project = db.projects.find(p => p.id === id);
  const [open, setOpen] = useState(false);
  const [proposal, setProposal] = useState('');
  const [budget, setBudget] = useState('');
  const [time, setTime] = useState('');
  const [sent, setSent] = useState(false);

  if (!project) return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted">Project not found. <Link to="/browse" className="text-cyan2 hover:underline">Browse projects</Link></div>;

  const client = db.users.find(u => u.id === project.clientId);
  const applications = db.applications.filter(a => a.projectId === project.id);
  const myApp = user ? applications.find(a => a.freelancerId === user.id) : undefined;
  const saved = isSaved(project.id);

  const submitApp = (e: React.FormEvent) => {
    e.preventDefault();
    apply(project.id, proposal, Number(budget), time);
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); }, 1400);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-white"><ArrowLeft size={15} /> Back</button>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-2xl border border-lined bg-card p-6 sm:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone="gray">{project.category}</Badge>
            <StatusBadge status={project.status} />
            <span className="text-xs text-muted">Posted {timeAgo(project.createdAt)}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{project.title}</h1>
          <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-silver/85">{project.description}</div>
          <h3 className="mt-8 mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Required skills</h3>
          <div className="flex flex-wrap gap-2">{project.skills.map(s => <SkillTag key={s} skill={s} />)}</div>
          {project.attachments.length > 0 && (
            <>
              <h3 className="mt-8 mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Attachments</h3>
              <div className="flex flex-wrap gap-2">
                {project.attachments.map(a => (
                  <span key={a} className="inline-flex items-center gap-1.5 rounded-lg border border-lined bg-surface px-3 py-1.5 text-xs text-cyan2"><Paperclip size={12} />{a}</span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-lined bg-card p-5">
            <p className="font-display text-3xl font-bold text-cyan2">{money(project.budget)}{project.type === 'hourly' && <span className="text-sm font-normal text-muted">/hr</span>}</p>
            <p className="text-xs text-muted">{project.type === 'fixed' ? 'Fixed price' : 'Hourly rate'}</p>
            <div className="mt-4 space-y-2.5 border-t border-lined pt-4 text-sm">
              <p className="flex items-center gap-2 text-muted"><Briefcase size={14} className="text-violet2" /><span className="text-silver">{project.experienceLevel}</span> level</p>
              <p className="flex items-center gap-2 text-muted"><CalendarDays size={14} className="text-violet2" />Deadline <span className="text-silver">{project.deadline}</span></p>
              <p className="flex items-center gap-2 text-muted"><Users size={14} className="text-violet2" /><span className="text-silver">{applications.length}</span> applicant{applications.length !== 1 && 's'} · {project.freelancersRequired} needed</p>
            </div>
            {user?.role === 'freelancer' && project.status === 'open' && (
              <div className="mt-5 space-y-2.5">
                {myApp ? (
                  <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                    <CheckCircle2 size={15} className="mb-1" /> Applied {timeAgo(myApp.createdAt)} — status: <b className="capitalize">{myApp.status}</b>
                  </div>
                ) : (
                  <button onClick={() => setOpen(true)} className={btnPrimary + ' w-full'}><Send size={15} /> Apply Now</button>
                )}
                <button onClick={() => toggleSave(project.id)} className={btnGhost + ' w-full'}>
                  <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-cyan2' : ''} />
                  {saved ? 'Saved' : 'Save Project'}
                </button>
              </div>
            )}
            {!user && (
              <Link to="/login" className={btnPrimary + ' mt-5 w-full'}>Log in to apply</Link>
            )}
          </div>
          {client && (
            <div className="rounded-2xl border border-lined bg-card p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">About the client</h3>
              <div className="flex items-center gap-3">
                <img src={client.avatar} alt={client.name} className="h-11 w-11 rounded-xl border border-lined" />
                <div>
                  <p className="text-sm font-semibold text-white">{client.name}</p>
                  {client.company && <p className="text-xs text-muted">{client.company}</p>}
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><Clock size={12} /> Member since {new Date(client.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
            </div>
          )}
        </div>
      </motion.div>

      <Modal open={open} onClose={() => setOpen(false)} title={`Apply to “${project.title}”`}>
        {sent ? (
          <div className="py-8 text-center">
            <CheckCircle2 size={44} className="mx-auto mb-3 text-success" />
            <p className="font-display text-lg font-bold text-white">Application sent!</p>
            <p className="mt-1 text-sm text-muted">The client will be notified. Track it under Applications.</p>
          </div>
        ) : (
          <form onSubmit={submitApp} className="space-y-4">
            <Field label="Proposal message">
              <textarea className={inputCls + ' min-h-32 resize-y'} required value={proposal} onChange={e => setProposal(e.target.value)}
                placeholder="Explain why you're a great fit, your approach, and relevant experience…" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={project.type === 'hourly' ? 'Expected rate ($/hr)' : 'Expected budget ($)'}>
                <input className={inputCls} type="number" min="1" required value={budget} onChange={e => setBudget(e.target.value)} placeholder={String(project.budget)} />
              </Field>
              <Field label="Estimated time">
                <input className={inputCls} required value={time} onChange={e => setTime(e.target.value)} placeholder="e.g. 3 weeks" />
              </Field>
            </div>
            <button type="submit" className={btnPrimary + ' w-full'}><Send size={15} /> Submit Application</button>
          </form>
        )}
      </Modal>
    </div>
  );
}
