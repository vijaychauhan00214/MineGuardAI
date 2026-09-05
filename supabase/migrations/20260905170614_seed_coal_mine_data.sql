/*
# Seed Data for Coal Mine Governance System

## Overview
Populates all tables with realistic sample data for demonstration:
- 5 coal mines across different regions
- 20+ sensors across mines
- 5 compliance categories with 15+ compliance items
- 10+ alerts of varying severity
- 8+ inspections with findings
- 5+ incidents
- 5+ risk assessments
- 15+ workers
*/

-- ==================== MINES ====================
INSERT INTO mines (name, location, region, status, manager_name, total_workers, established_date, area_sqkm) VALUES
('Greenfield Colliery', 'Dhanbad, Jharkhand', 'East', 'active', 'Rajesh Kumar', 420, '1998-03-15', 12.5),
('Blackridge Mine', 'Bilaspur, Chhattisgarh', 'Central', 'active', 'Suresh Patel', 380, '2001-07-22', 8.3),
('Kotpalli Open Cast', 'Adilabad, Telangana', 'South', 'under_review', 'Lakshmi Reddy', 250, '2005-11-10', 15.2),
('Singareni Shaft 3', 'Kothagudem, Telangana', 'South', 'active', 'Venkat Rao', 510, '1989-06-01', 6.8),
('Mahendragarh Block B', 'Hisar, Haryana', 'North', 'suspended', 'Anil Yadav', 180, '2010-09-15', 4.1)
ON CONFLICT DO NOTHING;

-- ==================== SENSORS ====================
INSERT INTO sensors (mine_id, sensor_type, location_description, status, current_value, unit, threshold_warning, threshold_critical, last_reading_at) VALUES
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'gas', 'Section A - Shaft 1, Level 3', 'online', 42, 'ppm', 25, 50, now() - interval '2 minutes'),
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'temperature', 'Section A - Shaft 1, Level 3', 'online', 38, '°C', 35, 45, now() - interval '2 minutes'),
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'vibration', 'Main Conveyor Belt 2', 'online', 3.2, 'mm/s', 5, 8, now() - interval '3 minutes'),
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'dust', 'Section B - Shaft 2, Level 1', 'online', 1.8, 'mg/m³', 2, 4, now() - interval '1 minute'),
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'humidity', 'Section B - Shaft 2, Level 1', 'online', 72, '%', 80, 95, now() - interval '1 minute'),
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'air_quality', 'Ventilation Shaft Main', 'online', 280, 'CO ppm', 200, 400, now() - interval '30 seconds'),
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'water_level', 'Pit Bottom - Sump', 'online', 1.2, 'm', 1.5, 2.0, now() - interval '5 minutes'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 'gas', 'Section C - Shaft 1, Level 2', 'online', 18, 'ppm', 25, 50, now() - interval '2 minutes'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 'temperature', 'Section C - Shaft 1, Level 2', 'online', 33, '°C', 35, 45, now() - interval '2 minutes'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 'vibration', 'Crusher Unit 1', 'maintenance', 5.1, 'mm/s', 5, 8, now() - interval '1 hour'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 'dust', 'Haulage Road 3', 'online', 2.5, 'mg/m³', 2, 4, now() - interval '1 minute'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 'noise', 'Crusher Unit 1', 'offline', 0, 'dB', 85, 100, now() - interval '2 hours'),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'gas', 'Pit 2 - Bench 3', 'online', 55, 'ppm', 25, 50, now() - interval '3 minutes'),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'temperature', 'Pit 2 - Bench 3', 'online', 41, '°C', 35, 45, now() - interval '3 minutes'),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'vibration', 'Dragline 1', 'online', 6.8, 'mm/s', 5, 8, now() - interval '5 minutes'),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'dust', 'Pit 1 - Bench 1', 'online', 3.2, 'mg/m³', 2, 4, now() - interval '1 minute'),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'gas', 'Section D - Shaft 3, Level 4', 'online', 12, 'ppm', 25, 50, now() - interval '2 minutes'),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'temperature', 'Section D - Shaft 3, Level 4', 'online', 34, '°C', 35, 45, now() - interval '2 minutes'),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'humidity', 'Section D - Shaft 3, Level 4', 'online', 78, '%', 80, 95, now() - interval '1 minute'),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'water_level', 'Pit Bottom - Sump North', 'online', 0.8, 'm', 1.5, 2.0, now() - interval '5 minutes'),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'air_quality', 'Ventilation Shaft North', 'online', 120, 'CO ppm', 200, 400, now() - interval '30 seconds'),
((SELECT id FROM mines WHERE name='Mahendragarh Block B'), 'gas', 'Section E - Shaft 1, Level 1', 'offline', 0, 'ppm', 25, 50, now() - interval '3 hours'),
((SELECT id FROM mines WHERE name='Mahendragarh Block B'), 'temperature', 'Section E - Shaft 1, Level 1', 'offline', 0, '°C', 35, 45, now() - interval '3 hours'),
((SELECT id FROM mines WHERE name='Mahendragarh Block B'), 'vibration', 'Conveyor Belt 1', 'offline', 0, 'mm/s', 5, 8, now() - interval '3 hours')
ON CONFLICT DO NOTHING;

