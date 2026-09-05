import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Mine = {
  id: string;
  name: string;
  location: string;
  region: string;
  status: 'active' | 'suspended' | 'closed' | 'under_review';
  manager_name: string;
  total_workers: number;
  established_date: string | null;
  area_sqkm: number;
  created_at: string;
};

export type SensorType =
  | 'gas' | 'temperature' | 'humidity' | 'vibration'
  | 'air_quality' | 'water_level' | 'dust' | 'noise';

export type Sensor = {
  id: string;
  mine_id: string;
  sensor_type: SensorType;
  location_description: string;
  status: 'online' | 'offline' | 'maintenance' | 'calibrating';
  current_value: number | null;
  unit: string;
  threshold_warning: number | null;
  threshold_critical: number | null;
  last_reading_at: string | null;
  created_at: string;
};

export type SensorReading = {
  id: string;
  sensor_id: string;
  value: number;
  unit: string;
  reading_timestamp: string;
  severity: 'normal' | 'warning' | 'critical';
};

export type ComplianceCategory = {
  id: string;
  name: string;
  description: string | null;
};

export type ComplianceItem = {
  id: string;
  category_id: string | null;
  mine_id: string;
  regulation_code: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'compliant' | 'non_compliant' | 'pending_review';
  last_audit_date: string | null;
  next_audit_date: string | null;
  responsible_person: string | null;
  notes: string | null;
  created_at: string;
};

export type Alert = {
  id: string;
  mine_id: string;
  sensor_id: string | null;
  alert_type: 'sensor_threshold' | 'compliance_violation' | 'equipment_failure' | 'safety_hazard';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  triggered_at: string;
  acknowledged_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
};

export type Inspection = {
  id: string;
  mine_id: string;
  inspector_name: string;
  inspection_type: 'routine' | 'safety' | 'compliance' | 'environmental' | 'accident_investigation';
  scheduled_date: string;
  completed_date: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  findings: string | null;
  compliance_score: number | null;
  notes: string | null;
  created_at: string;
};

export type InspectionFinding = {
  id: string;
  inspection_id: string;
  finding_description: string;
  severity: 'critical' | 'major' | 'minor' | 'observation';
  status: 'open' | 'addressed' | 'closed';
  recommended_action: string | null;
  resolved_date: string | null;
};

export type Incident = {
  id: string;
  mine_id: string;
  incident_type: 'accident' | 'near_miss' | 'environmental' | 'equipment_failure' | 'structural';
  severity: 'minor' | 'moderate' | 'severe' | 'fatal';
  title: string;
  description: string;
  occurred_at: string;
  reported_by: string | null;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  casualties: number;
  injuries: number;
  financial_loss: number;
  root_cause: string | null;
  corrective_actions: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type RiskAssessment = {
  id: string;
  mine_id: string;
  overall_risk_score: number;
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  gas_emission_risk: number;
  structural_risk: number;
  environmental_risk: number;
  worker_safety_risk: number;
  compliance_risk: number;
  assessment_summary: string;
  recommended_actions: string[];
  assessed_at: string;
  model_version: string;
};

export type Worker = {
  id: string;
  mine_id: string;
  name: string;
  role: string;
  shift: 'morning' | 'afternoon' | 'night' | null;
  department: string | null;
  medical_checkup_date: string | null;
  safety_training_date: string | null;
  status: 'active' | 'on_leave' | 'suspended';
  created_at: string;
};

export type MineWithRelations = Mine & {
  sensors?: Sensor[];
  compliance_items?: ComplianceItem[];
  alerts?: Alert[];
  risk_assessments?: RiskAssessment[];
};
