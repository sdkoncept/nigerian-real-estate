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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">For Property Sellers & Owners</h2>
              <p className="text-black dark:text-gray-300">List your properties, shortlets, and Airbnb rentals</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.seller.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 relative ${
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
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-black dark:text-white">
                        ₦{plan.price.toLocaleString()}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-black dark:text-gray-300">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-black dark:text-gray-300">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-black dark:text-gray-300">{feature}</span>
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
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">For Real Estate Agents</h2>
              <p className="text-black dark:text-gray-300">Grow your business with verified agent profiles</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.agent.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 relative ${
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
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-black dark:text-white">
                        ₦{plan.price.toLocaleString()}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-black dark:text-gray-300">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-black dark:text-gray-300">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-black dark:text-gray-300">{feature}</span>
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
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {processing === plan.name ? 'Processing...' : plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Services */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Additional Services</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-xl font-bold text-black dark:text-white mb-2">Featured Listing</h4>
                <p className="text-gray-600 mb-4">
                  Make your property stand out with featured placement
                </p>
                <div className="text-2xl font-bold text-primary-600 mb-2">₦2,000</div>
                <p className="text-sm text-gray-500">Per property, per month</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-xl font-bold text-black dark:text-white mb-2">Priority Verification</h4>
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
            <h3 className="text-3xl font-bold text-black dark:text-white mb-8 text-center">Frequently Asked Questions</h3>
            <div className="space-y-6">
              {/* CRM Questions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">What is the CRM feature for agents?</h4>
                <p className="text-black dark:text-gray-300">
                  Our CRM (Customer Relationship Management) system automatically creates leads from property inquiries, helps you track all client interactions, manage your sales pipeline, and close more deals. Every time someone inquires about your property, a lead is automatically created in your CRM.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">How does automatic lead creation work?</h4>
                <p className="text-black dark:text-gray-300">
                  When a buyer sends a message about your property, our system automatically creates a lead in your CRM. The lead includes their name, email, phone, and the property they're interested in. You can then track this lead through your sales pipeline from inquiry to closing.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">Can I track activities and notes for each lead?</h4>
                <p className="text-black dark:text-gray-300">
                  Yes! You can add activities (calls, meetings, viewings, emails) and notes for each lead. This helps you keep track of all interactions and never miss a follow-up. You can also mark notes as important or private.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">Is the CRM feature free?</h4>
                <p className="text-black dark:text-gray-300">
                  Yes! The CRM feature is included for all agents, even on the free plan. You get automatic lead creation, activity tracking, notes, and pipeline management at no extra cost.
                </p>
              </div>

              {/* Verification Questions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">What does "100% Verified" mean?</h4>
                <p className="text-black dark:text-gray-300">
                  All properties and agents on our platform are verified. Agents must submit their real estate license and government ID. Properties are verified for authenticity. This ensures no scams or fake listings - only real, verified properties and trusted agents.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">How long does verification take?</h4>
                <p className="text-black dark:text-gray-300">
                  Standard verification takes 2-5 business days. For ₦5,000, you can get priority verification within 24 hours. We review all documents carefully to ensure authenticity and safety.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">Do I need to be verified to list properties?</h4>
                <p className="text-black dark:text-gray-300">
                  Agents must be verified to list properties. Sellers can list properties, but verification is recommended for better visibility and trust. All properties go through a verification process to prevent scams.
                </p>
              </div>

              {/* Pricing Questions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">What payment methods do you accept?</h4>
                <p className="text-black dark:text-gray-300">
                  We accept all major payment methods through Paystack, including bank transfers, debit/credit cards, and mobile money. All payments are secure and processed in Nigerian Naira (₦).
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">Can I cancel my subscription anytime?</h4>
                <p className="text-black dark:text-gray-300">
                  Yes! You can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period. No cancellation fees or penalties.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">What happens to my listings if I cancel?</h4>
                <p className="text-black dark:text-gray-300">
                  Your listings remain active, but you'll lose premium features like featured placement, priority support, and unlimited listings. You'll revert to the free plan limits (3 properties for sellers, 5 for agents).
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">What's the difference between Free and Premium plans?</h4>
                <p className="text-black dark:text-gray-300">
                  Free plans allow limited listings (3 for sellers, 5 for agents) with basic features. Premium plans offer unlimited listings, featured placement, priority support, analytics, and more. All plans include CRM for agents and verification.
                </p>
              </div>

              {/* Property Listing Questions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">What types of properties can I list?</h4>
                <p className="text-black dark:text-gray-300">
                  You can list Houses, Apartments, Condos, Townhouses, Land, Commercial properties, Shortlets, and Airbnb rentals. We support all property types and listing types (sale, rent, lease, short stay, Airbnb).
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">How many photos can I upload per property?</h4>
                <p className="text-black dark:text-gray-300">
                  Free plans allow up to 10 photos per property. Premium and Enterprise plans allow up to 20 photos, and Enterprise allows unlimited photos. All photos are protected and cannot be downloaded.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">What is a featured listing?</h4>
                <p className="text-black dark:text-gray-300">
                  Featured listings appear at the top of search results with a special badge. They get 3x more views on average. Featured listings cost ₦2,000 per property per month and are included in Premium/Enterprise plans.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">Can I list shortlets and Airbnb properties?</h4>
                <p className="text-black dark:text-gray-300">
                  Yes! We fully support shortlets and Airbnb rentals. You can select "Shortlet" or "Airbnb" as your property type and listing type. These properties get the same features as regular listings.
                </p>
              </div>

              {/* Agent Questions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">What do I need to become a verified agent?</h4>
                <p className="text-black dark:text-gray-300">
                  You need a valid Real Estate Agent License (REA license) and a government-issued ID (National ID, Passport, Driver's License, or Voter's Card). You can also submit professional credentials. All documents are reviewed by our admin team.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">What are the benefits of being a verified agent?</h4>
                <p className="text-black dark:text-gray-300">
                  Verified agents get a verified badge, higher search ranking, access to CRM, analytics dashboard, ability to list premium properties, and increased trust from potential clients. You also get priority in search results.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">How do I access the CRM feature?</h4>
                <p className="text-black dark:text-gray-300">
                  Once you're logged in as an agent, go to your Agent Dashboard and click "Manage Leads" in the sidebar, or navigate to /agent/leads. Your CRM shows all leads, activities, and pipeline statistics.
                </p>
              </div>

              {/* Seller Questions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">How do I list my property?</h4>
                <p className="text-black dark:text-gray-300">
                  Sign up as a seller, go to Seller Dashboard, and click "Create New Property". Fill in all property details, upload photos, set your price, and submit. Your property will be reviewed and verified before going live.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">How do I get inquiries about my property?</h4>
                <p className="text-black dark:text-gray-300">
                  Buyers can contact you directly through the platform's messaging system. If you're an agent, all inquiries automatically become leads in your CRM. You'll receive notifications for new messages and inquiries.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">Can I edit or delete my property listing?</h4>
                <p className="text-black dark:text-gray-300">
                  Yes! You can edit your property details, photos, and pricing anytime from your Seller Dashboard. You can also delete listings if the property is no longer available. Changes are reflected immediately.
                </p>
              </div>

              {/* Buyer Questions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">How do I contact a property owner or agent?</h4>
                <p className="text-black dark:text-gray-300">
                  Click "Contact Owner" or "Send Message" on any property page. You'll need to sign up (free) to send messages. Your inquiry will be sent directly to the property owner or agent, and if they're an agent, it automatically becomes a lead in their CRM.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">Are all properties verified and real?</h4>
                <p className="text-black dark:text-gray-300">
                  Yes! We verify all properties before they go live. Our verification process checks property ownership, authenticity, and prevents fake listings. All properties have a verification status badge.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">Can I save properties to view later?</h4>
                <p className="text-black dark:text-gray-300">
                  Yes! Click the heart icon on any property to add it to your favorites. You can view all your saved properties in the Favorites section. This feature is free for all users.
                </p>
              </div>

              {/* Platform Questions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">Is the platform free to use?</h4>
                <p className="text-black dark:text-gray-300">
                  Yes! Browsing properties, creating accounts, and basic features are completely free. Premium features like unlimited listings, featured placement, and priority verification are optional paid upgrades.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">Is my data secure?</h4>
                <p className="text-black dark:text-gray-300">
                  Absolutely! We use industry-standard encryption, secure authentication, and follow best practices for data protection. Your personal information and payment details are never shared with third parties.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">Does the platform work on mobile phones?</h4>
                <p className="text-black dark:text-gray-300">
                  Yes! Our platform is fully responsive and works perfectly on mobile phones, tablets, and desktops. You can browse, list properties, manage leads, and use all features on any device.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">What makes House Direct NG different from other platforms?</h4>
                <p className="text-black dark:text-gray-300">
                  We're the only platform with 100% verification, CRM for agents, support for shortlets/Airbnb, Nigerian Naira pricing, and no scams. We're built specifically for the Nigerian market with local support and features.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">How do I report a suspicious listing or user?</h4>
                <p className="text-black dark:text-gray-300">
                  Use the "Report" button on any property or user profile. Our admin team reviews all reports within 24 hours. You can also contact support directly at support@housedirectng.com or call +234 7061350647.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-bold text-black dark:text-white mb-2">Can I change my account type after signing up?</h4>
                <p className="text-black dark:text-gray-300">
                  Yes, but you'll need to contact support to change your account type (buyer to seller/agent, etc.). Some changes may require additional verification. Contact us at support@housedirectng.com for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

