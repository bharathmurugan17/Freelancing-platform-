import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Rocket, Paperclip, Save } from 'lucide-react';
import { useStore } from '../../lib/store';
import { CATEGORIES, type ExperienceLevel, type ProjectType } from '../../lib/types';
import { Field, inputCls, btnPrimary, btnGhost } from '../../components/ui';

export default function PostProject() {
  const { id } = useParams();
  const { db, user, createProject, updateProject } = useStore();
  const navigate = useNavigate();
  const editing = id ? db.projects.find(p => p.id === id) : undefined;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [skills, setSkills] = useState<string[]>(editing?.skills ?? []);
  const [skillInput, setSkillInput] = useState('');
  const [budget, setBudget] = useState(editing ? String(editing.budget) : '');
  const [category, setCategory] = useState(editing?.category ?? CATEGORIES[0]);
  const [deadline, setDeadline] = useState(editing?.deadline ?? '');
  const [exp, setExp] = useState<ExperienceLevel>(editing?.experienceLevel ?? 'Intermediate');
  const [type, setType] = useState<ProjectType>(editing?.type ?? 'fixed');
  const [needed, setNeeded] = useState(editing ? String(editing.freelancersRequired) : '1');
  const [attachments, setAttachments] = useState<string[]>(editing?.attachments ?? []);

  if (!user) return null;

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(e.target.files ?? []).map(f => f.name);
    setAttachments(prev => [...new Set([...prev, ...names])]);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const data = {
      title, description, skills, budget: Number(budget), category, deadline,
      experienceLevel: exp, type, freelancersRequired: Number(needed) || 1, attachments,
    };
    if (editing) {
      updateProject(editing.id, data);
      navigate('/client');
    } else {
      const p = createProject(data);
      navigate(`/projects/${p.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-white">{editing ? 'Edit Project' : 'Post a Project'}</h1>
        <p className="mb-8 mt-1 text-sm text-muted">{editing ? 'Update the details of your project.' : 'Describe your project and start receiving proposals within hours.'}</p>

        <form onSubmit={submit} className="space-y-6 rounded-2xl border border-lined bg-card p-6 sm:p-8">
          <Field label="Project title">
            <input className={inputCls} required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Build a marketing dashboard in React" />
          </Field>
          <Field label="Project description">
            <textarea className={inputCls + ' min-h-36 resize-y'} required value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe the scope, deliverables, tech preferences, and anything a freelancer should know…" />
          </Field>
          <Field label="Required skills">
            <div className="flex gap-2">
              <input className={inputCls} value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="Type a skill and press Enter" />
              <button type="button" onClick={addSkill} className={btnGhost}><Plus size={15} /></button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-lg border border-lined bg-card2 px-2.5 py-1 text-xs text-silver">
                  {s}<button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="text-muted hover:text-danger"><Trash2 size={11} /></button>
                </span>
              ))}
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Project type">
              <div className="grid grid-cols-2 gap-2">
                {(['fixed', 'hourly'] as ProjectType[]).map(t => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition ${type === t ? 'border-violet/60 bg-violet/15 text-white' : 'border-lined bg-surface text-muted hover:border-violet/30'}`}>
                    {t === 'fixed' ? 'Fixed Price' : 'Hourly'}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={type === 'fixed' ? 'Budget ($)' : 'Hourly rate ($/hr)'}>
              <input className={inputCls} type="number" min="1" required value={budget} onChange={e => setBudget(e.target.value)} placeholder={type === 'fixed' ? '3000' : '50'} />
            </Field>
            <Field label="Category">
              <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Deadline">
              <input className={inputCls} type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field label="Experience level">
              <select className={inputCls} value={exp} onChange={e => setExp(e.target.value as ExperienceLevel)}>
                <option>Entry</option><option>Intermediate</option><option>Expert</option>
              </select>
            </Field>
            <Field label="Freelancers required">
              <input className={inputCls} type="number" min="1" max="20" required value={needed} onChange={e => setNeeded(e.target.value)} />
            </Field>
          </div>

          <Field label="Attachments (optional)">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-lined bg-surface px-4 py-6 text-sm text-muted transition hover:border-violet/40 hover:text-silver">
              <Paperclip size={15} /> Click to attach files
              <input type="file" multiple className="hidden" onChange={onFile} />
            </label>
            {attachments.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {attachments.map(a => (
                  <span key={a} className="inline-flex items-center gap-1.5 rounded-lg border border-lined bg-card2 px-2.5 py-1 text-xs text-cyan2">
                    <Paperclip size={11} />{a}
                    <button type="button" onClick={() => setAttachments(prev => prev.filter(x => x !== a))} className="text-muted hover:text-danger"><Trash2 size={11} /></button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <button type="submit" className={btnPrimary + ' w-full !py-3.5'}>
            {editing ? <><Save size={16} /> Save Changes</> : <><Rocket size={16} /> Publish Project</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
