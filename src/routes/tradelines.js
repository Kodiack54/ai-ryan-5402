/**
 * Tradeline Tracking
 */
const express = require('express');
const router = express.Router();
const { from } = require('../lib/db');

// GET /api/tradelines - Get all tradelines
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = from('dev_tradelines').select('*').order('name');
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data: tradelines, error } = await query;

    if (error) throw error;

    // Add summary stats
    const stats = {
      total: tradelines?.length || 0,
      live: tradelines?.filter(t => t.status === 'live').length || 0,
      testing: tradelines?.filter(t => t.status === 'testing').length || 0,
      development: tradelines?.filter(t => t.status === 'development').length || 0,
      pending: tradelines?.filter(t => t.status === 'pending').length || 0,
      total_discoveries: tradelines?.reduce((sum, t) => sum + (t.discovery_count || 0), 0) || 0
    };

    res.json({ success: true, tradelines: tradelines || [], stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tradeline - Add a tradeline
router.post('/', async (req, res) => {
  try {
    const { name, slug, status, port_number, server_path, droplet_ip, notes } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, error: 'name and slug are required' });
    }

    const { data: tradeline, error } = await from('dev_tradelines')
      .insert({
        name,
        slug,
        status: status || 'pending',
        port_number,
        server_path,
        droplet_ip,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, tradeline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/tradeline/:id - Update tradeline
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Track status changes
    if (updates.status === 'live' && !updates.last_success_at) {
      updates.last_success_at = new Date().toISOString();
    }

    updates.updated_at = new Date().toISOString();

    const { data: tradeline, error } = await from('dev_tradelines')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, tradeline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tradeline/:id/run - Log a tradeline run
router.post('/:id/run', async (req, res) => {
  try {
    const { id } = req.params;
    const { discoveries, error: runError } = req.body;

    const updates = {
      last_run_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (runError) {
      updates.error_count = from.raw('error_count + 1');
      updates.last_error = runError;
    } else {
      updates.last_success_at = new Date().toISOString();
      updates.last_error = null;
      if (discoveries) {
        updates.discovery_count = from.raw(`discovery_count + ${parseInt(discoveries)}`);
      }
    }

    const { data: tradeline, error } = await from('dev_tradelines')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, tradeline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
