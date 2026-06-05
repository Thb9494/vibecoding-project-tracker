export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function timeAgo(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return null;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} h ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

export function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}
