/**
 * Rotas de Transportadoras
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  getTransportadoras,
  getTransportadora,
  createTransportadora,
  updateTransportadora,
  deleteTransportadora,
} from "../controllers/transportadoras.controller.js";

const router = express.Router();

router.use(authenticate);

// CRUD
router.get("/", getTransportadoras);
router.get("/:id", getTransportadora);
router.post("/", createTransportadora);
router.put("/:id", updateTransportadora);
router.delete("/:id", deleteTransportadora);

export default router;
