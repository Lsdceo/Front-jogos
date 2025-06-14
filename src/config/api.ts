import axios from 'axios';

// Configuração da API baseada nas variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jogos-inventario.azurewebsites.net/api';

console.log('🔗 Conectando ao backend:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos de timeout para Azure
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta da API:', error);
    
    // Se o erro for 401 (não autorizado), limpar token e redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.reload();
    }
    
    // Log detalhado do erro
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else if (error.request) {
      console.error('Sem resposta do servidor:', error.request);
    }
    
    return Promise.reject(error);
  }
);

export default api;