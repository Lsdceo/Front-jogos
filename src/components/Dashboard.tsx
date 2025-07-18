import React, { useMemo } from 'react';
import { useGamesAndInventory } from '../hooks/useGamesAndInventory';
import {
  Gamepad2,
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Eye,
  Plus
} from 'lucide-react';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  // NOVO HOOK
  const { games, inventory, loading, fetchInventory } = useGamesAndInventory();

  // Cálculos baseados nos dados do backend
  // Quantidade total de jogos = soma das quantidades no inventário
  const totalGames = useMemo(
    () => inventory.reduce((sum, item) => sum + item.quantidade, 0),
    [inventory]
  );

  // Valor total = soma do preço unitário atual * quantidade
  const totalValue = useMemo(
    () => inventory.reduce((sum, item) => sum + (item.precoUnitarioAtual * item.quantidade), 0),
    [inventory]
  );

  // Jogos com estoque baixo (quantidade <= 2, exemplo)
  const lowStockItems = useMemo(
    () => inventory.filter(item => item.quantidade <= 2),
    [inventory]
  );

  // Últimos 5 itens adicionados/alterados no inventário
  const recentInventory = useMemo(
    () => [...inventory].sort((a, b) => b.id - a.id).slice(0, 5),
    [inventory]
  );

  // Distribuição por plataforma (poderia ser por "plataformaNome", por exemplo)
  const platformStats = useMemo(() => {
    const acc: Record<string, number> = {};
    inventory.forEach(item => {
      acc[item.plataformaNome] = (acc[item.plataformaNome] || 0) + item.quantidade;
    });
    return acc;
  }, [inventory]);

  const statCards = [
    {
      title: 'Total de Jogos em Estoque',
      value: totalGames.toString(),
      icon: Gamepad2,
      color: 'bg-blue-500',
      change: '',
    },
    {
      title: 'Valor Total do Estoque',
      value: `R$ ${totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: '',
    },
    {
      title: 'Estoque Baixo',
      value: lowStockItems.length.toString(),
      icon: AlertTriangle,
      color: 'bg-amber-500',
      change: lowStockItems.length > 0 ? 'Alerta' : 'Bom',
    },
    {
      title: 'Itens Recentes',
      value: recentInventory.length.toString(),
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: 'Últimos adicionados',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 md:p-6 text-white">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Bem-vindo ao GameVault</h2>
        <p className="text-indigo-100 text-sm md:text-base">Gerencie seu inventário de jogos com facilidade e precisão</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-4 md:p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-2 md:p-3 rounded-lg flex-shrink-0 ml-2`}>
                  <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <button
            onClick={() => onPageChange('games')}
            className="flex items-center p-3 md:p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 mr-2 md:mr-3 flex-shrink-0" />
            <span className="font-medium text-indigo-600 text-sm md:text-base">Adicionar Novo Jogo</span>
          </button>
          <button
            onClick={() => onPageChange('inventory')}
            className="flex items-center p-3 md:p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Package className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 mr-2 md:mr-3 flex-shrink-0" />
            <span className="font-medium text-emerald-600 text-sm md:text-base">Gerenciar Estoque</span>
          </button>
          <button
            onClick={() => onPageChange('reports')}
            className="flex items-center p-3 md:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors sm:col-span-2 lg:col-span-1"
          >
            <Eye className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mr-2 md:mr-3 flex-shrink-0" />
            <span className="font-medium text-purple-600 text-sm md:text-base">Ver Relatórios</span>
          </button>
        </div>
      </div>

      {/* Platform Distribution & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Platform Distribution */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Jogos por Plataforma</h3>
          <div className="space-y-3">
            {Object.entries(platformStats).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between">
                <span className="text-gray-600 text-sm md:text-base truncate flex-1 mr-2">{platform}</span>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="w-20 md:w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(count / (totalGames || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs md:text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Alertas de Estoque Baixo</h3>
          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm md:text-base truncate">{item.jogoTitulo}</p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{item.plataformaNome}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs md:text-sm font-medium text-amber-600">
                      Estoque: {item.quantidade}
                    </p>
                    <p className="text-xs text-gray-500">ID: {item.id}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
              </div>
              <p className="text-gray-600 text-sm md:text-base">Todos os itens estão bem estocados!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Inventory Activity */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Itens Recentes no Estoque</h3>
        {recentInventory.length > 0 ? (
          <div className="space-y-3">
            {recentInventory.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm md:text-base truncate">{item.jogoTitulo}</p>
                  <p className="text-xs md:text-sm text-gray-600 truncate">{item.plataformaNome}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xs md:text-sm font-medium">
                    Qtd: {item.quantidade}
                  </p>
                  <p className="text-xs text-gray-500">R$ {item.precoUnitarioAtual.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">Nenhuma atividade recente</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;