# 📁 Estrutura de Pastas - OurSales

Este documento descreve a organização de pastas e arquivos do projeto OurSales.

## 🗂️ Visão Geral

```
OurSales/
│
├── 📁 frontend/              # Interface do usuário (HTML, CSS, JS)
│   ├── 📁 assets/            # Recursos estáticos
│   │   ├── 📁 css/           # Folhas de estilo
│   │   │   └── style.css     # Estilos principais
│   │   └── 📁 js/            # Scripts JavaScript
│   │       └── app.js        # Lógica da aplicação
│   │
│   ├── index.html            # Página inicial (Dashboard)
│   ├── clientes.html         # Lista de clientes
│   ├── cliente-pf.html       # Formulário de cliente PF
│   ├── cliente-pj.html       # Formulário de cliente PJ
│   ├── produtos.html         # Lista de produtos
│   ├── produto-form.html     # Formulário de produtos
│   ├── orcamentos.html       # Lista de orçamentos
│   ├── orcamento-form.html   # Formulário de orçamentos
│   ├── pedidos.html          # Lista de pedidos
│   ├── pedido-form.html      # Formulário de pedidos
│   ├── crm.html              # CRM e interações
│   ├── transportadoras.html  # Transportadoras
│   └── configuracoes.html    # Configurações do sistema
│
├── 📁 backend/               # API Node.js
│   ├── 📁 src/
│   │   ├── 📁 config/        # Configurações (DB, Redis, Logger)
│   │   │   ├── database.js
│   │   │   ├── redis.js
│   │   │   └── logger.js
│   │   │
│   │   ├── 📁 controllers/   # Lógica de negócio
│   │   │   ├── auth.controller.js
│   │   │   └── clientes.controller.js
│   │   │
│   │   ├── 📁 middlewares/   # Middlewares Express
│   │   │   ├── auth.js       # Autenticação JWT
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   │
│   │   ├── 📁 routes/        # Definição de rotas
│   │   │   ├── auth.routes.js
│   │   │   ├── clientes.routes.js
│   │   │   ├── produtos.routes.js
│   │   │   ├── orcamentos.routes.js
│   │   │   ├── pedidos.routes.js
│   │   │   ├── crm.routes.js
│   │   │   ├── transportadoras.routes.js
│   │   │   ├── usuarios.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── relatorios.routes.js
│   │   │
│   │   └── server.js         # Ponto de entrada da API
│   │
│   ├── 📁 prisma/            # ORM Prisma
│   │   ├── schema.prisma     # Schema do banco
│   │   └── seed.js           # Dados iniciais
│   │
│   ├── 📁 uploads/           # Arquivos enviados pelos usuários
│   ├── Dockerfile            # Container da API
│   └── package.json          # Dependências Node.js
│
├── 📁 database/              # Scripts SQL
│   └── schema.sql            # Schema completo PostgreSQL (900+ linhas)
│
├── 📁 nginx/                 # Configuração do servidor web
│   └── nginx.conf            # Proxy reverso e cache
│
├── 📁 docs/                  # Documentação técnica
│   ├── ARQUITETURA.md        # Arquitetura detalhada do sistema
│   ├── ESTRUTURA_IMPLEMENTADA.md  # Status de implementação
│   ├── ESTRUTURA_PASTAS.md   # Este arquivo
│   ├── QUICK_START.md        # Guia de início rápido
│   ├── PRODUCTION_CHECKLIST.md    # Checklist para produção
│   ├── PEDIDOS_IMPLEMENTACAO.md   # Detalhes do módulo de pedidos
│   └── PRODUTOS_IMPLEMENTACAO.md  # Detalhes do módulo de produtos
│
├── docker-compose.yml        # Orquestração de containers
├── Makefile                  # Comandos facilitados
├── .gitignore               # Arquivos ignorados pelo Git
└── README.md                # Documentação principal

```

## 📂 Descrição das Pastas Principais

### `/frontend`

Contém toda a interface do usuário (UI) do sistema. Esta pasta é servida pelo Nginx como conteúdo estático.

**Características:**

- HTML puro (sem frameworks)
- CSS personalizado (style.css)
- JavaScript vanilla (app.js)
- Design responsivo e moderno

**Acesso:** http://localhost:8080

### `/backend`

API RESTful desenvolvida em Node.js com Express e Prisma ORM.

**Tecnologias:**

- Node.js 20+
- Express 4
- Prisma 5
- JWT para autenticação
- Winston para logs

**Acesso:** http://localhost:3000
**API Docs:** http://localhost:3000/api

### `/database`

Scripts SQL e configurações relacionadas ao banco de dados PostgreSQL.

