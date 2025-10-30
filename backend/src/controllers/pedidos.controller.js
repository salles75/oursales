/**
 * Controller de Pedidos
 */

import { prisma } from "../config/database.js";
import { cache } from "../config/redis.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../config/logger.js";

/**
 * Gerar número único de pedido
 */
async function gerarNumeroPedido() {
  const ano = new Date().getFullYear();
  const count = await prisma.pedido.count({
    where: {
      numero: {
        startsWith: `PED-${ano}-`,
      },
    },
  });
  return `PED-${ano}-${String(count + 1).padStart(6, "0")}`;
}

/**
 * @desc    Listar todos os pedidos
 * @route   GET /api/pedidos
 * @access  Private
 */
export const getPedidos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    clienteId,
    vendedorId,
    search,
    sortBy = "criadoEm",
    order = "desc",
    columns,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {};

  if (status) {
    where.status = status;
  }

  if (clienteId) {
    where.clienteId = clienteId;
  }

  if (vendedorId) {
    where.vendedorId = vendedorId;
  }

  if (search) {
    where.OR = [
      { numero: { contains: search, mode: "insensitive" } },
      { numeroPedidoCliente: { contains: search, mode: "insensitive" } },
      {
        cliente: {
          OR: [
            { nomeCompleto: { contains: search, mode: "insensitive" } },
            { razaoSocial: { contains: search, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const [pedidos, total] = await Promise.all([
    prisma.pedido.findMany({
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
            cnpj: true,
            cpf: true,
            cidade: true,
            estado: true,
            telefone: true,
            email: true,
            segmento: true,
            status: true,
          },
        },
        vendedor: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        transportadora: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cidade: true,
            estado: true,
          },
        },
        criadoPor: {
          select: {
            id: true,
            nome: true,
          },
        },
        aprovadoPor: {
          select: {
            id: true,
            nome: true,
          },
        },
        _count: {
          select: {
            itens: true,
          },
        },
      },
    }),
    prisma.pedido.count({ where }),
  ]);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
  };

  res.json({
    success: true,
    data: pedidos,
    pagination,
  });
});

/**
 * @desc    Obter estatísticas de pedidos
 * @route   GET /api/pedidos/stats
 * @access  Private
 */
export const getPedidosStats = asyncHandler(async (req, res) => {
  const cacheKey = "pedidos:stats";
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json({
      success: true,
      data: cached,
      cached: true,
    });
  }

  const [
    totalPedidos,
    aguardandoAprovacao,
    aprovados,
    emProducao,
    faturados,
    entregues,
    cancelados,
    faturamentoTotal,
  ] = await Promise.all([
    prisma.pedido.count(),
    prisma.pedido.count({ where: { status: "aguardando_aprovacao" } }),
    prisma.pedido.count({ where: { status: "aprovado" } }),
    prisma.pedido.count({ where: { status: "em_producao" } }),
    prisma.pedido.count({ where: { status: "faturado" } }),
    prisma.pedido.count({ where: { status: "entregue" } }),
    prisma.pedido.count({ where: { status: "cancelado" } }),
    prisma.pedido.aggregate({
      where: {
        status: {
          notIn: ["cancelado"],
        },
      },
      _sum: {
        valorTotal: true,
      },
    }),
  ]);

  const stats = {
    totalPedidos,
    aguardandoAprovacao,
    aprovados,
    emProducao,
    faturados,
    entregues,
    cancelados,
    faturamentoTotal: faturamentoTotal._sum.valorTotal || 0,
  };

  await cache.set(cacheKey, stats, 600);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * @desc    Obter um pedido específico
 * @route   GET /api/pedidos/:id
 * @access  Private
 */
export const getPedido = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      cliente: true,
      vendedor: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
        },
      },
      transportadora: true,
      itens: {
        include: {
          produto: {
            select: {
              id: true,
              codigo: true,
              nome: true,
              descricao: true,
              unidadeMedida: true,
              precoVenda: true,
              estoqueAtual: true,
            },
          },
        },
        orderBy: {
          ordem: "asc",
        },
      },
      criadoPor: {
        select: {
          id: true,
          nome: true,
        },
      },
      aprovadoPor: {
        select: {
          id: true,
          nome: true,
        },
      },
      canceladoPor: {
        select: {
          id: true,
          nome: true,
        },
      },
      movimentosEstoque: {
        include: {
          produto: {
            select: {
              id: true,
              codigo: true,
              nome: true,
            },
          },
        },
      },
    },
  });

  if (!pedido) {
    throw new AppError("Pedido não encontrado", 404);
  }

  res.json({
    success: true,
    data: pedido,
  });
});

