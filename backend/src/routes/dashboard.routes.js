/**
 * Rotas de Dashboard
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  res.json({
    success: true,
    data: {
      totalVendas: 0,
      totalClientes: 0,
      pedidosAbertos: 0,
      orcamentosPendentes: 0,
      faturamentoMes: 0,
      ticketMedio: 0,
    },
    message: "Implementar dashboard completo",
  });
});

router.get("/vendas", async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Implementar gráfico de vendas",
  });
});

router.get("/top-clientes", async (req, res) => {
  res.json({ success: true, data: [], message: "Implementar top clientes" });
});

router.get("/top-produtos", async (req, res) => {
  res.json({ success: true, data: [], message: "Implementar top produtos" });
});

export default router;
