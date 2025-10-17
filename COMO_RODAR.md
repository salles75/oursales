# 🚀 Como Rodar o OurSales - GUIA DEFINITIVO

## ⚡ SUPER RÁPIDO (2 minutos)

```bash
# 1. Entrar na pasta backend
cd /Users/macbook/Desktop/OurSales/backend

# 2. Rodar setup automático (faz tudo pra você!)
bash setup.sh

# 3. Iniciar servidor
npm run dev
```

✅ **Pronto! Backend rodando!**

---

## 📋 O que o script setup.sh faz automaticamente:

1. ✅ Instala todas as dependências (npm install)
2. ✅ Gera o cliente Prisma
3. ✅ Cria as tabelas no banco (migrations)
4. ✅ (Opcional) Popula com dados de teste

---

## 🎯 Pré-requisitos (IMPORTANTE!)

Antes de rodar o setup, você precisa:

### 1. **Node.js instalado**

```bash
node --version
# Deve mostrar v18 ou superior
```

Se não tiver:

```bash
# macOS:
brew install node

# Ou baixe: https://nodejs.org/
```

### 2. **PostgreSQL instalado e RODANDO**

```bash
# Verificar se está instalado:
psql --version

# Verificar se está rodando:
psql -U postgres -c "SELECT 1"
```

**Se não tiver PostgreSQL:**

**macOS:**

```bash
# Instalar
brew install postgresql@15

# Iniciar
brew services start postgresql@15

# Criar banco
createdb oursales
```

**Ubuntu/Linux:**

```bash
# Instalar
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar
sudo systemctl start postgresql

# Criar banco
sudo -u postgres createdb oursales
```

**Windows:**

- Download: https://www.postgresql.org/download/windows/
- Instalar e criar banco "oursales"

### 3. **Redis (OPCIONAL mas recomendado)**

```bash
# macOS:
brew install redis
brew services start redis

# Ubuntu:
sudo apt install redis-server
sudo systemctl start redis

# Testar:
redis-cli ping
# Deve retornar: PONG
```

---

## 🚀 PASSO A PASSO COMPLETO

### Etapa 1: Preparar o Ambiente

```bash
# Abrir terminal e ir para a pasta do projeto
cd /Users/macbook/Desktop/OurSales/backend

# Verificar se arquivo .env existe
ls -la .env

# Se existir, está pronto! Se não, foi criado automaticamente.
```

### Etapa 2: Ajustar .env (se necessário)

Abra o arquivo `.env` e ajuste APENAS se suas configurações forem diferentes:

```bash
# Abrir com editor
nano .env

# OU
code .env

# Ajustar linha do banco SE seu usuário/senha for diferente:
DATABASE_URL=postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/oursales

# Exemplo padrão (já está configurado):
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/oursales
```

### Etapa 3: Rodar Setup Automático

```bash
# Dar permissão de execução (se necessário)
chmod +x setup.sh

# Executar setup
bash setup.sh
```

O script vai perguntar:

1. **PostgreSQL está rodando?** → Digite: `s`
2. **Criar dados de exemplo?** → Digite: `s` (recomendado)

### Etapa 4: Iniciar Servidor

```bash
npm run dev
```

Você verá:

```
╔═══════════════════════════════════════════════════╗
║           OurSales Backend API                    ║
║  🚀 Servidor iniciado com sucesso!               ║
║  📡 URL: http://0.0.0.0:3000                     ║
╚═══════════════════════════════════════════════════╝
```

### Etapa 5: Testar

```bash
# Em outro terminal:
curl http://localhost:3000/health

# Deve retornar:
# {"status":"healthy", ...}
```

---

## 🎨 Iniciar o Frontend

```bash
# Em OUTRO terminal (deixe o backend rodando!)
cd /Users/macbook/Desktop/OurSales/frontend

# Opção 1: Python
python3 -m http.server 8080

# Opção 2: Node
npx http-server -p 8080
```

**Abrir no navegador:** http://localhost:8080

---

## ⚙️ Configurar Frontend para usar o Backend

1. Abra: http://localhost:8080/configuracao-api.html
2. Clique em **"🟢 Modo API"**
3. Clique em **"Aplicar e Recarregar"**
4. Clique em **"Testar Conexão"**
5. Deve aparecer: ✅ **Conexão bem-sucedida!**

---

## 🐛 Problemas? Soluções Rápidas!

### ❌ "PostgreSQL connection refused"

```bash
# Verificar se está rodando:
# macOS:
brew services list | grep postgres

# Se não estiver rodando:
brew services start postgresql@15

# Ubuntu:
sudo systemctl status postgresql

# Se não estiver rodando:
sudo systemctl start postgresql
```

### ❌ "Database does not exist"

```bash
# Criar banco:
createdb oursales

# OU via psql:
psql -U postgres -c "CREATE DATABASE oursales;"
```

### ❌ "Port 3000 already in use"

```bash
# Matar processo na porta 3000:
lsof -ti:3000 | xargs kill -9

# OU mudar porta no .env:
PORT=3001
```

### ❌ "Cannot find module"

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Prisma Client did not initialize yet"

```bash
cd backend
npx prisma generate
```

---

## 📊 Comandos Úteis

```bash
# Ver logs do servidor
tail -f logs/combined-*.log

# Ver apenas erros
tail -f logs/error-*.log

# Abrir interface do banco (Prisma Studio)
npx prisma studio
# Abre em: http://localhost:5555

# Parar servidor
# Pressione: Ctrl + C

# Reiniciar servidor
npm run dev
```

---

## 🎯 Status Final

Após seguir os passos, você terá:

✅ Backend rodando em `http://localhost:3000`
✅ Frontend rodando em `http://localhost:8080`
✅ Banco de dados configurado
✅ Sistema 100% funcional!

---

## 🧪 Testar Integrações

Abra o console do navegador (F12) e cole:

```javascript
// Criar produto
const prod = await fetch("http://localhost:3000/api/produtos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    codigo: "TEST-001",
    nome: "Produto Teste",
    precoVenda: 100,
    estoqueAtual: 50,
  }),
});
console.log(await prod.json());
```

---

## 💡 Dicas Extras

1. **Deixe o backend sempre rodando** enquanto desenvolve
2. **Use Prisma Studio** para ver/editar dados: `npx prisma studio`
3. **Veja os logs** em tempo real: `tail -f logs/combined-*.log`
4. **Modo automático**: O servidor recarrega sozinho quando você edita arquivos

---

## 🎉 TUDO FUNCIONANDO!

Agora você pode:

✅ Cadastrar clientes
✅ Adicionar produtos
✅ Criar orçamentos
✅ Converter orçamentos em pedidos
✅ Ver estoque baixar automaticamente
✅ Registrar interações no CRM

**Divirta-se com seu sistema completo! 🚀**

---

## 📚 Documentação Completa

- `SETUP_COMPLETO.md` - Guia detalhado
- `INICIO_RAPIDO.md` - Quick start
- `GUIA_INTEGRACAO.md` - Como tudo funciona
- `IMPLEMENTACAO_COMPLETA.md` - O que foi implementado

**Dúvidas?** Todos os comandos estão documentados! 📖
