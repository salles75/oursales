/**
 * Controller de Produtos
 */

import { prisma } from "../config/database.js";
import { cache } from "../config/redis.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../config/logger.js";

/**
 * @desc    Listar todos os produtos
 * @route   GET /api/produtos
 * @access  Private
 */
export const getProdutos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    ativo,
    categoriaId,
    search,
    sortBy = "nome",
    order = "asc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {};

  if (ativo !== undefined) {
    where.ativo = ativo === "true";
  }

  if (categoriaId) {
    where.categoriaId = categoriaId;
  }

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: "insensitive" } },
      { codigo: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { descricao: { contains: search, mode: "insensitive" } },
    ];
  }

  const cacheKey = `produtos:list:${JSON.stringify(req.query)}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json({
      success: true,
      data: cached.data,
      pagination: cached.pagination,
      cached: true,
    });
  }

  const [produtos, total] = await Promise.all([
    prisma.produto.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: order },
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
        criadoPor: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    }),
    prisma.produto.count({ where }),
  ]);

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
  };

  await cache.set(cacheKey, { data: produtos, pagination }, 300);

  res.json({
    success: true,
    data: produtos,
    pagination,
  });
});

/**
 * @desc    Obter estatísticas de produtos
 * @route   GET /api/produtos/stats
 * @access  Private
 */
export const getProdutosStats = asyncHandler(async (req, res) => {
  const cacheKey = "produtos:stats";
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json({
      success: true,
      data: cached,
      cached: true,
    });
  }

  const [totalProdutos, ativos, inativos, estoqueTotal, produtosEstoqueBaixo] =
    await Promise.all([
      prisma.produto.count(),
      prisma.produto.count({ where: { ativo: true } }),
      prisma.produto.count({ where: { ativo: false } }),
      prisma.produto.aggregate({
        _sum: {
          estoqueAtual: true,
        },
      }),
      prisma.produto.count({
        where: {
          estoqueAtual: {
            lte: prisma.produto.fields.estoqueMinimo,
          },
          ativo: true,
        },
      }),
    ]);

  const stats = {
    totalProdutos,
    ativos,
    inativos,
    estoqueTotal: estoqueTotal._sum.estoqueAtual || 0,
    produtosEstoqueBaixo,
  };

  await cache.set(cacheKey, stats, 600);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * @desc    Obter um produto específico
 * @route   GET /api/produtos/:id
 * @access  Private
 */
export const getProduto = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cacheKey = `produto:${id}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json({
      success: true,
      data: cached,
      cached: true,
    });
  }

  const produto = await prisma.produto.findUnique({
    where: { id },
    include: {
      categoria: true,
      criadoPor: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      _count: {
        select: {
          orcamentosItens: true,
          pedidosItens: true,
          movimentosEstoque: true,
        },
      },
    },
  });

  if (!produto) {
    throw new AppError("Produto não encontrado", 404);
  }

  await cache.set(cacheKey, produto, 300);

  res.json({
    success: true,
    data: produto,
  });
});

/**
 * @desc    Criar novo produto
 * @route   POST /api/produtos
 * @access  Private
 */
export const createProduto = asyncHandler(async (req, res) => {
  const data = req.body;

  // Validações básicas
  if (!data.codigo || !data.nome || !data.precoVenda) {
    throw new AppError("Código, nome e preço de venda são obrigatórios", 400);
  }

  // Verificar se código já existe
  const produtoExistente = await prisma.produto.findUnique({
    where: { codigo: data.codigo },
  });

  if (produtoExistente) {
    throw new AppError("Já existe um produto com este código", 400);
  }

  // Adicionar ID do criador
  data.criadoPorId = req.user.id;

  // Calcular margem de lucro se tiver custo e preço
  if (data.precoCusto && data.precoVenda) {
    const custo = parseFloat(data.precoCusto);
    const venda = parseFloat(data.precoVenda);
    if (custo > 0) {
      data.margemLucro = ((venda - custo) / custo) * 100;
    }
  }

  const produto = await prisma.produto.create({
    data,
    include: {
      categoria: true,
      criadoPor: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });

  await cache.delPattern("produtos:list:*");
  await cache.delPattern("produtos:stats");

  logger.info(`Produto criado: ${produto.id} por ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: produto,
  });
});

/**
 * @desc    Atualizar produto
 * @route   PUT /api/produtos/:id
 * @access  Private
 */
export const updateProduto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const produtoExistente = await prisma.produto.findUnique({
    where: { id },
  });

  if (!produtoExistente) {
    throw new AppError("Produto não encontrado", 404);
  }

  // Remover campos que não podem ser atualizados
  delete data.id;
  delete data.criadoEm;
  delete data.criadoPorId;

  // Recalcular margem de lucro
  if (data.precoCusto && data.precoVenda) {
    const custo = parseFloat(data.precoCusto);
    const venda = parseFloat(data.precoVenda);
    if (custo > 0) {
      data.margemLucro = ((venda - custo) / custo) * 100;
    }
  }

  const produto = await prisma.produto.update({
    where: { id },
    data,
    include: {
      categoria: true,
    },
  });

  await cache.del(`produto:${id}`);
  await cache.delPattern("produtos:list:*");
  await cache.delPattern("produtos:stats");

  logger.info(`Produto atualizado: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    data: produto,
  });
});

