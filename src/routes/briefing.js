/**
 * Briefing Endpoint - For Susan/Claude Integration
 * Provides strategic context at session start
 */
const express = require('express');
const router = express.Router();
const { from } = require('../lib/db');

// GET /api/briefing - Full briefing for Claude
router.get('/', async (req, res) => {
  try {
    // 1. Get current focus
    const { data: focus } = await from('dev_current_focus')
      .select(`
        *,
        project:dev_projects(name, slug),
        phase:dev_project_phases(name, description, status)
      `)
      .is('completed_at', null)
      .order('priority')
      .limit(3);

    // 2. Get recently completed phases (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: recentlyCompleted } = await from('dev_project_phases')
      .select('*, project:dev_projects(name, slug)')
      .eq('status', 'complete')
      .gte('completed_at', weekAgo.toISOString())
      .order('completed_at', { ascending: false })
      .limit(5);

    // 3. Get blocked phases
    const { data: blocked } = await from('dev_phases_with_deps')
      .select('*')
      .eq('is_blocked', true);

    // 4. Get in-progress phases
    const { data: inProgress } = await from('dev_phases_with_deps')
      .select('*')
      .eq('status', 'in_progress');

    // 5. Get tradeline status
    const { data: tradelines } = await from('dev_tradelines')
      .select('name, slug, status, discovery_count, last_run_at, error_count')
      .order('status');

    // 6. Get critical/high bugs
    const { data: bugs } = await from('dev_ai_bugs')
      .select('id, title, severity, status, project_path')
      .in('severity', ['critical', 'high'])
      .in('status', ['open', 'investigating'])
      .limit(10);

    // 7. Build the briefing text
    let briefingText = '=== RYAN\'S PROJECT BRIEFING ===\n\n';

    // Current Focus
    if (focus?.length > 0) {
      briefingText += '🎯 CURRENT FOCUS:\n';
      focus.forEach((f, i) => {
        briefingText += `   ${i + 1}. ${f.project?.name} - ${f.phase?.name}\n`;
        if (f.rationale) briefingText += `      Why: ${f.rationale}\n`;
      });
      briefingText += '\n';
    }

    // In Progress
    if (inProgress?.length > 0) {
      briefingText += '🔄 IN PROGRESS:\n';
      inProgress.forEach(p => {
        briefingText += `   • ${p.project_name}: ${p.name}\n`;
      });
      briefingText += '\n';
    }

    // Blocked
    if (blocked?.length > 0) {
      briefingText += '🚫 BLOCKED (waiting on dependencies):\n';
      blocked.forEach(p => {
        briefingText += `   • ${p.project_name}: ${p.name} (${p.blocking_deps_count} blocker(s))\n`;
      });
      briefingText += '\n';
    }

    // Recently Completed
    if (recentlyCompleted?.length > 0) {
      briefingText += '✅ RECENTLY COMPLETED:\n';
      recentlyCompleted.forEach(p => {
        const date = new Date(p.completed_at).toLocaleDateString();
        briefingText += `   • ${p.project?.name}: ${p.name} (${date})\n`;
      });
      briefingText += '\n';
    }

    // Tradelines
    const liveTradelines = tradelines?.filter(t => t.status === 'live') || [];
    const testingTradelines = tradelines?.filter(t => t.status === 'testing') || [];
    if (tradelines?.length > 0) {
      briefingText += '📊 TRADELINES:\n';
      briefingText += `   Live: ${liveTradelines.length} | Testing: ${testingTradelines.length} | Total: ${tradelines.length}\n`;
      liveTradelines.forEach(t => {
        briefingText += `   • ${t.name}: ${t.discovery_count} discoveries\n`;
      });
      briefingText += '\n';
    }

    // Bugs
    if (bugs?.length > 0) {
      briefingText += '🐛 ATTENTION NEEDED:\n';
      bugs.forEach(b => {
        briefingText += `   • [${b.severity.toUpperCase()}] ${b.title}\n`;
      });
      briefingText += '\n';
    }

    briefingText += '=== END BRIEFING ===';

    res.json({
      success: true,
      briefing: briefingText,
      data: {
        current_focus: focus || [],
        in_progress: inProgress || [],
        blocked: blocked || [],
        recently_completed: recentlyCompleted || [],
        tradelines: {
          live: liveTradelines,
          testing: testingTradelines,
          total: tradelines?.length || 0
        },
        bugs: bugs || []
      }
    });
  } catch (error) {
    console.error('Briefing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
