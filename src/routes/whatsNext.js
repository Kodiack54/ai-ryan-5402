/**
 * What's Next - Ryan's Priority Engine
 * The core intelligence for recommending next focus
 */
const express = require('express');
const router = express.Router();
const { from } = require('../lib/db');

// GET /api/whats-next - Get Ryan's recommendation
router.get('/', async (req, res) => {
  try {
    // 1. Get all phases with dependency info
    const { data: phases, error: phaseErr } = await from('dev_phases_with_deps')
      .select('*');
    if (phaseErr) throw phaseErr;

    // 2. Get current focus (if any)
    const { data: currentFocus } = await from('dev_current_focus')
      .select('*, phase:dev_project_phases(name, status)')
      .is('completed_at', null)
      .order('priority')
      .limit(1)
      .single();

    // 3. Get critical bugs
    const { data: criticalBugs } = await from('dev_ai_bugs')
      .select('*')
      .eq('severity', 'critical')
      .in('status', ['open', 'investigating']);

    // 4. Get tradelines in testing (need monitoring)
    const { data: testingTradelines } = await from('dev_tradelines')
      .select('*')
      .eq('status', 'testing');

    // 5. Filter to actionable phases
    const actionable = phases.filter(p => {
      // Must be pending or in_progress
      if (!['pending', 'in_progress'].includes(p.status)) return false;
      // Must not be blocked
      if (p.is_blocked) return false;
      return true;
    });

    // 6. Score and rank phases
    const scored = actionable.map(phase => {
      let score = 0;
      let reasons = [];

      // In-progress phases get priority
      if (phase.status === 'in_progress') {
        score += 100;
        reasons.push('Already in progress');
      }

      // Phases that unblock others get priority
      const unblocks = phases.filter(p => 
        p.is_blocked && 
        phases.some(blocker => blocker.id === phase.id)
      ).length;
      if (unblocks > 0) {
        score += unblocks * 20;
        reasons.push(`Unblocks ${unblocks} other phase(s)`);
      }

      // Active projects (Kodiack, Core, Engine, Portal, Sources) get priority
      const activeProjects = ['kodiack', 'core', 'engine', 'portal', 'sources'];
      if (activeProjects.some(p => phase.project_slug?.includes(p))) {
        score += 10;
        reasons.push('Active project');
      }

      // Lower sort_order = earlier phase = higher priority
      score += Math.max(0, 10 - phase.sort_order);

      return { ...phase, score, reasons };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // 7. Build recommendation
    const topPick = scored[0];
    const alternatives = scored.slice(1, 4);

    // 8. Check for blockers/warnings
    const warnings = [];
    
    if (criticalBugs?.length > 0) {
      warnings.push({
        type: 'critical_bugs',
        message: `${criticalBugs.length} critical bug(s) need attention`,
        items: criticalBugs.map(b => ({ id: b.id, title: b.title }))
      });
    }

    if (testingTradelines?.length > 0) {
      warnings.push({
        type: 'monitoring',
        message: `${testingTradelines.length} tradeline(s) in testing - monitor before adding more`,
        items: testingTradelines.map(t => ({ id: t.id, name: t.name }))
      });
    }

    // 9. Build response
    const recommendation = topPick ? {
      project: topPick.project_name,
      project_slug: topPick.project_slug,
      phase: topPick.name,
      phase_id: topPick.id,
      status: topPick.status,
      score: topPick.score,
      reasons: topPick.reasons,
      description: topPick.description
    } : null;

    res.json({
      success: true,
      recommendation,
      alternatives: alternatives.map(a => ({
        project: a.project_name,
        phase: a.name,
        phase_id: a.id,
        score: a.score
      })),
      current_focus: currentFocus,
      warnings,
      summary: {
        total_phases: phases.length,
        actionable: actionable.length,
        blocked: phases.filter(p => p.is_blocked).length,
        in_progress: phases.filter(p => p.status === 'in_progress').length,
        complete: phases.filter(p => p.status === 'complete').length
      }
    });
  } catch (error) {
    console.error('WhatsNext error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/complete - Mark current focus as complete, get next
router.post('/complete', async (req, res) => {
  try {
    const { phase_id, notes } = req.body;

    // 1. Mark current focus as completed
    if (phase_id) {
      await from('dev_current_focus')
        .update({ completed_at: new Date().toISOString() })
        .eq('phase_id', phase_id)
        .is('completed_at', null);

      // 2. Mark the phase itself as complete
      await from('dev_project_phases')
        .update({ 
          status: 'complete',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', phase_id);
    }

    // 3. Get next recommendation (call whats-next logic)
    // Redirect to GET /api/whats-next
    res.redirect(307, '/api/whats-next');
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/focus - Set current focus
router.post('/focus', async (req, res) => {
  try {
    const { phase_id, rationale } = req.body;

    if (!phase_id) {
      return res.status(400).json({ success: false, error: 'phase_id is required' });
    }

    // Get phase info
    const { data: phase } = await from('dev_project_phases')
      .select('*, project:dev_projects(id, name)')
      .eq('id', phase_id)
      .single();

    if (!phase) {
      return res.status(404).json({ success: false, error: 'Phase not found' });
    }

    // Mark phase as in_progress
    await from('dev_project_phases')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', phase_id);

    // Create focus record
    const { data: focus, error } = await from('dev_current_focus')
      .insert({
        project_id: phase.project.id,
        phase_id,
        priority: 1,
        rationale: rationale || `Focus set on ${phase.name}`,
        set_by: 'user'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, focus, phase });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
