import { useEffect, useState, useCallback } from 'react';
import {
  BellRing, AlertTriangle, CheckCircle, Eye, X, Clock,
  Search, Filter, Activity, ShieldX, Settings,
} from 'lucide-react';
import { supabase, type Alert, type Mine, type Sensor } from '@/lib/supabase';
import { Badge, statusColor, severityColor, timeAgo, formatDateTime } from '@/components/ui/Badge';
import { Card, LoadingSpinner, EmptyState, Modal } from '@/components/ui';

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const load = useCallback(async () => {
    const [a, m, s] = await Promise.all([
      supabase.from('alerts').select('*').order('triggered_at', { ascending: false }),
      supabase.from('mines').select('*'),
      supabase.from('sensors').select('*'),
    ]);
    setAlerts(a.data ?? []);
    setMines(m.data ?? []);
    setSensors(s.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateAlert = async (id: string, updates: Partial<Alert>) => {
    await supabase.from('alerts').update(updates).eq('id', id);
    await load();
    setSelectedAlert(null);
  };

  if (loading) return <LoadingSpinner label="Loading alerts..." />;

  const mineName = (id: string) => mines.find((m) => m.id === id)?.name ?? 'Unknown';
  const sensorInfo = (id: string | null) => sensors.find((s) => s.id === id);

  const filtered = alerts.filter((alert) => {
    const matchSearch =
      alert.title.toLowerCase().includes(search.toLowerCase()) ||
      alert.message.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  const active = alerts.filter((a) => a.status === 'active').length;
  const acknowledged = alerts.filter((a) => a.status === 'acknowledged').length;
  const resolved = alerts.filter((a) => a.status === 'resolved').length;

  const alertIcon = (type: Alert['alert_type']) => {
    switch (type) {
      case 'sensor_threshold': return <Activity className="h-4 w-4" />;
      case 'compliance_violation': return <ShieldX className="h-4 w-4" />;
      case 'equipment_failure': return <Settings className="h-4 w-4" />;
      case 'safety_hazard': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <p className="text-xs text-red-400 font-medium">Active</p>
          </div>
          <p className="text-xl font-bold text-gray-100 mt-1">{active}</p>
        </div>
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-yellow-400" />
            <p className="text-xs text-yellow-400 font-medium">Acknowledged</p>
          </div>
          <p className="text-xl font-bold text-gray-100 mt-1">{acknowledged}</p>
        </div>
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <p className="text-xs text-green-400 font-medium">Resolved</p>
          </div>
          <p className="text-xl font-bold text-gray-100 mt-1">{resolved}</p>
        </div>
        <div className="rounded-lg border border-gray-600/20 bg-gray-700/20 p-3">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-gray-400" />
            <p className="text-xs text-gray-400 font-medium">Total</p>
          </div>
          <p className="text-xl font-bold text-gray-100 mt-1">{alerts.length}</p>
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
            placeholder="Search alerts..."
            className="w-full rounded-lg border border-gray-700/50 bg-gray-800/50 py-2 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 focus:outline-none">
          <option value="all">All Severity</option>
          <option value="emergency">Emergency</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-sm text-gray-200 focus:outline-none">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const sensor = sensorInfo(alert.sensor_id);
          return (
            <Card key={alert.id} className="overflow-hidden hover:border-gray-600/60 transition-colors">
              <div className="flex items-start gap-3 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                  alert.severity === 'emergency' ? 'bg-red-500/15 text-red-400' :
                  alert.severity === 'critical' ? 'bg-orange-500/15 text-orange-400' :
                  alert.severity === 'warning' ? 'bg-yellow-500/15 text-yellow-400' :
                  'bg-blue-500/15 text-blue-400'
                }`}>
                  {alertIcon(alert.alert_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-200">{alert.title}</p>
                      <Badge color={severityColor(alert.severity)}>{alert.severity}</Badge>
                      <Badge color={statusColor(alert.status)}>{alert.status}</Badge>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                      <Clock className="h-3 w-3" /> {timeAgo(alert.triggered_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{mineName(alert.mine_id)}</span>
                    {sensor && <span>• {sensor.location_description}</span>}
                    {alert.acknowledged_by && <span>• Ack by: {alert.acknowledged_by}</span>}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(alert)}
                  className="flex-shrink-0 rounded-lg border border-gray-700/50 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Details
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState title="No alerts found" message="All clear — try adjusting your filters" icon={<CheckCircle className="h-10 w-10" />} />
      )}

      {/* Alert detail modal */}
      <Modal open={!!selectedAlert} onClose={() => setSelectedAlert(null)} title="Alert Details" size="md">
        {selectedAlert && (() => {
          const sensor = sensorInfo(selectedAlert.sensor_id);
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  selectedAlert.severity === 'emergency' ? 'bg-red-500/15 text-red-400' :
                  selectedAlert.severity === 'critical' ? 'bg-orange-500/15 text-orange-400' :
                  selectedAlert.severity === 'warning' ? 'bg-yellow-500/15 text-yellow-400' :
                  'bg-blue-500/15 text-blue-400'
                }`}>
                  {alertIcon(selectedAlert.alert_type)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-100">{selectedAlert.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge color={severityColor(selectedAlert.severity)}>{selectedAlert.severity}</Badge>
                    <Badge color={statusColor(selectedAlert.status)}>{selectedAlert.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-800/40 p-4 space-y-2 text-sm">
                <div><span className="text-gray-400 text-xs">Mine:</span> <span className="text-gray-200">{mineName(selectedAlert.mine_id)}</span></div>
                <div><span className="text-gray-400 text-xs">Type:</span> <span className="text-gray-200 capitalize">{selectedAlert.alert_type.replace('_', ' ')}</span></div>
                {sensor && <div><span className="text-gray-400 text-xs">Sensor:</span> <span className="text-gray-200">{sensor.location_description} ({sensor.sensor_type})</span></div>}
                <div><span className="text-gray-400 text-xs">Triggered:</span> <span className="text-gray-200">{formatDateTime(selectedAlert.triggered_at)}</span></div>
                {selectedAlert.acknowledged_by && <div><span className="text-gray-400 text-xs">Acknowledged By:</span> <span className="text-gray-200">{selectedAlert.acknowledged_by}</span></div>}
                {selectedAlert.resolved_at && <div><span className="text-gray-400 text-xs">Resolved:</span> <span className="text-gray-200">{formatDateTime(selectedAlert.resolved_at)}</span></div>}
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Message</p>
                <p className="text-sm text-gray-200">{selectedAlert.message}</p>
              </div>

              {selectedAlert.resolution_notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Resolution Notes</p>
                  <p className="text-sm text-gray-200">{selectedAlert.resolution_notes}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-700/40">
                {selectedAlert.status === 'active' && (
                  <button
                    onClick={() => updateAlert(selectedAlert.id, { status: 'acknowledged', acknowledged_by: 'Gov. Admin' })}
                    className="flex-1 rounded-lg bg-yellow-500/20 px-4 py-2 text-xs font-medium text-yellow-300 hover:bg-yellow-500/30 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
                {(selectedAlert.status === 'active' || selectedAlert.status === 'acknowledged') && (
                  <button
                    onClick={() => updateAlert(selectedAlert.id, { status: 'resolved', resolved_at: new Date().toISOString(), resolution_notes: 'Resolved by governance admin' })}
                    className="flex-1 rounded-lg bg-green-500/20 px-4 py-2 text-xs font-medium text-green-300 hover:bg-green-500/30 transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
                {selectedAlert.status !== 'dismissed' && selectedAlert.status !== 'resolved' && (
                  <button
                    onClick={() => updateAlert(selectedAlert.id, { status: 'dismissed' })}
                    className="rounded-lg border border-gray-700/50 px-4 py-2 text-xs font-medium text-gray-400 hover:bg-gray-800 transition-colors"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
