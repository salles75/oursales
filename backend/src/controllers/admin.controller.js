/**
 * OurSales Admin Controller
 * Controlador para funcionalidades administrativas
 */

import { prisma } from "../config/database.js";
import { logger } from "../config/logger.js";
import { redis } from "../config/redis.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Obter configurações do sistema
 */
export const getSystemConfig = async (req, res) => {
  try {
    // Buscar configurações do banco
    const config = await prisma.configuracao.findMany({
      where: { ativo: true },
    });

    // Organizar configurações por categoria
    const configByCategory = config.reduce((acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = {};
      }
      acc[item.categoria][item.chave] = item.valor;
      return acc;
    }, {});

    res.json({
      success: true,
      data: configByCategory,
    });
  } catch (error) {
    logger.error("Erro ao buscar configurações:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Atualizar configurações do sistema
 */
export const updateSystemConfig = async (req, res) => {
  try {
    const { categoria, configuracoes } = req.body;

    if (!categoria || !configuracoes) {
      return res.status(400).json({
        success: false,
        message: "Categoria e configurações são obrigatórias",
      });
    }

    // Atualizar configurações
    const updates = Object.entries(configuracoes).map(([chave, valor]) => ({
      where: {
        categoria_chave: {
          categoria,
          chave,
        },
      },
      update: {
        valor: JSON.stringify(valor),
        atualizadoEm: new Date(),
      },
      create: {
        categoria,
        chave,
        valor: JSON.stringify(valor),
        ativo: true,
      },
    }));

    await Promise.all(
      updates.map((update) => prisma.configuracao.upsert(update))
    );

    // Invalidar cache
    await redis.del(`config:${categoria}`);

    logger.info(`Configurações da categoria ${categoria} atualizadas`, {
      usuario: req.user?.id,
      configuracoes: Object.keys(configuracoes),
    });

    res.json({
      success: true,
      message: "Configurações atualizadas com sucesso",
    });
  } catch (error) {
    logger.error("Erro ao atualizar configurações:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Upload de arquivos (logo, favicon, etc.)
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo enviado",
      });
    }

    const { tipo } = req.body;
    const file = req.file;

    // Validar tipo de arquivo
    const allowedTypes = ["logo", "favicon", "background"];
    if (!allowedTypes.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de arquivo não permitido",
      });
    }

    // Validar extensão
    const allowedExtensions = {
      logo: [".png", ".jpg", ".jpeg", ".svg"],
      favicon: [".ico", ".png", ".svg"],
      background: [".png", ".jpg", ".jpeg"],
    };

    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions[tipo].includes(ext)) {
      return res.status(400).json({
        success: false,
        message: `Extensão não permitida para ${tipo}. Permitidas: ${allowedExtensions[
          tipo
        ].join(", ")}`,
      });
    }

    // Criar diretório se não existir
    const uploadDir = path.join(__dirname, "../../uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Gerar nome único
    const timestamp = Date.now();
    const filename = `${tipo}-${timestamp}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Mover arquivo
    await fs.rename(file.path, filepath);

    // Salvar referência no banco
    await prisma.arquivo.create({
      data: {
        nome: file.originalname,
        nomeArquivo: filename,
        caminho: filepath,
        tipo,
        tamanho: file.size,
        mimeType: file.mimetype,
        ativo: true,
      },
    });

    // Invalidar cache
    await redis.del(`files:${tipo}`);

    logger.info(`Arquivo ${tipo} enviado com sucesso`, {
      usuario: req.user?.id,
      arquivo: filename,
      tamanho: file.size,
    });

    res.json({
      success: true,
      message: "Arquivo enviado com sucesso",
      data: {
        filename,
        url: `/uploads/${filename}`,
        tipo,
        tamanho: file.size,
      },
    });
  } catch (error) {
    logger.error("Erro ao fazer upload:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Obter arquivos por tipo
 */
export const getFiles = async (req, res) => {
  try {
    const { tipo } = req.params;

    // Verificar cache
    const cacheKey = `files:${tipo}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
      });
    }

    const arquivos = await prisma.arquivo.findMany({
      where: {
        tipo,
        ativo: true,
      },
      orderBy: {
        criadoEm: "desc",
      },
    });

    // Cache por 1 hora
    await redis.setex(cacheKey, 3600, JSON.stringify(arquivos));

    res.json({
      success: true,
      data: arquivos,
    });
  } catch (error) {
    logger.error("Erro ao buscar arquivos:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Criar padrão de tabela
 */
export const createTablePattern = async (req, res) => {
  try {
    const { nome, tipo, colunas, descricao, ativo = true } = req.body;

    if (!nome || !tipo || !Array.isArray(colunas) || colunas.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nome, tipo e colunas são obrigatórios",
      });
    }

    // Validar tipo
    const allowedTypes = [
      "produtos",
      "clientes",
      "transportadoras",
      "industrias",
      "orcamentos",
      "pedidos",
    ];
    if (!allowedTypes.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: `Tipo inválido. Permitidos: ${allowedTypes.join(", ")}`,
      });
    }

    const pattern = await prisma.padraoTabela.create({
      data: {
        nome,
        tipo,
        colunas: JSON.stringify(colunas),
        descricao,
        ativo,
      },
    });

    // Invalidar cache
    await redis.del(`patterns:${tipo}`);

    logger.info(`Padrão de tabela criado`, {
      usuario: req.user?.id,
      patternId: pattern.id,
      tipo,
    });

    res.status(201).json({
      success: true,
      message: "Padrão criado com sucesso",
      data: {
        ...pattern,
        colunas: JSON.parse(pattern.colunas),
      },
    });
  } catch (error) {
    logger.error("Erro ao criar padrão:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Listar padrões de tabela
 */
export const getTablePatterns = async (req, res) => {
  try {
    const { tipo, ativo } = req.query;

    const where = {};
    if (tipo) where.tipo = tipo;
    if (ativo !== undefined) where.ativo = ativo === "true";

    const patterns = await prisma.padraoTabela.findMany({
      where,
      orderBy: {
        criadoEm: "desc",
      },
    });

    // Parse das colunas
    const patternsWithColumns = patterns.map((pattern) => ({
      ...pattern,
      colunas: JSON.parse(pattern.colunas),
    }));

    res.json({
      success: true,
      data: patternsWithColumns,
    });
  } catch (error) {
    logger.error("Erro ao buscar padrões:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Atualizar padrão de tabela
 */
export const updateTablePattern = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, tipo, colunas, descricao, ativo } = req.body;

    const pattern = await prisma.padraoTabela.findUnique({
      where: { id: parseInt(id) },
    });

    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: "Padrão não encontrado",
      });
    }

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome;
    if (tipo !== undefined) updateData.tipo = tipo;
    if (colunas !== undefined) updateData.colunas = JSON.stringify(colunas);
    if (descricao !== undefined) updateData.descricao = descricao;
    if (ativo !== undefined) updateData.ativo = ativo;
    updateData.atualizadoEm = new Date();

    const updatedPattern = await prisma.padraoTabela.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Invalidar cache
    await redis.del(`patterns:${updatedPattern.tipo}`);

    logger.info(`Padrão de tabela atualizado`, {
      usuario: req.user?.id,
      patternId: id,
    });

    res.json({
      success: true,
      message: "Padrão atualizado com sucesso",
      data: {
        ...updatedPattern,
        colunas: JSON.parse(updatedPattern.colunas),
      },
    });
  } catch (error) {
    logger.error("Erro ao atualizar padrão:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Excluir padrão de tabela
 */
export const deleteTablePattern = async (req, res) => {
  try {
    const { id } = req.params;

    const pattern = await prisma.padraoTabela.findUnique({
      where: { id: parseInt(id) },
    });

    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: "Padrão não encontrado",
      });
    }

    await prisma.padraoTabela.delete({
      where: { id: parseInt(id) },
    });

    // Invalidar cache
    await redis.del(`patterns:${pattern.tipo}`);

    logger.info(`Padrão de tabela excluído`, {
      usuario: req.user?.id,
      patternId: id,
    });

    res.json({
      success: true,
      message: "Padrão excluído com sucesso",
    });
  } catch (error) {
    logger.error("Erro ao excluir padrão:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Importar padrões de tabela
 */
export const importTablePatterns = async (req, res) => {
  try {
    const { padroes } = req.body;

    if (!Array.isArray(padroes) || padroes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array de padrões é obrigatório",
      });
    }

    const results = [];

    for (const padrao of padroes) {
      try {
        const { nome, tipo, colunas, descricao, ativo = true } = padrao;

        if (!nome || !tipo || !Array.isArray(colunas)) {
          results.push({
            nome: padrao.nome || "Sem nome",
            sucesso: false,
            erro: "Dados inválidos",
          });
          continue;
        }

        const pattern = await prisma.padraoTabela.create({
          data: {
            nome,
            tipo,
            colunas: JSON.stringify(colunas),
            descricao,
            ativo,
          },
        });

        results.push({
          nome,
          sucesso: true,
          id: pattern.id,
        });
      } catch (error) {
        results.push({
          nome: padrao.nome || "Sem nome",
          sucesso: false,
          erro: error.message,
        });
      }
    }

    // Invalidar todos os caches de padrões
    const tipos = [...new Set(padroes.map((p) => p.tipo))];
    await Promise.all(tipos.map((tipo) => redis.del(`patterns:${tipo}`)));

    logger.info(`Importação de padrões concluída`, {
      usuario: req.user?.id,
      total: padroes.length,
      sucessos: results.filter((r) => r.sucesso).length,
    });

    res.json({
      success: true,
      message: "Importação concluída",
      data: {
        total: padroes.length,
        sucessos: results.filter((r) => r.sucesso).length,
        falhas: results.filter((r) => !r.sucesso).length,
        resultados: results,
      },
    });
  } catch (error) {
    logger.error("Erro ao importar padrões:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Exportar padrões de tabela
 */
export const exportTablePatterns = async (req, res) => {
  try {
    const { tipo } = req.query;

    const where = {};
    if (tipo) where.tipo = tipo;

    const patterns = await prisma.padraoTabela.findMany({
      where,
      orderBy: {
        criadoEm: "desc",
      },
    });

    const exportData = {
      versao: "1.0",
      exportadoEm: new Date().toISOString(),
      padroes: patterns.map((pattern) => ({
        nome: pattern.nome,
        tipo: pattern.tipo,
        colunas: JSON.parse(pattern.colunas),
        descricao: pattern.descricao,
        ativo: pattern.ativo,
      })),
    };

    logger.info(`Padrões exportados`, {
      usuario: req.user?.id,
      total: patterns.length,
      tipo,
    });

    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    logger.error("Erro ao exportar padrões:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Obter logs do sistema
 */
export const getSystemLogs = async (req, res) => {
  try {
    const { nivel, data, limite = 100 } = req.query;

    // Em produção, você pode implementar busca em arquivos de log
    // Por enquanto, retornamos logs simulados
    const logs = [
      {
        timestamp: new Date().toISOString(),
        nivel: "INFO",
        mensagem: "Sistema iniciado com sucesso",
        usuario: "admin",
        ip: "127.0.0.1",
      },
      {
        timestamp: new Date(Date.now() - 300000).toISOString(),
        nivel: "WARN",
        mensagem: "Tentativa de login inválida",
        usuario: "unknown",
        ip: "192.168.1.100",
      },
      {
        timestamp: new Date(Date.now() - 600000).toISOString(),
        nivel: "ERROR",
        mensagem: "Falha na conexão com banco de dados",
        usuario: "system",
        ip: "127.0.0.1",
      },
    ];

    // Filtrar por nível se especificado
    const filteredLogs =
      nivel && nivel !== "all"
        ? logs.filter((log) => log.nivel === nivel.toUpperCase())
        : logs;

    res.json({
      success: true,
      data: filteredLogs.slice(0, parseInt(limite)),
    });
  } catch (error) {
    logger.error("Erro ao buscar logs:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Criar backup do sistema
 */
export const createSystemBackup = async (req, res) => {
  try {
    // Em produção, implementar backup real do banco de dados
    const backup = {
      timestamp: new Date().toISOString(),
      versao: "1.0",
      dados: {
        // Aqui você incluiria os dados reais do banco
        configuracao: "backup das configurações",
        padroes: "backup dos padrões",
        usuarios: "backup dos usuários",
      },
    };

    logger.info(`Backup do sistema criado`, {
      usuario: req.user?.id,
    });

    res.json({
      success: true,
      message: "Backup criado com sucesso",
      data: backup,
    });
  } catch (error) {
    logger.error("Erro ao criar backup:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// =====================================================
// CONTROLE GLOBAL - MASTER ADMIN
// =====================================================

/**
 * Listar todos os clientes
 */
export const getAllClients = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status, plan } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { cnpj: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (plan) where.plano = plan;

    const clients = await prisma.clienteOurSales.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { criadoEm: "desc" },
      include: {
        instancia: true,
        faturas: {
          where: { status: "pendente" },
          orderBy: { dataVencimento: "asc" },
        },
      },
    });

    const total = await prisma.clienteOurSales.count({ where });

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error("Erro ao buscar clientes:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Criar novo cliente
 */
export const createClient = async (req, res) => {
  try {
    const {
      nome,
      email,
      cnpj,
      plano,
      status = "ativo",
      telefone,
      senha,
    } = req.body;

    // Validar se CNPJ já existe
    if (cnpj) {
      const existingClient = await prisma.clienteOurSales.findFirst({
        where: { cnpj },
      });

      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: "Já existe um cliente cadastrado com este CNPJ",
        });
      }
    }

    // Validar se email já existe
    const existingEmail = await prisma.clienteOurSales.findFirst({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Já existe um cliente cadastrado com este email",
      });
    }

    // Gerar subdomínio único
    const subdomain =
      nome
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 20) + Math.random().toString(36).slice(2, 6);

    const client = await prisma.clienteOurSales.create({
      data: {
        nome,
        email,
        telefone,
        cnpj,
        plano,
        status,
        subdomain,
        url: `${subdomain}.oursales.com`,
      },
    });

    // Criar instância para o cliente
    await prisma.instanciaOurSales.create({
      data: {
        clienteId: client.id,
        url: client.url,
        status: "ativo",
        recursos: JSON.stringify({
          cpu: "1vCPU",
          memoria: "2GB",
          armazenamento: "20GB",
        }),
      },
    });

    logger.info(`Cliente criado`, {
      usuario: req.user?.id,
      clienteId: client.id,
      subdomain,
    });

    res.status(201).json({
      success: true,
      message: "Cliente criado com sucesso",
      data: client,
    });
  } catch (error) {
    logger.error("Erro ao criar cliente:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Atualizar cliente
 */
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, cnpj, plano, status, telefone, senha } = req.body;

    // Verificar se cliente existe
    const existingClient = await prisma.clienteOurSales.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Cliente não encontrado",
      });
    }

    // Validar se CNPJ já existe (exceto para o próprio cliente)
    if (cnpj && cnpj !== existingClient.cnpj) {
      const duplicateCnpj = await prisma.clienteOurSales.findFirst({
        where: {
          cnpj,
          id: { not: id },
        },
      });

      if (duplicateCnpj) {
        return res.status(400).json({
          success: false,
          message: "Já existe um cliente cadastrado com este CNPJ",
        });
      }
    }

    // Validar se email já existe (exceto para o próprio cliente)
    if (email && email !== existingClient.email) {
      const duplicateEmail = await prisma.clienteOurSales.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });

      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          message: "Já existe um cliente cadastrado com este email",
        });
      }
    }

    // Atualizar cliente
    const updatedClient = await prisma.clienteOurSales.update({
      where: { id },
      data: {
        nome,
        email,
        telefone,
        cnpj,
        plano,
        status,
      },
    });

    // Atualizar instância se status mudou
    if (status && status !== existingClient.status) {
      await prisma.instanciaOurSales.updateMany({
        where: { clienteId: id },
        data: { status },
      });
    }

    logger.info(`Cliente atualizado`, {
      usuario: req.user?.id,
      clienteId: id,
      status,
    });

    res.json({
      success: true,
      message: "Cliente atualizado com sucesso",
      data: updatedClient,
    });
  } catch (error) {
    logger.error("Erro ao atualizar cliente:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Deletar cliente
 */
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se cliente existe
    const existingClient = await prisma.clienteOurSales.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Cliente não encontrado",
      });
    }

    // Deletar instâncias relacionadas primeiro
    await prisma.instanciaOurSales.deleteMany({
      where: { clienteId: id },
    });

    // Deletar faturas relacionadas
    await prisma.faturaOurSales.deleteMany({
      where: { clienteId: id },
    });

    // Deletar cliente
    await prisma.clienteOurSales.delete({
      where: { id },
    });

    logger.info(`Cliente deletado`, {
      usuario: req.user?.id,
      clienteId: id,
    });

    res.json({
      success: true,
      message: "Cliente deletado com sucesso",
    });
  } catch (error) {
    logger.error("Erro ao deletar cliente:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Listar todas as instâncias
 */
export const getAllInstances = async (req, res) => {
  try {
    const instances = await prisma.instanciaOurSales.findMany({
      include: {
        cliente: {
          select: {
            nome: true,
            email: true,
            plano: true,
          },
        },
      },
      orderBy: { criadoEm: "desc" },
    });

    res.json({
      success: true,
      data: instances,
    });
  } catch (error) {
    logger.error("Erro ao buscar instâncias:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Executar ação em instância
 */
export const executeInstanceAction = async (req, res) => {
  try {
    const { instanceId } = req.params;
    const { action } = req.body;

    const instance = await prisma.instanciaOurSales.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: "Instância não encontrada",
      });
    }

    // Simular execução de ação
    let newStatus = instance.status;
    switch (action) {
      case "restart":
        newStatus = "reiniciando";
        break;
      case "maintenance":
        newStatus = "manutencao";
        break;
      case "stop":
        newStatus = "parado";
        break;
      case "start":
        newStatus = "ativo";
        break;
    }

    await prisma.instanciaOurSales.update({
      where: { id: instanceId },
      data: { status: newStatus },
    });

    logger.info(`Ação executada na instância`, {
      usuario: req.user?.id,
      instanceId,
      action,
      newStatus,
    });

    res.json({
      success: true,
      message: `Ação ${action} executada com sucesso`,
      data: { status: newStatus },
    });
  } catch (error) {
    logger.error("Erro ao executar ação na instância:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Obter estatísticas globais
 */
export const getGlobalStats = async (req, res) => {
  try {
    const [totalClients, activeInstances, totalRevenue, totalUsers] =
      await Promise.all([
        prisma.clienteOurSales.count({ where: { status: "ativo" } }),
        prisma.instanciaOurSales.count({ where: { status: "ativo" } }),
        prisma.faturaOurSales.aggregate({
          where: {
            status: "pago",
            dataPagamento: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { valor: true },
        }),
        prisma.usuario.count(),
      ]);

    res.json({
      success: true,
      data: {
        totalClients,
        activeInstances,
        totalRevenue: totalRevenue._sum.valor || 0,
        totalUsers,
      },
    });
  } catch (error) {
    logger.error("Erro ao buscar estatísticas globais:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
