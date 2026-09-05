import { useEffect, useState } from 'react';
import {
  Mountain, MapPin, Users, Calendar, Layers, Search, User,
  Activity, ShieldCheck, AlertTriangle, BrainCircuit,
} from 'lucide-react';
import {
  supabase, type Mine, type Sensor, type ComplianceItem,
  type Alert, type RiskAssessment, type Worker,
} from '@/lib/supabase';
import { Badge, statusColor, formatDate } from '@/components/ui/Badge';
import { Card, CardHeader, LoadingSpinner, EmptyState, Modal } from '@/components/ui';

export function Mines() {
  const [mines, setMines] = useState<Mine[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [compliance, setCompliance] = useState<ComplianceItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMine, setSelectedMine] = useState<Mine | null>(null);

  useEffect(() => {
    async function load() {
      const [m, s, c, a, r, w] = await Promise.all([
        supabase.from('mines').select('*').order('name'),
        supabase.from('sensors').select('*'),
        supabase.from('compliance_items').select('*'),
        supabase.from('alerts').select('*'),
        supabase.from('risk_assessments').select('*').order('assessed_at', { ascending: false }),
        supabase.from('workers').select('*'),
      ]);
      setMines(m.data ?? []);
      setSensors(s.data ?? []);
      setCompliance(c.data ?? []);
      setAlerts(a.data ?? []);
      setRisks(r.data ?? []);
      setWorkers(w.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading mines..." />;

  const filtered = mines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase()) ||
      m.region.toLowerCase().includes(search.toLowerCase())
  );

  const latestRiskByMine = new Map<string, RiskAssessment>();
  risks.forEach((r) => { if (!latestRiskByMine.has(r.mine_id)) latestRiskByMine.set(r.mine_id, r); });

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mines by name, location, or region..."
            className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 py-2 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
        <span className="text-xs text-gray-400">{filtered.length} mine{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Mine cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mine) => {
          const mineSensors = sensors.filter((s) => s.mine_id === mine.id);
          const mineCompliance = compliance.filter((c) => c.mine_id === mine.id);
          const mineAlerts = alerts.filter((a) => a.mine_id === mine.id && a.status === 'active');
          const mineWorkers = workers.filter((w) => w.mine_id === mine.id);
          const risk = latestRiskByMine.get(mine.id);

          return (
            <Card key={mine.id} className="overflow-hidden hover:border-cyan-500/30 transition-all" onClick={() => setSelectedMine(mine)}>
              <div className="relative h-24 bg-gradient-to-br from-gray-700/40 to-gray-800/60">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mountain className="h-5 w-5 text-cyan-400" />
                      <h3 className="text-base font-semibold text-gray-100">{mine.name}</h3>
                    </div>
                    <Badge color={statusColor(mine.status)}>{mine.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {mine.location}
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-gray-800/40 py-2">
                    <Activity className="h-3.5 w-3.5 text-cyan-400 mx-auto" />
                    <p className="text-sm font-bold text-gray-100 mt-1">{mineSensors.length}</p>
                    <p className="text-[10px] text-gray-500">Sensors</p>
                  </div>
                  <div className="rounded-lg bg-gray-800/40 py-2">
                    <Users className="h-3.5 w-3.5 text-blue-400 mx-auto" />
                    <p className="text-sm font-bold text-gray-100 mt-1">{mine.total_workers}</p>
                    <p className="text-[10px] text-gray-500">Workers</p>
                  </div>
                  <div className="rounded-lg bg-gray-800/40 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-orange-400 mx-auto" />
                    <p className="text-sm font-bold text-gray-100 mt-1">{mineAlerts.length}</p>
                    <p className="text-[10px] text-gray-500">Alerts</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Manager: <span className="text-gray-300">{mine.manager_name}</span></span>
                </div>

                {risk && (
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">AI Risk:</span>
                    <span className={`text-xs font-bold ${risk.risk_level === 'low' ? 'text-green-400' : risk.risk_level === 'moderate' ? 'text-yellow-400' : risk.risk_level === 'high' ? 'text-orange-400' : 'text-red-400'}`}>
                      {risk.overall_risk_score}/100
                    </span>
                    <Badge color={risk.risk_level === 'low' ? 'green' : risk.risk_level === 'moderate' ? 'yellow' : risk.risk_level === 'high' ? 'orange' : 'red'}>
                      {risk.risk_level}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState title="No mines found" message="Try adjusting your search" icon={<Mountain className="h-10 w-10" />} />
      )}

      {/* Mine detail modal */}
      <Modal open={!!selectedMine} onClose={() => setSelectedMine(null)} title={selectedMine?.name ?? ''} size="lg">
        {selectedMine && (() => {
          const mineSensors = sensors.filter((s) => s.mine_id === selectedMine.id);
          const mineCompliance = compliance.filter((c) => c.mine_id === selectedMine.id);
          const mineAlerts = alerts.filter((a) => a.mine_id === selectedMine.id);
          const mineRisk = latestRiskByMine.get(selectedMine.id);
          const mineWorkers = workers.filter((w) => w.mine_id === selectedMine.id);
          const complianceRate = mineCompliance.length > 0
            ? Math.round((mineCompliance.filter((c) => c.status === 'compliant').length / mineCompliance.length) * 100)
            : 0;

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InfoBox icon={<MapPin className="h-4 w-4" />} label="Location" value={selectedMine.location} />
                <InfoBox icon={<Mountain className="h-4 w-4" />} label="Region" value={selectedMine.region} />
                <InfoBox icon={<User className="h-4 w-4" />} label="Manager" value={selectedMine.manager_name} />
                <InfoBox icon={<Users className="h-4 w-4" />} label="Workers" value={String(selectedMine.total_workers)} />
                <InfoBox icon={<Calendar className="h-4 w-4" />} label="Established" value={formatDate(selectedMine.established_date)} />
                <InfoBox icon={<Layers className="h-4 w-4" />} label="Area" value={`${selectedMine.area_sqkm} km²`} />
                <InfoBox icon={<Activity className="h-4 w-4" />} label="Sensors" value={String(mineSensors.length)} />
                <InfoBox icon={<ShieldCheck className="h-4 w-4" />} label="Compliance" value={`${complianceRate}%`} />
              </div>

              {mineRisk && (
                <div className="rounded-lg border border-gray-700/40 bg-gray-800/40 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit className="h-4 w-4 text-cyan-400" />
                    <p className="text-sm font-semibold text-gray-200">AI Risk Assessment</p>
                    <Badge color={mineRisk.risk_level === 'low' ? 'green' : mineRisk.risk_level === 'moderate' ? 'yellow' : mineRisk.risk_level === 'high' ? 'orange' : 'red'}>
                      {mineRisk.risk_level} ({mineRisk.overall_risk_score})
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">{mineRisk.assessment_summary}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-200 mb-2">Recent Alerts</p>
                <div className="space-y-2">
                  {mineAlerts.slice(0, 4).map((alert) => (
                    <div key={alert.id} className="flex items-center gap-2 rounded-lg bg-gray-800/30 p-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                      <span className="text-xs text-gray-300 flex-1 truncate">{alert.title}</span>
                      <Badge color={severityColor(alert.severity)}>{alert.severity}</Badge>
                    </div>
                  ))}
                  {mineAlerts.length === 0 && <p className="text-xs text-gray-500">No active alerts</p>}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-200 mb-2">Workforce</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mineWorkers.slice(0, 6).map((w) => (
                    <div key={w.id} className="flex items-center gap-2 rounded-lg bg-gray-800/30 p-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-400">
                        {w.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-200 truncate">{w.name}</p>
                        <p className="text-[10px] text-gray-500">{w.role}</p>
                      </div>
                      <Badge color={statusColor(w.status)}>{w.status.replace('_', ' ')}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

function InfoBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-800/40 p-3">
      <div className="flex items-center gap-1.5 text-gray-400">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-200 mt-1">{value}</p>
    </div>
  );
}

function severityColor(severity: string) {
  const map: Record<string, 'blue' | 'yellow' | 'orange' | 'red'> = {
    info: 'blue', warning: 'yellow', critical: 'orange', emergency: 'red',
  };
  return map[severity] ?? 'gray';
}
