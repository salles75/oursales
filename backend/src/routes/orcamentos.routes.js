/**
 * Rotas de Orçamentos
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Implementar listagem de orçamentos",
  });
});

router.get("/:id", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar obtenção de orçamento",
  });
});

router.post("/", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar criação de orçamento",
  });
});

router.put("/:id", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar atualização de orçamento",
  });
});

router.delete("/:id", async (req, res) => {
  res.json({ success: true, message: "Implementar exclusão de orçamento" });
});

router.post("/:id/converter", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar conversão de orçamento em pedido",
  });
});

export default router;
