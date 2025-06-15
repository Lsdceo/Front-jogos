import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import api from '../config/api.ts'; // Verifique se o caminho para o seu arquivo api.ts está correto

// Tipagem para o objeto User
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  // Adicione outros campos do usuário que seu backend retornar, se necessário
}

// Tipagem para o estado do contexto de autenticação
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null; // Adicionado campo para mensagem de erro
}

// Tipagem para as ações do reducer
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string | null } // Payload pode ser a mensagem de erro
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_START' } // Adicionado ação para início do registro
  | { type: 'REGISTER_SUCCESS'; payload: any } // Adicionado ação para sucesso no registro, payload pode ser os dados do usuário criado
  | { type: 'REGISTER_FAILURE'; payload: string | null }; // Adicionado ação para falha no registro


// Tipagem para o contexto
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role?: 'admin' | 'user') => Promise<boolean>;
  logout: () => void;
}

// Criação do contexto com valor inicial null
const AuthContext = createContext<AuthContextType | null>(null);

// Reducer para gerenciar o estado de autenticação
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
        error: null, // Limpa qualquer erro anterior
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false, // Garante que não está autenticado em caso de falha
        error: action.payload, // Define a mensagem de erro
      };
    case 'LOGOUT': // Logout
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null, // Limpa erro ao deslogar
      };
    case 'REGISTER_START': // Novo caso para início do registro
        return { ...state, isLoading: true, error: null };
    case 'REGISTER_SUCCESS': // Novo caso para sucesso no registro
        // Não alteramos o estado de autenticação aqui, pois o usuário não loga automaticamente
        return { ...state, isLoading: false, error: null }; // Apenas paramos o loading e limpamos erro
    case 'REGISTER_FAILURE': // Novo caso para falha no registro
        return { ...state, isLoading: false, isAuthenticated: false, error: action.payload }; // Paramos o loading e definimos o erro
    default:
      return state;
  }
};

// Provedor do contexto de autenticação
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null, // Estado inicial com erro nulo
  });

  // Efeito para carregar o usuário e token salvos ao iniciar a aplicação
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    // Não precisamos necessariamente do token aqui, apenas para saber se há um usuário salvo
    // O 'api.ts' deve ser configurado para adicionar o token do localStorage automaticamente
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Basic validation to ensure the parsed object looks like a User
        if (user && user.id && user.email && user.name && user.role) {
             dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
            // Clear invalid saved user data
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken'); // Remove token too if user data is bad
        }
      } catch (e) {
         console.error("Failed to parse saved user data:", e);
         localStorage.removeItem('user');
         localStorage.removeItem('accessToken');
      }
    }
  }, []); // Array de dependências vazio para rodar apenas uma vez ao montar

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' }); // Inicia o loading e limpa erro

    try {
      const response = await api.post('/auth/login', { username: email, password });

      const { accessToken, username, id, roles, name } = response.data; // Ajuste para receber ID, roles e nome se o backend enviar

      if (accessToken) { // Verificamos apenas o token para o sucesso inicial
         localStorage.setItem('accessToken', accessToken);

        // Crie o objeto User com base nos dados REAIS retornados pelo backend no login
        // Ajuste os nomes das propriedades (id, email, name, role) conforme seu backend retorna
         const fetchedUser: User = {
             id: id || username, // Use id se disponível, senão username
             email: email, // Geralmente o email é o username no login
             name: name || username, // Use nome se disponível, senão username
             // Converta as roles do backend (ex: ['ROLE_ADMIN']) para o formato do frontend ('admin')
             role: roles && Array.isArray(roles) && roles.includes('ROLE_ADMIN') ? 'admin' : 'user', // Added Array.isArray check
         };

        localStorage.setItem('user', JSON.stringify(fetchedUser)); // Salva o objeto User completo

        dispatch({ type: 'LOGIN_SUCCESS', payload: fetchedUser });
        console.log('Login bem-sucedido. Token e usuário salvos.');
        return true;
      } else {
         console.error('Resposta da API de login incompleta: accessToken faltando.');
         dispatch({ type: 'LOGIN_FAILURE', payload: 'Resposta da API de login incompleta.' });
         return false;
      }

    } catch (error: any) {
      console.error('Erro durante o login:', error.response?.data || error.message);
      // Extrai mensagem de erro do backend se disponível, senão usa uma genérica
      const errorMessage = error.response?.data?.message || 'Credenciais inválidas. Verifique seu email e senha.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return false;
    }
  };

  // Função de registro
  const register = async (email: string, password: string, name: string, role: 'admin' | 'user' = 'user'): Promise<boolean> => {
    dispatch({ type: 'REGISTER_START' }); // Inicia o loading para registro

    try {
        // Usando o endpoint 'registrar' que está permitido no backend
        const response = await api.post('/auth/registrar', { email, password, username: name, roleName: role.toUpperCase() });

        console.log('Registro bem-sucedido na API.', response.data); // Log a resposta da API

        // Dispatch uma ação indicando APENAS que o registro na API foi bem-sucedido.
        // Esta ação NÃO deve logar o usuário automaticamente se o backend não retornou token.
        // Ajuste o payload se quiser salvar algum dado retornado (ex: ID do usuário criado)
        dispatch({ type: 'REGISTER_SUCCESS', payload: response.data }); // Dispatch com os dados retornados

        return true; // Indica que a chamada da API de registro foi bem-sucedida

    } catch (error: any) {
        console.error('Erro durante o registro:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || 'Ocorreu um erro durante o registro. Tente novamente.';
        dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage }); // Dispara a ação de falha específica do registro
        return false;
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    console.log('Usuário deslogado.');
  };

  // Fornece o estado e as funções para os componentes filhos
  return (
    <AuthContext.Provider value={{ state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Lança um erro se o hook for usado fora do AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
