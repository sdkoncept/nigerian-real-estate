/**
 * Payment Service - Frontend
 * Handles Paystack payment integration
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface PaymentRequest {
  amount: number;
  currency?: string;
  property_id?: string;
  description?: string;
  payment_type: 'subscription' | 'featured_listing' | 'verification_fee';
  plan_type?: 'premium' | 'enterprise' | 'professional';
  entity_id?: string; // property_id or agent_id
}

export interface PaymentResponse {
  success: boolean;
  authorization_url?: string;
  reference?: string;
  access_code?: string;
  error?: string;
}

export class PaymentService {
  /**
   * Initialize Paystack payment
   */
  static async initializePayment(
    data: PaymentRequest,
    token: string
  ): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_URL}/api/payments/paystack/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Payment initialization failed',
        };
      }

      return result;
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        error: error.message || 'Payment initialization failed',
      };
    }
  }

  /**
   * Verify Paystack payment
   */
  static async verifyPayment(
    reference: string,
    token: string
  ): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_URL}/api/payments/paystack/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reference }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Payment verification failed',
        };
      }

      return result;
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.message || 'Payment verification failed',
      };
    }
  }

  /**
   * Open Paystack payment popup
   */
  static openPaymentWindow(authorizationUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const paymentWindow = window.open(
        authorizationUrl,
        'PaystackPayment',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (!paymentWindow) {
        resolve(false);
        return;
      }

      // Check if window is closed (payment completed or cancelled)
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed);
          resolve(true);
        }
      }, 500);

      // Listen for payment success message from popup
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'PAYSTACK_SUCCESS') {
          clearInterval(checkClosed);
          paymentWindow.close();
          window.removeEventListener('message', messageHandler);
          resolve(true);
        } else if (event.data.type === 'PAYSTACK_ERROR') {
          clearInterval(checkClosed);
          paymentWindow.close();
          window.removeEventListener('message', messageHandler);
          resolve(false);
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }
}

