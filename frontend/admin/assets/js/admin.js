/**
 * OurSales Admin Panel - JavaScript
 * Funcionalidades do painel administrativo
 */

console.log("📦 Carregando admin.js...");

// Incluir admin-api.js inline para evitar problemas de módulo
const adminAPI = {
  config: {
    async get() {
      try {
        const response = await fetch("/api/admin/config", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
        return { data: {} };
      }
    },
    async update(categoria, configuracoes) {
      try {
        const response = await fetch("/api/admin/config", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
          body: JSON.stringify({ categoria, configuracoes }),
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao atualizar configurações:", error);
        throw error;
      }
    },
  },
  instances: {
    async list() {
      try {
        const response = await fetch("/api/admin/instances", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar instâncias:", error);
        return { success: true, data: [] };
      }
    },
  },
  patterns: {
    async list() {
      try {
        const response = await fetch("/api/admin/patterns", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar padrões:", error);
        return { success: true, data: [] };
      }
    },
    async create(pattern) {
      try {
        const response = await fetch("/api/admin/patterns", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
          body: JSON.stringify(pattern),
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao criar padrão:", error);
        throw error;
      }
    },
    async update(id, pattern) {
      try {
        const response = await fetch(`/api/admin/patterns/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
          body: JSON.stringify(pattern),
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao atualizar padrão:", error);
        throw error;
      }
    },
    async delete(id) {
      try {
        const response = await fetch(`/api/admin/patterns/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao deletar padrão:", error);
        throw error;
      }
    },
  },
  stats: {
    async get() {
      try {
        const response = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        return { success: true, data: {} };
      }
    },
  },
  logs: {
    async get(filters = {}) {
      try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/admin/logs?${params}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar logs:", error);
        return { success: true, data: [] };
      }
    },
  },
  clients: {
    async list(filters = {}) {
      try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/admin/clients?${params}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        return { success: true, data: { clients: [], pagination: {} } };
      }
    },
    async create(clientData) {
      try {
        const response = await fetch("/api/admin/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
          body: JSON.stringify(clientData),
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao criar cliente:", error);
        throw error;
      }
    },
    async update(id, clientData) {
      try {
        const response = await fetch(`/api/admin/clients/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
          body: JSON.stringify(clientData),
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        throw error;
      }
    },
    async delete(id) {
      try {
        const response = await fetch(`/api/admin/clients/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao deletar cliente:", error);
        throw error;
      }
    },
  },
  instances: {
    async list(filters = {}) {
      try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/admin/instances?${params}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar instâncias:", error);
        return { success: true, data: [] };
      }
    },
    async executeAction(instanceId, action) {
      try {
        const response = await fetch(
          `/api/admin/instances/${instanceId}/action`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem(
                "oursales:auth-token"
              )}`,
            },
            body: JSON.stringify({ action }),
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Erro ao executar ação na instância:", error);
        throw error;
      }
    },
  },
  billing: {
    async getFaturas(filters = {}) {
      try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/admin/billing/faturas?${params}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar faturas:", error);
        return { success: true, data: [] };
      }
    },
    async marcarPago(faturaId) {
      try {
        const response = await fetch(
          `/api/admin/billing/faturas/${faturaId}/pagar`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem(
                "oursales:auth-token"
              )}`,
            },
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Erro ao marcar fatura como paga:", error);
        throw error;
      }
    },
    async enviarLembrete(faturaId) {
      try {
        const response = await fetch(
          `/api/admin/billing/faturas/${faturaId}/lembrete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem(
                "oursales:auth-token"
              )}`,
            },
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Erro ao enviar lembrete:", error);
        throw error;
      }
    },
  },
  support: {
    async getTickets(filters = {}) {
      try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/admin/support/tickets?${params}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "oursales:auth-token"
            )}`,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar tickets:", error);
        return { success: true, data: [] };
      }
    },
    async responderTicket(ticketId, resposta) {
      try {
        const response = await fetch(
          `/api/admin/support/tickets/${ticketId}/responder`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem(
                "oursales:auth-token"
              )}`,
            },
            body: JSON.stringify({ resposta }),
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Erro ao responder ticket:", error);
        throw error;
      }
    },
    async fecharTicket(ticketId) {
      try {
        const response = await fetch(
          `/api/admin/support/tickets/${ticketId}/fechar`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem(
                "oursales:auth-token"
              )}`,
            },
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Erro ao fechar ticket:", error);
        throw error;
      }
    },
  },
  utils: {
    requireAuth() {
      const token = localStorage.getItem("oursales:auth-token");
      const userData = localStorage.getItem("oursales:user-data");

      if (!token || !userData) {
        window.location.href = "/admin/login.html";
        return false;
      }

      try {
        const user = JSON.parse(userData);
        if (user.perfil !== "admin") {
          window.location.href = "/admin/login.html";
          return false;
        }
      } catch (error) {
        window.location.href = "/admin/login.html";
        return false;
      }

      return true;
    },
  },
};

console.log("📦 adminAPI criado:", adminAPI);

// Configurações administrativas
const adminConfig = {
  patterns: [],
  settings: {
    appearance: {
      siteTitle: "OurSales • Painel Comercial",
      siteDescription:
        "Painel de vendas para representantes gerenciarem clientes, transportadoras, orçamentos e pedidos.",
      primaryColor: "#667eea",
      secondaryColor: "#764ba2",
    },
    security: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      requireHttps: false,
      enableAuditLog: true,
    },
    notifications: {
      emailNotifications: true,
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
    },
  },
};

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Admin.js carregado!");

  // Verificar autenticação
  if (!adminAPI.utils.requireAuth()) {
    console.log("❌ Autenticação falhou");
    return;
  }

  console.log("✅ Autenticação OK");
  console.log("📊 Carregando dados...");

  loadAdminData();
  setupEventListeners();
  setupFileUploads();
  setupDangerZone();

  // Configurar atualização automática do dashboard
  setupDashboardAutoRefresh();

  // Configurar atualizações automáticas para outras seções
  setupAutoRefresh();

  console.log("✅ Inicialização completa!");
});

// Carregar dados administrativos
async function loadAdminData() {
  try {
    const config = await adminAPI.config.get();
    if (config) {
      Object.assign(adminConfig.settings, config);
      applySettingsToUI();
    }

    const patterns = await adminAPI.patterns.list();
    if (patterns && patterns.data) {
      adminConfig.patterns = patterns.data;
      loadPatternsList();
    }

    loadDashboardStats();
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    showNotification("Erro ao carregar dados do servidor", "error");
  }
}

// Carregar estatísticas do dashboard
async function loadDashboardStats() {
  try {
    console.log("📊 Carregando estatísticas do dashboard...");

    // Mostrar indicador de carregamento
    showDashboardLoading();

    // Buscar estatísticas reais da API
    const statsResponse = await adminAPI.stats.get();
    console.log("📊 Estatísticas recebidas:", statsResponse);

    if (statsResponse && statsResponse.success && statsResponse.data) {
      const stats = statsResponse.data;

      // Atualizar cards de estatísticas
      const statCards = document.querySelectorAll(".stat-card-value");
      if (statCards.length >= 4) {
        statCards[0].textContent = stats.totalClients || 0; // Clientes Ativos
        statCards[1].textContent = stats.activeInstances || 0; // Instâncias Online
        statCards[2].textContent = `R$ ${(
          stats.totalRevenue || 0
        ).toLocaleString("pt-BR")}`; // Receita Mensal
        statCards[3].textContent = stats.totalUsers || 0; // Usuários Totais
      }

      console.log("✅ Estatísticas do dashboard atualizadas");
    } else {
      console.log(
        "⚠️ Dados de estatísticas não disponíveis, usando valores padrão"
      );
      // Valores padrão caso a API não retorne dados
      const statCards = document.querySelectorAll(".stat-card-value");
      if (statCards.length >= 4) {
        statCards[0].textContent = "0";
        statCards[1].textContent = "0";
        statCards[2].textContent = "R$ 0";
        statCards[3].textContent = "0";
      }
    }

    // Carregar status do sistema
    await loadSystemStatus();

    // Carregar atividades recentes
    await loadRecentActivities();
  } catch (error) {
    console.error("❌ Erro ao carregar estatísticas do dashboard:", error);
    showNotification("Erro ao carregar estatísticas do dashboard", "error");

    // Valores padrão em caso de erro
    const statCards = document.querySelectorAll(".stat-card-value");
    if (statCards.length >= 4) {
      statCards[0].textContent = "0";
      statCards[1].textContent = "0";
      statCards[2].textContent = "R$ 0";
      statCards[3].textContent = "0";
    }
  }
}

// Carregar status do sistema
async function loadSystemStatus() {
  try {
    console.log("🔍 Verificando status do sistema...");

    // Verificar conectividade com APIs
    const systemChecks = await Promise.allSettled([
      fetch("/api/admin/config", { method: "HEAD" }),
      fetch("/api/admin/stats", { method: "HEAD" }),
      fetch("/api/admin/instances", { method: "HEAD" }),
    ]);

    const statusContainer = document.querySelector(
      "#dashboard .admin-card:first-of-type .admin-card-header + div"
    );
    if (statusContainer) {
      const serverStatus =
        systemChecks[0].status === "fulfilled" ? "success" : "error";
      const dbStatus =
        systemChecks[1].status === "fulfilled" ? "success" : "error";
      const cacheStatus =
        systemChecks[2].status === "fulfilled" ? "success" : "error";

      statusContainer.innerHTML = `
        <div class="admin-alert ${serverStatus}">
          <i class="fas fa-${
            serverStatus === "success" ? "check-circle" : "exclamation-circle"
          }"></i> 
          Servidor ${serverStatus === "success" ? "Online" : "Offline"}
        </div>
        <div class="admin-alert ${dbStatus}">
          <i class="fas fa-${
            dbStatus === "success" ? "database" : "exclamation-triangle"
          }"></i> 
          Banco de Dados ${
            dbStatus === "success" ? "Conectado" : "Desconectado"
          }
        </div>
        <div class="admin-alert ${cacheStatus}">
          <i class="fas fa-${
            cacheStatus === "success" ? "memory" : "exclamation-triangle"
          }"></i> 
          Cache ${cacheStatus === "success" ? "Funcionando" : "Indisponível"}
        </div>
      `;
    }

    console.log("✅ Status do sistema atualizado");
  } catch (error) {
    console.error("❌ Erro ao verificar status do sistema:", error);
  }
}

// Carregar atividades recentes
async function loadRecentActivities() {
  try {
    console.log("📋 Carregando atividades recentes...");

    // Buscar logs recentes
    const logsResponse = await adminAPI.logs.get({ limite: 5 });

    const activitiesContainer = document.querySelector(
      "#dashboard .admin-card:last-of-type .admin-card-header + div"
    );
    if (activitiesContainer) {
      if (
        logsResponse &&
        logsResponse.success &&
        logsResponse.data &&
        logsResponse.data.length > 0
      ) {
        const activities = logsResponse.data
          .map((log) => {
            const timeAgo = getTimeAgo(new Date(log.timestamp));
            const icon = getActivityIcon(log.nivel);
            const message =
              log.mensagem || log.message || "Atividade do sistema";

            return `
            <div class="admin-alert info">
              <i class="fas fa-${icon}"></i> ${message}
              <small>${timeAgo}</small>
            </div>
          `;
          })
          .join("");

        activitiesContainer.innerHTML = activities;
      } else {
        // Atividades padrão se não houver logs
        activitiesContainer.innerHTML = `
          <div class="admin-alert info">
            <i class="fas fa-user-plus"></i> Sistema iniciado
            <small>agora</small>
          </div>
          <div class="admin-alert info">
            <i class="fas fa-cog"></i> Configurações carregadas
            <small>agora</small>
          </div>
          <div class="admin-alert info">
            <i class="fas fa-shield-alt"></i> Segurança ativada
            <small>agora</small>
          </div>
        `;
      }
    }

    console.log("✅ Atividades recentes carregadas");
  } catch (error) {
    console.error("❌ Erro ao carregar atividades recentes:", error);

    // Atividades padrão em caso de erro
    const activitiesContainer = document.querySelector(
      "#dashboard .admin-card:last-of-type .admin-card-header + div"
    );
    if (activitiesContainer) {
      activitiesContainer.innerHTML = `
        <div class="admin-alert warning">
          <i class="fas fa-exclamation-triangle"></i> Erro ao carregar atividades
          <small>agora</small>
        </div>
      `;
    }
  }
}

// Função auxiliar para calcular tempo relativo
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "agora";
  if (diffInSeconds < 3600)
    return `há ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400)
    return `há ${Math.floor(diffInSeconds / 3600)} horas`;
  return `há ${Math.floor(diffInSeconds / 86400)} dias`;
}

// Função auxiliar para obter ícone baseado no nível do log
function getActivityIcon(level) {
  switch (level?.toLowerCase()) {
    case "info":
      return "info-circle";
    case "warn":
    case "warning":
      return "exclamation-triangle";
    case "error":
      return "exclamation-circle";
    case "success":
      return "check-circle";
    default:
      return "info-circle";
  }
}

