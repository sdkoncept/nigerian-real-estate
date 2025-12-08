/**
 * Payment Service - Frontend
 * Handles Paystack payment integration
 */

// Get API URL from environment or use appropriate fallback
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If VITE_API_URL is set, use it (allows override for separate backend)
  if (envUrl) {
    return envUrl;
  }
  
  // In production (HTTPS), use relative URL (works with Vercel routing)
  // Backend is accessible at /api/* on the same domain
  if (window.location.protocol === 'https:') {
    return ''; // Empty string means use relative URLs
  }
  
  // In development, fallback to localhost
  return 'http://localhost:5000';
};

const API_URL = getApiUrl();

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
      // Use relative URL if API_URL is empty (production with same-domain backend)
      // Otherwise use full URL
      const url = API_URL 
        ? `${API_URL}/api/payments/paystack/initialize`
        : '/api/payments/paystack/initialize';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      // Handle error responses
      if (!response.ok) {
        const text = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const json = JSON.parse(text);
          // Try multiple fields for error message
          errorMessage = json.error || json.message || json.details || errorMessage;
          console.error('[Payment Service] Error response:', json);
        } catch {
          if (text) {
            errorMessage = text;
            console.error('[Payment Service] Error text:', text);
          }
        }
        
        console.error('[Payment Service] Payment failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      }

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
      
      // Check if it's a connection error
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        return {
          success: false,
          error: 'Unable to connect to payment server. Please ensure the backend server is running on port 5000.',
        };
      }
      
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
      // Use relative URL if API_URL is empty (production with same-domain backend)
      // Otherwise use full URL
      const url = API_URL 
        ? `${API_URL}/api/payments/paystack/verify`
        : '/api/payments/paystack/verify';
      
      const response = await fetch(url, {
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
      
      // Check if it's a connection error
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        return {
          success: false,
          error: 'Unable to connect to payment server. Please ensure the backend server is running on port 5000.',
        };
      }
      
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

