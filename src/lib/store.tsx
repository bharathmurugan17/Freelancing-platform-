/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type {
  DB, User, Role, FreelancerProfile, Project, Application, Message,
  AppNotification, NotificationType,
} from './types';
import { buildSeed } from './seed';
import { uid, hash, avatarFor } from './utils';

const DB_KEY = 'freelancehub_db_v1';
const SESSION_KEY = 'freelancehub_session_v1';

function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const seed = buildSeed();
  localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
}

interface StoreCtx {
  db: DB;
  user: User | null;
  // auth
  register: (name: string, email: string, password: string, role: Role, company?: string) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => string | null;
  // profile
  getProfile: (userId: string) => FreelancerProfile | undefined;
  updateProfile: (p: FreelancerProfile) => void;
  updateAvatar: (dataUrl: string) => void;
  // projects
  createProject: (p: Omit<Project, 'id' | 'clientId' | 'status' | 'selectedFreelancerIds' | 'createdAt'>) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  completeProject: (id: string) => void;
  // applications
  apply: (projectId: string, proposal: string, expectedBudget: number, estimatedTime: string) => void;
  decideApplication: (appId: string, decision: 'accepted' | 'rejected') => void;
  // saved
  toggleSave: (projectId: string) => void;
  isSaved: (projectId: string) => boolean;
  // messages
  sendMessage: (projectId: string, receiverId: string, text: string, fileName?: string) => void;
  // notifications
  markAllRead: () => void;
  markRead: (id: string) => void;
  // reviews
  addReview: (freelancerId: string, rating: number, text: string) => void;
}

