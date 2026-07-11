import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Github, Linkedin, Globe, GraduationCap, Briefcase, Award, FileText, Clock } from 'lucide-react';
import { useStore } from '../lib/store';
import { avgRating, money, timeAgo } from '../lib/utils';
import { Rating, SkillTag, Badge } from '../components/ui';

export default function FreelancerPublicProfile() {
  const { id } = useParams();
  const { db } = useStore();
  const navigate = useNavigate();
  const profile = db.profiles.find(p => p.userId === id);
  const u = db.users.find(x => x.id === id);

  if (!profile || !u) return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted">Profile not found. <Link to="/talent" className="text-cyan2 hover:underline">Browse talent</Link></div>;

  const rating = avgRating(profile.reviews);
  const linkItem = (icon: React.ReactNode, label: string, href: string) => href ? (
    <a href={`https://${href.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-lined bg-surface px-3 py-1.5 text-xs text-cyan2 transition hover:border-cyan/40">
      {icon}{label}
    </a>
  ) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-white"><ArrowLeft size={15} /> Back</button>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* header */}
        <div className="relative overflow-hidden rounded-3xl border border-lined bg-card">
          <div className="h-28 bg-gradient-to-r from-violet/40 via-card2 to-cyan/25" />
          <div className="px-6 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <img src={u.avatar} alt={u.name} className="h-24 w-24 rounded-3xl border-4 border-card bg-card2 object-cover" />
                <div className="pb-1">
                  <h1 className="font-display text-2xl font-bold text-white">{u.name}</h1>
                  <p className="text-sm text-violet2">{profile.title || 'Freelancer'}</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-1.5 sm:items-end">
                <div className="flex items-center gap-2"><Rating value={rating} /><span className="text-xs text-muted">{rating.toFixed(1)} · {profile.reviews.length} review{profile.reviews.length !== 1 && 's'}</span></div>
                <p className="font-display text-xl font-bold text-cyan2">{money(profile.hourlyRate)}<span className="text-xs font-normal text-muted">/hr</span></p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
              {profile.location && <span className="inline-flex items-center gap-1"><MapPin size={12} />{profile.location}</span>}
              {profile.availability && <span className="inline-flex items-center gap-1"><Clock size={12} />{profile.availability}</span>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {linkItem(<Github size={13} />, 'GitHub', profile.github)}
              {linkItem(<Linkedin size={13} />, 'LinkedIn', profile.linkedin)}
              {linkItem(<Globe size={13} />, 'Website', profile.website)}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {profile.bio && (
              <section className="rounded-2xl border border-lined bg-card p-6">
                <h2 className="mb-3 font-display text-lg font-bold text-white">About</h2>
                <p className="text-sm leading-relaxed text-silver/85">{profile.bio}</p>
                {profile.resumeSummary && (
                  <div className="mt-4 rounded-xl border border-lined bg-surface p-4">
                    <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted"><FileText size={12} /> Resume summary</p>
                    <p className="text-sm text-silver/80">{profile.resumeSummary}</p>
                  </div>
                )}
              </section>
            )}

            {profile.portfolio.length > 0 && (
              <section className="rounded-2xl border border-lined bg-card p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-white">Portfolio</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {profile.portfolio.map(item => (
                    <div key={item.title} className="card-hover overflow-hidden rounded-xl border border-lined bg-surface">
                      <img src={item.image} alt={item.title} className="h-36 w-full object-cover" loading="lazy" />
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                        <p className="mt-1 text-xs text-muted">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {profile.experience.length > 0 && (
              <section className="rounded-2xl border border-lined bg-card p-6">
                <h2 className="mb-4 inline-flex items-center gap-2 font-display text-lg font-bold text-white"><Briefcase size={16} className="text-violet2" /> Experience</h2>
                <div className="space-y-4">
                  {profile.experience.map((e, i) => (
                    <div key={i} className="relative border-l-2 border-violet/30 pl-4">
                      <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-violet" />
                      <h3 className="text-sm font-semibold text-white">{e.role} · <span className="text-violet2">{e.company}</span></h3>
                      <p className="text-xs text-muted">{e.years}</p>
                      <p className="mt-1 text-sm text-silver/80">{e.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {profile.completedProjects.length > 0 && (
              <section className="rounded-2xl border border-lined bg-card p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-white">Completed Projects</h2>
                <div className="space-y-3">
                  {profile.completedProjects.map((c, i) => (
                    <div key={i} className="rounded-xl border border-lined bg-surface p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">{c.title}</h3>
                        <Badge tone="green">{c.year}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted">{c.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {profile.reviews.length > 0 && (
              <section className="rounded-2xl border border-lined bg-card p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-white">Reviews</h2>
                <div className="space-y-4">
                  {profile.reviews.map(r => (
                    <div key={r.id} className="rounded-xl border border-lined bg-surface p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">{r.clientName}</p>
                        <Rating value={r.rating} size={12} />
                      </div>
                      <p className="mt-1.5 text-sm text-silver/80">{r.text}</p>
                      <p className="mt-1.5 text-[11px] text-muted">{timeAgo(r.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-lined bg-card p-6">
              <h2 className="mb-3 font-display text-base font-bold text-white">Skills</h2>
              <div className="flex flex-wrap gap-2">{profile.skills.map(s => <SkillTag key={s} skill={s} />)}</div>
            </section>
            {profile.education.length > 0 && (
              <section className="rounded-2xl border border-lined bg-card p-6">
                <h2 className="mb-3 inline-flex items-center gap-2 font-display text-base font-bold text-white"><GraduationCap size={16} className="text-cyan2" /> Education</h2>
                <div className="space-y-3">
                  {profile.education.map((e, i) => (
                    <div key={i}>
                      <p className="text-sm font-semibold text-white">{e.degree}</p>
                      <p className="text-xs text-muted">{e.school} · {e.years}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {profile.certifications.length > 0 && (
              <section className="rounded-2xl border border-lined bg-card p-6">
                <h2 className="mb-3 inline-flex items-center gap-2 font-display text-base font-bold text-white"><Award size={16} className="text-amber-300" /> Certifications</h2>
                <ul className="space-y-2">
                  {profile.certifications.map((c, i) => <li key={i} className="rounded-lg border border-lined bg-surface px-3 py-2 text-xs text-silver/90">{c}</li>)}
                </ul>
              </section>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
