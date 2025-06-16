import React, { useState } from 'react';
import { useGamesAndInventory } from '../hooks/useGamesAndInventory';
// import { Game } from '../types'; // agora o tipo Game reflete o DTO do backend
import { X, Save } from 'lucide-react';

interface GameFormProps {
  game?: any | null; // Ajuste o tipo conforme o novo modelo DTO
  onClose: () => void;
}

const GameForm: React.FC<GameFormProps> = ({ game, onClose }) => {
  const { addGame, updateGame } = useGamesAndInventory();
  const [loading, setLoading] = useState(false);

  // Adapte os campos para os nomes do backend
  const [formData, setFormData] = useState({
    titulo: game?.titulo || '',
    descricao: game?.descricao || '',
    genero: game?.genero || '',
    precoSugerido: game?.precoSugerido || 0,
    desenvolvedora: game?.desenvolvedora || '',
    publicadora: game?.publicadora || '',
    urlImagemCapa: game?.urlImagemCapa ||
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (game && game.id) {
        await updateGame(game.id, formData);
      } else {
        await addGame(formData);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar jogo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const predefinedImages = [
    'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/371924/pexels-photo-371924.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1293269/pexels-photo-1293269.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/159581/console-controller-play-video-159581.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/21067/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=300',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {game ? 'Editar Jogo' : 'Adicionar Novo Jogo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Jogo *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Digite o título do jogo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gênero *
                </label>
                <input
                  type="text"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="ex: Ação, RPG, Esportes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço Sugerido *
                </label>
                <input
                  type="number"
                  name="precoSugerido"
                  value={formData.precoSugerido}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desenvolvedora *
                </label>
                <input
                  type="text"
                  name="desenvolvedora"
                  value={formData.desenvolvedora}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="ex: Naughty Dog, Nintendo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publicadora *
                </label>
                <input
                  type="text"
                  name="publicadora"
                  value={formData.publicadora}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="ex: Sony, Nintendo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Sobre o jogo, observações..."
                />
              </div>
            </div>
          </div>

          {/* Image Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem do Jogo
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
              {predefinedImages.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, urlImagemCapa: url }))}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    formData.urlImagemCapa === url
                      ? 'border-indigo-500 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={url} alt={`Opção ${index + 1}`} className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>

            <input
              type="url"
              name="urlImagemCapa"
              value={formData.urlImagemCapa}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ou digite uma URL de imagem personalizada"
            />
          </div>

          {/* Image Preview */}
          {formData.urlImagemCapa && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visualização
              </label>
              <img
                src={formData.urlImagemCapa}
                alt="Visualização"
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{game ? 'Atualizar Jogo' : 'Adicionar Jogo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameForm;