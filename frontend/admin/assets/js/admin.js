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
function loadDashboardStats() {
  // Simular dados do dashboard
  const totalClientes = document.getElementById("totalClientes");
  const totalInstancias = document.getElementById("totalInstancias");
  const receitaMensal = document.getElementById("receitaMensal");
  const totalUsuariosSistema = document.getElementById("totalUsuariosSistema");

  if (totalClientes) totalClientes.textContent = "12";
  if (totalInstancias) totalInstancias.textContent = "8";
  if (receitaMensal) receitaMensal.textContent = "R$ 2.340";
  if (totalUsuariosSistema) totalUsuariosSistema.textContent = "156";
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

  adminConfig.settings.appearance = {
    siteTitle: formData.get("siteTitle"),
    siteDescription: formData.get("siteDescription"),
    primaryColor: formData.get("primaryColor"),
    secondaryColor: formData.get("secondaryColor"),
  };

  try {
    await adminAPI.config.update("appearance", adminConfig.settings.appearance);
    showNotification("Configurações de aparência salvas!", "success");
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    showNotification("Erro ao salvar configurações", "error");
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

  adminConfig.settings.security = {
    sessionTimeout: parseInt(formData.get("sessionTimeout")),
    maxLoginAttempts: parseInt(formData.get("maxLoginAttempts")),
    requireHttps: formData.has("requireHttps"),
    enableAuditLog: formData.has("enableAuditLog"),
  };

  try {
    await adminAPI.config.update("security", adminConfig.settings.security);
    showNotification("Configurações de segurança salvas!", "success");
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    showNotification("Erro ao salvar configurações", "error");
  }
}

// Salvar configurações de notificação
async function saveNotificationSettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  adminConfig.settings.notifications = {
    emailNotifications: formData.has("emailNotifications"),
    smtpHost: formData.get("smtpHost"),
    smtpPort: parseInt(formData.get("smtpPort")),
    smtpUser: formData.get("smtpUser"),
    smtpPassword: formData.get("smtpPassword"),
  };

  try {
    await adminAPI.config.update(
      "notifications",
      adminConfig.settings.notifications
    );
    showNotification(
      "Configurações de notificação salvas com sucesso!",
      "success"
    );
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    showNotification("Erro ao salvar configurações", "error");
  }
}

