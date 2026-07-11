export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const hash = (pwd: string) => btoa('fh$' + pwd); // mock hash — swap for bcrypt server-side

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

export const money = (n: number) => '$' + n.toLocaleString();

export const avatarFor = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=1e1b4b,312e81,4c1d95`;

export const initials = (name: string) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const avgRating = (reviews: { rating: number }[]) =>
  reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
