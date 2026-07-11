import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, SearchX } from 'lucide-react';
import { useStore } from '../lib/store';
import { avgRating, money } from '../lib/utils';
import { Rating, Empty, inputCls, Badge } from '../components/ui';

export default function Talent() {
  const { db } = useStore();
  const [q, setQ] = useState('');

  const talent = useMemo(() => db.profiles.filter(p => {
    const u = db.users.find(x => x.id === p.userId);
    if (!u) return false;
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return u.name.toLowerCase().includes(s) || p.title.toLowerCase().includes(s) || p.skills.some(sk => sk.toLowerCase().includes(s));
  }), [db, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Find Talent</h1>
        <p className="mt-1 text-sm text-muted">Discover skilled freelancers ready for your next project.</p>
      </div>
      <div className="relative mb-8 max-w-xl">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, title, or skill…" className={inputCls + ' pl-11 py-3'} />
      </div>
      {talent.length === 0 ? (
        <Empty icon={<SearchX size={36} />} title="No freelancers found" sub="Try a different search term." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {talent.map((p, i) => {
            const u = db.users.find(x => x.id === p.userId)!;
            const rating = avgRating(p.reviews);
            return (
              <motion.div key={p.userId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * .05, .4) }}>
                <Link to={`/freelancers/${p.userId}`} className="card-hover flex h-full flex-col rounded-2xl border border-lined bg-card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <img src={u.avatar} alt={u.name} className="h-14 w-14 rounded-2xl border border-lined object-cover" />
                      <div>
                        <h3 className="font-display font-bold text-white">{u.name}</h3>
                        <p className="text-xs text-muted">{p.title || 'Freelancer'}</p>
                      </div>
                    </div>
                    <Badge tone="cyan">{money(p.hourlyRate)}/hr</Badge>
                  </div>
                  <div className="mt-3.5 flex items-center gap-2">
                    <Rating value={rating} />
                    <span className="text-xs text-muted">({p.reviews.length})</span>
                    {p.location && <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted"><MapPin size={11} />{p.location}</span>}
                  </div>
                  <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted">{p.bio || 'No bio yet.'}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.skills.slice(0, 4).map(s => <span key={s} className="rounded-md border border-lined bg-card2 px-2 py-0.5 text-xs text-silver/90">{s}</span>)}
                    {p.skills.length > 4 && <span className="px-1 text-xs text-muted">+{p.skills.length - 4}</span>}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
