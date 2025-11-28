/**
 * User Reporting Routes
 * Allows users to report suspicious properties, agents, or users
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate, reportSchema } from '../middleware/validation.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

// All report routes require authentication
router.use(authenticate);

/**
 * Create a new report
 */
router.post('/', validate(reportSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin || !req.user) {
      return res.status(500).json({ error: 'Server error' });
    }

    const { entity_type, entity_id, reason, description } = req.body;

    // Check if entity exists
    let entityExists = false;
    if (entity_type === 'property') {
      const { data } = await supabaseAdmin
        .from('properties')
        .select('id')
        .eq('id', entity_id)
        .single();
      entityExists = !!data;
    } else if (entity_type === 'agent') {
      const { data } = await supabaseAdmin
        .from('agents')
        .select('id')
        .eq('id', entity_id)
        .single();
      entityExists = !!data;
    } else if (entity_type === 'user') {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', entity_id)
        .single();
      entityExists = !!data;
    }

    if (!entityExists) {
      return res.status(404).json({ error: `${entity_type} not found` });
    }

    // Check if user already reported this entity
    const { data: existingReport } = await supabaseAdmin
      .from('reports')
      .select('id')
      .eq('reporter_id', req.user.id)
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .single();

    if (existingReport) {
      return res.status(400).json({ 
        error: 'You have already reported this entity',
        report_id: existingReport.id 
      });
    }

    // Create report
    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .insert({
        reporter_id: req.user.id,
        entity_type,
        entity_id,
        reason,
        description,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report,
    });
  } catch (error: any) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

/**
 * Get user's own reports
 */
router.get('/my-reports', async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin || !req.user) {
      return res.status(500).json({ error: 'Server error' });
    }

    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('reporter_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ reports: data || [] });
  } catch (error: any) {
    console.error('Get user reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * Get report by ID (user can only see their own reports)
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin || !req.user) {
      return res.status(500).json({ error: 'Server error' });
    }

    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', req.params.id)
      .eq('reporter_id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report: data });
  } catch (error: any) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

export default router;

