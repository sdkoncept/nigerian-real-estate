import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  user_id: string;
  property_id: string | null;
  agent_id: string | null;
  rating: number;
  comment: string;
  is_verified: boolean;
  created_at: string;
  user_name?: string;
  property_title?: string;
  agent_name?: string;
}

export default function ReviewsPage() {
  const { id, type } = useParams<{ id: string; type: 'property' | 'agent' }>();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    if (id) {
      loadReviews();
    }
  }, [id, type]);

  const loadReviews = async () => {
    if (!id) return;

    try {
      setLoading(true);
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });

      if (type === 'property') {
        query = query.eq('property_id', id);
      } else if (type === 'agent') {
        query = query.eq('agent_id', id);
      } else {
        // Load all reviews
        query = query.limit(50);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading reviews:', error);
      } else if (data) {
        // Get user and entity details
        const reviewsWithDetails = await Promise.all(
          (data || []).map(async (review: any) => {
            // Get user details
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', review.user_id)
              .single();

            // Get property/agent details
            let propertyTitle = null;
            let agentName = null;

            if (review.property_id) {
              const { data: property } = await supabase
                .from('properties')
                .select('title')
                .eq('id', review.property_id)
                .single();
              propertyTitle = property?.title || null;
            }

            if (review.agent_id) {
              const { data: agent } = await supabase
                .from('agents')
                .select('user_id, profiles:user_id(full_name)')
                .eq('id', review.agent_id)
                .single();
              agentName = (agent as any)?.profiles?.full_name || null;
            }

            return {
              ...review,
              user_name: userData?.full_name || 'Anonymous',
              property_title: propertyTitle,
              agent_name: agentName,
            };
          })
        );

        setReviews(reviewsWithDetails);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    try {
      const reviewData: any = {
        user_id: user.id,
        rating: formData.rating,
        comment: formData.comment,
        is_verified: false,
      };

      if (type === 'property') {
        reviewData.property_id = id;
      } else if (type === 'agent') {
        reviewData.agent_id = id;
      } else {
        alert('Please specify review type');
        return;
      }

      const { error } = await supabase.from('reviews').insert(reviewData);

      if (error) {
        throw error;
      }

      alert('Review submitted successfully! It will be visible after moderation.');
      setFormData({ rating: 5, comment: '' });
      setShowForm(false);
      await loadReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert('Error submitting review: ' + error.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Reviews & Ratings</h1>
            <p className="text-xl text-primary-100">
              {type === 'property' ? 'Property Reviews' : type === 'agent' ? 'Agent Reviews' : 'All Reviews'}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Rating Summary */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-2xl ${
                            star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Review Form */}
            {user && !showForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Write a Review
                </button>
              </div>
            )}

            {showForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className={`text-3xl ${
                            star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                          } hover:text-yellow-400 transition-colors`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ml-2 text-gray-600">{formData.rating} out of 5</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      rows={5}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Share your experience..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                    >
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setFormData({ rating: 5, comment: '' });
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600">Be the first to leave a review!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
                        {review.property_title && (
                          <Link
                            to={`/properties/${review.property_id}`}
                            className="text-sm text-primary-600 hover:underline"
                          >
                            {review.property_title}
                          </Link>
                        )}
                        {review.agent_name && (
                          <Link
                            to={`/agents/${review.agent_id}`}
                            className="text-sm text-primary-600 hover:underline"
                          >
                            {review.agent_name}
                          </Link>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg ${
                                star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                    {review.is_verified && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        ✓ Verified Review
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

