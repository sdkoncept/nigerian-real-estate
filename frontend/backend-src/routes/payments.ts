/**
 * Payment Routes
 * Handles payment initialization and verification
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate, paymentSchema } from '../middleware/validation.js';
import { paymentLimiter } from '../middleware/security.js';
import { paystackService } from '../services/payment.js';

const router = Router();

// All payment routes require authentication and rate limiting
router.use(authenticate);
router.use(paymentLimiter);

/**
 * Initialize Paystack payment
 */
router.post('/paystack/initialize', validate(paymentSchema), async (req: AuthRequest, res: Response) => {
  console.log('[Payment Init] Request received:', {
    hasUser: !!req.user,
    userEmail: req.user?.email,
    body: req.body,
  });
  
  try {
    if (!req.user) {
      console.error('[Payment Init] No user found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.user.email) {
      console.error('[Payment Init] User email is missing');
      return res.status(400).json({ error: 'User email is required' });
    }

    const { 
      amount, 
      currency, 
      property_id, 
      description, 
      callback_url,
      payment_type,
      plan_type,
      entity_id
    } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    console.log('[Payment Init] Calling Paystack service with:', {
      amount,
      email: req.user.email,
      currency: currency || 'NGN',
    });

    try {
      const result = await paystackService.initializePayment({
        amount,
        email: req.user.email,
        currency: currency || 'NGN',
        metadata: {
          user_id: req.user.id,
          property_id: property_id || null,
          description: description || 'Property Payment',
          payment_type: payment_type || 'subscription',
          plan_type: plan_type || null,
          entity_id: entity_id || null,
        },
        callback_url: callback_url || `${process.env.FRONTEND_URL || 'https://housedirectng.com'}/payment/callback`,
      });

      console.log('[Payment Init] Paystack result:', { success: result.success, error: result.error });

      if (result.success) {
        return res.json({
          success: true,
          authorization_url: result.authorization_url,
          reference: result.reference,
          access_code: result.access_code,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error || 'Payment initialization failed',
        });
      }
    } catch (paystackError: any) {
      // PaystackService throws errors, catch them here
      console.error('[Payment Init] Paystack service threw error:', paystackError);
      throw paystackError; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error('[Payment Init] Exception caught:', error);
    console.error('[Payment Init] Error name:', error?.name);
    console.error('[Payment Init] Error message:', error?.message);
    console.error('[Payment Init] Error stack:', error?.stack);
    console.error('[Payment Init] Request body:', JSON.stringify(req.body, null, 2));
    console.error('[Payment Init] User:', JSON.stringify(req.user, null, 2));
    
    // Always return a proper error response
    const errorMessage = error?.message || 'Payment initialization failed';
    const errorDetails = process.env.VERCEL === '1' || process.env.NODE_ENV === 'development' 
      ? { stack: error?.stack, name: error?.name }
      : undefined;
    
    return res.status(500).json({ 
      error: errorMessage,
      ...errorDetails,
    });
  }
});

/**
 * Verify Paystack payment and process subscription/featured listing
 */
router.post('/paystack/verify', async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    const result = await paystackService.verifyPayment(reference);

    if (result.success) {
      // Get payment details from Paystack to extract metadata
      const paymentData = result as any;
      const metadata = paymentData.metadata || {};

      // Create payment record in database
      // TODO: Integrate with Supabase to create payment record
      // This will be handled by a webhook or direct Supabase call

      res.json({
        success: true,
        message: 'Payment verified successfully',
        metadata,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Payment verification failed',
      });
    }
  } catch (error: any) {
    console.error('Paystack verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

/**
 * Paystack webhook handler
 * Handles payment callbacks from Paystack
 */
router.post('/paystack/webhook', async (req: any, res: Response) => {
  try {
    // Verify webhook signature (implement Paystack webhook verification)
    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference, metadata, amount, customer } = event.data;

      // Process payment based on type
      if (metadata?.payment_type === 'subscription') {
        // Create subscription record
        // TODO: Insert into subscriptions table via Supabase
      } else if (metadata?.payment_type === 'featured_listing') {
        // Create featured listing record
        // TODO: Insert into featured_listings table via Supabase
      }

      // Create payment record
      // TODO: Insert into payments table via Supabase
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;

