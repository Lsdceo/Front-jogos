import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Gamepad2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate
import { useEffect } from 'react'; // Importe useEffect

interface LoginProps {
  onToggleMode: () => void;
  isRegisterMode: boolean;
}

const Login: React.FC<LoginProps> = ({ onToggleMode, isRegisterMode }) => {
  const { login, register, state } = useAuth();
  const navigate = useNavigate(); // Use o hook de navegação

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user' as 'admin' | 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(state.error); // Inicialize o erro com o estado do contexto

   // Adicione um useEffect para observar mudanças no estado de erro do contexto
   useEffect(() => {
      setError(state.error);
   }, [state.error]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpa erro anterior ao submeter

    try {
      if (isRegisterMode) {
        const success = await register(formData.email, formData.password, formData.name, formData.role);
        if (success) { // Se a chamada da API de registro foi bem-sucedida
           // *** Redireciona para a página de login ***
           navigate('/login'); // Ajuste o caminho '/login' conforme sua rota de login
           onToggleMode(); // Opcional: muda para o modo login após o registro bem-sucedido
        } else {
            // A mensagem de erro já deve estar no estado 'state.error' pelo dispatch em AuthContext
            // setError('Falha no registro. Verifique os dados.'); // Mensagem fallback se necessário
        }
      } else { // Modo login
        const success = await login(formData.email, formData.password);
        if (success) {
          // Redireciona para a página principal ou dashboard após o login
           navigate('/'); // Ajuste o caminho '/' conforme sua página principal
        } else {
          // A mensagem de erro já deve estar no estado 'state.error' pelo dispatch em AuthContext
          // setError('Credenciais inválidas'); // Mensagem fallback se necessário
        }
      }
    } catch (err: any) {
        console.error("Erro inesperado no handleSubmit:", err);
        setError(err.message || 'Ocorreu um erro inesperado.'); // Captura erros inesperados antes da chamada da API
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">GameVault</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            {isRegisterMode ? 'Crie sua conta' : 'Bem-vindo de volta'}
          </p>
        </div>

        {/* Demo Accounts Info */}
        <div className="bg-indigo-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
          <p className="text-sm font-medium text-indigo-900 mb-2">Contas de Demonstração:</p>
          <div className="text-xs text-indigo-700 space-y-1">
            <p><strong>Admin:</strong> admin@example.com (qualquer senha)</p>
            <p><strong>Usuário:</strong> user@example.com (qualquer senha)</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {isRegisterMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm md:text-base"
                placeholder="Digite seu nome completo"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço de Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm md:text-base"
              placeholder="Digite seu email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm md:text-base"
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Função
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm md:text-base"
              >
                <option value="user">Usuário (Apenas Visualização)</option>
                <option value="admin">Administrador (Acesso Completo)</option>
              </select>
            </div>
          )}

          {error && ( // Exibe o error do estado local
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={state.isLoading} // Desabilita o botão se estiver carregando
            className="w-full bg-indigo-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center text-sm md:text-base"
          >
            {state.isLoading ? ( // Mostra spinner se estiver carregando
              <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
            ) : (
              isRegisterMode ? 'Criar Conta' : 'Entrar'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 md:mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isRegisterMode ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            <button
              onClick={onToggleMode}
              className="ml-2 text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {isRegisterMode ? 'Entrar' : 'Cadastrar-se'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;