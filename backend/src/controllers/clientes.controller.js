/**
 * Controller de Clientes
 */

import { prisma } from "../config/database.js";
import { cache } from "../config/redis.js";
import { AppError, asyncHandler } from "../middlewares/errorHandler.js";
import { logger } from "../config/logger.js";

/**
 * @desc    Listar todos os clientes
 * @route   GET /api/clientes
 * @access  Private
 */
export const getClientes = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    tipo,
    status,
    search,
    sortBy = "criadoEm",
    order = "desc",
  } = req.query;

  // Converter para números
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Construir filtros
  const where = {};

  if (tipo) {
    where.tipo = tipo;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { nomeCompleto: { contains: search, mode: "insensitive" } },
      { razaoSocial: { contains: search, mode: "insensitive" } },
      { nomeFantasia: { contains: search, mode: "insensitive" } },
      { cpf: { contains: search } },
      { cnpj: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  // Verificar cache
  const cacheKey = `clientes:list:${JSON.stringify(req.query)}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json({
      success: true,
      data: cached.data,
      pagination: cached.pagination,
      cached: true,
    });
  }

  // Buscar clientes
  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
      include: {
        vendedor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    }),
    prisma.cliente.count({ where }),
  ]);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
  };

  // Cachear por 5 minutos
  await cache.set(cacheKey, { data: clientes, pagination }, 300);

  res.json({
    success: true,
    data: clientes,
    pagination,
  });
});

/**
 * @desc    Obter estatísticas de clientes
 * @route   GET /api/clientes/stats
 * @access  Private
 */
export const getClientesStats = asyncHandler(async (req, res) => {
  const cacheKey = "clientes:stats";
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json({
      success: true,
      data: cached,
      cached: true,
    });
  }

  const [totalClientes, ativos, inativos, pf, pj] = await Promise.all([
    prisma.cliente.count(),
    prisma.cliente.count({ where: { status: "ativo" } }),
    prisma.cliente.count({ where: { status: "inativo" } }),
    prisma.cliente.count({ where: { tipo: "PF" } }),
    prisma.cliente.count({ where: { tipo: "PJ" } }),
  ]);

  const stats = {
    totalClientes,
    ativos,
    inativos,
    pessoaFisica: pf,
    pessoaJuridica: pj,
  };

  // Cachear por 10 minutos
  await cache.set(cacheKey, stats, 600);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * @desc    Obter um cliente específico
 * @route   GET /api/clientes/:id
 * @access  Private
 */
export const getCliente = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cacheKey = `cliente:${id}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json({
      success: true,
      data: cached,
      cached: true,
    });
  }

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      vendedor: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
        },
      },
      _count: {
        select: {
          orcamentos: true,
          pedidos: true,
          crmInteracoes: true,
        },
      },
    },
  });

  if (!cliente) {
    throw new AppError("Cliente não encontrado", 404);
  }

  // Cachear por 5 minutos
  await cache.set(cacheKey, cliente, 300);

  res.json({
    success: true,
    data: cliente,
  });
});

/**
 * @desc    Criar novo cliente
 * @route   POST /api/clientes
 * @access  Private
 */
