import { type ReactNode } from 'react';
import {
  LayoutDashboard, Mountain, Activity, ShieldCheck, BellRing,
  ClipboardCheck, AlertTriangle, BrainCircuit, Menu, X,
} from 'lucide-react';

export type PageKey =
  | 'dashboard' | 'mines' | 'sensors' | 'compliance'
  | 'alerts' | 'inspections' | 'incidents' | 'ai-insights';

export const navItems: { key: PageKey; label: string; icon: ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { key: 'mines', label: 'Mines', icon: <Mountain className="h-5 w-5" /> },
  { key: 'sensors', label: 'Sensors', icon: <Activity className="h-5 w-5" /> },
  { key: 'compliance', label: 'Compliance', icon: <ShieldCheck className="h-5 w-5" /> },
  { key: 'alerts', label: 'Alerts', icon: <BellRing className="h-5 w-5" /> },
  { key: 'inspections', label: 'Inspections', icon: <ClipboardCheck className="h-5 w-5" /> },
  { key: 'incidents', label: 'Incidents', icon: <AlertTriangle className="h-5 w-5" /> },
  { key: 'ai-insights', label: 'AI Insights', icon: <BrainCircuit className="h-5 w-5" /> },
];

export function Layout({
  currentPage,
  onNavigate,
  children,
  alertCount,
  sidebarOpen,
  setSidebarOpen,
}: {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
  alertCount: number;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const currentLabel = navItems.find((n) => n.key === currentPage)?.label ?? '';

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-800/60 bg-gray-900/95 backdrop-blur-md transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-gray-800/60 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Mountain className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-100 leading-tight">MineGuard AI</p>
            <p className="text-[10px] text-gray-500 leading-tight">Governance & Compliance</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1 text-gray-400 hover:bg-gray-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  setSidebarOpen(false);
                }}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-400 border-l-2 border-cyan-500'
                    : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 border-l-2 border-transparent'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}>
                  {item.icon}
                </span>
                {item.label}
                {item.key === 'alerts' && alertCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-800/60 p-4">
          <div className="rounded-lg bg-gray-800/50 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs font-medium text-gray-300">System Online</p>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">AI monitoring engine active</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-800/60 bg-gray-900/80 backdrop-blur-md px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-100">{currentLabel}</h1>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Real-time monitoring
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
                GA
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-gray-200 leading-tight">Gov. Admin</p>
                <p className="text-[10px] text-gray-500 leading-tight">DGMS Authority</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
