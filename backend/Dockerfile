# =====================================================
# OurSales Backend - Dockerfile Multi-stage
# =====================================================

FROM node:20-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    curl

WORKDIR /app

# =====================================================
# Stage 1: Dependências
# =====================================================
FROM base AS dependencies

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS as dependências (incluindo devDependencies para Prisma CLI)
RUN npm ci && \
    npm cache clean --force

# Gerar Prisma Client
RUN npx prisma generate

# =====================================================
# Stage 2: Build (se necessário)
# =====================================================
FROM base AS build

COPY package*.json ./
RUN npm ci

COPY . .

# =====================================================
# Stage 3: Produção
# =====================================================
FROM base AS production

# Copiar package files primeiro
COPY package*.json ./
COPY prisma ./prisma/

# Copiar dependências (incluindo node_modules com Prisma CLI)
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar Prisma schema para garantir que está disponível
COPY prisma ./prisma/

# Gerar Prisma Client no stage de produção (garantir que está disponível)
RUN npx prisma generate

# Copiar código fonte
COPY src ./src

# Instalar netcat para verificar conectividade dos serviços
RUN apk add --no-cache netcat-openbsd

# Criar usuário não-root por segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar script de entrada (antes de mudar usuário)
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Criar diretórios necessários e ajustar permissões
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nodejs:nodejs /app

# Expor porta
EXPOSE 3000

# Mudar para usuário não-root
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Entrypoint para executar script de inicialização
ENTRYPOINT ["docker-entrypoint.sh"]

# Comando de inicialização
CMD ["npm", "start"]

