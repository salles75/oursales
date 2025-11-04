# 🚀 Guia de Início Rápido - OurSales

## ⚡ Setup em 5 Minutos

### 1. Pré-requisitos

Certifique-se de ter instalado:

- ✅ Docker (v24.0+)
- ✅ Docker Compose (v2.20+)

### 2. Clone e Configure

```bash
# Clone o repositório
cd OurSales

# Copie o arquivo de ambiente
cp backend/.env.example backend/.env

# (Opcional) Edite variáveis sensíveis
# Pelo menos altere JWT_SECRET para produção!
nano backend/.env
```

### 3. Inicie o Sistema

```bash
# Suba todos os serviços
docker-compose up -d

# Aguarde ~30 segundos para inicialização
# Verifique os logs
docker-compose logs -f api
```

### 4. Inicialize o Banco

```bash
# Entre no container da API
docker-compose exec api sh

# Execute as migrations
npx prisma migrate deploy

# Saia do container
exit
```

### 5. Acesse o Sistema

✅ **Frontend**: http://localhost:8080  
✅ **API**: http://localhost:3000  
✅ **Health Check**: http://localhost:3000/health

### 6. Teste a API

```bash
# Registrar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Admin",
    "email": "admin@oursales.com",
    "senha": "admin123",
    "perfil": "admin"
  }'

# Login (copie o token retornado)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@oursales.com",
    "senha": "admin123"
  }'

# Testar autenticação (use o token acima)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🎯 Próximos Passos

### Para Desenvolvimento

```bash
# Iniciar com ferramentas de dev (PgAdmin, Redis Commander)
docker-compose --profile dev up -d

# PgAdmin: http://localhost:5050
# Redis Commander: http://localhost:8081
```

### Para Produção

1. **Altere todas as senhas**:

   - `JWT_SECRET` no `.env`
   - `DB_PASSWORD` no `.env` e `docker-compose.yml`
   - `PGADMIN_PASSWORD` no `docker-compose.yml`

2. **Configure HTTPS** no Nginx

3. **Ajuste limites de recursos** no `docker-compose.yml`

4. **Configure backups automáticos**:

```bash
# Adicione ao crontab
0 2 * * * docker-compose exec postgres pg_dump -U oursales_user oursales > /backups/oursales_$(date +\%Y\%m\%d).sql
```

## 🐛 Troubleshooting

### Porta já em uso

```bash
# Altere as portas no docker-compose.yml
ports:
  - "8081:80"  # Nginx
  - "3001:3000"  # API
  - "5433:5432"  # Postgres
```

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs api
docker-compose logs postgres

# Rebuild forçado
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Erro de conexão com banco

```bash
# Verifique se o Postgres está rodando
docker-compose ps

# Teste conexão manual
docker-compose exec postgres psql -U oursales_user -d oursales -c "SELECT 1"
```

### Limpar tudo e recomeçar

```bash
# ⚠️ ATENÇÃO: Apaga todos os dados!
docker-compose down -v
docker-compose up -d
```

## 📚 Documentação Completa

- 📖 **README.md** - Documentação geral
- 🏗️ **ARQUITETURA.md** - Arquitetura técnica detalhada
- 📡 **API Endpoints** - Ver seção API no README.md

## 💡 Dicas Úteis

### Comandos Docker Frequentes

```bash
# Ver logs em tempo real
docker-compose logs -f

# Parar serviços
docker-compose stop

# Reiniciar serviços
docker-compose restart api

# Verificar uso de recursos
docker stats

# Limpar imagens antigas
docker system prune -a
```

### Comandos Prisma

```bash
# Gerar client
npx prisma generate

# Criar nova migration
npx prisma migrate dev --name descricao_mudanca

# Abrir Prisma Studio (UI visual)
npx prisma studio
```

### Verificar Performance

```bash
# Latência da API
time curl http://localhost:3000/health

# Status do Redis
docker-compose exec redis redis-cli INFO stats

# Conexões ativas no Postgres
docker-compose exec postgres psql -U oursales_user -d oursales -c "
  SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
"
```

## 🆘 Precisa de Ajuda?

- 📧 Email: suporte@oursales.com
- 💬 GitHub Issues: [Criar issue](https://github.com/seu-usuario/oursales/issues)
- 📖 Docs: Ver README.md e ARQUITETURA.md

---

✨ **Dica**: Marque este arquivo como favorito para referência rápida!
