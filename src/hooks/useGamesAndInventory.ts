import { useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { Game, InventoryItem, StockMovement } from '../types';

export const useGamesAndInventory = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Busca todos os jogos
  const fetchGames = useCallback(async () => {
    try {
      setError(null);
      console.log('🎮 Buscando jogos do backend...');
      const res = await api.get<Game[]>('/jogos');
      setGames(res.data);
      console.log(`✅ ${res.data.length} jogos carregados com sucesso!`);
    } catch (err: any) {
      console.error('❌ Erro ao buscar jogos:', err);
      setError('Erro ao carregar jogos do backend Azure.');
      
      // Fallback para dados mock se o backend não estiver disponível
      const mockGames: Game[] = [
        {
          id: 1,
          titulo: 'The Last of Us Part II',
          descricao: 'Jogo de ação e aventura pós-apocalíptico',
          precoSugerido: 59.99,
          genero: 'Ação/Aventura',
          desenvolvedora: 'Naughty Dog',
          publicadora: 'Sony Interactive Entertainment',
          urlImagemCapa: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300',
        },
        {
          id: 2,
          titulo: 'Halo Infinite',
          descricao: 'FPS futurista da franquia Halo',
          precoSugerido: 49.99,
          genero: 'FPS',
          desenvolvedora: '343 Industries',
          publicadora: 'Microsoft Studios',
          urlImagemCapa: 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=300',
        },
        {
          id: 3,
          titulo: 'Super Mario Odyssey',
          descricao: 'Aventura de plataforma com Mario',
          precoSugerido: 39.99,
          genero: 'Plataforma',
          desenvolvedora: 'Nintendo EPD',
          publicadora: 'Nintendo',
          urlImagemCapa: 'https://images.pexels.com/photos/1293269/pexels-photo-1293269.jpeg?auto=compress&cs=tinysrgb&w=300',
        },
      ];
      setGames(mockGames);
      console.log('📦 Usando dados mock temporariamente');
    }
  }, []);

  // Busca o estoque
  const fetchInventory = useCallback(async () => {
    try {
      setError(null);
      console.log('📦 Buscando estoque do backend...');
      const res = await api.get<InventoryItem[]>('/estoque');
      setInventory(res.data);
      console.log(`✅ ${res.data.length} itens de estoque carregados!`);
    } catch (err: any) {
      console.error('❌ Erro ao buscar estoque:', err);
      setError('Erro ao carregar estoque do backend Azure.');
      
      // Fallback para dados mock
      const mockInventory: InventoryItem[] = [
        {
          id: 1,
          jogoId: 1,
          jogoTitulo: 'The Last of Us Part II',
          plataformaId: 1,
          plataformaNome: 'PlayStation 5',
          depositoId: 1,
          depositoNome: 'Depósito Principal',
          quantidade: 5,
          precoUnitarioAtual: 59.99,
        },
        {
          id: 2,
          jogoId: 2,
          jogoTitulo: 'Halo Infinite',
          plataformaId: 2,
          plataformaNome: 'Xbox Series X',
          depositoId: 1,
          depositoNome: 'Depósito Principal',
          quantidade: 2,
          precoUnitarioAtual: 49.99,
        },
        {
          id: 3,
          jogoId: 3,
          jogoTitulo: 'Super Mario Odyssey',
          plataformaId: 3,
          plataformaNome: 'Nintendo Switch',
          depositoId: 1,
          depositoNome: 'Depósito Principal',
          quantidade: 8,
          precoUnitarioAtual: 39.99,
        },
      ];
      setInventory(mockInventory);
      console.log('📦 Usando dados de estoque mock temporariamente');
    }
  }, []);

  // Adiciona um novo jogo
  const addGame = async (game: Omit<Game, 'id'>) => {
    try {
      console.log('➕ Adicionando novo jogo:', game.titulo);
      const res = await api.post<Game>('/jogos', game);
      setGames(prev => [...prev, res.data]);
      console.log('✅ Jogo adicionado com sucesso!');
      return res.data;
    } catch (err: any) {
      console.error('❌ Erro ao adicionar jogo:', err);
      throw new Error('Erro ao adicionar jogo no backend Azure.');
    }
  };

  // Edita um jogo existente
  const updateGame = async (id: number, updates: Partial<Game>) => {
    try {
      console.log('✏️ Atualizando jogo ID:', id);
      const res = await api.put<Game>(`/jogos/${id}`, updates);
      setGames(prev => prev.map(g => g.id === id ? res.data : g));
      console.log('✅ Jogo atualizado com sucesso!');
      return res.data;
    } catch (err: any) {
      console.error('❌ Erro ao atualizar jogo:', err);
      throw new Error('Erro ao atualizar jogo no backend Azure.');
    }
  };

  // Remove um jogo
  const deleteGame = async (id: number) => {
    try {
      console.log('🗑️ Removendo jogo ID:', id);
      await api.delete(`/jogos/${id}`);
      setGames(prev => prev.filter(g => g.id !== id));
      console.log('✅ Jogo removido com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao deletar jogo:', err);
      throw new Error('Erro ao deletar jogo no backend Azure.');
    }
  };

  // Adiciona uma movimentação de estoque
  const addStockMovement = async (movement: Omit<StockMovement, 'id'>) => {
    try {
      console.log('📋 Adicionando movimentação de estoque:', movement);
      const res = await api.post('/movimentacoes', movement);
      console.log('✅ Movimentação adicionada com sucesso!');
      
      // Recarrega o estoque após a movimentação
      await fetchInventory();
      return res.data;
    } catch (err: any) {
      console.error('❌ Erro ao adicionar movimentação:', err);
      throw new Error('Erro ao adicionar movimentação no backend Azure.');
    }
  };

  // Carrega dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      console.log('🚀 Carregando dados iniciais...');
      
      await Promise.all([fetchGames(), fetchInventory()]);
      
      setLoading(false);
      console.log('✅ Dados iniciais carregados!');
    };

    loadData();
  }, [fetchGames, fetchInventory]);

  return {
    games,
    inventory,
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