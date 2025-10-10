# 🚀 Setup Completo - OurSales Backend

## ⚡ Configuração Rápida (3 comandos)

```bash
# 1. Entrar na pasta backend
cd backend

# 2. Rodar setup automático
bash setup.sh

# 3. Iniciar servidor
npm run dev
```

**Pronto! Backend rodando em `http://localhost:3000` 🎉**

---

## 📋 Passo a Passo Detalhado

### Pré-requisitos

Antes de começar, você precisa ter instalado:

#### ✅ **Node.js** (v18 ou superior)
```bash
# Verificar se está instalado
node --version

# Se não tiver, instale:
# macOS: brew install node
# Ubuntu: sudo apt install nodejs npm
# Windows: https://nodejs.org/
```

#### ✅ **PostgreSQL** (v14 ou superior)
```bash
# Verificar se está instalado
psql --version

# macOS: Instalar
brew install postgresql@15
brew services start postgresql@15

# Ubuntu: Instalar
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows: 
# Download: https://www.postgresql.org/download/windows/
```

#### ✅ **Redis** (opcional, mas recomendado)
```bash
# Verificar se está instalado
redis-cli --version

# macOS: Instalar
brew install redis
brew services start redis

# Ubuntu: Instalar
sudo apt install redis-server
sudo systemctl start redis

# Windows:
# Download: https://github.com/microsoftarchive/redis/releases
```

---

## 🔧 Configuração Manual (Se o script não funcionar)

### 1️⃣ Instalar Dependências

```bash
cd backend
npm install
```

### 2️⃣ Configurar Banco de Dados

#### A. Criar banco de dados PostgreSQL

```bash
# Entrar no PostgreSQL
psql -U postgres

# Dentro do psql, executar:
CREATE DATABASE oursales;
\q
```

#### B. Configurar arquivo .env

O arquivo `.env` já está criado! Ajuste apenas se necessário:

```bash
# Abrir para editar
nano .env

# Ajustar linha do DATABASE_URL se necessário:
DATABASE_URL=postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/oursales

# Exemplo padrão (funciona na maioria dos casos):
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/oursales
```

### 3️⃣ Executar Migrations

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrations (cria as tabelas)
npx prisma migrate dev --name init
```

### 4️⃣ (Opcional) Popular com Dados de Exemplo

```bash
# Se existir arquivo seed.js
npm run seed
```

### 5️⃣ Iniciar Servidor

```bash
npm run dev
```

Você verá algo assim:

```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║           OurSales Backend API                    ║
║         Sistema de Gestão Comercial               ║
║                                                   ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  🚀 Servidor iniciado com sucesso!               ║
║  📡 URL: http://0.0.0.0:3000                     ║
║  🌍 Ambiente: development                         ║
║  📊 Health: http://0.0.0.0:3000/health           ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

---

## 🧪 Testar se está funcionando

### Teste 1: Health Check

```bash
curl http://localhost:3000/health
```

Deve retornar:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-10T...",
  "uptime": 1.234,
  "environment": "development",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Teste 2: Criar Usuário (para fazer login depois)

```bash
# Abrir Prisma Studio
npx prisma studio

# Vai abrir no navegador: http://localhost:5555
# Crie um usuário na tabela 'usuarios'
```

Ou usar SQL direto:

```bash
psql -U postgres oursales

INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES
('Admin', 'admin@oursales.com', '$2b$10$YourHashedPasswordHere', 'admin', true);
```

---

## 🐛 Resolução de Problemas

### ❌ Erro: "Cannot find module"

```bash
# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### ❌ Erro: "PostgreSQL connection refused"

```bash
# Verificar se PostgreSQL está rodando
# macOS:
brew services list
brew services start postgresql@15

# Ubuntu:
sudo systemctl status postgresql
sudo systemctl start postgresql

# Testar conexão:
psql -U postgres -c "SELECT 1"
```

### ❌ Erro: "Database does not exist"

```bash
# Criar banco de dados
createdb oursales

# Ou via psql:
psql -U postgres -c "CREATE DATABASE oursales;"
```

### ❌ Erro: "Redis connection failed"

Redis é opcional para desenvolvimento. Se quiser usar:

```bash
# macOS:
brew services start redis

# Ubuntu:
sudo systemctl start redis

# Testar:
redis-cli ping
# Deve retornar: PONG
```

Se não quiser usar Redis, comente as linhas de Redis no código.

### ❌ Erro: "Port 3000 already in use"

```bash
# Encontrar processo usando porta 3000
lsof -ti:3000

# Matar processo
kill -9 $(lsof -ti:3000)

# Ou mudar porta no .env:
PORT=3001
```

### ❌ Erro: "Prisma migrate failed"

```bash
# Reset completo do banco (CUIDADO: Apaga tudo!)
npx prisma migrate reset

# Ou apenas executar novamente
npx prisma migrate dev
```

---

## 📚 Comandos Úteis

```bash
# Iniciar servidor em desenvolvimento
npm run dev

# Iniciar servidor em produção
npm start

# Ver logs
tail -f logs/combined-*.log

# Abrir Prisma Studio (interface visual do banco)
npx prisma studio

# Formatar código Prisma
npx prisma format

# Gerar novo cliente Prisma após mudanças no schema
npx prisma generate

# Ver status das migrations
npx prisma migrate status

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Reset completo do banco (apaga tudo)
npx prisma migrate reset
```

---

## 🎯 Próximos Passos Após Backend Rodando

1. ✅ **Abrir frontend**
   ```bash
   cd frontend
   python3 -m http.server 8080
   ```

2. ✅ **Configurar modo API**
   - Abra: `http://localhost:8080/configuracao-api.html`
   - Clique em "Modo API"
   - Clique em "Testar Conexão" para verificar

3. ✅ **Criar primeiro usuário**
   - Use Prisma Studio: `npx prisma studio`
   - Ou pela API depois que estiver rodando

4. ✅ **Testar integrações**
   - Abra console (F12)
   - Cole o script de `TESTE_INTEGRACAO.js`
   - Veja a mágica acontecer!

---

## 💡 Dicas

### Desenvolvimento com Auto-reload

O servidor usa `nodemon` e recarrega automaticamente quando você salva arquivos.

### Ver logs em tempo real

```bash
# Em outro terminal
tail -f logs/combined-*.log

# Ou apenas erros
tail -f logs/error-*.log
```

### Backup do banco

```bash
# Fazer backup
pg_dump -U postgres oursales > backup.sql

# Restaurar backup
psql -U postgres oursales < backup.sql
```

### Limpar cache Redis

```bash
redis-cli FLUSHALL
```

---

## 🎉 Tudo Pronto!

Agora você tem:

✅ Backend rodando em `http://localhost:3000`
✅ Banco de dados configurado
✅ Redis funcionando (se instalou)
✅ Migrations aplicadas
✅ Pronto para receber requisições!

**Próximo passo:** Iniciar o frontend e começar a usar! 🚀

```bash
# Em outro terminal
cd frontend
python3 -m http.server 8080

# Abrir no navegador
open http://localhost:8080
```

---

## 📞 Precisa de Ajuda?

1. Verifique os logs: `logs/error-*.log`
2. Teste health check: `curl http://localhost:3000/health`
3. Verifique se PostgreSQL está rodando: `pg_isready`
4. Verifique se Redis está rodando: `redis-cli ping`

**Dúvidas?** Consulte os outros arquivos de documentação:
- `INICIO_RAPIDO.md`
- `GUIA_INTEGRACAO.md`
- `IMPLEMENTACAO_COMPLETA.md`

