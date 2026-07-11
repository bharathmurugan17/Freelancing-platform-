import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useStore } from '../../lib/store';
import ProjectCard from '../../components/ProjectCard';
import { Empty, btnPrimary } from '../../components/ui';

export default function Saved() {
  const { db, user } = useStore();
  if (!user) return null;
  const savedProjects = db.saved.filter(s => s.userId === user.id)
    .map(s => db.projects.find(p => p.id === s.projectId))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-1 font-display text-3xl font-bold text-white">Saved Jobs</h1>
      <p className="mb-8 text-sm text-muted">Projects you’ve bookmarked for later.</p>
      {savedProjects.length === 0 ? (
        <Empty icon={<Bookmark size={32} />} title="Nothing saved yet" sub="Tap the bookmark icon on any project to save it here."
          action={<Link to="/browse" className={btnPrimary}>Browse Projects</Link>} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {savedProjects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
