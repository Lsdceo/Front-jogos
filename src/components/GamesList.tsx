import React, { useState, useMemo, useCallback } from 'react'; // Import useCallback
import { useGamesAndInventory } from '../hooks/useGamesAndInventory';
import { useAuth } from '../contexts/AuthContext';
import GameForm from './GameForm';
import GameDetails from './GameDetails'; // Import the GameDetails component
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

// Adjust: Types now come from the back, so you can import from ../types if you want custom extra fields
// import { Game } from '../types';

const GamesList: React.FC = () => {
  // Use the hook!
  const { games, loading, deleteGame, updateGame } = useGamesAndInventory();
  // Use the modified useAuth hook
  const { isAdmin } = useAuth();


  // Filters will need to be adapted for the new backend fields!
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<any | null>(null); // Adjust the type according to your new model

  // Add state to hold the currently selected game for viewing details
  const [selectedGame, setSelectedGame] = useState<any | null>(null); // New state for selected game

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Adapted filters: now filter by title, genre, and developer
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

  // Dynamic listing of available genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    games.forEach(g => set.add(g.genero));
    return Array.from(set);
  }, [games]);

  // Edit game
  const handleEdit = (game: any) => {
    setEditingGame(game);
    setShowForm(true);
  };

  // Remove game
  const handleDelete = (gameId: number) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      deleteGame(gameId);
    }
  };

  // Function to handle viewing game details
  const handleViewDetails = useCallback((game: any) => {
      setSelectedGame(game);
  }, []); // useCallback to prevent unnecessary re-creation

  // Function to close game details
  const handleCloseDetails = useCallback(() => {
      setSelectedGame(null);
  }, []); // useCallback

  // Render GameForm if showForm is true
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

  // Render GameDetails if a game is selected for viewing
  if (selectedGame) {
      return (
          <GameDetails
              game={selectedGame}
              onClose={handleCloseDetails}
          />
      );
  }


  // Otherwise, render the game list/grid
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Game Library</h2>
          <p className="text-gray-600">{filteredGames.length} games found</p>
        </div>
        {/* Conditionally display the Add Game button */}
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Game</span>
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
              placeholder="Search by title, genre, or developer..."
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
            <option value="">All Genres</option>
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
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Games Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div key={game.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"> {/* Added cursor-pointer */}
              <div className="relative">
                <img
                  src={game.urlImagemCapa}
                  alt={game.titulo}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 flex items-center space-x-1">
                  <Package className="w-4 h-4 text-white" />
                  {/* If you have associated inventory, you can show it here */}
                  {/* <span className="text-white text-sm font-medium">{getQuantityForGame(game.id)}</span> */}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{game.titulo}</h3>
                  {/* If you want to show rating, adapt according to backend */}
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
                  {/* Modified View button to call handleViewDetails */}
                  <button
                      onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the card click
                          handleViewDetails(game);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>

                  {/* Conditionally display Edit and Delete buttons */}
                  {isAdmin && (
                    <>
                      <button
                        onClick={(e) => {
                           e.stopPropagation(); // Prevent triggering the card click
                           handleEdit(game);
                        }}
                        className="bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-200 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                           e.stopPropagation(); // Prevent triggering the card click
                           handleDelete(game.id);
                        }}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Developer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetails(game)}> {/* Added onClick to the row */}
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
                         {/* Modified View button (can be removed as clicking the row now views details) */}
                         {/* <button className="text-indigo-600 hover:text-indigo-900">
                          <Eye className="w-4 h-4" />
                        </button> */}
                         {/* Conditionally display Edit and Delete buttons */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={(e) => {
                                 e.stopPropagation(); // Prevent triggering the row click
                                 handleEdit(game);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                 e.stopPropagation(); // Prevent triggering the row click
                                 handleDelete(game.id);
                              }}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
           {/* Conditionally display the Add Game button */}
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Your First Game
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GamesList;
