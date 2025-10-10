/**
 * Rotas de Pedidos
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  getPedidos,
  getPedidosStats,
  getPedido,
  createPedido,
  updatePedido,
  updateStatusPedido,
  deletePedido,
} from "../controllers/pedidos.controller.js";

const router = express.Router();

router.use(authenticate);

// Estatísticas (deve vir antes de /:id)
router.get("/stats", getPedidosStats);

// CRUD
router.get("/", getPedidos);
router.get("/:id", getPedido);
router.post("/", createPedido);
router.put("/:id", updatePedido);
router.delete("/:id", deletePedido);

// Atualização de status
router.put("/:id/status", updateStatusPedido);

export default router;