-- ==================== SENSOR READINGS (historical) ====================
INSERT INTO sensor_readings (sensor_id, value, unit, reading_timestamp, severity)
SELECT s.id, s.current_value, s.unit, s.last_reading_at,
  CASE
    WHEN s.current_value >= s.threshold_critical THEN 'critical'
    WHEN s.current_value >= s.threshold_warning THEN 'warning'
    ELSE 'normal'
  END
FROM sensors s WHERE s.current_value IS NOT NULL AND s.current_value > 0
ON CONFLICT DO NOTHING;

-- Add some historical readings for Greenfield gas sensor
INSERT INTO sensor_readings (sensor_id, value, unit, reading_timestamp, severity)
SELECT s.id, v.value, s.unit, v.ts,
  CASE
    WHEN v.value >= s.threshold_critical THEN 'critical'
    WHEN v.value >= s.threshold_warning THEN 'warning'
    ELSE 'normal'
  END
FROM sensors s
CROSS JOIN (VALUES
  (38.0, now() - interval '1 hour'),
  (35.5, now() - interval '50 minutes'),
  (40.2, now() - interval '40 minutes'),
  (42.1, now() - interval '30 minutes'),
  (39.8, now() - interval '20 minutes'),
  (41.5, now() - interval '10 minutes')
) AS v(value, ts)
WHERE s.mine_id = (SELECT id FROM mines WHERE name='Greenfield Colliery') AND s.sensor_type = 'gas' AND s.location_description LIKE 'Section A%'
ON CONFLICT DO NOTHING;

-- ==================== COMPLIANCE CATEGORIES ====================
INSERT INTO compliance_categories (name, description) VALUES
('Safety', 'Worker safety regulations and protocols including PPE, ventilation, and emergency procedures'),
('Environmental', 'Environmental protection standards including air quality, water management, and land reclamation'),
('Labor', 'Labor laws and worker welfare regulations including hours, wages, and health checks'),
('Operational', 'Operational standards including equipment maintenance, blasting protocols, and transport safety')
ON CONFLICT DO NOTHING;

-- ==================== COMPLIANCE ITEMS ====================
INSERT INTO compliance_items (category_id, mine_id, regulation_code, description, severity, status, last_audit_date, next_audit_date, responsible_person, notes) VALUES
((SELECT id FROM compliance_categories WHERE name='Safety'), (SELECT id FROM mines WHERE name='Greenfield Colliery'), 'CMR-99/73', 'Methane drainage system operational and tested weekly', 'critical', 'compliant', '2026-08-15', '2026-12-15', 'Safety Officer R. Mehta', 'Drainage system verified in last inspection'),
((SELECT id FROM compliance_categories WHERE name='Safety'), (SELECT id FROM mines WHERE name='Greenfield Colliery'), 'CMR-99/65', 'PPE compliance for all underground workers', 'major', 'compliant', '2026-08-15', '2026-12-15', 'Safety Officer R. Mehta', NULL),
((SELECT id FROM compliance_categories WHERE name='Environmental'), (SELECT id FROM mines WHERE name='Greenfield Colliery'), 'EPA-1986/S3', 'Air quality monitoring - PM10 within permissible limits', 'major', 'pending_review', '2026-07-01', '2026-10-01', 'Env Officer K. Singh', 'Awaiting latest lab results'),
((SELECT id FROM compliance_categories WHERE name='Safety'), (SELECT id FROM mines WHERE name='Greenfield Colliery'), 'CMR-99/102', 'Emergency evacuation drill conducted quarterly', 'minor', 'compliant', '2026-07-20', '2026-10-20', 'Safety Officer R. Mehta', NULL),
((SELECT id FROM compliance_categories WHERE name='Labor'), (SELECT id FROM mines WHERE name='Greenfield Colliery'), 'MW-2008/S18', 'Annual medical checkups for all workers', 'major', 'compliant', '2026-06-15', '2027-06-15', 'HR Head P. Nair', 'All 420 workers checked'),
((SELECT id FROM compliance_categories WHERE name='Safety'), (SELECT id FROM mines WHERE name='Blackridge Mine'), 'CMR-99/73', 'Methane drainage system operational and tested weekly', 'critical', 'compliant', '2026-08-01', '2026-12-01', 'Safety Officer A. Gupta', NULL),
((SELECT id FROM compliance_categories WHERE name='Environmental'), (SELECT id FROM mines WHERE name='Blackridge Mine'), 'EPA-1986/S3', 'Air quality monitoring - PM10 within permissible limits', 'major', 'non_compliant', '2026-07-15', '2026-10-15', 'Env Officer M. Joshi', 'Dust levels exceeded on haulage road 3'),
((SELECT id FROM compliance_categories WHERE name='Operational'), (SELECT id FROM mines WHERE name='Blackridge Mine'), 'CMR-99/112', 'Crusher unit maintenance log current', 'major', 'non_compliant', '2026-08-01', '2026-11-01', 'Maintenance Head S. Pillai', 'Vibration sensor shows overdue maintenance'),
((SELECT id FROM compliance_categories WHERE name='Labor'), (SELECT id FROM mines WHERE name='Blackridge Mine'), 'MW-2008/S18', 'Annual medical checkups for all workers', 'major', 'pending_review', '2026-05-10', '2026-11-10', 'HR Head V. Das', '120 workers still pending checkup'),
((SELECT id FROM compliance_categories WHERE name='Safety'), (SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'CMR-99/73', 'Methane drainage system operational and tested weekly', 'critical', 'non_compliant', '2026-07-01', '2026-10-01', 'Safety Officer D. Rao', 'Gas levels exceeding critical threshold at Pit 2'),
((SELECT id FROM compliance_categories WHERE name='Safety'), (SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'CMR-99/65', 'PPE compliance for all underground workers', 'major', 'pending_review', '2026-07-01', '2026-10-01', 'Safety Officer D. Rao', NULL),
((SELECT id FROM compliance_categories WHERE name='Environmental'), (SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'EPA-1986/S25', 'Dust suppression system operational at all benches', 'critical', 'non_compliant', '2026-06-15', '2026-09-15', 'Env Officer F. Khan', 'Dust levels at 3.2 mg/m³, above 2.0 warning'),
((SELECT id FROM compliance_categories WHERE name='Operational'), (SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'CMR-99/112', 'Crusher unit maintenance log current', 'major', 'compliant', '2026-08-20', '2026-12-20', 'Maintenance Head T. Naidu', NULL),
((SELECT id FROM compliance_categories WHERE name='Safety'), (SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'CMR-99/102', 'Emergency evacuation drill conducted quarterly', 'minor', 'compliant', '2026-08-10', '2026-11-10', 'Safety Officer G. Iyer', NULL),
((SELECT id FROM compliance_categories WHERE name='Labor'), (SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'MW-2008/S18', 'Annual medical checkups for all workers', 'major', 'compliant', '2026-06-01', '2027-06-01', 'HR Head R. Bose', 'All 510 workers checked'),
((SELECT id FROM compliance_categories WHERE name='Safety'), (SELECT id FROM mines WHERE name='Mahendragarh Block B'), 'CMR-99/73', 'Methane drainage system operational and tested weekly', 'critical', 'pending_review', '2026-05-01', '2026-08-01', 'Safety Officer H. Sharma', 'Mine suspended - sensors offline'),
((SELECT id FROM compliance_categories WHERE name='Safety'), (SELECT id FROM mines WHERE name='Mahendragarh Block B'), 'CMR-99/65', 'PPE compliance for all underground workers', 'major', 'non_compliant', '2026-05-01', '2026-08-01', 'Safety Officer H. Sharma', 'Mine under suspension, audit overdue')
ON CONFLICT DO NOTHING;

-- ==================== ALERTS ====================
INSERT INTO alerts (mine_id, sensor_id, alert_type, severity, title, message, status, triggered_at, acknowledged_by, resolved_at, resolution_notes) VALUES
((SELECT id FROM mines WHERE name='Greenfield Colliery'), (SELECT id FROM sensors WHERE location_description='Section A - Shaft 1, Level 3' AND sensor_type='gas'), 'sensor_threshold', 'critical', 'Methane Gas Level Critical', 'Gas sensor at Section A, Shaft 1, Level 3 reading 42 ppm - approaching critical threshold of 50 ppm. Immediate ventilation increase required.', 'active', now() - interval '5 minutes', NULL, NULL, NULL),
((SELECT id FROM mines WHERE name='Greenfield Colliery'), NULL, 'compliance_violation', 'warning', 'Air Quality Audit Overdue', 'EPA-1986/S3 compliance audit results pending for Greenfield Colliery. Results were due on 2026-10-01.', 'active', now() - interval '2 hours', NULL, NULL, NULL),
((SELECT id FROM mines WHERE name='Blackridge Mine'), (SELECT id FROM sensors WHERE location_description='Crusher Unit 1' AND sensor_type='vibration'), 'equipment_failure', 'warning', 'Crusher Unit 1 Vibration Above Threshold', 'Vibration sensor at Crusher Unit 1 reading 5.1 mm/s - above warning threshold. Maintenance review recommended.', 'acknowledged', now() - interval '1 hour', 'Maintenance Head S. Pillai', NULL, NULL),
((SELECT id FROM mines WHERE name='Blackridge Mine'), (SELECT id FROM sensors WHERE location_description='Haulage Road 3' AND sensor_type='dust'), 'sensor_threshold', 'critical', 'Dust Levels Exceeding Limits', 'Dust sensor at Haulage Road 3 reading 2.5 mg/m³ - above warning threshold. Water spray system needs activation.', 'active', now() - interval '15 minutes', NULL, NULL, NULL),
((SELECT id FROM mines WHERE name='Blackridge Mine'), NULL, 'compliance_violation', 'critical', 'Crusher Maintenance Log Overdue', 'Operational compliance CMR-99/112 marked non-compliant. Crusher unit maintenance is overdue by 30 days.', 'active', now() - interval '3 hours', NULL, NULL, NULL),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), (SELECT id FROM sensors WHERE location_description='Pit 2 - Bench 3' AND sensor_type='gas'), 'sensor_threshold', 'emergency', 'Methane Gas EMERGENCY - Pit 2', 'Gas sensor at Pit 2, Bench 3 reading 55 ppm - CRITICAL threshold EXCEEDED. Immediate evacuation and ventilation required.', 'active', now() - interval '10 minutes', NULL, NULL, NULL),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), (SELECT id FROM sensors WHERE location_description='Dragline 1' AND sensor_type='vibration'), 'sensor_threshold', 'warning', 'Dragline 1 Vibration High', 'Vibration at Dragline 1 reading 6.8 mm/s - above warning threshold. Structural inspection recommended.', 'active', now() - interval '20 minutes', NULL, NULL, NULL),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), NULL, 'compliance_violation', 'emergency', 'Multiple Safety Compliance Violations', 'CMR-99/73 (methane drainage) and EPA-1986/S25 (dust suppression) both non-compliant. Mine operations should be reviewed.', 'active', now() - interval '4 hours', NULL, NULL, NULL),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), NULL, 'safety_hazard', 'info', 'Quarterly Evacuation Drill Scheduled', 'Emergency evacuation drill due by 2026-11-10 for Singareni Shaft 3.', 'resolved', now() - interval '1 day', 'Safety Officer G. Iyer', now() - interval '12 hours', 'Drill completed successfully. All workers evacuated in 4.5 minutes.'),
((SELECT id FROM mines WHERE name='Mahendragarh Block B'), NULL, 'compliance_violation', 'critical', 'Mine Suspension - Compliance Overdue', 'Multiple compliance audits overdue for suspended mine. Sensors offline. Full safety review required before resuming operations.', 'active', now() - interval '1 day', NULL, NULL, NULL),
((SELECT id FROM mines WHERE name='Blackridge Mine'), (SELECT id FROM sensors WHERE location_description='Crusher Unit 1' AND sensor_type='noise'), 'equipment_failure', 'warning', 'Noise Sensor Offline - Crusher Unit 1', 'Noise sensor at Crusher Unit 1 has been offline for 2 hours. Sensor may require replacement or recalibration.', 'acknowledged', now() - interval '2 hours', 'Maintenance Head S. Pillai', NULL, NULL)
ON CONFLICT DO NOTHING;

