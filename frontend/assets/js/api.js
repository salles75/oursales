/**
 * OurSales - API Client
 * Cliente para comunicação com o backend
 */

// Configuração da API
const API_CONFIG = {
  BASE_URL: "http://localhost:3000/api",
  TIMEOUT: 30000,
};

// Token de autenticação (armazenado no localStorage)
let authToken = localStorage.getItem("oursales:token");

/**
 * Configurar token de autenticação
 */
export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem("oursales:token", token);
  } else {
    localStorage.removeItem("oursales:token");
  }
}

/**
 * Obter token de autenticação
 */
export function getAuthToken() {
  return authToken;
}

/**
 * Fazer requisição HTTP
 */
async function request(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Erro HTTP: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Erro na requisição:", error);
    throw error;
  }
}

// =====================================================
// API de Autenticação
// =====================================================

export const auth = {
  async login(email, senha) {
    const response = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });

    if (response.success && response.data.token) {
      setAuthToken(response.data.token);
    }

    return response;
  },

  async register(userData) {
    return await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async logout() {
    setAuthToken(null);
    return { success: true };
  },

  async getProfile() {
    return await request("/auth/profile");
  },
};

// =====================================================
// API de Clientes
// =====================================================

export const clientes = {
  async listar(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(`/clientes${queryString ? `?${queryString}` : ""}`);
  },

  async buscar(id) {
    return await request(`/clientes/${id}`);
  },

  async criar(clienteData) {
    return await request("/clientes", {
      method: "POST",
      body: JSON.stringify(clienteData),
    });
  },

  async atualizar(id, clienteData) {
    return await request(`/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(clienteData),
    });
  },

  async deletar(id) {
    return await request(`/clientes/${id}`, {
      method: "DELETE",
    });
  },

  async obterHistorico(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(
      `/clientes/${id}/historico${queryString ? `?${queryString}` : ""}`
    );
  },

  async obterPedidos(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(
      `/clientes/${id}/pedidos${queryString ? `?${queryString}` : ""}`
    );
  },

  async obterOrcamentos(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(
      `/clientes/${id}/orcamentos${queryString ? `?${queryString}` : ""}`
    );
  },

  async obterStats() {
    return await request("/clientes/stats");
  },
};

// =====================================================
// API de Produtos
// =====================================================

export const produtos = {
  async listar(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(`/produtos${queryString ? `?${queryString}` : ""}`);
  },

  async buscar(id) {
    return await request(`/produtos/${id}`);
  },

  async criar(produtoData) {
    return await request("/produtos", {
      method: "POST",
      body: JSON.stringify(produtoData),
    });
  },

  async atualizar(id, produtoData) {
    return await request(`/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify(produtoData),
    });
  },

  async deletar(id) {
    return await request(`/produtos/${id}`, {
      method: "DELETE",
    });
  },

  async ajustarEstoque(id, movimentoData) {
    return await request(`/produtos/${id}/estoque`, {
      method: "POST",
      body: JSON.stringify(movimentoData),
    });
  },

  async obterMovimentos(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(
      `/produtos/${id}/movimentos${queryString ? `?${queryString}` : ""}`
    );
  },

  async obterStats() {
    return await request("/produtos/stats");
  },
};

// =====================================================
// API de Orçamentos
// =====================================================

export const orcamentos = {
  async listar(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(`/orcamentos${queryString ? `?${queryString}` : ""}`);
  },

  async buscar(id) {
    return await request(`/orcamentos/${id}`);
  },

  async criar(orcamentoData) {
    return await request("/orcamentos", {
      method: "POST",
      body: JSON.stringify(orcamentoData),
    });
  },

  async atualizar(id, orcamentoData) {
    return await request(`/orcamentos/${id}`, {
      method: "PUT",
      body: JSON.stringify(orcamentoData),
    });
  },

  async deletar(id) {
    return await request(`/orcamentos/${id}`, {
      method: "DELETE",
    });
  },

  async converterParaPedido(id) {
    return await request(`/orcamentos/${id}/converter`, {
      method: "POST",
    });
  },
};

// =====================================================
// API de Pedidos
// =====================================================

