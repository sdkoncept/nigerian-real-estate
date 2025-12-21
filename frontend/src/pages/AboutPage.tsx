import Layout from '../components/Layout';

export default function AboutPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
            <p className="text-xl text-primary-100 max-w-3xl">
              Nigeria's most trusted real estate platform, connecting buyers, sellers, and agents
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Mission Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              To revolutionize the Nigerian real estate market by providing a secure, transparent, and user-friendly platform that connects property seekers with verified listings and trusted agents.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              We believe everyone deserves access to safe, verified property transactions, and we're committed to eliminating fraud and scams from the real estate industry in Nigeria.
            </p>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">100% Verified</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All properties and agents undergo strict verification processes to ensure authenticity and safety.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="text-4xl mb-4">🇳🇬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nigerian Focus</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built specifically for the Nigerian market with local pricing, locations, and payment methods.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Easy</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Modern, intuitive interface that makes finding and listing properties quick and simple.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sign Up</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Create your account as a buyer, seller, or agent</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Verify</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Complete verification (required for agents and property listings)</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Browse or List</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Search properties or list your own</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-600">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Connect</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Contact agents or property owners securely</p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Choose Us?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="text-2xl mr-4">✅</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Verified Listings</h3>
                  <p className="text-gray-600 dark:text-gray-300">Every property is verified to prevent scams and fake listings</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-2xl mr-4">✅</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Verified Agents</h3>
                  <p className="text-gray-600 dark:text-gray-300">All agents are licensed and verified professionals</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-2xl mr-4">✅</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Secure Payments</h3>
                  <p className="text-gray-600 dark:text-gray-300">Safe payment processing with Paystack integration</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-2xl mr-4">✅</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Nigerian Naira</h3>
                  <p className="text-gray-600 dark:text-gray-300">All prices displayed in Nigerian Naira (₦)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-2xl mr-4">✅</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Local Support</h3>
                  <p className="text-gray-600 dark:text-gray-300">Customer support tailored for Nigerian users</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-2xl mr-4">✅</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Mobile Friendly</h3>
                  <p className="text-gray-600 dark:text-gray-300">Fully responsive design works on all devices</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-primary-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Have Questions?</h2>
            <p className="text-gray-700 mb-6">
              We're here to help! Contact us for support or inquiries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@housedirectng.com"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                📧 Email Us
              </a>
              <a
                href="tel:+2347061350647"
                className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                📞 Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