-- ==================== INSPECTIONS ====================
INSERT INTO inspections (mine_id, inspector_name, inspection_type, scheduled_date, completed_date, status, findings, compliance_score, notes) VALUES
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'DGMS Inspector A. Verma', 'safety', '2026-08-15', '2026-08-15', 'completed', 'Overall safety standards satisfactory. Gas levels approaching warning in Section A. Ventilation system operating within parameters.', 88, 'Quarterly DGMS safety inspection completed. Minor improvements to gas monitoring protocol recommended.'),
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'Internal Audit Team', 'routine', '2026-09-10', NULL, 'scheduled', NULL, NULL, 'Routine monthly internal inspection scheduled for next week.'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 'DGMS Inspector B. Nair', 'compliance', '2026-08-01', '2026-08-01', 'completed', 'Compliance gaps identified in crusher maintenance and air quality monitoring. Crusher vibration above threshold.', 72, 'Two non-compliance items found. Corrective action plan required within 30 days.'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 'Env Inspector C. Rao', 'environmental', '2026-09-20', NULL, 'scheduled', NULL, NULL, 'Environmental compliance inspection scheduled. Focus on dust control measures.'),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'DGMS Inspector D. Singh', 'safety', '2026-09-05', NULL, 'in_progress', NULL, NULL, 'Emergency safety inspection triggered by critical gas levels at Pit 2.'),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'Internal Audit Team', 'routine', '2026-08-20', '2026-08-20', 'completed', 'All operational standards met. Equipment maintenance logs current. Worker safety training up to date.', 94, 'Excellent compliance record. Minor suggestion to improve signage in Level 4 corridors.'),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'DGMS Inspector E. Kumar', 'safety', '2026-11-10', NULL, 'scheduled', NULL, NULL, 'Next quarterly safety inspection.'),
((SELECT id FROM mines WHERE name='Mahendragarh Block B'), 'DGMS Inspector F. Ahmed', 'safety', '2026-05-01', '2026-05-01', 'completed', 'Multiple safety violations identified. Methane drainage system not tested. PPE compliance at 45%. Mine recommended for suspension.', 42, 'Mine suspended pending full compliance review. All operations halted.')
ON CONFLICT DO NOTHING;

