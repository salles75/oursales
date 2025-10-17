import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { cache } from "../config/redis.js";
import logger from "../config/logger.js";

const prisma = new PrismaClient();

/**
 * @desc    Listar tabelas de preços
 * @route   GET /api/tabelas-precos
 * @access  Private
 */
export const getTabelasPrecos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    industriaId,
    ativa = true,
    tipo,
    search,
    sortBy = "nome",
    sortOrder = "asc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Construir filtros
  const where = {
    ...(industriaId && { industriaId }),
    ...(ativa !== "todos" && { ativa: ativa === "true" }),
    ...(tipo && { tipo }),
    ...(search && {
      OR: [
        { nome: { contains: search, mode: "insensitive" } },
        { descricao: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Construir ordenação
  const orderBy = {
    [sortBy]: sortOrder,
  };

  // Cache key
  const cacheKey = `tabelas-precos:list:${JSON.stringify({
    page,
    limit,
    industriaId,
    ativa,
    tipo,
    search,
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
  const [tabelasPrecos, total] = await Promise.all([
    prisma.tabelaPreco.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        industria: {
          select: {
            id: true,
            nomeFantasia: true,
            razaoSocial: true,
          },
        },
        _count: {
          select: { produtos: true },
        },
      },
    }),
    prisma.tabelaPreco.count({ where }),
  ]);

  const result = {
    data: tabelasPrecos,
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
 * @desc    Obter uma tabela de preços
 * @route   GET /api/tabelas-precos/:id
 * @access  Private
 */
export const getTabelaPreco = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tabelaPreco = await prisma.tabelaPreco.findUnique({
    where: { id },
    include: {
      industria: {
        select: {
          id: true,
          nomeFantasia: true,
          razaoSocial: true,
        },
      },
      produtos: {
        include: {
          produto: {
            select: {
              id: true,
              codigo: true,
              nome: true,
              precoVenda: true,
              precoCusto: true,
              estoqueAtual: true,
              categoria: {
                select: {
                  id: true,
                  nome: true,
                },
              },
            },
          },
        },
        orderBy: {
          produto: {
            nome: "asc",
          },
        },
      },
    },
  });

  if (!tabelaPreco) {
    throw new AppError("Tabela de preços não encontrada", 404);
  }

  res.json({
    success: true,
    data: tabelaPreco,
  });
});

/**
 * @desc    Criar nova tabela de preços
 * @route   POST /api/tabelas-precos
 * @access  Private
 */
export const createTabelaPreco = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validações básicas
  if (!data.nome || !data.industriaId) {
    throw new AppError("Nome e Indústria são obrigatórios", 400);
  }

  // Verificar se indústria existe
  const industria = await prisma.industria.findUnique({
    where: { id: data.industriaId },
  });

  if (!industria) {
    throw new AppError("Indústria não encontrada", 404);
  }

  // Verificar se já existe tabela com mesmo nome na indústria
  const tabelaExistente = await prisma.tabelaPreco.findFirst({
    where: {
      nome: data.nome,
      industriaId: data.industriaId,
    },
  });

  if (tabelaExistente) {
    throw new AppError(
      "Já existe uma tabela de preços com este nome nesta indústria",
      400
    );
  }

  const tabelaPreco = await prisma.tabelaPreco.create({
    data: {
      ...data,
      margemMinima: data.margemMinima ? parseFloat(data.margemMinima) : null,
      descontoMaximo: data.descontoMaximo
        ? parseFloat(data.descontoMaximo)
        : null,
      validadeInicio: data.validadeInicio
        ? new Date(data.validadeInicio)
        : null,
      validadeFim: data.validadeFim ? new Date(data.validadeFim) : null,
    },
    include: {
      industria: {
        select: {
          id: true,
          nomeFantasia: true,
          razaoSocial: true,
        },
      },
      _count: {
        select: { produtos: true },
      },
    },
  });

  await cache.delPattern("tabelas-precos:list:*");

  logger.info(
    `Tabela de preços criada: ${tabelaPreco.id} por ${req.user.email}`
  );

  res.status(201).json({
    success: true,
    data: tabelaPreco,
  });
});

/**
 * @desc    Atualizar tabela de preços
 * @route   PUT /api/tabelas-precos/:id
 * @access  Private
 */
export const updateTabelaPreco = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const tabelaPreco = await prisma.tabelaPreco.findUnique({
    where: { id },
  });

  if (!tabelaPreco) {
    throw new AppError("Tabela de preços não encontrada", 404);
  }

  // Verificar se já existe tabela com mesmo nome na indústria
  if (data.nome && data.nome !== tabelaPreco.nome) {
    const tabelaExistente = await prisma.tabelaPreco.findFirst({
      where: {
        nome: data.nome,
        industriaId: data.industriaId || tabelaPreco.industriaId,
        id: { not: id },
      },
    });

    if (tabelaExistente) {
      throw new AppError(
        "Já existe uma tabela de preços com este nome nesta indústria",
        400
      );
    }
  }

  const tabelaPrecoAtualizada = await prisma.tabelaPreco.update({
    where: { id },
    data: {
      ...data,
      margemMinima: data.margemMinima
        ? parseFloat(data.margemMinima)
        : undefined,
      descontoMaximo: data.descontoMaximo
        ? parseFloat(data.descontoMaximo)
        : undefined,
      validadeInicio: data.validadeInicio
        ? new Date(data.validadeInicio)
        : undefined,
      validadeFim: data.validadeFim ? new Date(data.validadeFim) : undefined,
    },
    include: {
      industria: {
        select: {
          id: true,
          nomeFantasia: true,
          razaoSocial: true,
        },
      },
      _count: {
        select: { produtos: true },
      },
    },
  });

  await cache.delPattern("tabelas-precos:list:*");
  await cache.del(`tabela-preco:${id}`);

  logger.info(`Tabela de preços atualizada: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    data: tabelaPrecoAtualizada,
  });
});

/**
 * @desc    Deletar tabela de preços
 * @route   DELETE /api/tabelas-precos/:id
 * @access  Private
 */
export const deleteTabelaPreco = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tabelaPreco = await prisma.tabelaPreco.findUnique({
    where: { id },
    include: {
      _count: {
        select: { produtos: true },
      },
    },
  });

  if (!tabelaPreco) {
    throw new AppError("Tabela de preços não encontrada", 404);
  }

  // Verificar se tem produtos vinculados
  if (tabelaPreco._count.produtos > 0) {
    throw new AppError(
      `Não é possível excluir a tabela de preços. Existem ${tabelaPreco._count.produtos} produtos vinculados.`,
      400
    );
  }

  await prisma.tabelaPreco.delete({
    where: { id },
  });

  await cache.delPattern("tabelas-precos:list:*");
  await cache.del(`tabela-preco:${id}`);

  logger.info(`Tabela de preços deletada: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    message: "Tabela de preços deletada com sucesso",
  });
});

/**
 * @desc    Adicionar produto à tabela de preços
 * @route   POST /api/tabelas-precos/:id/produtos
 * @access  Private
 */
export const addProdutoToTabela = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { produtoId, preco, margemLucro, desconto, observacoes } = req.body;

  // Validações básicas
  if (!produtoId || !preco) {
    throw new AppError("Produto e preço são obrigatórios", 400);
  }

  // Verificar se tabela de preços existe
  const tabelaPreco = await prisma.tabelaPreco.findUnique({
    where: { id },
  });

  if (!tabelaPreco) {
    throw new AppError("Tabela de preços não encontrada", 404);
  }

  // Verificar se produto existe
  const produto = await prisma.produto.findUnique({
    where: { id: produtoId },
  });

  if (!produto) {
    throw new AppError("Produto não encontrado", 404);
  }

  // Verificar se produto já está na tabela
  const produtoExistente = await prisma.tabelaPrecoProduto.findUnique({
    where: {
      tabelaPrecoId_produtoId: {
        tabelaPrecoId: id,
        produtoId: produtoId,
      },
    },
  });

  if (produtoExistente) {
    throw new AppError("Produto já está nesta tabela de preços", 400);
  }

  const tabelaPrecoProduto = await prisma.tabelaPrecoProduto.create({
    data: {
      tabelaPrecoId: id,
      produtoId,
      preco: parseFloat(preco),
      margemLucro: margemLucro ? parseFloat(margemLucro) : null,
      desconto: desconto ? parseFloat(desconto) : 0,
      observacoes,
    },
    include: {
      produto: {
        select: {
          id: true,
          codigo: true,
          nome: true,
          precoVenda: true,
          precoCusto: true,
          estoqueAtual: true,
        },
      },
    },
  });

  await cache.delPattern("tabelas-precos:list:*");
  await cache.del(`tabela-preco:${id}`);

  logger.info(
    `Produto adicionado à tabela de preços: ${produtoId} -> ${id} por ${req.user.email}`
  );

  res.status(201).json({
    success: true,
    data: tabelaPrecoProduto,
  });
});

/**
 * @desc    Remover produto da tabela de preços
 * @route   DELETE /api/tabelas-precos/:id/produtos/:produtoId
 * @access  Private
 */
export const removeProdutoFromTabela = asyncHandler(async (req, res) => {
  const { id, produtoId } = req.params;

  const tabelaPrecoProduto = await prisma.tabelaPrecoProduto.findUnique({
    where: {
      tabelaPrecoId_produtoId: {
        tabelaPrecoId: id,
        produtoId: produtoId,
      },
    },
  });

  if (!tabelaPrecoProduto) {
    throw new AppError("Produto não encontrado nesta tabela de preços", 404);
  }

  await prisma.tabelaPrecoProduto.delete({
    where: {
      tabelaPrecoId_produtoId: {
        tabelaPrecoId: id,
        produtoId: produtoId,
      },
    },
  });

  await cache.delPattern("tabelas-precos:list:*");
  await cache.del(`tabela-preco:${id}`);

  logger.info(
    `Produto removido da tabela de preços: ${produtoId} -> ${id} por ${req.user.email}`
  );

  res.json({
    success: true,
    message: "Produto removido da tabela de preços com sucesso",
  });
});

/**
 * @desc    Atualizar preço do produto na tabela
 * @route   PUT /api/tabelas-precos/:id/produtos/:produtoId
 * @access  Private
 */
export const updateProdutoPreco = asyncHandler(async (req, res) => {
  const { id, produtoId } = req.params;
  const { preco, margemLucro, desconto, observacoes } = req.body;

  const tabelaPrecoProduto = await prisma.tabelaPrecoProduto.findUnique({
    where: {
      tabelaPrecoId_produtoId: {
        tabelaPrecoId: id,
        produtoId: produtoId,
      },
    },
  });

  if (!tabelaPrecoProduto) {
    throw new AppError("Produto não encontrado nesta tabela de preços", 404);
  }

  const tabelaPrecoProdutoAtualizada = await prisma.tabelaPrecoProduto.update({
    where: {
      tabelaPrecoId_produtoId: {
        tabelaPrecoId: id,
        produtoId: produtoId,
      },
    },
    data: {
      preco: preco ? parseFloat(preco) : undefined,
      margemLucro: margemLucro ? parseFloat(margemLucro) : undefined,
      desconto: desconto ? parseFloat(desconto) : undefined,
      observacoes,
    },
    include: {
      produto: {
        select: {
          id: true,
          codigo: true,
          nome: true,
          precoVenda: true,
          precoCusto: true,
          estoqueAtual: true,
        },
      },
    },
  });

  await cache.delPattern("tabelas-precos:list:*");
  await cache.del(`tabela-preco:${id}`);

  logger.info(
    `Preço do produto atualizado na tabela: ${produtoId} -> ${id} por ${req.user.email}`
  );

  res.json({
    success: true,
    data: tabelaPrecoProdutoAtualizada,
  });
});

/**
 * @desc    Importar produtos em massa para tabela de preços
 * @route   POST /api/tabelas-precos/:id/produtos/import
 * @access  Private
 */
export const importProdutosToTabela = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { produtos } = req.body;

  if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
    throw new AppError("Lista de produtos é obrigatória", 400);
  }

  // Verificar se tabela de preços existe
  const tabelaPreco = await prisma.tabelaPreco.findUnique({
    where: { id },
  });

  if (!tabelaPreco) {
    throw new AppError("Tabela de preços não encontrada", 404);
  }

  // Validar produtos
  const produtosValidos = [];
  const erros = [];

  for (let i = 0; i < produtos.length; i++) {
    const produto = produtos[i];

    if (!produto.produtoId || !produto.preco) {
      erros.push(`Linha ${i + 1}: Produto e preço são obrigatórios`);
      continue;
    }

    // Verificar se produto existe
    const produtoExistente = await prisma.produto.findUnique({
      where: { id: produto.produtoId },
    });

    if (!produtoExistente) {
      erros.push(`Linha ${i + 1}: Produto não encontrado`);
      continue;
    }

    // Verificar se produto já está na tabela
    const jaExiste = await prisma.tabelaPrecoProduto.findUnique({
      where: {
        tabelaPrecoId_produtoId: {
          tabelaPrecoId: id,
          produtoId: produto.produtoId,
        },
      },
    });

    if (jaExiste) {
      erros.push(`Linha ${i + 1}: Produto já está nesta tabela de preços`);
      continue;
    }

    produtosValidos.push({
      tabelaPrecoId: id,
      produtoId: produto.produtoId,
      preco: parseFloat(produto.preco),
      margemLucro: produto.margemLucro ? parseFloat(produto.margemLucro) : null,
      desconto: produto.desconto ? parseFloat(produto.desconto) : 0,
      observacoes: produto.observacoes || null,
    });
  }

  if (erros.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Erros na validação dos produtos",
      errors: erros,
    });
  }

  // Inserir produtos em lote
  const resultado = await prisma.tabelaPrecoProduto.createMany({
    data: produtosValidos,
  });

  await cache.delPattern("tabelas-precos:list:*");
  await cache.del(`tabela-preco:${id}`);

  logger.info(
    `${resultado.count} produtos importados para tabela de preços ${id} por ${req.user.email}`
  );

  res.status(201).json({
    success: true,
    message: `${resultado.count} produtos importados com sucesso`,
    data: {
      importados: resultado.count,
      total: produtos.length,
    },
  });
});
