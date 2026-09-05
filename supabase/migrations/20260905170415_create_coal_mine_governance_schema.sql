/*
# Coal Mine Governance & Compliance Monitoring Schema

## Overview
Creates the complete database schema for an AI-Based Smart Governance and Compliance Monitoring System for Coal Mines.
This system tracks mines, sensors, compliance requirements, alerts, inspections, incidents, and AI-driven risk assessments.

## New Tables

1. **mines** — Coal mine sites under governance
   - id, name, location, region, status (active/suspended/closed), manager_name, total_workers, established_date, area_sqkm, created_at

2. **sensors** — IoT sensors deployed at mines monitoring environmental and structural parameters
   - id, mine_id, sensor_type (gas, temperature, humidity, vibration, air_quality, water_level, dust, noise), location_description, status (online/offline/maintenance), current_value, unit, threshold_warning, threshold_critical, last_reading_at, created_at

3. **sensor_readings** — Historical time-series readings from sensors
   - id, sensor_id, value, unit, reading_timestamp, severity (normal/warning/critical)

4. **compliance_categories** — Categories of compliance requirements (safety, environmental, labor, operational)
   - id, name, description

5. **compliance_items** — Specific compliance requirements
   - id, category_id, regulation_code, description, severity (critical/major/minor), status (compliant/non_compliant/pending_review), mine_id, last_audit_date, next_audit_date, responsible_person, notes

6. **alerts** — System-generated alerts from sensor thresholds or compliance failures
   - id, mine_id, sensor_id, alert_type (sensor_threshold, compliance_violation, equipment_failure, safety_hazard), severity (info/warning/critical/emergency), title, message, status (active/acknowledged/resolved/dismissed), triggered_at, acknowledged_by, resolved_at, resolution_notes

7. **inspections** — Scheduled and completed mine inspections
   - id, mine_id, inspector_name, inspection_type (routine/safety/compliance/environmental/accident_investigation), scheduled_date, completed_date, status (scheduled/in_progress/completed/cancelled), findings, compliance_score, notes

8. **inspection_findings** — Individual findings within an inspection
   - id, inspection_id, finding_description, severity (critical/major/minor/observation), status (open/addressed/closed), recommended_action, resolved_date

9. **incidents** — Reported safety or environmental incidents
   - id, mine_id, incident_type (accident/near_miss/environmental/equipment_failure/structural), severity (minor/moderate/severe/fatal), title, description, occurred_at, reported_by, status (reported/investigating/resolved/closed), casualties, injuries, financial_loss, root_cause, corrective_actions, resolved_at

10. **risk_assessments** — AI-generated risk assessments for mines
    - id, mine_id, overall_risk_score (0-100), risk_level (low/moderate/high/critical), gas_emission_risk, structural_risk, environmental_risk, worker_safety_risk, compliance_risk, assessment_summary, recommended_actions (jsonb array), assessed_at, model_version

11. **workers** — Mine workforce records
    - id, mine_id, name, role, shift, department, medical_checkup_date, safety_training_date, status (active/on_leave/suspended), created_at

## Security
- This is a single-tenant governance dashboard (no sign-in required).
- RLS enabled on all tables.
- All policies allow anon + authenticated access since the data is intentionally shared within the governance system.
*/

-- ==================== MINES ====================
CREATE TABLE IF NOT EXISTS mines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  region text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed', 'under_review')),
  manager_name text NOT NULL,
  total_workers integer NOT NULL DEFAULT 0,
  established_date date,
  area_sqkm numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_mines" ON mines;
CREATE POLICY "anon_select_mines" ON mines FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_mines" ON mines;
CREATE POLICY "anon_insert_mines" ON mines FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_mines" ON mines;
CREATE POLICY "anon_update_mines" ON mines FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_mines" ON mines;
CREATE POLICY "anon_delete_mines" ON mines FOR DELETE TO anon, authenticated USING (true);

-- ==================== SENSORS ====================
CREATE TABLE IF NOT EXISTS sensors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
  sensor_type text NOT NULL CHECK (sensor_type IN ('gas', 'temperature', 'humidity', 'vibration', 'air_quality', 'water_level', 'dust', 'noise')),
  location_description text NOT NULL,
  status text NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance', 'calibrating')),
  current_value numeric,
  unit text NOT NULL DEFAULT '',
  threshold_warning numeric,
  threshold_critical numeric,
  last_reading_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_sensors" ON sensors;
