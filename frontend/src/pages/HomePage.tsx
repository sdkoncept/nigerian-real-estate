import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome to Nigerian Real Estate
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Find your dream property in Nigeria
            </p>
            <Link
              to="/properties"
              className="inline-block px-8 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg"
            >
              Browse Properties →
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Browse Properties</h3>
              <p className="text-gray-600 mb-4">Explore thousands of verified properties across Nigeria</p>
              <Link
                to="/properties"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                View Properties →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">👔</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Find Agents</h3>
              <p className="text-gray-600 mb-4">Connect with verified real estate agents</p>
              <Link
                to="/agents"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Find Agents →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Verified Listings</h3>
              <p className="text-gray-600 mb-4">All properties and agents are verified for your safety</p>
              <Link
                to="/about"
                className="text-primary-600 font-semibold hover:text-primary-700"
              >
                Learn More →
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Platform Statistics</h3>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">12+</div>
                <div className="text-gray-600">Properties</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">6</div>
                <div className="text-gray-600">Nigerian States</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">100%</div>
                <div className="text-gray-600">Verified Listings</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">₦</div>
                <div className="text-gray-600">Naira Prices</div>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          {user && (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <p className="text-gray-600 mb-2">
                Welcome back, <span className="font-semibold text-gray-900">{user?.user_metadata?.name || user?.email}</span>!
              </p>
              <p className="text-sm text-gray-500">
                Ready to find your next property?
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </Layout>
  )
}

