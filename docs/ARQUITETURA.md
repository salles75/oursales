# 🏗️ Arquitetura do Sistema OurSales

Documentação técnica detalhada da arquitetura e decisões de design do sistema.

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura de Banco de Dados](#arquitetura-de-banco-de-dados)
3. [Backend API](#backend-api)
4. [Cache e Performance](#cache-e-performance)
5. [Segurança](#segurança)
6. [Escalabilidade](#escalabilidade)
7. [Monitoramento](#monitoramento)

## 🎯 Visão Geral

### Princípios de Design

1. **Escalabilidade Horizontal**: Arquitetura stateless permite adicionar múltiplas instâncias
2. **Alta Disponibilidade**: Redundância em todos os níveis críticos
3. **Performance**: Cache agressivo, índices otimizados, queries eficientes
4. **Segurança**: Múltiplas camadas de proteção
5. **Manutenibilidade**: Código limpo, bem documentado e testado

### Stack Tecnológico

```
┌─────────────────────────────────────────────┐
│            CAMADA DE APRESENTAÇÃO           │
│  HTML5 + CSS3 + JavaScript (Vanilla)       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         CAMADA DE PROXY/BALANCEAMENTO       │
│  Nginx (Reverse Proxy + Static Files)      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            CAMADA DE APLICAÇÃO              │
│  Node.js 20 + Express 4 + Prisma 5         │
└─────────────────────────────────────────────┘
                    ↓
┌──────────────────────┬──────────────────────┐
│   CAMADA DE DADOS    │  CAMADA DE CACHE     │
│  PostgreSQL 16       │  Redis 7             │
└──────────────────────┴──────────────────────┘
```

## 🗄️ Arquitetura de Banco de Dados

### Modelo Relacional

O sistema utiliza PostgreSQL com um schema normalizado (3FN) para garantir integridade e performance.

#### Entidades Principais

1. **usuarios** - Autenticação e controle de acesso
2. **clientes** - Cadastro unificado (PF/PJ)
3. **transportadoras** - Parceiros logísticos
4. **categorias_produtos** - Hierarquia de categorias
5. **produtos** - Catálogo com estoque
6. **orcamentos** + **orcamentos_itens** - Propostas comerciais
7. **pedidos** + **pedidos_itens** - Pedidos confirmados
8. **crm_interacoes** - Histórico de relacionamento
9. **movimentos_estoque** - Rastreabilidade de estoque
10. **financeiro_contas_receber** - Controle financeiro
11. **auditoria** - Log de todas as operações

### Otimizações de Performance

#### 1. Índices Estratégicos

```sql
-- Índices em colunas de busca frequente
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
CREATE INDEX idx_clientes_cnpj ON clientes(cnpj);

-- Índices compostos para queries comuns
CREATE INDEX idx_pedidos_cliente_data ON pedidos(cliente_id, data_pedido DESC);

-- Índices GIN para full-text search
CREATE INDEX idx_clientes_nome_trgm ON clientes USING gin(nome_completo gin_trgm_ops);

-- Índices para arrays
CREATE INDEX idx_produtos_tags ON produtos USING gin(tags);
```

#### 2. Extensões PostgreSQL

```sql
-- UUID nativo
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search otimizado
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Índices compostos avançados
CREATE EXTENSION IF NOT EXISTS "btree_gin";
```

#### 3. Particionamento de Tabelas

Para tabelas com crescimento exponencial (auditoria, logs):

```sql
CREATE TABLE auditoria_particionada (
    ...
) PARTITION BY RANGE (criado_em);

-- Partições mensais
CREATE TABLE auditoria_2025_01 PARTITION OF auditoria_particionada
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

#### 4. Views Materializadas

Para relatórios complexos e dashboards:

```sql
CREATE MATERIALIZED VIEW vw_vendas_por_vendedor AS
SELECT
    vendedor_id,
    COUNT(*) as total_vendas,
    SUM(valor_total) as valor_total,
    AVG(valor_total) as ticket_medio
FROM pedidos
WHERE status != 'cancelado'
GROUP BY vendedor_id;

-- Refresh automático via CRON
REFRESH MATERIALIZED VIEW CONCURRENTLY vw_vendas_por_vendedor;
```

#### 5. Triggers Automáticos

```sql
-- Atualizar timestamp automaticamente
CREATE TRIGGER trigger_clientes_atualizado
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

-- Calcular totais automaticamente
CREATE TRIGGER trigger_atualizar_total_pedido
    AFTER INSERT OR UPDATE OR DELETE ON pedidos_itens
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_total_pedido();
```

### Constraints e Integridade

```sql
-- Check constraints
ALTER TABLE clientes ADD CONSTRAINT chk_cliente_documento CHECK (
    (tipo = 'PF' AND cpf IS NOT NULL) OR
    (tipo = 'PJ' AND cnpj IS NOT NULL)
);

-- Foreign keys com CASCADE apropriado
ALTER TABLE pedidos_itens
    ADD CONSTRAINT fk_pedido
    FOREIGN KEY (pedido_id)
    REFERENCES pedidos(id)
    ON DELETE CASCADE;
```

## 🔧 Backend API

### Arquitetura em Camadas

```
┌─────────────────────────────────────────┐
│            Routes Layer                 │
│  (Definição de endpoints)               │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Middlewares Layer               │
│  (Auth, Validation, Rate Limit)         │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Controllers Layer               │
│  (Lógica de negócio)                    │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│         Data Access Layer               │
│  (Prisma ORM)                           │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│            Database                     │
│  (PostgreSQL)                           │
└─────────────────────────────────────────┘
```

### Estrutura de Diretórios

```
backend/
├── src/
│   ├── config/           # Configurações (DB, Redis, Logger)
│   ├── controllers/      # Lógica de negócio
│   ├── routes/           # Definição de rotas
│   ├── middlewares/      # Middlewares (Auth, Error, etc)
│   ├── utils/            # Funções utilitárias
│   ├── validators/       # Validação de dados (Joi)
│   └── server.js         # Ponto de entrada
├── prisma/
│   ├── schema.prisma     # Schema do Prisma
│   └── migrations/       # Migrations do banco
├── logs/                 # Logs da aplicação
├── uploads/              # Arquivos enviados
└── package.json
```

### Middlewares

#### 1. Autenticação (JWT)

```javascript
// Verifica token JWT
// Cacheia usuário no Redis
// Adiciona req.user
export const authenticate = async (req, res, next) => {
  const token = extractToken(req);
  const decoded = jwt.verify(token, SECRET);
  req.user = await getUserFromCache(decoded.id);
  next();
};
```

#### 2. Autorização (RBAC)

```javascript
// Verifica perfil do usuário
export const authorize = (...perfis) => {
  return (req, res, next) => {
    if (!perfis.includes(req.user.perfil)) {
      throw new AppError("Sem permissão", 403);
    }
    next();
  };
};
```

#### 3. Rate Limiting

```javascript
// Redis-based rate limiting
// Limites por endpoint
// Headers informativos
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests
  standardHeaders: true,
});
```

#### 4. Error Handler

```javascript
// Tratamento centralizado de erros
// Logs estruturados
// Respostas padronizadas
export const errorHandler = (err, req, res, next) => {
  logger.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: { message: err.message },
  });
};
```

### Padrões de Código

#### 1. Async/Await Wrapper

```javascript
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

#### 2. Repository Pattern (via Prisma)

```javascript
// Abstração de acesso a dados
const clienteRepository = {
  findAll: (filters) => prisma.cliente.findMany(filters),
  findById: (id) => prisma.cliente.findUnique({ where: { id } }),
  create: (data) => prisma.cliente.create({ data }),
  update: (id, data) => prisma.cliente.update({ where: { id }, data }),
  delete: (id) => prisma.cliente.delete({ where: { id } }),
};
```

#### 3. Response Pattern

```javascript
// Padronização de respostas
const successResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
};
```

## 🚀 Cache e Performance

### Estratégia de Cache

#### 1. Cache de Queries

```javascript
// Cachear resultados de queries pesadas
const getCachedClientes = async (filters) => {
  const cacheKey = `clientes:list:${JSON.stringify(filters)}`;

  // Tentar buscar do cache
  let data = await cache.get(cacheKey);

  if (!data) {
    // Buscar do banco
    data = await prisma.cliente.findMany(filters);

    // Cachear por 5 minutos
    await cache.set(cacheKey, data, 300);
  }

  return data;
};
```

#### 2. Cache de Usuários

```javascript
// Cachear dados do usuário autenticado
// Evita query no banco a cada requisição
const getUserFromCache = async (userId) => {
  const cached = await cache.get(`user:${userId}`);

  if (cached) return cached;

  const user = await prisma.usuario.findUnique({
    where: { id: userId },
  });

  await cache.set(`user:${userId}`, user, 3600);

  return user;
};
```

#### 3. Invalidação de Cache

```javascript
// Invalidar cache quando dados mudam
const updateCliente = async (id, data) => {
  const cliente = await prisma.cliente.update({
    where: { id },
    data,
  });

  // Invalidar caches relacionados
  await cache.del(`cliente:${id}`);
  await cache.delPattern("clientes:list:*");
  await cache.delPattern("clientes:stats");

  return cliente;
};
```

### TTL (Time To Live) Recomendados

| Tipo de Dado        | TTL        | Motivo                                         |
| ------------------- | ---------- | ---------------------------------------------- |
| Usuário autenticado | 1 hora     | Dados mudam raramente                          |
| Lista de clientes   | 5 minutos  | Balanceamento entre consistência e performance |
| Estatísticas        | 10 minutos | Cálculos pesados, dados não críticos           |
| Produtos            | 15 minutos | Atualizam com frequência moderada              |
| Configurações       | 1 hora     | Raramente mudam                                |

## 🔒 Segurança

### Camadas de Segurança

```
┌────────────────────────────────────────────┐
│  1. Network Level                          │
│     - Firewall                             │
│     - VPC/Private Network                  │
└────────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────┐
│  2. Application Level                      │
│     - CORS                                 │
│     - Rate Limiting                        │
│     - Helmet (Security Headers)            │
└────────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────┐
│  3. Authentication                         │
│     - JWT Tokens                           │
│     - Token Blacklist                      │
└────────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────┐
│  4. Authorization                          │
│     - Role-Based Access Control (RBAC)     │
│     - Resource-level permissions           │
└────────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────┐
│  5. Data Level                             │
│     - Input Validation                     │
│     - SQL Injection Protection (Prisma)    │
│     - XSS Protection                       │
│     - Password Hashing (Bcrypt)            │
└────────────────────────────────────────────┘
```

### Autenticação JWT

```javascript
// Token contém apenas ID do usuário
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
  expiresIn: "7d",
});

// Dados completos vêm do cache/banco
const user = await getUserById(decoded.id);
```

### Auditoria

Todas as operações críticas são logadas:

```sql
INSERT INTO auditoria (
  tabela,
  registro_id,
  acao,
  usuario_id,
  dados_anteriores,
  dados_novos,
  ip_address
) VALUES (...);
```

## ⚡ Escalabilidade

### Escalonamento Horizontal

#### 1. API Stateless

- Sem sessão em memória
- JWT para autenticação
- Cache compartilhado (Redis)
- Pode adicionar N instâncias

#### 2. Load Balancing

```nginx
upstream api_backend {
    least_conn;
    server api1:3000 max_fails=3 fail_timeout=30s;
    server api2:3000 max_fails=3 fail_timeout=30s;
    server api3:3000 max_fails=3 fail_timeout=30s;
}
```

#### 3. Database Connection Pooling

```javascript
// Prisma gerencia pool automaticamente
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Connection string com pooling
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"
```

### Escalonamento Vertical

#### PostgreSQL

```sql
-- Aumentar shared_buffers (25% da RAM)
shared_buffers = 4GB

-- Work memory para queries complexas
work_mem = 50MB

-- Connections simultâneas
max_connections = 200

-- Effective cache (50-75% da RAM)
effective_cache_size = 12GB
```

#### Redis

```bash
# Memória máxima
maxmemory 2gb

# Política de evição
maxmemory-policy allkeys-lru
```

### Métricas de Capacidade

Com a configuração base, o sistema suporta:

- **Requisições**: ~1.000 req/s por instância
- **Conexões simultâneas**: ~200 conexões DB
- **Registros no banco**: Milhões (com particionamento)
- **Cache**: Até 2GB de dados em memória
- **Throughput**: ~100MB/s

## 📊 Monitoramento

### Logs Estruturados

```json
{
  "timestamp": "2025-10-08T10:30:00.000Z",
  "level": "info",
  "message": "HTTP Request",
  "method": "GET",
  "url": "/api/clientes",
  "status": 200,
  "responseTime": "45ms",
  "ip": "192.168.1.1",
  "userId": "uuid-here"
}
```

### Health Checks

```javascript
GET /health

Response:
{
  "status": "healthy",
  "uptime": 86400,
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Métricas Recomendadas

1. **Latência de requisições** (p50, p95, p99)
2. **Taxa de erros** (5xx)
3. **Uso de CPU/Memória**
4. **Conexões DB ativas**
5. **Hit rate do cache**
6. **Tamanho da fila de jobs**

---

**Versão**: 1.0.0  
**Última atualização**: 08/10/2025  
**Autor**: OurSales Team
