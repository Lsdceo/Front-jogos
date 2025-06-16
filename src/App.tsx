import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GamesList from './components/GamesList';
import InventoryManagement from './components/InventoryManagement';
import Reports from './components/Reports';
import Login from './components/Login';
import ConnectionStatus from './components/ConnectionStatus';
import { useNavigate, useLocation } from 'react-router-dom';

const AppContent: React.FC = () => {
  // Use the modified useAuth hook
  const { state, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isRegisterMode, setIsRegisterMode] = useState(location.pathname === '/register');

  // Redirect based on authentication state
  useEffect(() => {
    if (state.isAuthenticated) {
      // If authenticated and on the login/register page, redirect to dashboard
      if (location.pathname === '/login' || location.pathname === '/register') {
        navigate('/');
      }
      // Optional: Redirect from admin pages if not admin
      if (location.pathname === '/users' && !isAdmin) {
          navigate('/'); // Redirect to home or dashboard if not admin
      }
       // Set current page based on path on initial load if authenticated
      const pathPage = location.pathname.substring(1); // Remove leading slash
      if (['dashboard', 'games', 'inventory', 'reports', 'users'].includes(pathPage)) {
          // Check if the user has access to the page, especially 'users'
          if (pathPage === 'users' && !isAdmin) {
              setCurrentPage('dashboard'); // Default to dashboard if no access
          } else {
               setCurrentPage(pathPage);
          }
      } else if (state.isAuthenticated && location.pathname === '/') {
          setCurrentPage('dashboard'); // Default to dashboard if on root and authenticated
      }


    } else {
      // If not authenticated and not on the login/register page, redirect to login
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login');
      }
    }
  }, [state.isAuthenticated, navigate, location.pathname, isAdmin]); // Depend on isAdmin here


  // Sync register mode with route
  useEffect(() => {
    setIsRegisterMode(location.pathname === '/register');
  }, [location.pathname]);

  // Handle page changes from Layout or other components
  const handlePageChange = (page: string) => {
      // Navigate to the corresponding route when changing page
      navigate(`/${page}`);
      setCurrentPage(page);
  };


  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={handlePageChange} />;
      case 'games':
        return <GamesList />;
      case 'inventory':
        return <InventoryManagement />;
      case 'reports':
        return <Reports />;
      case 'users':
         // Conditionally render the Users page content based on isAdmin
        return isAdmin ? (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
            <p className="text-gray-600">User management functionalities coming soon...</p>
             {/* TODO: Implement actual user management components here */}
          </div>
        ) : (
             // Should not happen if useEffect redirect works, but as a fallback
            <div className="text-center py-8 text-red-600">
                <h2 className="text-xl font-bold">Access Denied</h2>
                <p>You do not have permission to view this page.</p>
            </div>
        );
      default:
        return <Dashboard onPageChange={handlePageChange} />;
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
        <Layout currentPage={currentPage} onPageChange={handlePageChange}>
          {renderPage()}
        </Layout>
      )}
    </>
  );
};

function App() {
  return (
    // AuthProvider should wrap the router if you are using react-router-dom
    // as useAuth and useNavigate/useLocation might need to be inside the router context
    // Assuming you are using react-router-dom higher up or this is your entry point
    // that will be wrapped by BrowserRouter.
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
