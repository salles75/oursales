# 🚀 Comandos para Rodar Todos os Dias

## ⚡ COMANDOS PRINCIPAIS

### 🔵 **Backend** (Terminal 1)

```bash
cd /Users/macbook/Desktop/OurSales/backend
npm run dev
```

### 🎨 **Frontend** (Terminal 2)

```bash
cd /Users/macbook/Desktop/OurSales/frontend
python3 -m http.server 8080
```

**Pronto! Sistema rodando! 🎉**

- Backend: http://localhost:3000
- Frontend: http://localhost:8080

---

## 📋 PRIMEIRA VEZ vs TODOS OS DIAS

### 🆕 **PRIMEIRA VEZ (setup inicial - fazer 1x apenas):**

```bash
cd /Users/macbook/Desktop/OurSales/backend
bash setup.sh        # Instala tudo e cria tabelas
npm run dev          # Inicia servidor
```

### 🔁 **TODOS OS DIAS (normal):**

```bash
cd /Users/macbook/Desktop/OurSales/backend
npm run dev          # Só isso! 🚀
```

**A diferença:**

- `setup.sh` → Só roda 1x (primeira vez)
- `npm run dev` → Roda todo dia!

---

## 🎯 PASSO A PASSO DIÁRIO

### 1️⃣ Abrir Terminal 1 (Backend)

```bash
cd /Users/macbook/Desktop/OurSales/backend
npm run dev
```

Vai mostrar:

```
╔═══════════════════════════════════════╗
║  🚀 Servidor iniciado com sucesso!   ║
║  📡 URL: http://0.0.0.0:3000        ║
╚═══════════════════════════════════════╝
```

✅ Deixe este terminal aberto e rodando!

### 2️⃣ Abrir Terminal 2 (Frontend)

```bash
cd /Users/macbook/Desktop/OurSales/frontend
python3 -m http.server 8080
```

Vai mostrar:

```
Serving HTTP on 0.0.0.0 port 8080...
```

✅ Deixe este terminal aberto também!

### 3️⃣ Abrir Navegador

```
http://localhost:8080
```

✅ Pronto! Está funcionando!

---

## ⚙️ CONFIGURAR MODO API (1x apenas)

Primeira vez que abrir o frontend:

1. Vá em: http://localhost:8080/configuracao-api.html
2. Clique em **"🟢 Modo API"**
3. Clique em **"Aplicar e Recarregar"**
4. Teste a conexão: **"Testar Conexão"** → ✅ Sucesso!

Depois disso, não precisa configurar mais nada!

---

## 🛑 PARAR O SISTEMA

### Parar Backend ou Frontend:

```bash
# No terminal que está rodando, pressione:
Ctrl + C
```

### Parar PostgreSQL (se quiser):

```bash
brew services stop postgresql@15
```

### Iniciar PostgreSQL de novo:

```bash
brew services start postgresql@15
```

---

## 🔄 COMANDOS ÚTEIS

### Ver se PostgreSQL está rodando:

```bash
brew services list | grep postgres
```

### Ver logs do backend em tempo real:

```bash
cd /Users/macbook/Desktop/OurSales/backend
tail -f logs/combined-*.log
```

### Abrir banco de dados visual:

```bash
cd /Users/macbook/Desktop/OurSales/backend
npx prisma studio
# Abre em: http://localhost:5555
```

### Testar se backend está OK:

```bash
curl http://localhost:3000/health
```

---

## 📝 CHECKLIST DIÁRIO

Antes de começar a trabalhar:

- [ ] PostgreSQL está rodando?

  ```bash
  brew services list | grep postgres
  ```

  Se não: `brew services start postgresql@15`

- [ ] Terminal 1: Backend rodando?

  ```bash
  cd backend && npm run dev
  ```

- [ ] Terminal 2: Frontend rodando?

  ```bash
  cd frontend && python3 -m http.server 8080
  ```

- [ ] Navegador aberto em: http://localhost:8080

✅ **Tudo OK! Pode trabalhar!**

---

