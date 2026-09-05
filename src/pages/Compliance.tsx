import { useEffect, useState } from 'react';
import {
  ShieldCheck, ShieldX, Clock, Search, Filter,
  FileText, ChevronRight, Calendar, User,
} from 'lucide-react';
import {
  supabase, type ComplianceItem, type ComplianceCategory,
  type Mine, type RiskAssessment,
} from '@/lib/supabase';
import { Badge, statusColor, formatDate } from '@/components/ui/Badge';
import { Card, CardHeader, LoadingSpinner, EmptyState, ProgressBar } from '@/components/ui';

export function Compliance() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [categories, setCategories] = useState<ComplianceCategory[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [mineFilter, setMineFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const [c, cat, m] = await Promise.all([
        supabase.from('compliance_items').select('*').order('created_at', { ascending: false }),
        supabase.from('compliance_categories').select('*'),
        supabase.from('mines').select('*').order('name'),
      ]);
      setItems(c.data ?? []);
      setCategories(cat.data ?? []);
      setMines(m.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading compliance data..." />;

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? 'Uncategorized';
  const mineName = (id: string) => mines.find((m) => m.id === id)?.name ?? 'Unknown';

  const filtered = items.filter((item) => {
    const matchSearch =
      item.regulation_code.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchSeverity = severityFilter === 'all' || item.severity === severityFilter;
    const matchMine = mineFilter === 'all' || item.mine_id === mineFilter;
    return matchSearch && matchStatus && matchSeverity && matchMine;
  });

  const compliant = items.filter((i) => i.status === 'compliant').length;
  const nonCompliant = items.filter((i) => i.status === 'non_compliant').length;
  const pending = items.filter((i) => i.status === 'pending_review').length;
  const rate = items.length > 0 ? Math.round((compliant / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-3xl font-bold text-gray-100">{rate}%</span>
          </div>
          <ProgressBar value={rate} color={rate >= 80 ? 'green' : rate >= 60 ? 'yellow' : 'red'} className="h-2.5" />
          <p className="text-xs text-gray-400 mt-2">Overall Compliance Rate</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-gray-400 mb-3">Compliance Breakdown</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300 flex-1">Compliant</span>
              <span className="text-sm font-bold text-green-400">{compliant}</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldX className="h-4 w-4 text-red-400" />
              <span className="text-sm text-gray-300 flex-1">Non-Compliant</span>
              <span className="text-sm font-bold text-red-400">{nonCompliant}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-300 flex-1">Pending Review</span>
              <span className="text-sm font-bold text-yellow-400">{pending}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-gray-400 mb-3">By Category</p>
          <div className="space-y-2">
            {categories.map((cat) => {
              const catItems = items.filter((i) => i.category_id === cat.id);
              const catRate = catItems.length > 0
                ? Math.round((catItems.filter((i) => i.status === 'compliant').length / catItems.length) * 100)
                : 0;
              return (
                <div key={cat.id} className="flex items-center gap-2">
                  <span className="text-xs text-gray-300 w-24 truncate">{cat.name}</span>
                  <div className="flex-1">
                    <ProgressBar
                      value={catRate}
                      color={catRate >= 80 ? 'green' : catRate >= 50 ? 'yellow' : 'red'}
                      className="h-1.5"
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{catRate}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by regulation code or description..."
            className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 py-2 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
        <select value={mineFilter} onChange={(e) => setMineFilter(e.target.value)} className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 focus:outline-none">
          <option value="all">All Mines</option>
          {mines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 focus:outline-none">
          <option value="all">All Status</option>
          <option value="compliant">Compliant</option>
          <option value="non_compliant">Non-Compliant</option>
          <option value="pending_review">Pending Review</option>
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 focus:outline-none">
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="major">Major</option>
          <option value="minor">Minor</option>
        </select>
      </div>

      {/* Compliance table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/40 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-400">Regulation</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">Mine</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">Category</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">Severity</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">Last Audit</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">Next Audit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-cyan-400">{item.regulation_code}</p>
                        <p className="text-xs text-gray-400 max-w-xs truncate">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">{mineName(item.mine_id)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{categoryName(item.category_id)}</td>
                  <td className="px-4 py-3"><Badge color={item.severity === 'critical' ? 'red' : item.severity === 'major' ? 'orange' : 'blue'}>{item.severity}</Badge></td>
                  <td className="px-4 py-3"><Badge color={statusColor(item.status)}>{item.status.replace('_', ' ')}</Badge></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(item.last_audit_date)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(item.next_audit_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <EmptyState title="No compliance items found" message="Try adjusting your filters" icon={<Filter className="h-10 w-10" />} />
        )}
      </Card>
    </div>
  );
}
