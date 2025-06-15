import { useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { Game, InventoryItem } from '../types'; // Remova StockMovement da importação se não for necessário aqui

// Defina interfaces para Plataforma e Deposito se ainda não tiver em types.ts
// Se já tiver, remova essas definições daqui.
interface Plataforma {
  id: number;
  nome: string;
}

interface Deposito {
  id: number;
  nome: string;
  localizacao: string;
}


export const useGamesAndInventory = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [plataformas, setPlataformas] = useState<Plataforma[]>([]); // Estado para plataformas
  const [depositos, setDepositos] = useState<Deposito[]>([]); // Estado para depósitos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca todos os jogos
  const fetchGames = useCallback(async () => {
    try {
      setError(null);
      console.log('🎮 Buscando jogos do backend...');
      const res = await api.get<Game[]>('/jogos'); // Ajuste o endpoint se necessário (adicionado /api)
      setGames(res.data);
      console.log(`✅ ${res.data.length} jogos carregados com sucesso!`);
       return res.data; // Retorna os dados para Promise.all
    } catch (err: any) {
      console.error('❌ Erro ao buscar jogos:', err);
      setError('Erro ao carregar jogos do backend Azure.');

      // Fallback para dados mock se o backend não estiver disponível
      const mockGames: Game[] = [
        {
          id: 101, // Use IDs que correspondem aos seus inserts de exemplo
          titulo: 'Cyberpunk 2077',
          descricao: 'RPG futurista',
          precoSugerido: 199.90,
          genero: 'RPG',
          desenvolvedora: 'CD Projekt Red',
          publicadora: 'CD Projekt',
          urlImagemCapa: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1-gmhsFfcB7D67v_OPJn1eJrADiFpUvb4AQ&s',
        },
        {
          id: 102,
          titulo: 'Grand Theft Auto V',
          descricao: 'Jogo de ação e aventura',
          precoSugerido: 99.50,
          genero: 'Ação',
          desenvolvedora: 'Rockstar North',
          publicadora: 'Rockstar Games',
          urlImagemCapa: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRindW-i-8iZiKdoHFHBhyJV79ostmUCKMXRw&s',
        },
        {
          id: 103,
          titulo: 'The Witcher 3: Wild Hunt',
          descricao: 'RPG de fantasia',
          precoSugerido: 79.00,
          genero: 'RPG',
          desenvolvedora: 'CD Projekt Red',
          publicadora: 'CD Projekt',
          urlImagemCapa: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRindW-i-8iZiKdoHFHBhyJV79ostmUCKMXRw&s',
        },
        {
          id: 105,
          titulo: 'Cyberpunk 2078',
          descricao: '21',
          precoSugerido: 55.00,
          genero: 'RPG',
          desenvolvedora: 'CD Projekt Red',
          publicadora: 'sony',
          urlImagemCapa: 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=300',
        },
      ];
      setGames(mockGames);
      console.log('📦 Usando dados mock de jogos temporariamente');
       return mockGames; // Retorna os dados mock para Promise.all
    }
  }, []);

   // Busca as plataformas
   const fetchPlataformas = useCallback(async () => {
     try {
       setError(null);
       console.log('🕹️ Buscando plataformas do backend...');
       const res = await api.get<Plataforma[]>('/plataformas'); // Ajuste o endpoint se necessário
       setPlataformas(res.data);
       console.log(`✅ ${res.data.length} plataformas carregadas com sucesso!`);
        return res.data; // Retorna os dados para Promise.all
     } catch (err: any) {
       console.error('❌ Erro ao buscar plataformas:', err);
       setError('Erro ao carregar plataformas do backend Azure.');
        const mockPlataformas: Plataforma[] = [
          { id: 3, nome: 'Nintendo Switch' },
          { id: 4, nome: 'PC' },
          { id: 1, nome: 'Playstation' },
          { id: 2, nome: 'Xbox' },
        ];
       setPlataformas(mockPlataformas);
       console.log('📦 Usando dados mock de plataformas temporariamente');
        return mockPlataformas; // Retorna os dados mock para Promise.all
     }
   }, []);

    // Busca os depósitos
    const fetchDepositos = useCallback(async () => {
      try {
        setError(null);
        console.log('🏦 Buscando depósitos do backend...');
        const res = await api.get<Deposito[]>('/depositos'); // Ajuste o endpoint se necessário
        setDepositos(res.data);
        console.log(`✅ ${res.data.length} depósitos carregados com sucesso!`);
         return res.data; // Retorna os dados para Promise.all
      } catch (err: any) {
        console.error('❌ Erro ao buscar depósitos:', err);
        setError('Erro ao carregar depósitos do backend Azure.');
         const mockDepositos: Deposito[] = [
            { id: 1, nome: 'Depósito Central', localizacao: 'Rua Principal, 123' },
            { id: 2, nome: 'Filial Zona Norte', localizacao: 'Avenida Secundária, 456' },
            { id: 3, nome: 'Galpão Industrial', localizacao: 'Distrito Industrial, 789' },
         ];
        setDepositos(mockDepositos);
        console.log('📦 Usando dados mock de depósitos temporariamente');
         return mockDepositos; // Retorna os dados mock para Promise.all
      }
    }, []);


  // Busca o estoque
  const fetchInventory = useCallback(async () => {
    try {
      setError(null);
      console.log('📦 Buscando estoque do backend...');
      // Endpoint correto para buscar estoque geral ou por filtro, se existir
      const res = await api.get<InventoryItem[]>('/estoque/consultar'); // Ajuste o endpoint se necessário (adicionado /api e /consultar)
      setInventory(res.data);
      console.log(`✅ ${res.data.length} itens de estoque carregados!`);
       return res.data; // Retorna os dados para Promise.all
    } catch (err: any) {
      console.error('❌ Erro ao buscar estoque:', err);
      setError('Erro ao carregar estoque do backend Azure.');

      // Fallback para dados mock
      const mockInventory: InventoryItem[] = [
         // Ajuste os IDs de jogo, plataforma e depósito para corresponderem aos seus mocks
         {
           id: 1,
           jogoId: 101,
           jogoTitulo: 'Cyberpunk 2077',
           plataformaId: 3,
           plataformaNome: 'Nintendo Switch',
           depositoId: 1,
           depositoNome: 'Depósito Central',
           quantidade: 5,
           precoUnitarioAtual: 199.90,
         },
         {
           id: 2,
           jogoId: 102,
           jogoTitulo: 'Grand Theft Auto V',
           plataformaId: 4, // Exemplo: GTA V no PC
           plataformaNome: 'PC',
           depositoId: 2,
           depositoNome: 'Filial Zona Norte',
           quantidade: 3,
           precoUnitarioAtual: 99.50,
         },
          {
            id: 3,
            jogoId: 103,
            jogoTitulo: 'The Witcher 3: Wild Hunt',
            plataformaId: 1, // Exemplo: The Witcher 3 no Playstation
            plataformaNome: 'Playstation',
            depositoId: 3,
            depositoNome: 'Galpão Industrial',
            quantidade: 10,
            precoUnitarioAtual: 79.00,
          },
      ];
      setInventory(mockInventory);
      console.log('📦 Usando dados de estoque mock temporariamente');
       return mockInventory; // Retorna os dados mock para Promise.all
    }
  }, []);

  // Adiciona um novo jogo (manter existente)
  const addGame = async (game: Omit<Game, 'id'>) => {
    try {
      console.log('➕ Adicionando novo jogo:', game.titulo);
      const res = await api.post<Game>('/jogos', game); // Ajuste o endpoint
      setGames(prev => [...prev, res.data]);
      console.log('✅ Jogo adicionado com sucesso!');
      return res.data;
    } catch (err: any) {
      console.error('❌ Erro ao adicionar jogo:', err);
      setError('Erro ao adicionar jogo no backend Azure.');
      throw new Error('Erro ao adicionar jogo.');
    }
  };

  // Edita um jogo existente (manter existente)
  const updateGame = async (id: number, updates: Partial<Game>) => {
    try {
      console.log('✏️ Atualizando jogo ID:', id);
      const res = await api.put<Game>(`/jogos/${id}`, updates); // Ajuste o endpoint
      setGames(prev => prev.map(g => g.id === id ? res.data : g));
      console.log('✅ Jogo atualizado com sucesso!');
      return res.data;
    } catch (err: any) {
      console.error('❌ Erro ao atualizar jogo:', err);
      setError('Erro ao atualizar jogo no backend Azure.');
      throw new Error('Erro ao atualizar jogo.');
    }
  };

  // Remove um jogo (manter existente)
  const deleteGame = async (id: number) => {
    try {
      console.log('🗑️ Removendo jogo ID:', id);
      await api.delete(`/jogos/${id}`); // Ajuste o endpoint
      setGames(prev => prev.filter(g => g.id !== id));
      console.log('✅ Jogo removido com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao deletar jogo:', err);
      setError('Erro ao deletar jogo no backend Azure.');
      throw new Error('Erro ao deletar jogo.');
    }
  };

  // Adiciona uma movimentação de estoque (manter existente, ajuste de endpoint)
  const addStockMovement = async (movement: any) => { // Use `any` temporariamente ou crie uma interface para StockMovementRequestDTO
    try {
      console.log('📋 Adicionando movimentação de estoque:', movement);
      const res = await api.post('/estoque/movimentar', movement); // Ajuste o endpoint
      console.log('✅ Movimentação adicionada com sucesso!');

      // Recarrega o estoque após a movimentação
      await fetchInventory();
      return res.data;
    } catch (err: any) {
      console.error('❌ Erro ao adicionar movimentação:', err);
       // Melhorar o tratamento de erro para exibir a mensagem do backend
       const errorMessage = err.response?.data?.message || 'Erro ao adicionar movimentação de estoque.';
       setError(errorMessage);
       alert(errorMessage); // Exibe um alerta simples com a mensagem de erro
      throw new Error(errorMessage);
    }
  };

  // Carrega dados iniciais: jogos, inventário, plataformas e depósitos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null); // Limpa erros anteriores ao carregar
      console.log('🚀 Carregando dados iniciais (jogos, inventário, plataformas, depósitos)...');

      try {
         await Promise.all([fetchGames(), fetchInventory(), fetchPlataformas(), fetchDepositos()]);
         console.log('✅ Todos os dados iniciais carregados!');
      } catch (loadError) {
         console.error('❌ Erro durante o carregamento inicial:', loadError);
         // O tratamento de erro individual dos fetches já define o erro, mas podemos adicionar um log geral
      } finally {
         setLoading(false);
      }
    };

    loadData();
  }, [fetchGames, fetchInventory, fetchPlataformas, fetchDepositos]); // Adicione as funções de fetch como dependências

  return {
    games,
    inventory,
    plataformas, // Retorne plataformas
    depositos, // Retorne depósitos
    loading,
    error,
    fetchGames,
    fetchInventory,
    addGame,
    updateGame,
    deleteGame,
    addStockMovement,
  };
};
