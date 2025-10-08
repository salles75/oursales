/**
 * Middleware de Autenticação
 * Proteção de rotas e verificação de permissões
 */

import jwt from "jsonwebtoken";
import { AppError, asyncHandler } from "./errorHandler.js";
import { prisma } from "../config/database.js";
import { cache } from "../config/redis.js";

/**
 * Verificar se o usuário está autenticado
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  // Obter token do header
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Token não fornecido. Acesso negado.", 401);
  }

  try {
    // Verificar se o token está na blacklist
    const isBlacklisted = await cache.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AppError("Token inválido", 401);
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tentar obter usuário do cache
    let user = await cache.get(`user:${decoded.id}`);

    if (!user) {
      // Buscar usuário no banco
      user = await prisma.usuario.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          ativo: true,
        },
      });

      if (!user) {
        throw new AppError("Usuário não encontrado", 401);
      }

      // Cachear usuário por 1 hora
      await cache.set(`user:${user.id}`, user, 3600);
    }

    if (!user.ativo) {
      throw new AppError("Usuário inativo", 401);
    }

    // Adicionar usuário à requisição
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new AppError("Token inválido", 401);
    }
    if (error.name === "TokenExpiredError") {
      throw new AppError("Token expirado", 401);
    }
    throw error;
  }
});

/**
 * Verificar se o usuário tem as permissões necessárias
 */
export const authorize = (...perfis) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!perfis.includes(req.user.perfil)) {
      throw new AppError(
        "Você não tem permissão para acessar este recurso",
        403
      );
    }

    next();
  };
};

/**
 * Verificar se o usuário é admin
 */
export const isAdmin = authorize("admin");

/**
 * Verificar se o usuário é admin ou gerente
 */
export const isAdminOrGerente = authorize("admin", "gerente");

/**
 * Verificar se o usuário pode acessar o recurso (dono ou admin)
 */
export const canAccess = (getResourceOwnerId) => {
  return asyncHandler(async (req, res, next) => {
    const resourceOwnerId = await getResourceOwnerId(req);

    // Admin pode acessar tudo
    if (req.user.perfil === "admin") {
      return next();
    }

    // Verificar se é o dono do recurso
    if (req.user.id !== resourceOwnerId) {
      throw new AppError("Acesso negado a este recurso", 403);
    }

    next();
  });
};

/**
 * Gerar token JWT
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Invalidar token (logout)
 */
export const invalidateToken = async (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await cache.set(`blacklist:${token}`, true, expiresIn);
      }
    }
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  authenticate,
  authorize,
  isAdmin,
  isAdminOrGerente,
  canAccess,
  generateToken,
  invalidateToken,
};
