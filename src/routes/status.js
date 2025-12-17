/**
 * /api/status - Full status of all projects and phases
 */
const express = require('express');
const router = express.Router();
const { from } = require('../lib/db');

router.get('/', async (req, res) => {
  try {
    // Get all projects
    const { data: projects, error: projErr } = await from('dev_projects')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (projErr) throw projErr;

    // Get all phases with dependency info
    const { data: phases, error: phaseErr } = await from('dev_phases_with_deps')
      .select('*');

    if (phaseErr) throw phaseErr;

    // Get tradelines
    const { data: tradelines, error: tlErr } = await from('dev_tradelines')
      .select('*')
      .order('name');

    if (tlErr) throw tlErr;

    // Get current focus
    const { data: focus, error: focusErr } = await from('dev_current_focus')
      .select('*, project:dev_projects(name, slug), phase:dev_project_phases(name)')
      .is('completed_at', null)
      .order('priority');

    if (focusErr) throw focusErr;

    // Get bug counts per project
    const { data: bugs, error: bugErr } = await from('dev_ai_bugs')
      .select('project_path, severity, status')
      .in('status', ['open', 'investigating']);

    // Group phases by project
    const projectsWithPhases = projects.map(proj => {
      const projectPhases = phases.filter(p => p.project_id === proj.id);
      const projectBugs = bugs?.filter(b => b.project_path?.includes(proj.slug)) || [];
      
      return {
        ...proj,
        phases: projectPhases,
        stats: {
          total_phases: projectPhases.length,
          completed: projectPhases.filter(p => p.status === 'complete').length,
          in_progress: projectPhases.filter(p => p.status === 'in_progress').length,
          blocked: projectPhases.filter(p => p.is_blocked).length,
          open_bugs: projectBugs.length,
          critical_bugs: projectBugs.filter(b => b.severity === 'critical').length
        }
      };
    });

    res.json({
      success: true,
      projects: projectsWithPhases,
      tradelines: tradelines || [],
      current_focus: focus || [],
      summary: {
        total_projects: projects.length,
        active_projects: projects.filter(p => 
          phases.some(ph => ph.project_id === p.id && ph.status === 'in_progress')
        ).length,
        total_phases: phases.length,
        completed_phases: phases.filter(p => p.status === 'complete').length,
        blocked_phases: phases.filter(p => p.is_blocked).length,
        live_tradelines: tradelines?.filter(t => t.status === 'live').length || 0
      }
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
