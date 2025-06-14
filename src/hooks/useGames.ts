import { useState, useEffect } from 'react';
import { Game, StockMovement } from '../types';

const mockGames: Game[] = [
  {
    id: '1',
    title: 'The Last of Us Part II',
    console: 'PlayStation',
    genre: 'Ação/Aventura',
    price: 59.99,
    purchaseDate: '2024-01-15',
    status: 'completed',
    rating: 5,
    quantity: 3,
    minStock: 2,
    imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '2',
    title: 'Halo Infinite',
    console: 'Xbox',
    genre: 'FPS',
    price: 49.99,
    purchaseDate: '2024-02-01',
    status: 'playing',
    rating: 4,
    quantity: 5,
    minStock: 3,
    imageUrl: 'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '3',
    title: 'Super Mario Odyssey',
    console: 'Nintendo Switch',
    genre: 'Plataforma',
    price: 39.99,
    purchaseDate: '2024-01-20',
    status: 'completed',
    rating: 5,
    quantity: 1,
    minStock: 2,
    imageUrl: 'https://images.pexels.com/photos/1293269/pexels-photo-1293269.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '4',
    title: 'Cyberpunk 2077',
    console: 'PC',
    genre: 'RPG',
    price: 39.99,
    purchaseDate: '2024-03-01',
    status: 'backlog',
    quantity: 2,
    minStock: 1,
    imageUrl: 'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
];

const mockMovements: StockMovement[] = [
  {
    id: '1',
    gameId: '1',
    type: 'entry',
    quantity: 2,
    date: '2024-01-15T10:00:00Z',
    reason: 'Estoque inicial',
    userId: '1',
  },
  {
    id: '2',
    gameId: '2',
    type: 'exit',
    quantity: 1,
    date: '2024-02-05T14:30:00Z',
    reason: 'Venda',
    userId: '1',
  },
];

export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const savedGames = localStorage.getItem('games');
      const savedMovements = localStorage.getItem('movements');
      
      setGames(savedGames ? JSON.parse(savedGames) : mockGames);
      setMovements(savedMovements ? JSON.parse(savedMovements) : mockMovements);
      setLoading(false);
    }, 500);
  }, []);

  const saveGames = (newGames: Game[]) => {
    setGames(newGames);
    localStorage.setItem('games', JSON.stringify(newGames));
  };

  const saveMovements = (newMovements: StockMovement[]) => {
    setMovements(newMovements);
    localStorage.setItem('movements', JSON.stringify(newMovements));
  };

  const addGame = (game: Omit<Game, 'id'>) => {
    const newGame = { ...game, id: Date.now().toString() };
    const newGames = [...games, newGame];
    saveGames(newGames);

    // Add initial stock movement
    const movement: StockMovement = {
      id: Date.now().toString(),
      gameId: newGame.id,
      type: 'entry',
      quantity: game.quantity,
      date: new Date().toISOString(),
      reason: 'Estoque inicial',
      userId: '1',
    };
    saveMovements([...movements, movement]);
  };

  const updateGame = (id: string, updates: Partial<Game>) => {
    const newGames = games.map(game => 
      game.id === id ? { ...game, ...updates } : game
    );
    saveGames(newGames);
  };

  const deleteGame = (id: string) => {
    const newGames = games.filter(game => game.id !== id);
    saveGames(newGames);
  };

  const addMovement = (movement: Omit<StockMovement, 'id'>) => {
    const newMovement = { ...movement, id: Date.now().toString() };
    saveMovements([...movements, newMovement]);

    // Update game quantity
    const game = games.find(g => g.id === movement.gameId);
    if (game) {
      let newQuantity = game.quantity;
      if (movement.type === 'entry') {
        newQuantity += movement.quantity;
      } else if (movement.type === 'exit') {
        newQuantity -= movement.quantity;
      }
      updateGame(game.id, { quantity: Math.max(0, newQuantity) });
    }
  };

  return {
    games,
    movements,
    loading,
    addGame,
    updateGame,
    deleteGame,
    addMovement,
  };
};