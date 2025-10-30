/**
 * OurSales Admin API
 * Integração com o backend para funcionalidades administrativas
 */

const API_BASE_URL = "http://localhost:3000/api";

// Configurações da API
const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

// Token de autenticação (em produção, obter do localStorage ou cookie)
let authToken = localStorage.getItem("oursales:auth-token");

// Atualizar token quando a página carregar
if (!authToken) {
  authToken = localStorage.getItem("oursales:auth-token");
}

/**
 * Função para fazer requisições HTTP
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${apiConfig.baseURL}${endpoint}`;

  const config = {
    ...apiConfig,
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options.headers,
    },
  };

  // Adicionar token de autenticação se disponível
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na requisição API:", error);
    throw error;
  }
}

/**
 * Configurações do Sistema
 */
export const adminConfigAPI = {
  // Obter configurações
  async get() {
    return await apiRequest("/admin/config");
  },

  // Atualizar configurações
  async update(categoria, configuracoes) {
    return await apiRequest("/admin/config", {
      method: "PUT",
      body: JSON.stringify({ categoria, configuracoes }),
    });
  },
};

/**
 * Upload de Arquivos
 */
export const adminFilesAPI = {
  // Upload de arquivo
  async upload(file, tipo) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo", tipo);

    return await apiRequest("/admin/upload", {
      method: "POST",
      headers: {}, // Remover Content-Type para FormData
      body: formData,
    });
  },

  // Obter arquivos por tipo
  async getByType(tipo) {
    return await apiRequest(`/admin/files/${tipo}`);
  },
};

/**
 * Padrões de Tabela
 */
export const adminPatternsAPI = {
  // Criar padrão
  async create(patternData) {
    return await apiRequest("/admin/patterns", {
      method: "POST",
      body: JSON.stringify(patternData),
    });
  },

  // Listar padrões
  async list(filters = {}) {
    const params = new URLSearchParams(filters);
    return await apiRequest(`/admin/patterns?${params}`);
  },

  // Atualizar padrão
  async update(id, patternData) {
    return await apiRequest(`/admin/patterns/${id}`, {
      method: "PUT",
      body: JSON.stringify(patternData),
    });
  },

  // Excluir padrão
  async delete(id) {
    return await apiRequest(`/admin/patterns/${id}`, {
      method: "DELETE",
    });
  },

  // Importar padrões
  async import(patterns) {
    return await apiRequest("/admin/patterns/import", {
      method: "POST",
      body: JSON.stringify({ padroes: patterns }),
    });
  },

  // Exportar padrões
  async export(filters = {}) {
    const params = new URLSearchParams(filters);
    return await apiRequest(`/admin/patterns/export?${params}`);
  },
};

/**
 * Logs do Sistema
 */
export const adminLogsAPI = {
  // Obter logs
  async get(filters = {}) {
    const params = new URLSearchParams(filters);
    return await apiRequest(`/admin/logs?${params}`);
  },
};

/**
 * Backup do Sistema
 */
export const adminBackupAPI = {
  // Criar backup
  async create() {
    return await apiRequest("/admin/backup", {
      method: "POST",
    });
  },
};

/**
 * Clientes do Sistema
 */
export const adminClientsAPI = {
  // Listar clientes
  async list(filters = {}) {
    const params = new URLSearchParams(filters);
    return await apiRequest(`/admin/clients?${params}`);
  },

  // Criar cliente
  async create(clientData) {
    return await apiRequest("/admin/clients", {
      method: "POST",
      body: JSON.stringify(clientData),
    });
  },

  // Atualizar cliente
  async update(id, clientData) {
    return await apiRequest(`/admin/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(clientData),
    });
  },

  // Excluir cliente
  async delete(id) {
    return await apiRequest(`/admin/clients/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Instâncias do Sistema
 */
export const adminInstancesAPI = {
  // Listar instâncias
  async list(filters = {}) {
    const params = new URLSearchParams(filters);
    return await apiRequest(`/admin/instances?${params}`);
  },

  // Executar ação na instância
  async executeAction(instanceId, action) {
    return await apiRequest(`/admin/instances/${instanceId}/action`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
  },
};

/**
 * Estatísticas do Sistema
 */
export const adminStatsAPI = {
  // Obter estatísticas globais
  async get() {
    return await apiRequest("/admin/stats");
  },
};

/**
 * Utilitários
 */
export const adminUtils = {
  // Verificar se o usuário é admin
  isAdmin() {
    const userData = localStorage.getItem("oursales:user-data");
    if (!userData) return false;

    try {
      const user = JSON.parse(userData);
      return user.perfil === "admin";
    } catch (error) {
      console.error("Erro ao verificar perfil do usuário:", error);
      return false;
    }
  },

  // Obter token de autenticação
  getToken() {
    return localStorage.getItem("oursales:auth-token");
  },

  // Definir token de autenticação
  setToken(token) {
    authToken = token;
    localStorage.setItem("oursales:auth-token", token);
  },

  // Remover token de autenticação
  clearToken() {
    authToken = null;
    localStorage.removeItem("oursales:auth-token");
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!this.getToken();
  },

  // Redirecionar para login se não autenticado
  requireAuth() {
    if (!this.isAuthenticated() || !this.isAdmin()) {
      window.location.href = "/admin/login.html";
      return false;
    }
    return true;
  },
};

/**
 * Interceptador de erros de autenticação
 */
window.addEventListener("unhandledrejection", (event) => {
  if (
    event.reason &&
    event.reason.message &&
    event.reason.message.includes("401")
  ) {
    adminUtils.clearToken();
    window.location.href = "/admin/login.html";
  }
});

// Exportar tudo como default
export default {
  config: adminConfigAPI,
  files: adminFilesAPI,
  patterns: adminPatternsAPI,
  logs: adminLogsAPI,
  backup: adminBackupAPI,
  clients: adminClientsAPI,
  instances: adminInstancesAPI,
  stats: adminStatsAPI,
  utils: adminUtils,
};
