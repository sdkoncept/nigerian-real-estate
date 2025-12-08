/**
 * Payment Gateway Services
 * Integration with Paystack
 */

import axios from 'axios';

interface PaymentRequest {
  amount: number;
  email: string;
  currency?: string;
  reference?: string;
  metadata?: Record<string, any>;
  callback_url?: string;
}

interface PaymentResponse {
  success: boolean;
  authorization_url?: string;
  reference?: string;
  access_code?: string;
  message?: string;
  error?: string;
}

/**
 * Paystack Payment Service
 */
export class PaystackService {
  private secretKey: string;
  private publicKey: string;
  private baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY || '';
    
    if (!this.secretKey || !this.publicKey) {
      console.warn('⚠️ Paystack credentials not configured');
    }
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('[PaystackService] Initializing payment...');
      console.log('[PaystackService] Secret key configured:', !!this.secretKey);
      console.log('[PaystackService] Secret key length:', this.secretKey?.length || 0);
      
      if (!this.secretKey) {
        console.error('[PaystackService] Secret key is missing!');
        throw new Error('Paystack secret key not configured. Please set PAYSTACK_SECRET_KEY environment variable.');
      }

      if (!data.email) {
        throw new Error('Email is required for payment initialization');
      }

      if (!data.amount || data.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const payload = {
        amount: data.amount * 100, // Convert to kobo (smallest currency unit)
        email: data.email,
        currency: data.currency || 'NGN',
        reference: data.reference || this.generateReference(),
        metadata: data.metadata || {},
        callback_url: data.callback_url,
      };

      console.log('[PaystackService] Payload:', {
        ...payload,
        amount: payload.amount,
        metadata: payload.metadata,
      });

      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log('[PaystackService] Response status:', response.status);
      console.log('[PaystackService] Response data status:', response.data?.status);

      if (response.data.status) {
        return {
          success: true,
          authorization_url: response.data.data.authorization_url,
          reference: response.data.data.reference,
          access_code: response.data.data.access_code,
        };
      }

      return {
        success: false,
        error: response.data.message || 'Payment initialization failed',
      };
    } catch (error: any) {
      console.error('[PaystackService] Error caught:', error);
      console.error('[PaystackService] Error type:', error?.constructor?.name);
      console.error('[PaystackService] Error message:', error?.message);
      console.error('[PaystackService] Error response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      
      // Provide more detailed error messages
      let errorMessage = 'Payment initialization failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Re-throw so the route handler can catch it
      throw new Error(errorMessage);
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(reference: string): Promise<PaymentResponse & { paymentData?: any }> {
    try {
      if (!this.secretKey) {
        throw new Error('Paystack secret key not configured');
      }

      console.log('[PaystackService] Verifying payment reference:', reference);

      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
          timeout: 30000,
        }
      );

      console.log('[PaystackService] Verification response:', {
        status: response.data?.status,
        paymentStatus: response.data?.data?.status,
      });

      if (response.data.status && response.data.data.status === 'success') {
        return {
          success: true,
          message: 'Payment verified successfully',
          paymentData: response.data.data, // Include full payment data
        };
      }

      return {
        success: false,
        error: response.data.message || 'Payment verification failed',
      };
    } catch (error: any) {
      console.error('[PaystackService] Verification error:', error);
      console.error('[PaystackService] Error response:', {
        status: error.response?.status,
        data: error.response?.data,
      });
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Payment verification failed',
      };
    }
  }

  private generateReference(): string {
    return `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const paystackService = new PaystackService();

