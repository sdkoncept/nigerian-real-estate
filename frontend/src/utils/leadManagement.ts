import { supabase } from '../lib/supabase';

/**
 * Convert a property inquiry message to a lead
 */
export async function createLeadFromMessage(
  messageId: string,
  propertyId: string | null,
  senderId: string,
  senderName: string,
  senderEmail: string,
  senderPhone: string | null,
  agentId: string
): Promise<{ success: boolean; leadId?: string; error?: string }> {
  try {
    // Check if lead already exists for this email and property
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('agent_id', agentId)
      .eq('email', senderEmail)
      .eq('property_id', propertyId)
      .maybeSingle();

    if (existingLead) {
      // Update existing lead's last_contact_at
      await supabase
        .from('leads')
        .update({ last_contact_at: new Date().toISOString() })
        .eq('id', existingLead.id);

      // Create activity for the message
      await supabase.from('lead_activities').insert({
        lead_id: existingLead.id,
        agent_id: agentId,
        activity_type: 'message',
        description: 'New message received',
        message_id: messageId,
        property_id: propertyId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      return { success: true, leadId: existingLead.id };
    }

    // Create new lead
    const { data: newLead, error: leadError } = await supabase
      .from('leads')
      .insert({
        agent_id: agentId,
        property_id: propertyId,
        user_id: senderId,
        name: senderName,
        email: senderEmail,
        phone: senderPhone,
        source: 'property_inquiry',
        status: 'new',
        interest_type: 'buy', // Default, can be updated later
        priority: 'medium',
        lead_score: 50, // Default score
        first_contact_at: new Date().toISOString(),
        last_contact_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (leadError) throw leadError;

    // Create activity for the message
    await supabase.from('lead_activities').insert({
      lead_id: newLead.id,
      agent_id: agentId,
      activity_type: 'message',
      description: 'Initial inquiry message',
      message_id: messageId,
      property_id: propertyId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    return { success: true, leadId: newLead.id };
  } catch (error: any) {
    console.error('Error creating lead from message:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get agent ID from user ID
 */
export async function getAgentIdFromUserId(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data?.id || null;
  } catch (error) {
    console.error('Error getting agent ID:', error);
    return null;
  }
}

/**
 * Get agent ID from property
 */
export async function getAgentIdFromProperty(propertyId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('agent_id')
      .eq('id', propertyId)
      .single();

    if (error) return null;
    return data?.agent_id || null;
  } catch (error) {
    console.error('Error getting agent ID from property:', error);
    return null;
  }
}

