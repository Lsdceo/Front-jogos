import React, { useState, useMemo } from 'react';
import { useGamesAndInventory } from '../hooks/useGamesAndInventory';
import { useAuth } from '../contexts/AuthContext';
import GameForm from './GameForm';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Package,
  Gamepad2
} from 'lucide-react';

// Ajuste: Os tipos agora vêm do back, então você pode importar de ../types se quiser campos extras customizados
// import { Game } from '../types';

const GamesList: React.FC = () => {
  // Usar o novo hook!
  const { games, loading, deleteGame, updateGame } = useGamesAndInventory();
  const { state } = useAuth();

  // Os filtros precisarão ser adaptados para os novos campos do backend!
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<any | null>(null); // Ajuste o tipo conforme seu novo modelo
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtros adaptados: agora filtra por título, gênero e desenvolvedora
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch =
        game.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.genero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.desenvolvedora.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGenre =
        selectedGenre === '' || game.genero === selectedGenre;

      return matchesSearch && matchesGenre;
    });
  }, [games, searchTerm, selectedGenre]);

  // Listagem dinâmica de gêneros disponíveis
  const genres = useMemo(() => {
    const set = new Set<string>();
    games.forEach(g => set.add(g.genero));
    return Array.from(set);
  }, [games]);

  // Editar jogo
  const handleEdit = (game: any) => {
    setEditingGame(game);
    setShowForm(true);
  };

  // Remover jogo
  const handleDelete = (gameId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este jogo?')) {
      deleteGame(gameId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <GameForm
        game={editingGame}
        onClose={() => {
          setShowForm(false);
          setEditingGame(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Biblioteca de Jogos</h2>
          <p className="text-gray-600">{filteredGames.length} jogos encontrados</p>
        </div>
        {state.user?.role === 'admin' && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Jogo</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, gênero ou desenvolvedora..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Todos os Gêneros</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Grade
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Games Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div key={game.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={game.urlImagemCapa}
                  alt={game.titulo}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 flex items-center space-x-1">
                  <Package className="w-4 h-4 text-white" />
                  {/* Se você tiver estoque associado, pode mostrar aqui */}
                  {/* <span className="text-white text-sm font-medium">{getQuantityForGame(game.id)}</span> */}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{game.titulo}</h3>
                  {/* Se quiser mostrar avaliação, adapte conforme backend */}
                  {/* {game.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{game.rating}</span>
                    </div>
                  )} */}
                </div>

                <p className="text-gray-600 text-sm mb-2">{game.genero}</p>
                <p className="text-gray-500 text-sm mb-3">{game.desenvolvedora}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-lg text-gray-900">R$ {game.precoSugerido?.toFixed(2)}</span>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>Ver</span>
                  </button>

                  {state.user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => handleEdit(game)}
                        className="bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-200 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jogo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gênero</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desenvolvedora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-lg object-cover" src={game.urlImagemCapa} alt={game.titulo} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{game.titulo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{game.genero}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{game.desenvolvedora}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">R$ {game.precoSugerido?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        {state.user?.role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleEdit(game)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(game.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gamepad2 className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum jogo encontrado</h3>
          <p className="text-gray-500 mb-4">Tente ajustar sua busca ou filtros</p>
          {state.user?.role === 'admin' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Adicionar Seu Primeiro Jogo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GamesList;