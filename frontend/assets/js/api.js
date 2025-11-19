/**
 * OurSales API Client
 * Utilitário centralizado para comunicação com o backend
 * Suporta modo autenticado (API) e modo local (localStorage)
 */

const API_BASE = 'http://localhost:3000/api';

/**
 * Classe para gerenciar requisições à API
 */
class APIClient {
  constructor() {
    this.baseURL = API_BASE;
    this.token = null;
    this.loadToken();
  }

  /**
   * Carregar token de autenticação do localStorage
   */
  loadToken() {
    this.token = localStorage.getItem('oursales:auth-token');
  }

  /**
   * Verificar se está autenticado
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Fazer requisição HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Adicionar token se disponível
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Se não autorizado, limpar token
      if (response.status === 401) {
        this.token = null;
        localStorage.removeItem('oursales:auth-token');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || `Erro ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Erro na requisição ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload de arquivo
   */
  async upload(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'POST',
      body: formData,
      headers: {},
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error?.message || `Erro ${response.status}`);
    }

    return data;
  }
}

// Instância global do cliente API
const api = new APIClient();

/**
 * Utilitário para gerenciar dados locais (fallback quando não autenticado)
 */
const localData = {
  /**
   * Carregar dados do localStorage
   */
  load() {
    try {
      const data = window.localStorage.getItem('oursales:data');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error);
      return {};
    }
  },

  /**
   * Salvar dados no localStorage
   */
  save(data) {
    try {
      window.localStorage.setItem('oursales:data', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados locais:', error);
      return false;
    }
  },

  /**
   * Obter item específico
   */
  getItem(key) {
    const data = this.load();
    return data[key];
  },

  /**
   * Salvar item específico
   */
  setItem(key, value) {
    const data = this.load();
    data[key] = value;
    return this.save(data);
  },
};

/**
 * Cliente unificado que usa API quando autenticado, localStorage quando não
 */
class UnifiedClient {
  constructor() {
    this.api = api;
    this.local = localData;
  }

  /**
   * Verificar se deve usar API ou localStorage
   */
  shouldUseAPI() {
    return this.api.isAuthenticated();
  }

  // ============================================
  // CLIENTES
  // ============================================

