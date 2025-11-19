# 🐳 Docker - Guia de Inicialização OurSales

## ✅ Verificações Realizadas

1. ✅ **Dockerfile corrigido** - Agora instala todas as dependências incluindo Prisma CLI
2. ✅ **Script de entrada criado** - `docker-entrypoint.sh` executa migrations automaticamente
3. ✅ **docker-compose.yml atualizado** - Removido atributo `version` obsoleto
4. ✅ **Sincronização verificada** - Todos os volumes e caminhos estão corretos

## 🚀 Como Rodar com Docker

### Opção 1: Início Rápido (Recomendado)

```bash
# Na raiz do projeto
cd /Users/macbook/Desktop/OurSales

# Subir todos os serviços
docker-compose up -d

# Ver logs do backend
docker-compose logs -f api

# Verificar status de todos os serviços
docker-compose ps
```

### Opção 2: Com Ferramentas de Desenvolvimento

```bash
# Subir com PgAdmin e Redis Commander
docker-compose --profile dev up -d

# Acessar:
# - Frontend: http://localhost:8080
# - API: http://localhost:3000
# - PgAdmin: http://localhost:5050
# - Redis Commander: http://localhost:8081
```

## 📋 O que acontece ao iniciar

1. **PostgreSQL** inicia e cria o banco `oursales`
2. **Redis** inicia para cache
3. **Backend API**:
   - Aguarda PostgreSQL e Redis estarem prontos
   - Gera Prisma Client (se necessário)
   - Executa migrations automaticamente (`prisma migrate deploy`)
   - Inicia o servidor na porta 3000
4. **Nginx** inicia e faz proxy reverso para a API

## 🔧 Verificar se está funcionando

```bash
# Health check da API
curl http://localhost:3000/health

# Deve retornar:
# {"status":"healthy","timestamp":"...","services":{"database":"connected","redis":"connected"}}
```

## 🗄️ Executar Migrations Manualmente

Se necessário executar migrations manualmente:

```bash
# Entrar no container da API
docker-compose exec api sh

# Executar migrations
npx prisma migrate deploy

# Gerar Prisma Client (se necessário)
npx prisma generate

# Sair do container
exit
```

## 📝 Criar Banco de Dados (se necessário)

O banco é criado automaticamente pelo PostgreSQL, mas se precisar criar manualmente:

```bash
# Entrar no container do PostgreSQL
docker-compose exec postgres psql -U oursales_user -d postgres

# Criar banco
CREATE DATABASE oursales;

# Sair
\q
```

## ⚠️ Problemas Comuns

### Erro: "Cannot connect to database"

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Erro: "Prisma Client not generated"

```bash
# Entrar no container e gerar
docker-compose exec api npx prisma generate
```

### Erro: "Port already in use"

```bash
# Verificar qual processo está usando a porta
lsof -i :3000
lsof -i :5432
lsof -i :6379
lsof -i :8080

# Parar containers existentes
docker-compose down

# Subir novamente
docker-compose up -d
```

## 🔄 Rebuild Completo

Se precisar reconstruir tudo do zero:

```bash
# Parar e remover containers
docker-compose down

# Remover volumes (⚠️ apaga dados!)
docker-compose down -v

# Rebuild das imagens
docker-compose build --no-cache

# Subir novamente
docker-compose up -d
```

## 📊 Monitoramento

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs apenas da API
docker-compose logs -f api

# Ver uso de recursos
docker stats

# Ver status dos serviços
docker-compose ps
```

## 🛑 Parar Serviços

```bash
# Parar todos os serviços
docker-compose stop

# Parar e remover containers (mantém volumes)
docker-compose down

# Parar e remover TUDO (incluindo volumes - ⚠️ apaga dados!)
docker-compose down -v
```

## ✅ Checklist de Sincronização

- [x] Dockerfile corrigido para instalar todas as dependências
- [x] Script de entrada criado (`docker-entrypoint.sh`)
- [x] docker-compose.yml atualizado (removido `version`)
- [x] Volumes configurados corretamente
- [x] Health checks configurados
- [x] Dependências entre serviços configuradas
- [x] Nginx configurado para proxy reverso
- [x] Frontend mapeado corretamente

## 🎯 Próximos Passos

1. Execute `docker-compose up -d`
2. Aguarde os serviços iniciarem (pode levar 1-2 minutos)
3. Verifique o health check: `curl http://localhost:3000/health`
4. Acesse o frontend: http://localhost:8080

Tudo está sincronizado e pronto para rodar! 🚀

