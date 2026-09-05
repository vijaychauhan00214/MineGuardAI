import { useEffect, useState } from 'react';
import {
  BrainCircuit, Wind, Building2, Leaf, Users, ShieldCheck,
  TrendingUp, TrendingDown, Clock, ChevronRight, AlertTriangle,
  Sparkles, Activity, Target,
} from 'lucide-react';
import { supabase, type RiskAssessment, type Mine } from '@/lib/supabase';
import { Badge, riskLevelColor, timeAgo } from '@/components/ui/Badge';
import { Card, CardHeader, LoadingSpinner, EmptyState, ProgressBar, Modal } from '@/components/ui';

export function AIInsights() {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RiskAssessment | null>(null);

  useEffect(() => {
    async function load() {
      const [r, m] = await Promise.all([
        supabase.from('risk_assessments').select('*').order('assessed_at', { ascending: false }),
        supabase.from('mines').select('*').order('name'),
      ]);
      setAssessments(r.data ?? []);
      setMines(m.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner label="AI engine analyzing data..." />;

  const mineName = (id: string) => mines.find((m) => m.id === id)?.name ?? 'Unknown';

  const critical = assessments.filter((a) => a.risk_level === 'critical').length;
  const high = assessments.filter((a) => a.risk_level === 'high').length;
  const moderate = assessments.filter((a) => a.risk_level === 'moderate').length;
  const low = assessments.filter((a) => a.risk_level === 'low').length;
  const avgScore = assessments.length > 0
    ? Math.round(assessments.reduce((sum, a) => sum + a.overall_risk_score, 0) / assessments.length)
    : 0;

  // Aggregate risk dimensions
  const avgGas = assessments.length > 0 ? Math.round(assessments.reduce((s, a) => s + a.gas_emission_risk, 0) / assessments.length) : 0;
  const avgStructural = assessments.length > 0 ? Math.round(assessments.reduce((s, a) => s + a.structural_risk, 0) / assessments.length) : 0;
  const avgEnv = assessments.length > 0 ? Math.round(assessments.reduce((s, a) => s + a.environmental_risk, 0) / assessments.length) : 0;
  const avgSafety = assessments.length > 0 ? Math.round(assessments.reduce((s, a) => s + a.worker_safety_risk, 0) / assessments.length) : 0;
  const avgCompliance = assessments.length > 0 ? Math.round(assessments.reduce((s, a) => s + a.compliance_risk, 0) / assessments.length) : 0;

  const riskDimensions = [
    { label: 'Gas Emission', value: avgGas, icon: <Wind className="h-4 w-4" /> },
    { label: 'Structural', value: avgStructural, icon: <Building2 className="h-4 w-4" /> },
    { label: 'Environmental', value: avgEnv, icon: <Leaf className="h-4 w-4" /> },
    { label: 'Worker Safety', value: avgSafety, icon: <Users className="h-4 w-4" /> },
    { label: 'Compliance', value: avgCompliance, icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* AI banner */}
      <div className="flex items-center gap-4 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
          <BrainCircuit className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-100">AI Governance Engine</h2>
            <Badge color="green"><Sparkles className="h-3 w-3" /> Active</Badge>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Analyzing sensor data, compliance records, and incident history across {mines.length} mines in real-time
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-2xl font-bold text-cyan-400">{avgScore}</p>
          <p className="text-xs text-gray-400">Avg Risk Score</p>
        </div>
      </div>

      {/* Risk level distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex items-center justify-between">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="text-2xl font-bold text-red-400">{critical}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Critical Risk</p>
        </div>
        <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-5 w-5 text-orange-400" />
            <span className="text-2xl font-bold text-orange-400">{high}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">High Risk</p>
        </div>
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
          <div className="flex items-center justify-between">
            <Activity className="h-5 w-5 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">{moderate}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Moderate Risk</p>
        </div>
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
          <div className="flex items-center justify-between">
            <TrendingDown className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-green-400">{low}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Low Risk</p>
        </div>
      </div>

      {/* Aggregate risk dimensions */}
      <Card>
        <CardHeader title="Aggregate Risk Dimensions" subtitle="Average risk across all monitored mines" icon={<Target className="h-5 w-5" />} />
        <div className="p-5 space-y-3">
          {riskDimensions.map((dim) => (
            <div key={dim.label} className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-36 flex-shrink-0">
                <span className="text-gray-400">{dim.icon}</span>
                <span className="text-xs text-gray-300">{dim.label}</span>
              </div>
              <div className="flex-1">
                <ProgressBar
                  value={dim.value}
                  color={dim.value < 40 ? 'green' : dim.value < 60 ? 'yellow' : dim.value < 80 ? 'orange' : 'red'}
                  className="h-3"
                />
              </div>
              <span className={`text-sm font-bold w-10 text-right ${
                dim.value < 40 ? 'text-green-400' : dim.value < 60 ? 'text-yellow-400' : dim.value < 80 ? 'text-orange-400' : 'text-red-400'
              }`}>{dim.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Individual risk assessments */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-gray-200">Mine Risk Assessments</h2>
          <span className="text-xs text-gray-500">({assessments.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((risk) => {
            const color = risk.risk_level === 'low' ? 'green' : risk.risk_level === 'moderate' ? 'yellow' : risk.risk_level === 'high' ? 'orange' : 'red';
            const scoreColor = color === 'green' ? 'text-green-400' : color === 'yellow' ? 'text-yellow-400' : color === 'orange' ? 'text-orange-400' : 'text-red-400';
            return (
              <Card key={risk.id} className="p-5 hover:border-gray-600/60 transition-colors cursor-pointer" onClick={() => setSelected(risk)}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-200">{mineName(risk.mine_id)}</p>
                      <Badge color={riskLevelColor(risk.risk_level)}>{risk.risk_level}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {timeAgo(risk.assessed_at)} • Model {risk.model_version}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${scoreColor}`}>{risk.overall_risk_score}</p>
                    <p className="text-[10px] text-gray-500">/ 100</p>
                  </div>
                </div>

                {/* Risk dimensions mini */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {[
                    { label: 'Gas', val: risk.gas_emission_risk },
                    { label: 'Struct', val: risk.structural_risk },
                    { label: 'Env', val: risk.environmental_risk },
                    { label: 'Safety', val: risk.worker_safety_risk },
                    { label: 'Comp', val: risk.compliance_risk },
                  ].map((d) => (
                    <div key={d.label} className="text-center">
                      <div className="relative h-16 w-full bg-gray-700/30 rounded-md overflow-hidden">
                        <div
                          className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
                            d.val < 40 ? 'bg-green-500' : d.val < 60 ? 'bg-yellow-500' : d.val < 80 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ height: `${d.val}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{d.label}</p>
                      <p className="text-xs font-bold text-gray-300">{d.val}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 line-clamp-2">{risk.assessment_summary}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/30">
                  <span className="text-xs text-gray-500">{risk.recommended_actions.length} recommendations</span>
                  <span className="text-xs text-cyan-400 flex items-center gap-1">
                    View Details <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {assessments.length === 0 && (
        <EmptyState title="No risk assessments available" message="AI engine has not generated any assessments yet" icon={<BrainCircuit className="h-10 w-10" />} />
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="AI Risk Assessment" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-100">{mineName(selected.mine_id)}</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {timeAgo(selected.assessed_at)} • Model {selected.model_version}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${
                  selected.risk_level === 'low' ? 'text-green-400' : selected.risk_level === 'moderate' ? 'text-yellow-400' : selected.risk_level === 'high' ? 'text-orange-400' : 'text-red-400'
                }`}>{selected.overall_risk_score}</p>
                <Badge color={riskLevelColor(selected.risk_level)}>{selected.risk_level} risk</Badge>
              </div>
            </div>

            {/* Risk dimensions */}
            <div className="rounded-lg bg-gray-800/40 p-4 space-y-3">
              <p className="text-xs text-gray-400 font-medium">Risk Dimensions</p>
              {[
                { label: 'Gas Emission Risk', val: selected.gas_emission_risk, icon: <Wind className="h-4 w-4" /> },
                { label: 'Structural Risk', val: selected.structural_risk, icon: <Building2 className="h-4 w-4" /> },
                { label: 'Environmental Risk', val: selected.environmental_risk, icon: <Leaf className="h-4 w-4" /> },
                { label: 'Worker Safety Risk', val: selected.worker_safety_risk, icon: <Users className="h-4 w-4" /> },
                { label: 'Compliance Risk', val: selected.compliance_risk, icon: <ShieldCheck className="h-4 w-4" /> },
              ].map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="text-gray-400 flex-shrink-0">{d.icon}</span>
                  <span className="text-xs text-gray-300 w-32 flex-shrink-0">{d.label}</span>
                  <div className="flex-1">
                    <ProgressBar
                      value={d.val}
                      color={d.val < 40 ? 'green' : d.val < 60 ? 'yellow' : d.val < 80 ? 'orange' : 'red'}
                      className="h-2.5"
                    />
                  </div>
                  <span className={`text-sm font-bold w-8 text-right ${
                    d.val < 40 ? 'text-green-400' : d.val < 60 ? 'text-yellow-400' : d.val < 80 ? 'text-orange-400' : 'text-red-400'
                  }`}>{d.val}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><BrainCircuit className="h-3.5 w-3.5" /> AI Assessment Summary</p>
              <p className="text-sm text-gray-200">{selected.assessment_summary}</p>
            </div>

            {/* Recommended actions */}
            {selected.recommended_actions.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Recommended Actions</p>
                <div className="space-y-2">
                  {selected.recommended_actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-gray-800/40 p-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/15 text-[10px] font-bold text-cyan-400 flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-200">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
