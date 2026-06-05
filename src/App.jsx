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
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const Login = lazy(() => import('./pages/Login'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));

function ScreenLoader({ copy = 'Loading portal...' }) {
  return (
    <div className="page-shell flex items-center justify-center px-6">
      <div className="surface-card w-full max-w-md p-8 text-center">
        <img src="/logo.png" alt="DNDN logo" className="mx-auto h-16 w-16 rounded-full bg-white p-1.5 shadow-sm" />
        <p className="eyebrow mt-5">Episcopal Consult DNDN</p>
        <h1 className="mt-3 font-serif text-3xl text-slate-950">{copy}</h1>
        <div className="mx-auto mt-6 h-2 w-32 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-teal-600" />
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
    document.title = 'Episcopal Consult DNDN';
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
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
