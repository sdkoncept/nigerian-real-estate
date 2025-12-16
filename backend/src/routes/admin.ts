/**
 * Admin Routes
 * Admin verification panel and management endpoints
 */

import { Router, Response } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';
import { emailService } from '../services/email.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * Get all verifications (with optional status filter)
 */
router.get('/verifications', async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const status = req.query.status as string | undefined;
    let query = supabaseAdmin
      .from('verifications')
      .select('*, profiles:reviewed_by(full_name, email)')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ verifications: data || [] });
  } catch (error: any) {
    console.error('Get verifications error:', error);
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
});

/**
 * Get pending verifications (for backward compatibility)
 */
router.get('/verifications/pending', async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabaseAdmin
      .from('verifications')
      .select('*, profiles:reviewed_by(full_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ verifications: data || [] });
  } catch (error: any) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
});

/**
 * Approve verification
 */
const approveSchema = z.object({
  verification_id: schemas.uuid,
  review_notes: z.string().optional(),
});

router.post('/verifications/approve', validate(approveSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin || !req.user) {
      return res.status(500).json({ error: 'Server error' });
    }

    const { verification_id, review_notes } = req.body;

    // Update verification status
    const { data: verification, error: verifyError } = await supabaseAdmin
      .from('verifications')
      .update({
        status: 'approved',
        reviewed_by: req.user.id,
        review_notes: review_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', verification_id)
      .select()
      .single();

    if (verifyError || !verification) {
      return res.status(500).json({ error: 'Failed to approve verification' });
    }

    // Update entity verification status
    if (verification.entity_type === 'agent') {
      const { data: agent } = await supabaseAdmin
        .from('agents')
        .update({ verification_status: 'verified' })
        .eq('id', verification.entity_id)
        .select('user_id, profiles:user_id(email)')
        .single();

      // Send email notification
      if (agent && agent.profiles) {
        await emailService.sendVerificationApprovedEmail(
          (agent.profiles as any).email,
          'agent',
          review_notes || undefined
        );
      }
    } else if (verification.entity_type === 'property') {
      const { data: property } = await supabaseAdmin
        .from('properties')
        .update({ verification_status: 'verified' })
        .eq('id', verification.entity_id)
        .select('created_by, profiles:created_by(email)')
        .single();

      // Send email notification
      if (property && property.profiles) {
        await emailService.sendVerificationApprovedEmail(
          (property.profiles as any).email,
          'property',
          review_notes || undefined
        );
      }
    }

    res.json({ 
      success: true, 
      message: 'Verification approved',
      verification 
    });
  } catch (error: any) {
    console.error('Approve verification error:', error);
    res.status(500).json({ error: 'Failed to approve verification' });
  }
});

/**
 * Reject verification
 */
const rejectSchema = z.object({
  verification_id: schemas.uuid,
  review_notes: z.string().min(10, 'Review notes required'),
});

router.post('/verifications/reject', validate(rejectSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin || !req.user) {
      return res.status(500).json({ error: 'Server error' });
    }

    const { verification_id, review_notes } = req.body;

    const { data: verification, error: verifyError } = await supabaseAdmin
      .from('verifications')
      .update({
        status: 'rejected',
        reviewed_by: req.user.id,
        review_notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', verification_id)
      .select()
      .single();

    if (verifyError || !verification) {
      return res.status(500).json({ error: 'Failed to reject verification' });
    }

    // Update entity verification status
    if (verification.entity_type === 'agent') {
      const { data: agent } = await supabaseAdmin
        .from('agents')
        .update({ verification_status: 'rejected' })
        .eq('id', verification.entity_id)
        .select('user_id, profiles:user_id(email)')
        .single();

      // Send email notification
      if (agent && agent.profiles) {
        await emailService.sendVerificationRejectedEmail(
          (agent.profiles as any).email,
          'agent',
          review_notes
        );
      }
    } else if (verification.entity_type === 'property') {
      const { data: property } = await supabaseAdmin
        .from('properties')
        .update({ verification_status: 'rejected' })
        .eq('id', verification.entity_id)
        .select('created_by, profiles:created_by(email)')
        .single();

      // Send email notification
      if (property && property.profiles) {
        await emailService.sendVerificationRejectedEmail(
          (property.profiles as any).email,
          'property',
          review_notes
        );
      }
    }

    res.json({ 
      success: true, 
      message: 'Verification rejected',
      verification 
    });
  } catch (error: any) {
    console.error('Reject verification error:', error);
    res.status(500).json({ error: 'Failed to reject verification' });
  }
});

