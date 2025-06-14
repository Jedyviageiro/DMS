import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import './assets/styles/global.css';
import './assets/styles/ClienteDashboard.css';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ClienteDashboard from './pages/Cliente/ClienteDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [userRole, setUserRole] = useState(null);

  const handleNavigate = (page, role = null) => {
    setCurrentPage(page);
    if (role) {
      setUserRole(role);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'cliente':
        return <ClienteDashboard onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app">
      <AuthProvider>
        {renderPage()}
      </AuthProvider>
    </div>
  );
}

export default App;