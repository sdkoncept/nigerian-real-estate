/**
 * Email Verification Service
 * Handles email sending and verification
 */

import nodemailer from 'nodemailer';
import { supabaseAdmin } from '../config/supabase.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email Service
 */
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Configure email transporter
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
    } else {
      console.warn('⚠️ Email service not configured. Set SMTP_USER and SMTP_PASS in .env');
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.warn('⚠️ Email transporter not configured. Set SMTP_USER and SMTP_PASS in .env');
        console.warn('⚠️ Email not sent to:', options.to);
        return false;
      }

      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        ...options,
      });

      console.log('✅ Email sent successfully to:', options.to);
      return true;
    } catch (error: any) {
      console.error('❌ Email sending error:', error.message);
      console.error('Full error:', error);
      return false;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0284c7;">Verify Your Email Address</h1>
            <p>Thank you for signing up for Nigerian Real Estate Platform!</p>
            <p>Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #0284c7; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Nigerian Real Estate Platform. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Nigerian Real Estate Platform',
      html,
      text: `Please verify your email by visiting: ${verificationUrl}`,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0284c7;">Reset Your Password</h1>
            <p>You requested to reset your password for Nigerian Real Estate Platform.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #0284c7; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Nigerian Real Estate Platform. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Nigerian Real Estate Platform',
      html,
      text: `Reset your password by visiting: ${resetUrl}`,
    });
  }

  /**
   * Verify email token
   */
  async verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string }> {
    try {
      if (!supabaseAdmin) {
        return { success: false };
      }

      // Verify token with Supabase
      const { data, error } = await supabaseAdmin.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error || !data.user) {
        return { success: false };
      }

      return { success: true, userId: data.user.id };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false };
    }
  }

  /**
   * Send verification approval email
   */
  async sendVerificationApprovedEmail(email: string, entityType: 'agent' | 'property', reviewNotes?: string): Promise<boolean> {
    const entityName = entityType === 'agent' ? 'Agent Account' : 'Property Listing';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verification Approved</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">✅ Verification Approved</h1>
            <p>Great news! Your ${entityName} has been verified and approved.</p>
            <p>You can now enjoy all the benefits of being a verified ${entityType === 'agent' ? 'agent' : 'property owner'} on our platform.</p>
            ${reviewNotes ? `<p><strong>Admin Notes:</strong> ${reviewNotes}</p>` : ''}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/agent/dashboard" 
                 style="background-color: #10b981; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                View Dashboard
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Nigerian Real Estate Platform. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Verification Approved - ${entityName}`,
      html,
      text: `Your ${entityName} has been verified and approved.`,
    });
  }

  /**
   * Send verification rejection email
   */
  async sendVerificationRejectedEmail(email: string, entityType: 'agent' | 'property', reviewNotes: string): Promise<boolean> {
    const entityName = entityType === 'agent' ? 'Agent Account' : 'Property Listing';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verification Rejected</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ef4444;">❌ Verification Rejected</h1>
            <p>Unfortunately, your ${entityName} verification has been rejected.</p>
            <p><strong>Reason:</strong></p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;">${reviewNotes}</p>
            </div>
            <p>Please review the feedback above and resubmit your documents with the necessary corrections.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/agent/dashboard" 
                 style="background-color: #0284c7; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Resubmit Documents
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Nigerian Real Estate Platform. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Verification Rejected - ${entityName}`,
      html,
      text: `Your ${entityName} verification has been rejected. Reason: ${reviewNotes}`,
    });
  }

  /**
   * Send document submission confirmation email
   */
  async sendDocumentSubmittedEmail(email: string, documentType: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Document Submitted</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0284c7;">📄 Document Submitted</h1>
            <p>Thank you for submitting your ${documentType} for verification.</p>
            <p>Your document has been received and is now under review. This typically takes 2-5 business days.</p>
            <p>You will receive an email notification once the review is complete.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/agent/dashboard" 
                 style="background-color: #0284c7; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                View Dashboard
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Nigerian Real Estate Platform. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Document Submitted for Verification',
      html,
      text: `Your ${documentType} has been submitted for verification.`,
    });
  }
}

export const emailService = new EmailService();

