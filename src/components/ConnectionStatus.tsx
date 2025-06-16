import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../config/api';

const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Tenta fazer uma requisição simples para verificar se o backend está respondendo
      await api.get('/jogos', { timeout: 5000 });
      setIsConnected(true);
      setLastCheck(new Date());
      console.log('✅ Backend conectado com sucesso!');
    } catch (error: any) {
      setIsConnected(false);
      setLastCheck(new Date());
      console.log('❌ Backend não está respondendo:', error.message);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Verifica a conexão a cada 60 segundos
    const interval = setInterval(checkConnection, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (isConnected === null && !isChecking) return null;

  return (
    <div className="fixed top-2 md:top-4 right-2 md:right-4 z-50">
      <div className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-1 md:py-2 rounded-lg shadow-lg transition-all ${
        isConnected 
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isChecking ? (
          <RefreshCw className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
        ) : isConnected ? (
          <Wifi className="w-3 h-3 md:w-4 md:h-4" />
        ) : (
          <WifiOff className="w-3 h-3 md:w-4 md:h-4" />
        )}
        
        <div className="flex flex-col">
          <span className="text-xs md:text-sm font-medium">
            {isChecking ? 'Verificando...' : isConnected ? 'Backend Online' : 'Backend Offline'}
          </span>
          {lastCheck && (
            <span className="text-xs opacity-75 hidden md:block">
              {lastCheck.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        {!isConnected && !isChecking && (
          <button
            onClick={checkConnection}
            className="ml-1 md:ml-2 p-1 hover:bg-red-200 rounded transition-colors"
            title="Tentar reconectar"
          >
            <RefreshCw className="w-2 h-2 md:w-3 md:h-3" />
          </button>
        )}
      </div>
      
      {/* URL do backend para debug - Hidden on mobile */}
      <div className="mt-1 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow text-center hidden md:block">
        jogos-inventario.azurewebsites.net
      </div>
    </div>
  );
};

export default ConnectionStatus;