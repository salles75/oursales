# 🚀 Guia de Integração - OurSales

## 📋 Visão Geral

O sistema OurSales agora está **totalmente integrado** com backend e frontend comunicando-se através de uma API RESTful. O sistema suporta dois modos de operação:

- **Modo Local (localStorage)**: Funciona offline, dados salvos no navegador
- **Modo API**: Conecta ao backend, dados persistidos no banco PostgreSQL

## 🏗️ Arquitetura Implementada

### Backend (Node.js + Express + Prisma)

- ✅ **Controllers implementados**:

  - `clientes.controller.js` - Gerenciamento completo de clientes PF/PJ
  - `produtos.controller.js` - Catálogo, estoque, movimentações
  - `orcamentos.controller.js` - Orçamentos com conversão para pedidos
  - `pedidos.controller.js` - Pedidos com controle de status e estoque
  - `transportadoras.controller.js` - Cadastro de transportadoras
  - `crm.controller.js` - Interações CRM e follow-ups

- ✅ **Funcionalidades**:
  - Autenticação JWT
  - Cache com Redis
  - Rate limiting
  - Validações robustas
  - Relacionamentos entre entidades
  - Auditoria de ações
  - Movimentação automática de estoque

### Frontend (Vanilla JS)

- ✅ **Cliente API** (`api.js`):

  - Funções para todos os endpoints
  - Gerenciamento de autenticação
  - Tratamento de erros
  - Timeout configurável

- ✅ **Storage Adapter** (`storage-adapter.js`):
  - Interface unificada para localStorage e API
  - Alternância transparente entre modos
  - Fallback automático

## 🔗 Integração Entre Módulos

### 1. Produtos → Orçamentos → Pedidos

```
Produto (catálogo)
    ↓ (seleção)
Orçamento (proposta)
    ↓ (conversão)
Pedido (confirmado)
    ↓ (aprovação)
Movimentação de Estoque
```

**Como funciona:**

1. Produtos são cadastrados com estoque inicial
2. Orçamentos incluem produtos com preços e quantidades
3. Ao converter orçamento em pedido, ele é vinculado
4. Ao aprovar pedido, estoque é baixado automaticamente
5. Movimentações são registradas em histórico

### 2. Clientes → Orçamentos/Pedidos → CRM

```
Cliente
    ↓
Orçamentos + Pedidos
    ↓
Interações CRM (histórico)
```

**Como funciona:**

1. Cliente é cadastrado (PF ou PJ)
2. Orçamentos e pedidos são vinculados ao cliente
3. Interações CRM registram comunicações
4. Histórico completo disponível na tela do cliente

### 3. Transportadoras → Orçamentos/Pedidos

```
Transportadora
    ↓ (seleção)
Orçamento/Pedido (com frete)
```

**Como funciona:**

1. Transportadoras cadastradas com dados de entrega
2. Ao criar orçamento/pedido, seleciona transportadora
3. Valor do frete é adicionado ao total
4. Rastreamento vinculado ao pedido

## 🚀 Como Usar

### Passo 1: Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações
nano .env

# Executar migrations do Prisma
npx prisma generate
npx prisma migrate dev

# Iniciar servidor
npm run dev
```

### Passo 2: Configurar Frontend

O frontend está pronto para uso! Basta servir os arquivos estáticos:

```bash
cd frontend

# Opção 1: Usar servidor simples Python
python3 -m http.server 8080

# Opção 2: Usar Node.js http-server
npx http-server -p 8080

# Opção 3: Usar extensão Live Server do VS Code
```

### Passo 3: Escolher Modo de Operação

#### Modo Local (localStorage)

Por padrão, o sistema usa localStorage. Nenhuma configuração adicional necessária.

#### Modo API

1. Abra o console do navegador (F12)
2. Execute:

```javascript
localStorage.setItem("oursales:mode", "api");
location.reload();
```

Ou adicione um botão na interface:

```html
<button onclick="alternarModo()">Alternar Modo</button>

<script>
  function alternarModo() {
    const modoAtual = localStorage.getItem("oursales:mode") || "local";
    const novoModo = modoAtual === "local" ? "api" : "local";
    localStorage.setItem("oursales:mode", novoModo);
    alert(`Modo alterado para: ${novoModo}`);
    location.reload();
  }
</script>
```

## 📝 Exemplos de Uso da API

### Autenticação

```javascript
// Login
const response = await api.auth.login("usuario@email.com", "senha123");
console.log("Token:", response.data.token);

