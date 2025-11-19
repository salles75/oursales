# Makefile para OurSales
# Facilita comandos comuns do projeto

.PHONY: help up down restart logs build clean migrate seed backup restore

# Cores para output
GREEN=\033[0;32m
YELLOW=\033[0;33m
RED=\033[0;31m
NC=\033[0m # No Color

help: ## Mostra esta ajuda
	@echo "$(GREEN)OurSales - Comandos Disponíveis$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ==========================================
# Docker Commands
# ==========================================

up: ## Iniciar todos os serviços
	@echo "$(GREEN)Iniciando serviços...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Serviços iniciados!$(NC)"
	@echo "Frontend: http://localhost:8080"
	@echo "API: http://localhost:3000"

up-dev: ## Iniciar com ferramentas de desenvolvimento
	@echo "$(GREEN)Iniciando serviços em modo DEV...$(NC)"
	docker-compose --profile dev up -d
	@echo "$(GREEN)✓ Serviços iniciados!$(NC)"
	@echo "Frontend: http://localhost:8080"
	@echo "API: http://localhost:3000"
	@echo "PgAdmin: http://localhost:5050"
	@echo "Redis Commander: http://localhost:8081"

down: ## Parar todos os serviços
	@echo "$(YELLOW)Parando serviços...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Serviços parados!$(NC)"

down-volumes: ## Parar e remover volumes (⚠️ apaga dados!)
	@echo "$(RED)⚠️  ATENÇÃO: Isso irá apagar todos os dados!$(NC)"
	@read -p "Tem certeza? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "$(GREEN)✓ Serviços e volumes removidos!$(NC)"; \
	fi

restart: ## Reiniciar todos os serviços
	@echo "$(YELLOW)Reiniciando serviços...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ Serviços reiniciados!$(NC)"

restart-api: ## Reiniciar apenas a API
	@echo "$(YELLOW)Reiniciando API...$(NC)"
	docker-compose restart api
	@echo "$(GREEN)✓ API reiniciada!$(NC)"

logs: ## Ver logs de todos os serviços
	docker-compose logs -f

logs-api: ## Ver logs da API
	docker-compose logs -f api

logs-postgres: ## Ver logs do PostgreSQL
	docker-compose logs -f postgres

logs-redis: ## Ver logs do Redis
	docker-compose logs -f redis

build: ## Rebuild de todos os containers
	@echo "$(YELLOW)Rebuilding containers...$(NC)"
	docker-compose build --no-cache
	@echo "$(GREEN)✓ Build concluído!$(NC)"

ps: ## Ver status dos containers
	docker-compose ps

# ==========================================
# Database Commands
# ==========================================

migrate: ## Executar migrations do banco
	@echo "$(GREEN)Executando migrations...$(NC)"
	docker-compose exec api npx prisma migrate deploy
	@echo "$(GREEN)✓ Migrations executadas!$(NC)"

migrate-dev: ## Criar nova migration
	@read -p "Nome da migration: " name; \
	docker-compose exec api npx prisma migrate dev --name $$name

seed: ## Popular banco com dados de teste
	@echo "$(GREEN)Populando banco de dados...$(NC)"
	docker-compose exec api npm run prisma:seed
	@echo "$(GREEN)✓ Seed concluído!$(NC)"

studio: ## Abrir Prisma Studio
	@echo "$(GREEN)Abrindo Prisma Studio...$(NC)"
	docker-compose exec api npx prisma studio

backup: ## Fazer backup do banco de dados
	@echo "$(GREEN)Criando backup...$(NC)"
	@mkdir -p ./database/backups
	@docker-compose exec postgres pg_dump -U oursales_user oursales > ./database/backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup criado em ./database/backups/$(NC)"

restore: ## Restaurar backup do banco (use: make restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Erro: Especifique o arquivo com FILE=nome.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restaurando backup $(FILE)...$(NC)"
	@docker-compose exec -T postgres psql -U oursales_user oursales < $(FILE)
	@echo "$(GREEN)✓ Backup restaurado!$(NC)"

db-reset: ## Resetar banco de dados (⚠️ apaga tudo!)
	@echo "$(RED)⚠️  ATENÇÃO: Isso irá apagar todos os dados!$(NC)"
	@read -p "Tem certeza? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose exec postgres psql -U oursales_user -c "DROP DATABASE IF EXISTS oursales;"; \
		docker-compose exec postgres psql -U oursales_user -c "CREATE DATABASE oursales;"; \
		make migrate; \
		echo "$(GREEN)✓ Banco resetado!$(NC)"; \
	fi

# ==========================================
# Development Commands
# ==========================================

install: ## Instalar dependências do backend
	@echo "$(GREEN)Instalando dependências...$(NC)"
	cd backend && npm install
	@echo "$(GREEN)✓ Dependências instaladas!$(NC)"

dev: ## Rodar backend em modo desenvolvimento (local)
	@echo "$(GREEN)Iniciando desenvolvimento...$(NC)"
	cd backend && npm run dev

test: ## Executar testes
	@echo "$(GREEN)Executando testes...$(NC)"
	cd backend && npm test

test-coverage: ## Executar testes com cobertura
	@echo "$(GREEN)Executando testes com cobertura...$(NC)"
	cd backend && npm run test:coverage

lint: ## Executar linter
	@echo "$(GREEN)Executando linter...$(NC)"
	cd backend && npm run lint

lint-fix: ## Executar linter e corrigir automaticamente
	@echo "$(GREEN)Executando linter com correções...$(NC)"
	cd backend && npm run lint:fix

# ==========================================
# Utility Commands
# ==========================================

clean: ## Limpar arquivos temporários
	@echo "$(YELLOW)Limpando arquivos temporários...$(NC)"
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name "*.log" -type f -delete
	docker system prune -f
	@echo "$(GREEN)✓ Limpeza concluída!$(NC)"

shell-api: ## Abrir shell no container da API
	docker-compose exec api sh

shell-postgres: ## Abrir shell no PostgreSQL
	docker-compose exec postgres psql -U oursales_user -d oursales

shell-redis: ## Abrir CLI do Redis
	docker-compose exec redis redis-cli

stats: ## Ver estatísticas de uso dos containers
	docker stats

health: ## Verificar saúde dos serviços
	@echo "$(GREEN)Verificando saúde dos serviços...$(NC)"
	@curl -s http://localhost:3000/health | jq '.' || echo "$(RED)API não está respondendo$(NC)"
	@docker-compose exec postgres pg_isready -U oursales_user || echo "$(RED)PostgreSQL não está pronto$(NC)"
	@docker-compose exec redis redis-cli ping || echo "$(RED)Redis não está respondendo$(NC)"

setup: ## Setup inicial completo do projeto
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)Setup Inicial do OurSales$(NC)"
	@echo "$(GREEN)========================================$(NC)"
	@echo ""
	@if [ ! -f backend/.env ]; then \
		echo "$(YELLOW)Criando arquivo .env...$(NC)"; \
		cp backend/.env.example backend/.env; \
		echo "$(GREEN)✓ Arquivo .env criado$(NC)"; \
	fi
	@echo "$(YELLOW)Iniciando containers...$(NC)"
	@make up
	@echo "$(YELLOW)Aguardando serviços iniciarem...$(NC)"
	@sleep 10
	@echo "$(YELLOW)Executando migrations...$(NC)"
	@make migrate
	@echo "$(YELLOW)Populando banco com dados de teste...$(NC)"
	@make seed
	@echo ""
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)✓ Setup concluído com sucesso!$(NC)"
	@echo "$(GREEN)========================================$(NC)"
	@echo ""
	@echo "Acesse:"
	@echo "  Frontend: $(YELLOW)http://localhost:8080$(NC)"
	@echo "  API: $(YELLOW)http://localhost:3000$(NC)"
	@echo ""
	@echo "Credenciais:"
	@echo "  Email: $(YELLOW)admin@oursales.com$(NC)"
	@echo "  Senha: $(YELLOW)admin123$(NC)"
	@echo ""
	@echo "$(RED)⚠️  ALTERE A SENHA EM PRODUÇÃO!$(NC)"
	@echo ""

# ==========================================
# Production Commands
# ==========================================

deploy: ## Deploy em produção
	@echo "$(GREEN)Iniciando deploy...$(NC)"
	git pull
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	docker-compose exec api npx prisma migrate deploy
	@echo "$(GREEN)✓ Deploy concluído!$(NC)"

# Default target
.DEFAULT_GOAL := help

