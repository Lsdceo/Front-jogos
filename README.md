# GameVault - Sistema de Gerenciamento de Inventário de Jogos

## Configuração do Backend

### Desenvolvimento Local
1. Certifique-se de que seu backend Spring Boot está rodando em `http://localhost:8080`
2. O frontend já está configurado para se conectar automaticamente

### Produção com Backend na Azure
1. Edite o arquivo `.env` na raiz do projeto
2. Descomente e ajuste a linha:
   ```
   VITE_API_BASE_URL=https://seu-backend.azurewebsites.net/api
   ```
3. Substitua `seu-backend.azurewebsites.net` pela URL real do seu backend na Azure

### Endpoints Esperados no Backend

O frontend espera os seguintes endpoints:

- `GET /api/jogos` - Lista todos os jogos
- `POST /api/jogos` - Cria um novo jogo
- `PUT /api/jogos/{id}` - Atualiza um jogo
- `DELETE /api/jogos/{id}` - Remove um jogo
- `GET /api/estoque` - Lista itens do estoque
- `POST /api/movimentacoes` - Cria uma movimentação de estoque
- `GET /api/health` - Health check (opcional)

### CORS

Certifique-se de que seu backend Spring Boot está configurado para aceitar requisições do frontend:

```java
@CrossOrigin(origins = {"http://localhost:5173", "https://seu-frontend-url.com"})
```

### Funcionalidades

- ✅ Conexão automática com backend
- ✅ Fallback para dados mock se backend estiver offline
- ✅ Indicador visual de status da conexão
- ✅ Tratamento de erros de rede
- ✅ Autenticação com tokens JWT (se implementado no backend)

### Como Testar

1. **Backend Online**: Todos os dados vêm do backend
2. **Backend Offline**: Sistema usa dados mock para demonstração
3. **Status da Conexão**: Indicador no canto superior direito mostra o status

### Deploy

Você pode fazer deploy do frontend e backend separadamente:

- **Frontend**: Netlify, Vercel, Azure Static Web Apps
- **Backend**: Azure App Service, AWS, Heroku

Apenas ajuste a variável `VITE_API_BASE_URL` no arquivo `.env` para apontar para seu backend em produção.