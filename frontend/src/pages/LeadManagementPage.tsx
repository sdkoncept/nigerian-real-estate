import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Lead {
  id: string;
  agent_id: string;
  property_id: string | null;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  source: string;
  status: string;
  interest_type: string;
  budget_min: number | null;
  budget_max: number | null;
  preferred_location: string | null;
  notes: string | null;
  priority: string;
  lead_score: number;
  first_contact_at: string | null;
  last_contact_at: string | null;
  closed_at: string | null;
  created_at: string;
  property_title?: string;
}

interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  subject: string | null;
  description: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  status: string;
  created_at: string;
}

interface LeadNote {
  id: string;
  lead_id: string;
  note: string;
  is_important: boolean;
  is_private: boolean;
  created_at: string;
}

export default function LeadManagementPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'viewing_scheduled' | 'viewing_completed' | 'offer_made' | 'closed_won' | 'closed_lost'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'property_inquiry' as string,
    interest_type: 'buy' as string,
    budget_min: '',
    budget_max: '',
    preferred_location: '',
    notes: '',
    priority: 'medium' as string,
  });

  const [activityForm, setActivityForm] = useState({
    activity_type: 'call' as string,
    subject: '',
    description: '',
    scheduled_at: '',
    duration_minutes: '',
  });

  const [noteForm, setNoteForm] = useState({
    note: '',
    is_important: false,
    is_private: false,
  });

  useEffect(() => {
    if (user) {
      loadAgentId();
    }
  }, [user]);

  useEffect(() => {
    if (agentId) {
      loadLeads();
    }
  }, [agentId, filter]);

  useEffect(() => {
    if (selectedLead) {
      loadLeadDetails();
    }
  }, [selectedLead]);

  const loadAgentId = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setAgentId(data?.id || null);
    } catch (error) {
      console.error('Error loading agent ID:', error);
    }
  };

  const loadLeads = async () => {
    if (!agentId) return;
    try {
      setLoading(true);
      let query = supabase
        .from('leads')
        .select('*, properties:property_id(title)')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const leadsWithPropertyTitle = (data || []).map((lead: any) => ({
        ...lead,
        property_title: lead.properties?.title || null,
      }));

      setLeads(leadsWithPropertyTitle);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeadDetails = async () => {
    if (!selectedLead || !agentId) return;
    try {
      // Load activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', selectedLead.id)
        .order('created_at', { ascending: false });

      if (!activitiesError) {
        setActivities(activitiesData || []);
      }

      // Load notes
      const { data: notesData, error: notesError } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', selectedLead.id)
        .order('created_at', { ascending: false });

      if (!notesError) {
        setNotes(notesData || []);
      }
    } catch (error) {
      console.error('Error loading lead details:', error);
    }
  };

  const handleCreateLead = async () => {
    if (!agentId) return;
    try {
      const { error } = await supabase.from('leads').insert({
        agent_id: agentId,
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone || null,
        source: leadForm.source,
        interest_type: leadForm.interest_type,
        budget_min: leadForm.budget_min ? parseFloat(leadForm.budget_min) : null,
        budget_max: leadForm.budget_max ? parseFloat(leadForm.budget_max) : null,
        preferred_location: leadForm.preferred_location || null,
        notes: leadForm.notes || null,
        priority: leadForm.priority,
        first_contact_at: new Date().toISOString(),
        last_contact_at: new Date().toISOString(),
      });

      if (error) throw error;

      setShowLeadModal(false);
      setLeadForm({
        name: '',
        email: '',
        phone: '',
        source: 'property_inquiry',
        interest_type: 'buy',
        budget_min: '',
        budget_max: '',
        preferred_location: '',
        notes: '',
        priority: 'medium',
      });
      loadLeads();
    } catch (error: any) {
      console.error('Error creating lead:', error);
      alert('Error creating lead: ' + error.message);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'closed_won' || newStatus === 'closed_lost') {
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId);

      if (error) throw error;

      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
      loadLeads();
    } catch (error: any) {
      console.error('Error updating lead status:', error);
      alert('Error updating lead: ' + error.message);
    }
  };

  const handleCreateActivity = async () => {
    if (!selectedLead || !agentId) return;
    try {
      const { error } = await supabase.from('lead_activities').insert({
        lead_id: selectedLead.id,
        agent_id: agentId,
        activity_type: activityForm.activity_type,
        subject: activityForm.subject || null,
        description: activityForm.description || null,
        scheduled_at: activityForm.scheduled_at || null,
        duration_minutes: activityForm.duration_minutes ? parseInt(activityForm.duration_minutes) : null,
        status: activityForm.scheduled_at ? 'scheduled' : 'completed',
        completed_at: activityForm.scheduled_at ? null : new Date().toISOString(),
      });

      if (error) throw error;

      setShowActivityModal(false);
      setActivityForm({
        activity_type: 'call',
        subject: '',
        description: '',
        scheduled_at: '',
        duration_minutes: '',
      });
      loadLeadDetails();
    } catch (error: any) {
      console.error('Error creating activity:', error);
      alert('Error creating activity: ' + error.message);
    }
  };

  const handleCreateNote = async () => {
    if (!selectedLead || !agentId) return;
    try {
      const { error } = await supabase.from('lead_notes').insert({
        lead_id: selectedLead.id,
        agent_id: agentId,
        note: noteForm.note,
        is_important: noteForm.is_important,
        is_private: noteForm.is_private,
      });

      if (error) throw error;

      setShowNoteModal(false);
      setNoteForm({
        note: '',
        is_important: false,
        is_private: false,
      });
      loadLeadDetails();
    } catch (error: any) {
      console.error('Error creating note:', error);
      alert('Error creating note: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      viewing_scheduled: 'bg-purple-100 text-purple-800',
      viewing_completed: 'bg-indigo-100 text-indigo-800',
      offer_made: 'bg-orange-100 text-orange-800',
      negotiating: 'bg-pink-100 text-pink-800',
      closed_won: 'bg-green-100 text-green-800',
      closed_lost: 'bg-red-100 text-red-800',
      nurturing: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.phone && lead.phone.includes(searchTerm))
  );

  const statusCounts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    viewing_scheduled: leads.filter(l => l.status === 'viewing_scheduled').length,
    viewing_completed: leads.filter(l => l.status === 'viewing_completed').length,
    offer_made: leads.filter(l => l.status === 'offer_made').length,
    closed_won: leads.filter(l => l.status === 'closed_won').length,
    closed_lost: leads.filter(l => l.status === 'closed_lost').length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Lead Management</h1>
                <p className="text-xl text-primary-100">Manage your leads and close more deals</p>
              </div>
              <Link
                to="/agent/dashboard"
                className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-black dark:text-white">{statusCounts.all}</div>
              <div className="text-sm text-black dark:text-gray-300">Total Leads</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.new}</div>
              <div className="text-sm text-black dark:text-gray-300">New Leads</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.closed_won}</div>
              <div className="text-sm text-black dark:text-gray-300">Closed Won</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{statusCounts.viewing_scheduled}</div>
              <div className="text-sm text-black dark:text-gray-300">Viewings</div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search leads by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'new', 'contacted', 'viewing_scheduled', 'viewing_completed', 'offer_made', 'closed_won', 'closed_lost'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      filter === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')} {status !== 'all' && `(${statusCounts[status]})`}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowLeadModal(true)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                + Add Lead
              </button>
            </div>
          </div>

          {/* Leads List */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Leads Column */}
            <div className="space-y-4">
              {filteredLeads.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-2">No Leads Found</h3>
                  <p className="text-black dark:text-gray-300 mb-6">Start by adding your first lead or converting property inquiries.</p>
                  <button
                    onClick={() => setShowLeadModal(true)}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                  >
                    Add Your First Lead
                  </button>
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedLead?.id === lead.id ? 'ring-2 ring-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black dark:text-white mb-1">{lead.name}</h3>
                        <p className="text-sm text-black dark:text-gray-300">{lead.email}</p>
                        {lead.phone && (
                          <p className="text-sm text-black dark:text-gray-300">{lead.phone}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </div>
                    {lead.property_title && (
                      <p className="text-sm text-black dark:text-gray-400 mb-2">Property: {lead.property_title}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-sm font-medium ${getPriorityColor(lead.priority)}`}>
                        {lead.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-black dark:text-gray-400">
                        Score: {lead.lead_score}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Lead Details Column */}
            {selectedLead && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-black dark:text-white">Lead Details</h2>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                {/* Lead Info */}
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Name</label>
                    <p className="text-black dark:text-white">{selectedLead.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Email</label>
                    <p className="text-black dark:text-white">{selectedLead.email}</p>
                  </div>
                  {selectedLead.phone && (
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Phone</label>
                      <p className="text-black dark:text-white">{selectedLead.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => handleUpdateLeadStatus(selectedLead.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="viewing_scheduled">Viewing Scheduled</option>
                      <option value="viewing_completed">Viewing Completed</option>
                      <option value="offer_made">Offer Made</option>
                      <option value="negotiating">Negotiating</option>
                      <option value="closed_won">Closed Won</option>
                      <option value="closed_lost">Closed Lost</option>
                      <option value="nurturing">Nurturing</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setShowActivityModal(true)}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                  >
                    + Activity
                  </button>
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                  >
                    + Note
                  </button>
                </div>

                {/* Activities Timeline */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Activities</h3>
                  <div className="space-y-3">
                    {activities.length === 0 ? (
                      <p className="text-sm text-black dark:text-gray-400">No activities yet</p>
                    ) : (
                      activities.map((activity) => (
                        <div key={activity.id} className="border-l-2 border-primary-600 pl-4 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-black dark:text-white">{activity.activity_type}</span>
                            <span className="text-xs text-black dark:text-gray-400">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {activity.subject && (
                            <p className="text-sm text-black dark:text-gray-300 mt-1">{activity.subject}</p>
                          )}
                          {activity.description && (
                            <p className="text-sm text-black dark:text-gray-400 mt-1">{activity.description}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Notes</h3>
                  <div className="space-y-3">
                    {notes.length === 0 ? (
                      <p className="text-sm text-black dark:text-gray-400">No notes yet</p>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-black dark:text-gray-400">
                              {new Date(note.created_at).toLocaleDateString()}
                            </span>
                            {note.is_important && (
                              <span className="text-xs text-orange-600">⭐ Important</span>
                            )}
                          </div>
                          <p className="text-sm text-black dark:text-white">{note.note}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Lead Modal */}
        {showLeadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Add New Lead</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">Source</label>
                  <select
                    value={leadForm.source}
                    onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="property_inquiry">Property Inquiry</option>
                    <option value="agent_search">Agent Search</option>
                    <option value="referral">Referral</option>
                    <option value="website">Website</option>
                    <option value="social_media">Social Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">Interest Type</label>
                  <select
                    value={leadForm.interest_type}
                    onChange={(e) => setLeadForm({ ...leadForm, interest_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="buy">Buy</option>
                    <option value="rent">Rent</option>
                    <option value="lease">Lease</option>
                    <option value="sell">Sell</option>
                    <option value="invest">Invest</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">Priority</label>
                  <select
                    value={leadForm.priority}
                    onChange={(e) => setLeadForm({ ...leadForm, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={leadForm.notes}
                    onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCreateLead}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Create Lead
                </button>
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Activity Modal */}
        {showActivityModal && selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Add Activity</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">Activity Type</label>
                  <select
                    value={activityForm.activity_type}
                    onChange={(e) => setActivityForm({ ...activityForm, activity_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="viewing">Viewing</option>
                    <option value="message">Message</option>
                    <option value="note">Note</option>
                    <option value="offer">Offer</option>
                    <option value="contract">Contract</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={activityForm.subject}
                    onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">Scheduled At (optional)</label>
                  <input
                    type="datetime-local"
                    value={activityForm.scheduled_at}
                    onChange={(e) => setActivityForm({ ...activityForm, scheduled_at: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCreateActivity}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Add Activity
                </button>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Note Modal */}
        {showNoteModal && selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Add Note</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-gray-300 mb-2">Note *</label>
                  <textarea
                    value={noteForm.note}
                    onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={noteForm.is_important}
                      onChange={(e) => setNoteForm({ ...noteForm, is_important: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-black dark:text-white">Important</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={noteForm.is_private}
                      onChange={(e) => setNoteForm({ ...noteForm, is_private: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-black dark:text-white">Private</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCreateNote}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Add Note
                </button>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

