import { useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { Game, InventoryItem } from '../types';

interface Plataforma {
  id: number;
  nome: string;
}

interface Deposito {
  id: number;
  nome: string;
  localizacao: string;
}

// Define the interface for the stock movement request body (non-transfer)
interface StockMovementRequestDTO {
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO';
  jogoId: number;
  plataformaId: number;
  depositoOrigemId?: number; // Optional for non-transfer movements
  depositoDestinoId?: number; // Optional for non-transfer movements
  quantidade: number;
  precoUnitarioMomento?: number; // Optional for non-transfer movements (depending on backend)
  observacao?: string;
}

// Define the interface for the stock transfer request body
interface StockTransferRequestDTO {
    // Note: As per your Postman example, the 'tipo' field is NOT sent
    // in the transfer request body to the /estoque/transferir endpoint.
    // This interface reflects the expected body for the transfer endpoint.
    jogoId: number;
    plataformaId: number;
    depositoOrigemId: number; // Transfers require both origin and destination
    depositoDestinoId: number;
    quantidade: number;
    observacao?: string;
}


export const useGamesAndInventory = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setError(null);
      console.log('🎮 Buscando jogos do backend...');
      const res = await api.get<Game[]>('/jogos');
      setGames(res.data);
      console.log(`✅ ${res.data.length} jogos carregados com sucesso!`);
       return res.data;
    } catch (err: any) {
      console.error('❌ Erro ao buscar jogos:', err);
      setError('Erro ao carregar jogos do backend Azure.');

      const mockGames: Game[] = [
        {
          id: 101,
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
       return mockGames;
    }
  }, []);

   const fetchPlataformas = useCallback(async () => {
     try {
       setError(null);
       console.log('🕹️ Buscando plataformas do backend...');
       const res = await api.get<Plataforma[]>('/plataformas');
       setPlataformas(res.data);
       console.log(`✅ ${res.data.length} plataformas carregadas com sucesso!`);
        return res.data;
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
        return mockPlataformas;
     }
   }, []);

    const fetchDepositos = useCallback(async () => {
      try {
        setError(null);
        console.log('🏦 Buscando depósitos do backend...');
        const res = await api.get<Deposito[]>('/depositos');
        setDepositos(res.data);
        console.log(`✅ ${res.data.length} depósitos carregados com sucesso!`);
         return res.data;
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
         return mockDepositos;
      }
    }, []);


  const fetchInventory = useCallback(async () => {
    try {
      setError(null);
      console.log('📦 Buscando estoque do backend...');
      const res = await api.get<InventoryItem[]>('/estoque/consultar');
      setInventory(res.data);
      console.log(`✅ ${res.data.length} itens de estoque carregados!`);
       return res.data;
    } catch (err: any) {
      console.error('❌ Erro ao buscar estoque:', err);
      setError('Erro ao carregar estoque do backend Azure.');

      const mockInventory: InventoryItem[] = [
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
           plataformaId: 4,
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
            plataformaId: 1,
            plataformaNome: 'Playstation',
            depositoId: 3,
            depositoNome: 'Galpão Industrial',
            quantidade: 10,
            precoUnitarioAtual: 79.00,
          },
      ];
      setInventory(mockInventory);
      console.log('📦 Usando dados de estoque mock temporariamente');
       return mockInventory;
    }
  }, []);

  const addGame = async (game: Omit<Game, 'id'>) => {
    try {
      console.log('➕ Adicionando novo jogo:', game.titulo);
      const res = await api.post<Game>('/jogos', game);
      setGames(prev => [...prev, res.data]);
      console.log('✅ Jogo adicionado com sucesso!');
      return res.data;
    } catch (err: any) {
      console.error('❌ Erro ao adicionar jogo:', err);
      setError('Erro ao adicionar jogo no backend Azure.');
      throw new Error('Erro ao adicionar jogo.');
    }
  };

  const updateGame = async (id: number, updates: Partial<Game>) => {
    try {
      console.log('✏️ Atualizando jogo ID:', id);
      const res = await api.put<Game>(`/jogos/${id}`, updates);
      setGames(prev => prev.map(g => g.id === id ? res.data : g));
      console.log('✅ Jogo atualizado com sucesso!');
      return res.data;
    } catch (err: any) {
      console.error('❌ Erro ao atualizar jogo:', err);
      setError('Erro ao atualizar jogo no backend Azure.');
      throw new Error('Erro ao atualizar jogo.');
    }
  };

  const deleteGame = async (id: number) => {
    try {
      console.log('🗑️ Removendo jogo ID:', id);
      await api.delete(`/jogos/${id}`);
      setGames(prev => prev.filter(g => g.id !== id));
      console.log('✅ Jogo removido com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao deletar jogo:', err);
      setError('Erro ao deletar jogo no backend Azure.');
      throw new Error('Erro ao deletar jogo.');
    }
  };

  // Function to handle non-transfer stock movements (entrada, saida, ajuste)
  const addStockMovement = async (movement: StockMovementRequestDTO) => {
    try {
      console.log('📋 Adicionando movimentação de estoque (não-transferência):', movement);
      // Using the general endpoint for non-transfer movements
      const res = await api.post('/estoque/movimentar', movement);
      console.log('✅ Movimentação adicionada com sucesso!');

      await fetchInventory(); // Refresh inventory after movement
      return res.data;
    } catch (err: any) {
      console.error('❌ Erro ao adicionar movimentação:', err);
       const errorMessage = err.response?.data?.message || 'Erro ao adicionar movimentação de estoque.';
       setError(errorMessage);
       alert(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // New function to handle stock transfers
  const transferStock = async (transfer: StockTransferRequestDTO) => {
      try {
          console.log('🚚 Registrando transferência de estoque:', transfer);
          // Using the dedicated endpoint for transfers as confirmed by Postman example
          // Replace '/estoque/transferir' with the actual endpoint if different in your backend
          const res = await api.post('/estoque/transferir', transfer);
          console.log('✅ Transferência registrada com sucesso!');

          await fetchInventory(); // Refresh inventory after transfer
          return res.data;
      } catch (err: any) {
          console.error('❌ Erro ao registrar transferência:', err);
          const errorMessage = err.response?.data?.message || 'Erro ao registrar transferência de estoque.';
          setError(errorMessage);
          alert(errorMessage);
          throw new Error(errorMessage);
      }
  };


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      console.log('🚀 Carregando dados iniciais (jogos, inventário, plataformas, depósitos)...');

      try {
         await Promise.all([fetchGames(), fetchInventory(), fetchPlataformas(), fetchDepositos()]);
         console.log('✅ Todos os dados iniciais carregados!');
      } catch (loadError) {
         console.error('❌ Erro durante o carregamento inicial:', loadError);
      } finally {
         setLoading(false);
      }
    };

    loadData();
  }, [fetchGames, fetchInventory, fetchPlataformas, fetchDepositos]);

  return {
    games,
    inventory,
    platforms: plataformas,
    deposits: depositos,
    loading,
    error,
    fetchGames,
    fetchInventory,
    addGame,
    updateGame,
    deleteGame,
    addStockMovement,
    transferStock, // Make the new transfer function available
  };
};