/**
 * @desc    Deletar produto
 * @route   DELETE /api/produtos/:id
 * @access  Private (Admin only)
 */
export const deleteProduto = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const produto = await prisma.produto.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orcamentosItens: true,
          pedidosItens: true,
        },
      },
    },
  });

  if (!produto) {
    throw new AppError("Produto não encontrado", 404);
  }

  if (produto._count.pedidosItens > 0 || produto._count.orcamentosItens > 0) {
    throw new AppError(
      "Não é possível deletar produto com orçamentos ou pedidos. Considere inativá-lo.",
      400
    );
  }

  await prisma.produto.delete({
    where: { id },
  });

  await cache.del(`produto:${id}`);
  await cache.delPattern("produtos:list:*");
  await cache.delPattern("produtos:stats");

  logger.info(`Produto deletado: ${id} por ${req.user.email}`);

  res.json({
    success: true,
    message: "Produto deletado com sucesso",
  });
});

/**
 * @desc    Ajustar estoque do produto
 * @route   POST /api/produtos/:id/estoque
 * @access  Private
 */
export const ajustarEstoque = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tipo, quantidade, motivo, observacoes } = req.body;

  if (!["entrada", "saida", "ajuste"].includes(tipo)) {
    throw new AppError("Tipo de movimento inválido", 400);
  }

  if (!quantidade || quantidade <= 0) {
    throw new AppError("Quantidade deve ser maior que zero", 400);
  }

  const produto = await prisma.produto.findUnique({
    where: { id },
  });

  if (!produto) {
    throw new AppError("Produto não encontrado", 404);
  }

  const estoqueAnterior = produto.estoqueAtual;
  let estoquePosterior = estoqueAnterior;

  if (tipo === "entrada") {
    estoquePosterior = estoqueAnterior + parseInt(quantidade);
  } else if (tipo === "saida") {
    estoquePosterior = estoqueAnterior - parseInt(quantidade);
  } else if (tipo === "ajuste") {
    estoquePosterior = parseInt(quantidade);
  }

  if (estoquePosterior < 0) {
    throw new AppError("Estoque não pode ser negativo", 400);
  }

  // Atualizar produto e criar movimento em uma transação
  const [produtoAtualizado, movimento] = await prisma.$transaction([
    prisma.produto.update({
      where: { id },
      data: {
        estoqueAtual: estoquePosterior,
      },
    }),
    prisma.movimentoEstoque.create({
      data: {
        produtoId: id,
        tipo,
        quantidade,
        estoqueAnterior,
        estoquePosterior,
        usuarioId: req.user.id,
        motivo,
        observacoes,
      },
    }),
  ]);

  await cache.del(`produto:${id}`);
  await cache.delPattern("produtos:list:*");
  await cache.delPattern("produtos:stats");

  logger.info(
    `Estoque ajustado: Produto ${id}, ${tipo} de ${quantidade} unidades por ${req.user.email}`
  );

  res.json({
    success: true,
    data: {
      produto: produtoAtualizado,
      movimento,
    },
  });
});

/**
 * @desc    Obter histórico de movimentações de estoque
 * @route   GET /api/produtos/:id/movimentos
 * @access  Private
 */
