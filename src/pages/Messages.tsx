import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, MessageSquare, FileText } from 'lucide-react';
import { useStore } from '../lib/store';
import { timeAgo } from '../lib/utils';
import { Empty } from '../components/ui';

interface Thread { projectId: string; otherUserId: string; }

export default function Messages() {
  const { db, user, sendMessage } = useStore();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const threads = useMemo<Thread[]>(() => {
    if (!user) return [];
    const list: Thread[] = [];
    for (const p of db.projects) {
      if (p.status === 'open') continue;
      if (user.role === 'client' && p.clientId === user.id) {
        for (const fid of p.selectedFreelancerIds) list.push({ projectId: p.id, otherUserId: fid });
      } else if (user.role === 'freelancer' && p.selectedFreelancerIds.includes(user.id)) {
        list.push({ projectId: p.id, otherUserId: p.clientId });
      }
    }
    return list;
  }, [db.projects, user]);

  const active = threads.find(t => `${t.projectId}:${t.otherUserId}` === activeKey) ?? threads[0];
  const activeMsgs = useMemo(() => active
    ? db.messages.filter(m => m.projectId === active.projectId &&
        ((m.senderId === user?.id && m.receiverId === active.otherUserId) || (m.senderId === active.otherUserId && m.receiverId === user?.id)))
        .sort((a, b) => a.createdAt - b.createdAt)
    : [], [db.messages, active, user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeMsgs.length, active?.projectId]);

  if (!user) return null;

  const send = (fileName?: string) => {
    if (!active) return;
    if (!fileName && !text.trim()) return;
    sendMessage(active.projectId, active.otherUserId, fileName ? (text.trim() || 'Shared a file') : text.trim(), fileName);
    setText('');
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) send(f.name);
    e.target.value = '';
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 font-display text-3xl font-bold text-white">Messages</h1>
      <p className="mb-8 text-sm text-muted">Private project chats with your {user.role === 'client' ? 'hired freelancers' : 'clients'}.</p>

      {threads.length === 0 ? (
        <Empty icon={<MessageSquare size={32} />} title="No conversations yet"
          sub={user.role === 'client' ? 'Once you hire a freelancer, your private chat will appear here.' : 'When a client accepts your application, you can chat here.'} />
      ) : (
        <div className="grid h-[calc(100vh-18rem)] min-h-[480px] overflow-hidden rounded-2xl border border-lined bg-card md:grid-cols-[280px_1fr]">
          {/* thread list */}
          <div className="hidden overflow-y-auto border-r border-lined md:block">
            {threads.map(t => {
              const other = db.users.find(u => u.id === t.otherUserId);
              const proj = db.projects.find(p => p.id === t.projectId);
              const key = `${t.projectId}:${t.otherUserId}`;
              const isActive = active && `${active.projectId}:${active.otherUserId}` === key;
              const last = db.messages.filter(m => m.projectId === t.projectId).slice(-1)[0];
              return (
                <button key={key} onClick={() => setActiveKey(key)}
                  className={`flex w-full items-center gap-3 border-b border-lined/50 px-4 py-3.5 text-left transition ${isActive ? 'bg-violet/10' : 'hover:bg-white/[.03]'}`}>
                  <img src={other?.avatar} alt="" className="h-10 w-10 rounded-xl border border-lined" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{other?.name}</p>
                    <p className="truncate text-[11px] text-muted">{proj?.title}</p>
                    {last && <p className="mt-0.5 truncate text-[11px] text-muted/70">{last.text}</p>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* mobile thread select */}
          <div className="border-b border-lined p-3 md:hidden">
            <select className="w-full rounded-xl border border-lined bg-surface px-3 py-2 text-sm text-silver"
              value={active ? `${active.projectId}:${active.otherUserId}` : ''}
              onChange={e => setActiveKey(e.target.value)}>
              {threads.map(t => {
                const other = db.users.find(u => u.id === t.otherUserId);
                const proj = db.projects.find(p => p.id === t.projectId);
                return <option key={`${t.projectId}:${t.otherUserId}`} value={`${t.projectId}:${t.otherUserId}`}>{other?.name} — {proj?.title}</option>;
              })}
            </select>
          </div>

          {/* chat pane */}
          {active && (
            <div className="flex min-h-0 flex-col">
              <div className="flex items-center gap-3 border-b border-lined px-5 py-3.5">
                <img src={db.users.find(u => u.id === active.otherUserId)?.avatar} alt="" className="h-9 w-9 rounded-xl border border-lined" />
                <div>
                  <p className="text-sm font-semibold text-white">{db.users.find(u => u.id === active.otherUserId)?.name}</p>
                  <p className="text-[11px] text-muted">{db.projects.find(p => p.id === active.projectId)?.title}</p>
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {activeMsgs.length === 0 && <p className="py-10 text-center text-sm text-muted">Say hello and kick off the project! 👋</p>}
                {activeMsgs.map(m => {
                  const mine = m.senderId === user.id;
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${mine ? 'rounded-br-md bg-gradient-to-r from-violet to-violet/80 text-white' : 'rounded-bl-md border border-lined bg-surface text-silver'}`}>
                        {m.fileName && (
                          <span className={`mb-1.5 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${mine ? 'bg-white/15' : 'bg-card2'}`}>
                            <FileText size={13} /> {m.fileName}
                          </span>
                        )}
                        <p className="leading-relaxed">{m.text}</p>
                        <p className={`mt-1 text-[10px] ${mine ? 'text-white/60' : 'text-muted'}`}>{timeAgo(m.createdAt)}</p>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="flex items-center gap-2 border-t border-lined p-3.5">
                <button onClick={() => fileRef.current?.click()} className="rounded-xl border border-lined bg-surface p-2.5 text-muted transition hover:border-cyan/40 hover:text-cyan2" title="Attach file">
                  <Paperclip size={16} />
                </button>
                <input ref={fileRef} type="file" className="hidden" onChange={onFile} />
                <input value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') send(); }}
                  placeholder="Type a message…"
                  className="flex-1 rounded-xl border border-lined bg-surface px-4 py-2.5 text-sm text-silver outline-none transition focus:border-violet/60 placeholder:text-muted/50" />
                <button onClick={() => send()} disabled={!text.trim()}
                  className="rounded-xl bg-gradient-to-r from-violet to-cyan p-2.5 text-white shadow-lg shadow-violet/25 transition hover:brightness-110 disabled:opacity-40">
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
