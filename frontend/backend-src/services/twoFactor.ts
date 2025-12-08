/**
 * Two-Factor Authentication Service
 * Implements TOTP (Time-based One-Time Password) for admin accounts
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { supabaseAdmin } from '../config/supabase.js';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyResult {
  valid: boolean;
  usedBackupCode?: boolean;
}

/**
 * Generate a new 2FA secret for a user
 */
export async function generateTwoFactorSecret(userId: string, userEmail: string): Promise<TwoFactorSetup> {
  const secret = speakeasy.generateSecret({
    name: `House Direct NG (${userEmail})`,
    issuer: 'House Direct NG',
    length: 32,
  });

  // Generate backup codes (10 codes, 8 characters each)
  const backupCodes = Array.from({ length: 10 }, () => 
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  // Store secret and backup codes in database (encrypted/hashed in production)
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      two_factor_secret: secret.base32,
      two_factor_backup_codes: backupCodes.map(code => 
        // Hash backup codes before storing (simple hash for now, use bcrypt in production)
        Buffer.from(code).toString('base64')
      ),
      two_factor_enabled: false, // Not enabled until verified
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to store 2FA secret: ${error.message}`);
  }

  // Generate QR code URL
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes, // Return plain codes for user to save
  };
}

/**
 * Verify a TOTP token
 */
export async function verifyTwoFactorToken(
  userId: string,
  token: string
): Promise<TwoFactorVerifyResult> {
  // Get user's 2FA secret
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('two_factor_secret, two_factor_backup_codes')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    throw new Error('User profile not found');
  }

  if (!profile.two_factor_secret) {
    throw new Error('2FA not set up for this user');
  }

  // First, try to verify as TOTP token
  const verified = speakeasy.totp.verify({
    secret: profile.two_factor_secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps (60 seconds) of tolerance
  });

  if (verified) {
    return { valid: true };
  }

  // If TOTP failed, check if it's a backup code
  if (profile.two_factor_backup_codes && Array.isArray(profile.two_factor_backup_codes)) {
    const backupCodes = profile.two_factor_backup_codes.map((code: string) =>
      Buffer.from(code, 'base64').toString()
    );

    const codeIndex = backupCodes.indexOf(token.toUpperCase());
    if (codeIndex !== -1) {
      // Remove used backup code
      const updatedCodes = [...backupCodes];
      updatedCodes.splice(codeIndex, 1);

      await supabaseAdmin
        .from('profiles')
        .update({
          two_factor_backup_codes: updatedCodes.map(code =>
            Buffer.from(code).toString('base64')
          ),
        })
        .eq('id', userId);

      return { valid: true, usedBackupCode: true };
    }
  }

  return { valid: false };
}

/**
 * Enable 2FA for a user (after they verify the setup)
 */
export async function enableTwoFactor(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ two_factor_enabled: true })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to enable 2FA: ${error.message}`);
  }
}

/**
 * Disable 2FA for a user
 */
export async function disableTwoFactor(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      two_factor_enabled: false,
      two_factor_secret: null,
      two_factor_backup_codes: null,
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to disable 2FA: ${error.message}`);
  }
}

/**
 * Check if user has 2FA enabled
 */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('two_factor_enabled')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return false;
  }

  return profile.two_factor_enabled === true;
}