-- ==================== INSPECTION FINDINGS ====================
INSERT INTO inspection_findings (inspection_id, finding_description, severity, status, recommended_action, resolved_date) VALUES
((SELECT id FROM inspections WHERE inspector_name='DGMS Inspector A. Verma' AND mine_id=(SELECT id FROM mines WHERE name='Greenfield Colliery')), 'Gas levels in Section A approaching warning threshold', 'major', 'open', 'Increase ventilation flow rate by 15% in Section A and install additional gas sensors at Shaft 1 Level 3', NULL),
((SELECT id FROM inspections WHERE inspector_name='DGMS Inspector A. Verma' AND mine_id=(SELECT id FROM mines WHERE name='Greenfield Colliery')), 'Emergency signage in Shaft 2 Level 1 needs replacement', 'minor', 'addressed', 'Replace faded emergency exit signs in Section B', '2026-08-25'),
((SELECT id FROM inspections WHERE inspector_name='DGMS Inspector A. Verma' AND mine_id=(SELECT id FROM mines WHERE name='Greenfield Colliery')), 'PPE usage at 95% compliance - 3 workers without helmets in Section A', 'minor', 'closed', 'Conduct immediate PPE refresher training and enforce spot checks', '2026-08-20'),
((SELECT id FROM inspections WHERE inspector_name='DGMS Inspector B. Nair' AND mine_id=(SELECT id FROM mines WHERE name='Blackridge Mine')), 'Crusher unit maintenance overdue by 30 days', 'critical', 'open', 'Immediately schedule maintenance for Crusher Unit 1 and update maintenance logs', NULL),
((SELECT id FROM inspections WHERE inspector_name='DGMS Inspector B. Nair' AND mine_id=(SELECT id FROM mines WHERE name='Blackridge Mine')), 'Dust levels on Haulage Road 3 exceed permissible limits', 'major', 'open', 'Activate water spray system on Haulage Road 3 and increase frequency of dust suppression', NULL),
((SELECT id FROM inspections WHERE inspector_name='DGMS Inspector B. Nair' AND mine_id=(SELECT id FROM mines WHERE name='Blackridge Mine')), '120 workers pending annual medical checkup', 'major', 'addressed', 'Schedule medical camp within 30 days for all pending workers', NULL),
((SELECT id FROM inspections WHERE inspector_name='DGMS Inspector F. Ahmed' AND mine_id=(SELECT id FROM mines WHERE name='Mahendragarh Block B')), 'Methane drainage system not tested in over 4 months', 'critical', 'open', 'Full system test and certification required before mine can resume operations', NULL),
((SELECT id FROM inspections WHERE inspector_name='DGMS Inspector F. Ahmed' AND mine_id=(SELECT id FROM mines WHERE name='Mahendragarh Block B')), 'PPE compliance at only 45%', 'critical', 'open', 'Complete PPE audit and mandatory retraining for all workers before resumption', NULL),
((SELECT id FROM inspections WHERE inspector_name='DGMS Inspector F. Ahmed' AND mine_id=(SELECT id FROM mines WHERE name='Mahendragarh Block B')), 'All environmental sensors offline', 'major', 'open', 'Replace and recalibrate all environmental sensors before operations resume', NULL),
((SELECT id FROM inspections WHERE inspector_name='Internal Audit Team' AND mine_id=(SELECT id FROM mines WHERE name='Singareni Shaft 3')), 'Signage in Level 4 corridors faded and needs replacement', 'observation', 'addressed', 'Replace corridor signage in Level 4', NULL)
ON CONFLICT DO NOTHING;

