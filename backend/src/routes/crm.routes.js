/**
 * Rotas de CRM
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  getInteracoes,
  getInteracao,
  createInteracao,
  updateInteracao,
  deleteInteracao,
  getFollowupsPendentes,
  marcarFollowupRealizado,
} from "../controllers/crm.controller.js";

const router = express.Router();

router.use(authenticate);

// Follow-ups (deve vir antes de /interacoes/:id)
router.get("/followups", getFollowupsPendentes);

// Interações CRUD
router.get("/interacoes", getInteracoes);
router.get("/interacoes/:id", getInteracao);
router.post("/interacoes", createInteracao);
router.put("/interacoes/:id", updateInteracao);
router.delete("/interacoes/:id", deleteInteracao);

// Ações especiais
router.put("/interacoes/:id/followup", marcarFollowupRealizado);

export default router;
