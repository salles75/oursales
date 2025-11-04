/**
 * Rotas de Clientes
 */

import express from "express";
import { authenticate, isAdmin } from "../middlewares/auth.js";
import * as clientesController from "../controllers/clientes.controller.js";

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route   GET /api/clientes
 * @desc    Listar todos os clientes (com paginação e filtros)
 * @access  Private
 */
router.get("/", clientesController.getClientes);

/**
 * @route   GET /api/clientes/stats
 * @desc    Obter estatísticas de clientes
 * @access  Private
 */
router.get("/stats", clientesController.getClientesStats);

/**
 * @route   GET /api/clientes/:id
 * @desc    Obter um cliente específico
 * @access  Private
 */
router.get("/:id", clientesController.getCliente);

/**
 * @route   POST /api/clientes
 * @desc    Criar novo cliente
 * @access  Private
 */
router.post("/", clientesController.createCliente);

/**
 * @route   PUT /api/clientes/:id
 * @desc    Atualizar cliente
 * @access  Private
 */
router.put("/:id", clientesController.updateCliente);

/**
 * @route   DELETE /api/clientes/:id
 * @desc    Deletar cliente
 * @access  Private (Admin only)
 */
router.delete("/:id", isAdmin, clientesController.deleteCliente);

/**
 * @route   GET /api/clientes/:id/historico
 * @desc    Obter histórico de interações do cliente
 * @access  Private
 */
router.get("/:id/historico", clientesController.getClienteHistorico);

/**
 * @route   GET /api/clientes/:id/pedidos
 * @desc    Obter pedidos do cliente
 * @access  Private
 */
router.get("/:id/pedidos", clientesController.getClientePedidos);

/**
 * @route   GET /api/clientes/:id/orcamentos
 * @desc    Obter orçamentos do cliente
 * @access  Private
 */
router.get("/:id/orcamentos", clientesController.getClienteOrcamentos);

export default router;
