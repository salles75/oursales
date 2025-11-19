/**
 * Configuração do Winston Logger
 * Sistema de logs estruturado para produção
 */

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir diretório de logs
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, "../../logs");

// Formatos personalizados
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}] ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Transports
const transports = [];

// Console (desenvolvimento)
if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug",
    })
  );
}

// Arquivo - Todos os logs
transports.push(
  new DailyRotateFile({
    filename: path.join(LOG_DIR, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    format: customFormat,
    level: process.env.LOG_LEVEL || "info",
  })
);

// Arquivo - Erros
transports.push(
  new DailyRotateFile({
    filename: path.join(LOG_DIR, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "30d",
    format: customFormat,
    level: "error",
  })
);

// Criar logger
export const logger = winston.createLogger({
  format: customFormat,
  transports,
  exitOnError: false,
});

// Stream para Morgan
export const requestLogger = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Helper functions
logger.logRequest = (req, res, responseTime) => {
  logger.info("HTTP Request", {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
};

logger.logError = (error, req) => {
  logger.error("Application Error", {
    message: error.message,
    stack: error.stack,
    url: req?.url,
    method: req?.method,
    ip: req?.ip,
  });
};

export default logger;
