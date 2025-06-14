import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Gamepad2,
  Package,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { state, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: Home },
    { id: 'games', label: 'Jogos', icon: Gamepad2 },
    { id: 'inventory', label: 'Inventário', icon: Package },
    { id: 'reports', label: 'Relatórios', icon: TrendingUp },
    ...(state.user?.role === 'admin' ? [{ id: 'users', label: 'Usuários', icon: Users }] : []),
  ];

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard': return 'Painel';
      case 'games': return 'Jogos';
      case 'inventory': return 'Inventário';
      case 'reports': return 'Relatórios';
      case 'users': return 'Usuários';
      default: return 'Painel';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 relative ${sidebarOpen ? 'w-64' : 'w-16'} lg:w-64`}>
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-xl text-gray-800 transition-opacity ${sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'opacity-100' : 'opacity-0'}`}>
              GameVault
            </span>
          </div>
        </div>

        <nav className="mt-8 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`ml-3 transition-opacity ${sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button - Fixed positioning */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 transition-opacity ${sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'opacity-100' : 'opacity-0'}`}>
              Sair
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {getPageTitle(currentPage)}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {state.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{state.user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {state.user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;