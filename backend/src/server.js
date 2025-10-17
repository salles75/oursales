/**
 * OurSales Backend - Servidor Principal
 * Sistema escalável para gestão comercial
 */

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";

import { logger, requestLogger } from "./config/logger.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import { prisma } from "./config/database.js";
import { redis } from "./config/redis.js";

// Rotas
import authRoutes from "./routes/auth.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import transportadorasRoutes from "./routes/transportadoras.routes.js";
import produtosRoutes from "./routes/produtos.routes.js";
import orcamentosRoutes from "./routes/orcamentos.routes.js";
import pedidosRoutes from "./routes/pedidos.routes.js";
import crmRoutes from "./routes/crm.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import relatoriosRoutes from "./routes/relatorios.routes.js";
import industriasRoutes from "./routes/industrias.routes.js";
import tabelasPrecosRoutes from "./routes/tabelas-precos.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// =====================================================
// Middlewares de Segurança
// =====================================================
app.use(
  helmet({
    contentSecurityPolicy: false, // Ajustar conforme necessário
    crossOriginEmbedderPolicy: false,
  })
);

// =====================================================
// CORS
// =====================================================
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",");

    // Permitir requisições sem origin (Postman, apps mobile, etc)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV === "development"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Origem não permitida pelo CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// =====================================================
// Middlewares Gerais
// =====================================================
app.use(compression()); // Compressão de respostas
app.use(express.json({ limit: "10mb" })); // Parse JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded

// Logs de requisições
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", { stream: requestLogger }));
}

// =====================================================
// Servir Arquivos Estáticos (Frontend)
// =====================================================
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, "../../frontend")));

// Servir arquivos estáticos do admin
app.use("/admin", express.static(path.join(__dirname, "../../frontend/admin")));

// Rota para servir o index.html como página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/index.html"));
});

// Rota para servir o painel admin
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/admin/index.html"));
});

// Rota para servir o painel admin com barra
app.get("/admin/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/admin/index.html"));
});

// Rate limiting
app.use("/api/", rateLimiter);

// =====================================================
// Rota de Health Check
// =====================================================
app.get("/health", async (req, res) => {
  try {
    // Verificar conexão com banco
    await prisma.$queryRaw`SELECT 1`;

    // Verificar conexão com Redis
    await redis.ping();

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      services: {
        database: "connected",
        redis: "connected",
      },
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// =====================================================
// Rotas da API
// =====================================================
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/transportadoras", transportadorasRoutes);
app.use("/api/produtos", produtosRoutes);
app.use("/api/orcamentos", orcamentosRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/relatorios", relatoriosRoutes);
app.use("/api/industrias", industriasRoutes);
app.use("/api/tabelas-precos", tabelasPrecosRoutes);
app.use("/api/admin", adminRoutes);

// =====================================================
// Rota raiz
// =====================================================
app.get("/", (req, res) => {
  res.json({
    name: "OurSales API",
    version: "1.0.0",
    description: "API RESTful escalável para gestão comercial",
    documentation: "/api/docs",
    health: "/health",
  });
});

// =====================================================
// Handlers de Erro
// =====================================================
app.use(notFoundHandler);
app.use(errorHandler);

// =====================================================
// Graceful Shutdown
// =====================================================
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} recebido. Encerrando servidor graciosamente...`);

  // Parar de aceitar novas conexões
  server.close(async () => {
    logger.info("Servidor HTTP fechado");

    try {
      // Desconectar banco de dados
      await prisma.$disconnect();
      logger.info("Banco de dados desconectado");

      // Desconectar Redis
      await redis.quit();
      logger.info("Redis desconectado");

      process.exit(0);
    } catch (error) {
      logger.error("Erro durante shutdown:", error);
      process.exit(1);
    }
  });

  // Forçar encerramento após 10 segundos
  setTimeout(() => {
    logger.error("Forçando encerramento após timeout");
    process.exit(1);
  }, 10000);
};

// =====================================================
// Iniciar Servidor
// =====================================================
const server = app.listen(PORT, HOST, () => {
  logger.info(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║           OurSales Backend API                    ║
║         Sistema de Gestão Comercial               ║
║                                                   ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  🚀 Servidor iniciado com sucesso!               ║
║  📡 URL: http://${HOST}:${PORT}                      ║
║  🌍 Ambiente: ${process.env.NODE_ENV || "development"}            ║
║  📊 Health: http://${HOST}:${PORT}/health           ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

// Tratar sinais de encerramento
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Tratar erros não capturados
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

export default app;
