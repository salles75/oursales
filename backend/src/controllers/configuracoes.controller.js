/**
 * Controller de Configurações
 */

import { prisma } from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../config/logger.js";

/**
 * @desc    Obter configurações de colunas personalizadas
 * @route   GET /api/configuracoes/colunas/:tipo
 * @access  Private
 */
export const getColunasPersonalizadas = asyncHandler(async (req, res) => {
  const { tipo } = req.params; // 'orcamentos' ou 'pedidos'
  const { usuarioId } = req.user;

  if (!["orcamentos", "pedidos"].includes(tipo)) {
    throw new AppError("Tipo inválido. Use 'orcamentos' ou 'pedidos'", 400);
  }

  // Buscar configuração personalizada do usuário
  let configuracao = await prisma.configuracao.findFirst({
    where: {
      categoria: "colunas_personalizadas",
      chave: `${tipo}_${usuarioId}`,
      ativo: true,
    },
  });

  // Se não existe configuração personalizada, usar padrão
  if (!configuracao) {
    const colunasPadrao = getColunasPadrao(tipo);
    configuracao = {
      valor: JSON.stringify(colunasPadrao),
    };
  }

  const colunas = JSON.parse(configuracao.valor);

  res.json({
    success: true,
    data: {
      tipo,
      colunas,
    },
  });
});

/**
 * @desc    Salvar configurações de colunas personalizadas
 * @route   POST /api/configuracoes/colunas/:tipo
 * @access  Private
 */
export const salvarColunasPersonalizadas = asyncHandler(async (req, res) => {
  const { tipo } = req.params;
  const { colunas } = req.body;
  const { usuarioId } = req.user;

  if (!["orcamentos", "pedidos"].includes(tipo)) {
    throw new AppError("Tipo inválido. Use 'orcamentos' ou 'pedidos'", 400);
  }

  if (!colunas || !Array.isArray(colunas)) {
    throw new AppError("Colunas devem ser um array", 400);
  }

  // Validar colunas
  const colunasValidas = getColunasCompletas(tipo);
  const colunasInvalidas = colunas.filter(
    (col) => !colunasValidas.includes(col)
  );

  if (colunasInvalidas.length > 0) {
    throw new AppError(
      `Colunas inválidas: ${colunasInvalidas.join(", ")}`,
      400
    );
  }

  // Salvar ou atualizar configuração
  const configuracao = await prisma.configuracao.upsert({
    where: {
      categoria_chave: {
        categoria: "colunas_personalizadas",
        chave: `${tipo}_${usuarioId}`,
      },
    },
    update: {
      valor: JSON.stringify(colunas),
      atualizadoEm: new Date(),
    },
    create: {
      categoria: "colunas_personalizadas",
      chave: `${tipo}_${usuarioId}`,
      valor: JSON.stringify(colunas),
      ativo: true,
    },
  });

  logger.info(
    `Configuração de colunas salva para ${tipo} por usuário ${usuarioId}`
  );

  res.json({
    success: true,
    data: {
      tipo,
      colunas: JSON.parse(configuracao.valor),
    },
    message: "Configuração salva com sucesso",
  });
});

/**
 * @desc    Obter colunas disponíveis para personalização
 * @route   GET /api/configuracoes/colunas/:tipo/disponiveis
 * @access  Private
 */
export const getColunasDisponiveis = asyncHandler(async (req, res) => {
  const { tipo } = req.params;

  if (!["orcamentos", "pedidos"].includes(tipo)) {
    throw new AppError("Tipo inválido. Use 'orcamentos' ou 'pedidos'", 400);
  }

  const colunasDisponiveis = getColunasCompletas(tipo);

  res.json({
    success: true,
    data: {
      tipo,
      colunas: colunasDisponiveis,
    },
  });
});

/**
 * Função auxiliar para obter colunas padrão
 */
function getColunasPadrao(tipo) {
  const colunasBase = {
    orcamentos: [
      "tipo",
      "numero",
      "razaoSocial",
      "cliente",
      "industria",
      "valor",
      "valorComImposto",
      "dataOrcamento",
      "codigoCliente",
      "vendedor",
      "digitador",
      "dataAtualizacao",
      "transportadora",
    ],
    pedidos: [
      "tipo",
      "numero",
      "razaoSocial",
      "cliente",
      "industria",
      "valor",
      "valorComImposto",
      "dataPedido",
      "codigoCliente",
      "vendedor",
      "digitador",
      "dataAtualizacao",
      "transportadora",
      "status",
    ],
  };

  return colunasBase[tipo] || [];
}

/**
 * Função auxiliar para obter todas as colunas disponíveis
 */
function getColunasCompletas(tipo) {
  const colunasCompletas = {
    orcamentos: [
      "tipo",
      "numero",
      "razaoSocial",
      "cliente",
      "industria",
      "valor",
      "valorComImposto",
      "dataOrcamento",
      "codigoCliente",
      "vendedor",
      "digitador",
      "dataAtualizacao",
      "transportadora",
      "status",
      "dataValidade",
      "condicaoPagamento",
      "formaPagamento",
      "prazoEntregaDias",
      "subtotal",
      "descontoValor",
      "descontoPercentual",
      "acrescimoValor",
      "valorFrete",
      "observacoes",
      "observacoesInternas",
      "convertidoPedido",
      "dataConversao",
      "criadoEm",
      "atualizadoEm",
      "criadoPor",
      "clienteCnpj",
      "clienteCpf",
      "clienteCidade",
      "clienteEstado",
      "clienteTelefone",
      "clienteEmail",
      "clienteSegmento",
      "clienteStatus",
      "vendedorEmail",
      "vendedorTelefone",
      "transportadoraCidade",
      "transportadoraEstado",
      "totalItens",
    ],
    pedidos: [
      "tipo",
      "numero",
      "razaoSocial",
      "cliente",
      "industria",
      "valor",
      "valorComImposto",
      "dataPedido",
      "codigoCliente",
      "vendedor",
      "digitador",
      "dataAtualizacao",
      "transportadora",
      "status",
      "numeroPedidoCliente",
      "dataAprovacao",
      "dataFaturamento",
      "dataEntregaPrevista",
      "dataEntregaRealizada",
      "condicaoPagamento",
      "formaPagamento",
      "prazoEntregaDias",
      "subtotal",
      "descontoValor",
      "descontoPercentual",
      "acrescimoValor",
      "valorFrete",
      "codigoRastreamento",
      "notaFiscal",
      "chaveNfe",
      "observacoes",
      "observacoesInternas",
      "motivoCancelamento",
      "criadoEm",
      "atualizadoEm",
      "criadoPor",
      "aprovadoPor",
      "canceladoPor",
      "clienteCnpj",
      "clienteCpf",
      "clienteCidade",
      "clienteEstado",
      "clienteTelefone",
      "clienteEmail",
      "clienteSegmento",
      "clienteStatus",
      "vendedorEmail",
      "vendedorTelefone",
      "transportadoraCidade",
      "transportadoraEstado",
      "totalItens",
    ],
  };

  return colunasCompletas[tipo] || [];
}

export default {
  getColunasPersonalizadas,
  salvarColunasPersonalizadas,
  getColunasDisponiveis,
};
