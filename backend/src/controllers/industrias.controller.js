import { prisma } from "../config/database.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { cache } from "../config/redis.js";
import { logger } from "../config/logger.js";

/**
 * @desc    Listar indústrias
 * @route   GET /api/industrias
 * @access  Private
 */
export const getIndustrias = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    status = "ativo",
    sortBy = "nomeFantasia",
    sortOrder = "asc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Construir filtros
  const where = {
    status: status === "todos" ? undefined : status,
    ...(search && {
      OR: [
        { nomeFantasia: { contains: search, mode: "insensitive" } },
        { razaoSocial: { contains: search, mode: "insensitive" } },
        { cnpj: { contains: search } },
      ],
    }),
  };

  // Construir ordenação
  const orderBy = {
    [sortBy]: sortOrder,
  };

  // Cache key
  const cacheKey = `industrias:list:${JSON.stringify({
    page,
    limit,
    search,
    status,
    sortBy,
    sortOrder,
  })}`;

  // Tentar buscar do cache
  let cached = await cache.get(cacheKey);
  if (cached) {
    return res.json({
      success: true,
      data: cached.data,
      pagination: cached.pagination,
    });
  }

  // Buscar do banco
  const [industrias, total] = await Promise.all([
    prisma.industria.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        tabelasPrecos: {
          where: { ativa: true },
          select: {
            id: true,
            nome: true,
            tipo: true,
            _count: {
              select: { produtos: true },
            },
          },
        },
        _count: {
          select: { produtos: true },
        },
      },
    }),
    prisma.industria.count({ where }),
  ]);

  const result = {
    data: industrias,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };

  // Cachear por 5 minutos
  await cache.set(cacheKey, result, 300);

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

/**
 * @desc    Obter uma indústria
 * @route   GET /api/industrias/:id
 * @access  Private
 */
export const getIndustria = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const industria = await prisma.industria.findUnique({
    where: { id },
    include: {
      tabelasPrecos: {
        include: {
          produtos: {
            include: {
              produto: {
                select: {
                  id: true,
                  codigo: true,
                  nome: true,
                  precoVenda: true,
                  estoqueAtual: true,
                },
              },
            },
          },
        },
      },
      produtos: {
        select: {
          id: true,
          codigo: true,
          nome: true,
          precoVenda: true,
          estoqueAtual: true,
        },
      },
    },
  });

  if (!industria) {
    throw new AppError("Indústria não encontrada", 404);
  }

  res.json({
    success: true,
    data: industria,
  });
});

/**
 * @desc    Criar nova indústria
 * @route   POST /api/industrias
 * @access  Private
 */
export const createIndustria = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validações básicas
  if (!data.razaoSocial || !data.nomeFantasia || !data.cnpj) {
    throw new AppError(
      "Razão Social, Nome Fantasia e CNPJ são obrigatórios",
      400
    );
  }

  // Verificar se CNPJ já existe
  const industriaExistente = await prisma.industria.findUnique({
    where: { cnpj: data.cnpj },
  });

  if (industriaExistente) {
    throw new AppError("Já existe uma indústria com este CNPJ", 400);
  }

  const industria = await prisma.industria.create({
    data: {
      ...data,
      comissao: parseFloat(data.comissao) || 0,
    },
    include: {
      tabelasPrecos: true,
      _count: {
        select: { produtos: true },
      },
    },
  });

  await cache.delPattern("industrias:list:*");

  logger.info(`Indústria criada: ${industria.id} por ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: industria,
  });
});

/**
 * @desc    Atualizar indústria
 * @route   PUT /api/industrias/:id
 * @access  Private
 */
export const updateIndustria = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const industria = await prisma.industria.findUnique({
    where: { id },
  });

  if (!industria) {
    throw new AppError("Indústria não encontrada", 404);
  }

  // Verificar se CNPJ já existe em outra indústria
  if (data.cnpj && data.cnpj !== industria.cnpj) {
    const cnpjExistente = await prisma.industria.findUnique({
      where: { cnpj: data.cnpj },
    });

    if (cnpjExistente) {
      throw new AppError("Já existe uma indústria com este CNPJ", 400);
    }
  }

  const industriaAtualizada = await prisma.industria.update({
    where: { id },
    data: {
      ...data,
      comissao: data.comissao ? parseFloat(data.comissao) : undefined,
    },
    include: {
      tabelasPrecos: true,
      _count: {
        select: { produtos: true },
      },
    },
  });

  await cache.delPattern("industrias:list:*");
  await cache.del(`industria:${id}`);

  logger.info(`Indústria atualizada: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    data: industriaAtualizada,
  });
});

/**
 * @desc    Deletar indústria
 * @route   DELETE /api/industrias/:id
 * @access  Private
 */
export const deleteIndustria = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const industria = await prisma.industria.findUnique({
    where: { id },
    include: {
      _count: {
        select: { produtos: true, tabelasPrecos: true },
      },
    },
  });

  if (!industria) {
    throw new AppError("Indústria não encontrada", 404);
  }

  // Verificar se tem produtos vinculados
  if (industria._count.produtos > 0) {
    throw new AppError(
      `Não é possível excluir a indústria. Existem ${industria._count.produtos} produtos vinculados.`,
      400
    );
  }

  await prisma.industria.delete({
    where: { id },
  });

  await cache.delPattern("industrias:list:*");
  await cache.del(`industria:${id}`);

  logger.info(`Indústria deletada: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    message: "Indústria deletada com sucesso",
  });
});

/**
 * @desc    Obter estatísticas das indústrias
 * @route   GET /api/industrias/stats
 * @access  Private
 */
export const getIndustriasStats = asyncHandler(async (req, res) => {
  const cacheKey = "industrias:stats";

  // Tentar buscar do cache
  let cached = await cache.get(cacheKey);
  if (cached) {
    return res.json({
      success: true,
      data: cached,
    });
  }

  const [totalIndustrias, industriasAtivas, totalProdutos, totalTabelasPrecos] =
    await Promise.all([
      prisma.industria.count(),
      prisma.industria.count({ where: { status: "ativo" } }),
      prisma.produto.count({ where: { industriaId: { not: null } } }),
      prisma.tabelaPreco.count({ where: { ativa: true } }),
    ]);

  const stats = {
    totalIndustrias,
    industriasAtivas,
    industriasInativas: totalIndustrias - industriasAtivas,
    totalProdutos,
    totalTabelasPrecos,
  };

  // Cachear por 10 minutos
  await cache.set(cacheKey, stats, 600);

  res.json({
    success: true,
    data: stats,
  });
});
