/**
 * Controller de CRM (Interações)
 */

import { prisma } from "../config/database.js";
import { cache } from "../config/redis.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../config/logger.js";

/**
 * @desc    Listar todas as interações CRM
 * @route   GET /api/crm/interacoes
 * @access  Private
 */
export const getInteracoes = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    clienteId,
    usuarioId,
    tipo,
    search,
    sortBy = "dataInteracao",
    order = "desc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {};

  if (clienteId) {
    where.clienteId = clienteId;
  }

  if (usuarioId) {
    where.usuarioId = usuarioId;
  }

  if (tipo) {
    where.tipo = tipo;
  }

  if (search) {
    where.OR = [
      { assunto: { contains: search, mode: "insensitive" } },
      { descricao: { contains: search, mode: "insensitive" } },
    ];
  }

  const [interacoes, total] = await Promise.all([
    prisma.crmInteracao.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
      include: {
        cliente: {
          select: {
            id: true,
            tipo: true,
            nomeCompleto: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        orcamento: {
          select: {
            id: true,
            numero: true,
            status: true,
          },
        },
        pedido: {
          select: {
            id: true,
            numero: true,
            status: true,
          },
        },
      },
    }),
    prisma.crmInteracao.count({ where }),
  ]);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
  };

  res.json({
    success: true,
    data: interacoes,
    pagination,
  });
});

/**
 * @desc    Obter uma interação específica
 * @route   GET /api/crm/interacoes/:id
 * @access  Private
 */
export const getInteracao = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interacao = await prisma.crmInteracao.findUnique({
    where: { id },
    include: {
      cliente: true,
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
        },
      },
      orcamento: {
        select: {
          id: true,
          numero: true,
          status: true,
          valorTotal: true,
        },
      },
      pedido: {
        select: {
          id: true,
          numero: true,
          status: true,
          valorTotal: true,
        },
      },
    },
  });

  if (!interacao) {
    throw new AppError("Interação não encontrada", 404);
  }

  res.json({
    success: true,
    data: interacao,
  });
});

/**
 * @desc    Criar nova interação
 * @route   POST /api/crm/interacoes
 * @access  Private
 */
export const createInteracao = asyncHandler(async (req, res) => {
  const data = req.body;

  if (!data.clienteId || !data.tipo || !data.descricao) {
    throw new AppError("Cliente, tipo e descrição são obrigatórios", 400);
  }

  // Verificar se cliente existe
  const cliente = await prisma.cliente.findUnique({
    where: { id: data.clienteId },
  });

  if (!cliente) {
    throw new AppError("Cliente não encontrado", 404);
  }

  // Adicionar ID do usuário logado
  data.usuarioId = req.user.id;

  const interacao = await prisma.crmInteracao.create({
    data,
    include: {
      cliente: {
        select: {
          id: true,
          tipo: true,
          nomeCompleto: true,
          razaoSocial: true,
        },
      },
      usuario: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });

  await cache.delPattern("crm:*");

  logger.info(`Interação CRM criada: ${interacao.id} por ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: interacao,
  });
});

/**
 * @desc    Atualizar interação
 * @route   PUT /api/crm/interacoes/:id
 * @access  Private
 */
export const updateInteracao = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const interacaoExistente = await prisma.crmInteracao.findUnique({
    where: { id },
  });

  if (!interacaoExistente) {
    throw new AppError("Interação não encontrada", 404);
  }

  // Remover campos que não podem ser atualizados
  delete data.id;
  delete data.criadoEm;
  delete data.usuarioId;
  delete data.clienteId;

  const interacao = await prisma.crmInteracao.update({
    where: { id },
    data,
    include: {
      cliente: {
        select: {
          id: true,
          tipo: true,
          nomeCompleto: true,
          razaoSocial: true,
        },
      },
      usuario: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });

  await cache.delPattern("crm:*");

  logger.info(`Interação CRM atualizada: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    data: interacao,
  });
});

/**
 * @desc    Deletar interação
 * @route   DELETE /api/crm/interacoes/:id
 * @access  Private
 */
export const deleteInteracao = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interacao = await prisma.crmInteracao.findUnique({
    where: { id },
  });

  if (!interacao) {
    throw new AppError("Interação não encontrada", 404);
  }

  await prisma.crmInteracao.delete({
    where: { id },
  });

  await cache.delPattern("crm:*");

  logger.info(`Interação CRM deletada: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    message: "Interação deletada com sucesso",
  });
});

/**
 * @desc    Listar follow-ups pendentes
 * @route   GET /api/crm/followups
 * @access  Private
 */
export const getFollowupsPendentes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [followups, total] = await Promise.all([
    prisma.crmInteracao.findMany({
      where: {
        requerFollowup: true,
        followupRealizado: false,
      },
      skip,
      take,
      orderBy: { dataFollowup: "asc" },
      include: {
        cliente: {
          select: {
            id: true,
            tipo: true,
            nomeCompleto: true,
            razaoSocial: true,
            nomeFantasia: true,
            telefone: true,
            email: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    }),
    prisma.crmInteracao.count({
      where: {
        requerFollowup: true,
        followupRealizado: false,
      },
    }),
  ]);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
  };

  res.json({
    success: true,
    data: followups,
    pagination,
  });
});

/**
 * @desc    Marcar follow-up como realizado
 * @route   PUT /api/crm/interacoes/:id/followup
 * @access  Private
 */
export const marcarFollowupRealizado = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interacao = await prisma.crmInteracao.findUnique({
    where: { id },
  });

  if (!interacao) {
    throw new AppError("Interação não encontrada", 404);
  }

  if (!interacao.requerFollowup) {
    throw new AppError("Esta interação não requer follow-up", 400);
  }

  const interacaoAtualizada = await prisma.crmInteracao.update({
    where: { id },
    data: {
      followupRealizado: true,
    },
    include: {
      cliente: {
        select: {
          id: true,
          tipo: true,
          nomeCompleto: true,
          razaoSocial: true,
        },
      },
      usuario: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });

  await cache.delPattern("crm:*");

  logger.info(`Follow-up marcado como realizado: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    data: interacaoAtualizada,
  });
});

export default {
  getInteracoes,
  getInteracao,
  createInteracao,
  updateInteracao,
  deleteInteracao,
  getFollowupsPendentes,
  marcarFollowupRealizado,
};
