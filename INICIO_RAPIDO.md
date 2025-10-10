# 🚀 Início Rápido - OurSales

## ⚡ 3 Passos para Começar

### 1️⃣ Configurar e Iniciar Backend

```bash
# Navegar para a pasta do backend
cd backend

# Instalar dependências
npm install

# Configurar banco de dados
# Copie o arquivo ENV_EXAMPLE.txt da raiz para backend/.env
# Edite o .env com suas configurações do PostgreSQL e Redis

# Executar migrations
npx prisma generate
npx prisma migrate dev

# Criar usuário admin (opcional - seed)
npx prisma db seed

# Iniciar servidor
npm run dev

# ✅ Backend rodando em http://localhost:3000
```

### 2️⃣ Iniciar Frontend

```bash
# Em outro terminal, navegar para a pasta frontend
cd frontend

# Opção A: Python
python3 -m http.server 8080

# Opção B: Node.js
npx http-server -p 8080

# ✅ Frontend rodando em http://localhost:8080
```

### 3️⃣ Configurar Modo de Operação

Abra o navegador em `http://localhost:8080` e acesse:

**Configuração API**: `http://localhost:8080/configuracao-api.html`

Escolha o modo:

- **🔵 Modo Local**: Dados no navegador (localStorage) - Funciona offline
- **🟢 Modo API**: Dados no servidor (PostgreSQL) - Produção

## 🧪 Testar Sistema

### Opção 1: Via Interface

1. Abra `http://localhost:8080`
2. Navegue pelas páginas
3. Crie clientes, produtos, orçamentos, pedidos

### Opção 2: Via Script de Teste

1. Abra o console do navegador (F12)
2. Copie e cole o conteúdo do arquivo `TESTE_INTEGRACAO.js`
3. Pressione Enter
4. Veja o teste completo executar automaticamente!

## 📋 Checklist de Verificação

### Backend

- [ ] PostgreSQL instalado e rodando
- [ ] Redis instalado e rodando
- [ ] Arquivo `.env` configurado
- [ ] Migrations executadas
- [ ] Servidor iniciado na porta 3000
- [ ] Health check OK: `http://localhost:3000/health`

### Frontend

- [ ] Servidor HTTP rodando na porta 8080
- [ ] Página inicial carrega: `http://localhost:8080`
- [ ] Modo selecionado (local ou API)

### Integração

- [ ] Health check retorna status: healthy
- [ ] Login funciona (se usando modo API)
- [ ] Pode criar cliente
- [ ] Pode criar produto
- [ ] Pode criar orçamento
- [ ] Pode converter orçamento em pedido
- [ ] Estoque é baixado ao aprovar pedido

## 🎯 Próximos Passos

1. **Criar usuário admin** (se não criou via seed):

```bash
cd backend
npx prisma studio
# Ou criar via API
```

2. **Explorar funcionalidades**:

   - Cadastrar clientes (PF e PJ)
   - Adicionar produtos ao catálogo
   - Criar orçamentos com múltiplos produtos
   - Converter orçamentos em pedidos
   - Aprovar pedidos (veja estoque baixar!)
   - Registrar interações no CRM

3. **Testar integrações**:
   - Produto → Orçamento → Pedido → Estoque
   - Cliente → Pedidos → CRM
   - Transportadora → Orçamentos/Pedidos

## 🆘 Problemas Comuns

### Backend não inicia

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql
# ou
brew services list

# Verificar se Redis está rodando
redis-cli ping
# Deve retornar: PONG

# Verificar logs
tail -f backend/logs/combined-*.log
```

### Frontend não conecta à API

1. Verifique se backend está rodando: `http://localhost:3000/health`
2. Verifique modo: Console → `localStorage.getItem('oursales:mode')`
3. Altere para API: Console → `localStorage.setItem('oursales:mode', 'api')`
4. Recarregue a página

### Erro de CORS

- Verifique o arquivo `.env`: `CORS_ORIGIN=http://localhost:8080`
- Reinicie o backend

### Erro de autenticação

```javascript
// No console do navegador:
await api.auth.login("admin@oursales.com", "sua_senha");
// Token é salvo automaticamente
```

## 📚 Documentação Completa

- **Guia de Integração**: `GUIA_INTEGRACAO.md`
- **Resumo Implementação**: `RESUMO_IMPLEMENTACAO.md`
- **Configuração ENV**: `ENV_EXAMPLE.txt`
- **Script de Teste**: `TESTE_INTEGRACAO.js`

## 🎉 Pronto!

Seu sistema OurSales está configurado e funcionando!

Aproveite todos os recursos:
✅ Gestão de Clientes (PF e PJ)
✅ Catálogo de Produtos com Estoque
✅ Orçamentos Profissionais
✅ Pedidos com Workflow Completo
✅ CRM Integrado
✅ Transportadoras
✅ Relatórios e Dashboards

**Dúvidas?** Consulte os arquivos de documentação na raiz do projeto.

**Boas vendas! 🚀💰**
