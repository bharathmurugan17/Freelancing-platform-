import type { ReactNode } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Badge({ children, tone = 'violet' }: { children: ReactNode; tone?: 'violet' | 'cyan' | 'green' | 'red' | 'gray' | 'amber' }) {
  const tones: Record<string, string> = {
    violet: 'bg-violet/10 text-violet2 border-violet/25',
    cyan: 'bg-cyan/10 text-cyan2 border-cyan/25',
    green: 'bg-success/10 text-success border-success/25',
    red: 'bg-danger/10 text-danger border-danger/25',
    gray: 'bg-white/5 text-muted border-white/10',
    amber: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${tones[tone]}`}>{children}</span>;
}

export function SkillTag({ skill }: { skill: string }) {
  return <span className="rounded-md border border-lined bg-card2 px-2 py-0.5 text-xs text-silver/90">{skill}</span>;
}

export function Rating({ value, size = 14 }: { value: number; size?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) =>
        i < full ? <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
        : i === full && half ? <StarHalf key={i} size={size} fill="currentColor" strokeWidth={0} />
        : <Star key={i} size={size} className="text-white/15" fill="currentColor" strokeWidth={0} />
      )}
    </span>
  );
}

export function StatCard({ label, value, icon, accent = 'violet' }: { label: string; value: string | number; icon: ReactNode; accent?: 'violet' | 'cyan' }) {
  return (
    <div className="card-hover rounded-2xl border border-lined bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
        <span className={accent === 'violet' ? 'text-violet2' : 'text-cyan2'}>{icon}</span>
      </div>
      <div className="mt-2 font-display text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

export function Empty({ icon, title, sub, action }: { icon: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-lined bg-card/50 px-6 py-14 text-center">
      <div className="mb-3 text-muted">{icon}</div>
      <p className="font-display text-lg font-semibold text-white">{title}</p>
      {sub && <p className="mt-1 max-w-sm text-sm text-muted">{sub}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted/70">{hint}</span>}
    </label>
  );
}

export const inputCls = 'w-full rounded-xl border border-lined bg-surface px-3.5 py-2.5 text-sm text-silver outline-none transition focus:border-violet/60 focus:ring-2 focus:ring-violet/20 placeholder:text-muted/50';

export const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet to-cyan px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet/25 transition hover:shadow-violet/40 hover:brightness-110 active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none';
export const btnGhost = 'inline-flex items-center justify-center gap-2 rounded-xl border border-lined bg-card px-5 py-2.5 text-sm font-medium text-silver transition hover:border-violet/40 hover:text-white active:scale-[.98]';
export const btnDanger = 'inline-flex items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/20 active:scale-[.98]';

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ scale: .95, y: 12, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: .95, y: 12, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            className={`max-h-[88vh] w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} overflow-y-auto rounded-2xl border border-lined bg-card p-6 shadow-2xl shadow-violet/10`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">{title}</h3>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted transition hover:bg-white/5 hover:text-white"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: 'violet' | 'cyan' | 'green' | 'red' | 'gray' | 'amber'; label: string }> = {
    open: { tone: 'cyan', label: 'Open' },
    in_progress: { tone: 'violet', label: 'In Progress' },
    completed: { tone: 'green', label: 'Completed' },
    pending: { tone: 'amber', label: 'Pending' },
    accepted: { tone: 'green', label: 'Accepted' },
    rejected: { tone: 'red', label: 'Rejected' },
  };
  const m = map[status] ?? { tone: 'gray' as const, label: status };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
