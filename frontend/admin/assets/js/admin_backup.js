/**
 * OurSales Admin Panel - JavaScript
 * Funcionalidades do painel administrativo
 */

import adminAPI from "./admin-api.js";

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
  // Verificar autenticação
  if (!adminAPI.utils.requireAuth()) {
    return;
  }

  loadAdminData();
  setupEventListeners();
  setupFileUploads();
  setupDangerZone();
});

// Carregar dados administrativos
async function loadAdminData() {
  try {
    // Carregar configurações do servidor
    const configResponse = await adminAPI.config.get();
    if (configResponse.success) {
      Object.assign(adminConfig.settings, configResponse.data);
    }

    // Carregar padrões do servidor
    const patternsResponse = await adminAPI.patterns.list();
    if (patternsResponse.success) {
      adminConfig.patterns = patternsResponse.data;
    }

    // Aplicar configurações na interface
    applySettingsToUI();
    loadActivePatterns();
    loadDashboardStats();
  } catch (error) {
    console.error("Erro ao carregar dados administrativos:", error);
    showNotification("Erro ao carregar dados do servidor", "error");

    // Fallback para dados locais
    loadLocalData();
  }
}

// Carregar estatísticas do dashboard
function loadDashboardStats() {
  // Simular dados do dashboard master (em produção, buscar do servidor)
  document.getElementById("totalClientes").textContent = "47";
  document.getElementById("totalInstancias").textContent = "45";
  document.getElementById("receitaMensal").textContent = "R$ 45.230";
  document.getElementById("totalUsuariosSistema").textContent = "1.247";
}

// Carregar dados locais como fallback
function loadLocalData() {
  const savedConfig = localStorage.getItem("oursales:admin-config");
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      Object.assign(adminConfig.settings, config);
    } catch (e) {
      console.error("Erro ao carregar configurações locais:", e);
    }
  }

  const savedPatterns = localStorage.getItem("oursales:table-patterns");
  if (savedPatterns) {
    try {
      adminConfig.patterns = JSON.parse(savedPatterns);
    } catch (e) {
      console.error("Erro ao carregar padrões locais:", e);
    }
  }

  applySettingsToUI();
  loadActivePatterns();
}

// Configurar event listeners
function setupEventListeners() {
  // Formulários de configuração
  document
    .getElementById("appearanceForm")
    .addEventListener("submit", saveAppearanceSettings);
  document
    .getElementById("logoForm")
    .addEventListener("submit", saveLogoSettings);
  document
    .getElementById("cssForm")
    .addEventListener("submit", saveCSSSettings);
  document
    .getElementById("securityForm")
    .addEventListener("submit", saveSecuritySettings);
  document
    .getElementById("passwordPolicyForm")
    .addEventListener("submit", savePasswordPolicySettings);
  document
    .getElementById("notificationForm")
    .addEventListener("submit", saveNotificationSettings);
  document
    .getElementById("notificationTypesForm")
    .addEventListener("submit", saveNotificationTypesSettings);
  document.getElementById("userForm").addEventListener("submit", createUser);
  document
    .getElementById("newClientForm")
    .addEventListener("submit", createNewClient);
  document
    .getElementById("plansForm")
    .addEventListener("submit", savePlansSettings);

  // Formulário de padrões
  document
    .getElementById("patternForm")
    .addEventListener("submit", createPattern);

  // Mudança de cores em tempo real
  document
    .getElementById("primaryColor")
    .addEventListener("change", updateColors);
  document
    .getElementById("secondaryColor")
    .addEventListener("change", updateColors);
}

// Configurar upload de arquivos
function setupFileUploads() {
  // Logo
  const logoInput = document.getElementById("logoInput");
  const logoUpload = logoInput.parentElement;

  logoInput.addEventListener("change", handleLogoUpload);
  setupDragAndDrop(logoUpload, logoInput);

  // Favicon
  const faviconInput = document.getElementById("faviconInput");
  const faviconUpload = faviconInput.parentElement;

  faviconInput.addEventListener("change", handleFaviconUpload);
  setupDragAndDrop(faviconUpload, faviconInput);

  // Arquivo de padrões
  const patternFileInput = document.getElementById("patternFileInput");
  patternFileInput.addEventListener("change", handlePatternFileUpload);

  // Arquivo de backup
  const backupFileInput = document.getElementById("backupFileInput");
  backupFileInput.addEventListener("change", handleBackupFileUpload);
}