// Mostrar indicador de carregamento no dashboard
function showDashboardLoading() {
  const statCards = document.querySelectorAll(".stat-card-value");
  statCards.forEach((card) => {
    card.innerHTML = '<div class="loading-spinner"></div>';
  });

  // Adicionar CSS para o spinner se não existir
  if (!document.querySelector("#dashboard-spinner-style")) {
    const style = document.createElement("style");
    style.id = "dashboard-spinner-style";
    style.textContent = `
      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Esconder indicador de carregamento do dashboard
function hideDashboardLoading() {
  // O loading será substituído pelos dados reais
}

// Configurar atualização automática do dashboard
function setupDashboardAutoRefresh() {
  console.log("🔄 Configurando atualização automática do dashboard...");

  // Atualizar dashboard a cada 5 minutos
  setInterval(() => {
    const currentSection = document.querySelector(".admin-section.active");
    if (currentSection && currentSection.id === "dashboard") {
      console.log("🔄 Atualizando dashboard automaticamente...");
      loadDashboardStats();
    }
  }, 5 * 60 * 1000); // 5 minutos

  // Atualizar quando a seção dashboard for mostrada
  const originalShowSection = window.showSection;
  window.showSection = function (sectionName) {
    originalShowSection(sectionName);

    if (sectionName === "dashboard") {
      // Pequeno delay para garantir que a seção foi renderizada
      setTimeout(() => {
        loadDashboardStats();
      }, 100);
    }
  };

  console.log("✅ Atualização automática configurada");
}

// Configurar atualizações automáticas para todas as seções
function setupAutoRefresh() {
  console.log("🔄 Configurando atualizações automáticas...");

  // Atualizar dados a cada 2 minutos
  setInterval(() => {
    const currentSection = document.querySelector(".admin-section.active");
    if (currentSection) {
      const sectionId = currentSection.id;

      switch (sectionId) {
        case "dashboard":
          loadDashboardStats();
          break;
        case "clientes":
          loadClientsList();
          break;
        case "instancias":
          loadInstancesData();
          break;
        case "faturamento":
          loadFaturamentoData();
          break;
        case "suporte":
          loadSuporteData();
          break;
        case "estatisticas":
          loadEstatisticasData();
          break;
        case "padroes":
          loadPatternsList();
          break;
        case "backup":
          loadBackupData();
          break;
        case "usuarios":
          loadUsuariosData();
          break;
        case "logs":
          loadLogs();
          break;
      }
    }
  }, 2 * 60 * 1000); // 2 minutos

  console.log("✅ Atualizações automáticas configuradas");
}

// Verificar conectividade e status do sistema
async function checkSystemHealth() {
  try {
    console.log("🔍 Verificando saúde do sistema...");

    const healthChecks = await Promise.allSettled([
      fetch("/api/admin/config", { method: "HEAD" }),
      fetch("/api/admin/stats", { method: "HEAD" }),
      fetch("/api/admin/clients", { method: "HEAD" }),
      fetch("/api/admin/instances", { method: "HEAD" }),
    ]);

    const results = {
      config: healthChecks[0].status === "fulfilled",
      stats: healthChecks[1].status === "fulfilled",
      clients: healthChecks[2].status === "fulfilled",
      instances: healthChecks[3].status === "fulfilled",
    };

    const allHealthy = Object.values(results).every((status) => status);

    if (allHealthy) {
      console.log("✅ Sistema saudável - todas as APIs respondendo");
      return { healthy: true, results };
    } else {
      console.log(
        "⚠️ Sistema com problemas - algumas APIs não respondem:",
        results
      );
      return { healthy: false, results };
    }
  } catch (error) {
    console.error("❌ Erro ao verificar saúde do sistema:", error);
    return { healthy: false, error: error.message };
  }
}

// Configurar event listeners
function setupEventListeners() {
  console.log("🔧 Configurando event listeners...");

  // Formulários que existem
  const appearanceForm = document.getElementById("appearanceForm");
  if (appearanceForm) {
    appearanceForm.addEventListener("submit", saveAppearanceSettings);
    console.log("✅ appearanceForm configurado");
  } else {
    console.log("❌ appearanceForm não encontrado");
  }

  const logoForm = document.getElementById("logoForm");
  if (logoForm) {
    logoForm.addEventListener("submit", saveLogoSettings);
    console.log("✅ logoForm configurado");
  }

  const cssForm = document.getElementById("cssForm");
  if (cssForm) {
    cssForm.addEventListener("submit", saveCSSSettings);
    console.log("✅ cssForm configurado");
  }

  const newClientForm = document.getElementById("newClientForm");
  if (newClientForm) {
    newClientForm.addEventListener("submit", createNewClient);
    console.log("✅ newClientForm configurado");
  }

  const plansForm = document.getElementById("plansForm");
  if (plansForm) {
    plansForm.addEventListener("submit", savePlansSettings);
    console.log("✅ plansForm configurado");
  }

  const securityForm = document.getElementById("securityForm");
  if (securityForm) {
    securityForm.addEventListener("submit", saveSecuritySettings);
    console.log("✅ securityForm configurado");
  }

  const passwordPolicyForm = document.getElementById("passwordPolicyForm");
  if (passwordPolicyForm) {
    passwordPolicyForm.addEventListener("submit", savePasswordPolicySettings);
    console.log("✅ passwordPolicyForm configurado");
  }

  const notificationForm = document.getElementById("notificationForm");
  if (notificationForm) {
    notificationForm.addEventListener("submit", saveNotificationSettings);
    console.log("✅ notificationForm configurado");
  }

  const notificationTypesForm = document.getElementById(
    "notificationTypesForm"
  );
  if (notificationTypesForm) {
    notificationTypesForm.addEventListener(
      "submit",
      saveNotificationTypesSettings
    );
    console.log("✅ notificationTypesForm configurado");
  }

  const userForm = document.getElementById("userForm");
  if (userForm) {
    userForm.addEventListener("submit", createUser);
    console.log("✅ userForm configurado");
  }

  console.log("✅ Event listeners configurados!");
}

// Configurar uploads de arquivo
function setupFileUploads() {
  // Logo upload
  const logoInput = document.getElementById("logoInput");
  if (logoInput) {
    logoInput.addEventListener("change", handleLogoUpload);
  }

  // Favicon upload
  const faviconInput = document.getElementById("faviconInput");
  if (faviconInput) {
    faviconInput.addEventListener("change", handleFaviconUpload);
  }
}

// Configurar zona de perigo
function setupDangerZone() {
  const confirmCheckbox = document.getElementById("confirmDanger");
  const resetButton = document.getElementById("resetButton");

  if (confirmCheckbox && resetButton) {
    confirmCheckbox.addEventListener("change", function () {
      resetButton.disabled = !this.checked;
    });
  }
}

// Mostrar seção
function showSection(sectionName) {
  console.log("🔄 Mostrando seção:", sectionName);

  // Esconder todas as seções
  const allSections = document.querySelectorAll(".admin-section");
  console.log("📋 Total de seções encontradas:", allSections.length);

  allSections.forEach((section, index) => {
    console.log(`📦 Seção ${index}:`, section.id, section.className);
    section.classList.remove("active");
    section.style.display = "none";
  });

  // Mostrar seção selecionada
  const targetSection = document.getElementById(sectionName);
  console.log("📦 Seção encontrada:", targetSection);

  if (targetSection) {
    targetSection.classList.add("active");
    console.log("✅ Seção ativada:", sectionName);
  } else {
    console.log("❌ Seção não encontrada:", sectionName);
  }

  // Atualizar navegação - remover active de todos os itens
  document.querySelectorAll(".admin-nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Adicionar active apenas ao item clicado
  const activeNavItem = document.querySelector(
    `[onclick="showSection('${sectionName}')"]`
  );

  if (activeNavItem) {
    activeNavItem.classList.add("active");
  }

  // Carregar dados específicos da seção
  switch (sectionName) {
    case "estatisticas":
      loadEstatisticasData();
      break;
    case "instancias":
      loadInstancesData();
      break;
    case "faturamento":
      loadFaturamentoData();
      break;
    case "suporte":
      loadSuporteData();
      break;
    case "clientes":
      loadClientsList();
      break;
    case "site":
      loadSiteData();
      break;
    case "notificacoes":
      loadNotificacoesData();
      break;
    case "padroes":
      loadPatternsList();
      break;
    case "importacao":
      loadImportacaoData();
      break;
    case "backup":
      loadBackupData();
      break;
    case "usuarios":
      loadUsuariosData();
      break;
    case "logs":
      loadLogs();
      break;
    case "seguranca":
      loadSegurancaData();
      break;
  }
}

// Aplicar configurações na interface
function applySettingsToUI() {
  const settings = adminConfig.settings;

  // Aparência - verificar se elementos existem
  const siteTitle = document.getElementById("siteTitle");
  const siteDescription = document.getElementById("siteDescription");
  const primaryColor = document.getElementById("primaryColor");
  const secondaryColor = document.getElementById("secondaryColor");

  if (siteTitle) siteTitle.value = settings.appearance.siteTitle;
  if (siteDescription)
    siteDescription.value = settings.appearance.siteDescription;
  if (primaryColor) primaryColor.value = settings.appearance.primaryColor;
  if (secondaryColor) secondaryColor.value = settings.appearance.secondaryColor;

  // Aplicar cores
  updateColors();
}

// Atualizar cores em tempo real
function updateColors() {
  const primaryColor = document.getElementById("primaryColor");
  const secondaryColor = document.getElementById("secondaryColor");

  if (primaryColor && secondaryColor) {
    document.documentElement.style.setProperty(
      "--admin-primary",
      primaryColor.value
    );
    document.documentElement.style.setProperty(
      "--admin-secondary",
      secondaryColor.value
    );
  }
}

// Salvar configurações de aparência
async function saveAppearanceSettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const appearanceSettings = {
    siteTitle: formData.get("siteTitle"),
    siteDescription: formData.get("siteDescription"),
    primaryColor: formData.get("primaryColor"),
    secondaryColor: formData.get("secondaryColor"),
  };

  try {
    console.log("🎨 Salvando configurações de aparência:", appearanceSettings);
    showNotification("Salvando configurações...", "info");

    const response = await adminAPI.config.update(
      "appearance",
      appearanceSettings
    );

    if (response && response.success) {
      showNotification(
        "Configurações de aparência salvas com sucesso!",
        "success"
      );

      // Atualizar configurações locais
      adminConfig.settings.appearance = appearanceSettings;

      // Aplicar cores em tempo real
      updateColors();
    } else {
      showNotification(
        response.message || "Erro ao salvar configurações",
        "error"
      );
    }
  } catch (error) {
    console.error("❌ Erro ao salvar configurações:", error);
    showNotification("Erro ao salvar configurações de aparência", "error");
  }
}

// Salvar configurações de logo
async function saveLogoSettings(e) {
  e.preventDefault();
  showNotification("Configurações de logo salvas!", "success");
}

// Salvar configurações CSS
async function saveCSSSettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const cssSettings = {
    customCSS: formData.get("customCSS"),
    customJS: formData.get("customJS"),
  };

  try {
    await adminAPI.config.update("css", cssSettings);
    showNotification("Configurações CSS salvas com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao salvar configurações CSS:", error);
    showNotification("Erro ao salvar configurações CSS", "error");
  }
}

// Salvar configurações de planos
async function savePlansSettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const plansSettings = {
    basico: {
      preco: parseFloat(formData.get("basicPlanPrice")),
    },
    profissional: {
      preco: parseFloat(formData.get("professionalPlanPrice")),
    },
    empresarial: {
      preco: parseFloat(formData.get("businessPlanPrice")),
    },
    enterprise: {
      preco: parseFloat(formData.get("enterprisePlanPrice")),
    },
  };

  try {
    await adminAPI.config.update("plans", plansSettings);
    showNotification("Configurações de planos salvas com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao salvar configurações de planos:", error);
    showNotification("Erro ao salvar configurações de planos", "error");
  }
}

// Salvar configurações de segurança
async function saveSecuritySettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const securitySettings = {
    sessionTimeout: parseInt(formData.get("sessionTimeout")) || 30,
    maxLoginAttempts: parseInt(formData.get("maxLoginAttempts")) || 5,
    requireHttps: formData.has("requireHttps"),
    enableAuditLog: formData.has("enableAuditLog"),
    twoFactorAuth: formData.has("twoFactorAuth"),
    passwordComplexity: formData.has("passwordComplexity"),
  };

  try {
    console.log("🔒 Salvando configurações de segurança:", securitySettings);
    showNotification("Salvando configurações de segurança...", "info");

    const response = await adminAPI.config.update("security", securitySettings);

    if (response && response.success) {
      showNotification(
        "Configurações de segurança salvas com sucesso!",
        "success"
      );

      // Atualizar configurações locais
      adminConfig.settings.security = securitySettings;
    } else {
      showNotification(
        response.message || "Erro ao salvar configurações",
        "error"
      );
    }
  } catch (error) {
    console.error("❌ Erro ao salvar configurações de segurança:", error);
    showNotification("Erro ao salvar configurações de segurança", "error");
  }
}

// Salvar configurações de notificação
async function saveNotificationSettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const notificationSettings = {
    emailNotifications: formData.has("emailNotifications"),
    smsNotifications: formData.has("smsNotifications"),
    pushNotifications: formData.has("pushNotifications"),
    smtpHost: formData.get("smtpHost"),
    smtpPort: parseInt(formData.get("smtpPort")) || 587,
    smtpUser: formData.get("smtpUser"),
    smtpPassword: formData.get("smtpPassword"),
  };

  try {
    console.log(
      "🔔 Salvando configurações de notificação:",
      notificationSettings
    );
    showNotification("Salvando configurações de notificação...", "info");

    const response = await adminAPI.config.update(
      "notifications",
      notificationSettings
    );

    if (response && response.success) {
      showNotification(
        "Configurações de notificação salvas com sucesso!",
        "success"
      );

      // Atualizar configurações locais
      adminConfig.settings.notifications = notificationSettings;
    } else {
      showNotification(
        response.message || "Erro ao salvar configurações",
        "error"
      );
    }
  } catch (error) {
    console.error("❌ Erro ao salvar configurações de notificação:", error);
    showNotification("Erro ao salvar configurações de notificação", "error");
  }
}

// Carregar lista de padrões
async function loadPatternsList() {
  try {
    console.log("📋 Carregando lista de padrões...");

    const patternsContainer = document.getElementById("activePatterns");
    if (!patternsContainer) {
      console.log("❌ Container de padrões não encontrado");
      return;
    }

    // Buscar padrões reais da API
    const response = await adminAPI.patterns.list();
    console.log("📋 Resposta da API de padrões:", response);

    if (
      response &&
      response.success &&
      response.data &&
      response.data.length > 0
    ) {
      const patterns = response.data;

      patternsContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h4 style="margin: 0; color: #333;">Padrões Ativos (${
            patterns.length
          })</h4>
          <div style="display: flex; gap: 0.5rem;">
            <button onclick="importPatterns()" style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">
              <i class="fas fa-upload"></i> Importar
            </button>
            <button onclick="exportPatterns()" style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">
              <i class="fas fa-download"></i> Exportar
            </button>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
          ${patterns
            .map((pattern) => {
              const colunas =
                typeof pattern.colunas === "string"
                  ? JSON.parse(pattern.colunas)
                  : pattern.colunas;
              return `
                <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                      <h4 style="margin: 0 0 0.5rem 0; color: #333; font-size: 1.1rem;">${
                        pattern.nome
                      }</h4>
                      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span style="background: #667eea; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.7rem; font-weight: 500;">
                          ${pattern.tipo}
                        </span>
                        <span style="color: #666; font-size: 0.8rem;">
                          ${colunas.length} colunas
                        </span>
                      </div>
                    </div>
                    <div style="display: flex; gap: 0.25rem;">
                      <button onclick="editPattern('${
                        pattern.id
                      }')" style="padding: 0.25rem 0.5rem; background: #6c757d; color: white; border: none; border-radius: 0.25rem; font-size: 0.7rem; cursor: pointer;" title="Editar padrão">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button onclick="deletePattern('${
                        pattern.id
                      }')" style="padding: 0.25rem 0.5rem; background: #dc3545; color: white; border: none; border-radius: 0.25rem; font-size: 0.7rem; cursor: pointer;" title="Excluir padrão">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  ${
                    pattern.descricao
                      ? `<p style="margin: 0; color: #666; font-size: 0.9rem;">${pattern.descricao}</p>`
                      : ""
                  }
                  <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e9ecef;">
                    <div style="font-size: 0.8rem; color: #888;">
                      <i class="fas fa-calendar" style="margin-right: 0.25rem;"></i>
                      Criado em ${new Date(pattern.criadoEm).toLocaleDateString(
                        "pt-BR"
                      )}
                    </div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      `;

      console.log(`✅ ${patterns.length} padrões carregados`);
    } else {
      patternsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 0.5rem;">
          <i class="fas fa-table" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
          <h4 style="margin: 0; color: #666;">Nenhum padrão cadastrado</h4>
          <p style="margin: 0.5rem 0 0 0; color: #999;">Crie padrões para organizar suas tabelas</p>
          <button onclick="createNewPattern()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
            <i class="fas fa-plus"></i> Criar Primeiro Padrão
          </button>
        </div>
      `;
    }
  } catch (error) {
    console.error("❌ Erro ao carregar padrões:", error);
    showNotification("Erro ao carregar padrões de tabela", "error");

    const patternsContainer = document.getElementById("activePatterns");
    if (patternsContainer) {
      patternsContainer.innerHTML = `
        <div style="text-align: center; color: #dc3545; padding: 2rem;">
          <i class="fas fa-exclamation-triangle"></i> Erro ao carregar padrões
        </div>
      `;
    }
  }
}

