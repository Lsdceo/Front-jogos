import React, { useState } from 'react';
import { useGamesAndInventory } from '../hooks/useGamesAndInventory';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Minus,
  ArrowRightLeft,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar
} from 'lucide-react';

const InventoryManagement: React.FC = () => {
  const { games, inventory, addStockMovement, loading, fetchInventory } = useGamesAndInventory();
  const { state } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'add-movement'>('overview');
  const [movementForm, setMovementForm] = useState({
    jogoId: '',
    tipo: 'ENTRADA' as 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA',
    quantidade: 1,
    observacao: '',
    plataformaId: '',
    depositoOrigemId: '',
    depositoDestinoId: '',
  });

  // Estoque baixo: você pode definir a regra, aqui exemplo para 2 ou menos.
  const lowStockItems = inventory.filter(item => item.quantidade <= 2);

  // Mostra os últimos 10 registros de inventário (não movimentação detalhada)
  // Ideal: criar um hook separado para buscar movimentações se seu backend tiver endpoint para isso!
  const recentInventory = [...inventory].sort((a, b) => b.id - a.id).slice(0, 10);

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementForm.jogoId || !movementForm.tipo || movementForm.quantidade < 1) return;

    // Ajuste conforme o DTO de movimentação do backend
    const movement: any = {
      jogoId: parseInt(movementForm.jogoId),
      tipo: movementForm.tipo,
      quantidade: movementForm.quantidade,
      observacao: movementForm.observacao,
      plataformaId: movementForm.plataformaId ? parseInt(movementForm.plataformaId) : undefined,
      depositoOrigemId: movementForm.tipo === 'TRANSFERENCIA' && movementForm.depositoOrigemId ? parseInt(movementForm.depositoOrigemId) : undefined,
      depositoDestinoId: movementForm.tipo === 'TRANSFERENCIA' && movementForm.depositoDestinoId ? parseInt(movementForm.depositoDestinoId) : undefined,
    };

    await addStockMovement(movement);
    setMovementForm({
      jogoId: '',
      tipo: 'ENTRADA',
      quantidade: 1,
      observacao: '',
      plataformaId: '',
      depositoOrigemId: '',
      depositoDestinoId: '',
    });
    setActiveTab('overview');
    fetchInventory();
  };

  const getMovementIcon = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'SAIDA': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'TRANSFERENCIA': return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getMovementTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return 'Entrada';
      case 'SAIDA': return 'Saída';
      case 'TRANSFERENCIA': return 'Transferência';
      default: return tipo;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Package },
    { id: 'movements', label: 'Itens Recentes no Estoque', icon: TrendingUp },
    ...(state.user?.role === 'admin' ? [{ id: 'add-movement', label: 'Adicionar Movimentação', icon: Plus }] : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Inventário</h2>
        <p className="text-gray-600">Acompanhe e gerencie seu inventário de jogos</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stock Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Package className="w-8 h-8 text-emerald-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-emerald-600">Total de Itens em Estoque</p>
                      <p className="text-2xl font-bold text-emerald-900">
                        {inventory.reduce((sum, item) => sum + item.quantidade, 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingDown className="w-8 h-8 text-amber-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-amber-600">Estoque Baixo</p>
                      <p className="text-2xl font-bold text-amber-900">{lowStockItems.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Valor Total</p>
                      <p className="text-2xl font-bold text-blue-900">
                        R$ {inventory.reduce((sum, item) => sum + (item.precoUnitarioAtual * item.quantidade), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Stock Alert */}
              {lowStockItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-amber-900 mb-3">Alerta de Estoque Baixo</h3>
                  <div className="space-y-2">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.jogoTitulo}</p>
                          <p className="text-sm text-gray-600">{item.plataformaNome}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-amber-600">
                            Atual: {item.quantidade}
                          </p>
                          <p className="text-xs text-gray-500">ID Estoque: {item.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Stock Levels */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Níveis de Estoque Atuais</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jogo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plataforma</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque Atual</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Unitário</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depósito</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventory.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded object-cover bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                                  {item.jogoTitulo.charAt(0)}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{item.jogoTitulo}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.plataformaNome}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${item.quantidade <= 2 ? 'text-amber-600' : 'text-gray-900'}`}>
                                {item.quantidade}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              R$ {item.precoUnitarioAtual.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.depositoNome}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Itens Recentes no Estoque</h3>
              <div className="space-y-4">
                {recentInventory.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Package className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.jogoTitulo}
                          </p>
                          <p className="text-sm text-gray-600">{item.plataformaNome}</p>
                          <p className="text-xs text-gray-500">
                            Depósito: {item.depositoNome}
                          </p>
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
                  </div>
                ))}
                {recentInventory.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum item recente no estoque</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'add-movement' && state.user?.role === 'admin' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Movimentação de Estoque</h3>
              <form onSubmit={handleAddMovement} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jogo</label>
                  <select
                    value={movementForm.jogoId}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, jogoId: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Selecione um jogo</option>
                    {games.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimentação</label>
                  <select
                    value={movementForm.tipo}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, tipo: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="ENTRADA">Entrada de Estoque</option>
                    <option value="SAIDA">Saída de Estoque</option>
                    <option value="TRANSFERENCIA">Transferência</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={movementForm.quantidade}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, quantidade: parseInt(e.target.value) }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observação</label>
                  <input
                    type="text"
                    value={movementForm.observacao}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, observacao: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="ex: Compra, Venda, Dano, etc."
                  />
                </div>

                {/* Se quiser capturar plataforma ou depósitos, adicione selects/inputs aqui */}
                {movementForm.tipo === 'TRANSFERENCIA' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Depósito de Origem</label>
                      <input
                        type="text"
                        value={movementForm.depositoOrigemId}
                        onChange={(e) => setMovementForm(prev => ({ ...prev, depositoOrigemId: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="ID do depósito de origem"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Depósito de Destino</label>
                      <input
                        type="text"
                        value={movementForm.depositoDestinoId}
                        onChange={(e) => setMovementForm(prev => ({ ...prev, depositoDestinoId: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="ID do depósito de destino"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Adicionar Movimentação
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;