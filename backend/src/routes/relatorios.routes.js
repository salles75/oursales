/**
 * Rotas de Relatórios
 */

import express from "express";
import { authenticate, isAdminOrGerente } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate);
router.use(isAdminOrGerente);

router.get("/vendas", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar relatório de vendas",
  });
});

router.get("/clientes", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar relatório de clientes",
  });
});

router.get("/produtos", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar relatório de produtos",
  });
});

router.get("/financeiro", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar relatório financeiro",
  });
});

router.get("/vendedores", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar relatório de vendedores",
  });
});

export default router;