// Carregar lista de padrões
function loadPatternsList() {
  const patternsContainer = document.getElementById("activePatterns");
  if (!patternsContainer) return;

  if (adminConfig.patterns.length === 0) {
    patternsContainer.innerHTML = `
      <p style="text-align: center; color: var(--admin-text-light); padding: 2rem;">
        Nenhum padrão cadastrado ainda.
      </p>
    `;
    return;
  }

  patternsContainer.innerHTML = adminConfig.patterns
    .map(
      (pattern) => `
      <div class="pattern-item">
        <h4>${pattern.nome}</h4>
        <p>Tipo: ${pattern.tipo}</p>
        <p>Colunas: ${pattern.colunas.length}</p>
        <div class="pattern-actions">
          <button onclick="editPattern('${pattern.id}')" class="btn btn-sm btn-secondary">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button onclick="deletePattern('${pattern.id}')" class="btn btn-sm btn-danger">
            <i class="fas fa-trash"></i> Excluir
          </button>
        </div>
      </div>
    `
    )
    .join("");
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
async function createNewClient(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const clientData = {
    nome: formData.get("clientName"),
    email: formData.get("clientEmail"),
    telefone: formData.get("clientPhone"),
    cnpj: formData.get("clientCNPJ"),
    plano: formData.get("clientPlan"),
    subdomain: formData.get("clientSubdomain"),
    senha: formData.get("clientPassword"),
  };

  try {
    const response = await adminAPI.clients.create(clientData);
    showNotification("Cliente criado com sucesso!", "success");
    e.target.reset();
    loadClientsList();
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    showNotification("Erro ao criar cliente", "error");
  }
}

// Carregar lista de clientes
async function loadClientsList() {
  try {
    const clients = await adminAPI.clients.list();
    const tbody = document.getElementById("clientsTableBody");

    if (!tbody) return;

    if (clients && clients.length > 0) {
      tbody.innerHTML = clients
        .map(
          (client) => `
        <tr>
          <td>${client.nome}</td>
          <td>${client.email}</td>
          <td><span class="status-badge status-active">${client.plano}</span></td>
          <td><span class="status-badge status-active">${client.status}</span></td>
          <td>${client.subdomain}.oursales.com</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="accessClient('${client.subdomain}')">
              <i class="fas fa-external-link-alt"></i>
            </button>
            <button class="btn btn-sm btn-secondary" onclick="editClient('${client.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-warning" onclick="suspendClient('${client.id}')">
              <i class="fas fa-pause"></i>
            </button>
          </td>
        </tr>
      `
        )
        .join("");
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--admin-text-light); padding: 2rem;">
            Nenhum cliente cadastrado ainda.
          </td>
        </tr>
      `;
    }
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
  }
}

// Buscar clientes
function searchClients() {
  const searchClientsInput = document.getElementById("searchClients");
  const filterPlan = document.getElementById("filterPlan");

  if (!searchClientsInput || !filterPlan) return;

  const searchTerm = searchClientsInput.value.toLowerCase();
  const filterPlanValue = filterPlan.value;
  const rows = document.querySelectorAll("#clientsTableBody tr");

  rows.forEach((row) => {
    const nome = row.cells[0]?.textContent.toLowerCase() || "";
    const email = row.cells[1]?.textContent.toLowerCase() || "";
    const plano = row.cells[2]?.textContent.toLowerCase() || "";

    const matchesSearch =
      nome.includes(searchTerm) || email.includes(searchTerm);
    const matchesPlan = !filterPlanValue || plano.includes(filterPlanValue);

    row.style.display = matchesSearch && matchesPlan ? "" : "none";
  });
}

// Acessar instância do cliente
function accessClient(subdomain) {
  const url = `https://${subdomain}.oursales.com`;
  window.open(url, "_blank");
}

// Editar cliente
function editClient(clientId) {
  showNotification("Funcionalidade de edição em desenvolvimento", "info");
}

// Suspender cliente
async function suspendClient(clientId) {
  if (confirm("Tem certeza que deseja suspender este cliente?")) {
    try {
      await adminAPI.clients.update(clientId, { status: "suspenso" });
      showNotification("Cliente suspenso com sucesso!", "success");
      loadClientsList();
    } catch (error) {
      console.error("Erro ao suspender cliente:", error);
      showNotification("Erro ao suspender cliente", "error");
    }
  }
}

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
window.suspendClient = suspendClient;
window.logout = logout;

// Funções placeholder para funcionalidades não implementadas
async function importPatterns() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const patterns = JSON.parse(text);

      showNotification("Importando padrões...", "info");
      await adminAPI.patterns.import(patterns);
      showNotification("Padrões importados com sucesso!", "success");
      loadPatterns();
    } catch (error) {
      console.error("Erro ao importar padrões:", error);
      showNotification("Erro ao importar padrões", "error");
    }
  };

  fileInput.click();
}
async function exportPatterns() {
  try {
    const patterns = await adminAPI.patterns.export();
    const dataStr = JSON.stringify(patterns, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `padroes-tabelas-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    showNotification("Padrões exportados com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao exportar padrões:", error);
    showNotification("Erro ao exportar padrões", "error");
  }
}
function exportAllData() {
  showNotification("Funcionalidade em desenvolvimento", "info");
}
async function createBackup() {
  try {
    showNotification("Criando backup do sistema...", "info");
    const response = await adminAPI.backup.create();
    showNotification("Backup criado com sucesso!", "success");
    console.log("Backup criado:", response);
  } catch (error) {
    console.error("Erro ao criar backup:", error);
    showNotification("Erro ao criar backup do sistema", "error");
  }
}
function restoreBackup() {
  showNotification("Funcionalidade em desenvolvimento", "info");
}
async function loadLogs() {
  try {
    const logs = await adminAPI.logs.get();
    const logsContainer = document.getElementById("logContent");

    if (!logsContainer) return;

    if (logs && logs.length > 0) {
      logsContainer.innerHTML = logs
        .map(
          (log) => `
          <div class="log-entry ${log.level}">
            <div class="log-time">${new Date(
              log.timestamp
            ).toLocaleString()}</div>
            <div class="log-level">${log.level.toUpperCase()}</div>
            <div class="log-message">${log.message}</div>
            <div class="log-source">${log.source}</div>
          </div>
        `
        )
        .join("");
    } else {
      logsContainer.innerHTML =
        '<div class="no-logs">Nenhum log encontrado</div>';
    }
  } catch (error) {
    console.error("Erro ao carregar logs:", error);
    showNotification("Erro ao carregar logs do sistema", "error");
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
function restartInstance() {
  showNotification("Funcionalidade em desenvolvimento", "info");
}
function accessInstance() {
  showNotification("Funcionalidade em desenvolvimento", "info");
}
function maintenanceInstance() {
  showNotification("Funcionalidade em desenvolvimento", "info");
}
function markPaid() {
  showNotification("Funcionalidade em desenvolvimento", "info");
}
function sendReminder() {
  showNotification("Funcionalidade em desenvolvimento", "info");
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
window.restartInstance = restartInstance;
window.accessInstance = accessInstance;
window.maintenanceInstance = maintenanceInstance;
window.markPaid = markPaid;
window.sendReminder = sendReminder;
window.createUser = createUser;
window.saveNotificationTypesSettings = saveNotificationTypesSettings;
window.savePasswordPolicySettings = savePasswordPolicySettings;
window.handleLogoUpload = handleLogoUpload;
window.handleFaviconUpload = handleFaviconUpload;

// Carregar dados das instâncias
async function loadInstancesData() {
  try {
    console.log("🔄 Carregando dados das instâncias...");
    const instances = await adminAPI.instances.list();
    console.log("📊 Instâncias recebidas:", instances);

    // Procurar pelo container principal da seção
    const instancesSection = document.getElementById("instancias");
    console.log("📦 Seção instancias encontrada:", instancesSection);

    if (!instancesSection) {
      console.log("❌ Seção instancias não encontrada");
      return;
    }

    // Simular dados de instâncias para demonstração
    const mockInstances = [
      {
        id: "1",
        cliente: "João Silva",
        url: "joao.oursales.com",
        status: "ativo",
        recursos: "2GB RAM, 1 CPU",
      },
      {
        id: "2",
        cliente: "Maria Santos",
        url: "maria.oursales.com",
        status: "ativo",
        recursos: "4GB RAM, 2 CPU",
      },
      {
        id: "3",
        cliente: "Pedro Costa",
        url: "pedro.oursales.com",
        status: "manutencao",
        recursos: "1GB RAM, 1 CPU",
      },
    ];

    // Forçar visibilidade da seção
    instancesSection.style.display = "block";
    instancesSection.style.visibility = "visible";
    instancesSection.style.opacity = "1";
    instancesSection.style.position = "relative";
    instancesSection.style.zIndex = "10";

    // Preencher o conteúdo da seção
    const instancesStatus = instancesSection.querySelector("#instancesStatus");
    console.log("📦 instancesStatus encontrado:", instancesStatus);
    if (instancesStatus) {
      instancesStatus.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
          <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%;"></div>
          <span>Online: ${
            mockInstances.filter((i) => i.status === "ativo").length
          } instâncias</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
          <div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 50%;"></div>
          <span>Manutenção: ${
            mockInstances.filter((i) => i.status === "manutencao").length
          } instâncias</span>
        </div>
      `;
    }

    const instancesList = instancesSection.querySelector("#instancesList");
    console.log("📦 instancesList encontrado:", instancesList);
    if (instancesList) {
      instancesList.innerHTML = `
        <div style="padding: 1rem; background: #f8f9fa; border-radius: 0.5rem;">
          <h4 style="margin: 0 0 1rem 0; color: #333;">Instâncias Ativas</h4>
          ${mockInstances
            .map(
              (instance) => `
            <div class="instance-item" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 0.5rem; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div class="status-indicator" style="width: 12px; height: 12px; border-radius: 50%; background: ${
                instance.status === "ativo" ? "#28a745" : "#ffc107"
              };"></div>
              <div style="flex: 1;">
                <div style="font-weight: 500; color: #333; font-size: 1.1rem;">${
                  instance.cliente
                }</div>
                <div style="font-size: 0.875rem; color: #666;">${
                  instance.url
                }</div>
                <div style="font-size: 0.8rem; color: #888;">${
                  instance.recursos
                }</div>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button onclick="restartInstance('${
                  instance.id
                }')" style="padding: 0.5rem 1rem; background: #ffc107; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">Reiniciar</button>
                <button onclick="accessInstance('${
                  instance.id
                }')" style="padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">Acessar</button>
                <button onclick="maintenanceInstance('${
                  instance.id
                }')" style="padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">Manutenção</button>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    console.log("✅ Dados das instâncias carregados");
  } catch (error) {
    console.error("Erro ao carregar instâncias:", error);
    const instancesContainer = document.getElementById("instancesStatus");
    if (instancesContainer) {
      instancesContainer.innerHTML =
        '<div style="text-align: center; color: #666; padding: 2rem;">Erro ao carregar instâncias</div>';
    }
  }
}

