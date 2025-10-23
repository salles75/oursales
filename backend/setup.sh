#!/bin/bash

# =====================================================
# Script de Configuração Automática - OurSales Backend
# =====================================================

echo "═══════════════════════════════════════════════════"
echo "   🚀 OurSales - Setup Automático do Backend"
echo "═══════════════════════════════════════════════════"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script da pasta backend${NC}"
    echo "   cd backend && bash setup.sh"
    exit 1
fi

echo "📦 Passo 1: Instalando dependências..."
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependências instaladas com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi
echo ""

echo "🗄️  Passo 2: Configurando banco de dados..."
echo "   Gerando cliente Prisma..."
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Cliente Prisma gerado!${NC}"
else
    echo -e "${RED}❌ Erro ao gerar cliente Prisma${NC}"
    exit 1
fi
echo ""

echo "📊 Passo 3: Executando migrations..."
echo -e "${YELLOW}⚠️  IMPORTANTE: PostgreSQL deve estar rodando!${NC}"
echo "   Se PostgreSQL não estiver rodando, este passo falhará."
echo ""
read -p "   PostgreSQL está rodando? (s/n): " postgres_running

if [ "$postgres_running" = "s" ] || [ "$postgres_running" = "S" ]; then
    npx prisma migrate dev --name init
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migrations executadas!${NC}"
    else
        echo -e "${RED}❌ Erro ao executar migrations${NC}"
        echo ""
        echo "Verifique:"
        echo "  1. PostgreSQL está rodando?"
        echo "  2. Credenciais no arquivo .env estão corretas?"
        echo "  3. Banco 'oursales' existe? Se não, crie com:"
        echo "     createdb oursales"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Migrations puladas. Execute manualmente:${NC}"
    echo "     npx prisma migrate dev"
fi
echo ""

echo "🌱 Passo 4: Seed do banco (opcional)..."
read -p "   Deseja criar dados de exemplo? (s/n): " run_seed

if [ "$run_seed" = "s" ] || [ "$run_seed" = "S" ]; then
    if [ -f "prisma/seed.js" ]; then
        npm run seed
        echo -e "${GREEN}✅ Seed executado!${NC}"
    else
        echo -e "${YELLOW}⚠️  Arquivo seed.js não encontrado${NC}"
    fi
fi
echo ""

echo "═══════════════════════════════════════════════════"
echo -e "${GREEN}🎉 Setup concluído com sucesso!${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "   1. Verifique o arquivo .env com suas configurações"
echo "   2. Inicie o servidor:"
echo "      ${GREEN}npm run dev${NC}"
echo ""
echo "   3. Teste o health check:"
echo "      ${GREEN}curl http://localhost:3000/health${NC}"
echo ""
echo "═══════════════════════════════════════════════════"

<<<<<<< Updated upstream
=======




>>>>>>> Stashed changes
