/**
 * Rotas de Produtos
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Implementar listagem de produtos",
  });
});

router.get("/stats", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar estatísticas de produtos",
  });
});

router.get("/:id", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar obtenção de produto",
  });
});

router.post("/", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar criação de produto",
  });
});

router.put("/:id", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar atualização de produto",
  });
});

router.delete("/:id", async (req, res) => {
  res.json({ success: true, message: "Implementar exclusão de produto" });
});

export default router;