export const createCliente = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validações básicas
  if (!data.tipo || !["PF", "PJ"].includes(data.tipo)) {
    throw new AppError("Tipo de cliente inválido (PF ou PJ)", 400);
  }

  if (data.tipo === "PF" && !data.cpf) {
    throw new AppError("CPF é obrigatório para Pessoa Física", 400);
  }

  if (data.tipo === "PJ" && !data.cnpj) {
    throw new AppError("CNPJ é obrigatório para Pessoa Jurídica", 400);
  }

  // Adicionar ID do criador
  data.criadoPorId = req.user.id;

  // Se não especificado, atribuir ao vendedor logado
  if (!data.vendedorId && req.user.perfil === "vendedor") {
    data.vendedorId = req.user.id;
  }

  const cliente = await prisma.cliente.create({
    data,
    include: {
      vendedor: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  });

  // Invalidar cache de listagem
  await cache.delPattern("clientes:list:*");
  await cache.delPattern("clientes:stats");

  logger.info(`Cliente criado: ${cliente.id} por ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: cliente,
  });
});

/**
 * @desc    Atualizar cliente
 * @route   PUT /api/clientes/:id
 * @access  Private
 */
export const updateCliente = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  // Verificar se existe
  const clienteExistente = await prisma.cliente.findUnique({
    where: { id },
  });

  if (!clienteExistente) {
    throw new AppError("Cliente não encontrado", 404);
  }

  // Remover campos que não podem ser atualizados diretamente
  delete data.id;
  delete data.criadoEm;
  delete data.criadoPorId;

  const cliente = await prisma.cliente.update({
    where: { id },
    data,
    include: {
      vendedor: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  });

  // Invalidar caches
  await cache.del(`cliente:${id}`);
  await cache.delPattern("clientes:list:*");
  await cache.delPattern("clientes:stats");

  logger.info(`Cliente atualizado: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    data: cliente,
  });
});

/**
 * @desc    Deletar cliente
 * @route   DELETE /api/clientes/:id
 * @access  Private (Admin only)
 */
export const deleteCliente = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar se existe
  const cliente = await prisma.cliente.findUnique({
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

  if (!cliente) {
    throw new AppError("Cliente não encontrado", 404);
  }

  // Verificar se tem pedidos ou orçamentos
  if (cliente._count.pedidos > 0 || cliente._count.orcamentos > 0) {
    throw new AppError(
      "Não é possível deletar cliente com pedidos ou orçamentos. Considere inativá-lo.",
      400
    );
  }

  await prisma.cliente.delete({
    where: { id },
  });

  // Invalidar caches
  await cache.del(`cliente:${id}`);
  await cache.delPattern("clientes:list:*");
  await cache.delPattern("clientes:stats");

  logger.info(`Cliente deletado: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    message: "Cliente deletado com sucesso",
  });
});

/**
 * @desc    Obter histórico de interações do cliente
 * @route   GET /api/clientes/:id/historico
 * @access  Private
 */
export const getClienteHistorico = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [interacoes, total] = await Promise.all([
    prisma.crmInteracao.findMany({
      where: { clienteId: id },
      skip,
      take,
      orderBy: { dataInteracao: "desc" },
      include: {
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
      where: { clienteId: id },
    }),
  ]);

  res.json({
    success: true,
    data: interacoes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc    Obter pedidos do cliente
 * @route   GET /api/clientes/:id/pedidos
 * @access  Private
 */
export const getClientePedidos = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [pedidos, total] = await Promise.all([
    prisma.pedido.findMany({
      where: { clienteId: id },
      skip,
      take,
      orderBy: { dataPedido: "desc" },
      select: {
        id: true,
        numero: true,
        dataPedido: true,
        status: true,
        valorTotal: true,
      },
    }),
    prisma.pedido.count({
      where: { clienteId: id },
    }),
  ]);

  res.json({
    success: true,
    data: pedidos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc    Obter orçamentos do cliente
 * @route   GET /api/clientes/:id/orcamentos
 * @access  Private
 */
export const getClienteOrcamentos = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [orcamentos, total] = await Promise.all([
    prisma.orcamento.findMany({
      where: { clienteId: id },
      skip,
      take,
      orderBy: { dataEmissao: "desc" },
      select: {
        id: true,
        numero: true,
        dataEmissao: true,
        dataValidade: true,
        status: true,
        valorTotal: true,
      },
    }),
    prisma.orcamento.count({
      where: { clienteId: id },
    }),
  ]);

  res.json({
    success: true,
    data: orcamentos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export default {
  getClientes,
  getClientesStats,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
  getClienteHistorico,
  getClientePedidos,
  getClienteOrcamentos,
};
