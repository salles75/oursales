#!/bin/sh

# =====================================================
# Script de Inicialização do Container Docker
# OurSales Backend
# =====================================================

set -e

echo "🚀 Iniciando OurSales Backend..."

# Aguardar PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL..."
until nc -z postgres 5432 2>/dev/null; do
  echo "   PostgreSQL não está pronto ainda. Aguardando..."
  sleep 2
done
echo "✅ PostgreSQL está pronto!"

# Aguardar Redis estar pronto
echo "⏳ Aguardando Redis..."
until nc -z redis 6379 2>/dev/null; do
  echo "   Redis não está pronto ainda. Aguardando..."
  sleep 2
done
echo "✅ Redis está pronto!"

# Verificar se Prisma Client foi gerado
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "📦 Gerando Prisma Client..."
  npx prisma generate
fi

# Executar migrations do Prisma
echo "🗄️  Executando migrations do banco de dados..."
npx prisma migrate deploy || {
  echo "⚠️  Migrations já aplicadas ou erro ao executar migrations"
  echo "   Continuando mesmo assim..."
}

# Criar diretórios necessários se não existirem
mkdir -p /app/uploads /app/logs 2>/dev/null || true

echo "✅ Tudo pronto! Iniciando servidor..."
echo ""

# Executar comando passado como argumento ou npm start
exec "$@"

