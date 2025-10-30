/**
 * Controller de Orçamentos
 */

import { prisma } from "../config/database.js";
import { cache } from "../config/redis.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../config/logger.js";

/**
 * Gerar número único de orçamento
 */
async function gerarNumeroOrcamento() {
  const ano = new Date().getFullYear();
  const count = await prisma.orcamento.count({
    where: {
      numero: {
        startsWith: `ORC-${ano}-`,
      },
    },
  });
  return `ORC-${ano}-${String(count + 1).padStart(6, "0")}`;
}

/**
 * @desc    Listar todos os orçamentos
 * @route   GET /api/orcamentos
 * @access  Private
 */
export const getOrcamentos = asyncHandler(async (req, res) => {
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

  const [orcamentos, total] = await Promise.all([
    prisma.orcamento.findMany({
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
        _count: {
          select: {
            itens: true,
          },
        },
      },
    }),
    prisma.orcamento.count({ where }),
  ]);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
  };

  res.json({
    success: true,
    data: orcamentos,
    pagination,
  });
});

/**
 * @desc    Obter um orçamento específico
 * @route   GET /api/orcamentos/:id
 * @access  Private
 */
export const getOrcamento = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const orcamento = await prisma.orcamento.findUnique({
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
    },
  });

  if (!orcamento) {
    throw new AppError("Orçamento não encontrado", 404);
  }

  res.json({
    success: true,
    data: orcamento,
  });
});

/**
 * @desc    Criar novo orçamento
 * @route   POST /api/orcamentos
 * @access  Private
 */
