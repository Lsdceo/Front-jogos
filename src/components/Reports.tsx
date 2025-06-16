import React, { useState } from 'react';
import { useGamesAndInventory } from '../hooks/useGamesAndInventory';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart
} from 'lucide-react';

const Reports: React.FC = () => {
  const { games, inventory } = useGamesAndInventory();
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // days

  // Aggregates
  const totalItems = inventory.reduce((sum, item) => sum + item.quantidade, 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.precoUnitarioAtual * item.quantidade), 0);
  const lowStockCount = inventory.filter(item => item.quantidade <= 2).length;

  // Distribuição por plataforma
  const platformDistribution = inventory.reduce((acc, item) => {
    acc[item.plataformaNome] = (acc[item.plataformaNome] || 0) + item.quantidade;
    return acc;
  }, {} as Record<string, number>);

  // Valor por plataforma
  const valueByPlatform = inventory.reduce((acc, item) => {
    acc[item.plataformaNome] = (acc[item.plataformaNome] || 0) + (item.precoUnitarioAtual * item.quantidade);
    return acc;
  }, {} as Record<string, number>);

  // Valor médio
  const avgPrice = totalItems ? totalValue / totalItems : 0;

  // Period filter for "recent inventory" (could be replaced by movements endpoint if available)
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - parseInt(selectedPeriod));
  // Aqui apenas como exemplo, filtra pelo id (não há data no DTO de estoque padrão)
  const recentInventory = [...inventory]
    .sort((a, b) => b.id - a.id)
    .filter((_, idx) => idx < 20); // Últimos 20

  // Report Sections
  const reportSections = [
    {
      title: 'Visão Geral do Inventário',
      icon: Package,
      data: [
        { label: 'Total de Itens', value: totalItems.toString(), color: 'text-blue-600' },
        { label: 'Valor Total', value: `R$ ${totalValue.toFixed(2)}`, color: 'text-emerald-600' },
        { label: 'Itens com Estoque Baixo', value: lowStockCount.toString(), color: 'text-amber-600' },
        { label: 'Preço Médio', value: `R$ ${avgPrice.toFixed(2)}`, color: 'text-purple-600' },
      ]
    },
    {
      title: 'Distribuição por Plataforma',
      icon: PieChart,
      data: Object.entries(platformDistribution).map(([platform, count]) => ({
        label: platform,
        value: count.toString(),
        percentage: ((count / totalItems) * 100).toFixed(1),
      }))
    },
    {
      title: 'Valor por Plataforma',
      icon: DollarSign,
      data: Object.entries(valueByPlatform).map(([platform, value]) => ({
        label: platform,
        value: `R$ ${value.toFixed(2)}`,
        percentage: ((value / totalValue) * 100).toFixed(1),
      }))
    },
  ];

  // Top jogos por valor
  const topGames = Object.values(
    inventory.reduce((acc, item) => {
      if (!acc[item.jogoId]) {
        acc[item.jogoId] = {
          ...games.find(g => g.id === item.jogoId),
          quantidade: 0,
          valorTotal: 0,
          plataformaNome: item.plataformaNome,
        };
      }
      acc[item.jogoId].quantidade += item.quantidade;
      acc[item.jogoId].valorTotal += item.precoUnitarioAtual * item.quantidade;
      return acc;
    }, {} as Record<number, any>)
  )
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h2>
          <p className="text-gray-600">Insights abrangentes sobre seu inventário de jogos</p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>

          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total de Jogos</p>
              <p className="text-3xl font-bold">{games.length}</p>
            </div>
            <Package className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Total de Itens</p>
              <p className="text-3xl font-bold">{totalItems}</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Valor do Portfólio</p>
              <p className="text-3xl font-bold">R$ {totalValue.toFixed(0)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100">Estoque Baixo</p>
              <p className="text-3xl font-bold">{lowStockCount}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-amber-200" />
          </div>
        </div>
      </div>

      {/* Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <Icon className="w-6 h-6 text-indigo-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
              </div>

              <div className="space-y-4">
                {section.data.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <span className="text-gray-600">{item.label}</span>
                    <div className="flex items-center space-x-3">
                      {'percentage' in item && (
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      )}
                      <span className={`font-semibold ${item.color || 'text-gray-900'}`}>
                        {item.value}
                        {'percentage' in item && ` (${item.percentage}%)`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estoque Recente (não movimentações!) */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 text-indigo-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Itens Recentes no Estoque
          </h3>
        </div>
        <div className="space-y-3">
          {recentInventory.length > 0 ? recentInventory.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <div>
                  <p className="font-medium text-gray-900">{item.jogoTitulo}</p>
                  <p className="text-sm text-gray-600">{item.plataformaNome}</p>
                  <p className="text-xs text-gray-500">Depósito: {item.depositoNome}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  Qtd: {item.quantidade}
                </p>
                <p className="text-xs text-gray-500">
                  R$ {item.precoUnitarioAtual.toFixed(2)}
                </p>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum item recente no estoque</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Games by Value */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-6 h-6 text-indigo-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Top Jogos por Valor</h3>
        </div>

        <div className="space-y-3">
          {topGames.map((game: any, index: number) => (
            <div key={game.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                <img className="w-10 h-10 rounded object-cover" src={game.urlImagemCapa} alt={game.titulo} />
                <div>
                  <p className="font-medium text-gray-900">{game.titulo}</p>
                  <p className="text-sm text-gray-600">{game.plataformaNome}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">R$ {game.valorTotal.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{game.quantidade} unidades</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;