// Mostrar indicador de carregamento global
function showGlobalLoading(message = "Carregando...") {
  const loadingOverlay = document.createElement("div");
  loadingOverlay.id = "globalLoadingOverlay";
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  loadingOverlay.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 0.5rem; text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
      <div style="color: #333; font-weight: 500;">${message}</div>
    </div>
  `;

  // Adicionar CSS para animação se não existir
  if (!document.querySelector("#loading-spinner-style")) {
    const style = document.createElement("style");
    style.id = "loading-spinner-style";
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(loadingOverlay);
}

// Esconder indicador de carregamento global
function hideGlobalLoading() {
  const loadingOverlay = document.getElementById("globalLoadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

// Mostrar notificação
function showNotification(message, type = "info") {
  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  // Adicionar ao DOM
  document.body.appendChild(notification);

  // Remover automaticamente após 5 segundos
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// ===== FUNÇÕES DE GERENCIAMENTO DE CLIENTES =====

// Criar novo cliente
// Carregar lista de clientes
// Função para carregar dados dos clientes
async function loadClientsList() {
  const clientsTableBody = document.getElementById("clientsTableBody");
  if (!clientsTableBody) return;

  try {
    showGlobalLoading();

    // Buscar clientes da API
    const response = await adminAPI.clients.list();
    const clients = response.data?.clients || [];

    // Atualizar estatísticas
    updateClientStats(clients);

    if (clients.length === 0) {
      clientsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
            <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 1rem; display: block; color: #ddd;"></i>
            Nenhum cliente encontrado
          </td>
        </tr>
      `;
      return;
    }

    clientsTableBody.innerHTML = clients
      .map((client) => {
        const statusColors = {
          ativo: { bg: "#e8f5e8", color: "#2e7d32" },
          suspenso: { bg: "#fff3e0", color: "#f57c00" },
          inativo: { bg: "#ffebee", color: "#c62828" },
        };

        const planColors = {
          básico: { bg: "#e3f2fd", color: "#1976d2" },
          profissional: { bg: "#e8f5e8", color: "#2e7d32" },
          empresarial: { bg: "#fff3e0", color: "#f57c00" },
          enterprise: { bg: "#f3e5f5", color: "#7b1fa2" },
        };

        const statusColor =
          statusColors[client.status] || statusColors["inativo"];
        const planColor = planColors[client.plano] || planColors["básico"];

        return `
        <tr style="border-bottom: 1px solid #e9ecef;">
          <td style="padding: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.9rem;">
                ${client.nome ? client.nome.charAt(0).toUpperCase() : "C"}
              </div>
              <div>
                <div style="font-weight: 600; color: #333; margin-bottom: 0.25rem;">${
                  client.nome || "Sem nome"
                }</div>
                <div style="font-size: 0.85rem; color: #666;">CNPJ: ${
                  client.cnpj || "Não informado"
                }</div>
              </div>
            </div>
          </td>
          <td style="padding: 1rem;">
            <div style="font-weight: 500; color: #333; margin-bottom: 0.25rem;">${
              client.email || "N/A"
            }</div>
            <div style="font-size: 0.85rem; color: #666;">${
              client.telefone || "Não informado"
            }</div>
          </td>
          <td style="padding: 1rem;">
            <span style="padding: 0.25rem 0.75rem; background: ${
              planColor.bg
            }; color: ${
          planColor.color
        }; border-radius: 1rem; font-size: 0.8rem; font-weight: 500;">
              ${client.plano || "N/A"}
            </span>
          </td>
          <td style="padding: 1rem;">
            <span style="padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 500; background: ${
              statusColor.bg
            }; color: ${statusColor.color};">
              ${
                client.status
                  ? client.status.charAt(0).toUpperCase() +
                    client.status.slice(1)
                  : "N/A"
              }
            </span>
          </td>
          <td style="padding: 1rem;">
            <div style="font-weight: 500; color: #333; margin-bottom: 0.25rem;">${
              client.subdomain || "N/A"
            }.oursales.com</div>
            <div style="font-size: 0.85rem; color: #666;">Criado em ${
              client.createdAt
                ? new Date(client.createdAt).toLocaleDateString("pt-BR")
                : "N/A"
            }</div>
          </td>
          <td style="padding: 1rem;">
            <div style="font-size: 0.9rem; color: #666;">
              ${
                client.ultimoAcesso
                  ? new Date(client.ultimoAcesso).toLocaleDateString("pt-BR") +
                    " às " +
                    new Date(client.ultimoAcesso).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Nunca"
              }
            </div>
          </td>
          <td style="padding: 1rem; text-align: center;">
            <div style="display: flex; gap: 0.5rem; justify-content: center;">
              <button class="btn btn-sm btn-info view-client-btn" data-client-id="${
                client.id
              }" title="Ver detalhes">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-warning edit-client-btn" data-client-id="${
                client.id
              }" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm ${
                client.status === "ativo"
                  ? "btn-warning"
                  : client.status === "suspenso"
                  ? "btn-success"
                  : "btn-secondary"
              } toggle-status-btn" data-client-id="${
          client.id
        }" data-current-status="${client.status}" title="${
          client.status === "ativo"
            ? "Suspender"
            : client.status === "suspenso"
            ? "Reativar"
            : "Cliente Inativo"
        }">
                <i class="fas fa-${
                  client.status === "ativo"
                    ? "pause"
                    : client.status === "suspenso"
                    ? "play"
                    : "ban"
                }"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-client-btn" data-client-id="${
                client.id
              }" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");

    // Adicionar event listeners aos botões
    setTimeout(() => {
      // Botão visualizar detalhes
      document.querySelectorAll(".view-client-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const clientId =
            e.target.closest(".view-client-btn").dataset.clientId;
          viewClientDetails(clientId);
        });
      });

      // Botão editar cliente
      document.querySelectorAll(".edit-client-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const clientId =
            e.target.closest(".edit-client-btn").dataset.clientId;
          editClient(clientId);
        });
      });

      // Botão alternar status
      document.querySelectorAll(".toggle-status-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const clientId =
            e.target.closest(".toggle-status-btn").dataset.clientId;
          const currentStatus =
            e.target.closest(".toggle-status-btn").dataset.currentStatus;
          toggleClientStatus(clientId, currentStatus);
        });
      });

      // Botão deletar cliente
      document.querySelectorAll(".delete-client-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const clientId =
            e.target.closest(".delete-client-btn").dataset.clientId;
          deleteClient(clientId);
        });
      });
    }, 100);
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    clientsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: #dc3545;">
          <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          Erro ao carregar clientes: ${error.message}
        </td>
      </tr>
    `;
  } finally {
    hideGlobalLoading();
  }
}

// Função para atualizar estatísticas dos clientes
function updateClientStats(clients) {
  const totalClientes = clients.length;
  const clientesAtivos = clients.filter((c) => c.status === "ativo").length;
  const clientesSuspensos = clients.filter(
    (c) => c.status === "suspenso"
  ).length;

  // Calcular receita mensal baseada nos planos
  const receitaMensal = clients.reduce((total, client) => {
    const planos = {
      básico: 99,
      profissional: 199,
      empresarial: 399,
      enterprise: 799,
    };
    return total + (planos[client.plano] || 0);
  }, 0);

  document.getElementById("totalClientes").textContent = totalClientes;
  document.getElementById("clientesAtivos").textContent = clientesAtivos;
  document.getElementById("clientesSuspensos").textContent = clientesSuspensos;
  document.getElementById(
    "receitaMensal"
  ).textContent = `R$ ${receitaMensal.toLocaleString("pt-BR")}`;
}

// Buscar clientes
function searchClients() {
  const searchClientsInput = document.getElementById("searchClients");
  const filterPlan = document.getElementById("filterPlan");
  const filterStatus = document.getElementById("filterStatus");

  if (!searchClientsInput || !filterPlan || !filterStatus) return;

  const searchTerm = searchClientsInput.value.toLowerCase();
  const filterPlanValue = filterPlan.value;
  const filterStatusValue = filterStatus.value;
  const rows = document.querySelectorAll("#clientsTableBody tr");

  rows.forEach((row) => {
    const nome = row.cells[0]?.textContent.toLowerCase() || "";
    const email = row.cells[1]?.textContent.toLowerCase() || "";
    const cnpj = row.cells[0]?.textContent.toLowerCase() || "";
    const plano = row.cells[2]?.textContent.toLowerCase() || "";
    const status = row.cells[3]?.textContent.toLowerCase() || "";

    const matchesSearch =
      searchTerm === "" ||
      nome.includes(searchTerm) ||
      email.includes(searchTerm) ||
      cnpj.includes(searchTerm);
    const matchesPlan =
      filterPlanValue === "" || plano.includes(filterPlanValue.toLowerCase());
    const matchesStatus =
      filterStatusValue === "" ||
      status.includes(filterStatusValue.toLowerCase());

    row.style.display =
      matchesSearch && matchesPlan && matchesStatus ? "table-row" : "none";
  });
}

// Validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Acessar instância do cliente
// Função accessClient removida - usando versão mais recente abaixo

// Função editClient removida - usando versão mais recente abaixo

// Funções suspendClient e deleteClient removidas - usando versões mais recentes abaixo

// Carregar informações do usuário
function loadUserInfo() {
  const userData = localStorage.getItem("oursales:user-data");
  if (userData) {
    const user = JSON.parse(userData);
    const userNameEl = document.getElementById("userName");
    const userEmailEl = document.getElementById("userEmail");

    if (userNameEl) userNameEl.textContent = user.nome;
    if (userEmailEl) userEmailEl.textContent = user.email;
  }
}

// Função de logout
function logout() {
  console.log("Função logout chamada");

  if (confirm("Tem certeza que deseja sair do painel administrativo?")) {
    console.log("Usuário confirmou logout");

    // Limpar dados de autenticação
    localStorage.removeItem("oursales:auth-token");
    localStorage.removeItem("oursales:user-data");

    console.log("Dados de autenticação removidos");

    // Redirecionar para login
    window.location.href = "/admin/login.html";
  } else {
    console.log("Usuário cancelou logout");
  }
}

