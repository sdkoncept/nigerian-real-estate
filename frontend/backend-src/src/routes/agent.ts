/**
 * Agent Routes
 * Handles agent-specific operations including verification document submission
 */

import { Router, Response } from 'express';
import { authenticate, requireUserType, AuthRequest } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { emailService } from '../services/email.js';
import multer from 'multer';
import path from 'path';

// Extend AuthRequest to include file property
declare module '../middleware/auth.js' {
  interface AuthRequest {
    file?: Express.Multer.File;
  }
}

const router = Router();

// Configure multer for file uploads
// In production, you'd want to use cloud storage (S3, Supabase Storage, etc.)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  },
});

// All agent routes require authentication
router.use(authenticate);

/**
 * Submit verification documents
 * Agents can upload documents for verification
 */
const submitVerificationSchema = z.object({
  document_type: z.enum(['license', 'id', 'credentials']),
  notes: z.string().optional(),
  expiry_date: z.string().optional(),
});

router.post(
  '/verification/submit',
  requireUserType('agent'),
  upload.single('document'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || !supabaseAdmin) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Document file is required' });
      }

      // Validate request body
      const result = submitVerificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors[0].message });
      }

      const { document_type, notes, expiry_date } = result.data;

      // Get agent record
      const { data: agent, error: agentError } = await supabaseAdmin
        .from('agents')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (agentError || !agent) {
        return res.status(404).json({ error: 'Agent profile not found. Please complete your agent profile first.' });
      }

      // Upload file to Supabase Storage
      const fileName = `${req.user.id}/${Date.now()}_${req.file.originalname}`;
      const filePath = `agents/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('verification-documents')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload document. Please try again.' });
      }

      // Get public URL for the uploaded file
      const { data: urlData } = supabaseAdmin.storage
        .from('verification-documents')
        .getPublicUrl(filePath);

      const documentUrl = urlData.publicUrl;

      // Create verification record
      const { data: verification, error: verifyError } = await supabaseAdmin
        .from('verifications')
        .insert({
          entity_type: 'agent',
          entity_id: agent.id,
          document_type,
          document_url: documentUrl,
          status: 'pending',
          review_notes: notes || null,
          expiry_date: expiry_date || null,
        })
        .select()
        .single();

      if (verifyError) {
        console.error('Verification submission error:', verifyError);
        return res.status(500).json({ error: 'Failed to submit verification document' });
      }

      // Send confirmation email
      if (req.user.email) {
        const documentTypeLabel = document_type === 'license' ? 'Real Estate License' 
          : document_type === 'id' ? 'Government ID' 
          : 'Professional Credentials';
        await emailService.sendDocumentSubmittedEmail(req.user.email, documentTypeLabel);
      }

      res.json({
        success: true,
        message: 'Verification document submitted successfully. It will be reviewed within 2-5 business days.',
        verification: {
          id: verification.id,
          document_type,
          status: verification.status,
          submitted_at: verification.created_at,
        },
      });
    } catch (error: any) {
      console.error('Submit verification error:', error);
      res.status(500).json({ error: error.message || 'Failed to submit verification document' });
    }
  }
);

/**
 * Get agent's verification status
 */
router.get('/verification/status', requireUserType('agent'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !supabaseAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get agent record
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id, verification_status')
      .eq('user_id', req.user.id)
      .single();

    if (agentError || !agent) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    // Get all verification submissions
    const { data: verifications, error: verifyError } = await supabaseAdmin
      .from('verifications')
      .select('*')
      .eq('entity_type', 'agent')
      .eq('entity_id', agent.id)
      .order('created_at', { ascending: false });

    if (verifyError) {
      return res.status(500).json({ error: 'Failed to fetch verification status' });
    }

    res.json({
      agent_status: agent.verification_status,
      submissions: verifications || [],
    });
  } catch (error: any) {
    console.error('Get verification status error:', error);
    res.status(500).json({ error: 'Failed to fetch verification status' });
  }
});

/**
 * Get agent profile
 */
router.get('/profile', requireUserType('agent'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !supabaseAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .select('*, profiles:user_id(full_name, email, phone, avatar_url)')
      .eq('user_id', req.user.id)
      .single();

    if (error || !agent) {
      return res.status(404).json({ error: 'Agent profile not found' });
    }

    res.json({ agent });
  } catch (error: any) {
    console.error('Get agent profile error:', error);
    res.status(500).json({ error: 'Failed to fetch agent profile' });
  }
});

/**
 * Update agent profile
 */
const updateAgentSchema = z.object({
  license_number: z.string().optional(),
  company_name: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  years_experience: z.number().int().min(0).optional(),
});

router.patch('/profile', requireUserType('agent'), validate(updateAgentSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !supabaseAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .update({
        ...req.body,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'Agent profile updated successfully',
      agent,
    });
  } catch (error: any) {
    console.error('Update agent profile error:', error);
    res.status(500).json({ error: 'Failed to update agent profile' });
  }
});

export default router;

