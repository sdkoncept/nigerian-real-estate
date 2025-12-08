/**
 * WhatsApp Messaging Service
 * Handles WhatsApp messages using WhatsApp Business API or alternative services
 */

import axios from 'axios';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * WhatsApp Service
 * Supports multiple providers:
 * 1. WhatsApp Business API (Meta)
 * 2. WhatsApp via Twilio
 * 3. WhatsApp via other providers
 */
export class WhatsAppService {
  private provider: 'meta' | 'twilio' | 'green-api' | 'chat-api' = 'meta';
  private apiKey: string = '';
  private apiUrl: string = '';

  constructor() {
    // Determine provider from environment
    if (process.env.WHATSAPP_PROVIDER) {
      this.provider = process.env.WHATSAPP_PROVIDER as any;
    }

    // Configure based on provider
    switch (this.provider) {
      case 'meta':
        // WhatsApp Business API (Meta)
        this.apiKey = process.env.WHATSAPP_ACCESS_TOKEN || '';
        this.apiUrl = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`;
        break;
      case 'twilio':
        // WhatsApp via Twilio
        this.apiKey = process.env.TWILIO_AUTH_TOKEN || '';
        this.apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
        break;
      case 'green-api':
        // Green API (Free tier available)
        this.apiKey = process.env.GREEN_API_ID_INSTANCE || '';
        this.apiUrl = `https://api.green-api.com/waInstance${this.apiKey}`;
        break;
      case 'chat-api':
        // Chat API (Free tier available)
        this.apiKey = process.env.CHAT_API_TOKEN || '';
        this.apiUrl = `https://api.chat-api.com/instance${process.env.CHAT_API_INSTANCE_ID}`;
        break;
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const formattedPhone = this.formatNigerianPhone(phoneNumber);

      switch (this.provider) {
        case 'meta':
          return await this.sendViaMeta(formattedPhone, message);
        case 'twilio':
          return await this.sendViaTwilio(formattedPhone, message);
        case 'green-api':
          return await this.sendViaGreenAPI(formattedPhone, message);
        case 'chat-api':
          return await this.sendViaChatAPI(formattedPhone, message);
        default:
          return { success: false, error: 'WhatsApp provider not configured' };
      }
    } catch (error: any) {
      console.error('WhatsApp sending error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp message',
      };
    }
  }

  /**
   * Send verification code via WhatsApp
   */
  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Store code in database (with expiry)
      if (supabaseAdmin) {
        await supabaseAdmin.from('verification_codes').insert({
          phone: phoneNumber,
          code: code,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        });
      }

      const message = `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone.`;

      const result = await this.sendMessage(phoneNumber, message);

      if (result.success) {
        return {
          success: true,
          message: 'Verification code sent via WhatsApp',
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to send verification code',
      };
    } catch (error: any) {
      console.error('WhatsApp verification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send verification code',
      };
    }
  }

  /**
   * Verify code
   */
  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!supabaseAdmin) {
        return { success: false, error: 'Database not configured' };
      }

      const { data, error } = await supabaseAdmin
        .from('verification_codes')
        .select('*')
        .eq('phone', phoneNumber)
        .eq('code', code)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid or expired verification code' };
      }

      // Mark code as used
      await supabaseAdmin
        .from('verification_codes')
        .update({ used: true })
        .eq('id', data.id);

      return {
        success: true,
        message: 'Phone number verified successfully',
      };
    } catch (error: any) {
      console.error('WhatsApp verification error:', error);
      return {
        success: false,
        error: error.message || 'Verification failed',
      };
    }
  }

  /**
   * Send via Meta WhatsApp Business API
   */
  private async sendViaMeta(phoneNumber: string, message: string) {
    const response = await axios.post(
      `${this.apiUrl}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      messageId: response.data.messages[0]?.id,
    };
  }

  /**
   * Send via Twilio WhatsApp
   */
  private async sendViaTwilio(phoneNumber: string, message: string) {
    const whatsappNumber = `whatsapp:${process.env.WHATSAPP_TWILIO_NUMBER || ''}`;
    const to = `whatsapp:${phoneNumber}`;

    const response = await axios.post(
      this.apiUrl,
      new URLSearchParams({
        From: whatsappNumber,
        To: to,
        Body: message,
      }),
      {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID || '',
          password: process.env.TWILIO_AUTH_TOKEN || '',
        },
      }
    );

    return {
      success: true,
      messageId: response.data.sid,
    };
  }

  /**
   * Send via Green API (Free tier: 100 messages/day)
   */
  private async sendViaGreenAPI(phoneNumber: string, message: string) {
    const response = await axios.post(
      `${this.apiUrl}/sendMessage/${process.env.GREEN_API_TOKEN}`,
      {
        chatId: `${phoneNumber}@c.us`,
        message: message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: response.data.idMessage ? true : false,
      messageId: response.data.idMessage,
    };
  }

  /**
   * Send via Chat API (Free tier available)
   */
  private async sendViaChatAPI(phoneNumber: string, message: string) {
    const response = await axios.post(
      `${this.apiUrl}/sendMessage`,
      {
        phone: phoneNumber,
        body: message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          token: this.apiKey,
        },
      }
    );

    return {
      success: response.data.sent === true,
      messageId: response.data.id,
    };
  }

  /**
   * Format Nigerian phone number to international format
   */
  private formatNigerianPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('0')) {
      return `234${digits.substring(1)}`;
    }

    if (digits.startsWith('234')) {
      return digits;
    }

    return `234${digits}`;
  }
}

export const whatsappService = new WhatsAppService();