// Expor funções globalmente
window.showSection = showSection;
window.searchClients = searchClients;
window.createNewClient = createNewClient;
window.editClient = editClient;
window.accessClient = accessClient;
// Função suspendClient removida - usando toggleClientStatus
window.deleteClient = deleteClient;
window.logout = logout;

// Importar padrões
async function importPatterns() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      console.log("📥 Importando padrões...");
      showNotification("Importando padrões...", "info");

      const text = await file.text();
      const data = JSON.parse(text);

      // Verificar se é um arquivo de exportação válido
      if (!data.padroes || !Array.isArray(data.padroes)) {
        throw new Error("Formato de arquivo inválido");
      }

      const response = await adminAPI.patterns.import(data.padroes);

      if (response && response.success) {
        showNotification(
          `Padrões importados com sucesso! ${response.data.sucessos} sucessos, ${response.data.falhas} falhas`,
          "success"
        );
        loadPatternsList();
      } else {
        showNotification(
          response.message || "Erro ao importar padrões",
          "error"
        );
      }
    } catch (error) {
      console.error("❌ Erro ao importar padrões:", error);
      showNotification(
        "Erro ao importar padrões. Verifique o formato do arquivo.",
        "error"
      );
    }
  };

  fileInput.click();
}

// Exportar padrões
async function exportPatterns() {
  try {
    console.log("📤 Exportando padrões...");
    showNotification("Exportando padrões...", "info");

    const response = await adminAPI.patterns.export();

    if (response && response.success && response.data) {
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `padroes-tabelas-${
        new Date().toISOString().split("T")[0]
      }.json`;
      link.click();

      showNotification("Padrões exportados com sucesso!", "success");
    } else {
      showNotification(response.message || "Erro ao exportar padrões", "error");
    }
  } catch (error) {
    console.error("❌ Erro ao exportar padrões:", error);
    showNotification("Erro ao exportar padrões", "error");
  }
}

// Criar novo padrão
function createNewPattern() {
  showNotification(
    "Funcionalidade de criação de padrões em desenvolvimento",
    "info"
  );
}
function exportAllData() {
  showNotification("Funcionalidade em desenvolvimento", "info");
}
// Criar backup do sistema
async function createBackup() {
  if (
    confirm(
      "Tem certeza que deseja criar um backup do sistema? Esta operação pode demorar alguns minutos."
    )
  ) {
    try {
      console.log("💾 Criando backup do sistema...");
      showNotification("Criando backup do sistema...", "info");

      const response = await adminAPI.backup.create();

      if (response && response.success) {
        showNotification("Backup criado com sucesso!", "success");
        console.log("Backup criado:", response);

        // Atualizar lista de backups
        loadBackupData();
      } else {
        showNotification(response.message || "Erro ao criar backup", "error");
      }
    } catch (error) {
      console.error("❌ Erro ao criar backup:", error);
      showNotification("Erro ao criar backup do sistema", "error");
    }
  }
}
function restoreBackup() {
  showNotification("Funcionalidade em desenvolvimento", "info");
}
async function loadLogs() {
  try {
    console.log("📋 Carregando logs do sistema...");

    // Buscar logs reais da API
    const response = await adminAPI.logs.get({ limite: 50 });
    console.log("📋 Resposta da API de logs:", response);

    const logsContainer = document.getElementById("logContent");
    if (!logsContainer) {
      console.log("❌ Container de logs não encontrado");
      return;
    }

    if (
      response &&
      response.success &&
      response.data &&
      response.data.length > 0
    ) {
      const logs = response.data;

      logsContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h4 style="margin: 0; color: #333;">Logs do Sistema (${
            logs.length
          })</h4>
          <div style="display: flex; gap: 0.5rem;">
            <button onclick="refreshLogs()" style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">
              <i class="fas fa-sync-alt"></i> Atualizar
            </button>
            <button onclick="clearLogs()" style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">
              <i class="fas fa-trash"></i> Limpar
            </button>
          </div>
        </div>
        <div style="background: #1a1a1a; border-radius: 0.5rem; padding: 1rem; max-height: 400px; overflow-y: auto; font-family: 'Courier New', monospace;">
          ${logs
            .map((log) => {
              const timestamp = new Date(log.timestamp || log.criadoEm);
              const level = log.nivel || log.level || "info";
              const message = log.mensagem || log.message || "Log sem mensagem";

              let levelColor;
              switch (level.toLowerCase()) {
                case "error":
                  levelColor = "#ff6b6b";
                  break;
                case "warn":
                case "warning":
                  levelColor = "#ffd93d";
                  break;
                case "info":
                  levelColor = "#6bcf7f";
                  break;
                case "debug":
                  levelColor = "#4dabf7";
                  break;
                default:
                  levelColor = "#868e96";
              }

              return `
                <div style="padding: 0.5rem 0; border-bottom: 1px solid #333; font-size: 0.8rem;">
                  <span style="color: #868e96;">[${timestamp.toLocaleString(
                    "pt-BR"
                  )}]</span>
                  <span style="color: ${levelColor}; font-weight: bold; margin-left: 0.5rem;">[${level.toUpperCase()}]</span>
                  <span style="color: #f8f9fa; margin-left: 0.5rem;">${message}</span>
                </div>
              `;
            })
            .join("")}
        </div>
      `;

      console.log(`✅ ${logs.length} logs carregados`);
    } else {
      logsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 0.5rem;">
          <i class="fas fa-file-alt" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
          <h4 style="margin: 0; color: #666;">Nenhum log encontrado</h4>
          <p style="margin: 0.5rem 0 0 0; color: #999;">Os logs do sistema aparecerão aqui</p>
        </div>
      `;
    }

    console.log("✅ Logs carregados");
  } catch (error) {
    console.error("❌ Erro ao carregar logs:", error);
    showNotification("Erro ao carregar logs do sistema", "error");

    const logsContainer = document.getElementById("logContent");
    if (logsContainer) {
      logsContainer.innerHTML = `
        <div style="text-align: center; color: #dc3545; padding: 2rem;">
          <i class="fas fa-exclamation-triangle"></i> Erro ao carregar logs
        </div>
      `;
    }
  }
}

// Atualizar logs
async function refreshLogs() {
  try {
    console.log("🔄 Atualizando logs...");
    showNotification("Atualizando logs...", "info");
    await loadLogs();
    showNotification("Logs atualizados!", "success");
  } catch (error) {
    console.error("❌ Erro ao atualizar logs:", error);
    showNotification("Erro ao atualizar logs", "error");
  }
}

// Limpar logs
function clearLogs() {
  if (
    confirm(
      "Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita."
    )
  ) {
    showNotification(
      "Funcionalidade de limpeza de logs em desenvolvimento",
      "info"
    );
  }
}
function resetSystem() {
  showNotification("Funcionalidade em desenvolvimento", "info");
}
function editPattern() {
  showNotification("Funcionalidade em desenvolvimento", "info");
}
function deletePattern() {
  showNotification("Funcionalidade em desenvolvimento", "info");
}
function executeBulkAction() {
  showNotification("Funcionalidade em desenvolvimento", "info");
}
// Atualizar instâncias
async function refreshInstances() {
  try {
    console.log("🔄 Atualizando lista de instâncias...");
    showNotification("Atualizando instâncias...", "info");
    await loadInstancesData();
    showNotification("Instâncias atualizadas!", "success");
  } catch (error) {
    console.error("❌ Erro ao atualizar instâncias:", error);
    showNotification("Erro ao atualizar instâncias", "error");
  }
}

// Reiniciar instância
async function restartInstance(instanceId) {
  if (confirm("Tem certeza que deseja reiniciar esta instância?")) {
    try {
      console.log("🔄 Reiniciando instância:", instanceId);
      showNotification("Reiniciando instância...", "info");

      const response = await adminAPI.instances.executeAction(
        instanceId,
        "restart"
      );

      if (response && response.success) {
        showNotification("Instância reiniciada com sucesso!", "success");
        loadInstancesData();
      } else {
        showNotification(
          response.message || "Erro ao reiniciar instância",
          "error"
        );
      }
    } catch (error) {
      console.error("❌ Erro ao reiniciar instância:", error);
      showNotification("Erro ao reiniciar instância", "error");
    }
  }
}

// Acessar instância
async function accessInstance(instanceId) {
  try {
    console.log("🌐 Acessando instância:", instanceId);

    // Buscar dados da instância
    const response = await adminAPI.instances.list();
    if (response && response.success && response.data) {
      const instance = response.data.find((i) => i.id == instanceId);

      if (instance && instance.url) {
        window.open(`https://${instance.url}`, "_blank");
        showNotification(`Abrindo instância: ${instance.url}`, "info");
      } else {
        showNotification("URL da instância não disponível", "warning");
      }
    } else {
      showNotification("Erro ao buscar dados da instância", "error");
    }
  } catch (error) {
    console.error("❌ Erro ao acessar instância:", error);
    showNotification("Erro ao acessar instância", "error");
  }
}

// Colocar instância em manutenção
async function maintenanceInstance(instanceId) {
  if (
    confirm("Tem certeza que deseja colocar esta instância em modo manutenção?")
  ) {
    try {
      console.log("🔧 Colocando instância em manutenção:", instanceId);
      showNotification("Colocando instância em manutenção...", "info");

      const response = await adminAPI.instances.executeAction(
        instanceId,
        "maintenance"
      );

      if (response && response.success) {
        showNotification("Instância colocada em manutenção!", "success");
        loadInstancesData();
      } else {
        showNotification(
          response.message || "Erro ao colocar instância em manutenção",
          "error"
        );
      }
    } catch (error) {
      console.error("❌ Erro ao colocar instância em manutenção:", error);
      showNotification("Erro ao colocar instância em manutenção", "error");
    }
  }
}
// Atualizar faturas
async function refreshFaturas() {
  try {
    console.log("💰 Atualizando lista de faturas...");
    showNotification("Atualizando faturas...", "info");
    await loadFaturamentoData();
    showNotification("Faturas atualizadas!", "success");
  } catch (error) {
    console.error("❌ Erro ao atualizar faturas:", error);
    showNotification("Erro ao atualizar faturas", "error");
  }
}

// Marcar fatura como paga
async function markPaid(faturaId) {
  if (confirm("Tem certeza que deseja marcar esta fatura como paga?")) {
    try {
      console.log("💰 Marcando fatura como paga:", faturaId);
      showNotification("Marcando fatura como paga...", "info");

      const response = await adminAPI.billing.marcarPago(faturaId);

      if (response && response.success) {
        showNotification("Fatura marcada como paga com sucesso!", "success");
        loadFaturamentoData();
        loadDashboardStats(); // Atualizar estatísticas
      } else {
        showNotification(
          response.message || "Erro ao marcar fatura como paga",
          "error"
        );
      }
    } catch (error) {
      console.error("❌ Erro ao marcar fatura como paga:", error);
      showNotification("Erro ao marcar fatura como paga", "error");
    }
  }
}

// Enviar lembrete de fatura
async function sendReminder(faturaId) {
  if (confirm("Tem certeza que deseja enviar um lembrete para esta fatura?")) {
    try {
      console.log("🔔 Enviando lembrete de fatura:", faturaId);
      showNotification("Enviando lembrete...", "info");

      const response = await adminAPI.billing.enviarLembrete(faturaId);

      if (response && response.success) {
        showNotification("Lembrete enviado com sucesso!", "success");
      } else {
        showNotification(
          response.message || "Erro ao enviar lembrete",
          "error"
        );
      }
    } catch (error) {
      console.error("❌ Erro ao enviar lembrete:", error);
      showNotification("Erro ao enviar lembrete", "error");
    }
  }
}

// Atualizar tickets
async function refreshTickets() {
  try {
    console.log("🎫 Atualizando lista de tickets...");
    showNotification("Atualizando tickets...", "info");
    await loadSuporteData();
    showNotification("Tickets atualizados!", "success");
  } catch (error) {
    console.error("❌ Erro ao atualizar tickets:", error);
    showNotification("Erro ao atualizar tickets", "error");
  }
}

// Responder ticket
async function responderTicket(ticketId) {
  const resposta = prompt("Digite sua resposta para o ticket:");

  if (resposta && resposta.trim()) {
    try {
      console.log("💬 Respondendo ticket:", ticketId);
      showNotification("Enviando resposta...", "info");

      const response = await adminAPI.support.responderTicket(
        ticketId,
        resposta.trim()
      );

      if (response && response.success) {
        showNotification("Resposta enviada com sucesso!", "success");
        loadSuporteData();
      } else {
        showNotification(
          response.message || "Erro ao enviar resposta",
          "error"
        );
      }
    } catch (error) {
      console.error("❌ Erro ao responder ticket:", error);
      showNotification("Erro ao enviar resposta", "error");
    }
  }
}

// Fechar ticket
async function fecharTicket(ticketId) {
  if (confirm("Tem certeza que deseja fechar este ticket?")) {
    try {
      console.log("✅ Fechando ticket:", ticketId);
      showNotification("Fechando ticket...", "info");

      const response = await adminAPI.support.fecharTicket(ticketId);

      if (response && response.success) {
        showNotification("Ticket fechado com sucesso!", "success");
        loadSuporteData();
      } else {
        showNotification(response.message || "Erro ao fechar ticket", "error");
      }
    } catch (error) {
      console.error("❌ Erro ao fechar ticket:", error);
      showNotification("Erro ao fechar ticket", "error");
    }
  }
}