**Conteúdo:**

- Schema completo do banco (CREATE TABLE, INDEXES, TRIGGERS)
- Scripts de migração
- Documentação do modelo de dados

### `/nginx`

Configurações do Nginx que atua como:

- Proxy reverso para a API
- Servidor de arquivos estáticos (frontend)
- Load balancer (suporte a múltiplas instâncias)
- Cache de conteúdo

### `/docs`

Documentação técnica completa do projeto.

**Documentos principais:**

- `ARQUITETURA.md`: Arquitetura técnica detalhada
- `QUICK_START.md`: Como iniciar o projeto rapidamente
- `PRODUCTION_CHECKLIST.md`: Lista de verificação para produção
- `ESTRUTURA_PASTAS.md`: Este documento

## 🔄 Fluxo de Requisições

```
┌─────────────────────────────────────────────────────────┐
│  1. Usuário acessa http://localhost:8080                │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  2. Nginx recebe a requisição                           │
│     - Se for /api/* → proxy para backend:3000           │
│     - Se for HTML/CSS/JS → serve de /frontend           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  3. Backend API processa (se for requisição /api/*)     │
│     - Autentica usuário (JWT)                           │
│     - Valida dados                                      │
│     - Acessa banco/cache                                │
│     - Retorna JSON                                      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  4. Dados persistidos em PostgreSQL ou Redis            │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Boas Práticas Aplicadas

### Separação de Responsabilidades

- **Frontend**: Apenas UI e interação com usuário
- **Backend**: Lógica de negócio e acesso a dados
- **Database**: Persistência e integridade de dados
- **Nginx**: Roteamento e otimização

### Estrutura em Camadas (Backend)

```
Routes → Middlewares → Controllers → Services → Database
```

### Arquivos Estáticos

- CSS e JS organizados em `/frontend/assets`
- Versionamento via cache-busting (quando necessário)
- Compressão gzip habilitada no Nginx

### Documentação

- Todos os documentos técnicos em `/docs`
- README.md na raiz para visão geral
- Comentários inline no código quando necessário

## 🚀 Comandos Úteis

### Desenvolvimento

```bash
# Ver estrutura de pastas
tree -L 3 -I 'node_modules|.git'

# Contar linhas de código
find . -name '*.js' -o -name '*.html' -o -name '*.css' | xargs wc -l

# Buscar em todos os arquivos
grep -r "termo_busca" ./frontend
```

### Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs do frontend (via nginx)
docker-compose logs -f nginx

# Ver logs do backend
docker-compose logs -f api
```

## 📊 Estatísticas do Projeto

| Categoria       | Quantidade | Descrição                       |
| --------------- | ---------- | ------------------------------- |
| **HTML**        | 13 páginas | Interface do usuário            |
| **Controllers** | 2 arquivos | Lógica de negócio               |
| **Routes**      | 10 rotas   | Endpoints da API                |
| **Middlewares** | 3 arquivos | Autenticação, erros, rate limit |
| **Documentos**  | 6 arquivos | Guias e referências técnicas    |
| **Tabelas DB**  | 13 tabelas | Modelo relacional completo      |

## 🔧 Manutenção

### Adicionar Nova Página HTML

1. Criar arquivo em `/frontend/nome-pagina.html`
2. Referenciar assets com paths relativos: `assets/css/style.css`
3. Adicionar link de navegação em outras páginas

### Adicionar Nova Rota na API

1. Criar controller em `/backend/src/controllers/`
2. Criar rota em `/backend/src/routes/`
3. Registrar rota em `server.js`
4. Documentar endpoint no README

### Adicionar Nova Documentação

1. Criar arquivo `.md` em `/docs/`
2. Seguir padrão de formatação existente
3. Adicionar referência no README principal

## 📝 Notas Importantes

- ⚠️ **Não commite** arquivos `.env`
- ⚠️ **Não altere** estrutura de pastas sem atualizar docker-compose.yml
- ✅ **Sempre documente** mudanças significativas
- ✅ **Mantenha** a separação entre frontend e backend
- ✅ **Use** paths relativos no frontend

## 🤝 Contribuindo

Ao adicionar novos arquivos ou módulos:

1. **Frontend**: Adicione em `/frontend/`
2. **Backend**: Adicione na pasta apropriada em `/backend/src/`
3. **Documentação**: Adicione em `/docs/`
4. **Scripts**: Adicione comandos no `Makefile`
5. **Docker**: Atualize `docker-compose.yml` se necessário

---

**Última atualização**: 09/10/2025  
**Versão**: 2.0.0  
**Status**: ✅ Estrutura organizada e otimizada




