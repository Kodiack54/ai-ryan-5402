-- Seed Data for Ryan Project Manager
-- Run in Supabase SQL Editor

-- ============================================
-- 1. INSERT 8 PROJECTS
-- ============================================

INSERT INTO dev_projects (name, slug, description, is_active, sort_order) VALUES
('Kodiack Studios', 'kodiack-studios', 'Dev platform - Studio + Dashboard + AI team', true, 1),
('NextBid Core', 'nextbid-core', 'Infrastructure - authenticator, gateway, patcher', true, 2),
('NextBid Engine', 'nextbid-engine', '20 tradelines for gov/state/federal/local bid discovery', true, 3),
('NextBid Portal', 'nextbid-portal', 'Full CRM - user-facing bid management', true, 4),
('NextBid Sources', 'nextbid-sources', 'Finding/authenticating procurement portals', true, 5),
('NextBidder', 'nextbidder', 'Goods auction - GSA price comparison, margin flagging', true, 6),
('NextTech', 'nexttech', 'Field ops - job assignment, SOP, field worker tracking', true, 7),
('NextTask', 'nexttask', 'MMO-style task system - feeds AI with real-world data', true, 8)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- 2. INSERT PHASES FOR EACH PROJECT
-- ============================================

-- Kodiack Studios phases
INSERT INTO dev_project_phases (project_id, name, description, status, sort_order, completed_at)
SELECT id, 'Dev Dashboard base', 'Basic monitoring dashboard', 'complete', 1, NOW() - INTERVAL '30 days'
FROM dev_projects WHERE slug = 'kodiack-studios';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order, completed_at)
SELECT id, 'Dev Studio + AI team', 'AI-powered development interface with Claude, Chad, Susan, Clair', 'complete', 2, NOW() - INTERVAL '7 days'
FROM dev_projects WHERE slug = 'kodiack-studios';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order, started_at)
SELECT id, 'Ryan project management', 'Strategic project oversight across all projects', 'in_progress', 3, NOW()
FROM dev_projects WHERE slug = 'kodiack-studios';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Full CI/CD pipeline', 'Automated build, test, deploy across all projects', 'pending', 4
FROM dev_projects WHERE slug = 'kodiack-studios';

-- NextBid Core phases
INSERT INTO dev_project_phases (project_id, name, description, status, sort_order, completed_at)
SELECT id, 'Authenticator', 'User authentication system', 'complete', 1, NOW() - INTERVAL '60 days'
FROM dev_projects WHERE slug = 'nextbid-core';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order, completed_at)
SELECT id, 'Gateway', 'API gateway and routing', 'complete', 2, NOW() - INTERVAL '45 days'
FROM dev_projects WHERE slug = 'nextbid-core';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Patcher/deployment system', 'Automated patching and deployment', 'pending', 3
FROM dev_projects WHERE slug = 'nextbid-core';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Multi-droplet orchestration', 'Scale across multiple servers', 'pending', 4
FROM dev_projects WHERE slug = 'nextbid-core';

-- NextBid Engine phases
INSERT INTO dev_project_phases (project_id, name, description, status, sort_order, completed_at)
SELECT id, 'Stage 1: Single tradeline discovery', 'Low Voltage tradeline live and working', 'complete', 1, NOW() - INTERVAL '14 days'
FROM dev_projects WHERE slug = 'nextbid-engine';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Stage 2: Multi-tradeline support', 'Launch 5 tradelines, monitor for 1 week', 'pending', 2
FROM dev_projects WHERE slug = 'nextbid-engine';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Stage 3: Canonizer', 'Duplicate detection across tradelines', 'pending', 3
FROM dev_projects WHERE slug = 'nextbid-engine';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Stage 4: AI-assisted proposals', 'Extract proposal data with AI', 'pending', 4
FROM dev_projects WHERE slug = 'nextbid-engine';

