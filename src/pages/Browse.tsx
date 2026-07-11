import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, SearchX } from 'lucide-react';
import { useStore } from '../lib/store';
import { CATEGORIES } from '../lib/types';
import ProjectCard from '../components/ProjectCard';
import { Empty, inputCls } from '../components/ui';

export default function Browse() {
  const { db } = useStore();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const category = params.get('category') ?? '';
  const [type, setType] = useState('');
  const [exp, setExp] = useState('');
  const [budget, setBudget] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const projects = useMemo(() => {
    return db.projects
      .filter(p => p.status === 'open')
      .filter(p => !category || p.category === category)
      .filter(p => !type || p.type === type)
      .filter(p => !exp || p.experienceLevel === exp)
      .filter(p => {
        if (!budget) return true;
        if (budget === 'lt1000') return p.budget < 1000;
        if (budget === '1000-5000') return p.budget >= 1000 && p.budget <= 5000;
        if (budget === 'gt5000') return p.budget > 5000;
        return true;
      })
      .filter(p => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)
          || p.skills.some(sk => sk.toLowerCase().includes(s)) || p.category.toLowerCase().includes(s);
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [db.projects, q, category, type, exp, budget]);

  const selectCls = 'rounded-xl border border-lined bg-surface px-3 py-2 text-sm text-silver outline-none transition focus:border-violet/60';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Browse Projects</h1>
        <p className="mt-1 text-sm text-muted">{projects.length} open project{projects.length !== 1 && 's'} matching your criteria</p>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by skill, project name, or keyword…"
              className={inputCls + ' pl-11 py-3'} />
          </div>
          <button onClick={() => setShowFilters(f => !f)} className={`inline-flex items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${showFilters ? 'border-violet/50 bg-violet/10 text-violet2' : 'border-lined bg-card text-silver hover:border-violet/40'}`}>
            <SlidersHorizontal size={15} /> <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-2xl border border-lined bg-card p-4">
            <select value={category} onChange={e => { const p = new URLSearchParams(params); if (e.target.value) p.set('category', e.target.value); else p.delete('category'); setParams(p); }} className={selectCls}>
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={budget} onChange={e => setBudget(e.target.value)} className={selectCls}>
              <option value="">Any budget</option>
              <option value="lt1000">Under $1,000</option>
              <option value="1000-5000">$1,000 – $5,000</option>
              <option value="gt5000">Over $5,000</option>
            </select>
            <select value={exp} onChange={e => setExp(e.target.value)} className={selectCls}>
              <option value="">Any experience</option>
              <option>Entry</option><option>Intermediate</option><option>Expert</option>
            </select>
            <select value={type} onChange={e => setType(e.target.value)} className={selectCls}>
              <option value="">Any type</option>
              <option value="fixed">Fixed price</option>
              <option value="hourly">Hourly</option>
            </select>
            {(category || budget || exp || type || q) && (
              <button onClick={() => { setQ(''); setBudget(''); setExp(''); setType(''); setParams(new URLSearchParams()); }}
                className="text-sm text-cyan2 hover:underline">Clear all</button>
            )}
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <Empty icon={<SearchX size={36} />} title="No projects found" sub="Try adjusting your search or filters." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