-- ==================== INCIDENTS ====================
INSERT INTO incidents (mine_id, incident_type, severity, title, description, occurred_at, reported_by, status, casualties, injuries, financial_loss, root_cause, corrective_actions, resolved_at) VALUES
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'near_miss', 'minor', 'Roof Fall Near Miss - Section B', 'A small section of roof in Section B, Shaft 2 Level 1 showed signs of stress cracking. Workers evacuated before any collapse. No injuries.', '2026-08-20 14:30:00+00', 'Shift Supervisor M. Lal', 'resolved', 0, 0, 0, 'Natural geological stress in older section of mine', 'Installed additional roof bolts and installed stress monitoring sensors. Section reinforced.', '2026-08-22'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 'equipment_failure', 'moderate', 'Conveyor Belt 3 Failure', 'Conveyor belt 3 in haulage area snapped during operation, causing 4 hours of production loss. No injuries reported.', '2026-08-10 09:15:00+00', 'Maintenance Lead R. Pillai', 'resolved', 0, 0, 75000, 'Belt wear exceeded service life - maintenance schedule not updated', 'Replaced belt, updated maintenance tracking system, implemented automated wear monitoring', '2026-08-11'),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'environmental', 'severe', 'Dust Storm from Overburden Dump', 'Strong winds caused excessive dust dispersion from overburden dump at Pit 1, affecting nearby villages. Air quality monitors exceeded limits for 6 hours.', '2026-08-28 15:00:00+00', 'Env Officer F. Khan', 'investigating', 0, 0, 120000, 'Insufficient dust suppression on overburden dumps during high wind conditions', 'Installing additional water sprinkler systems on dumps. Wind-break vegetation planting planned. Implementing wind-speed trigger protocol for operations.', NULL),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'near_miss', 'moderate', 'Dragline Swing Incident', 'Dragline 1 experienced uncontrolled swing due to operator error. No personnel in swing path. Equipment inspection showed vibration above threshold.', '2026-08-15 11:45:00+00', 'Pit Manager D. Rao', 'investigating', 0, 0, 0, 'Operator fatigue and delayed maintenance on swing mechanism', 'Operator retraining scheduled. Dragline pulled from service pending maintenance and structural inspection.', NULL),
((SELECT id FROM mines WHERE name='Mahendragarh Block B'), 'accident', 'severe', 'Worker Injury - Falling Debris', 'Worker suffered leg fracture from falling debris in Section E, Shaft 1. Worker was not wearing required helmet at time of incident.', '2026-04-20 10:30:00+00', 'Safety Officer H. Sharma', 'closed', 0, 1, 250000, 'PPE non-compliance and inadequate roof support in Section E', 'Mine suspended. Full PPE compliance program implemented. Section E reinforced with additional support structures.', '2026-05-15'),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'near_miss', 'minor', 'Water Inflow Near Miss - Level 3', 'Unexpected water inflow detected in Level 3 development heading. Water level sensors triggered alert. Workers evacuated safely.', '2026-07-12 16:20:00+00', 'Shift Supervisor T. Reddy', 'resolved', 0, 0, 15000, 'Encountered unmapped water-bearing fissure during development', 'Sealed fissure with grouting. Updated geological survey. Installed additional water level sensors in development areas.', '2026-07-14')
ON CONFLICT DO NOTHING;

