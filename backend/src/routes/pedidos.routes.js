/**
 * Rotas de Pedidos
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Implementar listagem de pedidos",
  });
});

router.get("/stats", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar estatísticas de pedidos",
  });
});

router.get("/:id", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar obtenção de pedido",
  });
});

router.post("/", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar criação de pedido",
  });
});

router.put("/:id", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar atualização de pedido",
  });
});

router.put("/:id/status", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar atualização de status do pedido",
  });
});

router.delete("/:id", async (req, res) => {
  res.json({ success: true, message: "Implementar exclusão de pedido" });
});

export default router;
