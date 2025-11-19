/**
 * Controller de Dashboard
 * Fornece dados para gráficos e métricas do dashboard
 */

import { prisma } from "../config/database.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { redis } from "../config/redis.js";

/**
 * @desc    Obter estatísticas gerais do dashboard
 * @route   GET /api/dashboard
 * @access  Private
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const { id: usuarioId } = req.user;
  const { periodo = "30" } = req.query; // dias

  const cacheKey = `dashboard:stats:${usuarioId}:${periodo}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));

  // Total de vendas (pedidos aprovados)
  const totalVendas = await prisma.pedido.count({
    where: {
      status: {
        in: ["aprovado", "em_producao", "faturado", "entregue"],
      },
      dataPedido: {
        gte: dataInicio,
      },
    },
  });

  // Total de clientes
  const totalClientes = await prisma.cliente.count({
    where: {
      status: "ativo",
    },
  });

  // Pedidos abertos
  const pedidosAbertos = await prisma.pedido.count({
    where: {
      status: {
        in: ["aguardando_aprovacao", "aprovado", "em_producao"],
      },
    },
  });

  // Orçamentos pendentes
  const orcamentosPendentes = await prisma.orcamento.count({
    where: {
      status: {
        in: ["em_analise", "enviado"],
      },
      dataValidade: {
        gte: new Date(),
      },
    },
  });

  // Faturamento do mês
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const pedidosMes = await prisma.pedido.findMany({
    where: {
      status: {
        in: ["aprovado", "em_producao", "faturado", "entregue"],
      },
      dataPedido: {
        gte: inicioMes,
      },
    },
    select: {
      valorTotal: true,
    },
  });

  const faturamentoMes = pedidosMes.reduce(
    (sum, p) => sum + Number(p.valorTotal || 0),
    0
  );

  // Ticket médio
  const ticketMedio =
    pedidosMes.length > 0 ? faturamentoMes / pedidosMes.length : 0;

  const stats = {
    totalVendas,
    totalClientes,
    pedidosAbertos,
    orcamentosPendentes,
    faturamentoMes,
    ticketMedio,
  };

  await redis.setex(cacheKey, 300, JSON.stringify({ success: true, data: stats }));

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * @desc    Obter dados de vendas por período
 * @route   GET /api/dashboard/vendas
 * @access  Private
 */
export const getVendasPorPeriodo = asyncHandler(async (req, res) => {
  const { id: usuarioId } = req.user;
  const { periodo = "30", tipo = "dia" } = req.query; // tipo: dia, semana, mes

  const cacheKey = `dashboard:vendas:${usuarioId}:${periodo}:${tipo}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));

  const pedidos = await prisma.pedido.findMany({
    where: {
      status: {
        in: ["aprovado", "em_producao", "faturado", "entregue"],
      },
      dataPedido: {
        gte: dataInicio,
      },
    },
    select: {
      dataPedido: true,
      valorTotal: true,
    },
    orderBy: {
      dataPedido: "asc",
    },
  });

  // Agrupar por período
  const agrupado = {};
  pedidos.forEach((pedido) => {
    const data = new Date(pedido.dataPedido);
    let chave;

    if (tipo === "dia") {
      chave = data.toISOString().split("T")[0]; // YYYY-MM-DD
    } else if (tipo === "semana") {
      const semana = getWeekNumber(data);
      chave = `${data.getFullYear()}-W${semana}`;
    } else if (tipo === "mes") {
      chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
    }

    if (!agrupado[chave]) {
      agrupado[chave] = { periodo: chave, valor: 0, quantidade: 0 };
    }
    agrupado[chave].valor += Number(pedido.valorTotal || 0);
    agrupado[chave].quantidade += 1;
  });

  const dados = Object.values(agrupado).sort((a, b) =>
    a.periodo.localeCompare(b.periodo)
  );

  await redis.setex(cacheKey, 300, JSON.stringify({ success: true, data: dados }));

  res.json({
    success: true,
    data: dados,
  });
});

/**
 * @desc    Obter vendas por vendedor
 * @route   GET /api/dashboard/vendedores
 * @access  Private
 */
export const getVendasPorVendedor = asyncHandler(async (req, res) => {
  const { id: usuarioId } = req.user;
  const { periodo = "30" } = req.query;

  const cacheKey = `dashboard:vendedores:${usuarioId}:${periodo}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));

  const pedidos = await prisma.pedido.findMany({
    where: {
      status: {
        in: ["aprovado", "em_producao", "faturado", "entregue"],
      },
      dataPedido: {
        gte: dataInicio,
      },
    },
    select: {
      vendedorId: true,
      vendedor: {
        select: {
          id: true,
          nome: true,
        },
      },
      valorTotal: true,
    },
  });

  // Agrupar por vendedor
  const agrupado = {};
  pedidos.forEach((pedido) => {
    const vendedorId = pedido.vendedorId || "sem-vendedor";
    const vendedorNome = pedido.vendedor?.nome || "Sem Vendedor";

    if (!agrupado[vendedorId]) {
      agrupado[vendedorId] = {
        vendedorId,
        vendedorNome,
        valor: 0,
        quantidade: 0,
      };
    }
    agrupado[vendedorId].valor += Number(pedido.valorTotal || 0);
    agrupado[vendedorId].quantidade += 1;
  });

  const dados = Object.values(agrupado).sort((a, b) => b.valor - a.valor);

  await redis.setex(cacheKey, 300, JSON.stringify({ success: true, data: dados }));

  res.json({
    success: true,
    data: dados,
  });
});