-- ==================== RISK ASSESSMENTS ====================
INSERT INTO risk_assessments (mine_id, overall_risk_score, risk_level, gas_emission_risk, structural_risk, environmental_risk, worker_safety_risk, compliance_risk, assessment_summary, recommended_actions, assessed_at, model_version) VALUES
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 42, 'moderate', 65, 30, 35, 25, 40, 'Gas emission risk is elevated due to methane readings approaching critical thresholds in Section A. Overall structural integrity is good. Compliance is strong with one pending audit. Worker safety protocols well-maintained.', '["Increase ventilation in Section A Shaft 1 Level 3", "Install additional methane sensors in high-risk zones", "Complete pending air quality audit within 2 weeks", "Schedule gas detection training for Section A workers"]'::jsonb, now() - interval '1 hour', 'v2.1'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 58, 'high', 25, 45, 70, 50, 65, 'Environmental risk is high due to dust levels exceeding limits on Haulage Road 3. Crusher maintenance overdue, creating equipment failure risk. 120 workers pending medical checkups. Compliance gaps in operational and environmental categories.', '["Activate water spray system on Haulage Road 3 immediately", "Schedule emergency maintenance for Crusher Unit 1", "Organize medical camp for 120 pending workers within 30 days", "Conduct dust control audit across all haulage roads", "Replace offline noise sensor at Crusher Unit 1"]'::jsonb, now() - interval '30 minutes', 'v2.1'),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 82, 'critical', 90, 65, 85, 60, 80, 'CRITICAL RISK: Methane gas levels at Pit 2 Bench 3 have exceeded critical threshold. Dragline 1 vibration above warning. Dust suppression non-compliant at multiple benches. Two compliance violations active. Immediate action required.', '["IMMEDIATE: Evacuate workers from Pit 2 Bench 3", "IMMEDIATE: Activate emergency ventilation at Pit 2", "Halt Dragline 1 operations pending structural inspection", "Activate dust suppression systems at all benches", "Conduct emergency DGMS inspection", "Review mine operating permit compliance"]'::jsonb, now() - interval '15 minutes', 'v2.1'),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), 28, 'low', 20, 25, 30, 20, 35, 'Low overall risk profile. All sensor readings within normal parameters. Excellent compliance score of 94%. Safety training and medical checkups current. Minor improvement needed in corridor signage.', '["Replace faded signage in Level 4 corridors", "Continue quarterly evacuation drills", "Maintain current compliance standards", "Consider predictive maintenance for aging equipment"]'::jsonb, now() - interval '2 hours', 'v2.1'),
((SELECT id FROM mines WHERE name='Mahendragarh Block B'), 95, 'critical', 40, 80, 90, 95, 95, 'CRITICAL RISK: Mine is suspended. All sensors offline. Multiple compliance violations and overdue audits. Previous severe incident involving worker injury. Full safety review and sensor recommissioning required before any resumption of operations.', '["Do NOT resume operations until full compliance review complete", "Recommission and recalibrate all sensors", "Complete mandatory PPE retraining for all workers", "Structural assessment of Section E", "Methane drainage system full test and certification", "DGMS inspection and approval required before resumption"]'::jsonb, now() - interval '4 hours', 'v2.1')
ON CONFLICT DO NOTHING;

