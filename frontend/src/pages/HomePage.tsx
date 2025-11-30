import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    agents: 0,
    states: 0,
    verified: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get property count
      const { count: propertyCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get agent count
      const { count: agentCount } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get verified count
      const { count: verifiedCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('verification_status', 'verified');

      // Get unique states
      const { data: properties } = await supabase
        .from('properties')
        .select('state')
        .eq('is_active', true);

      const uniqueStates = new Set(properties?.map(p => p.state) || []);

      setStats({
        properties: propertyCount || 0,
        agents: agentCount || 0,
        states: uniqueStates.size || 0,
        verified: verifiedCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                100% Verified Properties
                <span className="block text-primary-200">No Scams. No Fake Listings.</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-4 max-w-2xl mx-auto">
                Find real properties. Connect with ID-verified agents. Buy, sell, or rent safely.
              </p>
              <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
                Tired of fake listings on Facebook? We verify every property and agent. All prices in Naira. All agents ID-checked.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/properties"
                  className="px-8 py-4 bg-white text-primary-700 rounded-lg font-bold text-lg hover:bg-primary-50 transition-all transform hover:scale-105 shadow-xl"
                >
                  Browse Properties
                </Link>
                {!user && (
                  <Link
                    to="/signup"
                    className="px-8 py-4 bg-primary-500 text-white rounded-lg font-bold text-lg hover:bg-primary-400 transition-all transform hover:scale-105 border-2 border-white"
                  >
                    List Your Property
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="relative bg-white/10 backdrop-blur-sm border-t border-white/20">
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stats.properties}+</div>
                  <div className="text-sm md:text-base text-primary-100">Active Properties</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stats.agents}+</div>
                  <div className="text-sm md:text-base text-primary-100">Verified Agents</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stats.states}+</div>
                  <div className="text-sm md:text-base text-primary-100">Nigerian States</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stats.verified}+</div>
                  <div className="text-sm md:text-base text-primary-100">Verified Listings</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Types Section */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Property Types We Support</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Whether you're buying, renting, or looking for short-term stays, we've got you covered
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Buy/Sell */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Buy & Sell</h3>
                <p className="text-gray-700 mb-4">Houses, apartments, land, and commercial properties</p>
                <Link to="/properties?type=sale" className="text-blue-600 font-semibold hover:text-blue-700">
                  Browse →
                </Link>
              </div>

              {/* Rent/Lease */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">🏘️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Rent & Lease</h3>
                <p className="text-gray-700 mb-4">Long-term rentals and lease agreements</p>
                <Link to="/properties?type=rent" className="text-green-600 font-semibold hover:text-green-700">
                  Browse →
                </Link>
              </div>

              {/* Shortlets */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">🏡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Shortlets</h3>
                <p className="text-gray-700 mb-4">Short-term stays for business travelers and tourists</p>
                <Link to="/properties?type=short_stay" className="text-purple-600 font-semibold hover:text-purple-700">
                  Browse →
                </Link>
              </div>

              {/* Airbnb */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">🏖️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Airbnb</h3>
                <p className="text-gray-700 mb-4">Vacation rentals and holiday accommodations</p>
                <Link to="/properties?type=airbnb" className="text-orange-600 font-semibold hover:text-orange-700">
                  Browse →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We're fixing what's wrong with real estate platforms in Nigeria
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">100% ID-Verified</h3>
                <p className="text-gray-600 mb-4">
                  Every property and agent is verified. No scams, no fake listings. We verify ID documents, property ownership, and agent credentials.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ ID verification (National ID, Passport)</li>
                  <li>✓ Phone & email verification</li>
                  <li>✓ Property ownership documents checked</li>
                  <li>✓ Real photos only (no stock images)</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Transparent Pricing</h3>
                <p className="text-gray-600 mb-4">
                  All prices in Naira. No hidden fees. Clear listing costs. Fair commission structure. You know exactly what you're paying.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ No hidden charges</li>
                  <li>✓ Clear fee structure</li>
                  <li>✓ Fair commission rates</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">All Property Types</h3>
                <p className="text-gray-600 mb-4">
                  Buy, sell, rent, lease, shortlets, Airbnb - we support everything. One platform for all your real estate needs.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>✓ Traditional sales & rentals</li>
                  <li>✓ Short-term stays</li>
                  <li>✓ Commercial properties</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Account</h3>
                <p className="text-gray-600">
                  Sign up as a buyer, seller, agent, or property owner. Choose what fits you best.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">List or Browse</h3>
                <p className="text-gray-600">
                  List your property with photos and details, or browse thousands of verified listings.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Connect & Close</h3>
                <p className="text-gray-600">
                  Connect with verified agents or property owners. Complete your transaction safely.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Real Nigerians sharing their real estate success stories
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Testimonial 1 */}
              <div className="bg-gray-50 rounded-xl p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    AO
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Adebayo Okafor</h4>
                    <p className="text-sm text-gray-600">Lagos, Seller</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  "Sold my property in 2 weeks! The verification process gave buyers confidence. No more dealing with time wasters."
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-gray-50 rounded-xl p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    CK
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Chioma Kalu</h4>
                    <p className="text-sm text-gray-600">Abuja, Buyer</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  "Finally found my dream home! The verified agents made all the difference. No scams, just real properties."
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-gray-50 rounded-xl p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    IE
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Ibrahim Emeka</h4>
                    <p className="text-sm text-gray-600">Port Harcourt, Agent</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  "Being verified helped me stand out. I get 3x more inquiries than before. Clients trust verified agents more."
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link
                to="/testimonials"
                className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center"
              >
                Read More Success Stories →
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-primary-100 mb-4 max-w-2xl mx-auto">
              Join thousands of Nigerians buying, selling, and renting properties safely
            </p>
            <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
              No scams. No fake listings. Just real estate with verified agents and properties.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    to="/signup"
                    className="px-8 py-4 bg-white text-primary-700 rounded-lg font-bold text-lg hover:bg-primary-50 transition-all shadow-xl"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    to="/properties"
                    className="px-8 py-4 bg-primary-500 text-white rounded-lg font-bold text-lg hover:bg-primary-400 transition-all border-2 border-white"
                  >
                    Browse Properties
                  </Link>
                </>
              ) : (
                <Link
                  to="/properties"
                  className="px-8 py-4 bg-white text-primary-700 rounded-lg font-bold text-lg hover:bg-primary-50 transition-all shadow-xl"
                >
                  Browse Properties
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
