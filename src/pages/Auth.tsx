import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, UserRound, Lock, Mail, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { useStore } from '../lib/store';
import type { Role } from '../lib/types';
import { Field, inputCls, btnPrimary } from '../components/ui';
import { Logo } from '../components/Layout';

function Shell({ children, title, sub }: { children: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="grid-bg relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-14">
      <div className="glow-orb left-[10%] top-[10%] h-72 w-72 bg-violet/20" />
      <div className="glow-orb bottom-[10%] right-[10%] h-72 w-72 bg-cyan/12" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}
        className="relative w-full max-w-md rounded-3xl border border-lined bg-card/80 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <h1 className="text-center font-display text-2xl font-bold text-white">{title}</h1>
        <p className="mb-7 mt-1.5 text-center text-sm text-muted">{sub}</p>
        {children}
      </motion.div>
    </div>
  );
}

export function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const err = login(email, password);
      setLoading(false);
      if (err) setError(err);
      else navigate('/redirect');
    }, 450);
  };

  return (
    <Shell title="Welcome back" sub="Log in to your FreelanceHub account">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">
          <div className="relative">
            <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input className={inputCls + ' pl-10'} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
        </Field>
        <Field label="Password">
          <div className="relative">
            <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input className={inputCls + ' pl-10'} type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </Field>
        {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <button type="submit" disabled={loading} className={btnPrimary + ' w-full'}>
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <>Log in <ArrowRight size={15} /></>}
        </button>
      </form>
      <div className="mt-5 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="text-cyan2 hover:underline">Forgot password?</Link>
        <Link to="/register" className="text-muted hover:text-white">Create account</Link>
      </div>
      <div className="mt-6 rounded-xl border border-lined bg-surface/70 p-4 text-xs text-muted">
        <p className="mb-2 font-semibold text-silver">Demo accounts (password: <code className="text-cyan2">demo123</code>)</p>
        <p>Freelancer — <button type="button" onClick={() => { setEmail('freelancer@demo.io'); setPassword('demo123'); }} className="text-violet2 hover:underline">freelancer@demo.io</button></p>
        <p className="mt-1">Client — <button type="button" onClick={() => { setEmail('client@demo.io'); setPassword('demo123'); }} className="text-violet2 hover:underline">client@demo.io</button></p>
      </div>
    </Shell>
  );
}

export function Register() {
  const { register } = useStore();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('freelancer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setTimeout(() => {
      const err = register(name, email, password, role, role === 'client' ? company : undefined);
      setLoading(false);
      if (err) setError(err);
      else navigate(role === 'freelancer' ? '/freelancer/profile' : '/client');
    }, 450);
  };

  return (
    <Shell title="Join FreelanceHub" sub="Create your account in seconds">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {([
            { r: 'freelancer' as Role, icon: <UserRound size={20} />, label: 'Freelancer', sub: 'I want to work' },
            { r: 'client' as Role, icon: <Briefcase size={20} />, label: 'Client', sub: 'I want to hire' },
          ]).map(o => (
            <button key={o.r} type="button" onClick={() => setRole(o.r)}
              className={`rounded-2xl border p-4 text-left transition ${role === o.r ? 'border-violet/60 bg-violet/10 shadow-lg shadow-violet/10' : 'border-lined bg-surface hover:border-violet/30'}`}>
              <span className={role === o.r ? 'text-violet2' : 'text-muted'}>{o.icon}</span>
              <p className="mt-2 text-sm font-semibold text-white">{o.label}</p>
              <p className="text-[11px] text-muted">{o.sub}</p>
            </button>
          ))}
        </div>
        <Field label="Full name">
          <input className={inputCls} required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
        </Field>
        {role === 'client' && (
          <Field label="Company (optional)">
            <input className={inputCls} value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc." />
          </Field>
        )}
        <Field label="Email">
          <input className={inputCls} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password" hint="At least 6 characters. Hashed before storage.">
          <input className={inputCls} type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <button type="submit" disabled={loading} className={btnPrimary + ' w-full'}>
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <>Create account <ArrowRight size={15} /></>}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">Already a member? <Link to="/login" className="text-cyan2 hover:underline">Log in</Link></p>
    </Shell>
  );
}

export function ForgotPassword() {
  const { resetPassword } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    const err = resetPassword(email, password);
    if (err) setError(err);
    else { setError(''); setDone(true); }
  };

  return (
    <Shell title="Reset password" sub="Enter your email and choose a new password">
      {done ? (
        <div className="text-center">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-success" />
          <p className="text-sm text-silver">Your password has been reset successfully.</p>
          <Link to="/login" className={btnPrimary + ' mt-6 w-full'}>Back to login</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email">
            <input className={inputCls} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="New password">
            <input className={inputCls} type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <button type="submit" className={btnPrimary + ' w-full'}><KeyRound size={15} /> Reset password</button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-muted"><Link to="/login" className="text-cyan2 hover:underline">Back to login</Link></p>
    </Shell>
  );
}
