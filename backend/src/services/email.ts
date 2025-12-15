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
  public lastError: string | null = null;

  constructor() {
    // Configure email transporter
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    
    const emailConfig: any = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: smtpPort,
      secure: smtpSecure, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
      // TLS configuration for custom SMTP servers
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
        minVersion: 'TLSv1', // Support TLS 1.0+ for compatibility
        maxVersion: 'TLSv1.3', // Up to TLS 1.3
        ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
      },
      // For port 587, require STARTTLS (upgrade plain connection to TLS)
      // For port 465, use direct SSL connection (secure: true)
      requireTLS: smtpPort === 587 && !smtpSecure,
      // Disable STARTTLS for port 465 (uses direct SSL)
      ...(smtpPort === 465 && smtpSecure ? { 
        ignoreTLS: true,
        requireTLS: false,
      } : {}),
      // Connection timeout
      connectionTimeout: 15000, // 15 seconds
      greetingTimeout: 15000,
      socketTimeout: 15000,
    };

    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
      console.log('✅ Email transporter configured:', {
        host: emailConfig.host,
        port: emailConfig.port,
        user: emailConfig.auth.user,
        secure: emailConfig.secure,
      });
    } else {
      console.warn('⚠️ Email service not configured. Set SMTP_USER and SMTP_PASS in .env');
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    this.lastError = null; // Reset error
    try {
      if (!this.transporter) {
        const errorMsg = 'Email transporter not configured. Set SMTP_USER and SMTP_PASS in .env';
        this.lastError = errorMsg;
        console.warn('⚠️', errorMsg);
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
      const errorMsg = error.message || error.toString();
      this.lastError = errorMsg;
      console.error('❌ Email sending error:', errorMsg);
      console.error('Full error details:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack,
      });
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
            <p>Thank you for signing up for House Direct NG!</p>
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
              © ${new Date().getFullYear()} House Direct NG. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - House Direct NG',
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
            <p>You requested to reset your password for House Direct NG.</p>
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
              © ${new Date().getFullYear()} House Direct NG. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - House Direct NG',
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
              © ${new Date().getFullYear()} House Direct NG. All rights reserved.
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
              © ${new Date().getFullYear()} House Direct NG. All rights reserved.
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
              © ${new Date().getFullYear()} House Direct NG. All rights reserved.
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

  /**
   * Send verification reminder email to agents
   */
  async sendAgentVerificationReminder(email: string, fullName: string): Promise<boolean> {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/agent/dashboard`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Complete Your Agent Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #7c3aed; margin-top: 0;">🔐 Complete Your Agent Verification</h1>
              <p>Hello ${fullName || 'there'},</p>
              
              <p>We noticed that your agent account on <strong>House Direct NG</strong> is not yet verified. Completing your verification is crucial for building trust and maximizing your success on our platform.</p>
              
              <div style="background-color: #f3f4f6; border-left: 4px solid #7c3aed; padding: 20px; margin: 25px 0;">
                <h2 style="color: #7c3aed; margin-top: 0; font-size: 20px;">Why Get Verified?</h2>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li style="margin-bottom: 10px;"><strong>✅ Build Trust:</strong> Verified agents get a special badge that shows buyers and sellers you're legitimate and trustworthy</li>
                  <li style="margin-bottom: 10px;"><strong>✅ More Visibility:</strong> Verified agents appear higher in search results and get priority placement</li>
                  <li style="margin-bottom: 10px;"><strong>✅ More Leads:</strong> Buyers prefer working with verified agents - you'll get more inquiries and faster responses</li>
                  <li style="margin-bottom: 10px;"><strong>✅ Professional Credibility:</strong> Stand out from unverified agents and establish yourself as a professional</li>
                  <li style="margin-bottom: 10px;"><strong>✅ Access Premium Features:</strong> Unlock advanced tools and features available only to verified agents</li>
                  <li style="margin-bottom: 10px;"><strong>✅ Faster Property Approvals:</strong> Your property listings get approved faster when you're verified</li>
                </ul>
              </div>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0;">
                <p style="margin: 0;"><strong>📋 What You Need:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Government-issued ID (National ID, Passport, Driver's License, or Voter's Card)</li>
                  <li>Optional: Business registration documents (for Trusted Agent status)</li>
                </ul>
              </div>
              
              <p><strong>The verification process is quick and simple:</strong></p>
              <ol style="padding-left: 20px;">
                <li>Log in to your agent dashboard</li>
                <li>Upload your government-issued ID</li>
                <li>Submit for review (takes 2-5 business days)</li>
                <li>Get verified and start enjoying the benefits!</li>
              </ol>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${dashboardUrl}" 
                   style="background-color: #7c3aed; color: white; padding: 14px 35px; 
                          text-decoration: none; border-radius: 6px; display: inline-block; 
                          font-weight: bold; font-size: 16px;">
                  Complete Verification Now →
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                <strong>Don't miss out!</strong> Every day you're not verified is a day you're losing potential clients to verified agents. Take 5 minutes now to complete your verification and start growing your business.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #666; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} House Direct NG. All rights reserved.<br>
                If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🔐 Complete Your Agent Verification - Don\'t Miss Out!',
      html,
      text: `Hello ${fullName || 'there'},\n\nComplete your agent verification to build trust, get more visibility, and attract more clients. Visit your dashboard to upload your documents: ${dashboardUrl}`,
    });
  }

  /**
   * Send verification reminder email to sellers
   */
  async sendSellerVerificationReminder(email: string, fullName: string): Promise<boolean> {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/seller/dashboard`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Property Listings</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #0284c7; margin-top: 0;">🏠 Verify Your Property Listings</h1>
              <p>Hello ${fullName || 'there'},</p>
              
              <p>We noticed that you have property listings on <strong>House Direct NG</strong> that are not yet verified. Getting your properties verified is essential for attracting serious buyers and closing deals faster.</p>
              
              <div style="background-color: #f3f4f6; border-left: 4px solid #0284c7; padding: 20px; margin: 25px 0;">
                <h2 style="color: #0284c7; margin-top: 0; font-size: 20px;">Why Verify Your Properties?</h2>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li style="margin-bottom: 10px;"><strong>✅ More Inquiries:</strong> Verified properties get 3x more views and inquiries than unverified ones</li>
                  <li style="margin-bottom: 10px;"><strong>✅ Build Buyer Confidence:</strong> Buyers trust verified properties - they know the property is legitimate and accurately represented</li>
                  <li style="margin-bottom: 10px;"><strong>✅ Faster Sales:</strong> Verified properties sell or rent 40% faster than unverified listings</li>
                  <li style="margin-bottom: 10px;"><strong>✅ Higher Search Ranking:</strong> Verified properties appear first in search results</li>
                  <li style="margin-bottom: 10px;"><strong>✅ Featured Badge:</strong> Get a special "Verified" badge that makes your property stand out</li>
                  <li style="margin-bottom: 10px;"><strong>✅ Avoid Suspicion:</strong> Unverified properties are often flagged by buyers as potentially fraudulent</li>
                </ul>
              </div>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0;">
                <p style="margin: 0;"><strong>📋 What You Need:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Property ownership documents (Deed of Assignment, Certificate of Occupancy, etc.)</li>
                  <li>Valid ID (to verify you're the owner)</li>
                  <li>Property photos and accurate details</li>
                </ul>
              </div>
              
              <p><strong>The verification process is straightforward:</strong></p>
              <ol style="padding-left: 20px;">
                <li>Go to your seller dashboard</li>
                <li>Select the property you want to verify</li>
                <li>Upload required documents</li>
                <li>Submit for review (takes 2-5 business days)</li>
                <li>Get verified and watch your inquiries increase!</li>
              </ol>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${dashboardUrl}" 
                   style="background-color: #0284c7; color: white; padding: 14px 35px; 
                          text-decoration: none; border-radius: 6px; display: inline-block; 
                          font-weight: bold; font-size: 16px;">
                  Verify Your Properties Now →
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                <strong>Don't wait!</strong> Every day your properties remain unverified is a day you're losing potential buyers to verified listings. Take action now and start getting more serious inquiries.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #666; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} House Direct NG. All rights reserved.<br>
                If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🏠 Verify Your Properties - Get More Buyers Today!',
      html,
      text: `Hello ${fullName || 'there'},\n\nVerify your property listings to get 3x more inquiries and sell faster. Visit your dashboard: ${dashboardUrl}`,
    });
  }
}

export const emailService = new EmailService();

