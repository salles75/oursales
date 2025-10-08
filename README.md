# 🚀 OurSales - Sistema de Gestão Comercial

Sistema completo e escalável para gestão de vendas, desenvolvido com arquitetura moderna e preparado para grandes volumes de dados.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Uso](#uso)
- [API](#api)
- [Escalabilidade](#escalabilidade)
- [Segurança](#segurança)
- [Manutenção](#manutenção)

## 🎯 Visão Geral

OurSales é um sistema profissional de gestão comercial que oferece:

- ✅ Gestão completa de clientes (PF e PJ)
- ✅ Catálogo de produtos com controle de estoque
- ✅ Orçamentos e propostas comerciais
- ✅ Pedidos e acompanhamento de entregas
- ✅ CRM integrado com histórico de interações
- ✅ Gestão de transportadoras
- ✅ Controle financeiro (contas a receber)
- ✅ Relatórios e dashboards executivos
- ✅ Sistema de auditoria completo

### Características de Escalabilidade

- 🔥 **Alta Performance**: Cache Redis, índices otimizados, consultas eficientes
- 📊 **Big Data Ready**: Particionamento de tabelas, suporte a milhões de registros
- 🔒 **Segurança**: Autenticação JWT, rate limiting, criptografia
- 🐳 **Containerizado**: Docker e Docker Compose para deploy fácil
- 🔄 **Horizontal Scale**: Preparado para load balancing e múltiplas instâncias
- 📈 **Monitoramento**: Logs estruturados, health checks, métricas

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente Web                          │
│                     (HTML/CSS/JavaScript)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                         Nginx                               │
│              (Reverse Proxy + Static Files)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js)                    │
│            Express + Prisma ORM + JWT Auth                  │
└───────┬─────────────────────────────────────┬───────────────┘
        │                                     │
        ▼                                     ▼
┌──────────────────┐              ┌──────────────────────┐
│   PostgreSQL     │              │       Redis          │
│  (Banco de Dados)│              │   (Cache/Sessões)    │
└──────────────────┘              └──────────────────────┘
```

### Camadas da Aplicação

1. **Frontend**: Interface web estática (HTML/CSS/JS)
2. **Nginx**: Proxy reverso, balanceamento de carga, cache de arquivos estáticos
3. **Backend API**: Node.js + Express + Prisma
4. **PostgreSQL**: Banco de dados relacional principal
5. **Redis**: Cache de queries, sessões, rate limiting

## 🛠️ Tecnologias

### Backend

- **Node.js 20+**: Runtime JavaScript
- **Express 4**: Framework web
- **Prisma 5**: ORM moderno e type-safe
- **PostgreSQL 16**: Banco de dados principal
- **Redis 7**: Cache e gerenciamento de sessões
- **JWT**: Autenticação stateless
- **Bcrypt**: Hash de senhas
- **Winston**: Sistema de logs estruturado

### DevOps

- **Docker & Docker Compose**: Containerização
- **Nginx**: Proxy reverso e servidor web
- **PgAdmin**: Interface de administração do PostgreSQL
- **Redis Commander**: Interface de administração do Redis

### Segurança

- **Helmet**: Headers de segurança HTTP
- **CORS**: Controle de origens
- **Rate Limiting**: Proteção contra abuso
- **JWT**: Tokens seguros
- **Bcrypt**: Hashing de senhas

## 📦 Pré-requisitos

- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **Node.js**: 20.0+ (opcional, para desenvolvimento local)
- **Git**: Para clonar o repositório

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd OurSales
```

### 2. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp backend/.env.example backend/.env

# Edite as variáveis conforme necessário
nano backend/.env
```

**Variáveis importantes:**

```env
# Banco de Dados
DATABASE_URL="postgresql://oursales_user:sua_senha_forte@postgres:5432/oursales"

# Redis
REDIS_URL="redis://redis:6379"

# JWT (ALTERE EM PRODUÇÃO!)
JWT_SECRET="seu-segredo-jwt-super-secreto-com-pelo-menos-32-caracteres"

# CORS
CORS_ORIGIN="http://localhost:8080,https://seudominio.com"
```

### 3. Inicie os Serviços com Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar status
docker-compose ps
```

### 4. Inicialize o Banco de Dados

```bash
# Entrar no container da API
docker-compose exec api sh

# Executar migrations do Prisma
npx prisma migrate deploy

# (Opcional) Seed de dados iniciais
npm run prisma:seed
```

### 5. Acesse o Sistema

- **Frontend**: http://localhost:8080
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **PgAdmin**: http://localhost:5050 (dev mode)
- **Redis Commander**: http://localhost:8081 (dev mode)

## 🎮 Uso

### Desenvolvimento Local

Para desenvolvimento sem Docker:

```bash
# Instalar dependências
cd backend
npm install

# Configurar .env
cp .env.example .env

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# Iniciar em modo desenvolvimento
npm run dev
```

### Modo Desenvolvimento com Docker

```bash
# Iniciar com ferramentas de dev (PgAdmin, Redis Commander)
docker-compose --profile dev up -d
```

### Produção

```bash
# Build e deploy
docker-compose -f docker-compose.yml up -d --build

# Verificar logs
docker-compose logs -f api

# Backup do banco de dados
docker-compose exec postgres pg_dump -U oursales_user oursales > backup.sql
```

## 📡 API

### Autenticação

Todas as rotas (exceto login/register) requerem autenticação via JWT.

**Header:**

```
Authorization: Bearer <seu-token-jwt>
```

### Endpoints Principais

#### Autenticação

```
POST   /api/auth/register     - Registrar usuário
POST   /api/auth/login        - Login
POST   /api/auth/logout       - Logout
GET    /api/auth/me           - Dados do usuário atual
PUT    /api/auth/update-password - Atualizar senha
```

#### Clientes

```
GET    /api/clientes          - Listar clientes (paginado)
GET    /api/clientes/:id      - Obter cliente
POST   /api/clientes          - Criar cliente
PUT    /api/clientes/:id      - Atualizar cliente
DELETE /api/clientes/:id      - Deletar cliente (Admin)
GET    /api/clientes/:id/pedidos - Pedidos do cliente
GET    /api/clientes/:id/historico - Histórico CRM
```

#### Produtos

```
GET    /api/produtos          - Listar produtos
GET    /api/produtos/:id      - Obter produto
POST   /api/produtos          - Criar produto
PUT    /api/produtos/:id      - Atualizar produto
DELETE /api/produtos/:id      - Deletar produto
```

#### Pedidos

```
GET    /api/pedidos           - Listar pedidos
GET    /api/pedidos/:id       - Obter pedido
POST   /api/pedidos           - Criar pedido
PUT    /api/pedidos/:id       - Atualizar pedido
PUT    /api/pedidos/:id/status - Atualizar status
```

#### Orçamentos

```
GET    /api/orcamentos        - Listar orçamentos
GET    /api/orcamentos/:id    - Obter orçamento
POST   /api/orcamentos        - Criar orçamento
PUT    /api/orcamentos/:id    - Atualizar orçamento
POST   /api/orcamentos/:id/converter - Converter em pedido
```

#### Dashboard

```
GET    /api/dashboard         - Métricas gerais
GET    /api/dashboard/vendas  - Gráfico de vendas
GET    /api/dashboard/top-clientes - Top clientes
GET    /api/dashboard/top-produtos - Top produtos
```

### Exemplo de Requisição

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@oursales.com", "senha": "admin123"}'

# Listar clientes (com token)
curl -X GET http://localhost:3000/api/clientes \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Formato de Resposta

**Sucesso:**

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Erro:**

```json
{
  "success": false,
  "error": {
    "message": "Descrição do erro",
    "statusCode": 400
  },
  "timestamp": "2025-10-08T10:30:00.000Z"
}
```

## ⚡ Escalabilidade

### Otimizações Implementadas

#### 1. Banco de Dados

- **Índices estratégicos** em todas as colunas de busca frequente
- **Extensão pg_trgm** para busca full-text performática
- **Particionamento** de tabelas grandes (auditoria) por data
- **Views materializadas** para relatórios complexos
- **Connection pooling** otimizado

#### 2. Cache

- **Redis** para queries frequentes
- TTL configurável por tipo de dado
- Invalidação inteligente de cache
- Cache de usuários autenticados

#### 3. API

- **Rate limiting** por IP e endpoint
- **Compressão gzip** de respostas
- **Paginação** em todas as listagens
- **Lazy loading** de relacionamentos
- **Async/await** em todas as operações

#### 4. Infraestrutura

- **Docker** para fácil escalonamento horizontal
- **Nginx** como load balancer
- **Health checks** automatizados
- **Logs estruturados** com rotação diária

### Escalonamento Horizontal

Para adicionar mais instâncias da API:

```yaml
# docker-compose.yml
api:
  deploy:
    replicas: 3
  # ... resto da configuração
```

### Monitoramento de Performance

```bash
# Logs da API
docker-compose logs -f api

# Métricas do PostgreSQL
docker-compose exec postgres psql -U oursales_user -c "
  SELECT * FROM pg_stat_activity;
"

# Status do Redis
docker-compose exec redis redis-cli INFO stats

# Status do Nginx
curl http://localhost/nginx_status
```

## 🔒 Segurança

### Implementações de Segurança

1. **Autenticação JWT**: Tokens stateless com expiração
2. **Bcrypt**: Hash de senhas com salt rounds configurável
3. **Rate Limiting**: Proteção contra brute force e DDoS
4. **CORS**: Controle de origens permitidas
5. **Helmet**: Headers de segurança HTTP
6. **SQL Injection**: Protegido pelo Prisma ORM
7. **XSS**: Sanitização de inputs
8. **HTTPS**: Suporte via proxy reverso
9. **Auditoria**: Log de todas as operações críticas

### Boas Práticas

- **Nunca commite** arquivos `.env`
- **Altere** as senhas padrão em produção
- **Use HTTPS** em produção
- **Mantenha** dependências atualizadas
- **Faça backups** regulares do banco de dados
- **Monitore** logs de erro e acesso

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em watch mode
npm run test:watch
```

## 📊 Manutenção

### Backup do Banco de Dados

```bash
# Backup completo
docker-compose exec postgres pg_dump -U oursales_user oursales > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker-compose exec -T postgres psql -U oursales_user oursales < backup_20251008.sql
```

### Logs

```bash
# Ver logs em tempo real
docker-compose logs -f

# Logs da API
docker-compose logs -f api

# Logs do banco
docker-compose logs -f postgres
```

### Atualização do Sistema

```bash
# Pull das últimas mudanças
git pull

# Rebuild dos containers
docker-compose down
docker-compose up -d --build

# Executar migrations
docker-compose exec api npx prisma migrate deploy
```

### Limpeza

```bash
# Parar e remover containers
docker-compose down

# Remover volumes (⚠️ apaga dados!)
docker-compose down -v

# Limpar imagens antigas
docker system prune -a
```

## 📈 Roadmap

- [ ] Implementar GraphQL como alternativa REST
- [ ] Sistema de notificações em tempo real (WebSockets)
- [ ] Integração com gateways de pagamento
- [ ] App mobile (React Native)
- [ ] Integração com emissores de NF-e
- [ ] Sistema de comissões para vendedores
- [ ] BI integrado com dashboards avançados
- [ ] Integração com ERPs populares
- [ ] Multi-tenancy (SaaS)
- [ ] Internacionalização (i18n)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **OurSales Team** - _Desenvolvimento inicial_

## 📞 Suporte

- **Email**: suporte@oursales.com
- **Documentação**: [docs.oursales.com](http://docs.oursales.com)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/oursales/issues)

---

⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!