// Configurar zona de perigo
function setupDangerZone() {
  const confirmCheckbox = document.getElementById("confirmDanger");
  const resetButton = document.getElementById("resetButton");

  confirmCheckbox.addEventListener("change", function () {
    resetButton.disabled = !this.checked;
  });
}

// Configurar drag and drop
function setupDragAndDrop(uploadElement, inputElement) {
  uploadElement.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.classList.add("dragover");
  });

  uploadElement.addEventListener("dragleave", function (e) {
    e.preventDefault();
    this.classList.remove("dragover");
  });

  uploadElement.addEventListener("drop", function (e) {
    e.preventDefault();
    this.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      inputElement.files = files;
      inputElement.dispatchEvent(new Event("change"));
    }
  });
}

// Mostrar seção específica
function showSection(sectionName) {
  // Esconder todas as seções
  document.querySelectorAll(".admin-section").forEach((section) => {
    section.classList.remove("active");
  });

  // Mostrar seção selecionada
  document.getElementById(sectionName).classList.add("active");

  // Atualizar navegação
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Ativar item de navegação correspondente
  const activeNavItem = document.querySelector(
    `[onclick="showSection('${sectionName}')"]`
  );
  if (activeNavItem) {
    activeNavItem.classList.add("active");
  }
}

// Aplicar configurações na interface
function applySettingsToUI() {
  const settings = adminConfig.settings;

  // Aparência
  document.getElementById("siteTitle").value = settings.appearance.siteTitle;
  document.getElementById("siteDescription").value =
    settings.appearance.siteDescription;
  document.getElementById("primaryColor").value =
    settings.appearance.primaryColor;
  document.getElementById("secondaryColor").value =
    settings.appearance.secondaryColor;

  // Segurança
  document.getElementById("sessionTimeout").value =
    settings.security.sessionTimeout;
  document.getElementById("maxLoginAttempts").value =
    settings.security.maxLoginAttempts;
  document.getElementById("requireHttps").checked =
    settings.security.requireHttps;
  document.getElementById("enableAuditLog").checked =
    settings.security.enableAuditLog;

  // Notificações
  document.getElementById("emailNotifications").checked =
    settings.notifications.emailNotifications;
  document.getElementById("smtpHost").value = settings.notifications.smtpHost;
  document.getElementById("smtpPort").value = settings.notifications.smtpPort;
  document.getElementById("smtpUser").value = settings.notifications.smtpUser;
  document.getElementById("smtpPassword").value =
    settings.notifications.smtpPassword;

  // Aplicar cores
  updateColors();
}

// Atualizar cores em tempo real
function updateColors() {
  const primaryColor = document.getElementById("primaryColor").value;
  const secondaryColor = document.getElementById("secondaryColor").value;

  document.documentElement.style.setProperty("--primary-color", primaryColor);
  document.documentElement.style.setProperty(
    "--secondary-color",
    secondaryColor
  );

  // Atualizar gradiente do header
  const adminHeader = document.querySelector(".admin-header");
  if (adminHeader) {
    adminHeader.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
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
    await adminAPI.config.update("appearance", appearanceSettings);

    adminConfig.settings.appearance = appearanceSettings;
    saveAdminConfig();
    showNotification(
      "Configurações de aparência salvas com sucesso!",
      "success"
    );

    // Aplicar título na página
    document.title = adminConfig.settings.appearance.siteTitle;
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    showNotification("Erro ao salvar configurações no servidor", "error");
  }
}