CREATE POLICY "anon_select_sensors" ON sensors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sensors" ON sensors;
CREATE POLICY "anon_insert_sensors" ON sensors FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sensors" ON sensors;
CREATE POLICY "anon_update_sensors" ON sensors FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sensors" ON sensors;
CREATE POLICY "anon_delete_sensors" ON sensors FOR DELETE TO anon, authenticated USING (true);

-- ==================== SENSOR READINGS ====================
CREATE TABLE IF NOT EXISTS sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id uuid NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  unit text NOT NULL DEFAULT '',
  reading_timestamp timestamptz DEFAULT now(),
  severity text NOT NULL DEFAULT 'normal' CHECK (severity IN ('normal', 'warning', 'critical'))
);

ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_select_sensor_readings" ON sensor_readings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_insert_sensor_readings" ON sensor_readings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_delete_sensor_readings" ON sensor_readings FOR DELETE TO anon, authenticated USING (true);

-- ==================== COMPLIANCE CATEGORIES ====================
CREATE TABLE IF NOT EXISTS compliance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text
);

ALTER TABLE compliance_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_compliance_categories" ON compliance_categories;
CREATE POLICY "anon_select_compliance_categories" ON compliance_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_compliance_categories" ON compliance_categories;
CREATE POLICY "anon_insert_compliance_categories" ON compliance_categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_compliance_categories" ON compliance_categories;
CREATE POLICY "anon_update_compliance_categories" ON compliance_categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_compliance_categories" ON compliance_categories;
CREATE POLICY "anon_delete_compliance_categories" ON compliance_categories FOR DELETE TO anon, authenticated USING (true);

-- ==================== COMPLIANCE ITEMS ====================
CREATE TABLE IF NOT EXISTS compliance_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES compliance_categories(id) ON DELETE SET NULL,
  mine_id uuid NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
  regulation_code text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'minor' CHECK (severity IN ('critical', 'major', 'minor')),
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('compliant', 'non_compliant', 'pending_review')),
  last_audit_date date,
  next_audit_date date,
  responsible_person text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_compliance_items" ON compliance_items;
CREATE POLICY "anon_select_compliance_items" ON compliance_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_compliance_items" ON compliance_items;
CREATE POLICY "anon_insert_compliance_items" ON compliance_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_compliance_items" ON compliance_items;
CREATE POLICY "anon_update_compliance_items" ON compliance_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_compliance_items" ON compliance_items;
CREATE POLICY "anon_delete_compliance_items" ON compliance_items FOR DELETE TO anon, authenticated USING (true);

-- ==================== ALERTS ====================
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
  sensor_id uuid REFERENCES sensors(id) ON DELETE SET NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('sensor_threshold', 'compliance_violation', 'equipment_failure', 'safety_hazard')),
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
  title text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  triggered_at timestamptz DEFAULT now(),
  acknowledged_by text,
  resolved_at timestamptz,
  resolution_notes text
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_alerts" ON alerts;
CREATE POLICY "anon_select_alerts" ON alerts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_alerts" ON alerts;
CREATE POLICY "anon_insert_alerts" ON alerts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_alerts" ON alerts;
CREATE POLICY "anon_update_alerts" ON alerts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_alerts" ON alerts;
CREATE POLICY "anon_delete_alerts" ON alerts FOR DELETE TO anon, authenticated USING (true);

-- ==================== INSPECTIONS ====================
CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
  inspector_name text NOT NULL,
  inspection_type text NOT NULL CHECK (inspection_type IN ('routine', 'safety', 'compliance', 'environmental', 'accident_investigation')),
  scheduled_date date NOT NULL,
  completed_date date,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  findings text,
  compliance_score integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_inspections" ON inspections;
CREATE POLICY "anon_select_inspections" ON inspections FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_inspections" ON inspections;
CREATE POLICY "anon_insert_inspections" ON inspections FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_inspections" ON inspections;
CREATE POLICY "anon_update_inspections" ON inspections FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_inspections" ON inspections;
CREATE POLICY "anon_delete_inspections" ON inspections FOR DELETE TO anon, authenticated USING (true);

