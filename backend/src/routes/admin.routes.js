/**
 * OurSales Admin Routes
 * Rotas para funcionalidades administrativas
 */

import express from "express";
import multer from "multer";
import { authenticate } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/auth.js";
import {
  getSystemConfig,
  updateSystemConfig,
  uploadFile,
  getFiles,
  createTablePattern,
  getTablePatterns,
  updateTablePattern,
  deleteTablePattern,
  importTablePatterns,
  exportTablePatterns,
  getSystemLogs,
  createSystemBackup,
  // Controle Global
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
  getAllInstances,
  executeInstanceAction,
  getGlobalStats,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${timestamp}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Permitir apenas imagens
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos de imagem são permitidos"), false);
    }
  },
});

// Middleware de autenticação para todas as rotas
router.use(authenticate);
router.use(requireAdmin);

// =====================================================
// Configurações do Sistema
// =====================================================

/**
 * @route GET /api/admin/config
 * @desc Obter configurações do sistema
 * @access Admin
 */
router.get("/config", getSystemConfig);

/**
 * @route PUT /api/admin/config
 * @desc Atualizar configurações do sistema
 * @access Admin
 */
router.put("/config", updateSystemConfig);

// =====================================================
// Upload de Arquivos
// =====================================================

/**
 * @route POST /api/admin/upload
 * @desc Upload de arquivos (logo, favicon, etc.)
 * @access Admin
 */
router.post("/upload", upload.single("file"), uploadFile);

/**
 * @route GET /api/admin/files/:tipo
 * @desc Obter arquivos por tipo
 * @access Admin
 */
router.get("/files/:tipo", getFiles);

// =====================================================
// Padrões de Tabela
// =====================================================

/**
 * @route POST /api/admin/patterns
 * @desc Criar padrão de tabela
 * @access Admin
 */
router.post("/patterns", createTablePattern);

/**
 * @route GET /api/admin/patterns
 * @desc Listar padrões de tabela
 * @access Admin
 */
router.get("/patterns", getTablePatterns);

/**
 * @route PUT /api/admin/patterns/:id
 * @desc Atualizar padrão de tabela
 * @access Admin
 */
router.put("/patterns/:id", updateTablePattern);

/**
 * @route DELETE /api/admin/patterns/:id
 * @desc Excluir padrão de tabela
 * @access Admin
 */
router.delete("/patterns/:id", deleteTablePattern);

/**
 * @route POST /api/admin/patterns/import
 * @desc Importar padrões de tabela
 * @access Admin
 */
router.post("/patterns/import", importTablePatterns);

/**
 * @route GET /api/admin/patterns/export
 * @desc Exportar padrões de tabela
 * @access Admin
 */
router.get("/patterns/export", exportTablePatterns);

// =====================================================
// Logs e Monitoramento
// =====================================================

/**
 * @route GET /api/admin/logs
 * @desc Obter logs do sistema
 * @access Admin
 */
router.get("/logs", getSystemLogs);

// =====================================================
// Backup e Restauração
// =====================================================

/**
 * @route POST /api/admin/backup
 * @desc Criar backup do sistema
 * @access Admin
 */
router.post("/backup", createSystemBackup);

// =====================================================
// CONTROLE GLOBAL - MASTER ADMIN
// =====================================================

/**
 * @route GET /api/admin/clients
 * @desc Listar todos os clientes
 * @access Admin
 */
router.get("/clients", getAllClients);

/**
 * @route POST /api/admin/clients
 * @desc Criar novo cliente
 * @access Admin
 */
router.post("/clients", createClient);

/**
 * @route PUT /api/admin/clients/:id
 * @desc Atualizar cliente
 * @access Admin
 */
router.put("/clients/:id", updateClient);

/**
 * @route DELETE /api/admin/clients/:id
 * @desc Deletar cliente
 * @access Admin
 */
router.delete("/clients/:id", deleteClient);

/**
 * @route GET /api/admin/instances
 * @desc Listar todas as instâncias
 * @access Admin
 */
router.get("/instances", getAllInstances);

/**
 * @route POST /api/admin/instances/:instanceId/action
 * @desc Executar ação em instância
 * @access Admin
 */
router.post("/instances/:instanceId/action", executeInstanceAction);

/**
 * @route GET /api/admin/stats
 * @desc Obter estatísticas globais
 * @access Admin
 */
router.get("/stats", getGlobalStats);

export default router;
