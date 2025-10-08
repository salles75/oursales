/**
 * Configuração do Redis
 * Cache e gerenciamento de sessões
 */

import Redis from "ioredis";
import { logger } from "./logger.js";

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || "0", 10),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
};

// Criar cliente Redis
export const redis = new Redis(redisConfig);

// Prefixo para as chaves
const REDIS_PREFIX = process.env.REDIS_PREFIX || "oursales:";

// TTL padrão (1 hora)
const DEFAULT_TTL = parseInt(process.env.REDIS_TTL || "3600", 10);

// Eventos
redis.on("connect", () => {
  logger.info("✅ Redis conectado");
});

redis.on("ready", () => {
  logger.info("✅ Redis pronto para uso");
});

redis.on("error", (error) => {
  logger.error("❌ Redis error:", error);
});

redis.on("close", () => {
  logger.warn("⚠️  Redis conexão fechada");
});

redis.on("reconnecting", () => {
  logger.info("🔄 Redis reconectando...");
});

/**
 * Helper functions para cache
 */
export const cache = {
  /**
   * Obter valor do cache
   */
  async get(key) {
    try {
      const data = await redis.get(`${REDIS_PREFIX}${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  },

  /**
   * Definir valor no cache
   */
  async set(key, value, ttl = DEFAULT_TTL) {
    try {
      const data = JSON.stringify(value);
      await redis.setex(`${REDIS_PREFIX}${key}`, ttl, data);
      return true;
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  },

  /**
   * Deletar chave do cache
   */
  async del(key) {
    try {
      await redis.del(`${REDIS_PREFIX}${key}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
      return false;
    }
  },

  /**
   * Deletar múltiplas chaves por padrão
   */
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(`${REDIS_PREFIX}${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error(`Error deleting cache pattern ${pattern}:`, error);
      return false;
    }
  },

  /**
   * Verificar se chave existe
   */
  async exists(key) {
    try {
      const result = await redis.exists(`${REDIS_PREFIX}${key}`);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking cache key ${key}:`, error);
      return false;
    }
  },

  /**
   * Incrementar contador
   */
  async incr(key, ttl = DEFAULT_TTL) {
    try {
      const fullKey = `${REDIS_PREFIX}${key}`;
      const value = await redis.incr(fullKey);
      if (value === 1) {
        await redis.expire(fullKey, ttl);
      }
      return value;
    } catch (error) {
      logger.error(`Error incrementing cache key ${key}:`, error);
      return null;
    }
  },

  /**
   * Obter TTL de uma chave
   */
  async ttl(key) {
    try {
      return await redis.ttl(`${REDIS_PREFIX}${key}`);
    } catch (error) {
      logger.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  },
};

export default redis;
