import React from 'react';
import { X } from 'lucide-react';

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
    <div className="max-w-2xl mx-auto px-4"> {/* Added px-4 for mobile padding */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        {/* Header do Card de Detalhes */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate flex-1 mr-4">{game.titulo}</h2>
          {/* Botão para fechar o card */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Card de Detalhes */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
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
          <div className="space-y-3 md:space-y-4">
             <div>
                 <p className="text-sm font-medium text-gray-700 mb-1">Descrição:</p>
                 <p className="text-gray-900 text-sm md:text-base">{game.descricao || 'N/A'}</p>
             </div>
             <div>
                 <p className="text-sm font-medium text-gray-700 mb-1">Gênero:</p>
                 <p className="text-gray-900 text-sm md:text-base">{game.genero || 'N/A'}</p>
             </div>
             <div>
                 <p className="text-sm font-medium text-gray-700 mb-1">Desenvolvedora:</p>
                 <p className="text-gray-900 text-sm md:text-base">{game.desenvolvedora || 'N/A'}</p>
             </div>
             <div>
                 <p className="text-sm font-medium text-gray-700 mb-1">Publicadora:</p>
                 <p className="text-gray-900 text-sm md:text-base">{game.publicadora || 'N/A'}</p>
             </div>
             <div>
                 <p className="text-sm font-medium text-gray-700 mb-1">Preço Sugerido:</p>
                 <p className="text-gray-900 text-sm md:text-base font-semibold">R$ {game.precoSugerido?.toFixed(2) || 'N/A'}</p>
             </div>
          </div>

          {/* Botão Fechar no rodapé para mobile */}
          <div className="flex justify-end pt-4 border-t md:hidden">
             <button
               onClick={onClose}
               className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
             >
               Fechar
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GameDetails;