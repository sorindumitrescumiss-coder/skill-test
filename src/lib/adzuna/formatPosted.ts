export function formatPostedAt(isoDate: string): string {
  const created = new Date(isoDate);
  if (Number.isNaN(created.getTime())) return 'Recently';

  const diffMs = Date.now() - created.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;

  return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
