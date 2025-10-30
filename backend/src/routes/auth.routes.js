/**
 * Rotas de Autenticação
 */

import express from "express";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { authenticate } from "../middlewares/auth.js";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post("/register", authLimiter, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post("/login", authLimiter, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout de usuário
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Obter informações do usuário autenticado
 * @access  Private
 */
router.get("/me", authenticate, authController.getMe);

/**
 * @route   PUT /api/auth/update-password
 * @desc    Atualizar senha do usuário
 * @access  Private
 */
router.put("/update-password", authenticate, authController.updatePassword);
router.put("/update-profile", authenticate, authController.updateProfile);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar token JWT
 * @access  Private
 */
router.post("/refresh", authenticate, authController.refreshToken);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar se token é válido
 * @access  Private
 */
router.get("/verify", authenticate, authController.verifyToken);

/**
 * @route   GET /api/auth/check-admin
 * @desc    Verificar se já existe um admin no sistema
 * @access  Public
 */
router.get("/check-admin", authController.checkAdminExists);

export default router;