// Salvar configurações de logo
async function saveLogoSettings(e) {
  e.preventDefault();

  const logoFile = document.getElementById("logoInput").files[0];
  const faviconFile = document.getElementById("faviconInput").files[0];

  try {
    if (logoFile) {
      await uploadFile(logoFile, "logo");
    }

    if (faviconFile) {
      await uploadFile(faviconFile, "favicon");
    }

    showNotification("Imagens salvas com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    showNotification("Erro ao fazer upload das imagens", "error");
  }
}

// Upload de arquivo
async function uploadFile(file, tipo) {
  try {
    const response = await adminAPI.files.upload(file, tipo);

    if (response.success) {
      // Aplicar logo/favicon na página
      if (tipo === "logo") {
        applyLogo(response.data.url);
      } else if (tipo === "favicon") {
        applyFavicon(response.data.url);
      }
    }

    return response;
  } catch (error) {
    console.error(`Erro ao fazer upload do ${tipo}:`, error);
    throw error;
  }
}

// Salvar configurações de segurança
function saveSecuritySettings(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  adminConfig.settings.security = {
    sessionTimeout: parseInt(formData.get("sessionTimeout")),
    maxLoginAttempts: parseInt(formData.get("maxLoginAttempts")),
    requireHttps: formData.has("requireHttps"),
    enableAuditLog: formData.has("enableAuditLog"),
  };

  saveAdminConfig();
  showNotification("Configurações de segurança salvas com sucesso!", "success");
}

// Salvar configurações de notificação
function saveNotificationSettings(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  adminConfig.settings.notifications = {
    emailNotifications: formData.has("emailNotifications"),
    smtpHost: formData.get("smtpHost"),
    smtpPort: parseInt(formData.get("smtpPort")),
    smtpUser: formData.get("smtpUser"),
    smtpPassword: formData.get("smtpPassword"),
  };

  saveAdminConfig();
  showNotification(
    "Configurações de notificação salvas com sucesso!",
    "success"
  );
}

// Salvar configuração administrativa
function saveAdminConfig() {
  localStorage.setItem(
    "oursales:admin-config",
    JSON.stringify(adminConfig.settings)
  );
}

// Lidar com upload de logo
function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    previewImage(file, "logoPreview", "logo");
  }
}

// Lidar com upload de favicon
function handleFaviconUpload(e) {
  const file = e.target.files[0];
  if (file) {
    previewImage(file, "faviconPreview", "favicon");
  }
}

// Preview de imagem
function previewImage(file, containerId, type) {
  const container = document.getElementById(containerId);
  const reader = new FileReader();

  reader.onload = function (e) {
    const img = document.createElement("img");
    img.src = e.target.result;
    img.className = "preview-image";
    img.alt = type;

    container.innerHTML = "";
    container.appendChild(img);
  };

  reader.readAsDataURL(file);
}

// Salvar imagem no storage
function saveImageToStorage(type, file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    localStorage.setItem(`oursales:${type}`, e.target.result);

    // Aplicar logo/favicon na página
    if (type === "logo") {
      applyLogo(e.target.result);
    } else if (type === "favicon") {
      applyFavicon(e.target.result);
    }
  };

  reader.readAsDataURL(file);
}

// Aplicar logo na página
function applyLogo(dataUrl) {
  // Atualizar logo no header principal
  const header = document.querySelector("header h1");
  if (header) {
    header.innerHTML = `<img src="${dataUrl}" alt="Logo" style="height: 40px; margin-right: 10px;">OurSales`;
  }
}

// Aplicar favicon na página
function applyFavicon(dataUrl) {
  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }
  favicon.href = dataUrl;
}

// Carregar padrões ativos
function loadActivePatterns() {
  const container = document.getElementById("activePatterns");

  if (adminConfig.patterns.length === 0) {
    container.innerHTML = "<p>Nenhum padrão cadastrado ainda.</p>";
    return;
  }

  container.innerHTML = adminConfig.patterns
    .map(
      (pattern) => `
        <div class="pattern-item">
            <div class="pattern-info">
                <h4>${pattern.nome}</h4>
                <p><strong>Tipo:</strong> ${
                  pattern.tipo
                } | <strong>Colunas:</strong> ${pattern.colunas.length}</p>
                <p>${pattern.descricao}</p>
            </div>
            <div class="pattern-actions">
                <span class="status-badge ${
                  pattern.ativo ? "status-active" : "status-inactive"
                }">
                    ${pattern.ativo ? "Ativo" : "Inativo"}
                </span>
                <button onclick="editPattern('${
                  pattern.id
                }')" class="btn btn-small btn-secondary">Editar</button>
                <button onclick="deletePattern('${
                  pattern.id
                }')" class="btn btn-small btn-danger">Excluir</button>
            </div>
        </div>
    `
    )
    .join("");
}

// Criar novo padrão
async function createPattern(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const colunas = formData
    .get("patternColumns")
    .split("\n")
    .map((col) => col.trim())
    .filter((col) => col);

  const patternData = {
    nome: formData.get("patternName"),
    tipo: formData.get("patternType"),
    colunas: colunas,
    descricao: formData.get("patternDescription"),
    ativo: true,
  };

  try {
    const response = await adminAPI.patterns.create(patternData);

    if (response.success) {
      adminConfig.patterns.push(response.data);
      savePatterns();
      loadActivePatterns();

      e.target.reset();
      showNotification("Padrão criado com sucesso!", "success");
    }
  } catch (error) {
    console.error("Erro ao criar padrão:", error);
    showNotification("Erro ao criar padrão no servidor", "error");
  }
}