/**
 * @desc    Criar novo pedido
 * @route   POST /api/pedidos
 * @access  Private
 */
export const createPedido = asyncHandler(async (req, res) => {
  const { clienteId, itens, ...rest } = req.body;

  if (!clienteId || !itens || itens.length === 0) {
    throw new AppError("Cliente e itens são obrigatórios", 400);
  }

  // Gerar número do pedido
  const numero = await gerarNumeroPedido();

  // Validar estoque dos produtos
  for (const item of itens) {
    const produto = await prisma.produto.findUnique({
      where: { id: item.produtoId },
    });

    if (!produto) {
      throw new AppError(`Produto ${item.produtoId} não encontrado`, 404);
    }

    if (produto.estoqueAtual < item.quantidade) {
      throw new AppError(
        `Estoque insuficiente para o produto ${produto.nome}. Disponível: ${produto.estoqueAtual}`,
        400
      );
    }
  }

  // Calcular valores
  let subtotal = 0;
  const itensProcessados = itens.map((item, index) => {
    const quantidade = parseFloat(item.quantidade);
    const precoUnitario = parseFloat(item.precoUnitario);
    const descontoValor = parseFloat(item.descontoValor || 0);
    const subtotalItem = quantidade * precoUnitario - descontoValor;

    subtotal += subtotalItem;

    return {
      produtoId: item.produtoId,
      quantidade,
      precoUnitario,
      descontoPercentual: parseFloat(item.descontoPercentual || 0),
      descontoValor,
      subtotal: subtotalItem,
      observacoes: item.observacoes || null,
      ordem: index,
    };
  });

  const descontoValor = parseFloat(rest.descontoValor || 0);
  const valorFrete = parseFloat(rest.valorFrete || 0);
  const acrescimoValor = parseFloat(rest.acrescimoValor || 0);
  const valorTotal = subtotal - descontoValor + valorFrete + acrescimoValor;

  // Calcular data de entrega prevista
  let dataEntregaPrevista = null;
  if (rest.prazoEntregaDias) {
    dataEntregaPrevista = new Date();
    dataEntregaPrevista.setDate(
      dataEntregaPrevista.getDate() + parseInt(rest.prazoEntregaDias)
    );
  }

  const pedido = await prisma.pedido.create({
    data: {
      numero,
      numeroPedidoCliente: rest.numeroPedidoCliente,
      clienteId,
      vendedorId: rest.vendedorId || req.user.id,
      orcamentoId: rest.orcamentoId,
      transportadoraId: rest.transportadoraId,
      dataEntregaPrevista,
      subtotal,
      descontoValor,
      descontoPercentual: rest.descontoPercentual || 0,
      acrescimoValor,
      valorFrete,
      valorTotal,
      condicaoPagamento: rest.condicaoPagamento,
      formaPagamento: rest.formaPagamento,
      prazoEntregaDias: rest.prazoEntregaDias,
      observacoes: rest.observacoes,
      observacoesInternas: rest.observacoesInternas,
      status: "aguardando_aprovacao",
      criadoPorId: req.user.id,
      itens: {
        create: itensProcessados,
      },
    },
    include: {
      cliente: true,
      vendedor: {
        select: {
          id: true,
          nome: true,
        },
      },
      itens: {
        include: {
          produto: true,
        },
      },
    },
  });

  await cache.delPattern("pedidos:*");

  logger.info(`Pedido criado: ${pedido.id} por ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: pedido,
  });
});

/**
 * @desc    Atualizar pedido
 * @route   PUT /api/pedidos/:id
 * @access  Private
 */
export const updatePedido = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const pedidoExistente = await prisma.pedido.findUnique({
    where: { id },
  });

  if (!pedidoExistente) {
    throw new AppError("Pedido não encontrado", 404);
  }

  // Não permitir atualização de pedidos já faturados ou entregues
  if (["faturado", "entregue"].includes(pedidoExistente.status)) {
    throw new AppError(
      "Pedido já faturado ou entregue não pode ser alterado",
      400
    );
  }

  delete data.id;
  delete data.numero;
  delete data.criadoEm;
  delete data.criadoPorId;
  delete data.itens; // Itens não podem ser alterados após criação

  const pedido = await prisma.pedido.update({
    where: { id },
    data,
    include: {
      cliente: true,
      vendedor: {
        select: {
          id: true,
          nome: true,
        },
      },
      itens: {
        include: {
          produto: true,
        },
      },
    },
  });

  await cache.delPattern("pedidos:*");

  logger.info(`Pedido atualizado: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    data: pedido,
  });
});

