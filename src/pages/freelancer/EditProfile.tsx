import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Eye, Camera, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import type { FreelancerProfile } from '../../lib/types';
import { Field, inputCls, btnPrimary, btnGhost } from '../../components/ui';

export default function EditProfile() {
  const { user, getProfile, updateProfile, updateAvatar } = useStore();
  const existing = user ? getProfile(user.id) : undefined;
  const [p, setP] = useState<FreelancerProfile | undefined>(existing ? { ...existing } : undefined);
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user || !p) return null;

  const set = <K extends keyof FreelancerProfile>(k: K, v: FreelancerProfile[K]) => setP(prev => prev ? { ...prev, [k]: v } : prev);

  const save = () => {
    updateProfile(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => updateAvatar(reader.result as string);
    reader.readAsDataURL(f);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !p.skills.includes(s)) set('skills', [...p.skills, s]);
    setSkillInput('');
  };

  const sectionCls = 'rounded-2xl border border-lined bg-card p-6';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Edit Profile</h1>
          <p className="mt-1 text-sm text-muted">Make your profile shine like a professional resume.</p>
        </div>
        <div className="flex gap-2.5">
          <Link to={`/freelancers/${user.id}`} className={btnGhost}><Eye size={15} /> Preview</Link>
          <button onClick={save} className={btnPrimary}>{saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Profile</>}</button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* basics */}
        <section className={sectionCls}>
          <h2 className="mb-5 font-display text-lg font-bold text-white">Basics</h2>
          <div className="mb-6 flex items-center gap-5">
            <div className="relative">
              <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-2xl border border-lined object-cover" />
              <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1.5 -right-1.5 rounded-lg bg-gradient-to-r from-violet to-cyan p-1.5 text-white shadow-lg" title="Upload photo">
                <Camera size={13} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatar} />
            </div>
            <div>
              <p className="font-display font-bold text-white">{user.name}</p>
              <p className="text-xs text-muted">Click the camera to upload a profile picture.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Professional title"><input className={inputCls} value={p.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Senior Frontend Engineer" /></Field>
            <Field label="Location"><input className={inputCls} value={p.location} onChange={e => set('location', e.target.value)} placeholder="City, Country" /></Field>
            <Field label="Hourly rate ($)"><input className={inputCls} type="number" min="0" value={p.hourlyRate || ''} onChange={e => set('hourlyRate', Number(e.target.value))} placeholder="50" /></Field>
            <Field label="Availability"><input className={inputCls} value={p.availability} onChange={e => set('availability', e.target.value)} placeholder="e.g. Available · 30 hrs/week" /></Field>
          </div>
          <div className="mt-4">
            <Field label="Bio"><textarea className={inputCls + ' min-h-24 resize-y'} value={p.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell clients who you are and what you do best…" /></Field>
          </div>
          <div className="mt-4">
            <Field label="Resume summary" hint="A concise, resume-style professional summary."><textarea className={inputCls + ' min-h-20 resize-y'} value={p.resumeSummary} onChange={e => set('resumeSummary', e.target.value)} placeholder="7+ years building…" /></Field>
          </div>
        </section>

        {/* skills */}
        <section className={sectionCls}>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Skills</h2>
          <div className="flex gap-2">
            <input className={inputCls} value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="Add a skill and press Enter" />
            <button onClick={addSkill} className={btnGhost}><Plus size={15} /></button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.skills.map(s => (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-lg border border-lined bg-card2 px-2.5 py-1 text-xs text-silver">
                {s}
                <button onClick={() => set('skills', p.skills.filter(x => x !== s))} className="text-muted hover:text-danger"><Trash2 size={11} /></button>
              </span>
            ))}
          </div>
        </section>

        {/* links */}
        <section className={sectionCls}>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Links</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="GitHub"><input className={inputCls} value={p.github} onChange={e => set('github', e.target.value)} placeholder="github.com/you" /></Field>
            <Field label="LinkedIn"><input className={inputCls} value={p.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/you" /></Field>
            <Field label="Website"><input className={inputCls} value={p.website} onChange={e => set('website', e.target.value)} placeholder="you.dev" /></Field>
          </div>
        </section>

        {/* education */}
        <section className={sectionCls}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Education</h2>
            <button onClick={() => set('education', [...p.education, { school: '', degree: '', years: '' }])} className={btnGhost + ' !px-3 !py-1.5 text-xs'}><Plus size={13} /> Add</button>
          </div>
          <div className="space-y-3">
            {p.education.map((e, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-lined bg-surface p-4 sm:grid-cols-[1fr_1fr_140px_auto]">
                <input className={inputCls} value={e.school} onChange={ev => set('education', p.education.map((x, j) => j === i ? { ...x, school: ev.target.value } : x))} placeholder="School" />
                <input className={inputCls} value={e.degree} onChange={ev => set('education', p.education.map((x, j) => j === i ? { ...x, degree: ev.target.value } : x))} placeholder="Degree" />
                <input className={inputCls} value={e.years} onChange={ev => set('education', p.education.map((x, j) => j === i ? { ...x, years: ev.target.value } : x))} placeholder="2018 – 2022" />
                <button onClick={() => set('education', p.education.filter((_, j) => j !== i))} className="self-center text-muted hover:text-danger"><Trash2 size={15} /></button>
              </div>
            ))}
            {p.education.length === 0 && <p className="text-sm text-muted">No education entries yet.</p>}
          </div>
        </section>

        {/* experience */}
        <section className={sectionCls}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Experience</h2>
            <button onClick={() => set('experience', [...p.experience, { company: '', role: '', years: '', description: '' }])} className={btnGhost + ' !px-3 !py-1.5 text-xs'}><Plus size={13} /> Add</button>
          </div>
          <div className="space-y-3">
            {p.experience.map((e, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-lined bg-surface p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_140px_auto]">
                  <input className={inputCls} value={e.role} onChange={ev => set('experience', p.experience.map((x, j) => j === i ? { ...x, role: ev.target.value } : x))} placeholder="Role" />
                  <input className={inputCls} value={e.company} onChange={ev => set('experience', p.experience.map((x, j) => j === i ? { ...x, company: ev.target.value } : x))} placeholder="Company" />
                  <input className={inputCls} value={e.years} onChange={ev => set('experience', p.experience.map((x, j) => j === i ? { ...x, years: ev.target.value } : x))} placeholder="2020 – 2024" />
                  <button onClick={() => set('experience', p.experience.filter((_, j) => j !== i))} className="self-center text-muted hover:text-danger"><Trash2 size={15} /></button>
                </div>
                <input className={inputCls} value={e.description} onChange={ev => set('experience', p.experience.map((x, j) => j === i ? { ...x, description: ev.target.value } : x))} placeholder="What did you achieve?" />
              </div>
            ))}
            {p.experience.length === 0 && <p className="text-sm text-muted">No experience entries yet.</p>}
          </div>
        </section>

        {/* certifications */}
        <section className={sectionCls}>
          <h2 className="mb-4 font-display text-lg font-bold text-white">Certifications</h2>
          <div className="flex gap-2">
            <input className={inputCls} value={certInput} onChange={e => setCertInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (certInput.trim()) { set('certifications', [...p.certifications, certInput.trim()]); setCertInput(''); } } }}
              placeholder="Add a certification and press Enter" />
            <button onClick={() => { if (certInput.trim()) { set('certifications', [...p.certifications, certInput.trim()]); setCertInput(''); } }} className={btnGhost}><Plus size={15} /></button>
          </div>
          <ul className="mt-3 space-y-2">
            {p.certifications.map((c, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border border-lined bg-surface px-3 py-2 text-sm text-silver">
                {c}
                <button onClick={() => set('certifications', p.certifications.filter((_, j) => j !== i))} className="text-muted hover:text-danger"><Trash2 size={13} /></button>
              </li>
            ))}
          </ul>
        </section>

        {/* portfolio */}
        <section className={sectionCls}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Portfolio</h2>
            <button onClick={() => set('portfolio', [...p.portfolio, { title: '', image: `https://picsum.photos/seed/${Math.random().toString(36).slice(2, 8)}/640/400`, description: '' }])} className={btnGhost + ' !px-3 !py-1.5 text-xs'}><Plus size={13} /> Add item</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {p.portfolio.map((item, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-lined bg-surface">
                <img src={item.image} alt="" className="h-32 w-full object-cover" />
                <div className="space-y-2.5 p-4">
                  <input className={inputCls} value={item.title} onChange={ev => set('portfolio', p.portfolio.map((x, j) => j === i ? { ...x, title: ev.target.value } : x))} placeholder="Project title" />
                  <input className={inputCls} value={item.description} onChange={ev => set('portfolio', p.portfolio.map((x, j) => j === i ? { ...x, description: ev.target.value } : x))} placeholder="Short description" />
                  <input className={inputCls} value={item.image} onChange={ev => set('portfolio', p.portfolio.map((x, j) => j === i ? { ...x, image: ev.target.value } : x))} placeholder="Image URL" />
                  <button onClick={() => set('portfolio', p.portfolio.filter((_, j) => j !== i))} className="inline-flex items-center gap-1 text-xs text-danger hover:underline"><Trash2 size={12} /> Remove</button>
                </div>
              </div>
            ))}
          </div>
          {p.portfolio.length === 0 && <p className="text-sm text-muted">No portfolio items yet — showcase your best work.</p>}
        </section>

        {/* completed projects */}
        <section className={sectionCls}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Completed Projects</h2>
            <button onClick={() => set('completedProjects', [...p.completedProjects, { title: '', description: '', year: String(new Date().getFullYear()) }])} className={btnGhost + ' !px-3 !py-1.5 text-xs'}><Plus size={13} /> Add</button>
          </div>
          <div className="space-y-3">
            {p.completedProjects.map((c, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-lined bg-surface p-4 sm:grid-cols-[1fr_1fr_100px_auto]">
                <input className={inputCls} value={c.title} onChange={ev => set('completedProjects', p.completedProjects.map((x, j) => j === i ? { ...x, title: ev.target.value } : x))} placeholder="Title" />
                <input className={inputCls} value={c.description} onChange={ev => set('completedProjects', p.completedProjects.map((x, j) => j === i ? { ...x, description: ev.target.value } : x))} placeholder="Description" />
                <input className={inputCls} value={c.year} onChange={ev => set('completedProjects', p.completedProjects.map((x, j) => j === i ? { ...x, year: ev.target.value } : x))} placeholder="Year" />
                <button onClick={() => set('completedProjects', p.completedProjects.filter((_, j) => j !== i))} className="self-center text-muted hover:text-danger"><Trash2 size={15} /></button>
              </div>
            ))}
            {p.completedProjects.length === 0 && <p className="text-sm text-muted">No completed projects listed yet.</p>}
          </div>
        </section>

        <div className="sticky bottom-4 flex justify-end">
          <button onClick={save} className={btnPrimary + ' shadow-2xl'}>{saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Profile</>}</button>
        </div>
      </motion.div>
    </div>
  );
}