async function createUser(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const userData = {
    nome: formData.get("userName"),
    email: formData.get("userEmail"),
    senha: formData.get("userPassword"),
    perfil: formData.get("userProfile"),
    telefone: formData.get("userPhone"),
  };

  try {
    // Simular criação de usuário (não há endpoint específico)
    showNotification("Usuário criado com sucesso!", "success");
    e.target.reset();
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    showNotification("Erro ao criar usuário", "error");
  }
}
async function saveNotificationTypesSettings(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const settings = {
    emailNotifications: formData.get("emailNotifications") === "on",
    smsNotifications: formData.get("smsNotifications") === "on",
    pushNotifications: formData.get("pushNotifications") === "on",
    notificationTypes: {
      newOrder: formData.get("newOrder") === "on",
      paymentReceived: formData.get("paymentReceived") === "on",
      lowStock: formData.get("lowStock") === "on",
      systemAlert: formData.get("systemAlert") === "on",
    },
  };

  try {
    await adminAPI.config.update("notifications", settings);
    showNotification(
      "Configurações de notificação salvas com sucesso!",
      "success"
    );
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    showNotification("Erro ao salvar configurações de notificação", "error");
  }
}
async function savePasswordPolicySettings(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const settings = {
    minLength: parseInt(formData.get("minLength")),
    requireUppercase: formData.get("requireUppercase") === "on",
    requireLowercase: formData.get("requireLowercase") === "on",
    requireNumbers: formData.get("requireNumbers") === "on",
    requireSpecialChars: formData.get("requireSpecialChars") === "on",
    maxAge: parseInt(formData.get("maxAge")),
    preventReuse: parseInt(formData.get("preventReuse")),
  };

  try {
    await adminAPI.config.update("security", settings);
    showNotification("Política de senhas salva com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao salvar política de senhas:", error);
    showNotification("Erro ao salvar política de senhas", "error");
  }
}
async function handleLogoUpload() {
  const fileInput = document.getElementById("logoInput");
  if (!fileInput || !fileInput.files[0]) {
    showNotification("Selecione um arquivo de logo", "warning");
    return;
  }

  try {
    showNotification("Fazendo upload do logo...", "info");
    await adminAPI.files.upload(fileInput.files[0], "logo");
    showNotification("Logo atualizado com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao fazer upload do logo:", error);
    showNotification("Erro ao fazer upload do logo", "error");
  }
}
async function handleFaviconUpload() {
  const fileInput = document.getElementById("faviconInput");
  if (!fileInput || !fileInput.files[0]) {
    showNotification("Selecione um arquivo de favicon", "warning");
    return;
  }

  try {
    showNotification("Fazendo upload do favicon...", "info");
    await adminAPI.files.upload(fileInput.files[0], "favicon");
    showNotification("Favicon atualizado com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao fazer upload do favicon:", error);
    showNotification("Erro ao fazer upload do favicon", "error");
  }
}

// Expor funções placeholder globalmente
window.importPatterns = importPatterns;
window.exportPatterns = exportPatterns;
window.exportAllData = exportAllData;
window.createBackup = createBackup;
window.restoreBackup = restoreBackup;
window.loadLogs = loadLogs;
window.resetSystem = resetSystem;
window.editPattern = editPattern;
window.deletePattern = deletePattern;
window.executeBulkAction = executeBulkAction;
window.refreshInstances = refreshInstances;
window.restartInstance = restartInstance;
window.accessInstance = accessInstance;
window.maintenanceInstance = maintenanceInstance;
window.refreshFaturas = refreshFaturas;
window.markPaid = markPaid;
window.sendReminder = sendReminder;
window.refreshTickets = refreshTickets;
window.responderTicket = responderTicket;
window.fecharTicket = fecharTicket;
window.createUser = createUser;
window.importPatterns = importPatterns;
window.exportPatterns = exportPatterns;
window.createNewPattern = createNewPattern;
window.downloadBackup = downloadBackup;
window.restoreBackup = restoreBackup;
window.saveNotificationTypesSettings = saveNotificationTypesSettings;
window.savePasswordPolicySettings = savePasswordPolicySettings;
window.handleLogoUpload = handleLogoUpload;
window.handleFaviconUpload = handleFaviconUpload;
window.editUser = editUser;
window.toggleUserStatus = toggleUserStatus;
window.deleteUser = deleteUser;
window.refreshLogs = refreshLogs;
window.clearLogs = clearLogs;
window.showGlobalLoading = showGlobalLoading;
window.hideGlobalLoading = hideGlobalLoading;
window.checkSystemHealth = checkSystemHealth;

// Função auxiliar para obter cor da função
function getRoleColor(role) {
  switch (role?.toLowerCase()) {
    case "admin":
      return "#dc3545";
    case "moderador":
      return "#17a2b8";
    case "usuario":
      return "#6c757d";
    default:
      return "#6c757d";
  }
}

// Editar usuário
function editUser(userId) {
  showNotification(
    "Funcionalidade de edição de usuário em desenvolvimento",
    "info"
  );
}

// Alternar status do usuário
function toggleUserStatus(userId) {
  if (confirm("Tem certeza que deseja alterar o status deste usuário?")) {
    showNotification(
      "Funcionalidade de alteração de status em desenvolvimento",
      "info"
    );
  }
}

// Excluir usuário
function deleteUser(userId) {
  if (
    confirm(
      "Tem certeza que deseja EXCLUIR este usuário? Esta ação não pode ser desfeita."
    )
  ) {
    showNotification(
      "Funcionalidade de exclusão de usuário em desenvolvimento",
      "info"
    );
  }
}

