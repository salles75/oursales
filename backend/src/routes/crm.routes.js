/**
 * Rotas de CRM
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/interacoes", async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Implementar listagem de interações CRM",
  });
});

router.get("/interacoes/:id", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar obtenção de interação",
  });
});

router.post("/interacoes", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar criação de interação",
  });
});

router.put("/interacoes/:id", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar atualização de interação",
  });
});

router.delete("/interacoes/:id", async (req, res) => {
  res.json({ success: true, message: "Implementar exclusão de interação" });
});

router.get("/followups", async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Implementar listagem de follow-ups pendentes",
  });
});

export default router;