export const getMovimentosEstoque = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [movimentos, total] = await Promise.all([
    prisma.movimentoEstoque.findMany({
      where: { produtoId: id },
      skip,
      take,
      orderBy: { dataMovimento: "desc" },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
          },
        },
        pedido: {
          select: {
            id: true,
            numero: true,
          },
        },
      },
    }),
    prisma.movimentoEstoque.count({
      where: { produtoId: id },
    }),
  ]);

  res.json({
    success: true,
    data: movimentos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc    Importar produtos de arquivo CSV/Excel
 * @route   POST /api/produtos/importar
 * @access  Private
 */
export const importarProdutos = asyncHandler(async (req, res) => {
  const { industriaId, tabelaPrecoId, dados } = req.body;

  if (!industriaId || !tabelaPrecoId || !dados || !Array.isArray(dados)) {
    throw new AppError("Dados de importação inválidos", 400);
  }

  // Verificar se a indústria existe
  const industria = await prisma.industria.findUnique({
    where: { id: industriaId },
  });

  if (!industria) {
    throw new AppError("Indústria não encontrada", 404);
  }

  // Verificar se a tabela de preços existe
  const tabelaPreco = await prisma.tabelaPreco.findUnique({
    where: { id: tabelaPrecoId },
  });

  if (!tabelaPreco) {
    throw new AppError("Tabela de preços não encontrada", 404);
  }

  const produtosImportados = [];
  const erros = [];

  // Processar cada linha de dados
  for (let i = 0; i < dados.length; i++) {
    const linha = dados[i];

    try {
      // Validações obrigatórias
      if (!linha.codigo || !linha.nome) {
        erros.push({
          linha: i + 1,
          erro: "Código e nome são obrigatórios",
          dados: linha,
        });
        continue;
      }

      // Verificar se produto já existe (por código ou SKU)
      const produtoExistente = await prisma.produto.findFirst({
        where: {
          OR: [
            { codigo: linha.codigo },
            { sku: linha.codigo },
          ],
        },
      });

      if (produtoExistente) {
        erros.push({
          linha: i + 1,
          erro: "Produto com este código/SKU já existe",
          dados: linha,
        });
        continue;
      }

      // Processar ST-UF
      const stUf = linha.stUf || linha["st-uf"] || linha.stuf || linha.st_uf || null;
      
      // Preparar observações incluindo ST-UF se existir
      let observacoes = linha.observacoes || "";
      if (stUf) {
        observacoes = observacoes
          ? `${observacoes}\nST-UF: ${stUf}`
          : `ST-UF: ${stUf}`;
      }

      // Preparar dados do produto
      const dadosProduto = {
        codigo: linha.codigo,
        sku: linha.codigo, // Código importado vai para SKU
        nome: linha.nome,
        descricao: linha.nome, // Nome do produto é usado como descrição
        precoVenda: parseFloat(linha.preco || 0),
        unidadeMedida: linha.unidade || "UN",
        ipi: linha.ipi ? parseFloat(linha.ipi) : 0,
        icms: linha.icms ? parseFloat(linha.icms) : null,
        cest: linha.cest || null,
        ean: linha.codigoBarras || linha.ean || null,
        industriaId,
        criadoPorId: req.user.id,
        ativo: true,
        estoqueAtual: 0,
        estoqueMinimo: 0,
      };
      
      // Adicionar observações se houver (além do nome)
      if (observacoes && observacoes !== linha.nome) {
        dadosProduto.descricaoDetalhada = observacoes;
      }

      // Criar produto
      const produto = await prisma.produto.create({
        data: dadosProduto,
        include: {
          industria: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
        },
      });

      // Adicionar produto à tabela de preços com o preço e ST-UF
      const precoTabela = parseFloat(linha.preco || 0);
      let observacoesTabela = "";
      if (stUf) {
        observacoesTabela = `ST-UF: ${stUf}`;
      }
      if (linha.observacoes) {
        observacoesTabela = observacoesTabela
          ? `${observacoesTabela}\n${linha.observacoes}`
          : linha.observacoes;
      }

      // Verificar se produto já está na tabela
      const produtoNaTabela = await prisma.tabelaPrecoProduto.findUnique({
        where: {
          tabelaPrecoId_produtoId: {
            tabelaPrecoId: tabelaPrecoId,
            produtoId: produto.id,
          },
        },
      });

      if (produtoNaTabela) {
        // Atualizar se já existir
        await prisma.tabelaPrecoProduto.update({
          where: {
            tabelaPrecoId_produtoId: {
              tabelaPrecoId: tabelaPrecoId,
              produtoId: produto.id,
            },
          },
          data: {
            preco: precoTabela,
            observacoes: observacoesTabela || null,
          },
        });
      } else {
        // Criar novo registro na tabela de preços
        await prisma.tabelaPrecoProduto.create({
          data: {
            tabelaPrecoId: tabelaPrecoId,
            produtoId: produto.id,
            preco: precoTabela,
            observacoes: observacoesTabela || null,
            ativo: true,
          },
        });
      }

      produtosImportados.push(produto);
    } catch (error) {
      erros.push({
        linha: i + 1,
        erro: error.message,
        dados: linha,
      });
    }
  }

  // Limpar cache
  await cache.delPattern("produtos:list:*");
  await cache.delPattern("produtos:stats");
  await cache.delPattern("tabelas-precos:list:*");
  await cache.del(`tabela-preco:${tabelaPrecoId}`);

  logger.info(
    `Importação de produtos: ${produtosImportados.length} importados, ${erros.length} erros por ${req.user.email}`
  );

  res.status(201).json({
    success: true,
    data: {
      produtosImportados,
      erros,
      totalProcessados: dados.length,
      totalImportados: produtosImportados.length,
      totalErros: erros.length,
    },
  });
});

/**
 * @desc    Obter template de importação
 * @route   GET /api/produtos/template
 * @access  Private
 */
export const getTemplateImportacao = asyncHandler(async (req, res) => {
  const template = {
    campos: [
      {
        nome: "codigo",
        obrigatorio: true,
        descricao: "Código do produto (obrigatório)",
        exemplo: "PROD001",
      },
      {
        nome: "nome",
        obrigatorio: true,
        descricao: "Nome do produto (obrigatório)",
        exemplo: "Produto Exemplo",
      },
      {
        nome: "preco",
        obrigatorio: false,
        descricao: "Preço de venda",
        exemplo: "25.50",
      },
      {
        nome: "unidade",
        obrigatorio: false,
        descricao: "Unidade de medida",
        exemplo: "UNID",
      },
      {
        nome: "embalagem",
        obrigatorio: false,
        descricao: "Tipo de embalagem",
        exemplo: "Caixa",
      },
      {
        nome: "fatorEmbalagem",
        obrigatorio: false,
        descricao: "Fator de conversão da embalagem",
        exemplo: "12",
      },
      {
        nome: "dataLancamento",
        obrigatorio: false,
        descricao: "Data de lançamento (YYYY-MM-DD)",
        exemplo: "2024-01-15",
      },
      {
        nome: "ipi",
        obrigatorio: false,
        descricao: "Alíquota de IPI (%)",
        exemplo: "5",
      },
      {
        nome: "icms",
        obrigatorio: false,
        descricao: "Alíquota de ICMS (%)",
        exemplo: "18",
      },
      {
        nome: "cest",
        obrigatorio: false,
        descricao: "Código CEST",
        exemplo: "1234567",
      },
      {
        nome: "cfop",
        obrigatorio: false,
        descricao: "Código CFOP",
        exemplo: "5102",
      },
      {
        nome: "observacoes",
        obrigatorio: false,
        descricao: "Observações adicionais",
        exemplo: "Produto de exemplo",
      },
      {
        nome: "comissaoProduto",
        obrigatorio: false,
        descricao: "Comissão por produto (%)",
        exemplo: "5",
      },
      {
        nome: "codigoBarras",
        obrigatorio: false,
        descricao: "Código de barras GTIN",
        exemplo: "1234567890123",
      },
    ],
    exemplo: [
      {
        codigo: "PROD001",
        nome: "Produto Exemplo 1",
        preco: "25.50",
        unidade: "UNID",
        embalagem: "Caixa",
        fatorEmbalagem: "12",
        dataLancamento: "2024-01-15",
        ipi: "5",
        icms: "18",
        cest: "1234567",
        cfop: "5102",
        observacoes: "Produto de exemplo",
        comissaoProduto: "5",
        codigoBarras: "1234567890123",
      },
    ],
  };

  res.json({
    success: true,
    data: template,
  });
});

export default {
  getProdutos,
  getProdutosStats,
  getProduto,
  createProduto,
  updateProduto,
  deleteProduto,
  ajustarEstoque,
  getMovimentosEstoque,
  importarProdutos,
  getTemplateImportacao,
};
