import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GamesList from './components/GamesList';
import InventoryManagement from './components/InventoryManagement';
import Reports from './components/Reports';
import Login from './components/Login';
import ConnectionStatus from './components/ConnectionStatus';

const AppContent: React.FC = () => {
  const { state } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  if (!state.isAuthenticated) {
    return (
      <>
        <ConnectionStatus />
        <Login 
          onToggleMode={() => setIsRegisterMode(!isRegisterMode)}
          isRegisterMode={isRegisterMode}
        />
      </>
    );
  }

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
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
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