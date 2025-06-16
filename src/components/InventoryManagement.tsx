import React, { useState, useEffect, useCallback } from 'react';
import { useGamesAndInventory, StockMovementRequestDTO, StockTransferRequestDTO } from '../hooks/useGamesAndInventory'; // Import the hook and DTOs
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

// Define the types matching your backend enum for better type safety
type BackendMovementType = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA_SAIDA' | 'TRANSFERENCIA_ENTRADA' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO';

const InventoryManagement: React.FC = () => {
  // Get both addStockMovement and transferStock from the hook
  const { games, inventory, platforms, deposits, addStockMovement, transferStock, loading, error, fetchInventory } = useGamesAndInventory();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'add-movement'>('overview');
  const [movementForm, setMovementForm] = useState({
    jogoId: '',
    tipo: 'ENTRADA' as BackendMovementType,
    quantidade: 1,
    observacao: '',
    plataformaId: '',
    depositoOrigemId: '', // Include origin and destination in form state
    depositoDestinoId: '', // Include origin and destination in form state
  });

  const lowStockItems = inventory.filter(item => item.quantidade <= 2);
  const recentInventory = [...inventory].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 10); // Added nullish coalescing for safety


  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validations
    if (!movementForm.jogoId || !movementForm.tipo || movementForm.quantidade < 1 || !movementForm.plataformaId) {
        alert('Por favor, preencha os campos obrigatórios: Jogo, Tipo, Quantidade e Plataforma.');
        return;
    }

    const jogoIdInt = parseInt(movementForm.jogoId);
    const plataformaIdInt = parseInt(movementForm.plataformaId);
    const quantidadeInt = parseInt(movementForm.quantidade as any);

    // Use undefined if the select value is an empty string
    const depositoOrigemIdInt = movementForm.depositoOrigemId ? parseInt(movementForm.depositoOrigemId) : undefined;
    const depositoDestinoIdInt = movementForm.depositoDestinoId ? parseInt(movementForm.depositoDestinoId) : undefined;


    try {
        // Logic for different movement types based on backend enum
        if (movementForm.tipo.startsWith('TRANSFERENCIA')) {
             // Handle transfer movement - CALL transferStock
            if (depositoOrigemIdInt === undefined || depositoDestinoIdInt === undefined) {
                alert('Para Transferências, o Depósito de Origem e o Depósito de Destino são obrigatórios.');
                return;
            }
             if (depositoOrigemIdInt === depositoDestinoIdInt) {
                alert('Para Transferências, o Depósito de Origem e o Depósito de Destino devem ser diferentes.');
                return;
            }


             const transferRequest: StockTransferRequestDTO = { // Use StockTransferRequestDTO
                 jogoId: jogoIdInt,
                 plataformaId: plataformaIdInt,
                 depositoOrigemId: depositoOrigemIdInt, // These are mandatory for transfers
                 depositoDestinoId: depositoDestinoIdInt, // These are mandatory for transfers
                 quantidade: quantidadeInt,
                 observacao: movementForm.observacao,
             };

             console.log('🚚 Registrando movimentação de TRANSFERENCIA:', transferRequest);
             await transferStock(transferRequest); // Call transferStock

             console.log('✅ Movimentação de TRANSFERENCIA registrada com sucesso!');

        } else { // ENTRADA, SAIDA, AJUSTE_POSITIVO, AJUSTE_NEGATIVO
            // Handle other movement types (ENTRADA, SAIDA, AJUSTE)
             if (movementForm.tipo === 'ENTRADA' && depositoDestinoIdInt === undefined) {
                 alert('Para Entradas, o Depósito de Destino é obrigatório.');
                 return;
             }
             if (movementForm.tipo === 'SAIDA' && depositoOrigemIdInt === undefined) {
                  alert('Para Saídas, o Depósito de Origem é obrigatório.');
                  return;
             }
             // Add validation for ADJUSTE types if they require specific deposits
             if (movementForm.tipo.startsWith('AJUSTE')) {
                  if (movementForm.tipo === 'AJUSTE_POSITIVO' && depositoDestinoIdInt === undefined) {
                      alert('Para Ajuste Positivo, o Depósito de Destino é obrigatório.');
                      return;
                  }
                  if (movementForm.tipo === 'AJUSTE_NEGATIVO' && depositoOrigemIdInt === undefined) {
                      alert('Para Ajuste Negativo, o Depósito de Origem é obrigatório.');
                      return;
                  }
             }

             const movementRequest: StockMovementRequestDTO = { // Use StockMovementRequestDTO
                 tipo: movementForm.tipo as StockMovementRequestDTO['tipo'], // Use the exact backend enum name
                 jogoId: jogoIdInt,
                 plataformaId: plataformaIdInt,
                 quantidade: quantidadeInt,
                 observacao: movementForm.observacao,
                 // Conditionally include deposit IDs based on movement type and if they are defined
                 ...(depositoOrigemIdInt !== undefined ? { depositoOrigemId: depositoOrigemIdInt } : {}),
                 ...(depositoDestinoIdInt !== undefined ? { depositoDestinoId: depositoDestinoIdInt } : {}),
                 // Add precoUnitarioMomento if your backend requires it for non-transfer movements
                 precoUnitarioMomento: undefined // Or get this value from another form input if needed
             };


            console.log('📋 Adicionando movimentação de ESTOQUE (ENTRADA/SAIDA/AJUSTE):', movementRequest);
            await addStockMovement(movementRequest); // Call addStockMovement

            console.log('✅ Movimentação de ESTOQUE (ENTRADA/SAIDA/AJUSTE) adicionada com sucesso!');
        }


       setMovementForm({
         jogoId: '',
         tipo: 'ENTRADA', // Reset to default
         quantidade: 1,
         observacao: '',
         plataformaId: '',
         depositoOrigemId: '',
         depositoDestinoId: '',
       });
       setActiveTab('overview');
       await fetchInventory(); // Refresh inventory after successful movement

    } catch (submitError: any) {
        console.error('❌ Erro ao adicionar movimentação no componente:', submitError);
        // Error handling from the hook will likely show an alert
    }
  };

  const getMovementIcon = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA':
      case 'AJUSTE_POSITIVO':
      case 'TRANSFERENCIA_ENTRADA':
         return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'SAIDA':
      case 'AJUSTE_NEGATIVO':
      case 'TRANSFERENCIA_SAIDA':
          return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

   const getMovementTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA': return 'Entrada de Estoque';
      case 'SAIDA': return 'Saída de Estoque';
      case 'TRANSFERENCIA_SAIDA': return 'Transferência (Saída)';
      case 'TRANSFERENCIA_ENTRADA': return 'Transferência (Entrada)';
      case 'AJUSTE_POSITIVO': return 'Ajuste Positivo';
      case 'AJUSTE_NEGATIVO': return 'Ajuste Negativo';
      default: return tipo;
    }
  };


  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Package },
    { id: 'movements', label: 'Itens Recentes', icon: TrendingUp },
    ...(isAdmin ? [{ id: 'add-movement', label: 'Adicionar', icon: Plus }] : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

   if (error) {
       return (
           <div className="text-center py-8 text-red-600 px-4">
               <p className="font-semibold">Ocorreu um erro ao carregar os dados:</p>
               <p className="text-sm">{error}</p>
           </div>
       );
   }


  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="px-4 md:px-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Gerenciamento de Inventário</h2>
        <p className="text-gray-600 text-sm md:text-base">Acompanhe e gerencie seu inventário de jogos</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border mx-4 md:mx-0">
        <div className="border-b">
          <nav className="flex space-x-4 md:space-x-8 px-4 md:px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 md:py-4 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 md:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 md:space-y-6">
              {/* Stock Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Package className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 flex-shrink-0" />
                    <div className="ml-3 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-emerald-600">Total de Itens</p>
                      <p className="text-lg md:text-2xl font-bold text-emerald-900">
                        {inventory.reduce((sum, item) => sum + item.quantidade, 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingDown className="w-6 h-6 md:w-8 md:h-8 text-amber-600 flex-shrink-0" />
                    <div className="ml-3 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-amber-600">Estoque Baixo</p>
                      <p className="text-lg md:text-2xl font-bold text-amber-900">{lowStockItems.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600 flex-shrink-0" />
                    <div className="ml-3 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-blue-600">Valor Total</p>
                      <p className="text-lg md:text-2xl font-bold text-blue-900">
                        R$ {inventory.reduce((sum, item) => sum + (item.precoUnitarioAtual * item.quantidade), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Stock Alert */}
              {lowStockItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="text-base md:text-lg font-semibold text-amber-900 mb-3">Alerta de Estoque Baixo</h3>
                  <div className="space-y-2">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm md:text-base truncate">{item.jogoTitulo}</p>
                          <p className="text-xs md:text-sm text-gray-600 truncate">{item.plataformaNome}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-xs md:text-sm font-medium text-amber-600">
                            Atual: {item.quantidade}
                          </p>
                          <p className="text-xs text-gray-500">ID: {item.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Stock Levels - Mobile Optimized */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Níveis de Estoque Atuais</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-2 p-2">
                    {inventory.map((item) => (
                      <div key={item.id} className="bg-white rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs flex-shrink-0">
                               {item.jogoTitulo ? item.jogoTitulo.charAt(0) : '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.jogoTitulo || 'N/A'}</p>
                              <p className="text-xs text-gray-600 truncate">{item.plataformaNome || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={`text-sm font-medium ${item.quantidade <= 2 ? 'text-amber-600' : 'text-gray-900'}`}>
                              {item.quantidade}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>R$ {item.precoUnitarioAtual?.toFixed(2) || 'N/A'}</span>
                          <span>{item.depositoNome || 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
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
                                   {item.jogoTitulo ? item.jogoTitulo.charAt(0) : '?'}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{item.jogoTitulo || 'N/A'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.plataformaNome || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${item.quantidade <= 2 ? 'text-amber-600' : 'text-gray-900'}`}>
                                {item.quantidade}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              R$ {item.precoUnitarioAtual?.toFixed(2) || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.depositoNome || 'N/A'}</td>
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
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Itens Recentes no Estoque</h3>
              <div className="space-y-3 md:space-y-4">
                {recentInventory.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 md:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                         <Package className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm md:text-base truncate">
                            {item.jogoTitulo || 'N/A'}
                          </p>
                          <p className="text-xs md:text-sm text-gray-600 truncate">{item.plataformaNome || 'N/A'}</p>
                          <p className="text-xs text-gray-500 truncate">
                            Depósito: {item.depositoNome || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-xs md:text-sm font-medium">
                          Qtd: {item.quantidade}
                        </p>
                        <p className="text-xs text-gray-500">
                          R$ {item.precoUnitarioAtual?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {recentInventory.length === 0 && (
                  <div className="text-center py-6 md:py-8">
                    <Package className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm md:text-base">Nenhum item recente no estoque</p>
                  </div>
                )}
              </div>
            </div>
          )}

           {activeTab === 'add-movement' && isAdmin && (
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Adicionar Movimentação de Estoque</h3>
              <form onSubmit={handleAddMovement} className="space-y-4 max-w-md mx-auto md:mx-0">
                <div>
                  <label htmlFor="jogoId" className="block text-sm font-medium text-gray-700 mb-2">Jogo</label>
                  <select
                    id="jogoId"
                    value={movementForm.jogoId}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, jogoId: e.target.value }))}
                    required
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="">Selecione um jogo</option>
                    {games && games.length > 0 && games.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="plataformaId" className="block text-sm font-medium text-gray-700 mb-2">Plataforma</label>
                   <select
                    id="plataformaId"
                    value={movementForm.plataformaId}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, plataformaId: e.target.value }))}
                    required
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="">Selecione uma plataforma</option>
                     {platforms && platforms.length > 0 && platforms.map((plataforma) => (
                         <option key={plataforma.id} value={plataforma.id}>
                            {plataforma.nome}
                         </option>
                     ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimentação</label>
                  <select
                    id="tipo"
                    value={movementForm.tipo}
                    onChange={(e) => setMovementForm(prev => ({
                         ...prev,
                         tipo: e.target.value as BackendMovementType,
                         depositoOrigemId: '', // Reset deposits when type changes
                         depositoDestinoId: '' // Reset deposits when type changes
                    }))}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="ENTRADA">Entrada de Estoque</option>
                    <option value="SAIDA">Saída de Estoque</option>
                    <option value="TRANSFERENCIA_SAIDA">Transferência (Saída)</option>
                    <option value="TRANSFERENCIA_ENTRADA">Transferência (Entrada)</option>
                    <option value="AJUSTE_POSITIVO">Ajuste Positivo</option>
                    <option value="AJUSTE_NEGATIVO">Ajuste Negativo</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
                  <input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={movementForm.quantidade}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, quantidade: parseInt(e.target.value) }))}
                    required
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                 {/* Campos de Depósito Condicionais */}
                 {/* Exibe Depósito de Origem para SAIDA, AJUSTE_NEGATIVO e QUALQUER TIPO DE TRANSFERENCIA */}
                 {(movementForm.tipo === 'SAIDA' || movementForm.tipo === 'AJUSTE_NEGATIVO' || movementForm.tipo.startsWith('TRANSFERENCIA')) && (
                    <div>
                       <label htmlFor="depositoOrigemId" className="block text-sm font-medium text-gray-700 mb-2">Depósito de Origem</label>
                       <select
                         id="depositoOrigemId"
                         value={movementForm.depositoOrigemId}
                         onChange={(e) => setMovementForm(prev => ({ ...prev, depositoOrigemId: e.target.value }))}
                         required={movementForm.tipo === 'SAIDA' || movementForm.tipo === 'AJUSTE_NEGATIVO' || movementForm.tipo.startsWith('TRANSFERENCIA')} // Required for these types
                         className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                       >
                         <option value="">Selecione o depósito de origem</option>
                         {deposits && deposits.length > 0 && deposits.map((deposito) => (
                            <option key={deposito.id} value={deposito.id}>
                               {deposito.nome}
                            </option>
                         ))}
                       </select>
                    </div>
                 )}

                {/* Exibe Depósito de Destino para ENTRADA, AJUSTE_POSITIVO e QUALQUER TIPO DE TRANSFERENCIA */}
                {(movementForm.tipo === 'ENTRADA' || movementForm.tipo === 'AJUSTE_POSITIVO' || movementForm.tipo.startsWith('TRANSFERENCIA')) && (
                    <div>
                       <label htmlFor="depositoDestinoId" className="block text-sm font-medium text-gray-700 mb-2">Depósito de Destino</label>
                       <select
                         id="depositoDestinoId"
                         value={movementForm.depositoDestinoId}
                         onChange={(e) => setMovementForm(prev => ({ ...prev, depositoDestinoId: e.target.value }))}
                         required={movementForm.tipo === 'ENTRADA' || movementForm.tipo === 'AJUSTE_POSITIVO' || movementForm.tipo.startsWith('TRANSFERENCIA')} // Required for these types
                         className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                       >
                         <option value="">Selecione o depósito de destino</option>
                         {deposits && deposits.length > 0 && deposits.map((deposito) => (
                            <option key={deposito.id} value={deposito.id}>
                               {deposito.nome}
                            </option>
                         ))}
                       </select>
                    </div>
                 )}

                 {/* Campo de Observação (sempre visível) */}
                <div>
                  <label htmlFor="observacao" className="block text-sm font-medium text-gray-700 mb-2">Observação</label>
                  <input
                    id="observacao"
                    type="text"
                    value={movementForm.observacao}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, observacao: e.target.value }))}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                    placeholder="ex: Compra, Venda, Dano, etc."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base"
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