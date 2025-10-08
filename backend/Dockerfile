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

# Instalar dependências
RUN npm ci --only=production && \
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

# Criar usuário não-root por segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar dependências e arquivos necessários
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=dependencies --chown=nodejs:nodejs /app/prisma ./prisma
COPY --chown=nodejs:nodejs . .

# Criar diretórios necessários
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nodejs:nodejs /app/uploads /app/logs

# Expor porta
EXPOSE 3000

# Mudar para usuário não-root
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicialização
CMD ["npm", "start"]

