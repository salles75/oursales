import express from "express";
import {
  getTabelasPrecos,
  getTabelaPreco,
  createTabelaPreco,
  updateTabelaPreco,
  deleteTabelaPreco,
  addProdutoToTabela,
  removeProdutoFromTabela,
  updateProdutoPreco,
  importProdutosToTabela,
} from "../controllers/tabelas-precos.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/auth.js";

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticate);

// Rotas públicas (para usuários autenticados)
router.get("/", getTabelasPrecos);
router.get("/:id", getTabelaPreco);

// Rotas que requerem permissão de admin ou gerente
router.post("/", authorize("admin", "gerente"), createTabelaPreco);
router.put("/:id", authorize("admin", "gerente"), updateTabelaPreco);
router.delete("/:id", authorize("admin", "gerente"), deleteTabelaPreco);

// Rotas para gerenciar produtos nas tabelas de preços
router.post("/:id/produtos", authorize("admin", "gerente"), addProdutoToTabela);
router.delete("/:id/produtos/:produtoId", authorize("admin", "gerente"), removeProdutoFromTabela);
router.put("/:id/produtos/:produtoId", authorize("admin", "gerente"), updateProdutoPreco);
router.post("/:id/produtos/import", authorize("admin", "gerente"), importProdutosToTabela);

export default router;
