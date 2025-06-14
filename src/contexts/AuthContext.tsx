import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../config/api.ts';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_SUCCESS'; payload: User };

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role?: 'admin' | 'user') => Promise<boolean>;
  logout: () => void;
} | null>(null);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'REGISTER_SUCCESS':
       return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    if (savedUser && savedToken) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: JSON.parse(savedUser) });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await api.post('/auth/login', { username: email, password });

      const { accessToken, username } = response.data;

      // Constrói o objeto User para o frontend com base nos dados disponíveis na resposta de login.
      // ATENÇÃO: Assumindo que 'admin@example.com' tem a role 'admin'.
      // Se precisar de ID e roles corretos, ajuste o backend ou faça outra chamada API.
       const frontendUser: User = {
           id: username, // Usando username como ID temporário
           email: username,
           name: username,
           role: username === 'admin@example.com' ? 'admin' : 'user', // Inferindo role
       };

      if (accessToken && username) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(frontendUser));

        dispatch({ type: 'LOGIN_SUCCESS', payload: frontendUser });
        console.log('Login bem-sucedido. Token e usuário salvos.');
        return true;
      } else {
         console.error('Resposta da API de login incompleta: accessToken ou username faltando.');
         dispatch({ type: 'LOGIN_FAILURE' });
         return false;
      }

    } catch (error) {
      console.error('Erro durante o login:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: 'admin' | 'user' = 'user'): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    // Implemente aqui a chamada REAL para o seu endpoint de registro no backend.
    // Adapte o endpoint, o corpo da requisição e o processamento da resposta
    // para corresponderem à sua API de registro.

    try {
        const response = await api.post('/auth/register', { email, password, username: name, roleName: role.toUpperCase() }); // Exemplo de chamada real

        const { accessToken, username } = response.data; // Exemplo de extração, ajuste conforme a resposta do backend

         // Adapte a criação do objeto User com base na resposta do backend
         const frontendUser: User = {
             id: username, // Ajuste aqui para usar o ID retornado pelo backend
             email: username, // Ajuste aqui para usar o email retornado pelo backend
             name: username, // Ajuste aqui para usar o nome/username retornado pelo backend
             role: response.data.roles && response.data.roles.includes('ROLE_ADMIN') ? 'admin' : 'user', // Exemplo, ajuste a lógica de papéis
         };


         if (accessToken && username) { // Ajuste a condição de verificação conforme a resposta
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(frontendUser)); // Salva o objeto User criado
            dispatch({ type: 'REGISTER_SUCCESS', payload: frontendUser });
            console.log('Registro bem-sucedido. Token e usuário salvos.');
            return true;
        } else {
            console.error('Resposta da API de registro incompleta.'); // Mensagem mais genérica
            dispatch({ type: 'LOGIN_FAILURE'}); // Ou um novo tipo REGISTER_FAILURE
            return false;
        }

    } catch (error) {
        console.error('Erro durante o registro:', error);
        dispatch({ type: 'LOGIN_FAILURE'}); // Ou um novo tipo REGISTER_FAILURE
        return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
