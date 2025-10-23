/**
 * Rotas de Configurações
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  getColunasPersonalizadas,
  salvarColunasPersonalizadas,
  getColunasDisponiveis,
} from "../controllers/configuracoes.controller.js";

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Configurações de colunas personalizadas
router.get("/colunas/:tipo", getColunasPersonalizadas);
router.post("/colunas/:tipo", salvarColunasPersonalizadas);
router.get("/colunas/:tipo/disponiveis", getColunasDisponiveis);

export default router;
