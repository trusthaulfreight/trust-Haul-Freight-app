import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { useDarkMode } from '@/hooks/useDarkMode';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Layouts
import AppLayout from '@/components/layout/AppLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Public pages
import Landing from '@/pages/Landing';

// Protected pages
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import LoadBoard from '@/pages/LoadBoard';
import PostLoad from '@/pages/PostLoad';
import LoadDetail from '@/pages/LoadDetail';
import MyLoads from '@/pages/MyLoads';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';
import Reviews from '@/pages/Reviews';
import Subscription from '@/pages/Subscription';
import LoadCalendar from '@/pages/LoadCalendar';
import ShipmentReport from '@/pages/ShipmentReport';
import BulkLoads from '@/pages/BulkLoads';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  useDarkMode();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-muted border-t-secondary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-4">Loading TrustHaul...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  return (
    <AnimatePresence mode="wait">
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.18, ease: 'easeInOut' }}
      style={{ minHeight: '100%' }}
    >
    <Routes location={location}>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public landing page */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/loads" element={<LoadBoard />} />
          <Route path="/post-load" element={<PostLoad />} />
          <Route path="/load/:id" element={<LoadDetail />} />
          <Route path="/my-loads" element={<MyLoads />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/calendar" element={<LoadCalendar />} />
          <Route path="/report" element={<ShipmentReport />} />
          <Route path="/bulk-loads" element={<BulkLoads />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App