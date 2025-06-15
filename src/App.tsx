import React, { useState, useEffect } from 'react'; // Import useEffect
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GamesList from './components/GamesList';
import InventoryManagement from './components/InventoryManagement';
import Reports from './components/Reports';
import Login from './components/Login';
import ConnectionStatus from './components/ConnectionStatus';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation

const AppContent: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate(); // Get the navigate function
  const location = useLocation(); // Get the current location

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isRegisterMode, setIsRegisterMode] = useState(location.pathname === '/register'); // Set initial mode based on route

  // Redirect based on authentication state
  useEffect(() => {
    if (state.isAuthenticated) {
      // If authenticated and on the login/register page, redirect to dashboard
      if (location.pathname === '/login' || location.pathname === '/register') {
        navigate('/');
      }
    } else {
      // If not authenticated and not on the login/register page, redirect to login
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login');
      }
    }
  }, [state.isAuthenticated, navigate, location.pathname]); // Depend on isAuthenticated, navigate, and location.pathname

  // Sync register mode with route
  useEffect(() => {
    setIsRegisterMode(location.pathname === '/register');
  }, [location.pathname]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'games':
        return <GamesList />;
      case 'inventory':
        return <InventoryManagement />;
      case 'reports':
        return <Reports />;
      case 'users':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Gerenciamento de Usuários</h2>
            <p className="text-gray-600">Funcionalidades de gerenciamento de usuários em breve...</p>
          </div>
        );
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <>
      <ConnectionStatus />
      {/* Render Login only if not authenticated and on login/register route */}
      {!state.isAuthenticated && (location.pathname === '/login' || location.pathname === '/register') && (
        <Login
          onToggleMode={() => {
            setIsRegisterMode(!isRegisterMode);
            // Navigate to the corresponding route when toggling mode
            navigate(isRegisterMode ? '/login' : '/register');
          }}
          isRegisterMode={isRegisterMode}
        />
      )}

      {/* Render Layout and page content only if authenticated */}
      {state.isAuthenticated && (
        <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
          {renderPage()}
        </Layout>
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