// Salvar padrões
function savePatterns() {
  localStorage.setItem(
    "oursales:table-patterns",
    JSON.stringify(adminConfig.patterns)
  );
}

// Editar padrão
function editPattern(patternId) {
  const pattern = adminConfig.patterns.find((p) => p.id === patternId);
  if (!pattern) return;

  // Preencher formulário
  document.getElementById("patternName").value = pattern.nome;
  document.getElementById("patternType").value = pattern.tipo;
  document.getElementById("patternColumns").value = pattern.colunas.join("\n");
  document.getElementById("patternDescription").value = pattern.descricao;

  // Alterar botão para "Atualizar"
  const form = document.getElementById("patternForm");
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = "Atualizar Padrão";
  submitBtn.onclick = function (e) {
    e.preventDefault();
    updatePattern(patternId);
  };

  // Scroll para o formulário
  document.getElementById("patternForm").scrollIntoView({ behavior: "smooth" });
}

// Atualizar padrão
function updatePattern(patternId) {
  const form = document.getElementById("patternForm");
  const formData = new FormData(form);
  const colunas = formData
    .get("patternColumns")
    .split("\n")
    .map((col) => col.trim())
    .filter((col) => col);

  const patternIndex = adminConfig.patterns.findIndex(
    (p) => p.id === patternId
  );
  if (patternIndex === -1) return;

  adminConfig.patterns[patternIndex] = {
    ...adminConfig.patterns[patternIndex],
    nome: formData.get("patternName"),
    tipo: formData.get("patternType"),
    colunas: colunas,
    descricao: formData.get("patternDescription"),
    atualizadoEm: new Date().toISOString(),
  };

  savePatterns();
  loadActivePatterns();

  // Resetar formulário
  form.reset();
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = "Criar Padrão";
  submitBtn.onclick = null;

  showNotification("Padrão atualizado com sucesso!", "success");
}

// Excluir padrão
function deletePattern(patternId) {
  if (!confirm("Tem certeza que deseja excluir este padrão?")) return;

  adminConfig.patterns = adminConfig.patterns.filter((p) => p.id !== patternId);
  savePatterns();
  loadActivePatterns();

  showNotification("Padrão excluído com sucesso!", "success");
}

// Importar padrões
async function importPatterns() {
  const jsonInput = document.getElementById("patternJsonInput").value;

  if (!jsonInput.trim()) {
    showNotification(
      "Por favor, cole o JSON ou selecione um arquivo.",
      "error"
    );
    return;
  }

  try {
    const data = JSON.parse(jsonInput);
    const patterns = data.padroes || data;

    if (!Array.isArray(patterns)) {
      throw new Error("Formato inválido. Esperado array de padrões.");
    }

    // Validar padrões
    patterns.forEach((pattern, index) => {
      if (!pattern.nome || !pattern.tipo || !Array.isArray(pattern.colunas)) {
        throw new Error(
          `Padrão ${index + 1} inválido. Verifique nome, tipo e colunas.`
        );
      }
    });

    // Importar via API
    const response = await adminAPI.patterns.import(patterns);

    if (response.success) {
      // Recarregar padrões do servidor
      const patternsResponse = await adminAPI.patterns.list();
      if (patternsResponse.success) {
        adminConfig.patterns = patternsResponse.data;
        loadActivePatterns();
      }

      document.getElementById("patternJsonInput").value = "";
      showNotification(
        `${response.data.sucessos} padrões importados com sucesso!`,
        "success"
      );

      if (response.data.falhas > 0) {
        showNotification(
          `${response.data.falhas} padrões falharam na importação`,
          "warning"
        );
      }
    }
  } catch (error) {
    console.error("Erro ao importar padrões:", error);
    showNotification(`Erro ao importar padrões: ${error.message}`, "error");
  }
}

// Exportar padrões
async function exportPatterns() {
  try {
    const response = await adminAPI.patterns.export();

    if (response.success) {
      const data = response.data;

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `padroes-tabelas-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification("Padrões exportados com sucesso!", "success");
    }
  } catch (error) {
    console.error("Erro ao exportar padrões:", error);
    showNotification("Erro ao exportar padrões do servidor", "error");

    // Fallback para exportação local
    exportLocalPatterns();
  }
}

// Exportar padrões locais como fallback
function exportLocalPatterns() {
  const data = {
    padroes: adminConfig.patterns,
    exportadoEm: new Date().toISOString(),
    versao: "1.0",
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `padroes-tabelas-local-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification("Padrões exportados localmente!", "warning");
}

// Lidar com upload de arquivo de padrões
function handlePatternFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById("patternJsonInput").value = e.target.result;
  };
  reader.readAsText(file);
}