  async getClientes(params = {}) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/clientes', params);
      return response.data || response;
    }
    const data = this.local.getItem('clientes') || [];
    return { data: data, pagination: { total: data.length } };
  }

  async getCliente(id) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get(`/clientes/${id}`);
      return response.data || response;
    }
    const clientes = this.local.getItem('clientes') || [];
    return clientes.find(c => c.id === id) || null;
  }

  async createCliente(cliente) {
    if (this.shouldUseAPI()) {
      const response = await this.api.post('/clientes', cliente);
      return response.data || response;
    }
    const clientes = this.local.getItem('clientes') || [];
    const novo = {
      ...cliente,
      id: `cli-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      criadoEm: new Date().toISOString(),
    };
    clientes.push(novo);
    this.local.setItem('clientes', clientes);
    return novo;
  }

  async updateCliente(id, cliente) {
    if (this.shouldUseAPI()) {
      const response = await this.api.put(`/clientes/${id}`, cliente);
      return response.data || response;
    }
    const clientes = this.local.getItem('clientes') || [];
    const index = clientes.findIndex(c => c.id === id);
    if (index !== -1) {
      clientes[index] = { ...clientes[index], ...cliente, atualizadoEm: new Date().toISOString() };
      this.local.setItem('clientes', clientes);
      return clientes[index];
    }
    throw new Error('Cliente não encontrado');
  }

  async deleteCliente(id) {
    if (this.shouldUseAPI()) {
      return await this.api.delete(`/clientes/${id}`);
    }
    const clientes = this.local.getItem('clientes') || [];
    const filtered = clientes.filter(c => c.id !== id);
    this.local.setItem('clientes', filtered);
    return { success: true };
  }

  // ============================================
  // PRODUTOS
  // ============================================

  async getProdutos(params = {}) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/produtos', params);
      return response.data || response;
    }
    const data = this.local.getItem('produtos') || [];
    return { data: data, pagination: { total: data.length } };
  }

  async getProduto(id) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get(`/produtos/${id}`);
      return response.data || response;
    }
    const produtos = this.local.getItem('produtos') || [];
    return produtos.find(p => p.id === id) || null;
  }

  async createProduto(produto) {
    if (this.shouldUseAPI()) {
      const response = await this.api.post('/produtos', produto);
      return response.data || response;
    }
    const produtos = this.local.getItem('produtos') || [];
    const novo = {
      ...produto,
      id: `pro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      criadoEm: new Date().toISOString(),
    };
    produtos.push(novo);
    this.local.setItem('produtos', produtos);
    return novo;
  }

  async updateProduto(id, produto) {
    if (this.shouldUseAPI()) {
      const response = await this.api.put(`/produtos/${id}`, produto);
      return response.data || response;
    }
    const produtos = this.local.getItem('produtos') || [];
    const index = produtos.findIndex(p => p.id === id);
    if (index !== -1) {
      produtos[index] = { ...produtos[index], ...produto, atualizadoEm: new Date().toISOString() };
      this.local.setItem('produtos', produtos);
      return produtos[index];
    }
    throw new Error('Produto não encontrado');
  }

  async deleteProduto(id) {
    if (this.shouldUseAPI()) {
      return await this.api.delete(`/produtos/${id}`);
    }
    const produtos = this.local.getItem('produtos') || [];
    const filtered = produtos.filter(p => p.id !== id);
    this.local.setItem('produtos', filtered);
    return { success: true };
  }

  async importarProdutos(industriaId, tabelaPrecoId, dados) {
    if (this.shouldUseAPI()) {
      return await this.api.post('/produtos/importar', {
        industriaId,
        tabelaPrecoId,
        dados
      });
    }
    // Modo local - adicionar produtos
    const data = this.local.load();
    const produtos = data.produtos || [];
    const tabelasPrecos = data.tabelasPrecos || [];
    let produtosImportados = 0;
    const erros = [];

    dados.forEach((linha, index) => {
      try {
        if (!linha.codigo || !linha.nome) {
          erros.push({
            linha: index + 1,
            erro: "Código e nome são obrigatórios",
            dados: linha,
          });
          return;
        }

        // Verificar se produto já existe (por código ou SKU)
        const produtoExistente = produtos.find(
          (p) => p.codigo === linha.codigo || p.sku === linha.codigo
        );
        if (produtoExistente) {
          erros.push({
            linha: index + 1,
            erro: "Produto com este código/SKU já existe",
            dados: linha,
          });
          return;
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

        // Criar produto
        const novoProduto = {
          id: `pro-${Date.now()}-${index}`,
          codigo: linha.codigo,
          sku: linha.codigo,
          nome: linha.nome,
          descricao: linha.nome,
          precoVenda: parseFloat(linha.preco || 0),
          unidadeMedida: linha.unidade || "UN",
          ipi: linha.ipi ? parseFloat(linha.ipi) : 0,
          icms: linha.icms ? parseFloat(linha.icms) : null,
          cest: linha.cest || null,
          ean: linha.codigoBarras || linha.ean || null,
          industriaId,
          ativo: true,
          estoqueAtual: 0,
          estoqueMinimo: 0,
          criadoEm: new Date().toISOString(),
        };

        if (observacoes && observacoes !== linha.nome) {
          novoProduto.descricaoDetalhada = observacoes;
        }

        produtos.push(novoProduto);
        produtosImportados++;

        // Adicionar à tabela de preços local
        const tabelaPreco = tabelasPrecos.find((t) => t.id === tabelaPrecoId);
        if (tabelaPreco) {
          if (!tabelaPreco.produtos) {
            tabelaPreco.produtos = [];
          }
          tabelaPreco.produtos.push({
            produtoId: novoProduto.id,
            produto: novoProduto,
            preco: parseFloat(linha.preco || 0),
            observacoes: observacoes || null,
          });
        }
      } catch (error) {
        erros.push({
          linha: index + 1,
          erro: error.message,
          dados: linha,
        });
      }
    });

    // Salvar dados
    data.produtos = produtos;
    data.tabelasPrecos = tabelasPrecos;
    this.local.save(data);

    return {
      success: true,
      data: {
        totalImportados: produtosImportados,
        totalErros: erros.length,
        produtosImportados: produtos.slice(-produtosImportados),
        erros: erros,
      },
    };
  }

  // ============================================
  // INDÚSTRIAS
  // ============================================

  async getIndustrias(params = {}) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/industrias', params);
      return response.data || response;
    }
    const data = this.local.getItem('industrias') || [];
    return { data: data, pagination: { total: data.length } };
  }

  async getIndustria(id) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get(`/industrias/${id}`);
      return response.data || response;
    }
    const industrias = this.local.getItem('industrias') || [];
    return industrias.find(i => i.id === id) || null;
  }

  async createIndustria(industria) {
    if (this.shouldUseAPI()) {
      const response = await this.api.post('/industrias', industria);
      return response.data || response;
    }
    const industrias = this.local.getItem('industrias') || [];
    const nova = {
      ...industria,
      id: `ind-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      criadoEm: new Date().toISOString(),
    };
    industrias.push(nova);
    this.local.setItem('industrias', industrias);
    return nova;
  }

  async updateIndustria(id, industria) {
    if (this.shouldUseAPI()) {
      const response = await this.api.put(`/industrias/${id}`, industria);
      return response.data || response;
    }
    const industrias = this.local.getItem('industrias') || [];
    const index = industrias.findIndex(i => i.id === id);
    if (index !== -1) {
      industrias[index] = { ...industrias[index], ...industria, atualizadoEm: new Date().toISOString() };
      this.local.setItem('industrias', industrias);
      return industrias[index];
    }
    throw new Error('Indústria não encontrada');
  }

  async deleteIndustria(id) {
    if (this.shouldUseAPI()) {
      return await this.api.delete(`/industrias/${id}`);
    }
    const industrias = this.local.getItem('industrias') || [];
    const filtered = industrias.filter(i => i.id !== id);
    this.local.setItem('industrias', filtered);
    return { success: true };
  }

  async importarIndustrias(dados) {
    if (this.shouldUseAPI()) {
      return await this.api.post('/industrias/importar', dados);
    }
    const industrias = this.local.getItem('industrias') || [];
    dados.forEach(industria => {
      industrias.push({
        ...industria,
        id: `ind-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        criadoEm: new Date().toISOString(),
      });
    });
    this.local.setItem('industrias', industrias);
    return { success: true, importados: dados.length };
  }

  // ============================================
  // ORÇAMENTOS
  // ============================================

  async getOrcamentos(params = {}) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/orcamentos', params);
      return response.data || response;
    }
    const data = this.local.getItem('orcamentos') || [];
    return { data: data, pagination: { total: data.length } };
  }

  async getOrcamento(id) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get(`/orcamentos/${id}`);
      return response.data || response;
    }
    const orcamentos = this.local.getItem('orcamentos') || [];
    return orcamentos.find(o => o.id === id) || null;
  }

  async createOrcamento(orcamento) {
    if (this.shouldUseAPI()) {
      const response = await this.api.post('/orcamentos', orcamento);
      return response.data || response;
    }
    const orcamentos = this.local.getItem('orcamentos') || [];
    const novo = {
      ...orcamento,
      id: `orc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      numero: `ORC-${Date.now()}`,
      criadoEm: new Date().toISOString(),
    };
    orcamentos.push(novo);
    this.local.setItem('orcamentos', orcamentos);
    return novo;
  }

  async updateOrcamento(id, orcamento) {
    if (this.shouldUseAPI()) {
      const response = await this.api.put(`/orcamentos/${id}`, orcamento);
      return response.data || response;
    }
    const orcamentos = this.local.getItem('orcamentos') || [];
    const index = orcamentos.findIndex(o => o.id === id);
    if (index !== -1) {
      orcamentos[index] = { ...orcamentos[index], ...orcamento, atualizadoEm: new Date().toISOString() };
      this.local.setItem('orcamentos', orcamentos);
      return orcamentos[index];
    }
    throw new Error('Orçamento não encontrado');
  }

  async converterOrcamentoEmPedido(id) {
    if (this.shouldUseAPI()) {
      return await this.api.post(`/orcamentos/${id}/converter`);
    }
    // Modo local - criar pedido a partir do orçamento
    const orcamentos = this.local.getItem('orcamentos') || [];
    const orcamento = orcamentos.find(o => o.id === id);
    if (!orcamento) throw new Error('Orçamento não encontrado');
    
    const pedidos = this.local.getItem('pedidos') || [];
    const pedido = {
      ...orcamento,
      id: `ped-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      numero: `PED-${Date.now()}`,
      orcamentoId: id,
      convertidoPedido: true,
      criadoEm: new Date().toISOString(),
    };
    pedidos.push(pedido);
    this.local.setItem('pedidos', pedidos);
    
    // Marcar orçamento como convertido
    orcamento.convertidoPedido = true;
    orcamento.pedidoId = pedido.id;
    this.local.setItem('orcamentos', orcamentos);
    
    return { data: pedido };
  }

  async deleteOrcamento(id) {
    if (this.shouldUseAPI()) {
      return await this.api.delete(`/orcamentos/${id}`);
    }
    const orcamentos = this.local.getItem('orcamentos') || [];
    const filtered = orcamentos.filter(o => o.id !== id);
    this.local.setItem('orcamentos', filtered);
    return { success: true };
  }

  // ============================================
  // PEDIDOS
  // ============================================

  async getPedidos(params = {}) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/pedidos', params);
      return response.data || response;
    }
    const data = this.local.getItem('pedidos') || [];
    return { data: data, pagination: { total: data.length } };
  }

  async getPedido(id) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get(`/pedidos/${id}`);
      return response.data || response;
    }
    const pedidos = this.local.getItem('pedidos') || [];
    return pedidos.find(p => p.id === id) || null;
  }

  async createPedido(pedido) {
    if (this.shouldUseAPI()) {
      const response = await this.api.post('/pedidos', pedido);
      return response.data || response;
    }
    const pedidos = this.local.getItem('pedidos') || [];
    const novo = {
      ...pedido,
      id: `ped-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      numero: `PED-${Date.now()}`,
      criadoEm: new Date().toISOString(),
    };
    pedidos.push(novo);
    this.local.setItem('pedidos', pedidos);
    return novo;
  }

  async updatePedido(id, pedido) {
    if (this.shouldUseAPI()) {
      const response = await this.api.put(`/pedidos/${id}`, pedido);
      return response.data || response;
    }
    const pedidos = this.local.getItem('pedidos') || [];
    const index = pedidos.findIndex(p => p.id === id);
    if (index !== -1) {
      pedidos[index] = { ...pedidos[index], ...pedido, atualizadoEm: new Date().toISOString() };
      this.local.setItem('pedidos', pedidos);
      return pedidos[index];
    }
    throw new Error('Pedido não encontrado');
  }

  async updatePedidoStatus(id, status) {
    if (this.shouldUseAPI()) {
      return await this.api.put(`/pedidos/${id}/status`, { status });
    }
    const pedidos = this.local.getItem('pedidos') || [];
    const index = pedidos.findIndex(p => p.id === id);
    if (index !== -1) {
      pedidos[index].status = status;
      pedidos[index].atualizadoEm = new Date().toISOString();
      this.local.setItem('pedidos', pedidos);
      return { success: true, data: pedidos[index] };
    }
    throw new Error('Pedido não encontrado');
  }

  async deletePedido(id) {
    if (this.shouldUseAPI()) {
      return await this.api.delete(`/pedidos/${id}`);
    }
    const pedidos = this.local.getItem('pedidos') || [];
    const filtered = pedidos.filter(p => p.id !== id);
    this.local.setItem('pedidos', filtered);
    return { success: true };
  }

  // ============================================
  // TRANSPORTADORAS
  // ============================================

  async getTransportadoras(params = {}) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/transportadoras', params);
      return response.data || response;
    }
    const data = this.local.getItem('transportadoras') || [];
    return { data: data, pagination: { total: data.length } };
  }

  async getTransportadora(id) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get(`/transportadoras/${id}`);
      return response.data || response;
    }
    const transportadoras = this.local.getItem('transportadoras') || [];
    return transportadoras.find(t => t.id === id) || null;
  }

  async createTransportadora(transportadora) {
    if (this.shouldUseAPI()) {
      const response = await this.api.post('/transportadoras', transportadora);
      return response.data || response;
    }
    const transportadoras = this.local.getItem('transportadoras') || [];
    const nova = {
      ...transportadora,
      id: `tra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      criadoEm: new Date().toISOString(),
    };
    transportadoras.push(nova);
    this.local.setItem('transportadoras', transportadoras);
    return nova;
  }

  async updateTransportadora(id, transportadora) {
    if (this.shouldUseAPI()) {
      const response = await this.api.put(`/transportadoras/${id}`, transportadora);
      return response.data || response;
    }
    const transportadoras = this.local.getItem('transportadoras') || [];
    const index = transportadoras.findIndex(t => t.id === id);
    if (index !== -1) {
      transportadoras[index] = { ...transportadoras[index], ...transportadora, atualizadoEm: new Date().toISOString() };
      this.local.setItem('transportadoras', transportadoras);
      return transportadoras[index];
    }
    throw new Error('Transportadora não encontrada');
  }

  async deleteTransportadora(id) {
    if (this.shouldUseAPI()) {
      return await this.api.delete(`/transportadoras/${id}`);
    }
    const transportadoras = this.local.getItem('transportadoras') || [];
    const filtered = transportadoras.filter(t => t.id !== id);
    this.local.setItem('transportadoras', filtered);
    return { success: true };
  }

  // ============================================
  // CRM
  // ============================================

  async getCrmInteracoes(clienteId) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get(`/crm/interacoes`, { clienteId });
      return response.data || response;
    }
    const interacoes = this.local.getItem('crmInteracoes') || [];
    return interacoes.filter(i => i.clienteId === clienteId);
  }

  async createCrmInteracao(interacao) {
    if (this.shouldUseAPI()) {
      const response = await this.api.post('/crm/interacoes', interacao);
      return response.data || response;
    }
    const interacoes = this.local.getItem('crmInteracoes') || [];
    const nova = {
      ...interacao,
      id: `crm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      criadoEm: new Date().toISOString(),
    };
    interacoes.push(nova);
    this.local.setItem('crmInteracoes', interacoes);
    return nova;
  }

  async getFollowUps() {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/crm/follow-ups');
      return response.data || response;
    }
    const interacoes = this.local.getItem('crmInteracoes') || [];
    return interacoes.filter(i => i.requerFollowup && !i.followupRealizado);
  }

  // ============================================
  // DASHBOARD
  // ============================================

  async getDashboardStats(params = {}) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/dashboard', params);
      return response.data || response;
    }
    // Calcular stats localmente
    const clientes = this.local.getItem('clientes') || [];
    const produtos = this.local.getItem('produtos') || [];
    const pedidos = this.local.getItem('pedidos') || [];
    const orcamentos = this.local.getItem('orcamentos') || [];
    
    return {
      totalClientes: clientes.length,
      totalProdutos: produtos.length,
      totalPedidos: pedidos.length,
      totalOrcamentos: orcamentos.length,
      pedidosAbertos: pedidos.filter(p => ['aguardando_aprovacao', 'aprovado', 'em_producao'].includes(p.status)).length,
      orcamentosPendentes: orcamentos.filter(o => ['em_analise', 'enviado'].includes(o.status)).length,
      faturamentoMes: 0,
      ticketMedio: 0,
    };
  }

  async getVendasPorPeriodo(params = {}) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/dashboard/vendas', params);
      return response.data || response;
    }
    return [];
  }

  async getVendasPorVendedor(params = {}) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/dashboard/vendedores', params);
      return response.data || response;
    }
    return [];
  }

  async getVendasPorCliente(params = {}) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/dashboard/clientes', params);
      return response.data || response;
    }
    return [];
  }

  async getVendasPorIndustria(params = {}) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/dashboard/industrias', params);
      return response.data || response;
    }
    return [];
  }

  async getTopProdutos(params = {}) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/dashboard/top-produtos', params);
      return response.data || response;
    }
    return [];
  }

  // ============================================
  // CONFIGURAÇÕES
  // ============================================

  async getConfiguracaoSistema() {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/configuracoes/sistema');
      return response.data || response;
    }
    return this.local.getItem('configuracaoSistema') || {};
  }

  async saveConfiguracaoSistema(config) {
    if (this.shouldUseAPI()) {
      return await this.api.put('/configuracoes/sistema', config);
    }
    this.local.setItem('configuracaoSistema', config);
    return { success: true };
  }

  async getConfiguracaoFinanceiro() {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/configuracoes/financeiro');
      return response.data || response;
    }
    return this.local.getItem('configuracaoFinanceiro') || {};
  }

  async saveConfiguracaoFinanceiro(config) {
    if (this.shouldUseAPI()) {
      return await this.api.put('/configuracoes/financeiro', config);
    }
    this.local.setItem('configuracaoFinanceiro', config);
    return { success: true };
  }

  async getDadosCadastrais() {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/configuracoes/dados-cadastrais');
      return response.data || response;
    }
    // Modo local - buscar em dados ou dadosCadastrais
    const data = this.local.load();
    if (data && data.dadosCadastrais) {
      return data.dadosCadastrais;
    }
    return this.local.getItem('dadosCadastrais') || {};
  }

  async saveDadosCadastrais(dados) {
    if (this.shouldUseAPI()) {
      return await this.api.put('/configuracoes/dados-cadastrais', dados);
    }
    // Modo local - salvar dados cadastrais e atualizar lista de subdomínios
    const data = this.local.load();
    data.dadosCadastrais = {
      ...dados,
      atualizadoEm: new Date().toISOString(),
    };
    
    // Atualizar lista de subdomínios usados
    if (!data.subdominiosUsados) {
      data.subdominiosUsados = [];
    }
    if (dados.subdominio && !data.subdominiosUsados.includes(dados.subdominio)) {
      data.subdominiosUsados.push(dados.subdominio);
    }
    
    this.local.save(data);
    this.local.setItem('dadosCadastrais', dados);
    return { success: true };
  }

  async verificarSubdominio(subdominio) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/configuracoes/verificar-subdominio', { subdominio });
      return response.data || response;
    }
    // Modo local - verificar na lista de subdomínios usados
    const data = this.local.load();
    const subdominiosUsados = data.subdominiosUsados || [];
    return { disponivel: !subdominiosUsados.includes(subdominio) };
  }

  // ============================================
  // TABELAS DE PREÇOS
  // ============================================

  async getTabelasPrecos(industriaId) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get('/tabelas-precos', { industriaId });
      return response.data || response;
    }
    const data = this.local.load();
    const tabelas = data.tabelasPrecos || [];
    const filtered = industriaId ? tabelas.filter(t => t.industriaId === industriaId) : tabelas;
    return { data: filtered };
  }

  async getTabelaPreco(id) {
    if (this.shouldUseAPI()) {
      const response = await this.api.get(`/tabelas-precos/${id}`);
      return response.data || response;
    }
    const tabelas = this.local.getItem('tabelasPrecos') || [];
    return tabelas.find(t => t.id === id) || null;
  }

  // ============================================
  // AUTENTICAÇÃO
  // ============================================

  async login(email, senha) {
    const response = await this.api.post('/auth/login', { email, senha });
    if (response.data?.token) {
      this.api.token = response.data.token;
      window.localStorage.setItem('oursales:auth-token', response.data.token);
    }
    return response;
  }

  async logout() {
    if (this.shouldUseAPI()) {
      try {
        await this.api.post('/auth/logout');
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }
    }
    this.api.token = null;
    window.localStorage.removeItem('oursales:auth-token');
  }

  async alterarSenha(senhaAtual, novaSenha) {
    return await this.api.post('/auth/alterar-senha', { senhaAtual, novaSenha, confirmarSenha: novaSenha });
  }
}

// Exportar instância global
const client = new UnifiedClient();

// Exportar para uso global
window.oursalesAPI = client;

// Exportar também como módulo ES6 se necessário
if (typeof module !== 'undefined' && module.exports) {
  module.exports = client;
}

