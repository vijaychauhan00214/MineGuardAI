import { type ReactNode } from 'react';

export type StatusColor =
  | 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'orange' | 'emerald' | 'rose';

const colorMap: Record<StatusColor, string> = {
  green: 'bg-green-500/15 text-green-400 border-green-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  gray: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
};

export function Badge({
  children,
  color = 'gray',
  className = '',
}: {
  children: ReactNode;
  color?: StatusColor;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${colorMap[color]} ${className}`}
    >
      {children}
    </span>
  );
}

export function statusColor(status: string): StatusColor {
  const map: Record<string, StatusColor> = {
    active: 'green',
    compliant: 'green',
    completed: 'green',
    resolved: 'green',
    closed: 'gray',
    online: 'green',
    normal: 'green',
    low: 'green',
    suspended: 'red',
    non_compliant: 'red',
    emergency: 'red',
    critical: 'red',
    fatal: 'red',
    severe: 'red',
    offline: 'gray',
    dismissed: 'gray',
    under_review: 'yellow',
    pending_review: 'yellow',
    acknowledged: 'yellow',
    scheduled: 'blue',
    in_progress: 'blue',
    investigating: 'blue',
    warning: 'yellow',
    moderate: 'yellow',
    maintenance: 'orange',
    calibrating: 'orange',
    high: 'orange',
    major: 'orange',
    reported: 'blue',
    minor: 'blue',
    info: 'blue',
    open: 'orange',
    addressed: 'yellow',
  };
  return map[status] ?? 'gray';
}

export function riskLevelColor(level: string): StatusColor {
  const map: Record<string, StatusColor> = {
    low: 'green',
    moderate: 'yellow',
    high: 'orange',
    critical: 'red',
  };
  return map[level] ?? 'gray';
}

export function severityColor(severity: string): StatusColor {
  const map: Record<string, StatusColor> = {
    info: 'blue',
    warning: 'yellow',
    critical: 'orange',
    emergency: 'red',
    minor: 'blue',
    major: 'orange',
    observation: 'gray',
  };
  return map[severity] ?? 'gray';
}

export function formatDate(date: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: string | null): string {
  if (!date) return '—';
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function formatCurrency(value: number): string {
  if (value >= 100000) return `$${(value / 100000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}