// Criar backup
async function createBackup() {
  try {
    const response = await adminAPI.backup.create();

    if (response.success) {
      const backup = response.data;

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `oursales-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification("Backup criado com sucesso!", "success");
    }
  } catch (error) {
    console.error("Erro ao criar backup:", error);
    showNotification("Erro ao criar backup no servidor", "error");

    // Fallback para backup local
    createLocalBackup();
  }
}

// Criar backup local como fallback
function createLocalBackup() {
  const backup = {
    timestamp: new Date().toISOString(),
    version: "1.0",
    data: {
      clientes: getData("clientes"),
      transportadoras: getData("transportadoras"),
      industrias: getData("industrias"),
      orcamentos: getData("orcamentos"),
      pedidos: getData("pedidos"),
      produtos: getData("produtos"),
      crm: getData("crm"),
    },
    admin: {
      settings: adminConfig.settings,
      patterns: adminConfig.patterns,
    },
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `oursales-backup-local-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification("Backup local criado com sucesso!", "warning");
}

// Restaurar backup
function restoreBackup() {
  const fileInput = document.getElementById("backupFileInput");
  const file = fileInput.files[0];

  if (!file) {
    showNotification("Por favor, selecione um arquivo de backup.", "error");
    return;
  }

  if (
    !confirm(
      "ATENÇÃO: Esta ação irá substituir todos os dados atuais. Continuar?"
    )
  ) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const backup = JSON.parse(e.target.result);

      // Restaurar dados
      if (backup.data) {
        Object.keys(backup.data).forEach((key) => {
          setData(key, backup.data[key]);
        });
      }

      // Restaurar configurações administrativas
      if (backup.admin) {
        if (backup.admin.settings) {
          adminConfig.settings = backup.admin.settings;
          saveAdminConfig();
          applySettingsToUI();
        }

        if (backup.admin.patterns) {
          adminConfig.patterns = backup.admin.patterns;
          savePatterns();
          loadActivePatterns();
        }
      }

      showNotification("Backup restaurado com sucesso!", "success");
    } catch (error) {
      showNotification(`Erro ao restaurar backup: ${error.message}`, "error");
    }
  };
  reader.readAsText(file);
}

// Lidar com upload de arquivo de backup
function handleBackupFileUpload(e) {
  // Arquivo já está disponível para restauração
}

// Carregar logs
async function loadLogs() {
  const level = document.getElementById("logLevel").value;
  const date = document.getElementById("logDate").value;

  const logContent = document.getElementById("logContent");
  logContent.innerHTML = `
        <div style="color: #6c757d; font-style: italic;">
            [${new Date().toLocaleString()}] Carregando logs...
        </div>
    `;

  try {
    const filters = {};
    if (level && level !== "all") filters.nivel = level;
    if (date) filters.data = date;

    const response = await adminAPI.logs.get(filters);

    if (response.success) {
      const logs = response.data;

      if (logs.length === 0) {
        logContent.innerHTML =
          '<div style="color: #6c757d; font-style: italic;">Nenhum log encontrado para os filtros selecionados.</div>';
        return;
      }

      logContent.innerHTML = logs
        .map(
          (log) =>
            `<div style="margin-bottom: 0.5rem; padding: 0.25rem; border-left: 3px solid ${
              log.nivel === "ERROR"
                ? "#dc3545"
                : log.nivel === "WARN"
                ? "#ffc107"
                : log.nivel === "INFO"
                ? "#17a2b8"
                : "#6c757d"
            };">
                    <strong>[${new Date(log.timestamp).toLocaleString()}] ${
              log.nivel
            }:</strong> ${log.mensagem}
                    ${
                      log.usuario
                        ? `<br><small>Usuário: ${log.usuario} | IP: ${
                            log.ip || "N/A"
                          }</small>`
                        : ""
                    }
                </div>`
        )
        .join("");
    }
  } catch (error) {
    console.error("Erro ao carregar logs:", error);
    logContent.innerHTML = `
            <div style="color: #dc3545;">
                Erro ao carregar logs: ${error.message}
            </div>
        `;
  }
}