/**
 * @desc    Atualizar status do pedido
 * @route   PUT /api/pedidos/:id/status
 * @access  Private
 */
export const updateStatusPedido = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, motivoCancelamento } = req.body;

  if (!status) {
    throw new AppError("Status é obrigatório", 400);
  }

  const statusValidos = [
    "aguardando_aprovacao",
    "aprovado",
    "em_producao",
    "em_separacao",
    "faturado",
    "em_transito",
    "entregue",
    "cancelado",
  ];

  if (!statusValidos.includes(status)) {
    throw new AppError("Status inválido", 400);
  }

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      itens: {
        include: {
          produto: true,
        },
      },
    },
  });

  if (!pedido) {
    throw new AppError("Pedido não encontrado", 404);
  }

  const dataUpdate = {
    status,
  };

  // Adicionar timestamps específicos
  if (status === "aprovado") {
    dataUpdate.dataAprovacao = new Date();
    dataUpdate.aprovadoPorId = req.user.id;

    // Baixar estoque ao aprovar
    for (const item of pedido.itens) {
      await prisma.$transaction([
        // Atualizar estoque
        prisma.produto.update({
          where: { id: item.produtoId },
          data: {
            estoqueAtual: {
              decrement: parseInt(item.quantidade),
            },
          },
        }),
        // Registrar movimento
        prisma.movimentoEstoque.create({
          data: {
            produtoId: item.produtoId,
            tipo: "saida",
            quantidade: item.quantidade,
            estoqueAnterior: item.produto.estoqueAtual,
            estoquePosterior:
              item.produto.estoqueAtual - parseInt(item.quantidade),
            pedidoId: pedido.id,
            usuarioId: req.user.id,
            motivo: `Venda - Pedido ${pedido.numero}`,
          },
        }),
      ]);
    }
  } else if (status === "faturado") {
    dataUpdate.dataFaturamento = new Date();
  } else if (status === "entregue") {
    dataUpdate.dataEntregaRealizada = new Date();
  } else if (status === "cancelado") {
    dataUpdate.motivoCancelamento = motivoCancelamento;
    dataUpdate.canceladoPorId = req.user.id;

    // Se já foi aprovado, devolver estoque
    if (pedido.status === "aprovado" || pedido.status === "em_producao") {
      for (const item of pedido.itens) {
        await prisma.$transaction([
          // Atualizar estoque
          prisma.produto.update({
            where: { id: item.produtoId },
            data: {
              estoqueAtual: {
                increment: parseInt(item.quantidade),
              },
            },
          }),
          // Registrar movimento
          prisma.movimentoEstoque.create({
            data: {
              produtoId: item.produtoId,
              tipo: "entrada",
              quantidade: item.quantidade,
              estoqueAnterior: item.produto.estoqueAtual,
              estoquePosterior:
                item.produto.estoqueAtual + parseInt(item.quantidade),
              pedidoId: pedido.id,
              usuarioId: req.user.id,
              motivo: `Cancelamento - Pedido ${pedido.numero}`,
            },
          }),
        ]);
      }
    }
  }

  const pedidoAtualizado = await prisma.pedido.update({
    where: { id },
    data: dataUpdate,
    include: {
      cliente: true,
      vendedor: {
        select: {
          id: true,
          nome: true,
        },
      },
      itens: {
        include: {
          produto: true,
        },
      },
    },
  });

  await cache.delPattern("pedidos:*");
  await cache.delPattern("produtos:*");

  logger.info(
    `Status do pedido ${id} alterado para ${status} por ${req.user.email}`
  );

  res.json({
    success: true,
    data: pedidoAtualizado,
  });
});

/**
 * @desc    Deletar pedido
 * @route   DELETE /api/pedidos/:id
 * @access  Private (Admin only)
 */
export const deletePedido = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pedido = await prisma.pedido.findUnique({
    where: { id },
  });

  if (!pedido) {
    throw new AppError("Pedido não encontrado", 404);
  }

  // Não permitir exclusão de pedidos faturados ou entregues
  if (["faturado", "entregue", "em_transito"].includes(pedido.status)) {
    throw new AppError(
      "Pedido faturado, em trânsito ou entregue não pode ser deletado",
      400
    );
  }

  await prisma.pedido.delete({
    where: { id },
  });

  await cache.delPattern("pedidos:*");

  logger.info(`Pedido deletado: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    message: "Pedido deletado com sucesso",
  });
});

export default {
  getPedidos,
  getPedidosStats,
  getPedido,
  createPedido,
  updatePedido,
  updateStatusPedido,
  deletePedido,
};
