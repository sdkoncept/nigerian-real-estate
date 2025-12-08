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
      message: errorMessage, // Include as 'message' too for frontend compatibility
      ...errorDetails,
    });
  }
});

/**
 * Verify Paystack payment and process subscription/featured listing
 */
router.post('/paystack/verify', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    console.log('[Payment Verify] Verifying payment:', { reference, userId: req.user.id });

    // Verify payment with Paystack
    const verifyResult = await paystackService.verifyPayment(reference);

    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        error: verifyResult.error || 'Payment verification failed',
      });
    }

    // Get full payment details from Paystack
    const paystackResponse = verifyResult as any;
    const paymentData = paystackResponse.paymentData || {};
    const metadata = paymentData.metadata || {};
    const amount = paymentData.amount ? paymentData.amount / 100 : 0; // Convert from kobo
    const paymentType = metadata.payment_type || 'subscription';
    const planType = metadata.plan_type || 'premium';

    console.log('[Payment Verify] Payment verified:', {
      amount,
      paymentType,
      planType,
      metadata,
    });

    // Import Supabase admin client
    const { supabaseAdmin } = await import('../config/supabase.js');

    if (!supabaseAdmin) {
      throw new Error('Supabase not configured');
    }

    // Create payment record
    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: req.user.id,
        payment_type: paymentType,
        entity_type: paymentType === 'subscription' ? 'subscription' : metadata.entity_type || null,
        entity_id: metadata.entity_id || null,
        amount: amount,
        currency: 'NGN',
        payment_provider: 'paystack',
        payment_reference: reference,
        status: 'completed',
        metadata: metadata,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('[Payment Verify] Error creating payment record:', paymentError);
      throw new Error(`Failed to create payment record: ${paymentError.message}`);
    }

    console.log('[Payment Verify] Payment record created:', paymentRecord?.id);

    // Process based on payment type
    if (paymentType === 'subscription') {
      // Cancel any existing active subscriptions for this user
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', req.user.id)
        .eq('status', 'active');

      // Calculate expiration date (30 days from now for monthly plans)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Create new subscription
      const { data: subscription, error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: req.user.id,
          plan_type: planType,
          status: 'active',
          payment_provider: 'paystack',
          payment_reference: reference,
          amount_paid: amount,
          currency: 'NGN',
          expires_at: expiresAt.toISOString(),
          features: {},
        })
        .select()
        .single();

      if (subscriptionError) {
        console.error('[Payment Verify] Error creating subscription:', subscriptionError);
        throw new Error(`Failed to create subscription: ${subscriptionError.message}`);
      }

      console.log('[Payment Verify] Subscription created:', subscription?.id);

      return res.json({
        success: true,
        message: 'Payment verified and subscription activated successfully',
        subscription: {
          plan_type: subscription.plan_type,
          status: subscription.status,
          expires_at: subscription.expires_at,
        },
        payment: {
          reference: paymentRecord.payment_reference,
          amount: paymentRecord.amount,
        },
      });
    } else if (paymentType === 'featured_listing') {
      // Handle featured listing payment
      if (metadata.property_id) {
        const featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + 30); // 30 days featured

        const { error: featuredError } = await supabaseAdmin
          .from('featured_listings')
          .insert({
            property_id: metadata.property_id,
            payment_id: paymentRecord.id,
            featured_until: featuredUntil.toISOString(),
            priority: 1,
          });

        if (featuredError) {
          console.error('[Payment Verify] Error creating featured listing:', featuredError);
          throw new Error(`Failed to create featured listing: ${featuredError.message}`);
        }

        console.log('[Payment Verify] Featured listing created for property:', metadata.property_id);
      }

      return res.json({
        success: true,
        message: 'Payment verified and featured listing activated',
        payment: {
          reference: paymentRecord.payment_reference,
          amount: paymentRecord.amount,
        },
      });
    }

    // Generic success response
    return res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        reference: paymentRecord.payment_reference,
        amount: paymentRecord.amount,
      },
    });
  } catch (error: any) {
    console.error('[Payment Verify] Error:', error);
    console.error('[Payment Verify] Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Payment verification failed',
      message: error.message || 'Payment verification failed',
    });
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