export const createOrcamento = asyncHandler(async (req, res) => {
  const { clienteId, dataValidade, itens, ...rest } = req.body;

  if (!clienteId || !dataValidade || !itens || itens.length === 0) {
    throw new AppError(
      "Cliente, data de validade e itens são obrigatórios",
      400
    );
  }

  // Gerar número do orçamento
  const numero = await gerarNumeroOrcamento();

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

  const orcamento = await prisma.orcamento.create({
    data: {
      numero,
      clienteId,
      vendedorId: rest.vendedorId || req.user.id,
      dataValidade: new Date(dataValidade),
      subtotal,
      descontoValor,
      descontoPercentual: rest.descontoPercentual || 0,
      acrescimoValor,
      valorFrete,
      valorTotal,
      condicaoPagamento: rest.condicaoPagamento,
      formaPagamento: rest.formaPagamento,
      prazoEntregaDias: rest.prazoEntregaDias,
      transportadoraId: rest.transportadoraId,
      observacoes: rest.observacoes,
      observacoesInternas: rest.observacoesInternas,
      status: "em_analise",
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

  await cache.delPattern("orcamentos:*");

  logger.info(`Orçamento criado: ${orcamento.id} por ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: orcamento,
  });
});

/**
 * @desc    Atualizar orçamento
 * @route   PUT /api/orcamentos/:id
 * @access  Private
 */
export const updateOrcamento = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { itens, ...rest } = req.body;

  const orcamentoExistente = await prisma.orcamento.findUnique({
    where: { id },
    include: { itens: true },
  });

  if (!orcamentoExistente) {
    throw new AppError("Orçamento não encontrado", 404);
  }

  if (orcamentoExistente.convertidoPedido) {
    throw new AppError(
      "Orçamento já foi convertido em pedido e não pode ser alterado",
      400
    );
  }

  // Se houver itens, recalcular valores
  let dataToUpdate = { ...rest };

  if (itens && itens.length > 0) {
    // Deletar itens antigos
    await prisma.orcamentoItem.deleteMany({
      where: { orcamentoId: id },
    });

    // Calcular novos valores
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

    dataToUpdate.subtotal = subtotal;
    dataToUpdate.valorTotal = valorTotal;
    dataToUpdate.itens = {
      create: itensProcessados,
    };
  }

  delete dataToUpdate.id;
  delete dataToUpdate.numero;
  delete dataToUpdate.criadoEm;
  delete dataToUpdate.criadoPorId;

  const orcamento = await prisma.orcamento.update({
    where: { id },
    data: dataToUpdate,
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

  await cache.delPattern("orcamentos:*");

  logger.info(`Orçamento atualizado: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    data: orcamento,
  });
});

/**
 * @desc    Deletar orçamento
 * @route   DELETE /api/orcamentos/:id
 * @access  Private
 */
export const deleteOrcamento = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const orcamento = await prisma.orcamento.findUnique({
    where: { id },
  });

  if (!orcamento) {
    throw new AppError("Orçamento não encontrado", 404);
  }

  if (orcamento.convertidoPedido) {
    throw new AppError(
      "Orçamento já foi convertido em pedido e não pode ser deletado",
      400
    );
  }

  await prisma.orcamento.delete({
    where: { id },
  });

  await cache.delPattern("orcamentos:*");

  logger.info(`Orçamento deletado: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    message: "Orçamento deletado com sucesso",
  });
});

/**
 * @desc    Converter orçamento em pedido
 * @route   POST /api/orcamentos/:id/converter
 * @access  Private
 */
export const converterParaPedido = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const orcamento = await prisma.orcamento.findUnique({
    where: { id },
    include: {
      itens: {
        include: {
          produto: true,
        },
      },
    },
  });

  if (!orcamento) {
    throw new AppError("Orçamento não encontrado", 404);
  }

  if (orcamento.convertidoPedido) {
    throw new AppError("Orçamento já foi convertido em pedido", 400);
  }

  if (orcamento.status === "rejeitado" || orcamento.status === "expirado") {
    throw new AppError(
      "Orçamento rejeitado ou expirado não pode ser convertido",
      400
    );
  }

  // Gerar número do pedido
  const ano = new Date().getFullYear();
  const countPedidos = await prisma.pedido.count({
    where: {
      numero: {
        startsWith: `PED-${ano}-`,
      },
    },
  });
  const numeroPedido = `PED-${ano}-${String(countPedidos + 1).padStart(
    6,
    "0"
  )}`;

  // Criar pedido baseado no orçamento
  const pedido = await prisma.pedido.create({
    data: {
      numero: numeroPedido,
      clienteId: orcamento.clienteId,
      vendedorId: orcamento.vendedorId,
      orcamentoId: orcamento.id,
      transportadoraId: orcamento.transportadoraId,
      subtotal: orcamento.subtotal,
      descontoValor: orcamento.descontoValor,
      descontoPercentual: orcamento.descontoPercentual,
      acrescimoValor: orcamento.acrescimoValor,
      valorFrete: orcamento.valorFrete,
      valorTotal: orcamento.valorTotal,
      condicaoPagamento: orcamento.condicaoPagamento,
      formaPagamento: orcamento.formaPagamento,
      prazoEntregaDias: orcamento.prazoEntregaDias,
      observacoes: orcamento.observacoes,
      observacoesInternas: orcamento.observacoesInternas,
      status: "aguardando_aprovacao",
      criadoPorId: req.user.id,
      itens: {
        create: orcamento.itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          descontoPercentual: item.descontoPercentual,
          descontoValor: item.descontoValor,
          subtotal: item.subtotal,
          observacoes: item.observacoes,
          ordem: item.ordem,
        })),
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

  // Atualizar orçamento
  await prisma.orcamento.update({
    where: { id },
    data: {
      convertidoPedido: true,
      pedidoId: pedido.id,
      dataConversao: new Date(),
      status: "convertido",
    },
  });

  await cache.delPattern("orcamentos:*");
  await cache.delPattern("pedidos:*");

  logger.info(
    `Orçamento ${id} convertido em pedido ${pedido.id} por ${req.user.email}`
  );

  res.status(201).json({
    success: true,
    data: pedido,
    message: "Orçamento convertido em pedido com sucesso",
  });
});

export default {
  getOrcamentos,
  getOrcamento,
  createOrcamento,
  updateOrcamento,
  deleteOrcamento,
  converterParaPedido,
};
