import { useEffect, useState } from 'react';
import {
  AlertTriangle, Search, Filter, Calendar, User, DollarSign,
  Heart, Skull, ChevronRight, Activity,
} from 'lucide-react';
import { supabase, type Incident, type Mine } from '@/lib/supabase';
import { Badge, statusColor, severityColor, formatDateTime, formatDate, formatCurrency } from '@/components/ui/Badge';
import { Card, LoadingSpinner, EmptyState, Modal } from '@/components/ui';

export function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Incident | null>(null);

  useEffect(() => {
    async function load() {
      const [i, m] = await Promise.all([
        supabase.from('incidents').select('*').order('occurred_at', { ascending: false }),
        supabase.from('mines').select('*'),
      ]);
      setIncidents(i.data ?? []);
      setMines(m.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading incidents..." />;

  const mineName = (id: string) => mines.find((m) => m.id === id)?.name ?? 'Unknown';

  const filtered = incidents.filter((inc) => {
    const matchSearch =
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.description.toLowerCase().includes(search.toLowerCase()) ||
      mineName(inc.mine_id).toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    const matchStatus = statusFilter === 'all' || inc.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  const totalCasualties = incidents.reduce((sum, i) => sum + i.casualties, 0);
  const totalInjuries = incidents.reduce((sum, i) => sum + i.injuries, 0);
  const totalLoss = incidents.reduce((sum, i) => sum + i.financial_loss, 0);
  const investigating = incidents.filter((i) => i.status === 'investigating').length;
  const resolved = incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length;

  const incidentIcon = (type: Incident['incident_type']) => {
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-lg border border-gray-600/20 bg-gray-700/20 p-3">
          <Activity className="h-4 w-4 text-gray-400" />
          <p className="text-xl font-bold text-gray-100 mt-1">{incidents.length}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
          <Search className="h-4 w-4 text-blue-400" />
          <p className="text-xl font-bold text-gray-100 mt-1">{investigating}</p>
          <p className="text-xs text-gray-400">Investigating</p>
        </div>
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
          <AlertTriangle className="h-4 w-4 text-green-400" />
          <p className="text-xl font-bold text-gray-100 mt-1">{resolved}</p>
          <p className="text-xs text-gray-400">Resolved</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <Skull className="h-4 w-4 text-red-400" />
          <p className="text-xl font-bold text-gray-100 mt-1">{totalCasualties}</p>
          <p className="text-xs text-gray-400">Casualties</p>
        </div>
        <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
          <Heart className="h-4 w-4 text-orange-400" />
          <p className="text-xl font-bold text-gray-100 mt-1">{totalInjuries}</p>
          <p className="text-xs text-gray-400">Injuries</p>
        </div>
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
          <DollarSign className="h-4 w-4 text-yellow-400" />
          <p className="text-xl font-bold text-gray-100 mt-1">{formatCurrency(totalLoss)}</p>
          <p className="text-xs text-gray-400">Financial Loss</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incidents..."
            className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 py-2 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 focus:outline-none">
          <option value="all">All Severity</option>
          <option value="fatal">Fatal</option>
          <option value="severe">Severe</option>
          <option value="moderate">Moderate</option>
          <option value="minor">Minor</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 focus:outline-none">
          <option value="all">All Status</option>
          <option value="reported">Reported</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Incident list */}
      <div className="space-y-3">
        {filtered.map((inc) => (
          <Card key={inc.id} className="p-4 hover:border-gray-600/60 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                inc.severity === 'fatal' ? 'bg-red-500/15 text-red-400' :
                inc.severity === 'severe' ? 'bg-orange-500/15 text-orange-400' :
                inc.severity === 'moderate' ? 'bg-yellow-500/15 text-yellow-400' :
                'bg-blue-500/15 text-blue-400'
              }`}>
                {incidentIcon(inc.incident_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-200">{inc.title}</p>
                  <Badge color={severityColor(inc.severity)}>{inc.severity}</Badge>
                  <Badge color={statusColor(inc.status)}>{inc.status}</Badge>
                  <Badge color="gray">{inc.incident_type.replace('_', ' ')}</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{inc.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                  <span>{mineName(inc.mine_id)}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(inc.occurred_at)}</span>
                  {inc.casualties > 0 && <span className="text-red-400 flex items-center gap-1"><Skull className="h-3 w-3" /> {inc.casualties} casualty</span>}
                  {inc.injuries > 0 && <span className="text-orange-400 flex items-center gap-1"><Heart className="h-3 w-3" /> {inc.injuries} injured</span>}
                  {inc.financial_loss > 0 && <span className="text-yellow-400 flex items-center gap-1"><DollarSign className="h-3 w-3" /> {formatCurrency(inc.financial_loss)}</span>}
                </div>
              </div>
              <button
                onClick={() => setSelected(inc)}
                className="flex-shrink-0 rounded-lg border border-gray-700/50 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-1"
              >
                Details <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState title="No incidents found" message="Try adjusting your filters" icon={<Filter className="h-10 w-10" />} />
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Incident Report" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                selected.severity === 'fatal' ? 'bg-red-500/15 text-red-400' :
                selected.severity === 'severe' ? 'bg-orange-500/15 text-orange-400' :
                selected.severity === 'moderate' ? 'bg-yellow-500/15 text-yellow-400' :
                'bg-blue-500/15 text-blue-400'
              }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-100">{selected.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge color={severityColor(selected.severity)}>{selected.severity}</Badge>
                  <Badge color={statusColor(selected.status)}>{selected.status}</Badge>
                  <Badge color="gray">{selected.incident_type.replace('_', ' ')}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-gray-800/40 p-3">
                <p className="text-[10px] text-gray-400">Mine</p>
                <p className="text-sm font-medium text-gray-200">{mineName(selected.mine_id)}</p>
              </div>
              <div className="rounded-lg bg-gray-800/40 p-3">
                <p className="text-[10px] text-gray-400">Occurred</p>
                <p className="text-sm font-medium text-gray-200">{formatDateTime(selected.occurred_at)}</p>
              </div>
              <div className="rounded-lg bg-gray-800/40 p-3">
                <p className="text-[10px] text-gray-400">Reported By</p>
                <p className="text-sm font-medium text-gray-200">{selected.reported_by ?? '—'}</p>
              </div>
              <div className="rounded-lg bg-gray-800/40 p-3">
                <p className="text-[10px] text-gray-400">Resolved</p>
                <p className="text-sm font-medium text-gray-200">{formatDateTime(selected.resolved_at)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                <Skull className="h-4 w-4 text-red-400 mx-auto" />
                <p className="text-xl font-bold text-red-400 mt-1">{selected.casualties}</p>
                <p className="text-xs text-gray-400">Casualties</p>
              </div>
              <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3 text-center">
                <Heart className="h-4 w-4 text-orange-400 mx-auto" />
                <p className="text-xl font-bold text-orange-400 mt-1">{selected.injuries}</p>
                <p className="text-xs text-gray-400">Injuries</p>
              </div>
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-center">
                <DollarSign className="h-4 w-4 text-yellow-400 mx-auto" />
                <p className="text-xl font-bold text-yellow-400 mt-1">{formatCurrency(selected.financial_loss)}</p>
                <p className="text-xs text-gray-400">Financial Loss</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-200">{selected.description}</p>
            </div>

            {selected.root_cause && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Root Cause</p>
                <p className="text-sm text-gray-200">{selected.root_cause}</p>
              </div>
            )}

            {selected.corrective_actions && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Corrective Actions</p>
                <p className="text-sm text-gray-200">{selected.corrective_actions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
