/**
 * Rotas de Transportadoras
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: "Implementar listagem de transportadoras",
  });
});

router.get("/:id", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar obtenção de transportadora",
  });
});

router.post("/", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar criação de transportadora",
  });
});

router.put("/:id", async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: "Implementar atualização de transportadora",
  });
});

router.delete("/:id", async (req, res) => {
  res.json({
    success: true,
    message: "Implementar exclusão de transportadora",
  });
});

export default router;