/**
 * @desc    Obter vendas por cliente
 * @route   GET /api/dashboard/clientes
 * @access  Private
 */
export const getVendasPorCliente = asyncHandler(async (req, res) => {
  const { id: usuarioId } = req.user;
  const { periodo = "30", limite = "10" } = req.query;

  const cacheKey = `dashboard:clientes:${usuarioId}:${periodo}:${limite}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));

  const pedidos = await prisma.pedido.findMany({
    where: {
      status: {
        in: ["aprovado", "em_producao", "faturado", "entregue"],
      },
      dataPedido: {
        gte: dataInicio,
      },
    },
    select: {
      clienteId: true,
      cliente: {
        select: {
          id: true,
          nomeCompleto: true,
          razaoSocial: true,
          nomeFantasia: true,
        },
      },
      valorTotal: true,
    },
  });

  // Agrupar por cliente
  const agrupado = {};
  pedidos.forEach((pedido) => {
    const clienteId = pedido.clienteId;
    const clienteNome =
      pedido.cliente?.nomeCompleto ||
      pedido.cliente?.razaoSocial ||
      pedido.cliente?.nomeFantasia ||
      "Cliente Desconhecido";

    if (!agrupado[clienteId]) {
      agrupado[clienteId] = {
        clienteId,
        clienteNome,
        valor: 0,
        quantidade: 0,
      };
    }
    agrupado[clienteId].valor += Number(pedido.valorTotal || 0);
    agrupado[clienteId].quantidade += 1;
  });

  const dados = Object.values(agrupado)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, parseInt(limite));

  await redis.setex(cacheKey, 300, JSON.stringify({ success: true, data: dados }));

  res.json({
    success: true,
    data: dados,
  });
});

/**
 * @desc    Obter vendas por indústria
 * @route   GET /api/dashboard/industrias
 * @access  Private
 */
export const getVendasPorIndustria = asyncHandler(async (req, res) => {
  const { id: usuarioId } = req.user;
  const { periodo = "30" } = req.query;

  const cacheKey = `dashboard:industrias:${usuarioId}:${periodo}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));

  const pedidosItens = await prisma.pedidoItem.findMany({
    where: {
      pedido: {
        status: {
          in: ["aprovado", "em_producao", "faturado", "entregue"],
        },
        dataPedido: {
          gte: dataInicio,
        },
      },
    },
    select: {
      produto: {
        select: {
          industriaId: true,
          industria: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
        },
      },
      subtotal: true,
      quantidade: true,
    },
  });

  // Agrupar por indústria
  const agrupado = {};
  pedidosItens.forEach((item) => {
    const industriaId = item.produto?.industriaId || "sem-industria";
    const industriaNome =
      item.produto?.industria?.nomeFantasia ||
      item.produto?.industria?.razaoSocial ||
      "Sem Indústria";

    if (!agrupado[industriaId]) {
      agrupado[industriaId] = {
        industriaId,
        industriaNome,
        valor: 0,
        quantidade: 0,
      };
    }
    agrupado[industriaId].valor += Number(item.subtotal || 0);
    agrupado[industriaId].quantidade += Number(item.quantidade || 0);
  });

  const dados = Object.values(agrupado).sort((a, b) => b.valor - a.valor);

  await redis.setex(cacheKey, 300, JSON.stringify({ success: true, data: dados }));

  res.json({
    success: true,
    data: dados,
  });
});

/**
 * @desc    Obter top produtos
 * @route   GET /api/dashboard/top-produtos
 * @access  Private
 */
export const getTopProdutos = asyncHandler(async (req, res) => {
  const { id: usuarioId } = req.user;
  const { periodo = "30", limite = "10" } = req.query;

  const cacheKey = `dashboard:top-produtos:${usuarioId}:${periodo}:${limite}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));

  const pedidosItens = await prisma.pedidoItem.findMany({
    where: {
      pedido: {
        status: {
          in: ["aprovado", "em_producao", "faturado", "entregue"],
        },
        dataPedido: {
          gte: dataInicio,
        },
      },
    },
    select: {
      produtoId: true,
      produto: {
        select: {
          id: true,
          nome: true,
          codigo: true,
        },
      },
      subtotal: true,
      quantidade: true,
    },
  });

  // Agrupar por produto
  const agrupado = {};
  pedidosItens.forEach((item) => {
    const produtoId = item.produtoId;
    const produtoNome = item.produto?.nome || "Produto Desconhecido";
    const produtoCodigo = item.produto?.codigo || "";

    if (!agrupado[produtoId]) {
      agrupado[produtoId] = {
        produtoId,
        produtoNome,
        produtoCodigo,
        valor: 0,
        quantidade: 0,
      };
    }
    agrupado[produtoId].valor += Number(item.subtotal || 0);
    agrupado[produtoId].quantidade += Number(item.quantidade || 0);
  });

  const dados = Object.values(agrupado)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, parseInt(limite));

  await redis.setex(cacheKey, 300, JSON.stringify({ success: true, data: dados }));

  res.json({
    success: true,
    data: dados,
  });
});

/**
 * Função auxiliar para obter número da semana
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