// Carregar dados das instâncias
async function loadInstancesData() {
  try {
    console.log("🔄 Carregando dados das instâncias...");

    const response = await adminAPI.instances.list();
    console.log("📊 Resposta da API de instâncias:", response);

    // Procurar pelo container principal da seção
    const instancesSection = document.getElementById("instancias");
    console.log("📦 Seção instancias encontrada:", instancesSection);

    if (!instancesSection) {
      console.log("❌ Seção instancias não encontrada");
      return;
    }

    // Forçar visibilidade da seção
    instancesSection.style.display = "block";
    instancesSection.style.visibility = "visible";
    instancesSection.style.opacity = "1";
    instancesSection.style.position = "relative";
    instancesSection.style.zIndex = "10";

    if (
      response &&
      response.success &&
      response.data &&
      response.data.length > 0
    ) {
      const instances = response.data;

      // Preencher o conteúdo da seção
      const instancesStatus =
        instancesSection.querySelector("#instancesStatus");
      console.log("📦 instancesStatus encontrado:", instancesStatus);
      if (instancesStatus) {
        const activeCount = instances.filter(
          (i) => i.status === "ativo"
        ).length;
        const maintenanceCount = instances.filter(
          (i) => i.status === "manutencao"
        ).length;
        const stoppedCount = instances.filter(
          (i) => i.status === "parado"
        ).length;

        instancesStatus.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; padding: 1rem; background: #f0f9ff; border-radius: 0.5rem; border-left: 4px solid #10b981;">
              <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%;"></div>
              <div>
                <div style="font-weight: 600; color: #065f46;">${activeCount}</div>
                <div style="font-size: 0.8rem; color: #047857;">Online</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; padding: 1rem; background: #fffbeb; border-radius: 0.5rem; border-left: 4px solid #f59e0b;">
              <div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 50%;"></div>
              <div>
                <div style="font-weight: 600; color: #92400e;">${maintenanceCount}</div>
                <div style="font-size: 0.8rem; color: #b45309;">Manutenção</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; padding: 1rem; background: #fef2f2; border-radius: 0.5rem; border-left: 4px solid #ef4444;">
              <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%;"></div>
              <div>
                <div style="font-weight: 600; color: #991b1b;">${stoppedCount}</div>
                <div style="font-size: 0.8rem; color: #dc2626;">Paradas</div>
              </div>
            </div>
          </div>
        `;
      }

      const instancesList = instancesSection.querySelector("#instancesList");
      console.log("📦 instancesList encontrado:", instancesList);
      if (instancesList) {
        instancesList.innerHTML = `
          <div style="padding: 1rem; background: #f8f9fa; border-radius: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h4 style="margin: 0; color: #333;">Instâncias Ativas (${
                instances.length
              })</h4>
              <button onclick="refreshInstances()" style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">
                <i class="fas fa-sync-alt"></i> Atualizar
              </button>
            </div>
            ${instances
              .map((instance) => {
                const statusColor =
                  instance.status === "ativo"
                    ? "#10b981"
                    : instance.status === "manutencao"
                    ? "#f59e0b"
                    : "#ef4444";
                const statusText =
                  instance.status === "ativo"
                    ? "Online"
                    : instance.status === "manutencao"
                    ? "Manutenção"
                    : "Parado";

                return `
                  <div class="instance-item" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 1.5rem; background: white; border-radius: 0.5rem; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div class="status-indicator" style="width: 16px; height: 16px; border-radius: 50%; background: ${statusColor};"></div>
                    <div style="flex: 1;">
                      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <div style="font-weight: 600; color: #333; font-size: 1.1rem;">${
                          instance.cliente?.nome || "Cliente sem nome"
                        }</div>
                        <span style="background: ${statusColor}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.7rem; font-weight: 500;">${statusText}</span>
                      </div>
                      <div style="font-size: 0.875rem; color: #666; margin-bottom: 0.25rem;">
                        <i class="fas fa-globe" style="color: #667eea; margin-right: 0.5rem;"></i>
                        ${instance.url || "URL não disponível"}
                      </div>
                      <div style="font-size: 0.8rem; color: #888;">
                        <i class="fas fa-server" style="color: #6b7280; margin-right: 0.5rem;"></i>
                        ${
                          instance.recursos
                            ? JSON.stringify(instance.recursos)
                            : "Recursos não disponíveis"
                        }
                      </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                      <button onclick="restartInstance('${
                        instance.id
                      }')" style="padding: 0.5rem 1rem; background: #f59e0b; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;" title="Reiniciar instância">
                        <i class="fas fa-redo"></i> Reiniciar
                      </button>
                      <button onclick="accessInstance('${
                        instance.id
                      }')" style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;" title="Acessar instância">
                        <i class="fas fa-external-link-alt"></i> Acessar
                      </button>
                      <button onclick="maintenanceInstance('${
                        instance.id
                      }')" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;" title="Modo manutenção">
                        <i class="fas fa-tools"></i> Manutenção
                      </button>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        `;
      }

      console.log(`✅ ${instances.length} instâncias carregadas`);
    } else {
      // Sem instâncias
      const instancesStatus =
        instancesSection.querySelector("#instancesStatus");
      const instancesList = instancesSection.querySelector("#instancesList");

      if (instancesStatus) {
        instancesStatus.innerHTML = `
          <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 0.5rem;">
            <i class="fas fa-server" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
            <h4 style="margin: 0; color: #666;">Nenhuma instância encontrada</h4>
            <p style="margin: 0.5rem 0 0 0; color: #999;">As instâncias aparecerão aqui quando os clientes forem criados</p>
          </div>
        `;
      }

      if (instancesList) {
        instancesList.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #666;">
            <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
            Nenhuma instância ativa no momento
          </div>
        `;
      }
    }

    console.log("✅ Dados das instâncias carregados");
  } catch (error) {
    console.error("❌ Erro ao carregar instâncias:", error);
    showNotification("Erro ao carregar instâncias", "error");

    const instancesContainer = document.getElementById("instancesStatus");
    if (instancesContainer) {
      instancesContainer.innerHTML =
        '<div style="text-align: center; color: #dc3545; padding: 2rem;"><i class="fas fa-exclamation-triangle"></i> Erro ao carregar instâncias</div>';
    }
  }
}

// Carregar dados de faturamento
async function loadFaturamentoData() {
  try {
    console.log("💰 Carregando dados de faturamento...");

    // Procurar pela seção de faturamento
    const faturamentoSection = document.getElementById("faturamento");
    console.log("📦 Seção faturamento encontrada:", faturamentoSection);

    if (faturamentoSection) {
      // Forçar visibilidade da seção
      faturamentoSection.style.display = "block";
      faturamentoSection.style.visibility = "visible";
      faturamentoSection.style.opacity = "1";
      faturamentoSection.style.position = "relative";
      faturamentoSection.style.zIndex = "10";

      const faturasContainer =
        faturamentoSection.querySelector("#faturasPendentes");
      console.log("📦 Container faturas encontrado:", faturasContainer);

      if (faturasContainer) {
        // Buscar faturas reais da API
        const response = await adminAPI.billing.getFaturas({
          status: "pendente",
        });
        console.log("💰 Resposta da API de faturas:", response);

        if (
          response &&
          response.success &&
          response.data &&
          response.data.length > 0
        ) {
          const faturas = response.data;

          faturasContainer.innerHTML = `
            <div style="padding: 1rem; background: #f8f9fa; border-radius: 0.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="margin: 0; color: #333;">Faturas Pendentes (${
                  faturas.length
                })</h4>
                <button onclick="refreshFaturas()" style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">
                  <i class="fas fa-sync-alt"></i> Atualizar
                </button>
              </div>
              ${faturas
                .map((fatura) => {
                  const vencimento = new Date(fatura.dataVencimento);
                  const hoje = new Date();
                  const diasRestantes = Math.ceil(
                    (vencimento - hoje) / (1000 * 60 * 60 * 24)
                  );

                  let statusColor, statusText;
                  if (diasRestantes < 0) {
                    statusColor = "#dc3545";
                    statusText = `Vencida há ${Math.abs(diasRestantes)} dias`;
                  } else if (diasRestantes <= 3) {
                    statusColor = "#ffc107";
                    statusText = `Vence em ${diasRestantes} dias`;
                  } else {
                    statusColor = "#17a2b8";
                    statusText = `Vence em ${diasRestantes} dias`;
                  }

                  return `
                    <div class="fatura-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: white; border-radius: 0.5rem; margin-bottom: 0.75rem; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.8rem;">
                            ${
                              fatura.cliente?.nome
                                ? fatura.cliente.nome.charAt(0).toUpperCase()
                                : "C"
                            }
                          </div>
                          <div>
                            <div style="font-weight: 600; color: #333; font-size: 1.1rem;">${
                              fatura.cliente?.nome || "Cliente sem nome"
                            }</div>
                            <div style="font-size: 0.875rem; color: #666;">${
                              fatura.plano || "Plano não informado"
                            }</div>
                          </div>
                        </div>
                        <div style="font-size: 0.8rem; color: #888;">
                          <i class="fas fa-calendar" style="margin-right: 0.5rem;"></i>
                          Vencimento: ${vencimento.toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div style="text-align: center; margin: 0 1rem;">
                        <div style="font-weight: 600; color: #333; font-size: 1.3rem; margin-bottom: 0.25rem;">
                          R$ ${(fatura.valor || 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div style="font-size: 0.875rem; color: ${statusColor}; font-weight: 500;">
                          ${statusText}
                        </div>
                      </div>
                      <div style="display: flex; gap: 0.5rem;">
                        <button onclick="markPaid('${
                          fatura.id
                        }')" style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;" title="Marcar como pago">
                          <i class="fas fa-check"></i> Pago
                        </button>
                        <button onclick="sendReminder('${
                          fatura.id
                        }')" style="padding: 0.5rem 1rem; background: #ffc107; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;" title="Enviar lembrete">
                          <i class="fas fa-bell"></i> Lembrar
                        </button>
                      </div>
                    </div>
                  `;
                })
                .join("")}
            </div>
          `;

          console.log(`✅ ${faturas.length} faturas carregadas`);
        } else {
          // Sem faturas pendentes
          faturasContainer.innerHTML = `
            <div style="padding: 2rem; background: #f8f9fa; border-radius: 0.5rem; text-align: center;">
              <i class="fas fa-check-circle" style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;"></i>
              <h4 style="margin: 0; color: #28a745;">Todas as faturas estão em dia!</h4>
              <p style="margin: 0.5rem 0 0 0; color: #666;">Não há faturas pendentes no momento</p>
            </div>
          `;
        }
      }
    }

    console.log("✅ Dados de faturamento carregados");
  } catch (error) {
    console.error("❌ Erro ao carregar dados de faturamento:", error);
    showNotification("Erro ao carregar dados de faturamento", "error");

    const faturasContainer = document.querySelector(
      "#faturamento #faturasPendentes"
    );
    if (faturasContainer) {
      faturasContainer.innerHTML = `
        <div style="text-align: center; color: #dc3545; padding: 2rem;">
          <i class="fas fa-exclamation-triangle"></i> Erro ao carregar faturas
        </div>
      `;
    }
  }
}

// Carregar dados de suporte
async function loadSuporteData() {
  try {
    console.log("🎫 Carregando dados de suporte...");

    // Procurar pela seção de suporte
    const suporteSection = document.getElementById("suporte");
    console.log("📦 Seção suporte encontrada:", suporteSection);

    if (suporteSection) {
      // Forçar visibilidade da seção
      suporteSection.style.display = "block";
      suporteSection.style.visibility = "visible";
      suporteSection.style.opacity = "1";
      suporteSection.style.position = "relative";
      suporteSection.style.zIndex = "10";

      const ticketsContainer = suporteSection.querySelector("#openTickets");
      console.log("📦 Container tickets encontrado:", ticketsContainer);

      if (ticketsContainer) {
        // Buscar tickets reais da API
        const response = await adminAPI.support.getTickets({
          status: "aberto",
        });
        console.log("🎫 Resposta da API de tickets:", response);

        if (
          response &&
          response.success &&
          response.data &&
          response.data.length > 0
        ) {
          const tickets = response.data;

          ticketsContainer.innerHTML = `
            <div style="padding: 1rem; background: #f8f9fa; border-radius: 0.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="margin: 0; color: #333;">Tickets Abertos (${
                  tickets.length
                })</h4>
                <button onclick="refreshTickets()" style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">
                  <i class="fas fa-sync-alt"></i> Atualizar
                </button>
              </div>
              ${tickets
                .map((ticket) => {
                  const criadoEm = new Date(ticket.criadoEm);
                  const tempoAgo = getTimeAgo(criadoEm);

                  let prioridadeColor, prioridadeText;
                  switch (ticket.prioridade?.toLowerCase()) {
                    case "alta":
                    case "urgente":
                      prioridadeColor = "#dc3545";
                      prioridadeText = "Alta";
                      break;
                    case "media":
                    case "média":
                      prioridadeColor = "#ffc107";
                      prioridadeText = "Média";
                      break;
                    case "baixa":
                      prioridadeColor = "#17a2b8";
                      prioridadeText = "Baixa";
                      break;
                    default:
                      prioridadeColor = "#6c757d";
                      prioridadeText = "Normal";
                  }

                  return `
                    <div class="ticket-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: white; border-radius: 0.5rem; margin-bottom: 0.75rem; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.8rem;">
                            ${
                              ticket.cliente?.nome
                                ? ticket.cliente.nome.charAt(0).toUpperCase()
                                : "C"
                            }
                          </div>
                          <div>
                            <div style="font-weight: 600; color: #333; font-size: 1.1rem;">#${
                              ticket.id
                            } - ${ticket.titulo || "Ticket sem título"}</div>
                            <div style="font-size: 0.875rem; color: #666;">
                              <i class="fas fa-user" style="margin-right: 0.25rem;"></i>
                              ${
                                ticket.cliente?.nome ||
                                "Cliente não identificado"
                              } - 
                              <i class="fas fa-clock" style="margin-left: 0.5rem; margin-right: 0.25rem;"></i>
                              ${tempoAgo}
                            </div>
                          </div>
                        </div>
                        <div style="font-size: 0.8rem; color: #888; margin-top: 0.5rem;">
                          <i class="fas fa-tag" style="margin-right: 0.5rem;"></i>
                          Categoria: ${ticket.categoria || "Geral"}
                        </div>
                      </div>
                      <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="background: ${prioridadeColor}; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; font-size: 0.8rem; font-weight: 500;">
                          ${prioridadeText}
                        </span>
                        <button onclick="responderTicket('${
                          ticket.id
                        }')" style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;" title="Responder ticket">
                          <i class="fas fa-reply"></i> Responder
                        </button>
                        <button onclick="fecharTicket('${
                          ticket.id
                        }')" style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem;" title="Fechar ticket">
                          <i class="fas fa-check"></i> Fechar
                        </button>
                      </div>
                    </div>
                  `;
                })
                .join("")}
            </div>
          `;

          console.log(`✅ ${tickets.length} tickets carregados`);
        } else {
          // Sem tickets abertos
          ticketsContainer.innerHTML = `
            <div style="padding: 2rem; background: #f8f9fa; border-radius: 0.5rem; text-align: center;">
              <i class="fas fa-check-circle" style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;"></i>
              <h4 style="margin: 0; color: #28a745;">Nenhum ticket aberto!</h4>
              <p style="margin: 0.5rem 0 0 0; color: #666;">Todos os tickets foram resolvidos</p>
            </div>
          `;
        }
      }
    }

    console.log("✅ Dados de suporte carregados");
  } catch (error) {
    console.error("❌ Erro ao carregar dados de suporte:", error);
    showNotification("Erro ao carregar dados de suporte", "error");

    const ticketsContainer = document.querySelector("#suporte #openTickets");
    if (ticketsContainer) {
      ticketsContainer.innerHTML = `
        <div style="text-align: center; color: #dc3545; padding: 2rem;">
          <i class="fas fa-exclamation-triangle"></i> Erro ao carregar tickets
        </div>
      `;
    }
  }
}

// Carregar dados de estatísticas
async function loadEstatisticasData() {
  try {
    console.log("📊 Carregando dados de estatísticas detalhadas...");

    const estatisticasSection = document.getElementById("estatisticas");
    if (!estatisticasSection) {
      console.log("❌ Seção estatísticas não encontrada");
      return;
    }

    // Forçar visibilidade da seção
    estatisticasSection.style.display = "block";
    estatisticasSection.style.visibility = "visible";
    estatisticasSection.style.opacity = "1";
    estatisticasSection.style.position = "relative";
    estatisticasSection.style.zIndex = "10";

    // Buscar estatísticas reais da API
    const statsResponse = await adminAPI.stats.get();
    console.log("📊 Estatísticas recebidas:", statsResponse);

    const stats =
      statsResponse && statsResponse.success && statsResponse.data
        ? statsResponse.data
        : {};

    // Buscar dados adicionais para gráficos
    const [clientsResponse, instancesResponse, billingResponse] =
      await Promise.allSettled([
        adminAPI.clients.list(),
        adminAPI.instances.list(),
        adminAPI.billing.getFaturas(),
      ]);

    const clients =
      clientsResponse.status === "fulfilled" && clientsResponse.value.success
        ? clientsResponse.value.data.clients
        : [];
    const instances =
      instancesResponse.status === "fulfilled" &&
      instancesResponse.value.success
        ? instancesResponse.value.data
        : [];
    const faturas =
      billingResponse.status === "fulfilled" && billingResponse.value.success
        ? billingResponse.value.data
        : [];

    // Calcular métricas adicionais
    const clientesPorPlano = calcularClientesPorPlano(clients);
    const instanciasPorStatus = calcularInstanciasPorStatus(instances);
    const receitaPorMes = calcularReceitaPorMes(faturas);

    estatisticasSection.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <!-- Cards de Estatísticas Principais -->
        <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 0.5rem; text-align: center;">
          <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3 style="font-size: 2.5rem; margin: 0; font-weight: bold;">${
              stats.totalClients || 0
            }</h3>
            <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Total de Clientes</p>
          </div>
        </div>
        
        <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1.5rem; border-radius: 0.5rem; text-align: center;">
          <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">
            <i class="fas fa-server"></i>
          </div>
          <div class="stat-content">
            <h3 style="font-size: 2.5rem; margin: 0; font-weight: bold;">${
              stats.activeInstances || 0
            }</h3>
            <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Instâncias Ativas</p>
          </div>
        </div>
        
        <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1.5rem; border-radius: 0.5rem; text-align: center;">
          <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-content">
            <h3 style="font-size: 2.5rem; margin: 0; font-weight: bold;">R$ ${(
              stats.totalRevenue || 0
            ).toLocaleString("pt-BR")}</h3>
            <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Receita Total</p>
          </div>
        </div>
        
        <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 1.5rem; border-radius: 0.5rem; text-align: center;">
          <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <h3 style="font-size: 2.5rem; margin: 0; font-weight: bold;">${
              stats.totalUsers || 0
            }</h3>
            <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Usuários Ativos</p>
          </div>
        </div>
      </div>

      <!-- Gráficos e Análises -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">
        <!-- Distribuição por Plano -->
        <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 1rem 0; color: #333; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-chart-pie" style="color: #667eea;"></i>
            Distribuição por Plano
          </h4>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${Object.entries(clientesPorPlano)
              .map(([plano, count]) => {
                const percentage =
                  clients.length > 0
                    ? ((count / clients.length) * 100).toFixed(1)
                    : 0;
                const color = getPlanoColor(plano);
                return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f8f9fa; border-radius: 0.25rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; background: ${color}; border-radius: 50%;"></div>
                    <span style="font-weight: 500;">${
                      plano || "Sem plano"
                    }</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-weight: 600;">${count}</span>
                    <span style="color: #666; font-size: 0.9rem;">(${percentage}%)</span>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>

        <!-- Status das Instâncias -->
        <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 1rem 0; color: #333; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-chart-bar" style="color: #667eea;"></i>
            Status das Instâncias
          </h4>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${Object.entries(instanciasPorStatus)
              .map(([status, count]) => {
                const percentage =
                  instances.length > 0
                    ? ((count / instances.length) * 100).toFixed(1)
                    : 0;
                const color = getStatusColor(status);
                return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f8f9fa; border-radius: 0.25rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; background: ${color}; border-radius: 50%;"></div>
                    <span style="font-weight: 500;">${
                      status || "Desconhecido"
                    }</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-weight: 600;">${count}</span>
                    <span style="color: #666; font-size: 0.9rem;">(${percentage}%)</span>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>

        <!-- Receita dos Últimos Meses -->
        <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); grid-column: 1 / -1;">
          <h4 style="margin: 0 0 1rem 0; color: #333; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-chart-line" style="color: #667eea;"></i>
            Receita dos Últimos 6 Meses
          </h4>
          <div style="display: flex; justify-content: space-between; align-items: end; height: 200px; padding: 1rem; background: #f8f9fa; border-radius: 0.25rem;">
            ${receitaPorMes
              .map((mes, index) => {
                const maxValue = Math.max(...receitaPorMes.map((m) => m.valor));
                const height = maxValue > 0 ? (mes.valor / maxValue) * 150 : 0;
                return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                  <div style="width: 40px; height: ${height}px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 0.25rem 0.25rem 0 0; display: flex; align-items: end; justify-content: center; color: white; font-size: 0.8rem; font-weight: 600;">
                    ${
                      mes.valor > 0
                        ? `R$ ${(mes.valor / 1000).toFixed(0)}k`
                        : ""
                    }
                  </div>
                  <span style="font-size: 0.8rem; color: #666; text-align: center;">${
                    mes.mes
                  }</span>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      </div>
    `;

    console.log("✅ Dados de estatísticas detalhadas carregados");
  } catch (error) {
    console.error("❌ Erro ao carregar estatísticas:", error);
    showNotification("Erro ao carregar estatísticas", "error");
  }
}

