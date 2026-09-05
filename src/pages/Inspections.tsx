import { useEffect, useState } from 'react';
import {
  ClipboardCheck, Search, Filter, Calendar, User,
  CheckCircle, Clock, FileText, ChevronRight, ClipboardList,
} from 'lucide-react';
import {
  supabase, type Inspection, type InspectionFinding,
  type Mine, type ComplianceCategory,
} from '@/lib/supabase';
import { Badge, statusColor, formatDate } from '@/components/ui/Badge';
import { Card, LoadingSpinner, EmptyState, Modal, ProgressBar } from '@/components/ui';

export function Inspections() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [findings, setFindings] = useState<InspectionFinding[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Inspection | null>(null);

  useEffect(() => {
    async function load() {
      const [i, f, m] = await Promise.all([
        supabase.from('inspections').select('*').order('scheduled_date', { ascending: false }),
        supabase.from('inspection_findings').select('*'),
        supabase.from('mines').select('*'),
      ]);
      setInspections(i.data ?? []);
      setFindings(f.data ?? []);
      setMines(m.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading inspections..." />;

  const mineName = (id: string) => mines.find((m) => m.id === id)?.name ?? 'Unknown';
  const inspectionFindings = (id: string) => findings.filter((f) => f.inspection_id === id);

  const filtered = inspections.filter((insp) => {
    const matchSearch =
      insp.inspector_name.toLowerCase().includes(search.toLowerCase()) ||
      mineName(insp.mine_id).toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || insp.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const completed = inspections.filter((i) => i.status === 'completed').length;
  const scheduled = inspections.filter((i) => i.status === 'scheduled').length;
  const inProgress = inspections.filter((i) => i.status === 'in_progress').length;
  const avgScore = inspections.filter((i) => i.compliance_score !== null).length > 0
    ? Math.round(inspections.filter((i) => i.compliance_score !== null).reduce((sum, i) => sum + (i.compliance_score ?? 0), 0) / inspections.filter((i) => i.compliance_score !== null).length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3">
          <ClipboardList className="h-4 w-4 text-cyan-400" />
          <p className="text-xl font-bold text-gray-100 mt-1">{inspections.length}</p>
          <p className="text-xs text-gray-400">Total Inspections</p>
        </div>
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <p className="text-xl font-bold text-gray-100 mt-1">{completed}</p>
          <p className="text-xs text-gray-400">Completed</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
          <Clock className="h-4 w-4 text-blue-400" />
          <p className="text-xl font-bold text-gray-100 mt-1">{scheduled + inProgress}</p>
          <p className="text-xs text-gray-400">Scheduled/Active</p>
        </div>
        <div className="rounded-lg border border-gray-600/20 bg-gray-700/20 p-3">
          <ClipboardCheck className="h-4 w-4 text-gray-400" />
          <p className="text-xl font-bold text-gray-100 mt-1">{avgScore}%</p>
          <p className="text-xs text-gray-400">Avg Compliance Score</p>
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
            placeholder="Search by inspector or mine..."
            className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 py-2 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 focus:outline-none">
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Inspection cards */}
      <div className="space-y-3">
        {filtered.map((insp) => {
          const inspFindings = inspectionFindings(insp.id);
          const openFindings = inspFindings.filter((f) => f.status === 'open').length;
          return (
            <Card key={insp.id} className="p-4 hover:border-gray-600/60 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0 ${
                  insp.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                  insp.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                  insp.status === 'cancelled' ? 'bg-gray-700/50 text-gray-500' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-200">{mineName(insp.mine_id)}</p>
                    <Badge color={statusColor(insp.status)}>{insp.status.replace('_', ' ')}</Badge>
                    <Badge color="gray">{insp.inspection_type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {insp.inspector_name}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(insp.scheduled_date)}</span>
                    {insp.compliance_score !== null && (
                      <span className="flex items-center gap-1">
                        Score:
                        <span className={`font-bold ${insp.compliance_score >= 80 ? 'text-green-400' : insp.compliance_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {insp.compliance_score}%
                        </span>
                      </span>
                    )}
                    {inspFindings.length > 0 && (
                      <span className="flex items-center gap-1">
                        Findings: {inspFindings.length}
                        {openFindings > 0 && <span className="text-orange-400">({openFindings} open)</span>}
                      </span>
                    )}
                  </div>
                  {insp.findings && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{insp.findings}</p>}
                </div>
                <button
                  onClick={() => setSelected(insp)}
                  className="flex-shrink-0 rounded-lg border border-gray-700/50 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-1"
                >
                  Details <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState title="No inspections found" message="Try adjusting your filters" icon={<Filter className="h-10 w-10" />} />
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Inspection Details" size="lg">
        {selected && (() => {
          const inspFindings = inspectionFindings(selected.id);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-gray-800/40 p-3">
                  <p className="text-[10px] text-gray-400">Mine</p>
                  <p className="text-sm font-medium text-gray-200">{mineName(selected.mine_id)}</p>
                </div>
                <div className="rounded-lg bg-gray-800/40 p-3">
                  <p className="text-[10px] text-gray-400">Inspector</p>
                  <p className="text-sm font-medium text-gray-200">{selected.inspector_name}</p>
                </div>
                <div className="rounded-lg bg-gray-800/40 p-3">
                  <p className="text-[10px] text-gray-400">Type</p>
                  <p className="text-sm font-medium text-gray-200 capitalize">{selected.inspection_type.replace('_', ' ')}</p>
                </div>
                <div className="rounded-lg bg-gray-800/40 p-3">
                  <p className="text-[10px] text-gray-400">Scheduled</p>
                  <p className="text-sm font-medium text-gray-200">{formatDate(selected.scheduled_date)}</p>
                </div>
                <div className="rounded-lg bg-gray-800/40 p-3">
                  <p className="text-[10px] text-gray-400">Completed</p>
                  <p className="text-sm font-medium text-gray-200">{formatDate(selected.completed_date)}</p>
                </div>
                <div className="rounded-lg bg-gray-800/40 p-3">
                  <p className="text-[10px] text-gray-400">Compliance Score</p>
                  <p className={`text-sm font-bold ${selected.compliance_score !== null ? (selected.compliance_score >= 80 ? 'text-green-400' : selected.compliance_score >= 60 ? 'text-yellow-400' : 'text-red-400') : 'text-gray-500'}`}>
                    {selected.compliance_score !== null ? `${selected.compliance_score}%` : '—'}
                  </p>
                </div>
              </div>

              {selected.findings && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Findings Summary</p>
                  <p className="text-sm text-gray-200">{selected.findings}</p>
                </div>
              )}

              {selected.notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-200">{selected.notes}</p>
                </div>
              )}

              {inspFindings.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-200 mb-2">Inspection Findings ({inspFindings.length})</p>
                  <div className="space-y-2">
                    {inspFindings.map((f) => (
                      <div key={f.id} className="rounded-lg border border-gray-700/40 bg-gray-800/30 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-200">{f.finding_description}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Badge color={f.severity === 'critical' ? 'red' : f.severity === 'major' ? 'orange' : f.severity === 'minor' ? 'yellow' : 'gray'}>
                              {f.severity}
                            </Badge>
                            <Badge color={statusColor(f.status)}>{f.status}</Badge>
                          </div>
                        </div>
                        {f.recommended_action && (
                          <p className="text-xs text-gray-400 mt-2 ml-5">→ {f.recommended_action}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
