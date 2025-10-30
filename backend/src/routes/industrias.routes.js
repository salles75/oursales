import express from "express";
import {
  getIndustrias,
  getIndustria,
  createIndustria,
  updateIndustria,
  deleteIndustria,
  getIndustriasStats,
} from "../controllers/industrias.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/auth.js";

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticate);

// Rotas públicas (para usuários autenticados)
router.get("/", getIndustrias);
router.get("/stats", getIndustriasStats);
router.get("/:id", getIndustria);

// Rotas que requerem permissão de admin ou gerente
router.post("/", authorize("admin", "gerente"), createIndustria);
router.put("/:id", authorize("admin", "gerente"), updateIndustria);
router.delete("/:id", authorize("admin", "gerente"), deleteIndustria);

export default router;
