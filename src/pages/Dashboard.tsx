import { useEffect, useState } from 'react';
import {
  Mountain, AlertTriangle, ShieldCheck, Activity, TrendingUp,
  TrendingDown, BrainCircuit, Bell, ChevronRight, Clock,
  Gauge, Wind, Droplets, Thermometer, Zap,
} from 'lucide-react';
import { supabase, type Mine, type Alert, type RiskAssessment, type Sensor, type ComplianceItem } from '@/lib/supabase';
import { Badge, statusColor, riskLevelColor, timeAgo, severityColor } from '@/components/ui/Badge';
import { Card, CardHeader, LoadingSpinner, StatCard, ProgressBar } from '@/components/ui';
import type { PageKey } from '@/components/Layout';

export function Dashboard({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const [mines, setMines] = useState<Mine[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [m, a, r, s, c] = await Promise.all([
        supabase.from('mines').select('*'),
        supabase.from('alerts').select('*').order('triggered_at', { ascending: false }),
        supabase.from('risk_assessments').select('*').order('assessed_at', { ascending: false }),
        supabase.from('sensors').select('*'),
        supabase.from('compliance_items').select('*'),
      ]);
      setMines(m.data ?? []);
      setAlerts(a.data ?? []);
      setRiskAssessments(r.data ?? []);
      setSensors(s.data ?? []);
      setComplianceItems(c.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading governance dashboard..." />;

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const emergencyAlerts = activeAlerts.filter((a) => a.severity === 'emergency');
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');
  const activeMines = mines.filter((m) => m.status === 'active');
  const onlineSensors = sensors.filter((s) => s.status === 'online');
  const offlineSensors = sensors.filter((s) => s.status === 'offline');
  const complianceRate = complianceItems.length > 0
    ? Math.round((complianceItems.filter((c) => c.status === 'compliant').length / complianceItems.length) * 100)
    : 0;
  const nonCompliantCount = complianceItems.filter((c) => c.status === 'non_compliant').length;
  const criticalRiskMines = riskAssessments.filter((r) => r.risk_level === 'critical');

  const latestRiskByMine = new Map<string, RiskAssessment>();
  riskAssessments.forEach((r) => {
    if (!latestRiskByMine.has(r.mine_id)) latestRiskByMine.set(r.mine_id, r);
  });

  const avgRisk = riskAssessments.length > 0
    ? Math.round(riskAssessments.reduce((sum, r) => sum + r.overall_risk_score, 0) / riskAssessments.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Emergency banner */}
      {emergencyAlerts.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 animate-pulse-slow">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-300">
              {emergencyAlerts.length} EMERGENCY ALERT{emergencyAlerts.length > 1 ? 'S' : ''} ACTIVE
            </p>
            <p className="text-xs text-red-400/80 mt-0.5">
              {emergencyAlerts[0].title} — {timeAgo(emergencyAlerts[0].triggered_at)}
            </p>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/30 transition-colors"
          >
            View Alerts
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Mines"
          value={activeMines.length}
          icon={<Mountain className="h-5 w-5" />}
          color="cyan"
          trend={{ value: `${mines.length} total`, positive: true }}
        />
        <StatCard
          label="Active Alerts"
          value={activeAlerts.length}
          icon={<Bell className="h-5 w-5" />}
          color={criticalAlerts.length > 0 ? 'red' : 'orange'}
          trend={{ value: `${emergencyAlerts.length} emergency`, positive: false }}
        />
        <StatCard
          label="Compliance Rate"
          value={`${complianceRate}%`}
          icon={<ShieldCheck className="h-5 w-5" />}
          color={complianceRate >= 80 ? 'green' : complianceRate >= 60 ? 'yellow' : 'red'}
          trend={{ value: `${nonCompliantCount} violations`, positive: nonCompliantCount === 0 }}
        />
        <StatCard
          label="Avg AI Risk Score"
          value={avgRisk}
          icon={<BrainCircuit className="h-5 w-5" />}
          color={avgRisk < 40 ? 'green' : avgRisk < 60 ? 'yellow' : avgRisk < 80 ? 'orange' : 'red'}
          trend={{ value: `${criticalRiskMines.length} critical`, positive: criticalRiskMines.length === 0 }}
        />
      </div>

      {/* Sensor overview + Risk distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensor status */}
        <Card className="lg:col-span-1">
          <CardHeader title="Sensor Network" subtitle="IoT monitoring status" icon={<Activity className="h-5 w-5" />} />
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-green-500/10 p-3 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-green-400 font-medium">Online</p>
                </div>
                <p className="text-2xl font-bold text-gray-100 mt-1">{onlineSensors.length}</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <p className="text-xs text-red-400 font-medium">Offline</p>
                </div>
                <p className="text-2xl font-bold text-gray-100 mt-1">{offlineSensors.length}</p>
              </div>
            </div>

            {/* Sensor type breakdown */}
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-medium">By Type</p>
              {(['gas', 'temperature', 'vibration', 'dust', 'humidity', 'air_quality', 'water_level', 'noise'] as const).map((type) => {
                const typeSensors = sensors.filter((s) => s.sensor_type === type);
                if (typeSensors.length === 0) return null;
                const online = typeSensors.filter((s) => s.status === 'online').length;
                const icons: Record<string, React.ReactNode> = {
                  gas: <Wind className="h-3.5 w-3.5" />,
                  temperature: <Thermometer className="h-3.5 w-3.5" />,
                  vibration: <Zap className="h-3.5 w-3.5" />,
                  dust: <Wind className="h-3.5 w-3.5" />,
                  humidity: <Droplets className="h-3.5 w-3.5" />,
                  air_quality: <Gauge className="h-3.5 w-3.5" />,
                  water_level: <Droplets className="h-3.5 w-3.5" />,
                  noise: <Activity className="h-3.5 w-3.5" />,
                };
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-gray-400">{icons[type]}</span>
                    <span className="text-xs text-gray-300 flex-1 capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-400">{online}/{typeSensors.length}</span>
                    <div className="w-16">
                      <ProgressBar value={online} max={typeSensors.length} color={online === typeSensors.length ? 'green' : 'red'} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Risk distribution */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Mine Risk Assessment"
            subtitle="AI-powered risk scores across all mines"
            icon={<BrainCircuit className="h-5 w-5" />}
            action={
              <button
                onClick={() => onNavigate('ai-insights')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                View Details <ChevronRight className="h-3 w-3" />
              </button>
            }
          />
          <div className="p-5 space-y-3">
            {mines.map((mine) => {
              const risk = latestRiskByMine.get(mine.id);
              if (!risk) return null;
              const color = risk.risk_level === 'low' ? 'green' : risk.risk_level === 'moderate' ? 'yellow' : risk.risk_level === 'high' ? 'orange' : 'red';
              return (
                <div
                  key={mine.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3 hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => onNavigate('ai-insights')}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-200 truncate">{mine.name}</p>
                      <Badge color={statusColor(mine.status)}>{mine.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{mine.region} • {mine.total_workers} workers</p>
                  </div>
                  <div className="w-32 flex-shrink-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Risk</span>
                      <span className="text-xs font-bold text-gray-200">{risk.overall_risk_score}</span>
                    </div>
                    <ProgressBar value={risk.overall_risk_score} color={color} />
                  </div>
                  <Badge color={riskLevelColor(risk.risk_level)}>{risk.risk_level}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Active alerts + Compliance overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active alerts */}
        <Card>
          <CardHeader
            title="Recent Alerts"
            subtitle={`${activeAlerts.length} active alerts requiring attention`}
            icon={<Bell className="h-5 w-5" />}
            action={
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                View All <ChevronRight className="h-3 w-3" />
              </button>
            }
          />
          <div className="p-5 space-y-2 max-h-80 overflow-y-auto">
            {alerts.slice(0, 6).map((alert) => {
              const mine = mines.find((m) => m.id === alert.mine_id);
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3 hover:bg-gray-800/50 transition-colors"
                >
                  <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                    alert.severity === 'emergency' ? 'bg-red-500/15 text-red-400' :
                    alert.severity === 'critical' ? 'bg-orange-500/15 text-orange-400' :
                    alert.severity === 'warning' ? 'bg-yellow-500/15 text-yellow-400' :
                    'bg-blue-500/15 text-blue-400'
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-200 truncate">{alert.title}</p>
                      <Badge color={severityColor(alert.severity)}>{alert.severity}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{mine?.name ?? 'Unknown'} • {timeAgo(alert.triggered_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Compliance overview */}
        <Card>
          <CardHeader
            title="Compliance Overview"
            subtitle="Regulatory compliance across all mines"
            icon={<ShieldCheck className="h-5 w-5" />}
            action={
              <button
                onClick={() => onNavigate('compliance')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                View All <ChevronRight className="h-3 w-3" />
              </button>
            }
          />
          <div className="p-5 space-y-4">
            <div className="rounded-lg bg-gray-800/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">Overall Compliance</p>
                <p className="text-lg font-bold text-gray-100">{complianceRate}%</p>
              </div>
              <ProgressBar
                value={complianceRate}
                color={complianceRate >= 80 ? 'green' : complianceRate >= 60 ? 'yellow' : 'red'}
                className="h-3"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-green-500/10 p-3 text-center border border-green-500/20">
                <p className="text-2xl font-bold text-green-400">{complianceItems.filter((c) => c.status === 'compliant').length}</p>
                <p className="text-xs text-gray-400 mt-1">Compliant</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-3 text-center border border-red-500/20">
                <p className="text-2xl font-bold text-red-400">{nonCompliantCount}</p>
                <p className="text-xs text-gray-400 mt-1">Violations</p>
              </div>
              <div className="rounded-lg bg-yellow-500/10 p-3 text-center border border-yellow-500/20">
                <p className="text-2xl font-bold text-yellow-400">{complianceItems.filter((c) => c.status === 'pending_review').length}</p>
                <p className="text-xs text-gray-400 mt-1">Pending</p>
              </div>
            </div>

            <div className="space-y-2">
              {mines.slice(0, 5).map((mine) => {
                const mineItems = complianceItems.filter((c) => c.mine_id === mine.id);
                const rate = mineItems.length > 0
                  ? Math.round((mineItems.filter((c) => c.status === 'compliant').length / mineItems.length) * 100)
                  : 0;
                return (
                  <div key={mine.id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-300 w-32 truncate">{mine.name}</span>
                    <div className="flex-1">
                      <ProgressBar
                        value={rate}
                        color={rate >= 80 ? 'green' : rate >= 60 ? 'yellow' : 'red'}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-400 w-8 text-right">{rate}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Latest AI assessments */}
      <Card>
        <CardHeader
          title="Latest AI Risk Assessments"
          subtitle="Automated risk analysis by the AI governance engine"
          icon={<BrainCircuit className="h-5 w-5" />}
          action={
            <button
              onClick={() => onNavigate('ai-insights')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              View All <ChevronRight className="h-3 w-3" />
            </button>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          {riskAssessments.slice(0, 3).map((risk) => {
            const mine = mines.find((m) => m.id === risk.mine_id);
            const color = risk.risk_level === 'low' ? 'green' : risk.risk_level === 'moderate' ? 'yellow' : risk.risk_level === 'high' ? 'orange' : 'red';
            return (
              <div
                key={risk.id}
                className="rounded-lg border border-gray-700/40 bg-gray-800/30 p-4 hover:border-gray-600/60 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-200">{mine?.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {timeAgo(risk.assessed_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${color === 'green' ? 'text-green-400' : color === 'yellow' ? 'text-yellow-400' : color === 'orange' ? 'text-orange-400' : 'text-red-400'}`}>
                      {risk.overall_risk_score}
                    </p>
                    <Badge color={riskLevelColor(risk.risk_level)}>{risk.risk_level}</Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {[
                    { label: 'Gas Emission', val: risk.gas_emission_risk },
                    { label: 'Structural', val: risk.structural_risk },
                    { label: 'Environmental', val: risk.environmental_risk },
                    { label: 'Worker Safety', val: risk.worker_safety_risk },
                    { label: 'Compliance', val: risk.compliance_risk },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-24">{r.label}</span>
                      <div className="flex-1">
                        <ProgressBar
                          value={r.val}
                          color={r.val < 40 ? 'green' : r.val < 60 ? 'yellow' : r.val < 80 ? 'orange' : 'red'}
                          className="h-1.5"
                        />
                      </div>
                      <span className="text-[10px] font-medium text-gray-400 w-6 text-right">{r.val}</span>
                    </div>
                  ))}
                </div>

                {risk.recommended_actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700/30">
                    <p className="text-[10px] text-gray-500 mb-1">Top recommendation:</p>
                    <p className="text-xs text-gray-300 line-clamp-2">{risk.recommended_actions[0]}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
