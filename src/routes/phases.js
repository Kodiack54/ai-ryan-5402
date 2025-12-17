/**
 * Phase Management CRUD
 */
const express = require('express');
const router = express.Router();
const { from } = require('../lib/db');

// GET /api/project/:id/phases - Get phases for a project
router.get('/project/:id/phases', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: phases, error } = await from('dev_project_phases')
      .select('*')
      .eq('project_id', id)
      .order('sort_order');

    if (error) throw error;

    res.json({ success: true, phases: phases || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/project/:id/phase - Add a phase
router.post('/project/:id/phase', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const { data: phase, error } = await from('dev_project_phases')
      .insert({
        project_id: id,
        name,
        description,
        status: status || 'pending',
        sort_order: sort_order || 0
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, phase });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/phase/:id - Update phase status
router.patch('/phase/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle status transitions
    if (updates.status === 'in_progress' && !updates.started_at) {
      updates.started_at = new Date().toISOString();
    }
    if (updates.status === 'complete' && !updates.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    updates.updated_at = new Date().toISOString();

    const { data: phase, error } = await from('dev_project_phases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, phase });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/phase/:id - Delete a phase
router.delete('/phase/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await from('dev_project_phases')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
