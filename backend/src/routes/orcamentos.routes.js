/**
 * Rotas de Orçamentos
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  getOrcamentos,
  getOrcamento,
  createOrcamento,
  updateOrcamento,
  deleteOrcamento,
  converterParaPedido,
} from "../controllers/orcamentos.controller.js";

const router = express.Router();

router.use(authenticate);

// CRUD
router.get("/", getOrcamentos);
router.get("/:id", getOrcamento);
router.post("/", createOrcamento);
router.put("/:id", updateOrcamento);
router.delete("/:id", deleteOrcamento);

// Ações especiais
router.post("/:id/converter", converterParaPedido);

export default router;
