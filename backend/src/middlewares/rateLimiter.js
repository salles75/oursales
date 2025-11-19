/**
 * Middleware de Rate Limiting
 * Proteção contra abuso da API
 */

import rateLimit from "express-rate-limit";
import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";

/**
 * Rate limiter usando memória (fallback)
 */
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "1000", 10), // Aumentado para desenvolvimento
  message: {
    success: false,
    error: {
      message: "Muitas requisições. Por favor, tente novamente mais tarde.",
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false, // Desabilitar validação de proxy para evitar erro com Nginx
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        message: "Muitas requisições. Por favor, tente novamente mais tarde.",
        statusCode: 429,
      },
    });
  },
});

/**
 * Rate limiter customizado usando Redis
 */
export const createRedisRateLimiter = (options = {}) => {
  const {
    windowMs = 900000, // 15 minutos
    max = 100,
    prefix = "rate_limit:",
  } = options;

  return async (req, res, next) => {
    try {
      const key = `${prefix}${req.ip}`;
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      const ttl = await redis.ttl(key);

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, max - current));
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(Date.now() + ttl * 1000).toISOString()
      );

      if (current > max) {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        return res.status(429).json({
          success: false,
          error: {
            message:
              "Muitas requisições. Por favor, tente novamente mais tarde.",
            statusCode: 429,
            retryAfter: ttl,
          },
        });
      }

      next();
    } catch (error) {
      logger.error("Rate limiter error:", error);
      // Em caso de erro, permitir a requisição
      next();
    }
  };
};

/**
 * Rate limiters específicos para diferentes endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: {
    success: false,
    error: {
      message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
      statusCode: 429,
    },
  },
  skipSuccessfulRequests: true,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 uploads
  message: {
    success: false,
    error: {
      message: "Limite de uploads excedido. Tente novamente em 1 hora.",
      statusCode: 429,
    },
  },
});

export default rateLimiter;