-- NextBid Portal phases
INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Discovery filters UI', 'Filter opportunities by tradeline, location, etc', 'pending', 1
FROM dev_projects WHERE slug = 'nextbid-portal';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Bid detail pages + pipeline', 'Full bid details and pipeline view', 'pending', 2
FROM dev_projects WHERE slug = 'nextbid-portal';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Proposal writing workflow', 'Create and manage proposals', 'pending', 3
FROM dev_projects WHERE slug = 'nextbid-portal';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'AI proposal integration', 'AI-powered proposal writing', 'pending', 4
FROM dev_projects WHERE slug = 'nextbid-portal';

-- NextBid Sources phases
INSERT INTO dev_project_phases (project_id, name, description, status, sort_order, started_at)
SELECT id, 'Portal discovery', 'Find procurement portals (~50 authenticated, 350+ in CA)', 'in_progress', 1, NOW() - INTERVAL '21 days'
FROM dev_projects WHERE slug = 'nextbid-sources';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Bulk authentication/validation', 'Validate and authenticate sources at scale', 'pending', 2
FROM dev_projects WHERE slug = 'nextbid-sources';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Integration with Engine', 'Feed validated sources to Engine tradelines', 'pending', 3
FROM dev_projects WHERE slug = 'nextbid-sources';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Auto-add to live tradelines', 'Automatically add new sources to production', 'pending', 4
FROM dev_projects WHERE slug = 'nextbid-sources';

-- NextBidder phases (Pending project)
INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'GSA price scraping', 'Scrape GSA pricing data', 'pending', 1
FROM dev_projects WHERE slug = 'nextbidder';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Distributor price comparison', 'Compare prices across distributors', 'pending', 2
FROM dev_projects WHERE slug = 'nextbidder';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Margin calculator + deal flagging', 'Calculate margins, flag good deals', 'pending', 3
FROM dev_projects WHERE slug = 'nextbidder';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Auto-bid recommendations', 'AI recommends bids based on margins', 'pending', 4
FROM dev_projects WHERE slug = 'nextbidder';

-- NextTech phases (Pending project)
INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Job assignment system', 'Assign jobs to field workers', 'pending', 1
FROM dev_projects WHERE slug = 'nexttech';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'SOP gathering interface', 'Capture standard operating procedures', 'pending', 2
FROM dev_projects WHERE slug = 'nexttech';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Field worker tracking', 'Track worker locations and status', 'pending', 3
FROM dev_projects WHERE slug = 'nexttech';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Job completion reporting', 'Report completed jobs to NextTask', 'pending', 4
FROM dev_projects WHERE slug = 'nexttech';

-- NextTask phases (Pending project)
INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Task definition system', 'Define task types and requirements', 'pending', 1
FROM dev_projects WHERE slug = 'nexttask';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Worker task assignment (MMO-style)', 'Gamified task assignment to workers', 'pending', 2
FROM dev_projects WHERE slug = 'nexttask';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'Data collection', 'Gather competitor prices, install times, costs', 'pending', 3
FROM dev_projects WHERE slug = 'nexttask';

INSERT INTO dev_project_phases (project_id, name, description, status, sort_order)
SELECT id, 'AI training data pipeline', 'Feed collected data to Portal AI proposals', 'pending', 4
FROM dev_projects WHERE slug = 'nexttask';

-- ============================================
-- 3. ADD DEPENDENCIES
-- ============================================

-- Portal Phase 1 depends on Engine Stage 2
INSERT INTO dev_phase_dependencies (phase_id, depends_on_phase_id, dependency_type, notes)
SELECT 
  p1.id,
  p2.id,
  'blocks',
  'Portal needs multi-tradeline data from Engine'
FROM dev_project_phases p1
JOIN dev_projects proj1 ON p1.project_id = proj1.id
JOIN dev_project_phases p2 ON true
JOIN dev_projects proj2 ON p2.project_id = proj2.id
WHERE proj1.slug = 'nextbid-portal' AND p1.name = 'Discovery filters UI'
  AND proj2.slug = 'nextbid-engine' AND p2.name = 'Stage 2: Multi-tradeline support';

-- Portal Phase 4 depends on NextTask Phase 2
INSERT INTO dev_phase_dependencies (phase_id, depends_on_phase_id, dependency_type, notes)
SELECT 
  p1.id,
  p2.id,
  'blocks',
  'AI proposals need real-world data from NextTask'