const Ctx = createContext<StoreCtx>(null as unknown as StoreCtx);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(loadDB);
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));

  useEffect(() => { localStorage.setItem(DB_KEY, JSON.stringify(db)); }, [db]);
  useEffect(() => {
    if (userId) localStorage.setItem(SESSION_KEY, userId);
    else localStorage.removeItem(SESSION_KEY);
  }, [userId]);

  const user = db.users.find(u => u.id === userId) ?? null;

  const notify = (d: DB, targetUserId: string, type: NotificationType, text: string, link: string): DB => ({
    ...d,
    notifications: [
      { id: uid(), userId: targetUserId, type, text, link, read: false, createdAt: Date.now() },
      ...d.notifications,
    ],
  });

  const register: StoreCtx['register'] = (name, email, password, role, company) => {
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) return 'An account with this email already exists.';
    const nu: User = { id: uid(), name, email, passwordHash: hash(password), role, avatar: avatarFor(name), company, createdAt: Date.now() };
    setDb(d => {
      let next: DB = { ...d, users: [...d.users, nu] };
      if (role === 'freelancer') {
        next = {
          ...next,
          profiles: [...next.profiles, {
            userId: nu.id, title: '', bio: '', location: '', skills: [], hourlyRate: 0,
            availability: '', github: '', linkedin: '', website: '', resumeSummary: '',
            education: [], experience: [], certifications: [], portfolio: [], completedProjects: [], reviews: [],
          }],
        };
      }
      next = notify(next, nu.id, 'system', `Welcome to FreelanceHub, ${name.split(' ')[0]}! ${role === 'freelancer' ? 'Complete your profile to start applying.' : 'Post your first project to find talent.'}`, role === 'freelancer' ? '/freelancer/profile' : '/client/post');
      return next;
    });
    setUserId(nu.id);
    return null;
  };

  const login: StoreCtx['login'] = (email, password) => {
    const u = db.users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u || u.passwordHash !== hash(password)) return 'Invalid email or password.';
    setUserId(u.id);
    return null;
  };

  const logout = () => setUserId(null);

  const resetPassword: StoreCtx['resetPassword'] = (email, newPassword) => {
    const u = db.users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return 'No account found with that email.';
    setDb(d => ({ ...d, users: d.users.map(x => x.id === u.id ? { ...x, passwordHash: hash(newPassword) } : x) }));
    return null;
  };

  const getProfile = (id: string) => db.profiles.find(p => p.userId === id);

  const updateProfile = (p: FreelancerProfile) =>
    setDb(d => ({ ...d, profiles: d.profiles.map(x => x.userId === p.userId ? p : x) }));

  const updateAvatar = (dataUrl: string) => {
    if (!user) return;
    setDb(d => ({ ...d, users: d.users.map(u => u.id === user.id ? { ...u, avatar: dataUrl } : u) }));
  };

  const createProject: StoreCtx['createProject'] = (p) => {
    const np: Project = { ...p, id: uid(), clientId: user!.id, status: 'open', selectedFreelancerIds: [], createdAt: Date.now() };
    setDb(d => ({ ...d, projects: [np, ...d.projects] }));
    return np;
  };

  const updateProject = (id: string, patch: Partial<Project>) =>
    setDb(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, ...patch } : p) }));

  const deleteProject = (id: string) =>
    setDb(d => ({
      ...d,
      projects: d.projects.filter(p => p.id !== id),
      applications: d.applications.filter(a => a.projectId !== id),
      saved: d.saved.filter(s => s.projectId !== id),
    }));

  const completeProject = (id: string) =>
    setDb(d => {
      const proj = d.projects.find(p => p.id === id);
      let next: DB = { ...d, projects: d.projects.map(p => p.id === id ? { ...p, status: 'completed' as const } : p) };
      if (proj) {
        for (const fid of proj.selectedFreelancerIds) {
          next = notify(next, fid, 'completed', `Project “${proj.title}” has been marked as completed. Great work!`, '/freelancer');
        }
      }
      return next;
    });

  const apply: StoreCtx['apply'] = (projectId, proposal, expectedBudget, estimatedTime) => {
    if (!user) return;
    const app: Application = { id: uid(), projectId, freelancerId: user.id, proposal, expectedBudget, estimatedTime, status: 'pending', createdAt: Date.now() };
    setDb(d => {
      const proj = d.projects.find(p => p.id === projectId);
      let next: DB = { ...d, applications: [app, ...d.applications] };
      if (proj) next = notify(next, proj.clientId, 'application', `${user.name} applied to “${proj.title}”`, `/client/projects/${proj.id}/applicants`);
      return next;
    });
  };

  const decideApplication: StoreCtx['decideApplication'] = (appId, decision) => {
    setDb(d => {
      const app = d.applications.find(a => a.id === appId);
      if (!app) return d;
      const proj = d.projects.find(p => p.id === app.projectId);
      let next: DB = {
        ...d,
        applications: d.applications.map(a => a.id === appId ? { ...a, status: decision } : a),
      };
      if (proj && decision === 'accepted') {
        next = {
          ...next,
          projects: next.projects.map(p => p.id === proj.id
            ? { ...p, status: 'in_progress' as const, selectedFreelancerIds: [...new Set([...p.selectedFreelancerIds, app.freelancerId])] }
            : p),
        };
        next = notify(next, app.freelancerId, 'accepted', `🎉 Your application for “${proj.title}” was accepted! You can now chat with the client.`, '/messages');
      } else if (proj) {
        next = notify(next, app.freelancerId, 'rejected', `Your application for “${proj.title}” was not selected this time.`, '/freelancer/applications');
      }
      return next;
    });
  };

  const toggleSave = (projectId: string) => {
    if (!user) return;
    setDb(d => {
      const exists = d.saved.some(s => s.userId === user.id && s.projectId === projectId);
      return {
        ...d,
        saved: exists
          ? d.saved.filter(s => !(s.userId === user.id && s.projectId === projectId))
          : [...d.saved, { userId: user.id, projectId }],
      };
    });
  };

  const isSaved = (projectId: string) => !!user && db.saved.some(s => s.userId === user.id && s.projectId === projectId);

  const sendMessage: StoreCtx['sendMessage'] = (projectId, receiverId, text, fileName) => {
    if (!user) return;
    const msg: Message = { id: uid(), projectId, senderId: user.id, receiverId, text, fileName, createdAt: Date.now() };
    setDb(d => notify({ ...d, messages: [...d.messages, msg] }, receiverId, 'message', `New message from ${user.name}`, '/messages'));
  };

  const markAllRead = () => {
    if (!user) return;
    setDb(d => ({ ...d, notifications: d.notifications.map(n => n.userId === user.id ? { ...n, read: true } : n) }));
  };

  const markRead = (id: string) =>
    setDb(d => ({ ...d, notifications: d.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));

  const addReview: StoreCtx['addReview'] = (freelancerId, rating, text) => {
    if (!user) return;
    setDb(d => ({
      ...d,
      profiles: d.profiles.map(p => p.userId === freelancerId
        ? { ...p, reviews: [{ id: uid(), clientId: user.id, clientName: user.name, rating, text, createdAt: Date.now() }, ...p.reviews] }
        : p),
    }));
  };

  return (
    <Ctx.Provider value={{
      db, user, register, login, logout, resetPassword, getProfile, updateProfile, updateAvatar,
      createProject, updateProject, deleteProject, completeProject, apply, decideApplication,
      toggleSave, isSaved, sendMessage, markAllRead, markRead, addReview,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function unreadCount(db: DB, userId: string) {
  return db.notifications.filter(n => n.userId === userId && !n.read).length;
}
