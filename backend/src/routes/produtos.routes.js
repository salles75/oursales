/**
 * Rotas de Produtos
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  getProdutos,
  getProdutosStats,
  getProduto,
  createProduto,
  updateProduto,
  deleteProduto,
  ajustarEstoque,
  getMovimentosEstoque,
} from "../controllers/produtos.controller.js";

const router = express.Router();

router.use(authenticate);

// Estatísticas (deve vir antes de /:id)
router.get("/stats", getProdutosStats);

// CRUD
router.get("/", getProdutos);
router.get("/:id", getProduto);
router.post("/", createProduto);
router.put("/:id", updateProduto);
router.delete("/:id", deleteProduto);

// Estoque
router.post("/:id/estoque", ajustarEstoque);
router.get("/:id/movimentos", getMovimentosEstoque);

export default router;
