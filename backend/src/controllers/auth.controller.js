/**
 * Controller de Autenticação
 */

import bcrypt from "bcrypt";
import { prisma } from "../config/database.js";
import { cache } from "../config/redis.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken, invalidateToken } from "../middlewares/auth.js";
import { logger } from "../config/logger.js";

/**
 * @desc    Registrar novo usuário
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { nome, email, senha, perfil, telefone } = req.body;

  // Validações
  if (!nome || !email || !senha) {
    throw new AppError("Por favor, forneça nome, email e senha", 400);
  }

  // Verificar se já existe um admin no sistema
  const adminCount = await prisma.usuario.count({
    where: { perfil: "admin" },
  });

  // Permitir registro apenas se não houver admin OU se for o primeiro registro após limpeza
  if (adminCount > 0) {
    // Verificar se é um email específico do Master Admin
    const masterEmails = [
      "proprietario@oursales.com",
      "admin@oursales.com",
      "master@oursales.com",
      "owner@oursales.com",
    ];

    if (!masterEmails.includes(email.toLowerCase())) {
      throw new AppError(
        "Sistema já possui um administrador. Registros adicionais não são permitidos.",
        403
      );
    }

    // Se for um email master, permitir o registro (substituindo o admin existente)
    logger.info(`Registro Master Admin autorizado para: ${email}`);
  }

  // Verificar se o email já existe
  const emailExists = await prisma.usuario.findUnique({
    where: { email },
  });

  if (emailExists) {
    // Se for um email master e já existir, atualizar em vez de criar
    const masterEmails = [
      "proprietario@oursales.com",
      "admin@oursales.com",
      "master@oursales.com",
      "owner@oursales.com",
    ];

    if (masterEmails.includes(email.toLowerCase())) {
      // Atualizar o usuário existente
      const senhaHash = await bcrypt.hash(
        senha,
        parseInt(process.env.BCRYPT_ROUNDS || "10", 10)
      );

      const usuario = await prisma.usuario.update({
        where: { email },
        data: {
          nome,
          senhaHash,
          perfil: "admin",
          telefone: telefone || null,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          telefone: true,
          criadoEm: true,
        },
      });

      // Gerar token
      const token = generateToken(usuario.id);

      // Cache do usuário
      await cache.setex(`user:${usuario.id}`, 3600, JSON.stringify(usuario));

      logger.info(`Master Admin atualizado: ${usuario.email}`);

      res.status(200).json({
        success: true,
        message: "Master Admin atualizado com sucesso",
        data: {
          user: usuario,
          token,
        },
      });
      return;
    } else {
      throw new AppError("Email já cadastrado", 409);
    }
  }

  // Hash da senha
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
  const senhaHash = await bcrypt.hash(senha, rounds);

  // Criar usuário (primeiro registro sempre será admin)
  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash,
      perfil: "admin", // Primeiro registro sempre é admin
      telefone,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      telefone: true,
      criadoEm: true,
    },
  });

  // Gerar token
  const token = generateToken(usuario.id);

  // Cachear usuário
  await cache.set(`user:${usuario.id}`, usuario, 3600);

  logger.info(`Novo usuário registrado: ${usuario.email}`);

  res.status(201).json({
    success: true,
    data: {
      usuario,
      token,
    },
  });
});

/**
 * @desc    Login de usuário
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;

  // Validações
  if (!email || !senha) {
    throw new AppError("Por favor, forneça email e senha", 400);
  }

  // Buscar usuário
  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!usuario) {
    throw new AppError("Credenciais inválidas", 401);
  }

  // Verificar se está ativo
  if (!usuario.ativo) {
    throw new AppError(
      "Usuário inativo. Entre em contato com o administrador",
      401
    );
  }

  // Verificar senha
  const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);

  if (!senhaCorreta) {
    throw new AppError("Credenciais inválidas", 401);
  }

  // Atualizar último acesso
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimoAcesso: new Date() },
  });

  // Gerar token
  const token = generateToken(usuario.id);

  // Preparar dados do usuário (sem senha)
  const { senhaHash, ...usuarioData } = usuario;

  // Cachear usuário
  await cache.set(`user:${usuario.id}`, usuarioData, 3600);

  logger.info(`Login realizado: ${usuario.email}`);

  res.json({
    success: true,
    data: {
      usuario: usuarioData,
      token,
    },
  });
});

/**
 * @desc    Logout de usuário
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Invalidar token
  await invalidateToken(req.token);

  // Remover usuário do cache
  await cache.del(`user:${req.user.id}`);

  logger.info(`Logout realizado: ${req.user.email}`);

  res.json({
    success: true,
    message: "Logout realizado com sucesso",
  });
});

/**
 * @desc    Obter informações do usuário autenticado
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      telefone: true,
      fotoUrl: true,
      ativo: true,
      criadoEm: true,
      ultimoAcesso: true,
    },
  });

  res.json({
    success: true,
    data: usuario,
  });
});

/**
 * @desc    Atualizar senha do usuário
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { senhaAtual, senhaNova } = req.body;

  // Validações
  if (!senhaAtual || !senhaNova) {
    throw new AppError("Por favor, forneça a senha atual e a nova senha", 400);
  }

  if (senhaNova.length < 6) {
    throw new AppError("A nova senha deve ter pelo menos 6 caracteres", 400);
  }

  // Buscar usuário com senha
  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user.id },
  });

  // Verificar senha atual
  const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senhaHash);

  if (!senhaCorreta) {
    throw new AppError("Senha atual incorreta", 401);
  }

  // Hash da nova senha
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
  const senhaHash = await bcrypt.hash(senhaNova, rounds);

  // Atualizar senha
  await prisma.usuario.update({
    where: { id: req.user.id },
    data: { senhaHash },
  });

  logger.info(`Senha atualizada: ${req.user.email}`);

  res.json({
    success: true,
    message: "Senha atualizada com sucesso",
  });
});

/**
 * @desc    Atualizar perfil do usuário
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { nome, email, telefone } = req.body;

  // Validações
  if (!nome && !email && !telefone) {
    throw new AppError("Por favor, forneça pelo menos um campo para atualizar", 400);
  }

  // Verificar se o email já existe (se estiver sendo alterado)
  if (email && email !== req.user.email) {
    const emailExists = await prisma.usuario.findUnique({
      where: { email },
    });

    if (emailExists) {
      throw new AppError("Email já cadastrado", 409);
    }
  }

  // Preparar dados para atualização
  const updateData = {};
  if (nome) updateData.nome = nome;
  if (email) updateData.email = email;
  if (telefone !== undefined) updateData.telefone = telefone;

  // Atualizar usuário
  const usuario = await prisma.usuario.update({
    where: { id: req.user.id },
    data: updateData,
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      telefone: true,
      criadoEm: true,
    },
  });

  // Atualizar cache
  await cache.setex(`user:${usuario.id}`, 3600, JSON.stringify(usuario));

  logger.info(`Perfil atualizado para usuário: ${usuario.email}`);

  res.json({
    success: true,
    message: "Perfil atualizado com sucesso",
    data: {
      user: usuario,
    },
  });
});

/**
 * @desc    Renovar token JWT
 * @route   POST /api/auth/refresh
 * @access  Private
 */
export const refreshToken = asyncHandler(async (req, res) => {
  // Gerar novo token
  const token = generateToken(req.user.id);

  res.json({
    success: true,
    data: {
      token,
    },
  });
});

/**
 * @desc    Verificar token
 * @route   GET /api/auth/verify
 * @access  Private
 */
export const verifyToken = asyncHandler(async (req, res) => {
  // Se chegou até aqui, o token é válido (middleware já verificou)
  res.json({
    success: true,
    message: "Token válido",
    data: {
      user: req.user,
    },
  });
});

/**
 * @desc    Verificar se já existe um admin no sistema
 * @route   GET /api/auth/check-admin
 * @access  Public
 */
export const checkAdminExists = asyncHandler(async (req, res) => {
  const adminCount = await prisma.usuario.count({
    where: { perfil: "admin" },
  });

  res.json({
    success: true,
    exists: adminCount > 0,
    count: adminCount,
  });
});

export default {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  updateProfile,
  refreshToken,
  verifyToken,
  checkAdminExists,
};
