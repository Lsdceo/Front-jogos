import React from 'react';
import { X } from 'lucide-react';
import GameForm from '../components/GameForm';
import GameList from '../components/GameList';

// Importe a interface Game se estiver definida em ../types
// import { Game } from '../types';


interface GameDetailsProps {
  game: any; // Ajuste o tipo conforme o modelo DTO do seu backend
  onClose: () => void; // Função para fechar a visualização
}

const GameDetails: React.FC<GameDetailsProps> = ({ game, onClose }) => {
  if (!game) {
    // Se por algum motivo não houver dados do jogo, não renderize nada ou mostre uma mensagem
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto"> {/* Ajuste a largura do card conforme necessário */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        {/* Header do Card de Detalhes */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{game.titulo}</h2>
          {/* Botão para fechar o card */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Card de Detalhes */}
        <div className="p-6 space-y-6">
          {/* Imagem da Capa */}
          {game.urlImagemCapa && (
            <div className="flex justify-center">
               <img
                src={game.urlImagemCapa}
                alt={`Capa de ${game.titulo}`}
                className="w-full max-w-xs h-auto object-cover rounded-lg shadow-md" // Ajuste o tamanho máximo da imagem
              />
            </div>
          )}

          {/* Detalhes do Jogo */}
          <div className="space-y-3">
             <div>
                 <p className="text-sm font-medium text-gray-700">Descrição:</p>
                 <p className="text-gray-900">{game.descricao || 'N/A'}</p>
             </div>
             <div>
                 <p className="text-sm font-medium text-gray-700">Gênero:</p>
                 <p className="text-gray-900">{game.genero || 'N/A'}</p>
             </div>
             <div>
                 <p className="text-sm font-medium text-gray-700">Desenvolvedora:</p>
                 <p className="text-gray-900">{game.desenvolvedora || 'N/A'}</p>
             </div>
             <div>
                 <p className="text-sm font-medium text-gray-700">Publicadora:</p>
                 <p className="text-gray-900">{game.publicadora || 'N/A'}</p>
             </div>
             <div>
                 <p className="text-sm font-medium text-gray-700">Preço Sugerido:</p>
                 <p className="text-gray-900">R$ {game.precoSugerido?.toFixed(2) || 'N/A'}</p>
             </div>
             {/* Adicione mais campos conforme necessário, como Plataformas associadas, Estoque (se relevante aqui), etc. */}
             {/* Para exibir estoque, você precisaria buscar os itens de estoque relacionados a este jogo ID e exibi-los */}
          </div>

          {/* Botão Fechar no rodapé, se quiser */}
          {/* <div className="flex justify-end pt-4 border-t">
             <button
               onClick={onClose}
               className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
             >
               Fechar
             </button>
          </div> */}

        </div>
      </div>
    </div>
  );
};

export default GameDetails;
