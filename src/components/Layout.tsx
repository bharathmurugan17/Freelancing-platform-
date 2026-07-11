import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, LogOut, Hexagon, MessageSquare, LayoutDashboard, Search, Bookmark, FileText, Users, PlusCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore, unreadCount } from '../lib/store';
import { timeAgo } from '../lib/utils';

export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet to-cyan">
        <Hexagon size={17} className="text-white" strokeWidth={2.5} />
      </span>
      <span className={`font-display font-bold text-white ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
        Freelance<span className="grad-text">Hub</span>
      </span>
    </Link>
  );
}

function NotifBell() {
  const { db, user, markAllRead, markRead } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) return null;
  const notifs = db.notifications.filter(n => n.userId === user.id).slice(0, 12);
  const unread = unreadCount(db, user.id);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="relative rounded-xl border border-lined bg-card p-2.5 text-muted transition hover:border-violet/40 hover:text-white" aria-label="Notifications">
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-gradient-to-r from-violet to-cyan px-1 text-[10px] font-bold text-white">{unread}</span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .97 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-lined bg-card shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-lined px-4 py-3">
              <span className="font-display text-sm font-bold text-white">Notifications</span>
              {unread > 0 && <button onClick={markAllRead} className="text-xs text-cyan2 hover:underline">Mark all read</button>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifs.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</p>}
              {notifs.map(n => (
                <button key={n.id} onClick={() => { markRead(n.id); setOpen(false); navigate(n.link); }}
                  className={`block w-full border-b border-lined/50 px-4 py-3 text-left transition hover:bg-white/[.03] ${!n.read ? 'bg-violet/[.06]' : ''}`}>
                  <p className="text-[13px] leading-snug text-silver">{n.text}</p>
                  <p className="mt-1 text-[11px] text-muted">{timeAgo(n.createdAt)}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useStore();
  const [mobile, setMobile] = useState(false);
  const navigate = useNavigate();

  const links = user?.role === 'freelancer'
    ? [
        { to: '/freelancer', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { to: '/browse', label: 'Browse Projects', icon: <Search size={16} /> },
        { to: '/freelancer/applications', label: 'Applications', icon: <FileText size={16} /> },
        { to: '/freelancer/saved', label: 'Saved', icon: <Bookmark size={16} /> },
        { to: '/messages', label: 'Messages', icon: <MessageSquare size={16} /> },
      ]
    : user?.role === 'client'
    ? [
        { to: '/client', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { to: '/client/post', label: 'Post Project', icon: <PlusCircle size={16} /> },
        { to: '/talent', label: 'Find Talent', icon: <Users size={16} /> },
        { to: '/messages', label: 'Messages', icon: <MessageSquare size={16} /> },
      ]
    : [
        { to: '/browse', label: 'Browse Projects', icon: <Search size={16} /> },
        { to: '/talent', label: 'Find Talent', icon: <Users size={16} /> },
      ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-lined bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/freelancer' || l.to === '/client'}
                className={({ isActive }) => `flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition ${isActive ? 'bg-violet/15 text-white' : 'text-muted hover:bg-white/[.04] hover:text-white'}`}>
                {l.icon}{l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                <NotifBell />
                <Link to={user.role === 'freelancer' ? '/freelancer/profile' : '/client'} className="flex items-center gap-2 rounded-xl border border-lined bg-card py-1.5 pl-1.5 pr-3 transition hover:border-violet/40">
                  <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-lg object-cover" />
                  <span className="hidden text-sm font-medium text-white sm:block">{user.name.split(' ')[0]}</span>
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="hidden rounded-xl border border-lined bg-card p-2.5 text-muted transition hover:border-danger/40 hover:text-danger sm:block" title="Logout">
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-silver transition hover:text-white">Log in</Link>
                <Link to="/register" className="rounded-xl bg-gradient-to-r from-violet to-cyan px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet/25 transition hover:brightness-110">Sign up</Link>
              </>
            )}
            <button className="rounded-xl border border-lined bg-card p-2.5 text-muted lg:hidden" onClick={() => setMobile(m => !m)} aria-label="Menu">
              {mobile ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobile && (
            <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-lined bg-surface lg:hidden">
              <div className="space-y-1 p-3">
                {links.map(l => (
                  <NavLink key={l.to} to={l.to} onClick={() => setMobile(false)}
                    className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-violet/15 text-white' : 'text-muted'}`}>
                    {l.icon}{l.label}
                  </NavLink>
                ))}
                {user && (
                  <button onClick={() => { logout(); setMobile(false); navigate('/'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-danger">
                    <LogOut size={16} /> Logout
                  </button>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-lined bg-surface/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} FreelanceHub — Where great work finds great talent.</p>
        </div>
      </footer>
    </div>
  );
}
