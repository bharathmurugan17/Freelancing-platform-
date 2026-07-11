import { Link } from 'react-router-dom';
import { Bookmark, Clock, Users, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Project } from '../lib/types';
import { useStore } from '../lib/store';
import { money, timeAgo } from '../lib/utils';
import { Badge, SkillTag, StatusBadge } from './ui';

export default function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const { user, toggleSave, isSaved, db } = useStore();
  const saved = isSaved(project.id);
  const applicants = db.applications.filter(a => a.projectId === project.id).length;
  const client = db.users.find(u => u.id === project.clientId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.05, 0.4) }}
      className="card-hover group relative rounded-2xl border border-lined bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge tone="gray">{project.category}</Badge>
            <StatusBadge status={project.status} />
          </div>
          <Link to={`/projects/${project.id}`} className="font-display text-lg font-bold leading-snug text-white transition group-hover:text-violet2">
            {project.title}
          </Link>
        </div>
        {user?.role === 'freelancer' && (
          <button onClick={() => toggleSave(project.id)} className={`shrink-0 rounded-lg border p-2 transition ${saved ? 'border-cyan/40 bg-cyan/10 text-cyan2' : 'border-lined text-muted hover:border-cyan/40 hover:text-cyan2'}`} aria-label="Save project">
            <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{project.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.skills.slice(0, 5).map(s => <SkillTag key={s} skill={s} />)}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-lined pt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="font-display text-base font-bold text-cyan2">{money(project.budget)}{project.type === 'hourly' && <span className="text-xs font-normal text-muted">/hr</span>}</span>
          <span className="inline-flex items-center gap-1"><Briefcase size={12} />{project.experienceLevel}</span>
          <span className="inline-flex items-center gap-1"><Users size={12} />{applicants} applicant{applicants !== 1 && 's'}</span>
          <span className="inline-flex items-center gap-1"><Clock size={12} />{timeAgo(project.createdAt)}</span>
        </div>
        <span className="text-xs text-muted">by <span className="text-silver">{client?.name}</span></span>
      </div>
    </motion.div>
  );
}
