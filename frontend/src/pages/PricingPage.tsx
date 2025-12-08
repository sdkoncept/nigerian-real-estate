import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PaymentService } from '../services/payment';

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plans = {
    seller: [
      {
        name: 'Free',
        price: 0,
        period: 'forever',
        description: 'Perfect for trying out the platform',
        features: [
          'List up to 3 properties',
          'Basic property listing',
          'Standard search visibility',
          'Email support',
        ],
        limitations: ['No featured listings', 'Limited photos per property'],
        cta: 'Start Free',
        popular: false,
      },
      {
        name: 'Premium',
        price: 5000,
        period: 'month',
        description: 'Best for active sellers',
        features: [
          'Unlimited property listings',
          'Featured listing (1 property)',
          'Priority in search results',
          'Up to 20 photos per property',
          'Analytics dashboard',
          'Priority support',
        ],
        limitations: [],
        cta: 'Upgrade to Premium',
        popular: true,
      },
      {
        name: 'Enterprise',
        price: 15000,
        period: 'month',
        description: 'For property developers and agencies',
        features: [
          'Everything in Premium',
          'Up to 5 featured listings',
          'Top priority in search',
          'Unlimited photos',
          'Advanced analytics',
          'Dedicated account manager',
          'API access',
        ],
        limitations: [],
        cta: 'Contact Sales',
        popular: false,
      },
    ],
    agent: [
      {
        name: 'Free',
        price: 0,
        period: 'forever',
        description: 'Get started as an agent',
        features: [
          'Agent profile listing',
          'List up to 5 properties',
          'Basic verification',
          'Standard visibility',
        ],
        limitations: ['No featured profile', 'Limited listings'],
        cta: 'Start Free',
        popular: false,
      },
      {
        name: 'Professional',
        price: 10000,
        period: 'month',
        description: 'For serious real estate agents',
        features: [
          'Unlimited property listings',
          'Featured agent profile',
          'Priority verification',
          'Top search placement',
          'Client management tools',
          'Performance analytics',
          'Priority support',
        ],
        limitations: [],
        cta: 'Upgrade Now',
        popular: true,
      },
    ],
  };

  const handleSelectPlan = async (planName: string, price: number, userType: 'seller' | 'agent') => {
    if (!user) {
      navigate('/signup');
      return;
    }

    if (price === 0) {
      // Free plan - redirect to dashboard
      if (userType === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/agent/dashboard');
      }
      return;
    }

    // Paid plan - initiate payment
    try {
      setProcessing(planName);
      setError(null);

      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to continue');
      }

      // Determine plan type
      let planType: 'premium' | 'enterprise' | 'professional' = 'premium';
      if (planName === 'Enterprise') planType = 'enterprise';
      if (planName === 'Professional') planType = 'professional';

      // Initialize payment
      const paymentResult = await PaymentService.initializePayment(
        {
          amount: price,
          currency: 'NGN',
          payment_type: 'subscription',
          plan_type: planType,
          description: `${planName} Plan - ${userType === 'seller' ? 'Seller' : 'Agent'} Subscription`,
        },
        session.access_token
      );

      if (!paymentResult.success || !paymentResult.authorization_url) {
        throw new Error(paymentResult.error || 'Failed to initialize payment');
      }

      // Open Paystack payment window
      const paymentCompleted = await PaymentService.openPaymentWindow(
        paymentResult.authorization_url
      );

      if (paymentCompleted && paymentResult.reference) {
        // Verify payment
        const verifyResult = await PaymentService.verifyPayment(
          paymentResult.reference,
          session.access_token
        );

        if (verifyResult.success) {
          alert(`Payment successful! Your ${planName} subscription is now active.`);
          // Reload to show updated subscription status
          window.location.reload();
        } else {
          throw new Error('Payment verification failed. Please contact support.');
        }
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Choose the plan that works for you. No hidden fees. Cancel anytime.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center">
              {error}
            </div>
          )}

          {/* Seller Plans */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">For Property Sellers & Owners</h2>
              <p className="text-gray-600">List your properties, shortlets, and Airbnb rentals</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.seller.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl shadow-lg p-8 relative ${
                    plan.popular ? 'ring-4 ring-primary-500 scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        ₦{plan.price.toLocaleString()}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, i) => (
                      <li key={i} className="flex items-start text-gray-400">
                        <span className="mr-2">✗</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.name, plan.price, 'seller')}
                    disabled={processing === plan.name}
                    className={`w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {processing === plan.name ? 'Processing...' : plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Plans */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">For Real Estate Agents</h2>
              <p className="text-gray-600">Grow your business with verified agent profiles</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.agent.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl shadow-lg p-8 relative ${
                    plan.popular ? 'ring-4 ring-primary-500 scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        ₦{plan.price.toLocaleString()}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, i) => (
                      <li key={i} className="flex items-start text-gray-400">
                        <span className="mr-2">✗</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.name, plan.price, 'agent')}
                    disabled={processing === plan.name}
                    className={`w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {processing === plan.name ? 'Processing...' : plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Services */}
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Additional Services</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Featured Listing</h4>
                <p className="text-gray-600 mb-4">
                  Make your property stand out with featured placement
                </p>
                <div className="text-2xl font-bold text-primary-600 mb-2">₦2,000</div>
                <p className="text-sm text-gray-500">Per property, per month</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Priority Verification</h4>
                <p className="text-gray-600 mb-4">
                  Get your property verified within 24 hours
                </p>
                <div className="text-2xl font-bold text-primary-600 mb-2">₦5,000</div>
                <p className="text-sm text-gray-500">One-time fee</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h3>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-gray-900 mb-2">What payment methods do you accept?</h4>
                <p className="text-gray-600">
                  We accept all major payment methods through Paystack, including bank transfers, cards, and mobile money.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Can I cancel my subscription anytime?</h4>
                <p className="text-gray-600">
                  Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-gray-900 mb-2">What happens to my listings if I cancel?</h4>
                <p className="text-gray-600">
                  Your listings remain active, but you'll lose premium features like featured placement and priority support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