// Resetar sistema
function resetSystem() {
  if (
    !confirm(
      "ATENÇÃO: Esta ação irá apagar TODOS os dados do sistema. Esta ação é IRREVERSÍVEL. Continuar?"
    )
  ) {
    return;
  }

  if (
    !confirm(
      "Última confirmação: Tem certeza absoluta que deseja resetar o sistema?"
    )
  ) {
    return;
  }

  // Limpar todos os dados
  localStorage.clear();

  // Recarregar página
  window.location.reload();
}

// Funções auxiliares
function getData(key) {
  const data = localStorage.getItem(`oursales:${key}`);
  return data ? JSON.parse(data) : [];
}

function setData(key, value) {
  localStorage.setItem(`oursales:${key}`, JSON.stringify(value));
}

function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function showNotification(message, type = "info") {
  // Criar notificação
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Estilos
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "1rem 1.5rem",
    borderRadius: "0.25rem",
    color: "white",
    fontWeight: "500",
    zIndex: "10000",
    maxWidth: "300px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  });

  // Cores por tipo
  const colors = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  };

  notification.style.backgroundColor = colors[type] || colors.info;

  // Adicionar ao DOM
  document.body.appendChild(notification);

  // Remover após 3 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Novas funções para formulários modernos

// Salvar configurações CSS
async function saveCSSSettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const cssSettings = {
    customCSS: formData.get("customCSS"),
    customJS: formData.get("customJS"),
  };

  try {
    await adminAPI.config.update("customization", cssSettings);
    showNotification(
      "Configurações de personalização salvas com sucesso!",
      "success"
    );
  } catch (error) {
    console.error("Erro ao salvar configurações CSS:", error);
    showNotification("Erro ao salvar configurações de personalização", "error");
  }
}

// Salvar políticas de senha
async function savePasswordPolicySettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const passwordPolicySettings = {
    minPasswordLength: parseInt(formData.get("minPasswordLength")),
    requireUppercase: formData.has("requireUppercase"),
    requireLowercase: formData.has("requireLowercase"),
    requireNumbers: formData.has("requireNumbers"),
    requireSpecialChars: formData.has("requireSpecialChars"),
  };

  try {
    await adminAPI.config.update("passwordPolicy", passwordPolicySettings);
    showNotification("Políticas de senha salvas com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao salvar políticas de senha:", error);
    showNotification("Erro ao salvar políticas de senha", "error");
  }
}

// Salvar tipos de notificação
async function saveNotificationTypesSettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const notificationTypesSettings = {
    newOrderNotification: formData.has("newOrderNotification"),
    paymentNotification: formData.has("paymentNotification"),
    lowStockNotification: formData.has("lowStockNotification"),
    systemAlertNotification: formData.has("systemAlertNotification"),
    backupNotification: formData.has("backupNotification"),
  };

  try {
    await adminAPI.config.update(
      "notificationTypes",
      notificationTypesSettings
    );
    showNotification("Tipos de notificação salvos com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao salvar tipos de notificação:", error);
    showNotification("Erro ao salvar tipos de notificação", "error");
  }
}

// Criar novo usuário
async function createUser(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const userData = {
    name: formData.get("userName"),
    email: formData.get("userEmail"),
    password: formData.get("userPassword"),
    profile: formData.get("userProfile"),
    phone: formData.get("userPhone"),
  };

  try {
    // Aqui você faria a chamada para a API de usuários
    showNotification("Usuário criado com sucesso!", "success");
    e.target.reset();
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    showNotification("Erro ao criar usuário", "error");
  }
}

