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
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
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
      callback_url: callback_url || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/callback`,
    });

    if (result.success) {
      res.json({
        success: true,
        authorization_url: result.authorization_url,
        reference: result.reference,
        access_code: result.access_code,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Payment initialization failed',
      });
    }
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    res.status(500).json({ error: 'Payment initialization failed' });
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

