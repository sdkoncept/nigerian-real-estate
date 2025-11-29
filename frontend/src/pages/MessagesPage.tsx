import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  property_id: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender_name?: string;
  sender_email?: string;
  property_title?: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user, activeTab]);

  const loadMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab === 'inbox') {
        query = query.eq('recipient_id', user.id);
      } else {
        query = query.eq('sender_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading messages:', error);
      } else if (data) {
        // Get sender/recipient details and property details
        const messagesWithDetails = await Promise.all(
          (data || []).map(async (msg: any) => {
            // Get sender details
            const { data: sender } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', msg.sender_id)
              .single();

            // Get property details if exists
            let propertyTitle = null;
            if (msg.property_id) {
              const { data: property } = await supabase
                .from('properties')
                .select('title')
                .eq('id', msg.property_id)
                .single();
              propertyTitle = property?.title || null;
            }

            return {
              ...msg,
              sender_name: sender?.full_name || 'Unknown',
              sender_email: sender?.email || '',
              property_title: propertyTitle,
            };
          })
        );

        setMessages(messagesWithDetails);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('recipient_id', user.id);

      if (!error) {
        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read && activeTab === 'inbox').length;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Messages</h1>
            <p className="text-xl text-primary-100">Communicate with property owners and agents</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Message List */}
              <div className="md:col-span-1 bg-white rounded-lg shadow-md">
                {/* Tabs */}
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab('inbox')}
                    className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                      activeTab === 'inbox'
                        ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Inbox {unreadCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-primary-600 text-white rounded-full text-xs">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('sent')}
                    className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                      activeTab === 'sent'
                        ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Sent
                  </button>
                </div>

                {/* Messages List */}
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">📭</div>
                      <p>No messages</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => {
                          setSelectedMessage(message);
                          if (activeTab === 'inbox' && !message.is_read) {
                            markAsRead(message.id);
                          }
                        }}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          !message.is_read && activeTab === 'inbox' ? 'bg-blue-50' : ''
                        } ${selectedMessage?.id === message.id ? 'bg-primary-50' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {activeTab === 'inbox' ? message.sender_name : 'You'}
                          </h4>
                          {!message.is_read && activeTab === 'inbox' && (
                            <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                          )}
                        </div>
                        {message.property_title && (
                          <p className="text-xs text-primary-600 mb-1">{message.property_title}</p>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Message Detail */}
              <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
                {selectedMessage ? (
                  <div>
                    <div className="flex items-start justify-between mb-4 pb-4 border-b">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedMessage.subject || 'No Subject'}
                        </h2>
                        <div className="text-sm text-gray-600">
                          <p>
                            <strong>From:</strong> {selectedMessage.sender_name} ({selectedMessage.sender_email})
                          </p>
                          <p>
                            <strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}
                          </p>
                          {selectedMessage.property_title && (
                            <p>
                              <strong>Property:</strong>{' '}
                              <Link
                                to={`/properties/${selectedMessage.property_id}`}
                                className="text-primary-600 hover:underline"
                              >
                                {selectedMessage.property_title}
                              </Link>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">💬</div>
                    <p>Select a message to view</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

