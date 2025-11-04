/**
 * Middleware de tratamento de erros
 * Centraliza o tratamento de erros da aplicação
 */

import { logger } from "../config/logger.js";

/**
 * Classe de erro customizado
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handler para rotas não encontradas
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

/**
 * Handler global de erros
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log do erro
  logger.logError(err, req);

  // Prisma errors
  if (err.code === "P2002") {
    error = new AppError("Registro duplicado", 409);
  }

  if (err.code === "P2025") {
    error = new AppError("Registro não encontrado", 404);
  }

  if (err.code?.startsWith("P")) {
    error = new AppError("Erro no banco de dados", 500);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Token inválido", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expirado", 401);
  }

  // Validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new AppError(messages.join(", "), 400);
  }

  // Multer errors (upload)
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      error = new AppError("Arquivo muito grande", 400);
    } else {
      error = new AppError("Erro no upload do arquivo", 400);
    }
  }

  // Resposta de erro em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        statusCode: error.statusCode,
        stack: err.stack,
        details: err,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Resposta de erro em produção
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        statusCode: error.statusCode,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Erro não operacional (não expor detalhes)
  return res.status(500).json({
    success: false,
    error: {
      message: "Erro interno do servidor",
      statusCode: 500,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Wrapper para async/await em routes
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  AppError,
  notFoundHandler,
  errorHandler,
  asyncHandler,
};
