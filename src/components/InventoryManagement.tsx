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
  const { games, inventory, plataformas, depositos, addStockMovement, loading, error, fetchInventory } = useGamesAndInventory();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'add-movement'>('overview');
  const [movementForm, setMovementForm] = useState({
    jogoId: '',
    tipo: 'ENTRADA' as 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA', // Tipos de movimentação do frontend
    quantidade: 1,
    observacao: '',
    plataformaId: '',
    depositoOrigemId: '',
    depositoDestinoId: '',
  });

  const lowStockItems = inventory.filter(item => item.quantidade <= 2);

  const recentInventory = [...inventory].sort((a, b) => b.id - a.id).slice(0, 10);

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validações básicas dos campos comuns a todas as movimentações
    if (!movementForm.jogoId || !movementForm.tipo || movementForm.quantidade < 1 || !movementForm.plataformaId) {
        alert('Por favor, preencha os campos obrigatórios: Jogo, Tipo, Quantidade e Plataforma.');
        return;
    }

    // Converte IDs e quantidade para números inteiros
    const jogoIdInt = parseInt(movementForm.jogoId);
    const plataformaIdInt = parseInt(movementForm.plataformaId);
    const quantidadeInt = parseInt(movementForm.quantidade as any);

    // Converte IDs de depósito para números inteiros ou undefined
    const depositoOrigemIdInt = movementForm.depositoOrigemId ? parseInt(movementForm.depositoOrigemId) : undefined;
    const depositoDestinoIdInt = movementForm.depositoDestinoId ? parseInt(movementForm.depositoDestinoId) : undefined;

    try {
        if (movementForm.tipo === 'TRANSFERENCIA') {
            // Lógica específica para Transferência (chama endpoint /transferir)
            if (!depositoOrigemIdInt || !depositoDestinoIdInt) {
                alert('Para Transferências, o Depósito de Origem e o Depósito de Destino são obrigatórios.');
                return;
            }

             // Prepara o objeto para o endpoint /estoque/transferir
             // Adapte os nomes dos campos abaixo para corresponderem EXATAMENTE
             // ao DTO que o seu endpoint /estoque/transferir espera.
             const transferRequest = {
                 jogoId: jogoIdInt,
                 plataformaId: plataformaIdInt,
                 depositoOrigemId: depositoOrigemIdInt,
                 depositoDestinoId: depositoDestinoIdInt,
                 quantidade: quantidadeInt,
                 observacao: movementForm.observacao, // Se o endpoint de transferência aceitar observação
             };

            console.log('📋 Adicionando movimentação de TRANSFERENCIA:', transferRequest);
            // Chame o endpoint de transferência
            // Assumindo que addStockMovement no hook lida com a chamada api.post e tratamento base
             await addStockMovement(transferRequest, 'TRANSFERENCIA'); // Passa o tipo para o hook se ele precisar diferenciar endpoints

            console.log('✅ Movimentação de TRANSFERENCIA adicionada com sucesso!');

        } else {
            // Lógica para Entrada ou Saída (chama endpoint /movimentar)

            // Validação específica para Entrada/Saída
             if (movementForm.tipo === 'ENTRADA' && !depositoDestinoIdInt) {
                 alert('Para Entradas, o Depósito de Destino é obrigatório.');
                 return;
             }
             if (movementForm.tipo === 'SAIDA' && !depositoOrigemIdInt) {
                  alert('Para Saídas, o Depósito de Origem é obrigatório.');
                  return;
             }

             // Prepara o objeto para o endpoint /estoque/movimentar
             // Adapte os nomes dos campos abaixo para corresponderem EXATAMENTE
             // ao DTO que o seu endpoint /estoque/movimentar espera.
             const movementRequest = {
                 // Adapte o nome do campo 'tipo' se for diferente no backend (ex: 'tipoMovimentacao')
                 tipo: movementForm.tipo, // ENTRADA ou SAIDA - Estes nomes parecem corresponder aos seus enums de backend
                 jogoId: jogoIdInt,
                 plataformaId: plataformaIdInt,
                 quantidade: quantidadeInt,
                 observacao: movementForm.observacao,
                 // Inclua depósito de origem ou destino apenas se aplicável
                 ...(movementForm.tipo === 'SAIDA' && { depositoOrigemId: depositoOrigemIdInt }),
                 ...(movementForm.tipo === 'ENTRADA' && { depositoDestinoId: depositoDestinoIdInt }),
             };

            console.log('📋 Adicionando movimentação de ESTOQUE (ENTRADA/SAIDA):', movementRequest);
            // Chame o endpoint de movimentar
             await addStockMovement(movementRequest, 'ENTRADA_SAIDA'); // Passa um indicador para o hook

            console.log('✅ Movimentação de ESTOQUE (ENTRADA/SAIDA) adicionada com sucesso!');
        }

       // Limpa o formulário e volta para a visão geral após sucesso
       setMovementForm({
         jogoId: '',
         tipo: 'ENTRADA',
         quantidade: 1,
         observacao: '',
         plataformaId: '',
         depositoOrigemId: '',
         depositoDestinoId: '',
       });
       setActiveTab('overview'); // Volta para a aba de visão geral

       // Recarrega o estoque após a movimentação (importante para ver o resultado)
       await fetchInventory();

    } catch (submitError: any) { // Capture o erro para exibir a mensagem do backend
        console.error('❌ Erro ao adicionar movimentação no componente:', submitError);
        // O hook useGamesAndInventory já trata o erro e exibe um alerta/define o estado de erro.
        // Você pode adicionar lógica extra aqui se precisar.
        // const errorMessage = submitError.response?.data?.message || 'Erro ao adicionar movimentação de estoque.';
        // setError(errorMessage); // Define o estado de erro para exibir no frontend (se não for tratado no hook)
    }
  };


  // CORREÇÃO: Certificar que a lista de jogos, plataformas e depósitos está carregada antes de renderizar o formulário
  // Isso é tratado pelo estado `loading` do hook `useGamesAndInventory`.

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

  // Inclui condicionalmente a aba 'add-movement' se o usuário for admin
  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Package },
    // Você pode adicionar uma aba para "Histórico de Movimentações" aqui, se tiver um endpoint para isso
    // { id: 'history', label: 'Histórico de Movimentações', icon: Calendar },
    { id: 'movements', label: 'Itens Recentes no Estoque', icon: TrendingUp }, // Mantido esta aba para mostrar itens recentes
    ...(isAdmin ? [{ id: 'add-movement', label: 'Adicionar Movimentação', icon: Plus }] : []),
  ];

  // Exibe loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

   // Exibe erro se houver
   if (error) {
       return (
           <div className="text-center py-8 text-red-600">
               <p className="font-semibold">Ocorreu um erro ao carregar os dados:</p>
               <p>{error}</p>
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
                                   {/* CORREÇÃO AQUI: Verificar se item.jogoTitulo existe antes de chamar charAt(0) */}
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
                              R$ {item.precoUnitarioAtual?.toFixed(2) || 'N/A'} {/* Adicionado verificação opcional */}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Itens Recentes no Estoque</h3>
              <div className="space-y-4">
                {recentInventory.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Package className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.jogoTitulo || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">{item.plataformaNome || 'N/A'}</p>
                          <p className="text-xs text-gray-500">
                            Depósito: {item.depositoNome || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
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
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum item recente no estoque</p>
                  </div>
                )}
              </div>
            </div>
          )}

           {/* Renderiza o conteúdo da aba "Adicionar Movimentação" apenas se o usuário for ADMIN */}
          {activeTab === 'add-movement' && isAdmin && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Movimentação de Estoque</h3>
              <form onSubmit={handleAddMovement} className="space-y-4 max-w-md">
                <div>
                  <label htmlFor="jogoId" className="block text-sm font-medium text-gray-700 mb-2">Jogo</label>
                  <select
                    id="jogoId"
                    value={movementForm.jogoId}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, jogoId: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Selecione um jogo</option>
                    {/* Mapeia a lista de jogos carregada pelo hook */}
                    {games.map((game) => (
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma plataforma</option>
                     {/* Mapeia a lista de plataformas carregada pelo hook */}
                     {plataformas.map((plataforma) => (
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
                    // Ao mudar o tipo, limpa os campos de depósito para evitar erros
                    onChange={(e) => setMovementForm(prev => ({
                         ...prev,
                         tipo: e.target.value as any,
                         depositoOrigemId: '', // Limpa origem
                         depositoDestinoId: '' // Limpa destino
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {/* Ajustado os valores para corresponderem aos nomes dos tipos no frontend */}
                    <option value="ENTRADA">Entrada de Estoque</option>
                    <option value="SAIDA">Saída de Estoque</option>
                    <option value="TRANSFERENCIA">Transferência</option>
                    {/* Se tiver AJUSTE_POSITIVO e AJUSTE_NEGATIVO e quiser exibir: */}
                    {/* <option value="AJUSTE_POSITIVO">Ajuste Positivo</option> */}
                    {/* <option value="AJUSTE_NEGATIVO">Ajuste Negativo</option> */}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                 {/* Campos de Depósito Condicionais */}
                 {/* Exibe Depósito de Origem para SAIDA e TRANSFERENCIA */}
                 {(movementForm.tipo === 'SAIDA' || movementForm.tipo === 'TRANSFERENCIA') && (
                    <div>
                       <label htmlFor="depositoOrigemId" className="block text-sm font-medium text-gray-700 mb-2">Depósito de Origem</label>
                       <select
                         id="depositoOrigemId"
                         value={movementForm.depositoOrigemId}
                         onChange={(e) => setMovementForm(prev => ({ ...prev, depositoOrigemId: e.target.value }))}
                         required={movementForm.tipo !== 'ENTRADA'} // Obrigatório para SAIDA e TRANSFERENCIA
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                       >
                         <option value="">Selecione o depósito de origem</option>
                         {/* Mapeia a lista de depósitos carregada pelo hook */}
                         {depositos.map((deposito) => (
                            <option key={deposito.id} value={deposito.id}>
                               {deposito.nome}
                            </option>
                         ))}
                       </select>
                    </div>
                 )}

                {/* Exibe Depósito de Destino para ENTRADA e TRANSFERENCIA */}
                {(movementForm.tipo === 'ENTRADA' || movementForm.tipo === 'TRANSFERENCIA') && (
                    <div>
                       <label htmlFor="depositoDestinoId" className="block text-sm font-medium text-gray-700 mb-2">Depósito de Destino</label>
                       <select
                         id="depositoDestinoId"
                         value={movementForm.depositoDestinoId}
                         onChange={(e) => setMovementForm(prev => ({ ...prev, depositoDestinoId: e.target.value }))}
                         required={movementForm.tipo !== 'SAIDA'} // Obrigatório para ENTRADA e TRANSFERENCIA
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                       >
                         <option value="">Selecione o depósito de destino</option>
                         {/* Mapeia a lista de depósitos carregada pelo hook */}
                         {depositos.map((deposito) => (
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="ex: Compra, Venda, Dano, etc."
                  />
                </div>


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