/**
 * Get all reports
 */
router.get('/reports', async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*, reporter:reporter_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ reports: data || [] });
  } catch (error: any) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * Get report by ID
 */
router.get('/reports/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*, reporter:reporter_id(full_name, email)')
      .eq('id', req.params.id)
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

/**
 * Update report status
 */
const updateReportSchema = z.object({
  status: z.enum(['new', 'investigating', 'resolved', 'dismissed']),
  admin_notes: z.string().optional(),
});

router.patch('/reports/:id', validate(updateReportSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin || !req.user) {
      return res.status(500).json({ error: 'Server error' });
    }

    const { status, admin_notes } = req.body;

    const { data, error } = await supabaseAdmin
      .from('reports')
      .update({
        status,
        admin_notes,
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ 
      success: true, 
      message: 'Report updated',
      report: data 
    });
  } catch (error: any) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

/**
 * Get all users
 */
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ users: data || [] });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * Get user by ID
 */
router.get('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get additional info
    const { data: properties } = await supabaseAdmin
      .from('properties')
      .select('id')
      .eq('created_by', req.params.id);

    const { data: agent } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('user_id', req.params.id)
      .single();

    res.json({
      user: data,
      properties_count: properties?.length || 0,
      agent_profile: agent || null,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * Update user
 */
const updateUserSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  user_type: z.enum(['buyer', 'seller', 'agent', 'admin']).optional(),
  is_verified: z.boolean().optional(),
});

router.patch('/users/:id', validate(updateUserSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin || !req.user) {
      return res.status(500).json({ error: 'Server error' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...req.body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: data,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * Get dashboard stats
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const [
      usersResult,
      propertiesResult,
      agentsResult,
      verificationsResult,
      reportsResult,
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('properties').select('id, is_active, verification_status', { count: 'exact' }),
      supabaseAdmin.from('agents').select('id, verification_status', { count: 'exact' }),
      supabaseAdmin.from('verifications').select('id').eq('status', 'pending'),
      supabaseAdmin.from('reports').select('id').eq('status', 'new'),
    ]);

    const stats = {
      totalUsers: usersResult.count || 0,
      totalProperties: propertiesResult.count || 0,
      totalAgents: agentsResult.count || 0,
      pendingVerifications: verificationsResult.data?.length || 0,
      pendingReports: reportsResult.data?.length || 0,
      activeProperties: propertiesResult.data?.filter((p: any) => p.is_active).length || 0,
      verifiedAgents: agentsResult.data?.filter((a: any) => a.verification_status === 'verified').length || 0,
      verifiedProperties: propertiesResult.data?.filter((p: any) => p.verification_status === 'verified').length || 0,
    };

    res.json({ stats });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * Send email notification for admin message
 */
const sendMessageEmailSchema = z.object({
  recipientId: z.string().uuid(),
  propertyId: z.string().uuid(),
  messageId: z.string().uuid(),
});

router.post('/messages/send-email', validate(sendMessageEmailSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId, propertyId, messageId } = req.body;

    // Get recipient profile
    const { data: recipient, error: recipientError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Get property details
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('title, id')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Get all messages in this conversation
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('property_id', propertyId)
      .or(`sender_id.eq.${req.user!.id},recipient_id.eq.${req.user!.id}`)
      .order('created_at', { ascending: true });

    // Get sender/recipient details for each message
    let messagesWithDetails: any[] = [];
    if (messages && messages.length > 0) {
      messagesWithDetails = await Promise.all(
        messages.map(async (msg: any) => {
          const [senderResult, recipientResult] = await Promise.all([
            supabaseAdmin
              .from('profiles')
              .select('full_name, email')
              .eq('id', msg.sender_id)
              .single(),
            supabaseAdmin
              .from('profiles')
              .select('full_name, email')
              .eq('id', msg.recipient_id)
              .single(),
          ]);

          return {
            ...msg,
            sender: senderResult.data || null,
            recipient: recipientResult.data || null,
          };
        })
      );
    }

    if (messagesError) {
      console.error('Error loading messages:', messagesError);
      return res.status(500).json({ error: 'Failed to load messages' });
    }

    // Get admin profile
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', req.user!.id)
      .single();

    const adminName = adminProfile?.full_name || 'Admin';
    const frontendUrl = process.env.FRONTEND_URL || 'https://housedirectng.com';
    const chatLink = `${frontendUrl}/messages?property=${propertyId}`;

    // Build email HTML with transcript
    const messagesHtml = messagesWithDetails.map((msg: any) => {
      const isAdmin = msg.sender_id === req.user!.id;
      const senderName = isAdmin ? adminName : (msg.sender?.full_name || 'Property Owner');
      const timestamp = new Date(msg.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return `
        <div style="margin-bottom: 20px; padding: 15px; background-color: ${isAdmin ? '#e3f2fd' : '#f5f5f5'}; border-left: 4px solid ${isAdmin ? '#2196f3' : '#757575'}; border-radius: 4px;">
          <div style="font-weight: bold; color: #333; margin-bottom: 5px;">
            ${senderName} ${isAdmin ? '(Admin)' : ''}
          </div>
          <div style="color: #666; font-size: 12px; margin-bottom: 10px;">
            ${timestamp}
          </div>
          <div style="color: #333; white-space: pre-wrap; line-height: 1.6;">
            ${msg.message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
    }).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Message from Admin</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2196f3; margin-top: 0;">New Message from Admin</h1>
          <p style="margin-bottom: 0;">You have received a new message regarding your property listing.</p>
        </div>

        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; margin-top: 0; font-size: 18px;">Property: ${property.title}</h2>
        </div>

        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; margin-top: 0; font-size: 18px; margin-bottom: 15px;">Conversation Transcript</h2>
          ${messagesHtml}
        </div>

        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <p style="margin-bottom: 15px; color: #333;">
            <strong>View and reply to this conversation in your account:</strong>
          </p>
          <a href="${chatLink}" style="display: inline-block; background-color: #2196f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
            View Chat Messages
          </a>
          <p style="margin-top: 15px; font-size: 12px; color: #666;">
            You may need to log in to your account to view the conversation.
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center;">
          <p>This is an automated email from House Direct NG.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </body>
      </html>
    `;

    const emailText = `
New Message from Admin

You have received a new message regarding your property listing: ${property.title}

Conversation Transcript:
${(messages || []).map((msg: any) => {
  const isAdmin = msg.sender_id === req.user!.id;
  const senderName = isAdmin ? adminName : (msg.sender?.full_name || 'Property Owner');
  const timestamp = new Date(msg.created_at).toLocaleString();
  return `\n${senderName} ${isAdmin ? '(Admin)' : ''} - ${timestamp}\n${msg.message}\n`;
}).join('\n---\n')}

View and reply to this conversation: ${chatLink}

You may need to log in to your account to view the conversation.

---
This is an automated email from House Direct NG.
    `;

    // Send email
    const emailSent = await emailService.sendEmail({
      to: recipient.email,
      subject: `New Message from Admin - ${property.title}`,
      html: emailHtml,
      text: emailText,
    });

    if (!emailSent) {
      console.error('Failed to send email:', emailService.lastError);
      return res.status(500).json({ error: 'Failed to send email notification' });
    }

    res.json({ success: true, message: 'Email notification sent successfully' });
  } catch (error: any) {
    console.error('Send message email error:', error);
    res.status(500).json({ error: 'Failed to send email notification' });
  }
});

export default router;

