/**
 * Configuração do Prisma Client
 * Cliente único para toda a aplicação (Singleton Pattern)
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "./logger.js";

// Configurações de pool e timeout otimizadas para alta escalabilidade
const prismaClientOptions = {
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

// Singleton pattern para o Prisma Client
const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Logs de queries em desenvolvimento
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Params: ${e.params}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// Logs de erros
prisma.$on("error", (e) => {
  logger.error("Prisma Error:", e);
});

// Logs de warnings
prisma.$on("warn", (e) => {
  logger.warn("Prisma Warning:", e);
});

// Testar conexão na inicialização
prisma
  .$connect()
  .then(() => {
    logger.info("✅ Banco de dados conectado com sucesso");
  })
  .catch((error) => {
    logger.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  });

export default prisma;
