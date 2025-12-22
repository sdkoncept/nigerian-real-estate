import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import PageTracker from './components/PageTracker'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import PropertyListingPage from './pages/PropertyListingPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import AgentsPage from './pages/AgentsPage'
import AgentDetailPage from './pages/AgentDetailPage'
import AgentDashboard from './pages/AgentDashboard'
import SellerDashboard from './pages/SellerDashboard'
import CreatePropertyPage from './pages/CreatePropertyPage'
import FavoritesPage from './pages/FavoritesPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminSubscriptionsPage from './pages/AdminSubscriptionsPage'
import AdminVerificationsPage from './pages/AdminVerificationsPage'
import AdminReportsPage from './pages/AdminReportsPage'
import AdminSettingsPage from './pages/AdminSettingsPage'
import AdminPropertiesPage from './pages/AdminPropertiesPage'
import AdminVisitorAnalyticsPage from './pages/AdminVisitorAnalyticsPage'
import LeadManagementPage from './pages/LeadManagementPage'
import PricingPage from './pages/PricingPage'
import SubscriptionPage from './pages/SubscriptionPage'
import PaymentHistoryPage from './pages/PaymentHistoryPage'
import MapViewPage from './pages/MapViewPage'
import MessagesPage from './pages/MessagesPage'
import ReviewsPage from './pages/ReviewsPage'
import TestimonialsPage from './pages/TestimonialsPage'
import ComparisonPage from './pages/ComparisonPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import RequestVerificationPage from './pages/RequestVerificationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ContactPage from './pages/ContactPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <PageTracker />
      <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/request-verification" element={<RequestVerificationPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/properties" element={<PropertyListingPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/agents" element={<AgentsPage />} />
      <Route path="/agents/:id" element={<AgentDetailPage />} />
      <Route path="/testimonials" element={<TestimonialsPage />} />
      <Route path="/comparison" element={<ComparisonPage />} />
      <Route path="/map" element={<MapViewPage />} />
      <Route path="/reviews/:type/:id" element={<ReviewsPage />} />
      
      {/* Protected routes - require authentication */}
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <PaymentHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/dashboard"
        element={
          <ProtectedRoute>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/leads"
        element={
          <ProtectedRoute>
            <LeadManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/properties/new"
        element={
          <ProtectedRoute>
            <CreatePropertyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subscriptions"
        element={
          <ProtectedRoute>
            <AdminSubscriptionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties"
        element={
          <ProtectedRoute>
            <AdminPropertiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/verifications"
        element={
          <ProtectedRoute>
            <AdminVerificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <AdminReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <AdminSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute>
            <AdminVisitorAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