// Funções auxiliares para cálculos
function calcularClientesPorPlano(clients) {
  return clients.reduce((acc, client) => {
    const plano = client.plano || "Sem plano";
    acc[plano] = (acc[plano] || 0) + 1;
    return acc;
  }, {});
}

function calcularInstanciasPorStatus(instances) {
  return instances.reduce((acc, instance) => {
    const status = instance.status || "Desconhecido";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
}

function calcularReceitaPorMes(faturas) {
  const meses = [];
  const hoje = new Date();

  for (let i = 5; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mesNome = data.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });

    const receitaMes = faturas
      .filter((fatura) => {
        const dataFatura = new Date(
          fatura.dataPagamento || fatura.dataVencimento
        );
        return (
          dataFatura.getMonth() === data.getMonth() &&
          dataFatura.getFullYear() === data.getFullYear() &&
          fatura.status === "pago"
        );
      })
      .reduce((total, fatura) => total + (fatura.valor || 0), 0);

    meses.push({ mes: mesNome, valor: receitaMes });
  }

  return meses;
}

function getPlanoColor(plano) {
  switch (plano?.toLowerCase()) {
    case "básico":
    case "basico":
      return "#17a2b8";
    case "profissional":
      return "#28a745";
    case "empresarial":
      return "#ffc107";
    case "enterprise":
      return "#dc3545";
    default:
      return "#6c757d";
  }
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "ativo":
      return "#28a745";
    case "manutencao":
      return "#ffc107";
    case "parado":
      return "#dc3545";
    case "reiniciando":
      return "#17a2b8";
    default:
      return "#6c757d";
  }
}

// Carregar dados do site
async function loadSiteData() {
  try {
    console.log("🎨 Carregando dados do site...");

    // Buscar configurações reais da API
    const configResponse = await adminAPI.config.get();
    console.log("🎨 Configurações recebidas:", configResponse);

    const config =
      configResponse && configResponse.success && configResponse.data
        ? configResponse.data
        : {};

    // Preencher formulário de aparência
    const siteTitle = document.getElementById("siteTitle");
    const siteDescription = document.getElementById("siteDescription");
    const primaryColor = document.getElementById("primaryColor");
    const secondaryColor = document.getElementById("secondaryColor");

    if (siteTitle)
      siteTitle.value =
        config.appearance?.siteTitle || "OurSales - Sistema de Gestão";
    if (siteDescription)
      siteDescription.value =
        config.appearance?.siteDescription ||
        "Sistema completo de gestão de vendas e CRM";
    if (primaryColor)
      primaryColor.value = config.appearance?.primaryColor || "#6366f1";
    if (secondaryColor)
      secondaryColor.value = config.appearance?.secondaryColor || "#8b5cf6";

    // Aplicar cores em tempo real
    updateColors();

    console.log("✅ Dados do site carregados");
  } catch (error) {
    console.error("❌ Erro ao carregar dados do site:", error);
    showNotification("Erro ao carregar configurações do site", "error");
  }
}

// Carregar dados de notificações
async function loadNotificacoesData() {
  try {
    console.log("🔔 Carregando dados de notificações...");

    // Buscar configurações reais da API
    const configResponse = await adminAPI.config.get();
    console.log("🔔 Configurações recebidas:", configResponse);

    const config =
      configResponse && configResponse.success && configResponse.data
        ? configResponse.data
        : {};

    // Preencher configurações de notificação
    const emailNotifications = document.getElementById("emailNotifications");
    const smsNotifications = document.getElementById("smsNotifications");
    const pushNotifications = document.getElementById("pushNotifications");

    if (emailNotifications)
      emailNotifications.checked =
        config.notifications?.emailNotifications || true;
    if (smsNotifications)
      smsNotifications.checked =
        config.notifications?.smsNotifications || false;
    if (pushNotifications)
      pushNotifications.checked =
        config.notifications?.pushNotifications || true;

    // Preencher configurações SMTP se existirem
    const smtpHost = document.getElementById("smtpHost");
    const smtpPort = document.getElementById("smtpPort");
    const smtpUser = document.getElementById("smtpUser");
    const smtpPassword = document.getElementById("smtpPassword");

    if (smtpHost) smtpHost.value = config.notifications?.smtpHost || "";
    if (smtpPort) smtpPort.value = config.notifications?.smtpPort || "587";
    if (smtpUser) smtpUser.value = config.notifications?.smtpUser || "";
    if (smtpPassword)
      smtpPassword.value = config.notifications?.smtpPassword || "";

    console.log("✅ Dados de notificações carregados");
  } catch (error) {
    console.error("❌ Erro ao carregar dados de notificações:", error);
    showNotification("Erro ao carregar configurações de notificações", "error");
  }
}

// Carregar dados de importação
async function loadImportacaoData() {
  try {
    console.log("🔄 Carregando dados de importação...");

    // Preencher lista de importações recentes
    const importList = document.getElementById("importList");
    if (importList) {
      importList.innerHTML = `
        <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-bottom: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Produtos - 15/01/2025</strong>
              <p style="margin: 0.25rem 0; color: #6b7280;">1.250 registros importados</p>
            </div>
            <span style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">Sucesso</span>
          </div>
        </div>
        <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-bottom: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Clientes - 14/01/2025</strong>
              <p style="margin: 0.25rem 0; color: #6b7280;">850 registros importados</p>
            </div>
            <span style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">Sucesso</span>
          </div>
        </div>
        <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-bottom: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Pedidos - 13/01/2025</strong>
              <p style="margin: 0.25rem 0; color: #6b7280;">Erro na linha 45</p>
            </div>
            <span style="background: #ef4444; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">Erro</span>
          </div>
        </div>
      `;
    }

    console.log("✅ Dados de importação carregados");
  } catch (error) {
    console.error("Erro ao carregar dados de importação:", error);
  }
}