-- ==================== INSPECTION FINDINGS ====================
CREATE TABLE IF NOT EXISTS inspection_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  finding_description text NOT NULL,
  severity text NOT NULL DEFAULT 'observation' CHECK (severity IN ('critical', 'major', 'minor', 'observation')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'addressed', 'closed')),
  recommended_action text,
  resolved_date date
);

ALTER TABLE inspection_findings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_inspection_findings" ON inspection_findings;
CREATE POLICY "anon_select_inspection_findings" ON inspection_findings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_inspection_findings" ON inspection_findings;
CREATE POLICY "anon_insert_inspection_findings" ON inspection_findings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_inspection_findings" ON inspection_findings;
CREATE POLICY "anon_update_inspection_findings" ON inspection_findings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_inspection_findings" ON inspection_findings;
CREATE POLICY "anon_delete_inspection_findings" ON inspection_findings FOR DELETE TO anon, authenticated USING (true);

-- ==================== INCIDENTS ====================
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
  incident_type text NOT NULL CHECK (incident_type IN ('accident', 'near_miss', 'environmental', 'equipment_failure', 'structural')),
  severity text NOT NULL DEFAULT 'minor' CHECK (severity IN ('minor', 'moderate', 'severe', 'fatal')),
  title text NOT NULL,
  description text NOT NULL,
  occurred_at timestamptz NOT NULL,
  reported_by text,
  status text NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
  casualties integer DEFAULT 0,
  injuries integer DEFAULT 0,
  financial_loss numeric DEFAULT 0,
  root_cause text,
  corrective_actions text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_incidents" ON incidents;
CREATE POLICY "anon_select_incidents" ON incidents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_incidents" ON incidents;
CREATE POLICY "anon_insert_incidents" ON incidents FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_incidents" ON incidents;
CREATE POLICY "anon_update_incidents" ON incidents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_incidents" ON incidents;
CREATE POLICY "anon_delete_incidents" ON incidents FOR DELETE TO anon, authenticated USING (true);

-- ==================== RISK ASSESSMENTS ====================
CREATE TABLE IF NOT EXISTS risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
  overall_risk_score integer NOT NULL CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  gas_emission_risk integer NOT NULL DEFAULT 0,
  structural_risk integer NOT NULL DEFAULT 0,
  environmental_risk integer NOT NULL DEFAULT 0,
  worker_safety_risk integer NOT NULL DEFAULT 0,
  compliance_risk integer NOT NULL DEFAULT 0,
  assessment_summary text NOT NULL,
  recommended_actions jsonb DEFAULT '[]'::jsonb,
  assessed_at timestamptz DEFAULT now(),
  model_version text DEFAULT 'v1.0'
);

ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_risk_assessments" ON risk_assessments;
CREATE POLICY "anon_select_risk_assessments" ON risk_assessments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_risk_assessments" ON risk_assessments;
CREATE POLICY "anon_insert_risk_assessments" ON risk_assessments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_risk_assessments" ON risk_assessments;
CREATE POLICY "anon_update_risk_assessments" ON risk_assessments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_risk_assessments" ON risk_assessments;
CREATE POLICY "anon_delete_risk_assessments" ON risk_assessments FOR DELETE TO anon, authenticated USING (true);

-- ==================== WORKERS ====================
CREATE TABLE IF NOT EXISTS workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  shift text CHECK (shift IN ('morning', 'afternoon', 'night')),
  department text,
  medical_checkup_date date,
  safety_training_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'suspended')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_workers" ON workers;
CREATE POLICY "anon_select_workers" ON workers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_workers" ON workers;
CREATE POLICY "anon_insert_workers" ON workers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_workers" ON workers;
CREATE POLICY "anon_update_workers" ON workers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_workers" ON workers;
CREATE POLICY "anon_delete_workers" ON workers FOR DELETE TO anon, authenticated USING (true);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_sensors_mine_id ON sensors(mine_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_compliance_items_mine_id ON compliance_items(mine_id);
CREATE INDEX IF NOT EXISTS idx_alerts_mine_id ON alerts(mine_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_inspections_mine_id ON inspections(mine_id);
CREATE INDEX IF NOT EXISTS idx_inspection_findings_inspection_id ON inspection_findings(inspection_id);
CREATE INDEX IF NOT EXISTS idx_incidents_mine_id ON incidents(mine_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_mine_id ON risk_assessments(mine_id);
CREATE INDEX IF NOT EXISTS idx_workers_mine_id ON workers(mine_id);
