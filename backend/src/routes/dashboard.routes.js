/**
 * Rotas de Dashboard
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  getDashboardStats,
  getVendasPorPeriodo,
  getVendasPorVendedor,
  getVendasPorCliente,
  getVendasPorIndustria,
  getTopProdutos,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getDashboardStats);
router.get("/vendas", getVendasPorPeriodo);
router.get("/vendedores", getVendasPorVendedor);
router.get("/clientes", getVendasPorCliente);
router.get("/industrias", getVendasPorIndustria);
router.get("/top-produtos", getTopProdutos);

export default router;
