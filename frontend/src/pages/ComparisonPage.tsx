import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import VerificationBadge from '../components/VerificationBadge';

export default function ComparisonPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Verified vs Unverified</h1>
            <p className="text-xl text-primary-100">
              Why verification matters in Nigeria's real estate market
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Agent Comparison */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Verified Agents vs Unverified Agents
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                {/* Unverified Agent */}
                <div className="p-8 bg-red-50">
                  <div className="text-center mb-6">
                    <div className="inline-block px-4 py-2 bg-red-500 text-white rounded-full font-bold mb-4">
                      Unverified Agent
                    </div>
                    <p className="text-black dark:text-gray-300">Anyone can claim to be an agent</p>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-black dark:text-gray-300">No ID verification - could be anyone</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-black dark:text-gray-300">No background check</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-black dark:text-gray-300">No track record visible</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Higher risk of scams</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-black dark:text-gray-300">No accountability</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Lower in search results</span>
                    </li>
                  </ul>

                  <div className="mt-6 p-4 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-800 font-semibold">
                      ⚠️ Risk: Could be a scammer, no way to verify identity
                    </p>
                  </div>
                </div>

                {/* Verified Agent */}
                <div className="p-8 bg-green-50">
                  <div className="text-center mb-6">
                    <div className="mb-4">
                      <VerificationBadge status="verified" type="agent" tier="trusted" size="lg" />
                    </div>
                    <p className="text-black dark:text-gray-300">ID-verified and trusted</p>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black dark:text-gray-300">ID verified (National ID, Passport)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Phone & email verified</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Track record visible (properties sold, reviews)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Lower risk - verified identity</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Accountable - can be reported</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Priority in search results</span>
                    </li>
                  </ul>

                  <div className="mt-6 p-4 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800 font-semibold">
                      ✅ Safe: Verified identity, track record, accountable
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg text-gray-700 mb-4">
                <strong>Verified agents get 3x more inquiries</strong> because buyers trust them more
              </p>
              <Link
                to="/agents"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all"
              >
                Browse Verified Agents →
              </Link>
            </div>
          </section>

          {/* Property Comparison */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Verified Properties vs Unverified Properties
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                {/* Unverified Property */}
                <div className="p-8 bg-red-50">
                  <div className="text-center mb-6">
                    <div className="inline-block px-4 py-2 bg-red-500 text-white rounded-full font-bold mb-4">
                      Unverified Property
                    </div>
                    <p className="text-black dark:text-gray-300">Could be fake or scam</p>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-black dark:text-gray-300">No ownership verification</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Could be stock photos (fake images)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Location not verified</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Price could be fake</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-black dark:text-gray-300">No seller verification</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Lower in search results</span>
                    </li>
                  </ul>

                  <div className="mt-6 p-4 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-800 font-semibold">
                      ⚠️ Risk: Could be a scam listing, property might not exist
                    </p>
                  </div>
                </div>

                {/* Verified Property */}
                <div className="p-8 bg-green-50">
                  <div className="text-center mb-6">
                    <div className="mb-4">
                      <VerificationBadge status="verified" type="property" size="lg" />
                    </div>
                    <p className="text-black dark:text-gray-300">Ownership verified and trusted</p>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Ownership documents verified</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Real photos verified (not stock images)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Location verified</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Price verified as realistic</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Seller ID verified</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-black dark:text-gray-300">Priority in search results</span>
                    </li>
                  </ul>

                  <div className="mt-6 p-4 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800 font-semibold">
                      ✅ Safe: Property exists, ownership verified, real photos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg text-gray-700 mb-4">
                <strong>Verified properties get 5x more views</strong> because buyers trust them
              </p>
              <Link
                to="/properties"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all"
              >
                Browse Verified Properties →
              </Link>
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Why Verification Matters</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">3x</div>
                <div className="text-black dark:text-gray-300">More inquiries for verified agents</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">5x</div>
                <div className="text-black dark:text-gray-300">More views for verified properties</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">0</div>
                <div className="text-black dark:text-gray-300">Scam reports from verified listings</div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Get Verified Today</h2>
            <p className="text-xl text-primary-100 mb-6">
              Stand out from unverified agents and properties. Get more clients and close more deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-400 rounded-lg font-bold text-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition-all shadow-xl"
              >
                Create Free Account
              </Link>
              <Link
                to="/agents"
                className="px-8 py-4 bg-primary-500 text-white rounded-lg font-bold text-lg hover:bg-primary-400 transition-all border-2 border-white"
              >
                Become Verified Agent
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

