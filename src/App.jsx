import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

import RegistrationForm from './pages/RegistrationForm';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import './index.css';

function Navigation({ user }) {
  const location = useLocation();
  
  return (
    <nav className="nav">
      <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
        Episcopal Consultation
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Registration</Link>
        <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>Dashboard</Link>
        {user && (
          <button 
            onClick={() => signOut(auth)} 
            className="nav-link" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}

// Protected Route Component
function ProtectedRoute({ user, loading, children }) {
  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Navigation user={user} />
      <main style={{ padding: '2rem 0' }}>
        <Routes>
          <Route path="/" element={<RegistrationForm />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute user={user} loading={loading}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
