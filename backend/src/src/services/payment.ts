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
      if (!this.secretKey) {
        throw new Error('Paystack secret key not configured');
      }

      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount: data.amount * 100, // Convert to kobo (smallest currency unit)
          email: data.email,
          currency: data.currency || 'NGN',
          reference: data.reference || this.generateReference(),
          metadata: data.metadata || {},
          callback_url: data.callback_url,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

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
      console.error('Paystack payment error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment initialization failed',
      };
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(reference: string): Promise<PaymentResponse> {
    try {
      if (!this.secretKey) {
        throw new Error('Paystack secret key not configured');
      }

      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      if (response.data.status && response.data.data.status === 'success') {
        return {
          success: true,
          message: 'Payment verified successfully',
        };
      }

      return {
        success: false,
        error: 'Payment verification failed',
      };
    } catch (error: any) {
      console.error('Paystack verification error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment verification failed',
      };
    }
  }

  private generateReference(): string {
    return `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const paystackService = new PaystackService();

