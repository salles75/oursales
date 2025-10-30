/**
 * Controller de Transportadoras
 */

import { prisma } from "../config/database.js";
import { cache } from "../config/redis.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../config/logger.js";

/**
 * @desc    Listar todas as transportadoras
 * @route   GET /api/transportadoras
 * @access  Private
 */
export const getTransportadoras = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    ativo,
    search,
    sortBy = "razaoSocial",
    order = "asc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {};

  if (ativo !== undefined) {
    where.ativo = ativo === "true";
  }

  if (search) {
    where.OR = [
      { razaoSocial: { contains: search, mode: "insensitive" } },
      { nomeFantasia: { contains: search, mode: "insensitive" } },
      { cnpj: { contains: search } },
    ];
  }

  const cacheKey = `transportadoras:list:${JSON.stringify(req.query)}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json({
      success: true,
      data: cached.data,
      pagination: cached.pagination,
      cached: true,
    });
  }

  const [transportadoras, total] = await Promise.all([
    prisma.transportadora.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
      include: {
        criadoPor: {
          select: {
            id: true,
            nome: true,
          },
        },
        _count: {
          select: {
            orcamentos: true,
            pedidos: true,
          },
        },
      },
    }),
    prisma.transportadora.count({ where }),
  ]);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
  };

  await cache.set(cacheKey, { data: transportadoras, pagination }, 300);

  res.json({
    success: true,
    data: transportadoras,
    pagination,
  });
});

/**
 * @desc    Obter uma transportadora específica
 * @route   GET /api/transportadoras/:id
 * @access  Private
 */
export const getTransportadora = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cacheKey = `transportadora:${id}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json({
      success: true,
      data: cached,
      cached: true,
    });
  }

  const transportadora = await prisma.transportadora.findUnique({
    where: { id },
    include: {
      criadoPor: {
        select: {
          id: true,
          nome: true,
        },
      },
      _count: {
        select: {
          orcamentos: true,
          pedidos: true,
        },
      },
    },
  });

  if (!transportadora) {
    throw new AppError("Transportadora não encontrada", 404);
  }

  await cache.set(cacheKey, transportadora, 300);

  res.json({
    success: true,
    data: transportadora,
  });
});

/**
 * @desc    Criar nova transportadora
 * @route   POST /api/transportadoras
 * @access  Private
 */
export const createTransportadora = asyncHandler(async (req, res) => {
  const data = req.body;

  if (!data.razaoSocial || !data.cnpj) {
    throw new AppError("Razão social e CNPJ são obrigatórios", 400);
  }

  // Verificar se CNPJ já existe
  const transportadoraExistente = await prisma.transportadora.findUnique({
    where: { cnpj: data.cnpj },
  });

  if (transportadoraExistente) {
    throw new AppError("Já existe uma transportadora com este CNPJ", 400);
  }

  data.criadoPorId = req.user.id;

  const transportadora = await prisma.transportadora.create({
    data,
    include: {
      criadoPor: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });

  await cache.delPattern("transportadoras:list:*");

  logger.info(
    `Transportadora criada: ${transportadora.id} por ${req.user.email}`
  );

  res.status(201).json({
    success: true,
    data: transportadora,
  });
});

/**
 * @desc    Atualizar transportadora
 * @route   PUT /api/transportadoras/:id
 * @access  Private
 */
export const updateTransportadora = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const transportadoraExistente = await prisma.transportadora.findUnique({
    where: { id },
  });

  if (!transportadoraExistente) {
    throw new AppError("Transportadora não encontrada", 404);
  }

  delete data.id;
  delete data.criadoEm;
  delete data.criadoPorId;

  const transportadora = await prisma.transportadora.update({
    where: { id },
    data,
    include: {
      criadoPor: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });

  await cache.del(`transportadora:${id}`);
  await cache.delPattern("transportadoras:list:*");

  logger.info(`Transportadora atualizada: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    data: transportadora,
  });
});

/**
 * @desc    Deletar transportadora
 * @route   DELETE /api/transportadoras/:id
 * @access  Private
 */
export const deleteTransportadora = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transportadora = await prisma.transportadora.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orcamentos: true,
          pedidos: true,
        },
      },
    },
  });

  if (!transportadora) {
    throw new AppError("Transportadora não encontrada", 404);
  }

  if (
    transportadora._count.pedidos > 0 ||
    transportadora._count.orcamentos > 0
  ) {
    throw new AppError(
      "Não é possível deletar transportadora com orçamentos ou pedidos. Considere inativá-la.",
      400
    );
  }

  await prisma.transportadora.delete({
    where: { id },
  });

  await cache.del(`transportadora:${id}`);
  await cache.delPattern("transportadoras:list:*");

  logger.info(`Transportadora deletada: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    message: "Transportadora deletada com sucesso",
  });
});

export default {
  getTransportadoras,
  getTransportadora,
  createTransportadora,
  updateTransportadora,
  deleteTransportadora,
};