-- ==================== WORKERS ====================
INSERT INTO workers (mine_id, name, role, shift, department, medical_checkup_date, safety_training_date, status) VALUES
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'Ravi Shankar', 'Mining Foreman', 'morning', 'Operations', '2026-06-20', '2026-07-01', 'active'),
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'Amit Verma', 'Driller Operator', 'morning', 'Operations', '2026-06-20', '2026-07-01', 'active'),
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'Suresh Yadav', 'Safety Officer', 'morning', 'Safety', '2026-06-18', '2026-07-05', 'active'),
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'Mohan Lal', 'Shift Supervisor', 'afternoon', 'Operations', '2026-06-22', '2026-07-01', 'active'),
((SELECT id FROM mines WHERE name='Greenfield Colliery'), 'Deepak Kumar', 'Ventilation Technician', 'night', 'Maintenance', '2026-06-15', '2026-06-28', 'active'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 'Raj Patel', 'Mine Supervisor', 'morning', 'Operations', '2026-05-10', '2026-06-15', 'active'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 'Vikram Singh', 'Crusher Operator', 'morning', 'Operations', '2026-05-12', '2026-06-15', 'active'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 'Naveen Das', 'Maintenance Lead', 'afternoon', 'Maintenance', '2026-05-10', '2026-06-15', 'on_leave'),
((SELECT id FROM mines WHERE name='Blackridge Mine'), 'Prakash Joshi', 'Environmental Officer', 'morning', 'Environment', '2026-05-15', '2026-06-20', 'active'),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'Dinesh Rao', 'Pit Manager', 'morning', 'Operations', '2026-06-01', '2026-07-10', 'active'),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'Farhan Khan', 'Dragline Operator', 'morning', 'Operations', '2026-06-05', '2026-07-10', 'suspended'),
((SELECT id FROM mines WHERE name='Kotpalli Open Cast'), 'Ramesh Iyer', 'Blasting Supervisor', 'afternoon', 'Operations', '2026-06-01', '2026-07-10', 'active'),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'Venkat Naidu', 'Mine Manager', 'morning', 'Management', '2026-06-01', '2026-06-15', 'active'),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'Gopal Iyer', 'Safety Officer', 'morning', 'Safety', '2026-06-05', '2026-06-20', 'active'),
((SELECT id FROM mines WHERE name='Singareni Shaft 3'), 'Rahul Bose', 'HR Head', 'morning', 'Administration', '2026-06-01', '2026-06-15', 'active'),
((SELECT id FROM mines WHERE name='Mahendragarh Block B'), 'Harish Sharma', 'Safety Officer', 'morning', 'Safety', '2026-03-15', '2026-04-01', 'on_leave'),
((SELECT id FROM mines WHERE name='Mahendragarh Block B'), 'Sunil Yadav', 'Mine Supervisor', 'morning', 'Operations', '2026-03-15', '2026-04-01', 'suspended')
ON CONFLICT DO NOTHING;