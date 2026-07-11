import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, MessageSquare, Search, Star, Zap, Users, Briefcase } from 'lucide-react';
import { useStore } from '../lib/store';
import { CATEGORIES } from '../lib/types';
import { avgRating, money } from '../lib/utils';
import ProjectCard from '../components/ProjectCard';
import { Rating } from '../components/ui';

const fade = (d = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: .55, delay: d } });

export default function Landing() {
  const { db, user } = useStore();
  const openProjects = db.projects.filter(p => p.status === 'open').slice(0, 3);
  const topTalent = db.profiles.slice(0, 3);

  return (
    <div className="relative overflow-hidden">
      {/* hero */}
      <section className="grid-bg relative">
        <div className="glow-orb left-[-10%] top-[-10%] h-96 w-96 bg-violet/25" />
        <div className="glow-orb right-[-8%] top-[20%] h-80 w-80 bg-cyan/15" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pt-28">
          <motion.div {...fade(0)} className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-1.5 text-xs font-medium text-violet2">
              <Sparkles size={13} /> The marketplace where great work happens
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-[1.08] text-white sm:text-6xl">
              Hire brilliant freelancers.<br />
              <span className="grad-text">Land dream projects.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              FreelanceHub connects ambitious clients with world-class independent talent — post a project, review proposals, and collaborate in one elegant workspace.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={user ? (user.role === 'client' ? '/client/post' : '/browse') : '/register'} className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet to-cyan px-7 py-3.5 font-semibold text-white shadow-xl shadow-violet/30 transition hover:brightness-110">
                {user ? (user.role === 'client' ? 'Post a Project' : 'Browse Projects') : 'Get Started Free'}
                <ArrowRight size={17} className="transition group-hover:translate-x-0.5" />
              </Link>
              <Link to="/browse" className="inline-flex items-center gap-2 rounded-xl border border-lined bg-card px-7 py-3.5 font-medium text-silver transition hover:border-violet/40 hover:text-white">
                <Search size={16} /> Explore Projects
              </Link>
            </div>
            <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4">
              {[['12k+', 'Freelancers'], ['4.8k', 'Projects posted'], ['98%', 'Success rate']].map(([v, l], i) => (
                <motion.div key={l} {...fade(.1 + i * .08)} className="rounded-2xl border border-lined bg-card/60 px-3 py-4 backdrop-blur">
                  <div className="font-display text-2xl font-bold grad-text">{v}</div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-wider text-muted">{l}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <motion.div {...fade()} className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Browse by category</h2>
            <p className="mt-1 text-sm text-muted">Find work across every discipline.</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.slice(0, 10).map((c, i) => (
            <motion.div key={c} {...fade(i * .04)}>
              <Link to={`/browse?category=${encodeURIComponent(c)}`}
                className="card-hover flex h-full flex-col justify-between rounded-2xl border border-lined bg-card p-4">
                <Zap size={17} className="text-cyan2" />
                <span className="mt-6 text-sm font-semibold text-white">{c}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="border-y border-lined bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <motion.h2 {...fade()} className="text-center font-display text-2xl font-bold text-white sm:text-3xl">How FreelanceHub works</motion.h2>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              { icon: <Briefcase size={20} />, t: 'Post a project', s: 'Describe your project, budget, and required skills in minutes.' },
              { icon: <Users size={20} />, t: 'Review proposals', s: 'Compare applicants side by side — portfolios, ratings, and rates.' },
              { icon: <ShieldCheck size={20} />, t: 'Hire with confidence', s: 'Select the best freelancer and kick off instantly.' },
              { icon: <MessageSquare size={20} />, t: 'Collaborate & complete', s: 'Private chat, file sharing, and reviews when the work ships.' },
            ].map((x, i) => (
              <motion.div key={x.t} {...fade(i * .08)} className="relative rounded-2xl border border-lined bg-card p-6">
                <span className="absolute right-4 top-4 font-display text-4xl font-extrabold text-white/[.05]">{i + 1}</span>
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-violet/20 to-cyan/20 p-3 text-cyan2">{x.icon}</div>
                <h3 className="font-display font-bold text-white">{x.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{x.s}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* latest projects */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <motion.div {...fade()} className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Fresh opportunities</h2>
            <p className="mt-1 text-sm text-muted">Just posted by clients on FreelanceHub.</p>
          </div>
          <Link to="/browse" className="hidden items-center gap-1 text-sm font-medium text-cyan2 hover:underline sm:inline-flex">View all <ArrowRight size={14} /></Link>
        </motion.div>
        <div className="grid gap-4 lg:grid-cols-3">
          {openProjects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>
      </section>

      {/* top talent */}
      <section className="border-t border-lined bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <motion.div {...fade()} className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Meet top talent</h2>
              <p className="mt-1 text-sm text-muted">Vetted professionals ready to start today.</p>
            </div>
            <Link to="/talent" className="hidden items-center gap-1 text-sm font-medium text-cyan2 hover:underline sm:inline-flex">Browse talent <ArrowRight size={14} /></Link>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-3">
            {topTalent.map((p, i) => {
              const u = db.users.find(x => x.id === p.userId)!;
              const rating = avgRating(p.reviews);
              return (
                <motion.div key={p.userId} {...fade(i * .08)}>
                  <Link to={`/freelancers/${p.userId}`} className="card-hover block rounded-2xl border border-lined bg-card p-6">
                    <div className="flex items-center gap-4">
                      <img src={u.avatar} alt={u.name} className="h-14 w-14 rounded-2xl border border-lined object-cover" />
                      <div>
                        <h3 className="font-display font-bold text-white">{u.name}</h3>
                        <p className="text-xs text-muted">{p.title}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Rating value={rating} />
                      <span className="text-xs text-muted">({p.reviews.length} review{p.reviews.length !== 1 && 's'})</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.skills.slice(0, 4).map(s => <span key={s} className="rounded-md border border-lined bg-card2 px-2 py-0.5 text-xs text-silver/90">{s}</span>)}
                    </div>
                    <p className="mt-4 font-display text-lg font-bold text-cyan2">{money(p.hourlyRate)}<span className="text-xs font-normal text-muted">/hr</span></p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="glow-orb bottom-[-30%] left-1/2 h-96 w-[40rem] -translate-x-1/2 bg-violet/20" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <motion.div {...fade()}>
            <Star size={28} className="mx-auto mb-5 text-cyan2" />
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Ready to do your best work?</h2>
            <p className="mx-auto mt-3 max-w-md text-muted">Join thousands of freelancers and clients building the future together.</p>
            <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet to-cyan px-8 py-3.5 font-semibold text-white shadow-xl shadow-violet/30 transition hover:brightness-110">
              Create your free account <ArrowRight size={17} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
