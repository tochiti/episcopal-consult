import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import './index.css';

const RegistrationForm = lazy(() => import('./pages/RegistrationForm'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminRegistrations = lazy(() => import('./pages/admin/AdminRegistrations'));
const AdminRegistrationDetail = lazy(() => import('./pages/admin/AdminRegistrationDetail'));
const AdminBadges = lazy(() => import('./pages/admin/AdminBadges'));
const AdminAccommodation = lazy(() => import('./pages/admin/AdminAccommodation'));
const AdminTransport = lazy(() => import('./pages/admin/AdminTransport'));
const AdminProtocol = lazy(() => import('./pages/admin/AdminProtocol'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const Login = lazy(() => import('./pages/Login'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));

function ScreenLoader({ copy = 'Loading portal...' }) {
  return (
    <div className="page-shell relative flex items-center justify-center px-6">
      <span className="hero-blob" style={{ top: '20%', left: '15%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(224,178,90,0.18), transparent 70%)' }} aria-hidden />
      <span className="hero-blob" style={{ bottom: '10%', right: '10%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(110,29,42,0.55), transparent 70%)' }} aria-hidden />
      <div className="card relative z-10 w-full max-w-md p-8 text-center">
        <img src="/logo.png" alt="DNDN logo" className="logo-lg mx-auto" />
        <p className="eyebrow mt-5">DNDN 2026</p>
        <h1 className="display-heading mt-3 text-4xl">{copy}</h1>
        <div className="mx-auto mt-6 h-1 w-32 overflow-hidden rounded-full bg-[rgba(224,178,90,0.18)]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--accent)]" />
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ user, loading, children }) {
  if (loading) return <ScreenLoader copy="Checking admin access..." />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Episcopal Consult DNDN · DNDN 2026';
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Suspense fallback={<ScreenLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="registrations/:registrationId" element={<AdminRegistrationDetail />} />
            <Route path="badges" element={<AdminBadges />} />
            <Route path="accommodation" element={<AdminAccommodation />} />
            <Route path="transport" element={<AdminTransport />} />
            <Route path="protocol" element={<AdminProtocol />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