FROM dev_project_phases p1
JOIN dev_projects proj1 ON p1.project_id = proj1.id
JOIN dev_project_phases p2 ON true
JOIN dev_projects proj2 ON p2.project_id = proj2.id
WHERE proj1.slug = 'nextbid-portal' AND p1.name = 'AI proposal integration'
  AND proj2.slug = 'nexttask' AND p2.name = 'Worker task assignment (MMO-style)';

-- Sources Phase 3 depends on Engine Stage 2
INSERT INTO dev_phase_dependencies (phase_id, depends_on_phase_id, dependency_type, notes)
SELECT 
  p1.id,
  p2.id,
  'blocks',
  'Sources integration needs Engine multi-tradeline support'
FROM dev_project_phases p1
JOIN dev_projects proj1 ON p1.project_id = proj1.id
JOIN dev_project_phases p2 ON true
JOIN dev_projects proj2 ON p2.project_id = proj2.id
WHERE proj1.slug = 'nextbid-sources' AND p1.name = 'Integration with Engine'
  AND proj2.slug = 'nextbid-engine' AND p2.name = 'Stage 2: Multi-tradeline support';

-- NextBidder Phase 1 depends on Portal Phase 2
INSERT INTO dev_phase_dependencies (phase_id, depends_on_phase_id, dependency_type, notes)
SELECT 
  p1.id,
  p2.id,
  'soft',
  'NextBidder can start after Portal has bid pages'
FROM dev_project_phases p1
JOIN dev_projects proj1 ON p1.project_id = proj1.id
JOIN dev_project_phases p2 ON true
JOIN dev_projects proj2 ON p2.project_id = proj2.id
WHERE proj1.slug = 'nextbidder' AND p1.name = 'GSA price scraping'
  AND proj2.slug = 'nextbid-portal' AND p2.name = 'Bid detail pages + pipeline';

-- NextTech Phase 1 depends on Portal Phase 3
INSERT INTO dev_phase_dependencies (phase_id, depends_on_phase_id, dependency_type, notes)
SELECT 
  p1.id,
  p2.id,
  'soft',
  'NextTech can start after Portal has proposal workflow'
FROM dev_project_phases p1
JOIN dev_projects proj1 ON p1.project_id = proj1.id
JOIN dev_project_phases p2 ON true
JOIN dev_projects proj2 ON p2.project_id = proj2.id
WHERE proj1.slug = 'nexttech' AND p1.name = 'Job assignment system'
  AND proj2.slug = 'nextbid-portal' AND p2.name = 'Proposal writing workflow';

-- NextTask Phase 1 depends on NextTech Phase 1
INSERT INTO dev_phase_dependencies (phase_id, depends_on_phase_id, dependency_type, notes)
SELECT 
  p1.id,
  p2.id,
  'blocks',
  'NextTask needs NextTech job system to assign tasks'
FROM dev_project_phases p1
JOIN dev_projects proj1 ON p1.project_id = proj1.id
JOIN dev_project_phases p2 ON true
JOIN dev_projects proj2 ON p2.project_id = proj2.id
WHERE proj1.slug = 'nexttask' AND p1.name = 'Task definition system'
  AND proj2.slug = 'nexttech' AND p2.name = 'Job assignment system';

-- ============================================
-- 4. ADD LOW VOLTAGE TRADELINE
-- ============================================

INSERT INTO dev_tradelines (name, slug, status, port_number, discovery_count, notes)
VALUES ('Low Voltage', 'low-voltage', 'live', 5101, 0, 'First tradeline - working great')
ON CONFLICT (slug) DO UPDATE SET status = 'live';

-- ============================================
-- 5. SET CURRENT FOCUS
-- ============================================

INSERT INTO dev_current_focus (project_id, phase_id, priority, rationale, set_by)
SELECT 
  proj.id,
  p.id,
  1,
  'Building Ryan to manage all 8 projects strategically',
  'system'
FROM dev_project_phases p
JOIN dev_projects proj ON p.project_id = proj.id
WHERE proj.slug = 'kodiack-studios' AND p.name = 'Ryan project management';

-- Done!
