/**
 * Phone Verification Service
 * Handles SMS verification using Twilio
 */

import twilio from 'twilio';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Phone Verification Service
 */
export class PhoneService {
  private client: twilio.Twilio | null = null;
  private serviceSid: string | null = null;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || '';

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      console.warn('⚠️ Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
    }
  }

  /**
   * Send verification code via SMS
   */
  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!this.client || !this.serviceSid) {
        return {
          success: false,
          error: 'SMS service not configured',
        };
      }

      // Format phone number (ensure it starts with +234 for Nigeria)
      const formattedPhone = this.formatNigerianPhone(phoneNumber);

      // Send verification code using Twilio Verify
      const verification = await this.client.verify.v2
        .services(this.serviceSid)
        .verifications.create({
          to: formattedPhone,
          channel: 'sms',
        });

      if (verification.status === 'pending') {
        return {
          success: true,
          message: 'Verification code sent successfully',
        };
      }

      return {
        success: false,
        error: 'Failed to send verification code',
      };
    } catch (error: any) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send verification code',
      };
    }
  }

  /**
   * Verify the code sent to phone
   */
  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!this.client || !this.serviceSid) {
        return {
          success: false,
          error: 'SMS service not configured',
        };
      }

      const formattedPhone = this.formatNigerianPhone(phoneNumber);

      // Verify the code
      const verificationCheck = await this.client.verify.v2
        .services(this.serviceSid)
        .verificationChecks.create({
          to: formattedPhone,
          code: code,
        });

      if (verificationCheck.status === 'approved') {
        return {
          success: true,
          message: 'Phone number verified successfully',
        };
      }

      return {
        success: false,
        error: 'Invalid verification code',
      };
    } catch (error: any) {
      console.error('SMS verification error:', error);
      return {
        success: false,
        error: error.message || 'Verification failed',
      };
    }
  }

  /**
   * Format Nigerian phone number to international format
   */
  private formatNigerianPhone(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // If starts with 0, replace with +234
    if (digits.startsWith('0')) {
      return `+234${digits.substring(1)}`;
    }

    // If starts with 234, add +
    if (digits.startsWith('234')) {
      return `+${digits}`;
    }

    // If already has +, return as is
    if (phone.startsWith('+')) {
      return phone;
    }

    // Default: assume it's a local number starting with 0
    return `+234${digits}`;
  }

  /**
   * Update user's phone verification status in database
   */
  async updatePhoneVerificationStatus(userId: string, verified: boolean): Promise<boolean> {
    try {
      if (!supabaseAdmin) {
        return false;
      }

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_verified: verified })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Update phone verification error:', error);
      return false;
    }
  }
}

export const phoneService = new PhoneService();

