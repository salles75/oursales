/**
 * Rotas de Usuários
 */

import express from "express";
import { authenticate, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", isAdmin, async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Implementar listagem de usuários",
  });
});

router.get("/:id", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar obtenção de usuário",
  });
});

router.post("/", isAdmin, async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar criação de usuário",
  });
});

router.put("/:id", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar atualização de usuário",
  });
});

router.delete("/:id", isAdmin, async (req, res) => {
  res.json({ success: true, message: "Implementar exclusão de usuário" });
});

export default router;