// Exportar todos os dados
async function exportAllData() {
  try {
    const allData = {
      clientes: getData("clientes"),
      transportadoras: getData("transportadoras"),
      industrias: getData("industrias"),
      orcamentos: getData("orcamentos"),
      pedidos: getData("pedidos"),
      produtos: getData("produtos"),
      crm: getData("crm"),
      admin: {
        settings: adminConfig.settings,
        patterns: adminConfig.patterns,
      },
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `oursales-dados-completos-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification("Dados completos exportados com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao exportar dados completos:", error);
    showNotification("Erro ao exportar dados completos", "error");
  }
}

// Funções para controle global (Master Admin)

// Buscar clientes
function searchClients() {
  const searchTerm = document.getElementById("searchClient").value;
  if (!searchTerm.trim()) {
    showNotification("Digite um termo para buscar", "warning");
    return;
  }

  // Simular busca (em produção, chamar API)
  showNotification(`Buscando clientes com termo: ${searchTerm}`, "info");
}

// Criar novo cliente
async function createNewClient(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const clientData = {
    name: formData.get("clientName"),
    email: formData.get("clientEmail"),
    plan: formData.get("clientPlan"),
    status: formData.get("clientStatus"),
  };

  try {
    // Aqui você faria a chamada para a API de clientes
    showNotification("Cliente criado com sucesso!", "success");
    e.target.reset();
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    showNotification("Erro ao criar cliente", "error");
  }
}

// Editar cliente

// Suspender cliente
function suspendClient(clientId) {
  if (confirm("Tem certeza que deseja suspender este cliente?")) {
    showNotification(`Cliente ${clientId} suspenso`, "warning");
  }
}

// Executar ação em massa
function executeBulkAction() {
  const action = document.getElementById("bulkAction").value;
  if (!action) {
    showNotification("Selecione uma ação", "warning");
    return;
  }

  if (
    confirm(`Executar ação "${action}" em todas as instâncias selecionadas?`)
  ) {
    showNotification(`Executando ação: ${action}`, "info");
  }
}

// Reiniciar instância
function restartInstance(instanceId) {
  if (confirm("Reiniciar esta instância?")) {
    showNotification(`Instância ${instanceId} reiniciada`, "success");
  }
}

// Acessar instância
function accessInstance(instanceId) {
  showNotification(`Acessando instância ${instanceId}`, "info");
  // Abrir nova aba com a instância
}

// Colocar instância em manutenção
function maintenanceInstance(instanceId) {
  if (confirm("Colocar esta instância em modo manutenção?")) {
    showNotification(`Instância ${instanceId} em manutenção`, "warning");
  }
}

// Marcar fatura como paga
function markPaid(invoiceId) {
  if (confirm("Marcar esta fatura como paga?")) {
    showNotification(`Fatura ${invoiceId} marcada como paga`, "success");
  }
}

// Enviar lembrete de pagamento
function sendReminder(invoiceId) {
  showNotification(`Lembrete enviado para fatura ${invoiceId}`, "info");
}

// Salvar configurações de planos
async function savePlansSettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const plansSettings = {
    basicPlanPrice: parseFloat(formData.get("basicPlanPrice")),
    professionalPlanPrice: parseFloat(formData.get("professionalPlanPrice")),
    businessPlanPrice: parseFloat(formData.get("businessPlanPrice")),
    enterprisePlanPrice: parseFloat(formData.get("enterprisePlanPrice")),
  };

  try {
    await adminAPI.config.update("plans", plansSettings);
    showNotification("Preços dos planos atualizados com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao salvar preços dos planos:", error);
    showNotification("Erro ao salvar preços dos planos", "error");
  }
}

// Expor funções globais
window.showSection = showSection;
window.importPatterns = importPatterns;
window.exportPatterns = exportPatterns;
window.exportAllData = exportAllData;
window.createBackup = createBackup;
window.restoreBackup = restoreBackup;
window.loadLogs = loadLogs;
window.resetSystem = resetSystem;
window.editPattern = editPattern;
window.deletePattern = deletePattern;

// Funções de controle global
window.searchClients = searchClients;
window.createNewClient = createNewClient;
window.editClient = editClient;
window.accessClient = accessClient;
window.suspendClient = suspendClient;
window.executeBulkAction = executeBulkAction;
window.restartInstance = restartInstance;
window.accessInstance = accessInstance;
window.maintenanceInstance = maintenanceInstance;
window.markPaid = markPaid;
window.sendReminder = sendReminder;
window.savePlansSettings = savePlansSettings;

// Funções de autenticação
window.logout = logout;

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

// Carregar informações do usuário na inicialização
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
    const response = await adminAPI.config.update("clients", clientData);
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
    const clients = await adminAPI.config.get("clients");
    const tbody = document.getElementById("clientsTableBody");

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
  const searchTerm = document
    .getElementById("searchClients")
    .value.toLowerCase();
  const filterPlan = document.getElementById("filterPlan").value;
  const rows = document.querySelectorAll("#clientsTableBody tr");

  rows.forEach((row) => {
    const nome = row.cells[0]?.textContent.toLowerCase() || "";
    const email = row.cells[1]?.textContent.toLowerCase() || "";
    const plano = row.cells[2]?.textContent.toLowerCase() || "";

    const matchesSearch =
      nome.includes(searchTerm) || email.includes(searchTerm);
    const matchesPlan = !filterPlan || plano.includes(filterPlan);

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
      await adminAPI.config.update("suspend-client", { clientId });
      showNotification("Cliente suspenso com sucesso!", "success");
      loadClientsList();
    } catch (error) {
      console.error("Erro ao suspender cliente:", error);
      showNotification("Erro ao suspender cliente", "error");
    }
  }
}

// Executar ação em lote
function executeBulkAction(action) {
  const selectedClients = document.querySelectorAll(
    'input[name="selectedClients"]:checked'
  );

  if (selectedClients.length === 0) {
    showNotification("Selecione pelo menos um cliente", "warning");
    return;
  }

  if (
    confirm(
      `Executar ação "${action}" em ${selectedClients.length} cliente(s)?`
    )
  ) {
    showNotification(`Ação "${action}" executada com sucesso!`, "success");
  }
}

// Reiniciar instância
async function restartInstance(instanceId) {
  if (confirm("Tem certeza que deseja reiniciar esta instância?")) {
    try {
      await adminAPI.config.update("restart-instance", { instanceId });
      showNotification("Instância reiniciada com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao reiniciar instância:", error);
      showNotification("Erro ao reiniciar instância", "error");
    }
  }
}

// Acessar instância
function accessInstance(instanceId) {
  showNotification("Redirecionando para a instância...", "info");
  // Implementar redirecionamento
}

// Manutenção da instância
async function maintenanceInstance(instanceId) {
  if (confirm("Colocar instância em modo de manutenção?")) {
    try {
      await adminAPI.config.update("maintenance-instance", { instanceId });
      showNotification("Instância em manutenção!", "success");
    } catch (error) {
      console.error("Erro ao colocar em manutenção:", error);
      showNotification("Erro ao colocar em manutenção", "error");
    }
  }
}

// Marcar como pago
async function markPaid(invoiceId) {
  if (confirm("Marcar fatura como paga?")) {
    try {
      await adminAPI.config.update("mark-paid", { invoiceId });
      showNotification("Fatura marcada como paga!", "success");
    } catch (error) {
      console.error("Erro ao marcar como pago:", error);
      showNotification("Erro ao marcar como pago", "error");
    }
  }
}

// Enviar lembrete
async function sendReminder(invoiceId) {
  if (confirm("Enviar lembrete de pagamento?")) {
    try {
      await adminAPI.config.update("send-reminder", { invoiceId });
      showNotification("Lembrete enviado com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao enviar lembrete:", error);
      showNotification("Erro ao enviar lembrete", "error");
    }
  }
}

// Salvar configurações de planos
async function savePlansSettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  const plansSettings = {
    basico: {
      preco: parseFloat(formData.get("basicoPreco")),
      recursos: formData
        .get("basicoRecursos")
        .split("\n")
        .filter((r) => r.trim()),
    },
    profissional: {
      preco: parseFloat(formData.get("profissionalPreco")),
      recursos: formData
        .get("profissionalRecursos")
        .split("\n")
        .filter((r) => r.trim()),
    },
    empresarial: {
      preco: parseFloat(formData.get("empresarialPreco")),
      recursos: formData
        .get("empresarialRecursos")
        .split("\n")
        .filter((r) => r.trim()),
    },
    enterprise: {
      preco: parseFloat(formData.get("enterprisePreco")),
      recursos: formData
        .get("enterpriseRecursos")
        .split("\n")
        .filter((r) => r.trim()),
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

// Expor funções globalmente
window.createNewClient = createNewClient;
window.loadClientsList = loadClientsList;
window.searchClients = searchClients;
window.accessClient = accessClient;
window.editClient = editClient;
window.suspendClient = suspendClient;
window.executeBulkAction = executeBulkAction;
window.restartInstance = restartInstance;
window.accessInstance = accessInstance;
window.maintenanceInstance = maintenanceInstance;
window.markPaid = markPaid;
window.sendReminder = sendReminder;
window.savePlansSettings = savePlansSettings;

document.addEventListener("DOMContentLoaded", function () {
  loadUserInfo();

  // Verificar se a função logout está disponível
  console.log("Função logout disponível:", typeof window.logout);

  // Carregar lista de clientes se estiver na seção correta
  if (document.getElementById("clientsTableBody")) {
    loadClientsList();
  }
});
