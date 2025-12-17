/**
 * Dependency Management
 */
const express = require('express');
const router = express.Router();
const { from } = require('../lib/db');

// GET /api/phase/:id/dependencies - Get dependencies for a phase
router.get('/phase/:id/dependencies', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: deps, error } = await from('dev_phase_dependencies')
      .select(`
        *,
        depends_on:dev_project_phases!depends_on_phase_id(
          id, name, status,
          project:dev_projects(name, slug)
        )
      `)
      .eq('phase_id', id);

    if (error) throw error;

    res.json({ success: true, dependencies: deps || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/dependency - Add a dependency
router.post('/dependency', async (req, res) => {
  try {
    const { phase_id, depends_on_phase_id, dependency_type, notes } = req.body;

    if (!phase_id || !depends_on_phase_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'phase_id and depends_on_phase_id are required' 
      });
    }

    // Prevent self-dependency
    if (phase_id === depends_on_phase_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'A phase cannot depend on itself' 
      });
    }

    const { data: dep, error } = await from('dev_phase_dependencies')
      .insert({
        phase_id,
        depends_on_phase_id,
        dependency_type: dependency_type || 'blocks',
        notes
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, dependency: dep });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/dependency/:id - Remove a dependency
router.delete('/dependency/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await from('dev_phase_dependencies')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/blocked - Get all blocked phases
router.get('/blocked', async (req, res) => {
  try {
    const { data: blocked, error } = await from('dev_phases_with_deps')
      .select('*')
      .eq('is_blocked', true);

    if (error) throw error;

    res.json({ success: true, blocked: blocked || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