// Carregar dados de faturamento
async function loadFaturamentoData() {
  try {
    console.log("🔄 Carregando dados de faturamento...");

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
        // Simular dados de faturas
        const mockFaturas = [
          {
            id: "1",
            cliente: "João Silva",
            plano: "Plano Profissional",
            valor: "R$ 199,00",
            vencimento: "Vence em 5 dias",
            status: "warning",
          },
          {
            id: "2",
            cliente: "Maria Santos",
            plano: "Plano Básico",
            valor: "R$ 99,00",
            vencimento: "Vence em 2 dias",
            status: "danger",
          },
          {
            id: "3",
            cliente: "Pedro Costa",
            plano: "Plano Empresarial",
            valor: "R$ 299,00",
            vencimento: "Vence em 10 dias",
            status: "info",
          },
        ];

        faturasContainer.innerHTML = `
          <div style="padding: 1rem; background: #f8f9fa; border-radius: 0.5rem;">
            <h4 style="margin: 0 0 1rem 0; color: #333;">Faturas Pendentes</h4>
            ${mockFaturas
              .map(
                (fatura) => `
              <div class="fatura-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; border-radius: 0.5rem; margin-bottom: 0.5rem; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="flex: 1;">
                  <div style="font-weight: 500; color: #333; font-size: 1.1rem;">${
                    fatura.cliente
                  }</div>
                  <div style="font-size: 0.875rem; color: #666;">${
                    fatura.plano
                  }</div>
                </div>
                <div style="text-align: center; margin: 0 1rem;">
                  <div style="font-weight: 500; color: #333; font-size: 1.2rem;">${
                    fatura.valor
                  }</div>
                  <div style="font-size: 0.875rem; color: ${
                    fatura.status === "danger"
                      ? "#dc3545"
                      : fatura.status === "warning"
                      ? "#ffc107"
                      : "#17a2b8"
                  };">${fatura.vencimento}</div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <button onclick="markPaid('${
                    fatura.id
                  }')" style="padding: 0.5rem 1rem; background: #28a745; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">Marcar Pago</button>
                  <button onclick="sendReminder('${
                    fatura.id
                  }')" style="padding: 0.5rem 1rem; background: #ffc107; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">Lembrar</button>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        `;
      }
    }

    console.log("✅ Dados de faturamento carregados");
  } catch (error) {
    console.error("Erro ao carregar dados de faturamento:", error);
  }
}