// Obter perfil
const perfil = await api.auth.getProfile();
console.log("Usuário:", perfil.data);
```

### Criar Produto

```javascript
const produto = await api.produtos.criar({
  codigo: "PROD-001",
  nome: "Produto Teste",
  precoVenda: 100.0,
  precoCusto: 50.0,
  estoqueAtual: 100,
  estoqueMinimo: 10,
  unidadeMedida: "UN",
  ativo: true,
});
```

### Criar Orçamento

```javascript
const orcamento = await api.orcamentos.criar({
  clienteId: "uuid-do-cliente",
  dataValidade: "2025-12-31",
  itens: [
    {
      produtoId: "uuid-do-produto",
      quantidade: 10,
      precoUnitario: 100.0,
      descontoValor: 0,
    },
  ],
  condicaoPagamento: "30 dias",
  formaPagamento: "Boleto",
  transportadoraId: "uuid-da-transportadora",
  valorFrete: 50.0,
});
```

### Converter Orçamento em Pedido

```javascript
const pedido = await api.orcamentos.converterParaPedido(orcamento.data.id);
console.log("Pedido criado:", pedido.data.numero);
```

### Aprovar Pedido (Baixa Estoque Automaticamente)

```javascript
await api.pedidos.atualizarStatus(pedido.id, {
  status: "aprovado",
});
// Estoque é baixado automaticamente
```

### Registrar Interação CRM

```javascript
const interacao = await api.crm.criarInteracao({
  clienteId: "uuid-do-cliente",
  tipo: "ligacao",
  canal: "telefone",
  assunto: "Follow-up pós-venda",
  descricao: "Cliente satisfeito com o produto",
  resultado: "positivo",
  requerFollowup: false,
  sentimento: "positivo",
});
```

## 🔍 Verificar Integrações

### Teste 1: Produto → Orçamento → Pedido

```javascript
// 1. Criar produto
const prod = await api.produtos.criar({
  codigo: "TEST-001",
  nome: "Produto Teste",
  precoVenda: 100,
  estoqueAtual: 50,
});

// 2. Criar orçamento
const orc = await api.orcamentos.criar({
  clienteId: "id-cliente",
  dataValidade: "2025-12-31",
  itens: [
    {
      produtoId: prod.data.id,
      quantidade: 5,
      precoUnitario: 100,
    },
  ],
});

// 3. Converter em pedido
const ped = await api.orcamentos.converterParaPedido(orc.data.id);

// 4. Aprovar (baixa estoque)
await api.pedidos.atualizarStatus(ped.data.id, { status: "aprovado" });

// 5. Verificar estoque
const prodAtualizado = await api.produtos.buscar(prod.data.id);
console.log("Estoque final:", prodAtualizado.data.estoqueAtual); // 45
```

### Teste 2: Cliente → Pedidos → CRM

```javascript
// 1. Buscar cliente
const cliente = await api.clientes.buscar("id-cliente");

// 2. Ver pedidos do cliente
const pedidos = await api.clientes.obterPedidos("id-cliente");

// 3. Ver orçamentos do cliente
const orcamentos = await api.clientes.obterOrcamentos("id-cliente");

// 4. Ver histórico CRM
const historico = await api.clientes.obterHistorico("id-cliente");
```

## 🐛 Troubleshooting

### Backend não inicia

1. Verificar se PostgreSQL está rodando
2. Verificar se Redis está rodando
3. Verificar variáveis no `.env`
4. Executar migrations: `npx prisma migrate dev`

### Frontend não conecta à API

1. Verificar modo: `localStorage.getItem('oursales:mode')`
2. Verificar URL da API em `api.js` (padrão: `http://localhost:3000/api`)
3. Verificar CORS no backend
4. Abrir console (F12) para ver erros

### Erro de autenticação

1. Fazer login primeiro: `api.auth.login(email, senha)`
2. Token é salvo automaticamente no localStorage
3. Verificar token: `localStorage.getItem('oursales:token')`

## 📊 Status da Implementação

### ✅ Implementado

- [x] Controllers completos (Clientes, Produtos, Orçamentos, Pedidos, CRM, Transportadoras)
- [x] Rotas configuradas e funcionais
- [x] Cliente API JavaScript
- [x] Storage Adapter (suporta localStorage e API)
- [x] Integração Produto → Orçamento → Pedido
- [x] Conversão automática de orçamento em pedido
- [x] Baixa automática de estoque ao aprovar pedido
- [x] Histórico de movimentações de estoque
- [x] Relacionamento Cliente → Pedidos/Orçamentos → CRM
- [x] Validações de negócio
- [x] Cache com Redis
- [x] Rate limiting
- [x] Logs estruturados

### ⏳ Próximas Melhorias Sugeridas

- [ ] Interface de administração
- [ ] Relatórios e dashboards
- [ ] Notificações em tempo real (WebSocket)
- [ ] Exportação de dados (PDF, Excel)
- [ ] Integração com sistemas externos
- [ ] Módulo financeiro completo
- [ ] Gestão de usuários e permissões
- [ ] Auditoria de logs na interface

## 🎯 Conclusão

O sistema OurSales está **completamente funcional** e **integrado**! Todos os módulos se comunicam entre si:

- ✅ Produtos relacionam com orçamentos e pedidos
- ✅ Orçamentos convertem automaticamente em pedidos
- ✅ Pedidos baixam estoque automaticamente
- ✅ Clientes vinculam com orçamentos, pedidos e CRM
- ✅ Transportadoras integram com orçamentos e pedidos
- ✅ CRM registra interações vinculadas a clientes e negócios
- ✅ Frontend pode usar localStorage OU API backend

**Aproveite seu sistema de gestão comercial completo! 🚀**