## 🚨 PROBLEMAS COMUNS

### ❌ "Port 3000 already in use"

```bash
# Matar processo que está usando porta 3000:
lsof -ti:3000 | xargs kill -9

# Rodar de novo:
npm run dev
```

### ❌ "Port 8080 already in use"

```bash
# Matar processo da porta 8080:
lsof -ti:8080 | xargs kill -9

# Rodar de novo:
python3 -m http.server 8080
```

### ❌ "PostgreSQL connection refused"

```bash
# Iniciar PostgreSQL:
brew services start postgresql@15

# Verificar se iniciou:
brew services list | grep postgres
```

### ❌ Backend iniciou mas não conecta no banco

```bash
# Ver arquivo .env:
cat backend/.env | grep DATABASE_URL

# Deve mostrar:
# DATABASE_URL=postgresql://macbook@localhost:5432/oursales

# Testar conexão:
psql oursales -c "SELECT 1"
```

---

## 💡 DICAS PRO

### 1. Criar aliases no terminal (facilita muito!)

Adicione no seu `~/.zshrc`:

```bash
# Adicionar ao final do arquivo:
alias ours-backend='cd /Users/macbook/Desktop/OurSales/backend && npm run dev'
alias ours-frontend='cd /Users/macbook/Desktop/OurSales/frontend && python3 -m http.server 8080'
alias ours-studio='cd /Users/macbook/Desktop/OurSales/backend && npx prisma studio'
```

Depois, recarregue:

```bash
source ~/.zshrc
```

Agora pode usar:

```bash
ours-backend    # Inicia backend
ours-frontend   # Inicia frontend
ours-studio     # Abre banco visual
```

### 2. Abrir tudo de uma vez (avançado)

Crie um script `start.sh` na raiz:

```bash
#!/bin/bash
echo "🚀 Iniciando OurSales..."

# Abrir nova aba/janela e rodar backend
osascript -e 'tell app "Terminal" to do script "cd /Users/macbook/Desktop/OurSales/backend && npm run dev"'

# Esperar 3 segundos
sleep 3

# Abrir nova aba/janela e rodar frontend
osascript -e 'tell app "Terminal" to do script "cd /Users/macbook/Desktop/OurSales/frontend && python3 -m http.server 8080"'

# Abrir navegador
sleep 2
open http://localhost:8080

echo "✅ OurSales iniciado!"
```

Dar permissão:

```bash
chmod +x start.sh
```

Usar:

```bash
./start.sh
```

---

## 📊 RESUMO VISUAL

```
┌─────────────────────────────────────────┐
│  TERMINAL 1 (Backend)                   │
│  $ cd backend                           │
│  $ npm run dev                          │
│  ✅ http://localhost:3000               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  TERMINAL 2 (Frontend)                  │
│  $ cd frontend                          │
│  $ python3 -m http.server 8080         │
│  ✅ http://localhost:8080               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  NAVEGADOR                              │
│  🌐 http://localhost:8080               │
│  ✅ Sistema funcionando!                │
└─────────────────────────────────────────┘
```

---

## 🎯 CONCLUSÃO

### **Comandos do dia a dia:**

```bash
# Terminal 1:
cd /Users/macbook/Desktop/OurSales/backend && npm run dev

# Terminal 2:
cd /Users/macbook/Desktop/OurSales/frontend && python3 -m http.server 8080

# Navegador:
http://localhost:8080
```

**É só isso! Simples assim! 🚀**

---

## 📞 PRECISA DE AJUDA?

1. Ver logs: `tail -f backend/logs/combined-*.log`
2. Testar backend: `curl http://localhost:3000/health`
3. Ver banco: `npx prisma studio` (na pasta backend)
4. Reiniciar PostgreSQL: `brew services restart postgresql@15`

**Dúvidas?** Consulte os outros guias:

- `COMO_RODAR.md` - Guia completo
- `POSTGRES_PRONTO.md` - Infos do PostgreSQL
- `SETUP_COMPLETO.md` - Setup detalhado

**Salve este arquivo nos favoritos! 📌**



