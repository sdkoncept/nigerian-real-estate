/**
 * Verification Reminder Service
 * Sends reminder emails to unverified agents and sellers
 */

import { supabaseAdmin } from '../config/supabase.js';
import { emailService } from './email.js';

interface ReminderStats {
  agentsContacted: number;
  sellersContacted: number;
  agentsFailed: number;
  sellersFailed: number;
  errors: string[];
}

/**
 * Send verification reminders to unverified agents and sellers
 */
export async function sendVerificationReminders(): Promise<ReminderStats> {
  const stats: ReminderStats = {
    agentsContacted: 0,
    sellersContacted: 0,
    agentsFailed: 0,
    sellersFailed: 0,
    errors: [],
  };

  if (!supabaseAdmin) {
    stats.errors.push('Supabase admin client not configured');
    return stats;
  }

  try {
    // Get unverified agents (verification_status = 'pending' or not 'verified')
    const { data: unverifiedAgents, error: agentsError } = await supabaseAdmin
      .from('agents')
      .select('id, user_id, verification_status')
      .neq('verification_status', 'verified')
      .eq('is_active', true);

    if (agentsError) {
      stats.errors.push(`Error fetching agents: ${agentsError.message}`);
    } else if (unverifiedAgents && unverifiedAgents.length > 0) {
      // Get user profiles for agents
      const userIds = unverifiedAgents.map(agent => agent.user_id);
      
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, user_type')
        .in('id', userIds)
        .eq('user_type', 'agent');

      if (profilesError) {
        stats.errors.push(`Error fetching agent profiles: ${profilesError.message}`);
      } else if (profiles && profiles.length > 0) {
        // Send emails to unverified agents
        for (const profile of profiles) {
          if (profile.email) {
            try {
              const success = await emailService.sendAgentVerificationReminder(
                profile.email,
                profile.full_name || 'Agent'
              );
              if (success) {
                stats.agentsContacted++;
              } else {
                stats.agentsFailed++;
                // Get last error from email service if available
                const lastError = (emailService as any).lastError;
                const errorMsg = lastError 
                  ? `Failed to send email to agent ${profile.email}: ${lastError}` 
                  : `Failed to send email to agent: ${profile.email}`;
                stats.errors.push(errorMsg);
              }
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error: any) {
              stats.agentsFailed++;
              stats.errors.push(`Error sending email to ${profile.email}: ${error.message}`);
            }
          }
        }
      }
    }

    // Get sellers with unverified properties
    // First, get all sellers
    const { data: sellers, error: sellersError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, user_type')
      .eq('user_type', 'seller');

    if (sellersError) {
      stats.errors.push(`Error fetching sellers: ${sellersError.message}`);
    } else if (sellers && sellers.length > 0) {
      // Check each seller for unverified properties
      for (const seller of sellers) {
        try {
          const { data: properties, error: propsError } = await supabaseAdmin
            .from('properties')
            .select('id, verification_status')
            .eq('created_by', seller.id)
            .eq('is_active', true);

          if (propsError) {
            stats.errors.push(`Error fetching properties for seller ${seller.email}: ${propsError.message}`);
            continue;
          }

          // Check if seller has any unverified properties
          const hasUnverifiedProperties = properties?.some(
            (prop) => prop.verification_status !== 'verified'
          );

          if (hasUnverifiedProperties && seller.email) {
            try {
              const success = await emailService.sendSellerVerificationReminder(
                seller.email,
                seller.full_name || 'Seller'
              );
              if (success) {
                stats.sellersContacted++;
              } else {
                stats.sellersFailed++;
                // Get last error from email service if available
                const lastError = (emailService as any).lastError;
                const errorMsg = lastError 
                  ? `Failed to send email to seller ${seller.email}: ${lastError}` 
                  : `Failed to send email to seller: ${seller.email}`;
                stats.errors.push(errorMsg);
              }
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error: any) {
              stats.sellersFailed++;
              stats.errors.push(`Error sending email to seller ${seller.email}: ${error.message}`);
            }
          }
        } catch (error: any) {
          stats.sellersFailed++;
          stats.errors.push(`Error processing seller ${seller.email}: ${error.message}`);
        }
      }
    }

    console.log('✅ Verification reminder stats:', stats);
    return stats;
  } catch (error: any) {
    stats.errors.push(`Critical error: ${error.message}`);
    console.error('❌ Error sending verification reminders:', error);
    return stats;
  }
}