export const pedidos = {
  async listar(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(`/pedidos${queryString ? `?${queryString}` : ""}`);
  },

  async buscar(id) {
    return await request(`/pedidos/${id}`);
  },

  async criar(pedidoData) {
    return await request("/pedidos", {
      method: "POST",
      body: JSON.stringify(pedidoData),
    });
  },

  async atualizar(id, pedidoData) {
    return await request(`/pedidos/${id}`, {
      method: "PUT",
      body: JSON.stringify(pedidoData),
    });
  },

  async deletar(id) {
    return await request(`/pedidos/${id}`, {
      method: "DELETE",
    });
  },

  async atualizarStatus(id, statusData) {
    return await request(`/pedidos/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  },

  async obterStats() {
    return await request("/pedidos/stats");
  },
};

// =====================================================
// API de Transportadoras
// =====================================================

export const transportadoras = {
  async listar(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(
      `/transportadoras${queryString ? `?${queryString}` : ""}`
    );
  },

  async buscar(id) {
    return await request(`/transportadoras/${id}`);
  },

  async criar(transportadoraData) {
    return await request("/transportadoras", {
      method: "POST",
      body: JSON.stringify(transportadoraData),
    });
  },

  async atualizar(id, transportadoraData) {
    return await request(`/transportadoras/${id}`, {
      method: "PUT",
      body: JSON.stringify(transportadoraData),
    });
  },

  async deletar(id) {
    return await request(`/transportadoras/${id}`, {
      method: "DELETE",
    });
  },
};

// =====================================================
// API de CRM
// =====================================================

export const crm = {
  async listarInteracoes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(
      `/crm/interacoes${queryString ? `?${queryString}` : ""}`
    );
  },

  async buscarInteracao(id) {
    return await request(`/crm/interacoes/${id}`);
  },

  async criarInteracao(interacaoData) {
    return await request("/crm/interacoes", {
      method: "POST",
      body: JSON.stringify(interacaoData),
    });
  },

  async atualizarInteracao(id, interacaoData) {
    return await request(`/crm/interacoes/${id}`, {
      method: "PUT",
      body: JSON.stringify(interacaoData),
    });
  },

  async deletarInteracao(id) {
    return await request(`/crm/interacoes/${id}`, {
      method: "DELETE",
    });
  },

  async listarFollowups(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(
      `/crm/followups${queryString ? `?${queryString}` : ""}`
    );
  },

  async marcarFollowupRealizado(id) {
    return await request(`/crm/interacoes/${id}/followup`, {
      method: "PUT",
    });
  },
};

// =====================================================
// API de Indústrias
// =====================================================

export const industrias = {
  async listar(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(
      `/industrias${queryString ? `?${queryString}` : ""}`
    );
  },

  async buscar(id) {
    return await request(`/industrias/${id}`);
  },

  async criar(industriaData) {
    return await request("/industrias", {
      method: "POST",
      body: JSON.stringify(industriaData),
    });
  },

  async atualizar(id, industriaData) {
    return await request(`/industrias/${id}`, {
      method: "PUT",
      body: JSON.stringify(industriaData),
    });
  },

  async deletar(id) {
    return await request(`/industrias/${id}`, {
      method: "DELETE",
    });
  },

  async obterEstatisticas() {
    return await request("/industrias/stats");
  },
};

// =====================================================
// API de Tabelas de Preços
// =====================================================

export const tabelasPrecos = {
  async listar(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(
      `/tabelas-precos${queryString ? `?${queryString}` : ""}`
    );
  },

  async buscar(id) {
    return await request(`/tabelas-precos/${id}`);
  },

  async criar(tabelaData) {
    return await request("/tabelas-precos", {
      method: "POST",
      body: JSON.stringify(tabelaData),
    });
  },

  async atualizar(id, tabelaData) {
    return await request(`/tabelas-precos/${id}`, {
      method: "PUT",
      body: JSON.stringify(tabelaData),
    });
  },

  async deletar(id) {
    return await request(`/tabelas-precos/${id}`, {
      method: "DELETE",
    });
  },

  // Gerenciar produtos na tabela
  async adicionarProduto(tabelaId, produtoData) {
    return await request(`/tabelas-precos/${tabelaId}/produtos`, {
      method: "POST",
      body: JSON.stringify(produtoData),
    });
  },

  async removerProduto(tabelaId, produtoId) {
    return await request(`/tabelas-precos/${tabelaId}/produtos/${produtoId}`, {
      method: "DELETE",
    });
  },

  async atualizarPrecoProduto(tabelaId, produtoId, precoData) {
    return await request(`/tabelas-precos/${tabelaId}/produtos/${produtoId}`, {
      method: "PUT",
      body: JSON.stringify(precoData),
    });
  },

  async importarProdutos(tabelaId, produtos) {
    return await request(`/tabelas-precos/${tabelaId}/produtos/import`, {
      method: "POST",
      body: JSON.stringify({ produtos }),
    });
  },
};

// =====================================================
// API de Dashboard
// =====================================================

export const dashboard = {
  async obterResumo() {
    return await request("/dashboard/resumo");
  },

  async obterMetricas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await request(
      `/dashboard/metricas${queryString ? `?${queryString}` : ""}`
    );
  },
};

// Exportar tudo como default também
export default {
  auth,
  clientes,
  produtos,
  orcamentos,
  pedidos,
  transportadoras,
  crm,
  dashboard,
  setAuthToken,
  getAuthToken,
};



