import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-gray-700/50 bg-gray-800/40 backdrop-blur-sm ${onClick ? 'cursor-pointer hover:border-gray-600/70 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-700/40 px-5 py-4">
      <div className="flex items-center gap-3">
        {icon && <div className="text-gray-400">{icon}</div>}
        <div>
          <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-red-400">
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon,
}: {
  title: string;
  message?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      {icon && <div className="mb-3 opacity-50">{icon}</div>}
      <p className="text-sm font-medium text-gray-300">{title}</p>
      {message && <p className="text-xs mt-1">{message}</p>}
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = 'cyan',
  className = '',
}: {
  value: number;
  max?: number;
  color?: 'cyan' | 'green' | 'yellow' | 'orange' | 'red';
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors: Record<string, string> = {
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-gray-700/50 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${colors[color]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = 'cyan',
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  color?: 'cyan' | 'green' | 'yellow' | 'orange' | 'red' | 'blue';
}) {
  const colorMap: Record<string, string> = {
    cyan: 'text-cyan-400 bg-cyan-500/10',
    green: 'text-green-400 bg-green-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    red: 'text-red-400 bg-red-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-100">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </Card>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const sizeMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeMap[size]} max-h-[90vh] overflow-y-auto rounded-xl border border-gray-700/60 bg-gray-900 shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-gray-700/50 px-5 py-4 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-base font-semibold text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