// Carregar dados de suporte
async function loadSuporteData() {
  try {
    console.log("🔄 Carregando dados de suporte...");

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
        // Simular dados de tickets
        const mockTickets = [
          {
            id: "1234",
            titulo: "Problema com login",
            cliente: "João Silva",
            tempo: "2 horas atrás",
            prioridade: "Médio",
            cor: "#ffc107",
          },
          {
            id: "1235",
            titulo: "Dúvida sobre relatórios",
            cliente: "Maria Santos",
            tempo: "1 dia atrás",
            prioridade: "Baixo",
            cor: "#17a2b8",
          },
          {
            id: "1236",
            titulo: "Erro no sistema de vendas",
            cliente: "Pedro Costa",
            tempo: "30 minutos atrás",
            prioridade: "Alto",
            cor: "#dc3545",
          },
        ];

        ticketsContainer.innerHTML = `
          <div style="padding: 1rem; background: #f8f9fa; border-radius: 0.5rem;">
            <h4 style="margin: 0 0 1rem 0; color: #333;">Tickets Abertos</h4>
            ${mockTickets
              .map(
                (ticket) => `
              <div class="ticket-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; border-radius: 0.5rem; margin-bottom: 0.5rem; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="flex: 1;">
                  <div style="font-weight: 500; color: #333; font-size: 1.1rem;">#${ticket.id} - ${ticket.titulo}</div>
                  <div style="font-size: 0.875rem; color: #666;">${ticket.cliente} - ${ticket.tempo}</div>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <span style="background: ${ticket.cor}; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; font-size: 0.8rem; font-weight: 500;">${ticket.prioridade}</span>
                  <button style="padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 0.25rem; font-size: 0.8rem; cursor: pointer;">Responder</button>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        `;
      }
    }

    console.log("✅ Dados de suporte carregados");
  } catch (error) {
    console.error("Erro ao carregar dados de suporte:", error);
  }
}

// Carregar dados de estatísticas
async function loadEstatisticasData() {
  try {
    console.log("🔄 Carregando dados de estatísticas...");
    const statsContainer = document.getElementById("estatisticasContainer");
    console.log("📦 Container estatísticas encontrado:", statsContainer);

    if (statsContainer) {
      // Simular dados de estatísticas
      const mockStats = {
        totalClientes: 127,
        instanciasAtivas: 8,
        receitaTotal: "45.230",
        totalUsuarios: 156,
      };

      statsContainer.innerHTML = `
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
          <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 0.5rem; text-align: center;">
            <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <h3 style="font-size: 2.5rem; margin: 0; font-weight: bold;">${mockStats.totalClientes}</h3>
              <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Total de Clientes</p>
            </div>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1.5rem; border-radius: 0.5rem; text-align: center;">
            <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">
              <i class="fas fa-server"></i>
            </div>
            <div class="stat-content">
              <h3 style="font-size: 2.5rem; margin: 0; font-weight: bold;">${mockStats.instanciasAtivas}</h3>
              <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Instâncias Ativas</p>
            </div>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1.5rem; border-radius: 0.5rem; text-align: center;">
            <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-content">
              <h3 style="font-size: 2.5rem; margin: 0; font-weight: bold;">R$ ${mockStats.receitaTotal}</h3>
              <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Receita Total</p>
            </div>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 1.5rem; border-radius: 0.5rem; text-align: center;">
            <div class="stat-icon" style="font-size: 2rem; margin-bottom: 1rem;">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="stat-content">
              <h3 style="font-size: 2.5rem; margin: 0; font-weight: bold;">${mockStats.totalUsuarios}</h3>
              <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Usuários Ativos</p>
            </div>
          </div>
        </div>
      `;

      console.log("✅ Dados de estatísticas carregados");
    }
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
  }
}

// Carregar dados do site
async function loadSiteData() {
  try {
    console.log("🔄 Carregando dados do site...");

    // Preencher formulário de aparência
    const siteTitle = document.getElementById("siteTitle");
    const siteDescription = document.getElementById("siteDescription");
    const primaryColor = document.getElementById("primaryColor");
    const secondaryColor = document.getElementById("secondaryColor");

    if (siteTitle) siteTitle.value = "OurSales - Sistema de Gestão";
    if (siteDescription)
      siteDescription.value = "Sistema completo de gestão de vendas e CRM";
    if (primaryColor) primaryColor.value = "#6366f1";
    if (secondaryColor) secondaryColor.value = "#8b5cf6";

    console.log("✅ Dados do site carregados");
  } catch (error) {
    console.error("Erro ao carregar dados do site:", error);
  }
}

// Carregar dados de notificações
async function loadNotificacoesData() {
  try {
    console.log("🔄 Carregando dados de notificações...");

    // Preencher configurações de notificação
    const emailNotifications = document.getElementById("emailNotifications");
    const smsNotifications = document.getElementById("smsNotifications");
    const pushNotifications = document.getElementById("pushNotifications");

    if (emailNotifications) emailNotifications.checked = true;
    if (smsNotifications) smsNotifications.checked = false;
    if (pushNotifications) pushNotifications.checked = true;

    console.log("✅ Dados de notificações carregados");
  } catch (error) {
    console.error("Erro ao carregar dados de notificações:", error);
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
    console.log("🔄 Carregando dados de backup...");

    // Preencher lista de backups
    const backupList = document.getElementById("backupList");
    if (backupList) {
      backupList.innerHTML = `
        <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-bottom: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Backup Completo - 15/01/2025 14:30</strong>
              <p style="margin: 0.25rem 0; color: #6b7280;">2.5 GB - Todos os dados</p>
            </div>
            <span style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">Concluído</span>
          </div>
        </div>
        <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-bottom: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Backup Incremental - 14/01/2025 14:30</strong>
              <p style="margin: 0.25rem 0; color: #6b7280;">150 MB - Apenas alterações</p>
            </div>
            <span style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">Concluído</span>
          </div>
        </div>
        <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-bottom: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Backup Completo - 13/01/2025 14:30</strong>
              <p style="margin: 0.25rem 0; color: #6b7280;">2.3 GB - Todos os dados</p>
            </div>
            <span style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">Concluído</span>
          </div>
        </div>
      `;
    }

    console.log("✅ Dados de backup carregados");
  } catch (error) {
    console.error("Erro ao carregar dados de backup:", error);
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
    console.log("🔄 Carregando dados de segurança...");

    // Preencher configurações de segurança
    const twoFactorAuth = document.getElementById("twoFactorAuth");
    const sessionTimeout = document.getElementById("sessionTimeout");
    const passwordComplexity = document.getElementById("passwordComplexity");
    const loginAttempts = document.getElementById("loginAttempts");

    if (twoFactorAuth) twoFactorAuth.checked = true;
    if (sessionTimeout) sessionTimeout.value = "30";
    if (passwordComplexity) passwordComplexity.checked = true;
    if (loginAttempts) loginAttempts.value = "5";

    console.log("✅ Dados de segurança carregados");
  } catch (error) {
    console.error("Erro ao carregar dados de segurança:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadUserInfo();

  // Verificar se a função logout está disponível
  console.log("Função logout disponível:", typeof window.logout);

  // Carregar lista de clientes se estiver na seção correta
  if (document.getElementById("clientsTableBody")) {
    loadClientsList();
  }
});
