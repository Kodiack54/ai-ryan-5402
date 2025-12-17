-- Seed Phases for Existing Projects
-- Run in Supabase SQL Editor

-- First check what projects exist
-- SELECT id, name, slug FROM dev_projects WHERE is_active = true ORDER BY sort_order;

-- ============================================
-- ADD PHASES TO EXISTING PROJECTS
-- (Uses slug to find project_id)
-- ============================================

-- For each project that exists, add its phases
-- Adjust the WHERE slug = 'xxx' to match your actual slugs

-- Example for dev-studio or kodiack-studios (adjust slug as needed):
INSERT INTO dev_project_phases (project_id, name, description, status, sort_order, started_at)
SELECT id, 'Ryan project management', 'Strategic project oversight', 'in_progress', 1, NOW()
FROM dev_projects WHERE slug IN ('dev-studio', 'kodiack-studios', 'studio')
ON CONFLICT DO NOTHING;

-- Engine phases
INSERT INTO dev_project_phases (project_id, name, description, status, sort_order, completed_at)
SELECT id, 'Stage 1: Single tradeline', 'Low Voltage live', 'complete', 1, NOW() - INTERVAL '14 days'
FROM dev_projects WHERE slug IN ('engine', 'nextbid-engine')
ON CONFLICT DO NOTHING;

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Stage 2: Multi-tradeline', 'Launch 5 tradelines', 'pending', 2
FROM dev_projects WHERE slug IN ('engine', 'nextbid-engine')
ON CONFLICT DO NOTHING;

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Stage 3: Canonizer', 'Duplicate detection', 'pending', 3
FROM dev_projects WHERE slug IN ('engine', 'nextbid-engine')
ON CONFLICT DO NOTHING;

-- Sources phases  
INSERT INTO dev_project_phases (project_id, name, description, status, sort_order, started_at)
SELECT id, 'Portal discovery', '350+ in CA', 'in_progress', 1, NOW() - INTERVAL '21 days'
FROM dev_projects WHERE slug IN ('source', 'sources', 'nextbid-sources')
ON CONFLICT DO NOTHING;

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Bulk authentication', 'Validate sources', 'pending', 2
FROM dev_projects WHERE slug IN ('source', 'sources', 'nextbid-sources')
ON CONFLICT DO NOTHING;

-- Portal phases
INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Discovery filters UI', 'Filter by tradeline/location', 'pending', 1
FROM dev_projects WHERE slug IN ('portal', 'nextbid-portal')
ON CONFLICT DO NOTHING;

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Bid detail pages', 'Full bid details', 'pending', 2
FROM dev_projects WHERE slug IN ('portal', 'nextbid-portal')
ON CONFLICT DO NOTHING;

-- Low Voltage tradeline
INSERT INTO dev_tradelines (name, slug, status, port_number, notes)
VALUES ('Low Voltage', 'low-voltage', 'live', 5101, 'First tradeline - working')
ON CONFLICT (slug) DO UPDATE SET status = 'live';

-- Done! Now check what was created:
-- SELECT p.name as project, ph.name as phase, ph.status 
-- FROM dev_project_phases ph 
-- JOIN dev_projects p ON ph.project_id = p.id 
-- ORDER BY p.sort_order, ph.sort_order;