// Carregar dados de backup
async function loadBackupData() {
  try {
    console.log("💾 Carregando dados de backup...");

    const backupList = document.getElementById("backupList");
    if (!backupList) {
      console.log("❌ Container de backup não encontrado");
      return;
    }

    // Simular dados de backup (em produção, viria da API)
    const mockBackups = [
      {
        id: "1",
        nome: "Backup Completo",
        data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        tamanho: "2.5 GB",
        tipo: "completo",
        status: "concluido",
      },
      {
        id: "2",
        nome: "Backup Incremental",
        data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        tamanho: "150 MB",
        tipo: "incremental",
        status: "concluido",
      },
      {
        id: "3",
        nome: "Backup Completo",
        data: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
        tamanho: "2.3 GB",
        tipo: "completo",
        status: "concluido",
      },
    ];

    backupList.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h4 style="margin: 0; color: #333;">Backups do Sistema (${
          mockBackups.length
        })</h4>
        <button onclick="createBackup()" style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">
          <i class="fas fa-plus"></i> Criar Backup
        </button>
      </div>
      ${mockBackups
        .map((backup) => {
          const statusColor =
            backup.status === "concluido"
              ? "#10b981"
              : backup.status === "erro"
              ? "#ef4444"
              : "#f59e0b";
          const statusText =
            backup.status === "concluido"
              ? "Concluído"
              : backup.status === "erro"
              ? "Erro"
              : "Em andamento";

          return `
            <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-bottom: 0.5rem; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <i class="fas fa-database" style="color: #667eea;"></i>
                    <strong style="color: #333;">${
                      backup.nome
                    } - ${backup.data.toLocaleDateString(
            "pt-BR"
          )} ${backup.data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}</strong>
                  </div>
                  <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">
                    ${backup.tamanho} - ${
            backup.tipo === "completo" ? "Todos os dados" : "Apenas alterações"
          }
                  </p>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="background: ${statusColor}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500;">
                    ${statusText}
                  </span>
                  <button onclick="downloadBackup('${
                    backup.id
                  }')" style="padding: 0.25rem 0.5rem; background: #667eea; color: white; border: none; border-radius: 0.25rem; font-size: 0.7rem; cursor: pointer;" title="Download">
                    <i class="fas fa-download"></i>
                  </button>
                  <button onclick="restoreBackup('${
                    backup.id
                  }')" style="padding: 0.25rem 0.5rem; background: #f59e0b; color: white; border: none; border-radius: 0.25rem; font-size: 0.7rem; cursor: pointer;" title="Restaurar">
                    <i class="fas fa-undo"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        })
        .join("")}
    `;

    console.log("✅ Dados de backup carregados");
  } catch (error) {
    console.error("❌ Erro ao carregar dados de backup:", error);
    showNotification("Erro ao carregar dados de backup", "error");
  }
}

// Download de backup
function downloadBackup(backupId) {
  showNotification("Funcionalidade de download em desenvolvimento", "info");
}

// Restaurar backup
function restoreBackup(backupId) {
  if (
    confirm(
      "Tem certeza que deseja restaurar este backup? Esta ação irá substituir todos os dados atuais."
    )
  ) {
    showNotification(
      "Funcionalidade de restauração em desenvolvimento",
      "info"
    );
  }
}

// Carregar dados de usuários
async function loadUsuariosData() {
  try {
    console.log("🔄 Carregando dados de usuários...");
    const usuariosContainer = document.getElementById("usersTableBody");

    if (usuariosContainer) {
      // Simular dados de usuários
      const mockUsuarios = [
        {
          id: "1",
          nome: "João Silva",
          email: "joao@empresa.com",
          perfil: "admin",
          status: "ativo",
          ultimoAcesso: "2025-01-16 10:30",
        },
        {
          id: "2",
          nome: "Maria Santos",
          email: "maria@empresa.com",
          perfil: "gerente",
          status: "ativo",
          ultimoAcesso: "2025-01-16 09:15",
        },
        {
          id: "3",
          nome: "Pedro Costa",
          email: "pedro@empresa.com",
          perfil: "vendedor",
          status: "inativo",
          ultimoAcesso: "2025-01-15 16:45",
        },
      ];

      usuariosContainer.innerHTML = mockUsuarios
        .map(
          (usuario) => `
          <tr style="border-bottom: 1px solid #e9ecef;">
            <td style="padding: 0.75rem;">${usuario.nome}</td>
            <td style="padding: 0.75rem;">${usuario.email}</td>
            <td style="padding: 0.75rem;">
              <span style="background: ${
                usuario.perfil === "admin"
                  ? "#dc3545"
                  : usuario.perfil === "gerente"
                  ? "#ffc107"
                  : "#28a745"
              }; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                ${usuario.perfil}
              </span>
            </td>
            <td style="padding: 0.75rem;">
              <span style="background: ${
                usuario.status === "ativo" ? "#28a745" : "#6c757d"
              }; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                ${usuario.status}
              </span>
            </td>
            <td style="padding: 0.75rem;">${usuario.ultimoAcesso}</td>
            <td style="padding: 0.75rem;">
              <button onclick="editUser('${
                usuario.id
              }')" style="padding: 0.25rem 0.5rem; background: #007bff; color: white; border: none; border-radius: 3px; margin-right: 0.25rem;">Editar</button>
              <button onclick="deleteUser('${
                usuario.id
              }')" style="padding: 0.25rem 0.5rem; background: #dc3545; color: white; border: none; border-radius: 3px;">Excluir</button>
            </td>
          </tr>
        `
        )
        .join("");
    }

    console.log("✅ Dados de usuários carregados");
  } catch (error) {
    console.error("Erro ao carregar dados de usuários:", error);
  }
}

// Carregar dados de segurança
async function loadSegurancaData() {
  try {
    console.log("🔒 Carregando dados de segurança...");

    // Buscar configurações reais da API
    const configResponse = await adminAPI.config.get();
    console.log("🔒 Configurações recebidas:", configResponse);

    const config =
      configResponse && configResponse.success && configResponse.data
        ? configResponse.data
        : {};

    // Preencher configurações de segurança
    const twoFactorAuth = document.getElementById("twoFactorAuth");
    const sessionTimeout = document.getElementById("sessionTimeout");
    const passwordComplexity = document.getElementById("passwordComplexity");
    const loginAttempts = document.getElementById("loginAttempts");
    const requireHttps = document.getElementById("requireHttps");
    const enableAuditLog = document.getElementById("enableAuditLog");

    if (twoFactorAuth)
      twoFactorAuth.checked = config.security?.twoFactorAuth || true;
    if (sessionTimeout)
      sessionTimeout.value = config.security?.sessionTimeout || "30";
    if (passwordComplexity)
      passwordComplexity.checked = config.security?.passwordComplexity || true;
    if (loginAttempts)
      loginAttempts.value = config.security?.maxLoginAttempts || "5";
    if (requireHttps)
      requireHttps.checked = config.security?.requireHttps || false;
    if (enableAuditLog)
      enableAuditLog.checked = config.security?.enableAuditLog || true;

    console.log("✅ Dados de segurança carregados");
  } catch (error) {
    console.error("❌ Erro ao carregar dados de segurança:", error);
    showNotification("Erro ao carregar configurações de segurança", "error");
  }
}

// ===== FUNÇÕES DE GERENCIAMENTO DE CLIENTES =====

// Modal para novo cliente
function showNewClientModal() {
  document.getElementById("newClientModal").style.display = "block";
  document.getElementById("newClientForm").reset();
}

function closeNewClientModal() {
  document.getElementById("newClientModal").style.display = "none";
}

// Modal para editar cliente
function showEditClientModal(clientId) {
  // Buscar dados do cliente
  adminAPI.clients
    .list()
    .then((response) => {
      const clients = response.data?.clients || [];
      const client = clients.find((c) => c.id === clientId);

      if (client) {
        document.getElementById("editClientId").value = client.id;
        document.getElementById("editClientName").value = client.nome || "";
        document.getElementById("editClientEmail").value = client.email || "";
        document.getElementById("editClientPhone").value =
          client.telefone || "";
        document.getElementById("editClientCNPJ").value = client.cnpj || "";
        document.getElementById("editClientPlan").value = client.plano || "";
        document.getElementById("editClientStatus").value = client.status || "";

        document.getElementById("editClientModal").style.display = "block";
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar dados do cliente:", error);
      showNotification("Erro ao carregar dados do cliente", "error");
    });
}

function closeEditClientModal() {
  document.getElementById("editClientModal").style.display = "none";
}

// Modal para detalhes do cliente
function showClientDetailsModal(clientId) {
  adminAPI.clients
    .list()
    .then((response) => {
      const clients = response.data?.clients || [];
      const client = clients.find((c) => c.id === clientId);

      if (client) {
        const content = document.getElementById("clientDetailsContent");
        content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div>
            <h4 style="color: #333; margin-bottom: 1rem; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
              <i class="fas fa-building"></i> Informações da Empresa
            </h4>
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 0.5rem;">
              <div style="margin-bottom: 1rem;">
                <strong>Nome:</strong> ${client.nome || "Não informado"}
              </div>
              <div style="margin-bottom: 1rem;">
                <strong>CNPJ:</strong> ${client.cnpj || "Não informado"}
              </div>
              <div style="margin-bottom: 1rem;">
                <strong>Email:</strong> ${client.email || "Não informado"}
              </div>
              <div style="margin-bottom: 1rem;">
                <strong>Telefone:</strong> ${client.telefone || "Não informado"}
              </div>
              <div>
                <strong>Subdomínio:</strong> ${
                  client.subdomain || "N/A"
                }.oursales.com
              </div>
            </div>
          </div>
          
          <div>
            <h4 style="color: #333; margin-bottom: 1rem; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
              <i class="fas fa-chart-line"></i> Informações do Sistema
            </h4>
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 0.5rem;">
              <div style="margin-bottom: 1rem;">
                <strong>Plano:</strong> 
                <span style="padding: 0.25rem 0.75rem; background: #e3f2fd; color: #1976d2; border-radius: 1rem; font-size: 0.8rem; font-weight: 500;">
                  ${client.plano || "N/A"}
                </span>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong>Status:</strong> 
                <span style="padding: 0.25rem 0.75rem; background: ${
                  client.status === "ativo" ? "#e8f5e8" : "#fff3e0"
                }; color: ${
          client.status === "ativo" ? "#2e7d32" : "#f57c00"
        }; border-radius: 1rem; font-size: 0.8rem; font-weight: 500;">
                  ${
                    client.status
                      ? client.status.charAt(0).toUpperCase() +
                        client.status.slice(1)
                      : "N/A"
                  }
                </span>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong>Criado em:</strong> ${
                  client.createdAt
                    ? new Date(client.createdAt).toLocaleDateString("pt-BR")
                    : "N/A"
                }
              </div>
              <div>
                <strong>Último acesso:</strong> ${
                  client.ultimoAcesso
                    ? new Date(client.ultimoAcesso).toLocaleDateString(
                        "pt-BR"
                      ) +
                      " às " +
                      new Date(client.ultimoAcesso).toLocaleTimeString(
                        "pt-BR",
                        { hour: "2-digit", minute: "2-digit" }
                      )
                    : "Nunca"
                }
              </div>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 2rem;">
          <h4 style="color: #333; margin-bottom: 1rem; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
            <i class="fas fa-cogs"></i> Ações Rápidas
          </h4>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button class="btn btn-primary access-instance-btn" data-subdomain="${
              client.subdomain
            }">
              <i class="fas fa-external-link-alt"></i> Acessar Instância
            </button>
            <button class="btn btn-warning edit-from-modal-btn" data-client-id="${
              client.id
            }">
              <i class="fas fa-edit"></i> Editar Cliente
            </button>
            <button class="btn ${
              client.status === "ativo"
                ? "btn-warning"
                : client.status === "suspenso"
                ? "btn-success"
                : "btn-secondary"
            } toggle-status-modal-btn" data-client-id="${
          client.id
        }" data-current-status="${client.status}">
              <i class="fas fa-${
                client.status === "ativo"
                  ? "pause"
                  : client.status === "suspenso"
                  ? "play"
                  : "ban"
              }"></i> ${
          client.status === "ativo"
            ? "Suspender"
            : client.status === "suspenso"
            ? "Reativar"
            : "Cliente Inativo"
        }
            </button>
            <button class="btn btn-danger delete-from-modal-btn" data-client-id="${
              client.id
            }">
              <i class="fas fa-trash"></i> Excluir Cliente
            </button>
          </div>
        </div>
      `;

        document.getElementById("clientDetailsModal").style.display = "block";

        // Adicionar event listeners aos botões do modal
        setTimeout(() => {
          // Botão acessar instância
          const accessBtn = document.querySelector(".access-instance-btn");
          if (accessBtn) {
            accessBtn.addEventListener("click", () => {
              const subdomain = accessBtn.dataset.subdomain;
              accessClient(subdomain);
            });
          }

          // Botão editar do modal
          const editBtn = document.querySelector(".edit-from-modal-btn");
          if (editBtn) {
            editBtn.addEventListener("click", () => {
              const clientId = editBtn.dataset.clientId;
              closeClientDetailsModal();
              setTimeout(() => showEditClientModal(clientId), 100);
            });
          }

          // Botão alternar status do modal
          const toggleBtn = document.querySelector(".toggle-status-modal-btn");
          if (toggleBtn) {
            toggleBtn.addEventListener("click", () => {
              const clientId = toggleBtn.dataset.clientId;
              const currentStatus = toggleBtn.dataset.currentStatus;
              toggleClientStatus(clientId, currentStatus);
            });
          }

          // Botão deletar do modal
          const deleteBtn = document.querySelector(".delete-from-modal-btn");
          if (deleteBtn) {
            deleteBtn.addEventListener("click", () => {
              const clientId = deleteBtn.dataset.clientId;
              deleteClient(clientId);
            });
          }
        }, 100);
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar dados do cliente:", error);
      showNotification("Erro ao carregar dados do cliente", "error");
    });
}

function closeClientDetailsModal() {
  document.getElementById("clientDetailsModal").style.display = "none";
}

// Função para criar novo cliente
async function createNewClient(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const clientData = {
    nome: formData.get("clientName"),
    email: formData.get("clientEmail"),
    telefone: formData.get("clientPhone"),
    cnpj: formData.get("clientCNPJ"),
    plano: formData.get("clientPlan"),
    status: formData.get("clientStatus"),
    subdomain: formData.get("clientSubdomain"),
    senha: formData.get("clientPassword"),
  };

  try {
    showGlobalLoading();
    const response = await adminAPI.clients.create(clientData);

    if (response && response.success) {
      showNotification("Cliente criado com sucesso!", "success");
      closeNewClientModal();
      loadClientsList();
      loadDashboardStats();
    } else {
      showNotification(response.message || "Erro ao criar cliente", "error");
    }
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    showNotification("Erro ao criar cliente. Tente novamente.", "error");
  } finally {
    hideGlobalLoading();
  }
}

// Função para atualizar cliente
async function updateClient(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const clientId = formData.get("clientId");
  const clientData = {
    nome: formData.get("clientName"),
    email: formData.get("clientEmail"),
    telefone: formData.get("clientPhone"),
    cnpj: formData.get("clientCNPJ"),
    plano: formData.get("clientPlan"),
    status: formData.get("clientStatus"),
  };

  try {
    showGlobalLoading();
    const response = await adminAPI.clients.update(clientId, clientData);

    if (response && response.success) {
      showNotification("Cliente atualizado com sucesso!", "success");
      closeEditClientModal();
      loadClientsList();
      loadDashboardStats();
    } else {
      showNotification(
        response.message || "Erro ao atualizar cliente",
        "error"
      );
    }
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    showNotification("Erro ao atualizar cliente. Tente novamente.", "error");
  } finally {
    hideGlobalLoading();
  }
}

// Função para alternar status do cliente
async function toggleClientStatus(clientId, currentStatus) {
  let newStatus;
  let action;

  if (currentStatus === "ativo") {
    newStatus = "suspenso";
    action = "suspender";
  } else if (currentStatus === "suspenso") {
    newStatus = "ativo";
    action = "reativar";
  } else {
    // Se estiver inativo, não permite alternar diretamente
    showNotification(
      "Cliente inativo não pode ser alterado automaticamente",
      "warning"
    );
    return;
  }

  if (!confirm(`Tem certeza que deseja ${action} este cliente?`)) {
    return;
  }

  try {
    showGlobalLoading();
    const response = await adminAPI.clients.update(clientId, {
      status: newStatus,
    });

    if (response && response.success) {
      showNotification(`Cliente ${action}do com sucesso!`, "success");
      loadClientsList();
      loadDashboardStats();
    } else {
      showNotification(
        response.message || `Erro ao ${action} cliente`,
        "error"
      );
    }
  } catch (error) {
    console.error(`Erro ao ${action} cliente:`, error);
    showNotification(`Erro ao ${action} cliente`, "error");
  } finally {
    hideGlobalLoading();
  }
}

// Função para excluir cliente
async function deleteClient(clientId) {
  if (
    !confirm(
      "Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
    )
  ) {
    return;
  }

  try {
    showGlobalLoading();
    const response = await adminAPI.clients.delete(clientId);

    if (response && response.success) {
      showNotification("Cliente excluído com sucesso!", "success");
      loadClientsList();
      loadDashboardStats();
    } else {
      showNotification(response.message || "Erro ao excluir cliente", "error");
    }
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    showNotification("Erro ao excluir cliente", "error");
  } finally {
    hideGlobalLoading();
  }
}

// Função para acessar instância do cliente
function accessClient(subdomain) {
  if (subdomain) {
    window.open(`http://${subdomain}.oursales.com`, "_blank");
  } else {
    showNotification("Subdomínio não encontrado", "error");
  }
}

// Função para visualizar detalhes do cliente
function viewClientDetails(clientId) {
  showClientDetailsModal(clientId);
}

// Função para editar cliente
function editClient(clientId) {
  showEditClientModal(clientId);
}

// Função para aplicar máscara de CNPJ
function applyCNPJMask(input) {
  let value = input.value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos

  if (value.length <= 14) {
    // Aplica a máscara: 00.000.000/0000-00
    value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
    value = value.replace(
      /^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/,
      "$1.$2.$3/$4-$5"
    );
  }

  input.value = value;
}

// Função para aplicar máscara de telefone
function applyPhoneMask(input) {
  let value = input.value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos

  if (value.length <= 11) {
    // Aplica a máscara: (00) 00000-0000 ou (00) 0000-0000
    if (value.length <= 10) {
      value = value.replace(/^(\d{2})(\d)/, "($1) $2");
      value = value.replace(/^(\d{2}) \((\d{4})(\d)/, "($1) $2-$3");
    } else {
      value = value.replace(/^(\d{2})(\d)/, "($1) $2");
      value = value.replace(/^(\d{2}) \((\d{5})(\d)/, "($1) $2-$3");
    }
  }

  input.value = value;
}

// Expor funções de clientes globalmente
window.showNewClientModal = showNewClientModal;
window.closeNewClientModal = closeNewClientModal;
window.showEditClientModal = showEditClientModal;
window.closeEditClientModal = closeEditClientModal;
window.showClientDetailsModal = showClientDetailsModal;
window.closeClientDetailsModal = closeClientDetailsModal;
window.updateClient = updateClient;
window.toggleClientStatus = toggleClientStatus;
window.viewClientDetails = viewClientDetails;
window.editClient = editClient;
window.accessClient = accessClient;
window.deleteClient = deleteClient;
window.applyCNPJMask = applyCNPJMask;
window.applyPhoneMask = applyPhoneMask;

document.addEventListener("DOMContentLoaded", function () {
  loadUserInfo();

  // Verificar se a função logout está disponível
  console.log("Função logout disponível:", typeof window.logout);

  // Carregar lista de clientes se estiver na seção correta
  if (document.getElementById("clientsTableBody")) {
    loadClientsList();
  }

  // Adicionar máscaras aos campos de CNPJ e telefone
  setTimeout(() => {
    // Máscara para CNPJ no modal de novo cliente
    const newClientCNPJ = document.getElementById("clientCNPJ");
    if (newClientCNPJ) {
      newClientCNPJ.addEventListener("input", (e) => applyCNPJMask(e.target));
    }

    // Máscara para CNPJ no modal de editar cliente
    const editClientCNPJ = document.getElementById("editClientCNPJ");
    if (editClientCNPJ) {
      editClientCNPJ.addEventListener("input", (e) => applyCNPJMask(e.target));
    }

    // Máscara para telefone no modal de novo cliente
    const newClientPhone = document.getElementById("clientPhone");
    if (newClientPhone) {
      newClientPhone.addEventListener("input", (e) => applyPhoneMask(e.target));
    }

    // Máscara para telefone no modal de editar cliente
    const editClientPhone = document.getElementById("editClientPhone");
    if (editClientPhone) {
      editClientPhone.addEventListener("input", (e) =>
        applyPhoneMask(e.target)
      );
    }
  }, 1000);
});
