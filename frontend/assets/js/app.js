// === VALIDAÇÃO DE FORMULÁRIOS - ADICIONAR CLASSE SUBMITTED ===
// Adiciona classe 'submitted' aos formulários após tentativa de submit
// Isso permite que campos obrigatórios só fiquem vermelhos após tentativa de salvar
(function () {
  // Interceptar todos os submits de formulários na fase de captura
  document.addEventListener(
    "submit",
    function (e) {
      const form = e.target;
      if (form && form.tagName === "FORM") {
        // Adicionar classe 'submitted' ao formulário ANTES de qualquer preventDefault
        form.classList.add("submitted");

        // Se o formulário for válido, remover a classe após um tempo
        if (form.checkValidity()) {
          setTimeout(() => {
            form.classList.remove("submitted");
          }, 100);
        }
      }
    },
    true
  ); // Usar capture phase para pegar antes de qualquer preventDefault

  // Remover classe 'submitted' quando o usuário começar a digitar em campos inválidos
  document.addEventListener("input", function (e) {
    const input = e.target;
    if (
      input &&
      (input.tagName === "INPUT" ||
        input.tagName === "SELECT" ||
        input.tagName === "TEXTAREA")
    ) {
      const form = input.closest("form");
      if (form && form.classList.contains("submitted")) {
        // Verificar se o campo agora é válido
        if (input.validity.valid) {
          // Se todos os campos do formulário são válidos, remover a classe
          setTimeout(() => {
            if (form.checkValidity()) {
              form.classList.remove("submitted");
            }
          }, 100);
        }
      }
    }
  });

  // Também remover ao mudar selects
  document.addEventListener("change", function (e) {
    const input = e.target;
    if (input && input.tagName === "SELECT") {
      const form = input.closest("form");
      if (form && form.classList.contains("submitted")) {
        if (input.validity.valid) {
          setTimeout(() => {
            if (form.checkValidity()) {
              form.classList.remove("submitted");
            }
          }, 100);
        }
      }
    }
  });
})();

// === FUNÇÕES AUXILIARES PARA PERSONALIZAÇÃO DE COLUNAS ===

function getCustomColumns(page) {
  try {
    const saved = localStorage.getItem("oursales-custom-columns");
    const customColumns = saved ? JSON.parse(saved) : {};
    return customColumns[page] || [];
  } catch (e) {
    return [];
  }
}

// === UTILITÁRIOS OTIMIZADOS (inline para performance) ===
// Tornar debounce global para uso em outros scripts
window.debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
const debounce = window.debounce; // Alias local

// Cache de seletores DOM para evitar re-query
const domCache = new Map();
const $ = (selector, useCache = true) => {
  if (useCache && domCache.has(selector)) {
    const cached = domCache.get(selector);
    if (cached && document.contains(cached)) return cached;
  }
  const el = document.querySelector(selector);
  if (useCache && el) domCache.set(selector, el);
  return el;
};

const $$ = (selector, useCache = false) => {
  return Array.from(document.querySelectorAll(selector));
};

// Limpar cache quando necessário
const clearDomCache = () => domCache.clear();

function toggleSelectAll(checkbox) {
  const table = checkbox.closest("table");
  const rowCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]');

  rowCheckboxes.forEach((cb) => {
    cb.checked = checkbox.checked;
    // Disparar evento de change para cada checkbox
    cb.dispatchEvent(new Event("change", { bubbles: true }));
  });

  // Atualizar estado dos botões de ação
  updateActionsState();
}

// Função para validar seleção única para edição/CRM
function validateSingleSelection(actionType) {
  const checkedBoxes = document.querySelectorAll(
    'tbody input[type="checkbox"]:checked'
  );

  if (checkedBoxes.length === 0) {
    alert("Selecione pelo menos um item.");
    return false;
  }

  if (
    (actionType === "edit" || actionType === "crm") &&
    checkedBoxes.length > 1
  ) {
    alert("Para editar ou abrir CRM, selecione apenas um item.");
    return false;
  }

  return true;
}

// === INICIALIZAÇÃO DO SISTEMA ===

const storageKey = "oursales:data";
const defaultState = {
  clientes: [],
  transportadoras: [],
  industrias: [],
  orcamentos: [],
  pedidos: [],
  produtos: [],
  crm: [],
};

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char] || char;
  });

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);

const formatDate = (value) => {
  if (!value) return "-";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const toInputDateTimeValue = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const fromInputDateTimeValue = (value) => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
};

const generateId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const drawerAnimationDelay = 200;

function showDrawer(drawer, overlay) {
  if (!drawer) {
    return;
  }
  drawer.hidden = false;
  requestAnimationFrame(() => {
    drawer.classList.add("is-open");
  });
  if (overlay) {
    overlay.hidden = false;
    requestAnimationFrame(() => {
      overlay.classList.add("is-visible");
    });
  }
}

function hideDrawer(drawer, overlay) {
  if (!drawer) {
    return;
  }
  drawer.classList.remove("is-open");
  if (overlay) {
    overlay.classList.remove("is-visible");
  }
  window.setTimeout(() => {
    drawer.hidden = true;
    if (overlay) {
      overlay.hidden = true;
    }
  }, drawerAnimationDelay);
}

function syncSelection(container, radioName, selectedId) {
  if (!container) {
    return;
  }
  container
    .querySelectorAll(`input[type="radio"][name="${radioName}"]`)
    .forEach((input) => {
      const isSelected = input.value === selectedId;
      input.checked = isSelected;
      const row = input.closest("tr") || input.closest(".list-item");
      if (row) {
        row.classList.toggle("is-selected", isSelected);
      }
    });
}

function focusFirstInput(element) {
  if (!element) return;
  requestAnimationFrame(() => {
    if (typeof element.focus === "function") {
      element.focus();
    }
  });
}

const storage = {
  cache: null,
  load() {
    if (this.cache) {
      return this.cache;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        this.cache = JSON.parse(raw);
        Object.keys(defaultState).forEach((key) => {
          if (!Array.isArray(this.cache[key])) {
            this.cache[key] = Array.isArray(defaultState[key])
              ? []
              : deepClone(defaultState[key]);
          }
        });
        this.persist();
        return this.cache;
      }
    } catch (error) {
      console.warn("Falha ao carregar dados salvos:", error);
    }
    this.cache = deepClone(defaultState);
    this.persist();
    return this.cache;
  },
  persist() {
    try {
      if (!this.cache) {
        console.error("❌ ERRO: Tentando persistir cache vazio!");
        return;
      }

      const jsonString = JSON.stringify(this.cache);
      window.localStorage.setItem(storageKey, jsonString);
      console.log(
        "💾 localStorage atualizado com sucesso. Tamanho:",
        jsonString.length,
        "bytes"
      );

      // Verificar se realmente foi salvo
      const verification = window.localStorage.getItem(storageKey);
      if (!verification) {
        console.error("❌ ERRO: localStorage não contém dados após setItem!");
      } else {
        const parsed = JSON.parse(verification);
        console.log(
          "✅ Verificação: localStorage contém",
          Object.keys(parsed).length,
          "coleções"
        );
        console.log(
          "✅ Verificação: industrias tem",
          parsed.industrias?.length || 0,
          "itens"
        );
      }
    } catch (error) {
      console.error("❌ ERRO ao salvar dados no localStorage:", error);
      console.error("Detalhes do erro:", error.message);
      if (error.name === "QuotaExceededError") {
        console.error("💾 ERRO: Espaço insuficiente no localStorage!");
      }
    }
  },
  set(nextState) {
    this.cache = nextState;
    this.persist();
    return this.cache;
  },
  update(mutate) {
    const draft = deepClone(this.load());
    mutate(draft);
    return this.set(draft);
  },
};

// Funções auxiliares para industrias
function getIndustrias() {
  // Sempre recarregar do localStorage para garantir dados atualizados
  storage.cache = null;
  const state = storage.load();
  const industrias = state.industrias || [];
  console.log(
    "🔍 getIndustrias chamado - encontradas",
    industrias.length,
    "indústrias"
  );
  return industrias;
}

function seedDataIfEmpty() {
  const state = storage.load();
  const hasData = Object.values(state).some((collection) => collection.length);
  if (hasData) {
    return;
  }
  storage.set({
    clientes: [
      {
        id: "cli-horizonte",
        tipo: "PJ",
        nome: "Distribuidora Horizonte LTDA",
        documento: "12.345.678/0001-09",
        email: "compras@horizonte.com.br",
        telefone: "(11) 4000-1234",
        observacoes: "Pagamento 28 dias, preferência por boleto.",
      },
      {
        id: "cli-mercadao",
        tipo: "PF",
        nome: "Mercadão do Centro",
        documento: "987.654.321-00",
        email: "marcia@mercadaocentro.com",
        telefone: "(31) 98888-2211",
        observacoes: "Entrega somente pela manhã.",
      },
    ],
    transportadoras: [
      {
        id: "tra-rapido-sul",
        nome: "Rápido Sul",
        prazo: 3,
        custo: 180,
        cobertura: "Sul e Sudeste",
      },
      {
        id: "tra-flashlog",
        nome: "FlashLog",
        prazo: 5,
        custo: 240,
        cobertura: "Brasil inteiro",
      },
    ],
    industrias: [],
    orcamentos: [
      {
        id: "orc-evolution",
        clienteId: "cli-horizonte",
        clienteNome: "Distribuidora Horizonte LTDA",
        descricao: "Linha Evolution • 120 unidades",
        valor: 18450,
        validade: new Date().toISOString().slice(0, 10),
        observacoes: "Desconto 5% à vista.",
      },
    ],
    pedidos: [
      {
        id: "ped-0007",
        codigo: "PED-2024-0007",
        clienteId: "cli-mercadao",
        clienteNome: "Mercadão do Centro",
        transportadoraId: "tra-rapido-sul",
        transportadoraNome: "Rápido Sul",
        valor: 9350,
        entrega: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        observacoes: "Entrega fracionada em duas remessas.",
      },
    ],
    produtos: [
      {
        id: "pro-evolution",
        nome: "Linha Evolution 500ml",
        sku: "EV-500-01",
        categoria: "Bebidas",
        preco: 154.9,
        estoque: 120,
        descricao: "Caixa com 12 unidades da linha premium Evolution.",
      },
      {
        id: "pro-starter",
        nome: "Kit Starter Gourmet",
        sku: "KIT-GM-10",
        categoria: "Kits",
        preco: 299.0,
        estoque: 45,
        descricao: "Combo de apresentação com mix dos produtos mais vendidos.",
      },
    ],
    crm: [
      {
        id: "crm-001",
        clienteId: "cli-horizonte",
        clienteNome: "Distribuidora Horizonte LTDA",
        canal: "E-mail",
        resumo: "Apresentação de proposta atualizada",
        detalhes:
          "Enviei nova tabela de preços com desconto progressivo conforme pedido. Aguardando retorno até sexta.",
        data: new Date().toISOString(),
      },
      {
        id: "crm-002",
        clienteId: "cli-mercadao",
        clienteNome: "Mercadão do Centro",
        canal: "WhatsApp",
        resumo: "Alinhamento de entrega",
        detalhes:
          "Cliente pediu reajuste na janela de entrega para período da tarde e confirmou interesse em kit Starter.",
        data: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
  });
}

function highlightActiveNav() {
  const currentPage = document.body.dataset.page;
  document.querySelectorAll("nav a").forEach((link) => {
    const page = link.dataset.page;
    if (page === currentPage) {
      link.classList.add("is-active");
    } else {
      link.classList.remove("is-active");
    }
  });
}

function fillClientesSelect(select, selectedId = "") {
  if (!select) return;
  const clientes = storage.load().clientes;
  if (!clientes.length) {
    select.innerHTML =
      '<option value="" disabled selected>Cadastre um cliente primeiro</option>';
    select.disabled = true;
    return;
  }
  select.disabled = false;
  const placeholderSelected = selectedId ? "" : " selected";
  select.innerHTML =
    `<option value="" disabled${placeholderSelected}>Selecione</option>` +
    clientes
      .map(
        (cliente) => `<option value="${cliente.id}">${cliente.nome}</option>`
      )
      .join("");
  if (selectedId) {
    select.value = selectedId;
  }
}

function fillTransportadorasSelect(select, selectedId = "") {
  if (!select) return;
  const transportadoras = storage.load().transportadoras;
  if (!transportadoras.length) {
    select.innerHTML =
      '<option value="" disabled selected>Cadastre uma transportadora</option>';
    select.disabled = true;
    return;
  }
  select.disabled = false;
  const placeholderSelected = selectedId ? "" : " selected";
  select.innerHTML =
    `<option value="" disabled${placeholderSelected}>Selecione</option>` +
    transportadoras
      .map(
        (transportadora) =>
          `<option value="${transportadora.id}">${transportadora.nome}</option>`
      )
      .join("");
  if (selectedId) {
    select.value = selectedId;
  }
}

function initClientesPage() {
  const form = document.querySelector("#clienteForm");
  if (!form) return;

  const overlay = document.querySelector("#clienteOverlay");
  const drawer = document.querySelector("#clienteDrawer");
  const titleEl = document.querySelector("#clienteDrawerTitulo");
  const descEl = document.querySelector("#clienteDrawerDescricao");
  const pjBtn = document.querySelector("#clienteCriarPJ");
  const pfBtn = document.querySelector("#clienteCriarPF");
  const editBtn = document.querySelector("#clienteEditar");
  const crmBtn = document.querySelector("#clienteCRM");
  const removeBtn = document.querySelector("#clienteRemover");
  const closeBtn = document.querySelector("#clienteDrawerFechar");
  const cancelBtn = document.querySelector("#clienteCancelar");
  const submitBtn = form.querySelector('button[type="submit"]');
  const listContainer = document.querySelector("#clientesLista");

  const fields = {
    id: document.querySelector("#clienteId"),
    nome: document.querySelector("#clienteNome"),
    documento: document.querySelector("#clienteDocumento"),
    email: document.querySelector("#clienteEmail"),
    telefone: document.querySelector("#clienteTelefone"),
    observacoes: document.querySelector("#clienteObservacoes"),
  };

  let selectedId = "";

  const updateActionsState = () => {
    const hasSelection = Boolean(selectedId);
    if (editBtn) editBtn.disabled = !hasSelection;
    if (crmBtn) crmBtn.disabled = !hasSelection;
    if (removeBtn) removeBtn.disabled = !hasSelection;
    if (crmBtn) {
      crmBtn.title = hasSelection
        ? "Abrir o CRM do cliente selecionado"
        : "Selecione um cliente para abrir o CRM";
    }
  };

  const clearForm = () => {
    form.reset();
    fields.id.value = "";
  };

  const closeForm = () => {
    clearForm();
    hideDrawer(drawer, overlay);
  };

  overlay?.addEventListener("click", closeForm);
  closeBtn?.addEventListener("click", closeForm);
  cancelBtn?.addEventListener("click", closeForm);

  pjBtn?.addEventListener("click", () => {
    window.location.href = "cliente-pj.html";
  });

  pfBtn?.addEventListener("click", () => {
    window.location.href = "cliente-pf.html";
  });

  crmBtn?.addEventListener("click", () => {
    if (!selectedId) {
      window.alert("Selecione um cliente para abrir o CRM.");
      return;
    }
    window.sessionStorage.setItem("oursales:crmTarget", selectedId);
    window.location.href = "crm.html";
  });

  editBtn?.addEventListener("click", async () => {
    if (!selectedId) {
      window.alert("Selecione um cliente para editar.");
      return;
    }

    let cliente;
    try {
      const API = window.oursalesAPI;
      if (API) {
        cliente = await API.getCliente(selectedId);
      } else {
        cliente = storage
          .load()
          .clientes.find((item) => item.id === selectedId);
      }
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
      cliente = storage.load().clientes.find((item) => item.id === selectedId);
    }

    if (!cliente) {
      window.alert("O cliente selecionado não está mais disponível.");
      selectedId = "";
      updateActionsState();
      render();
      return;
    }

    // Se o cliente não tem tipo definido, detectar pelo documento
    let tipoCliente = cliente.tipo;
    if (!tipoCliente) {
      // Inferir tipo pelo tamanho do documento (CPF tem 11 dígitos, CNPJ tem 14)
      const docNumeros = (
        cliente.cnpj ||
        cliente.cpf ||
        cliente.documento ||
        ""
      ).replace(/\D/g, "");
      tipoCliente = docNumeros.length === 14 ? "PJ" : "PF";
    }

    // Redirecionar para a página correta baseado no tipo
    const pagina = tipoCliente === "PJ" ? "cliente-pj.html" : "cliente-pf.html";
    window.location.href = `${pagina}?id=${selectedId}`;
  });

  removeBtn?.addEventListener("click", async () => {
    if (!selectedId) {
      window.alert("Selecione um cliente para remover.");
      return;
    }

    // Verificar relacionamentos (tentar API primeiro, depois localStorage)
    let relatedOrcamentos = 0;
    let relatedPedidos = 0;
    let relatedCrm = 0;

    try {
      const API = window.oursalesAPI;
      if (API && API.shouldUseAPI()) {
        // Na API, a exclusão em cascata é tratada pelo backend
        // Apenas mostrar aviso genérico
        relatedOrcamentos = 1; // Assumir que pode ter relacionamentos
      } else {
        const state = storage.load();
        relatedOrcamentos = state.orcamentos.filter(
          (orcamento) => orcamento.clienteId === selectedId
        ).length;
        relatedPedidos = state.pedidos.filter(
          (pedido) => pedido.clienteId === selectedId
        ).length;
        relatedCrm = state.crm.filter(
          (registro) => registro.clienteId === selectedId
        ).length;
      }
    } catch (error) {
      console.error("Erro ao verificar relacionamentos:", error);
    }

    let mensagem = "Confirma remover este cliente?";
    if (relatedOrcamentos || relatedPedidos || relatedCrm) {
      mensagem = `Este cliente possui ${relatedOrcamentos} orçamento(s), ${relatedPedidos} pedido(s) e ${relatedCrm} interação(ões) no CRM.\nAo remover, esses registros também serão excluídos. Deseja continuar?`;
    }

    if (!window.confirm(mensagem)) {
      return;
    }

    try {
      const API = window.oursalesAPI;
      if (API) {
        await API.deleteCliente(selectedId);
      } else {
        storage.update((draft) => {
          draft.clientes = draft.clientes.filter(
            (cliente) => cliente.id !== selectedId
          );
          draft.orcamentos = draft.orcamentos.filter(
            (orcamento) => orcamento.clienteId !== selectedId
          );
          draft.pedidos = draft.pedidos.filter(
            (pedido) => pedido.clienteId !== selectedId
          );
          draft.crm = draft.crm.filter(
            (registro) => registro.clienteId !== selectedId
          );
        });
      }
      selectedId = "";
      await render();
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
      window.alert(
        "Erro ao remover cliente: " + (error.message || "Erro desconhecido")
      );
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = fields.id.value;
    const data = {
      nome: fields.nome.value.trim(),
      documento: fields.documento.value.trim(),
      email: fields.email.value.trim(),
      telefone: fields.telefone.value.trim(),
      observacoes: fields.observacoes.value.trim(),
    };

    if (!data.nome || !data.documento || !data.email || !data.telefone) {
      window.alert("Preencha os campos obrigatórios.");
      return;
    }

    if (id) {
      storage.update((draft) => {
        const cliente = draft.clientes.find((item) => item.id === id);
        if (!cliente) return;
        Object.assign(cliente, data);
        draft.orcamentos.forEach((orcamento) => {
          if (orcamento.clienteId === id) {
            orcamento.clienteNome = data.nome;
          }
        });
        draft.pedidos.forEach((pedido) => {
          if (pedido.clienteId === id) {
            pedido.clienteNome = data.nome;
          }
        });
        draft.crm.forEach((registro) => {
          if (registro.clienteId === id) {
            registro.clienteNome = data.nome;
          }
        });
        draft.clientes.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
        );
      });
      selectedId = id;
    } else {
      let createdId = "";
      storage.update((draft) => {
        const novo = { id: generateId("cli"), ...data };
        draft.clientes.push(novo);
        draft.clientes.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
        );
        createdId = novo.id;
      });
      selectedId = createdId;
    }

    closeForm();
    render();
  });

  listContainer?.addEventListener("change", (event) => {
    const input = event.target.closest(
      'input[type="radio"][name="clienteSelecionado"]'
    );
    if (!input) return;
    selectedId = input.value;
    syncSelection(listContainer, "clienteSelecionado", selectedId);
    updateActionsState();
  });

  listContainer?.addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-id]");
    if (!row) return;
    const input = row.querySelector(
      'input[type="radio"][name="clienteSelecionado"]'
    );
    if (input) {
      // Toggle: se já está selecionado, desmarcar
      if (selectedId === input.value) {
        input.checked = false;
        selectedId = "";
      } else {
        input.checked = true;
        selectedId = input.value;
      }
      syncSelection(listContainer, "clienteSelecionado", selectedId);
      updateActionsState();
    }
  });

  async function render() {
    // Carregar clientes da API ou localStorage
    let clientes = [];
    try {
      const API = window.oursalesAPI;
      if (API) {
        const response = await API.getClientes();
        clientes = Array.isArray(response) ? response : response.data || [];
      } else {
        clientes = storage.load().clientes;
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      // Fallback para localStorage
      clientes = storage.load().clientes;
    }

    if (selectedId && !clientes.some((cliente) => cliente.id === selectedId)) {
      selectedId = "";
    }

    if (!clientes.length) {
      listContainer.innerHTML =
        '<div class="empty-state">Nenhum cliente cadastrado.</div>';
      updateActionsState();
      return;
    }

    // Obter colunas personalizadas
    const customColumns = getCustomColumns("clientes");
    const allColumns = [
      "nome",
      "documento",
      "email",
      "telefone",
      "observacoes",
    ];
    const visibleColumns =
      customColumns.length > 0 ? customColumns : allColumns;

    const linhas = clientes
      .map((cliente) => {
        // Normalizar dados do cliente (API vs localStorage)
        const nome =
          cliente.nomeCompleto ||
          cliente.razaoSocial ||
          cliente.nomeFantasia ||
          cliente.nome ||
          "-";
        const documento =
          cliente.cnpj || cliente.cpf || cliente.documento || "-";
        const email = cliente.email || "-";
        const telefone = cliente.telefone || cliente.celular || "-";
        const observacoes = cliente.observacoes || "-";
        const cidade = cliente.cidade || "-";
        const estado = cliente.estado || "-";
        const cep = cliente.cep || "-";
        const logradouro = cliente.logradouro || cliente.endereco || "-";
        const criadoEm = cliente.criadoEm || cliente.dataCadastro;

        let rowContent = `
            <tr class="table-row${
              cliente.id === selectedId ? " is-selected" : ""
            }" data-id="${cliente.id}">
              <td class="select-cell">
                <label class="select-radio">
                  <input type="checkbox" name="clienteSelecionado" value="${
                    cliente.id
                  }" />
                </label>
              </td>`;

        // Renderizar colunas dinamicamente
        visibleColumns.forEach((column) => {
          let cellContent = "";
          switch (column) {
            case "nome":
              cellContent = `<strong>${nome}</strong>`;
              break;
            case "documento":
              cellContent = documento;
              break;
            case "email":
              cellContent = email;
              break;
            case "telefone":
              cellContent = telefone;
              break;
            case "observacoes":
              cellContent = observacoes;
              break;
            case "endereco":
              cellContent = logradouro;
              break;
            case "cidade":
              cellContent = cidade;
              break;
            case "estado":
              cellContent = estado;
              break;
            case "cep":
              cellContent = cep;
              break;
            case "dataCadastro":
              cellContent = criadoEm
                ? new Date(criadoEm).toLocaleDateString("pt-BR")
                : "-";
              break;
            case "ultimaCompra":
              cellContent = cliente.ultimaCompra
                ? new Date(cliente.ultimaCompra).toLocaleDateString("pt-BR")
                : "-";
              break;
            case "totalCompras":
              cellContent = cliente.totalCompras
                ? `R$ ${cliente.totalCompras.toFixed(2).replace(".", ",")}`
                : "R$ 0,00";
              break;
            default:
              cellContent = "-";
          }

          const className = column === "nome" ? "" : "dynamic-column";
          rowContent += `<td class="${className}">${cellContent}</td>`;
        });

        rowContent += "</tr>";
        return rowContent;
      })
      .join("");

    // Construir cabeçalho dinamicamente
    const headerCells = visibleColumns
      .map((column) => {
        const labels = {
          nome: "Cliente",
          documento: "CNPJ/CPF",
          email: "E-mail",
          telefone: "Telefone",
          observacoes: "Observações",
          endereco: "Endereço",
          cidade: "Cidade",
          estado: "Estado",
          cep: "CEP",
          dataCadastro: "Data Cadastro",
          ultimaCompra: "Última Compra",
          totalCompras: "Total Compras",
        };
        return `<th>${labels[column] || column}</th>`;
      })
      .join("");

    listContainer.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="select-cell">
                <input type="checkbox" class="select-all-checkbox" title="Selecionar todos">
              </th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;

    syncSelection(listContainer, "clienteSelecionado", selectedId);
    updateActionsState();

    // Adicionar click nas linhas para seleção
    listContainer.querySelectorAll("tbody tr").forEach((row) => {
      row.style.cursor = "pointer";
      row.addEventListener("click", (e) => {
        // Não selecionar se clicou no checkbox ou botão
        if (
          e.target.closest('input[type="checkbox"]') ||
          e.target.closest("button")
        ) {
          return;
        }

        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });

      // Double click para editar
      row.addEventListener("dblclick", (e) => {
        // Não editar se clicou no checkbox ou botão
        if (
          e.target.closest('input[type="checkbox"]') ||
          e.target.closest("button")
        ) {
          return;
        }

        const clienteId = row.getAttribute("data-id");
        if (clienteId) {
          // Selecionar o cliente
          const checkbox = row.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event("change", { bubbles: true }));
          }
          // Aguardar um pouco para garantir que a seleção foi processada
          setTimeout(async () => {
            selectedId = clienteId;
            let cliente;
            try {
              const API = window.oursalesAPI;
              if (API) {
                cliente = await API.getCliente(clienteId);
              } else {
                cliente = storage
                  .load()
                  .clientes.find((item) => item.id === clienteId);
              }
            } catch (error) {
              console.error("Erro ao carregar cliente:", error);
              cliente = storage
                .load()
                .clientes.find((item) => item.id === clienteId);
            }

            if (cliente) {
              // Se o cliente não tem tipo definido, detectar pelo documento
              let tipoCliente = cliente.tipo;
              if (!tipoCliente) {
                // Inferir tipo pelo tamanho do documento (CPF tem 11 dígitos, CNPJ tem 14)
                const docNumeros = (
                  cliente.cnpj ||
                  cliente.cpf ||
                  cliente.documento ||
                  ""
                ).replace(/\D/g, "");
                tipoCliente = docNumeros.length === 14 ? "PJ" : "PF";
              }
              // Redirecionar para a página correta baseado no tipo
              const pagina =
                tipoCliente === "PJ" ? "cliente-pj.html" : "cliente-pf.html";
              window.location.href = `${pagina}?id=${clienteId}`;
            }
          }, 100);
        }
      });
    });
  }

  render();
}

function initClientePJPage() {
  const form = document.querySelector("#clientePJForm");
  if (!form) return;

  const fields = {
    id: document.querySelector("#pjClienteId"),
    razaoSocial: document.querySelector("#pjRazaoSocial"),
    nomeFantasia: document.querySelector("#pjNomeFantasia"),
    rede: document.querySelector("#pjRede"),
    cnpj: document.querySelector("#pjCnpj"),
    inscricaoEstadual: document.querySelector("#pjInscricaoEstadual"),
    codigo: document.querySelector("#pjCodigo"),
    matriz: document.querySelector("#pjMatriz"),
    segmento: document.querySelector("#pjSegmento"),
    endereco: document.querySelector("#pjEndereco"),
    bairro: document.querySelector("#pjBairro"),
    numero: document.querySelector("#pjNumero"),
    cep: document.querySelector("#pjCep"),
    cidade: document.querySelector("#pjCidade"),
    estado: document.querySelector("#pjEstado"),
    telefone: document.querySelector("#pjTelefone"),
    fax: document.querySelector("#pjFax"),
    telefoneAdicional: document.querySelector("#pjTelefoneAdicional"),
    website: document.querySelector("#pjWebsite"),
    email: document.querySelector("#pjEmail"),
    observacoes: document.querySelector("#pjObservacoes"),
    status: document.querySelector("#pjStatus"),
    emailNfe: document.querySelector("#pjEmailNfe"),
    dataAbertura: document.querySelector("#pjDataAbertura"),
    regiao: document.querySelector("#pjRegiao"),
  };

  const contatosBody = document.querySelector("#pjContatosTbody");
  const pagamentosBody = document.querySelector("#pjPagamentosTbody");
  const vendedoresBody = document.querySelector("#pjVendedoresTbody");
  const industriasBody = document.querySelector("#pjIndustriasTbody");
  const transportadorasBody = document.querySelector("#pjTransportadorasTbody");

  const addContatoBtn = document.querySelector("#pjContatoAdicionar");
  const addPagamentoBtn = document.querySelector("#pjPagamentoAdicionar");
  const addVendedorBtn = document.querySelector("#pjVendedorAdicionar");
  const addIndustriaBtn = document.querySelector("#pjIndustriaAdicionar");
  const addTransportadoraBtn = document.querySelector(
    "#pjTransportadoraAdicionar"
  );

  const gerarCodigoBtn = document.querySelector("#pjGerarCodigo");
  const cancelarBtn = document.querySelector("#clientePJCancelar");
  // Aplicar máscara no CNPJ explicitamente
  if (fields.cnpj && typeof window.maskCNPJ === "function") {
    fields.cnpj.addEventListener("input", () => window.maskCNPJ(fields.cnpj));
    if (fields.cnpj.value) window.maskCNPJ(fields.cnpj);
  }
  // Gerar código
  gerarCodigoBtn?.addEventListener("click", () => {
    fields.codigo.value = `CLI-PJ-${Date.now().toString().slice(-6)}`;
  });

  // Submit (criar/editar)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const cnpjNum = (fields.cnpj.value || "").replace(/\D/g, "");
    if (!fields.razaoSocial.value.trim() || cnpjNum.length !== 14) {
      window.alert("Preencha Razão Social e CNPJ válido (14 dígitos).");
      return;
    }

    const data = {
      tipo: "PJ",
      nome: fields.nomeFantasia.value.trim() || fields.razaoSocial.value.trim(),
      razaoSocial: fields.razaoSocial.value.trim(),
      nomeFantasia: fields.nomeFantasia.value.trim(),
      documento: fields.cnpj.value.trim(),
      cnpj: fields.cnpj.value.trim(),
      inscricaoEstadual: fields.inscricaoEstadual.value.trim(),
      codigo: fields.codigo.value.trim(),
      rede: fields.rede.value.trim(),
      matriz: fields.matriz.value.trim(),
      segmento: fields.segmento.value.trim(),
      endereco: fields.endereco.value.trim(),
      bairro: fields.bairro.value.trim(),
      numero: fields.numero.value.trim(),
      cep: fields.cep.value.trim(),
      cidade: fields.cidade.value.trim(),
      estado: fields.estado.value,
      telefone: fields.telefone.value.trim(),
      fax: fields.fax.value.trim(),
      telefoneAdicional: fields.telefoneAdicional.value.trim(),
      website: fields.website.value.trim(),
      email: fields.email.value.trim(),
      observacoes: fields.observacoes.value.trim(),
      status: fields.status.value || "Ativo",
      emailNfe: fields.emailNfe.value.trim(),
      dataAbertura: fields.dataAbertura.value,
      regiao: fields.regiao.value.trim(),
      atualizadoEm: new Date().toISOString(),
    };

    const urlParams = new URLSearchParams(window.location.search);
    const editingId = urlParams.get("id");

    if (editingId) {
      storage.update((draft) => {
        const cliente = draft.clientes.find((c) => c.id === editingId);
        if (!cliente) return;
        Object.assign(cliente, data);
      });
      window.alert("Cliente atualizado com sucesso!");
    } else {
      storage.update((draft) => {
        draft.clientes.push({
          id: generateId("cli"),
          ...data,
          criadoEm: new Date().toISOString(),
        });
        // Ordenar por nome
        draft.clientes.sort((a, b) =>
          (a.nome || "").localeCompare(b.nome || "", "pt-BR", {
            sensitivity: "base",
          })
        );
      });
      window.alert("Cliente criado com sucesso!");
    }

    window.location.href = "clientes.html";
  });

  // Carregar vendedores e indústrias dinamicamente (mesma lógica do PJ)
  let vendedoresLista = [];
  let industriasLista = ["Todas as Indústrias"];

  // Carregar indústrias da API/localStorage
  async function carregarIndustrias() {
    try {
      const API = window.oursalesAPI;
      if (API) {
        const response = await API.getIndustrias();
        const industrias = Array.isArray(response)
          ? response
          : response.data || [];
        industriasLista = [
          "Todas as Indústrias",
          ...industrias.map(
            (ind) => ind.nomeFantasia || ind.razaoSocial || ind.nome || ""
          ),
        ];
      } else {
        const data = storage.load();
        const industrias = data.industrias || [];
        industriasLista = [
          "Todas as Indústrias",
          ...industrias.map(
            (ind) => ind.nomeFantasia || ind.razaoSocial || ind.nome || ""
          ),
        ];
      }
    } catch (error) {
      console.error("Erro ao carregar indústrias:", error);
    }
  }

  // Carregar vendedores (usuários do sistema)
  async function carregarVendedores() {
    try {
      vendedoresLista = [
        "Ana Souza",
        "Bruno Oliveira",
        "Carla Ribeiro",
        "Diego Martins",
        "Fernanda Costa",
      ];
    } catch (error) {
      console.error("Erro ao carregar vendedores:", error);
    }
  }

  // Carregar dados ao inicializar
  carregarIndustrias();
  carregarVendedores();

  const buildStaticOptions = (
    values,
    selected = "",
    placeholder = "Selecione"
  ) => {
    const options = [`<option value="">${placeholder}</option>`];
    values.forEach((value) => {
      const isSelected = value === selected ? " selected" : "";
      options.push(
        `<option value="${escapeHtml(value)}"${isSelected}>${escapeHtml(
          value
        )}</option>`
      );
    });
    return options.join("");
  };

  const getTransportadoraOptions = (selectedId = "") => {
    const transportadoras = storage.load().transportadoras;
    if (!transportadoras.length) {
      return '<option value="">Cadastre transportadoras na aba Transportadoras</option>';
    }
    const options = ['<option value="">Selecione</option>'];
    transportadoras.forEach((item) => {
      const isSelected = item.id === selectedId ? " selected" : "";
      options.push(
        `<option value="${escapeHtml(item.id)}"${isSelected}>${escapeHtml(
          item.nome
        )}</option>`
      );
    });
    return options.join("");
  };

  function addContatoRow(data = {}) {
    const tr = document.createElement("tr");
    const compradorChecked = data.comprador ? "checked" : "";
    tr.innerHTML = `
      <td>
        <input
          type="text"
          name="contatoNome"
          value="${escapeHtml(data.nome || "")}"
          placeholder="Nome completo"
        />
      </td>
      <td>
        <input
          type="email"
          name="contatoEmail"
          value="${escapeHtml(data.email || "")}"
          placeholder="email@empresa.com"
        />
      </td>
      <td>
        <input
          type="tel"
          name="contatoTelefone"
          value="${escapeHtml(data.telefone || "")}"
          placeholder="(00) 00000-0000"
        />
      </td>
      <td>
        <input
          type="date"
          name="contatoAniversario"
          value="${escapeHtml(data.aniversario || "")}"
        />
      </td>
      <td>
        <input
          type="text"
          name="contatoCargo"
          value="${escapeHtml(data.cargo || "")}"
          placeholder="Cargo"
        />
      </td>
      <td class="checkbox-cell">
        <input type="checkbox" name="contatoComprador" ${compradorChecked} />
      </td>
      <td class="actions">
        <button type="button" class="button-add-inline" title="Adicionar nova linha" style="background-color: #007bff !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-plus"></i></button>
        <button type="button" class="button-remove-inline" title="Remover linha" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
      </td>
    `;

    // Event listener para botão adicionar
    tr.querySelector(".button-add-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Coletar dados da linha atual
      const inputs = tr.querySelectorAll("input");
      const dados = {};

      inputs.forEach((input) => {
        if (input.type === "checkbox") {
          dados[input.name] = input.checked;
        } else {
          dados[input.name] = input.value.trim();
        }
      });

      // Verificar se há dados preenchidos
      const temDados = Object.values(dados).some((valor) =>
        typeof valor === "string" ? valor.length > 0 : valor === true
      );

      if (temDados) {
        console.log("✅ CONTATO ADICIONADO À LISTA:", dados);

        // Remover mensagem "Nenhum contato adicionado!"
        const emptyRows = contatosBody.querySelectorAll("tr");
        emptyRows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (
            cells.length === 1 &&
            cells[0].textContent.includes("Nenhum contato adicionado!")
          ) {
            row.remove();
          }
        });

        // Criar nova linha na lista com os dados
        const newListRow = document.createElement("tr");
        newListRow.innerHTML = `
          <td>${dados.contatoNome || ""}</td>
          <td>${dados.contatoEmail || ""}</td>
          <td>${dados.contatoTelefone || ""}</td>
          <td>${dados.contatoAniversario || ""}</td>
          <td>${dados.contatoCargo || ""}</td>
          <td>${dados.contatoComprador ? "Sim" : "Não"}</td>
          <td>
            <button type="button" class="button-remove-inline" title="Remover contato" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
          </td>
        `;

        // Adicionar event listener para remover da lista
        newListRow
          .querySelector(".button-remove-inline")
          .addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            newListRow.remove();

            // Se não há mais contatos, mostrar mensagem vazia
            if (contatosBody.querySelectorAll("tr").length === 0) {
              const emptyRow = document.createElement("tr");
              emptyRow.innerHTML =
                '<td colspan="7"><i class="ti ti-info-circle"></i> Nenhum contato adicionado!</td>';
              contatosBody.appendChild(emptyRow);
            }
          });

        // Inserir antes da linha de input
        contatosBody.insertBefore(newListRow, tr);

        // Limpar campos da linha de input
        inputs.forEach((input) => {
          if (input.type === "checkbox") {
            input.checked = false;
          } else {
            input.value = "";
          }
        });
      } else {
        console.log("⚠️ Nenhum dado preenchido para adicionar");
      }
    });

    // Event listener para botão remover
    tr.querySelector(".button-remove-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.closest("tr").remove();
    });
    contatosBody.appendChild(tr);
  }

  function addPagamentoRow(data = {}) {
    const tr = document.createElement("tr");
    const descricao = data.descricao === undefined ? "À vista" : data.descricao;
    const parcelasValue =
      data.parcelas === undefined
        ? 1
        : data.parcelas === ""
        ? ""
        : Number.isFinite(Number(data.parcelas))
        ? Number(data.parcelas)
        : 1;
    const intervaloDiasValue =
      data.intervaloDias === undefined
        ? 0
        : data.intervaloDias === ""
        ? ""
        : Number.isFinite(Number(data.intervaloDias))
        ? Number(data.intervaloDias)
        : 0;
    const descontoValue =
      data.descontoOuAcrescimo === undefined
        ? 0
        : data.descontoOuAcrescimo === ""
        ? ""
        : Number.isFinite(Number(data.descontoOuAcrescimo))
        ? Number(data.descontoOuAcrescimo)
        : 0;
    const pedidoMinimoValue =
      data.pedidoMinimo === undefined
        ? 0
        : data.pedidoMinimo === ""
        ? ""
        : Number.isFinite(Number(data.pedidoMinimo))
        ? Number(data.pedidoMinimo)
        : 0;
    const industria =
      data.industria === undefined ? "Todas as Indústrias" : data.industria;
    tr.innerHTML = `
      <td>
        <input
          type="text"
          name="pagamentoDescricao"
          value="${escapeHtml(descricao)}"
          placeholder="Descrição da condição"
        />
      </td>
      <td>
        <input
          type="number"
          name="pagamentoParcelas"
          min="1"
          value="${parcelasValue}"
        />
      </td>
      <td>
        <input
          type="number"
          name="pagamentoIntervalo"
          min="0"
          value="${intervaloDiasValue}"
        />
      </td>
      <td>
        <input
          type="number"
          step="0.01"
          name="pagamentoDesconto"
          value="${descontoValue}"
        />
      </td>
      <td>
        <input
          type="number"
          step="0.01"
          name="pagamentoMinimo"
          value="${pedidoMinimoValue}"
        />
      </td>
      <td>
        <select name="pagamentoIndustria">
          ${buildStaticOptions(
            industriasLista,
            industria,
            "Todas as Indústrias"
          )}
        </select>
      </td>
      <td class="actions">
        <button type="button" class="button-add-inline" title="Adicionar nova linha" style="background-color: #007bff !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-plus"></i></button>
        <button type="button" class="button-remove-inline" title="Remover linha" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
      </td>
    `;

    // Event listener para botão adicionar
    tr.querySelector(".button-add-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Coletar dados da linha atual
      const inputs = tr.querySelectorAll("input, select");
      const dados = {};

      inputs.forEach((input) => {
        if (input.type === "checkbox") {
          dados[input.name] = input.checked;
        } else {
          dados[input.name] = input.value.trim();
        }
      });

      // Verificar se há dados preenchidos
      const temDados = Object.values(dados).some((valor) =>
        typeof valor === "string" ? valor.length > 0 : valor === true
      );

      if (temDados) {
        console.log("✅ PAGAMENTO ADICIONADO À LISTA:", dados);

        // Remover mensagem "Nenhuma condição de pagamento adicionada!"
        const emptyRows = pagamentosBody.querySelectorAll("tr");
        emptyRows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (
            cells.length === 1 &&
            cells[0].textContent.includes(
              "Nenhuma condição de pagamento adicionada!"
            )
          ) {
            row.remove();
          }
        });

        // Criar nova linha na lista com os dados
        const newListRow = document.createElement("tr");
        newListRow.innerHTML = `
          <td>${dados.pagamentoDescricao || ""}</td>
          <td>${dados.pagamentoParcelas || ""}</td>
          <td>${dados.pagamentoIntervalo || ""}</td>
          <td>${dados.pagamentoDesconto || ""}</td>
          <td>${dados.pagamentoMinimo || ""}</td>
          <td>${dados.pagamentoIndustria || ""}</td>
          <td>
            <button type="button" class="button-remove-inline" title="Remover pagamento" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
          </td>
        `;

        // Adicionar event listener para remover da lista
        newListRow
          .querySelector(".button-remove-inline")
          .addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            newListRow.remove();

            // Se não há mais pagamentos, mostrar mensagem vazia
            if (pagamentosBody.querySelectorAll("tr").length === 0) {
              const emptyRow = document.createElement("tr");
              emptyRow.innerHTML =
                '<td colspan="7"><i class="ti ti-info-circle"></i> Nenhuma condição de pagamento adicionada!</td>';
              pagamentosBody.appendChild(emptyRow);
            }
          });

        // Inserir antes da linha de input
        pagamentosBody.insertBefore(newListRow, tr);

        // Limpar campos da linha de input
        inputs.forEach((input) => {
          if (input.type === "checkbox") {
            input.checked = false;
          } else {
            input.value = "";
          }
        });
      } else {
        console.log("⚠️ Nenhum dado preenchido para adicionar");
      }
    });

    // Event listener para botão remover
    tr.querySelector(".button-remove-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.closest("tr").remove();
    });
    pagamentosBody.appendChild(tr);
  }

  function addVendedorRow(data = {}) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <select name="pjVendedor">
          ${buildStaticOptions(
            vendedoresLista,
            data.vendedor || "",
            "Selecione"
          )}
        </select>
      </td>
      <td class="actions">
        <button type="button" class="button-add-inline" title="Adicionar nova linha" style="background-color: #007bff !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-plus"></i></button>
        <button type="button" class="button-remove-inline" title="Remover linha" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
      </td>
    `;

    // Event listener para botão adicionar
    tr.querySelector(".button-add-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Coletar dados da linha atual
      const inputs = tr.querySelectorAll("input, select");
      const dados = {};

      inputs.forEach((input) => {
        if (input.type === "checkbox") {
          dados[input.name] = input.checked;
        } else {
          dados[input.name] = input.value.trim();
        }
      });

      // Verificar se há dados preenchidos
      const temDados = Object.values(dados).some((valor) =>
        typeof valor === "string" ? valor.length > 0 : valor === true
      );

      if (temDados) {
        console.log("✅ VENDEDOR ADICIONADO À LISTA:", dados);

        // Remover mensagem "Nenhum vendedor adicionado!"
        const emptyRows = vendedoresBody.querySelectorAll("tr");
        emptyRows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (
            cells.length === 1 &&
            cells[0].textContent.includes("Nenhum vendedor adicionado!")
          ) {
            row.remove();
          }
        });

        // Criar nova linha na lista com os dados
        const newListRow = document.createElement("tr");
        newListRow.innerHTML = `
          <td>${dados.pjVendedor || ""}</td>
          <td>
            <button type="button" class="button-remove-inline" title="Remover vendedor" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
          </td>
        `;

        // Adicionar event listener para remover da lista
        newListRow
          .querySelector(".button-remove-inline")
          .addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            newListRow.remove();

            // Se não há mais vendedores, mostrar mensagem vazia
            if (vendedoresBody.querySelectorAll("tr").length === 0) {
              const emptyRow = document.createElement("tr");
              emptyRow.innerHTML =
                '<td colspan="2"><i class="ti ti-info-circle"></i> Nenhum vendedor adicionado!</td>';
              vendedoresBody.appendChild(emptyRow);
            }
          });

        // Inserir antes da linha de input
        vendedoresBody.insertBefore(newListRow, tr);

        // Limpar campos da linha de input
        inputs.forEach((input) => {
          if (input.type === "checkbox") {
            input.checked = false;
          } else {
            input.value = "";
          }
        });
      } else {
        console.log("⚠️ Nenhum dado preenchido para adicionar");
      }
    });

    // Event listener para botão remover
    tr.querySelector(".button-remove-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.closest("tr").remove();
    });
    vendedoresBody.appendChild(tr);
  }

  function addIndustriaRow(data = {}) {
    const tr = document.createElement("tr");
    const descontoPercent =
      data.descontoPercentual === undefined
        ? 0
        : data.descontoPercentual === ""
        ? ""
        : Number.isFinite(Number(data.descontoPercentual))
        ? Number(data.descontoPercentual)
        : 0;
    tr.innerHTML = `
      <td>
        <select name="pjIndustria">
          ${buildStaticOptions(
            industriasLista,
            data.industria || "",
            "Selecione"
          )}
        </select>
      </td>
      <td>
        <input
          type="text"
          name="pjTabelaPreco"
          value="${escapeHtml(data.tabelaPreco || "")}"
          placeholder="Tabela de preço"
        />
      </td>
      <td>
        <input
          type="number"
          step="0.01"
          name="pjIndustriaDesconto"
          value="${descontoPercent}"
        />
      </td>
      <td class="actions">
        <button type="button" class="button-add-inline" title="Adicionar nova linha" style="background-color: #007bff !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-plus"></i></button>
        <button type="button" class="button-remove-inline" title="Remover linha" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
      </td>
    `;

    // Event listener para botão adicionar
    tr.querySelector(".button-add-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Coletar dados da linha atual
      const inputs = tr.querySelectorAll("input, select");
      const dados = {};

      inputs.forEach((input) => {
        if (input.type === "checkbox") {
          dados[input.name] = input.checked;
        } else {
          dados[input.name] = input.value.trim();
        }
      });

      // Verificar se há dados preenchidos
      const temDados = Object.values(dados).some((valor) =>
        typeof valor === "string" ? valor.length > 0 : valor === true
      );

      if (temDados) {
        console.log("✅ INDÚSTRIA ADICIONADA À LISTA:", dados);

        // Remover mensagem "Nenhuma indústria adicionada!"
        const emptyRows = industriasBody.querySelectorAll("tr");
        emptyRows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (
            cells.length === 1 &&
            cells[0].textContent.includes("Nenhuma indústria adicionada!")
          ) {
            row.remove();
          }
        });

        // Criar nova linha na lista com os dados
        const newListRow = document.createElement("tr");
        newListRow.innerHTML = `
          <td>${dados.pjIndustria || ""}</td>
          <td>${dados.pjTabelaPreco || ""}</td>
          <td>${dados.pjIndustriaDesconto || ""}</td>
          <td>
            <button type="button" class="button-remove-inline" title="Remover indústria" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
          </td>
        `;

        // Adicionar event listener para remover da lista
        newListRow
          .querySelector(".button-remove-inline")
          .addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            newListRow.remove();

            // Se não há mais indústrias, mostrar mensagem vazia
            if (industriasBody.querySelectorAll("tr").length === 0) {
              const emptyRow = document.createElement("tr");
              emptyRow.innerHTML =
                '<td colspan="4"><i class="ti ti-info-circle"></i> Nenhuma indústria adicionada!</td>';
              industriasBody.appendChild(emptyRow);
            }
          });

        // Inserir antes da linha de input
        industriasBody.insertBefore(newListRow, tr);

        // Limpar campos da linha de input
        inputs.forEach((input) => {
          if (input.type === "checkbox") {
            input.checked = false;
          } else {
            input.value = "";
          }
        });
      } else {
        console.log("⚠️ Nenhum dado preenchido para adicionar");
      }
    });

    // Event listener para botão remover
    tr.querySelector(".button-remove-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.closest("tr").remove();
    });
    industriasBody.appendChild(tr);
  }

  function addTransportadoraRow(data = {}) {
    const transportadoras = storage.load().transportadoras;
    let selectedId = data.transportadoraId || "";
    if (!selectedId && transportadoras.length === 1) {
      selectedId = transportadoras[0].id;
    }
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <select name="pjTransportadora">
          ${getTransportadoraOptions(selectedId)}
        </select>
      </td>
      <td class="actions">
        <button type="button" class="button-add-inline" title="Adicionar nova linha" style="background-color: #007bff !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-plus"></i></button>
        <button type="button" class="button-remove-inline" title="Remover linha" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
      </td>
    `;

    // Event listener para botão adicionar
    tr.querySelector(".button-add-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Coletar dados da linha atual
      const inputs = tr.querySelectorAll("input, select");
      const dados = {};

      inputs.forEach((input) => {
        if (input.type === "checkbox") {
          dados[input.name] = input.checked;
        } else {
          dados[input.name] = input.value.trim();
        }
      });

      // Verificar se há dados preenchidos
      const temDados = Object.values(dados).some((valor) =>
        typeof valor === "string" ? valor.length > 0 : valor === true
      );

      if (temDados) {
        console.log("✅ TRANSPORTADORA ADICIONADA À LISTA:", dados);

        // Remover mensagem "Nenhuma transportadora adicionada!"
        const emptyRows = transportadorasBody.querySelectorAll("tr");
        emptyRows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (
            cells.length === 1 &&
            cells[0].textContent.includes("Nenhuma transportadora adicionada!")
          ) {
            row.remove();
          }
        });

        // Criar nova linha na lista com os dados
        const newListRow = document.createElement("tr");
        newListRow.innerHTML = `
          <td>${dados.pjTransportadora || ""}</td>
          <td>
            <button type="button" class="button-remove-inline" title="Remover transportadora" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
          </td>
        `;

        // Adicionar event listener para remover da lista
        newListRow
          .querySelector(".button-remove-inline")
          .addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            newListRow.remove();

            // Se não há mais transportadoras, mostrar mensagem vazia
            if (transportadorasBody.querySelectorAll("tr").length === 0) {
              const emptyRow = document.createElement("tr");
              emptyRow.innerHTML =
                '<td colspan="2"><i class="ti ti-info-circle"></i> Nenhuma transportadora adicionada!</td>';
              transportadorasBody.appendChild(emptyRow);
            }
          });

        // Inserir antes da linha de input
        transportadorasBody.insertBefore(newListRow, tr);

        // Limpar campos da linha de input
        inputs.forEach((input) => {
          if (input.type === "checkbox") {
            input.checked = false;
          } else {
            input.value = "";
          }
        });
      } else {
        console.log("⚠️ Nenhum dado preenchido para adicionar");
      }
    });

    // Event listener para botão remover
    tr.querySelector(".button-remove-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.closest("tr").remove();
    });
    transportadorasBody.appendChild(tr);
  }

  addContatoBtn?.addEventListener("click", () => addContatoRow());
  addPagamentoBtn?.addEventListener("click", () => addPagamentoRow());
  addVendedorBtn?.addEventListener("click", () => addVendedorRow());
  addIndustriaBtn?.addEventListener("click", () => addIndustriaRow());
  addTransportadoraBtn?.addEventListener("click", () => addTransportadoraRow());

  addContatoRow();
  addPagamentoRow();
  addVendedorRow();
  addIndustriaRow();
  addTransportadoraRow();

  // Verificar se está editando um cliente existente
  const urlParams = new URLSearchParams(window.location.search);
  const clienteId = urlParams.get("id");

  if (clienteId) {
    const cliente = storage.load().clientes.find((c) => c.id === clienteId);
    if (cliente) {
      // Atualizar título e botão
      document.querySelector("#pjFormTitle").textContent =
        "Editar Cliente (Pessoa Jurídica)";
      document.querySelector("header h1").textContent =
        "Editar Cliente • Pessoa Jurídica";
      document.querySelector("#pjSalvar").textContent = "Atualizar";

      // Carregar ID
      fields.id.value = cliente.id;

      // Se o cliente tem dadosPJ, carregar estrutura completa
      if (cliente.dadosPJ) {
        // Carregar informações básicas
        const info = cliente.dadosPJ.informacoes || {};
        fields.razaoSocial.value = info.razaoSocial || "";
        fields.nomeFantasia.value = info.nomeFantasia || "";
        fields.rede.value = info.rede || "";
        fields.cnpj.value = info.cnpj || "";
        fields.inscricaoEstadual.value = info.inscricaoEstadual || "";
        fields.codigo.value = info.codigo || "";
        fields.matriz.value = info.matriz || "";
        fields.segmento.value = info.segmento || "";

        // Carregar endereço
        const end = cliente.dadosPJ.endereco || {};
        fields.endereco.value = end.endereco || "";
        fields.bairro.value = end.bairro || "";
        fields.numero.value = end.numero || "";
        fields.cep.value = end.cep || "";
        fields.cidade.value = end.cidade || "";
        fields.estado.value = end.estado || "";

        // Carregar comunicação
        const com = cliente.dadosPJ.comunicacao || {};
        fields.telefone.value = com.telefone || "";
        fields.fax.value = com.fax || "";
        fields.telefoneAdicional.value = com.telefoneAdicional || "";
        fields.website.value = com.website || "";
        fields.email.value = com.email || "";
        fields.emailNfe.value = com.emailNfe || "";

        // Carregar status
        const st = cliente.dadosPJ.status || {};
        fields.status.value = st.status || "Ativo";
        fields.observacoes.value = st.observacoes || "";
        fields.dataAbertura.value = st.dataAbertura || "";
        fields.regiao.value = st.regiao || "";

        // Limpar tabelas antes de carregar
        contatosBody.innerHTML = "";
        pagamentosBody.innerHTML = "";
        vendedoresBody.innerHTML = "";
        industriasBody.innerHTML = "";
        transportadorasBody.innerHTML = "";

        // Carregar contatos
        const contatos = cliente.dadosPJ.contatos || [];
        if (contatos.length > 0) {
          contatos.forEach((contato) => addContatoRow(contato));
        } else {
          addContatoRow();
        }

        // Carregar pagamentos
        const pagamentos = cliente.dadosPJ.pagamentos || [];
        if (pagamentos.length > 0) {
          pagamentos.forEach((pag) => addPagamentoRow(pag));
        } else {
          addPagamentoRow();
        }

        // Carregar vendedores
        const vendedores = cliente.dadosPJ.vendedores || [];
        if (vendedores.length > 0) {
          vendedores.forEach((vend) => addVendedorRow(vend));
        } else {
          addVendedorRow();
        }

        // Carregar indústrias
        const industrias = cliente.dadosPJ.industrias || [];
        if (industrias.length > 0) {
          industrias.forEach((ind) => addIndustriaRow(ind));
        } else {
          addIndustriaRow();
        }

        // Carregar transportadoras
        const transportadoras = cliente.dadosPJ.transportadoras || [];
        if (transportadoras.length > 0) {
          transportadoras.forEach((transp) => addTransportadoraRow(transp));
        } else {
          addTransportadoraRow();
        }
      } else {
        // Cliente antigo sem dadosPJ - carregar dados básicos disponíveis
        fields.razaoSocial.value = cliente.nome || "";
        fields.nomeFantasia.value = cliente.fantasia || cliente.nome || "";
        fields.cnpj.value = cliente.documento || "";
        fields.email.value = cliente.email || "";
        fields.telefone.value = cliente.telefone || "";
        fields.observacoes.value = cliente.observacoes || "";

        // Limpar tabelas e adicionar linhas vazias
        contatosBody.innerHTML = "";
        pagamentosBody.innerHTML = "";
        vendedoresBody.innerHTML = "";
        industriasBody.innerHTML = "";
        transportadorasBody.innerHTML = "";

        addContatoRow();
        addPagamentoRow();
        addVendedorRow();
        addIndustriaRow();
        addTransportadoraRow();
      }
    }
  }

  gerarCodigoBtn?.addEventListener("click", () => {
    fields.codigo.value = `CLI-PJ-${Date.now().toString(36).toUpperCase()}`;
  });

  cancelarBtn?.addEventListener("click", () => {
    window.location.href = "clientes.html";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const razaoSocial = fields.razaoSocial.value.trim();
    const cnpjDigits = (fields.cnpj.value || "").replace(/\D/g, "");
    if (!razaoSocial || cnpjDigits.length !== 14) {
      window.alert("Informe Razão Social e CNPJ válido (14 dígitos).");

      return;
    }

    const contatos = Array.from(contatosBody.querySelectorAll("tr"))
      .map((tr) => {
        const nome = tr.querySelector('[name="contatoNome"]').value.trim();

        const email = tr.querySelector('[name="contatoEmail"]').value.trim();
        const telefone = tr
          .querySelector('[name="contatoTelefone"]')
          .value.trim();
        const aniversario = tr.querySelector(
          '[name="contatoAniversario"]'
        ).value;
        const cargo = tr.querySelector('[name="contatoCargo"]').value.trim();
        const comprador = tr.querySelector('[name="contatoComprador"]').checked;
        if (!nome && !email && !telefone) return null;

        return { nome, email, telefone, aniversario, cargo, comprador };
      })
      .filter(Boolean);

    const pagamentos = Array.from(pagamentosBody.querySelectorAll("tr"))
      .map((tr) => {
        const descricao = tr
          .querySelector('[name="pagamentoDescricao"]')
          .value.trim();
        const parcelasValue = Number.parseInt(
          tr.querySelector('[name="pagamentoParcelas"]').value,
          10
        );
        const intervaloValue = Number.parseInt(
          tr.querySelector('[name="pagamentoIntervalo"]').value,
          10
        );
        const descontoValue = Number.parseFloat(
          tr.querySelector('[name="pagamentoDesconto"]').value
        );
        const pedidoMinimoValue = Number.parseFloat(
          tr.querySelector('[name="pagamentoMinimo"]').value
        );
        const industria = tr
          .querySelector('[name="pagamentoIndustria"]')
          .value.trim();
        if (!descricao) {
          return null;
        }
        return {
          descricao,
          parcelas:
            Number.isFinite(parcelasValue) && parcelasValue > 0
              ? parcelasValue
              : 1,
          intervaloDias:
            Number.isFinite(intervaloValue) && intervaloValue >= 0
              ? intervaloValue
              : 0,
          descontoOuAcrescimo: Number.isFinite(descontoValue)
            ? descontoValue
            : 0,
          pedidoMinimo: Number.isFinite(pedidoMinimoValue)
            ? pedidoMinimoValue
            : 0,
          industria,
        };
      })
      .filter(Boolean);

    const vendedores = Array.from(vendedoresBody.querySelectorAll("tr"))
      .map((tr) => {
        const vendedor = tr.querySelector('[name="pjVendedor"]').value.trim();
        if (!vendedor) return null;
        return { vendedor };
      })
      .filter(Boolean);

    const industrias = Array.from(industriasBody.querySelectorAll("tr"))
      .map((tr) => {
        const industria = tr.querySelector('[name="pjIndustria"]').value.trim();
        const tabelaPreco = tr
          .querySelector('[name="pjTabelaPreco"]')
          .value.trim();
        const descontoPercent = Number.parseFloat(
          tr.querySelector('[name="pjIndustriaDesconto"]').value
        );
        if (!industria) return null;
        return {
          industria,
          tabelaPreco,
          descontoPercentual: Number.isFinite(descontoPercent)
            ? descontoPercent
            : 0,
        };
      })
      .filter(Boolean);

    const transportadoras = Array.from(
      transportadorasBody.querySelectorAll("tr")
    )
      .map((tr) => {
        const transportadoraId = tr.querySelector(
          '[name="pjTransportadora"]'
        ).value;
        if (!transportadoraId) return null;
        const transportadora = storage
          .load()
          .transportadoras.find((item) => item.id === transportadoraId);
        if (!transportadora) return null;
        return {
          transportadoraId,
          transportadoraNome: transportadora.nome,
        };
      })
      .filter(Boolean);

    const endereco = {
      endereco: fields.endereco.value.trim(),
      bairro: fields.bairro.value.trim(),
      numero: fields.numero.value.trim(),
      cep: fields.cep.value.trim(),
      cidade: fields.cidade.value,
      estado: fields.estado.value,
    };

    const comunicacao = {
      telefone: fields.telefone.value.trim(),
      fax: fields.fax.value.trim(),
      telefoneAdicional: fields.telefoneAdicional.value.trim(),
      website: fields.website.value.trim(),
      email: fields.email.value.trim(),
      emailNfe: fields.emailNfe.value.trim(),
    };

    const statusInfo = {
      status: fields.status.value,
      observacoes: fields.observacoes.value.trim(),
      dataAbertura: fields.dataAbertura.value,
      regiao: fields.regiao.value,
    };

    const informacoes = {
      razaoSocial,
      nomeFantasia,
      rede: fields.rede.value,
      cnpj,
      inscricaoEstadual: fields.inscricaoEstadual.value.trim(),
      codigo: fields.codigo.value.trim(),
      matriz: fields.matriz.value,
      segmento: fields.segmento.value.trim(),
    };

    const dadosPJ = {
      informacoes,
      contatos,
      endereco,
      comunicacao,
      status: statusInfo,
      pagamentos,
      vendedores,
      industrias,
      transportadoras,
    };

    const clienteId = fields.id.value;

    if (clienteId) {
      // Atualizar cliente existente
      storage.update((draft) => {
        const clienteExistente = draft.clientes.find((c) => c.id === clienteId);
        if (clienteExistente) {
          clienteExistente.tipo = "PJ";
          clienteExistente.nome =
            informacoes.razaoSocial || informacoes.nomeFantasia;
          clienteExistente.fantasia = informacoes.nomeFantasia;
          clienteExistente.documento = informacoes.cnpj;
          clienteExistente.email = comunicacao.email;
          clienteExistente.telefone = comunicacao.telefone;
          clienteExistente.observacoes = statusInfo.observacoes;
          clienteExistente.dadosPJ = dadosPJ;

          // Atualizar referências em orçamentos
          draft.orcamentos.forEach((orcamento) => {
            if (orcamento.clienteId === clienteId) {
              orcamento.clienteNome = clienteExistente.nome;
            }
          });

          // Atualizar referências em pedidos
          draft.pedidos.forEach((pedido) => {
            if (pedido.clienteId === clienteId) {
              pedido.clienteNome = clienteExistente.nome;
            }
          });

          // Atualizar referências em CRM
          draft.crm.forEach((registro) => {
            if (registro.clienteId === clienteId) {
              registro.clienteNome = clienteExistente.nome;
            }
          });

          draft.clientes.sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
          );
        }
      });
      window.alert("Cliente PJ atualizado com sucesso!");
    } else {
      // Criar novo cliente
      storage.update((draft) => {
        const id = generateId("cli-pj");
        const cliente = {
          id,
          tipo: "PJ",
          nome: informacoes.razaoSocial || informacoes.nomeFantasia,
          fantasia: informacoes.nomeFantasia,
          documento: informacoes.cnpj,
          email: comunicacao.email,
          telefone: comunicacao.telefone,
          observacoes: statusInfo.observacoes,
          dadosPJ,
        };
        draft.clientes.push(cliente);
        draft.clientes.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
        );
      });
      window.alert("Cliente PJ cadastrado com sucesso!");
    }

    window.location.href = "clientes.html";
  });
}

function initClientePFPage() {
  const form = document.querySelector("#clientePFForm");
  if (!form) return;

  const fields = {
    id: document.querySelector("#pfClienteId"),
    nome: document.querySelector("#pfNome"),
    codigo: document.querySelector("#pfCodigo"),
    cpf: document.querySelector("#pfCpf"),
    inscricaoEstadual: document.querySelector("#pfInscricaoEstadual"),
    rg: document.querySelector("#pfRg"),
    estadoCivil: document.querySelector("#pfEstadoCivil"),
    sexo: document.querySelector("#pfSexo"),
    suframa: document.querySelector("#pfSuframa"),
    endereco: document.querySelector("#pfEndereco"),
    bairro: document.querySelector("#pfBairro"),
    numero: document.querySelector("#pfNumero"),
    cep: document.querySelector("#pfCep"),
    cidade: document.querySelector("#pfCidade"),
    estado: document.querySelector("#pfEstado"),
    telefone: document.querySelector("#pfTelefone"),
    fax: document.querySelector("#pfFax"),
    telefoneAdicional: document.querySelector("#pfTelefoneAdicional"),
    website: document.querySelector("#pfWebsite"),
    email: document.querySelector("#pfEmail"),
    observacoes: document.querySelector("#pfObservacoes"),
    status: document.querySelector("#pfStatus"),
    emailNfe: document.querySelector("#pfEmailNfe"),
    dataCadastro: document.querySelector("#pfDataCadastro"),
    regiao: document.querySelector("#pfRegiao"),
  };

  const contatosBody = document.querySelector("#pfContatosTbody");
  const pagamentosBody = document.querySelector("#pfPagamentosTbody");
  const vendedoresBody = document.querySelector("#pfVendedoresTbody");
  const industriasBody = document.querySelector("#pfIndustriasTbody");
  const transportadorasBody = document.querySelector("#pfTransportadorasTbody");

  const addContatoBtn = document.querySelector("#pfContatoAdicionar");
  const addPagamentoBtn = document.querySelector("#pfPagamentoAdicionar");
  const addVendedorBtn = document.querySelector("#pfVendedorAdicionar");
  const addIndustriaBtn = document.querySelector("#pfIndustriaAdicionar");
  const addTransportadoraBtn = document.querySelector(
    "#pfTransportadoraAdicionar"
  );

  const gerarCodigoBtn = document.querySelector("#pfGerarCodigo");
  const cancelarBtn = document.querySelector("#clientePFCancelar");
  // Aplicar máscaras no CPF e RG explicitamente
  if (fields.cpf && typeof window.maskCPF === "function") {
    fields.cpf.addEventListener("input", () => window.maskCPF(fields.cpf));
    if (fields.cpf.value) window.maskCPF(fields.cpf);
  }
  if (fields.rg && typeof window.maskRG === "function") {
    fields.rg.addEventListener("input", () => window.maskRG(fields.rg));
    if (fields.rg.value) window.maskRG(fields.rg);
  }

  // Carregar vendedores e indústrias dinamicamente (mesma lógica do PJ)
  let vendedoresLista = [];
  let industriasLista = ["Todas as Indústrias"];

  // Carregar indústrias da API/localStorage
  async function carregarIndustrias() {
    try {
      const API = window.oursalesAPI;
      if (API) {
        const response = await API.getIndustrias();
        const industrias = Array.isArray(response)
          ? response
          : response.data || [];
        industriasLista = [
          "Todas as Indústrias",
          ...industrias.map(
            (ind) => ind.nomeFantasia || ind.razaoSocial || ind.nome || ""
          ),
        ];
      } else {
        const data = storage.load();
        const industrias = data.industrias || [];
        industriasLista = [
          "Todas as Indústrias",
          ...industrias.map(
            (ind) => ind.nomeFantasia || ind.razaoSocial || ind.nome || ""
          ),
        ];
      }
    } catch (error) {
      console.error("Erro ao carregar indústrias:", error);
    }
  }

  // Carregar vendedores (usuários do sistema)
  async function carregarVendedores() {
    try {
      vendedoresLista = [
        "Ana Souza",
        "Bruno Oliveira",
        "Carla Ribeiro",
        "Diego Martins",
        "Fernanda Costa",
      ];
    } catch (error) {
      console.error("Erro ao carregar vendedores:", error);
    }
  }

  // Carregar dados ao inicializar
  carregarIndustrias();
  carregarVendedores();

  const buildStaticOptions = (
    values,
    selected = "",
    placeholder = "Selecione"
  ) => {
    const options = [`<option value="">${placeholder}</option>`];
    values.forEach((value) => {
      const isSelected = value === selected ? " selected" : "";
      options.push(
        `<option value="${escapeHtml(value)}"${isSelected}>${escapeHtml(
          value
        )}</option>`
      );
    });
    return options.join("");
  };

  const getTransportadoraOptions = (selectedId = "") => {
    const transportadoras = storage.load().transportadoras;
    if (!transportadoras.length) {
      return '<option value="">Cadastre transportadoras na aba Transportadoras</option>';
    }
    const options = ['<option value="">Selecione</option>'];
    transportadoras.forEach((item) => {
      const isSelected = item.id === selectedId ? " selected" : "";
      options.push(
        `<option value="${escapeHtml(item.id)}"${isSelected}>${escapeHtml(
          item.nome
        )}</option>`
      );
    });
    return options.join("");
  };

  const createRemoveHandler = (tbody, fallback) => (event) => {
    event.currentTarget.closest("tr").remove();
    if (fallback && !tbody.querySelector("tr")) {
      fallback();
    }
  };

  function addContatoRow(data = {}) {
    const tr = document.createElement("tr");
    const compradorChecked = data.comprador ? "checked" : "";
    tr.innerHTML = `
      <td>
        <input
          type="text"
          name="contatoNome"
          value="${escapeHtml(data.nome || "")}" 
          placeholder="Nome completo"
        />
      </td>
      <td>
        <input
          type="email"
          name="contatoEmail"
          value="${escapeHtml(data.email || "")}" 
          placeholder="email@empresa.com"
        />
      </td>
      <td>
        <input
          type="tel"
          name="contatoTelefone"
          value="${escapeHtml(data.telefone || "")}" 
          placeholder="(00) 00000-0000"
        />
      </td>
      <td>
        <input
          type="date"
          name="contatoAniversario"
          value="${escapeHtml(data.aniversario || "")}" 
        />
      </td>
      <td>
        <input
          type="text"
          name="contatoCargo"
          value="${escapeHtml(data.cargo || "")}" 
          placeholder="Cargo"
        />
      </td>
      <td class="checkbox-cell">
        <input type="checkbox" name="contatoComprador" ${compradorChecked} />
      </td>
      <td class="actions">
        <button type="button" class="button-danger" data-action="remove">Remover</button>
      </td>
    `;
    tr.querySelector('[data-action="remove"]').addEventListener(
      "click",
      createRemoveHandler(contatosBody, addContatoRow)
    );
    contatosBody.appendChild(tr);
  }

  function addPagamentoRow(data = {}) {
    const tr = document.createElement("tr");
    const descricao = data.descricao === undefined ? "À vista" : data.descricao;
    const parcelas =
      data.parcelas === undefined
        ? 1
        : data.parcelas === ""
        ? ""
        : Number.isFinite(Number(data.parcelas))
        ? Number(data.parcelas)
        : 1;
    const intervaloDias =
      data.intervaloDias === undefined
        ? 0
        : data.intervaloDias === ""
        ? ""
        : Number.isFinite(Number(data.intervaloDias))
        ? Number(data.intervaloDias)
        : 0;
    const desconto =
      data.descontoOuAcrescimo === undefined
        ? 0
        : data.descontoOuAcrescimo === ""
        ? ""
        : Number.isFinite(Number(data.descontoOuAcrescimo))
        ? Number(data.descontoOuAcrescimo)
        : 0;
    const pedidoMinimo =
      data.pedidoMinimo === undefined
        ? 0
        : data.pedidoMinimo === ""
        ? ""
        : Number.isFinite(Number(data.pedidoMinimo))
        ? Number(data.pedidoMinimo)
        : 0;
    const industria =
      data.industria === undefined ? "Todas as Indústrias" : data.industria;
    tr.innerHTML = `
      <td>
        <input
          type="text"
          name="pagamentoDescricao"
          value="${escapeHtml(descricao)}"
          placeholder="Descrição da condição"
        />
      </td>
      <td>
        <input
          type="number"
          name="pagamentoParcelas"
          min="1"
          value="${parcelas}"
        />
      </td>
      <td>
        <input
          type="number"
          name="pagamentoIntervalo"
          min="0"
          value="${intervaloDias}"
        />
      </td>
      <td>
        <input
          type="number"
          step="0.01"
          name="pagamentoDesconto"
          value="${desconto}"
        />
      </td>
      <td>
        <input
          type="number"
          step="0.01"
          name="pagamentoMinimo"
          value="${pedidoMinimo}"
        />
      </td>
      <td>
        <select name="pagamentoIndustria">
          ${buildStaticOptions(
            industriasLista,
            industria,
            "Todas as Indústrias"
          )}
        </select>
      </td>
      <td class="actions">
        <button type="button" class="button-add-inline" title="Adicionar nova linha" style="background-color: #007bff !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-plus"></i></button>
        <button type="button" class="button-remove-inline" title="Remover linha" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
      </td>
    `;

    // Event listener para botão adicionar
    tr.querySelector(".button-add-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      addContatoRow();
    });

    // Event listener para botão remover
    tr.querySelector(".button-remove-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.closest("tr").remove();
    });
    pagamentosBody.appendChild(tr);
  }

  function addVendedorRow(data = {}) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <select name="pfVendedor">
          ${buildStaticOptions(
            vendedoresLista,
            data.vendedor || "",
            "Selecione"
          )}
        </select>
      </td>
      <td class="actions">
        <button type="button" class="button-add-inline" title="Adicionar nova linha" style="background-color: #007bff !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-plus"></i></button>
        <button type="button" class="button-remove-inline" title="Remover linha" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
      </td>
    `;

    // Event listener para botão adicionar
    tr.querySelector(".button-add-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      addContatoRow();
    });

    // Event listener para botão remover
    tr.querySelector(".button-remove-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.closest("tr").remove();
    });
    vendedoresBody.appendChild(tr);
  }

  function addIndustriaRow(data = {}) {
    const tr = document.createElement("tr");
    const descontoPercent =
      data.descontoPercentual === undefined
        ? 0
        : data.descontoPercentual === ""
        ? ""
        : Number.isFinite(Number(data.descontoPercentual))
        ? Number(data.descontoPercentual)
        : 0;
    tr.innerHTML = `
      <td>
        <select name="pfIndustria">
          ${buildStaticOptions(
            industriasLista,
            data.industria || "",
            "Selecione"
          )}
        </select>
      </td>
      <td>
        <input
          type="text"
          name="pfTabelaPreco"
          value="${escapeHtml(data.tabelaPreco || "")}" 
          placeholder="Tabela de preço"
        />
      </td>
      <td>
        <input
          type="number"
          step="0.01"
          name="pfIndustriaDesconto"
          value="${descontoPercent}"
        />
      </td>
      <td class="actions">
        <button type="button" class="button-add-inline" title="Adicionar nova linha" style="background-color: #007bff !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-plus"></i></button>
        <button type="button" class="button-remove-inline" title="Remover linha" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
      </td>
    `;

    // Event listener para botão adicionar
    tr.querySelector(".button-add-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      addContatoRow();
    });

    // Event listener para botão remover
    tr.querySelector(".button-remove-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.closest("tr").remove();
    });
    industriasBody.appendChild(tr);
  }

  function addTransportadoraRow(data = {}) {
    const transportadoras = storage.load().transportadoras;
    let selectedId = data.transportadoraId || "";
    if (!selectedId && transportadoras.length === 1) {
      selectedId = transportadoras[0].id;
    }
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <select name="pfTransportadora">
          ${getTransportadoraOptions(selectedId)}
        </select>
      </td>
      <td class="actions">
        <button type="button" class="button-add-inline" title="Adicionar nova linha" style="background-color: #007bff !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-plus"></i></button>
        <button type="button" class="button-remove-inline" title="Remover linha" style="background-color: #dc3545 !important; color: white !important; border: none !important; padding: 8px 12px !important; border-radius: 4px !important; font-size: 16px !important; cursor: pointer !important; margin: 4px !important; min-width: 40px !important; height: 40px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important;"><i class="ti ti-trash"></i></button>
      </td>
    `;

    // Event listener para botão adicionar
    tr.querySelector(".button-add-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      addContatoRow();
    });

    // Event listener para botão remover
    tr.querySelector(".button-remove-inline").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.closest("tr").remove();
    });
    transportadorasBody.appendChild(tr);
  }

  addContatoBtn?.addEventListener("click", () => addContatoRow());
  addPagamentoBtn?.addEventListener("click", () => addPagamentoRow());
  addVendedorBtn?.addEventListener("click", () => addVendedorRow());
  addIndustriaBtn?.addEventListener("click", () => addIndustriaRow());
  addTransportadoraBtn?.addEventListener("click", () => addTransportadoraRow());

  addContatoRow();
  addPagamentoRow();
  addVendedorRow();
  addIndustriaRow();
  addTransportadoraRow();

  // Verificar se está editando um cliente existente
  const urlParams = new URLSearchParams(window.location.search);
  const clienteId = urlParams.get("id");

  if (clienteId) {
    const cliente = storage.load().clientes.find((c) => c.id === clienteId);
    if (cliente) {
      // Atualizar título e botão
      document.querySelector("#pfFormTitle").textContent =
        "Editar Cliente (Pessoa Física)";
      document.querySelector("header h1").textContent =
        "Editar Cliente • Pessoa Física";
      document.querySelector("#pfSalvar").textContent = "Atualizar";

      // Carregar ID
      fields.id.value = cliente.id;

      // Se o cliente tem dadosPF, carregar estrutura completa
      if (cliente.dadosPF) {
        // Carregar informações básicas
        const info = cliente.dadosPF.informacoes || {};
        fields.nome.value = info.nome || "";
        fields.codigo.value = info.codigo || "";
        fields.cpf.value = info.cpf || "";
        fields.inscricaoEstadual.value = info.inscricaoEstadual || "";
        fields.rg.value = info.rg || "";
        fields.estadoCivil.value = info.estadoCivil || "";
        fields.sexo.value = info.sexo || "";
        fields.suframa.value = info.suframa || "";

        // Carregar endereço
        const end = cliente.dadosPF.endereco || {};
        fields.endereco.value = end.endereco || "";
        fields.bairro.value = end.bairro || "";
        fields.numero.value = end.numero || "";
        fields.cep.value = end.cep || "";
        fields.cidade.value = end.cidade || "";
        fields.estado.value = end.estado || "";

        // Carregar comunicação
        const com = cliente.dadosPF.comunicacao || {};
        fields.telefone.value = com.telefone || "";
        fields.fax.value = com.fax || "";
        fields.telefoneAdicional.value = com.telefoneAdicional || "";
        fields.website.value = com.website || "";
        fields.email.value = com.email || "";
        fields.emailNfe.value = com.emailNfe || "";

        // Carregar status
        const st = cliente.dadosPF.status || {};
        fields.status.value = st.status || "Ativo";
        fields.observacoes.value = st.observacoes || "";
        fields.dataCadastro.value = st.dataCadastro || "";
        fields.regiao.value = st.regiao || "";

        // Limpar tabelas antes de carregar
        contatosBody.innerHTML = "";
        pagamentosBody.innerHTML = "";
        vendedoresBody.innerHTML = "";
        industriasBody.innerHTML = "";
        transportadorasBody.innerHTML = "";

        // Carregar contatos
        const contatos = cliente.dadosPF.contatos || [];
        if (contatos.length > 0) {
          contatos.forEach((contato) => addContatoRow(contato));
        } else {
          addContatoRow();
        }

        // Carregar pagamentos
        const pagamentos = cliente.dadosPF.pagamentos || [];
        if (pagamentos.length > 0) {
          pagamentos.forEach((pag) => addPagamentoRow(pag));
        } else {
          addPagamentoRow();
        }

        // Carregar vendedores
        const vendedores = cliente.dadosPF.vendedores || [];
        if (vendedores.length > 0) {
          vendedores.forEach((vend) => addVendedorRow(vend));
        } else {
          addVendedorRow();
        }

        // Carregar indústrias
        const industrias = cliente.dadosPF.industrias || [];
        if (industrias.length > 0) {
          industrias.forEach((ind) => addIndustriaRow(ind));
        } else {
          addIndustriaRow();
        }

        // Carregar transportadoras
        const transportadoras = cliente.dadosPF.transportadoras || [];
        if (transportadoras.length > 0) {
          transportadoras.forEach((transp) => addTransportadoraRow(transp));
        } else {
          addTransportadoraRow();
        }
      } else {
        // Cliente antigo sem dadosPF - carregar dados básicos disponíveis
        fields.nome.value = cliente.nome || "";
        fields.cpf.value = cliente.documento || "";
        fields.email.value = cliente.email || "";
        fields.telefone.value = cliente.telefone || "";
        fields.observacoes.value = cliente.observacoes || "";

        // Limpar tabelas e adicionar linhas vazias
        contatosBody.innerHTML = "";
        pagamentosBody.innerHTML = "";
        vendedoresBody.innerHTML = "";
        industriasBody.innerHTML = "";
        transportadorasBody.innerHTML = "";

        addContatoRow();
        addPagamentoRow();
        addVendedorRow();
        addIndustriaRow();
        addTransportadoraRow();
      }
    }
  }

  gerarCodigoBtn?.addEventListener("click", () => {
    fields.codigo.value = `CLI-PF-${Date.now().toString(36).toUpperCase()}`;
  });

  cancelarBtn?.addEventListener("click", () => {
    window.location.href = "clientes.html";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = fields.nome.value.trim();
    const cpf = fields.cpf.value.trim();

    if (!nome || !cpf) {
      window.alert("Informe Nome e CPF do cliente.");
      return;
    }

    const contatos = Array.from(contatosBody.querySelectorAll("tr"))
      .map((tr) => {
        const nome = tr.querySelector('[name="contatoNome"]').value.trim();
        if (!nome) {
          return null;
        }
        const email = tr.querySelector('[name="contatoEmail"]').value.trim();
        const telefone = tr
          .querySelector('[name="contatoTelefone"]')
          .value.trim();
        const aniversario = tr.querySelector(
          '[name="contatoAniversario"]'
        ).value;
        const cargo = tr.querySelector('[name="contatoCargo"]').value.trim();
        const comprador = tr.querySelector('[name="contatoComprador"]').checked;
        return { nome, email, telefone, aniversario, cargo, comprador };
      })
      .filter(Boolean);

    // Contato passa a ser opcional: permitir salvar mesmo sem contatos

    const pagamentos = Array.from(pagamentosBody.querySelectorAll("tr"))
      .map((tr) => {
        const descricao = tr
          .querySelector('[name="pagamentoDescricao"]')
          .value.trim();
        const parcelasValue = Number.parseInt(
          tr.querySelector('[name="pagamentoParcelas"]').value,
          10
        );
        const intervaloValue = Number.parseInt(
          tr.querySelector('[name="pagamentoIntervalo"]').value,
          10
        );
        const descontoValue = Number.parseFloat(
          tr.querySelector('[name="pagamentoDesconto"]').value
        );
        const pedidoMinimoValue = Number.parseFloat(
          tr.querySelector('[name="pagamentoMinimo"]').value
        );
        const industria = tr
          .querySelector('[name="pagamentoIndustria"]')
          .value.trim();
        if (!descricao) {
          return null;
        }
        return {
          descricao,
          parcelas:
            Number.isFinite(parcelasValue) && parcelasValue > 0
              ? parcelasValue
              : 1,
          intervaloDias:
            Number.isFinite(intervaloValue) && intervaloValue >= 0
              ? intervaloValue
              : 0,
          descontoOuAcrescimo: Number.isFinite(descontoValue)
            ? descontoValue
            : 0,
          pedidoMinimo: Number.isFinite(pedidoMinimoValue)
            ? pedidoMinimoValue
            : 0,
          industria,
        };
      })
      .filter(Boolean);

    const vendedores = Array.from(vendedoresBody.querySelectorAll("tr"))
      .map((tr) => {
        const vendedor = tr.querySelector('[name="pfVendedor"]').value.trim();
        if (!vendedor) return null;
        return { vendedor };
      })
      .filter(Boolean);

    const industrias = Array.from(industriasBody.querySelectorAll("tr"))
      .map((tr) => {
        const industria = tr.querySelector('[name="pfIndustria"]').value.trim();
        const tabelaPreco = tr
          .querySelector('[name="pfTabelaPreco"]')
          .value.trim();
        const descontoPercent = Number.parseFloat(
          tr.querySelector('[name="pfIndustriaDesconto"]').value
        );
        if (!industria) return null;
        return {
          industria,
          tabelaPreco,
          descontoPercentual: Number.isFinite(descontoPercent)
            ? descontoPercent
            : 0,
        };
      })
      .filter(Boolean);

    const transportadoras = Array.from(
      transportadorasBody.querySelectorAll("tr")
    )
      .map((tr) => {
        const transportadoraId = tr.querySelector(
          '[name="pfTransportadora"]'
        ).value;
        if (!transportadoraId) return null;
        const transportadora = storage
          .load()
          .transportadoras.find((item) => item.id === transportadoraId);
        if (!transportadora) return null;
        return {
          transportadoraId,
          transportadoraNome: transportadora.nome,
        };
      })
      .filter(Boolean);

    const endereco = {
      endereco: fields.endereco.value.trim(),
      bairro: fields.bairro.value.trim(),
      numero: fields.numero.value.trim(),
      cep: fields.cep.value.trim(),
      cidade: fields.cidade.value,
      estado: fields.estado.value,
    };

    const comunicacao = {
      telefone: fields.telefone.value.trim(),
      fax: fields.fax.value.trim(),
      telefoneAdicional: fields.telefoneAdicional.value.trim(),
      website: fields.website.value.trim(),
      email: fields.email.value.trim(),
      emailNfe: fields.emailNfe.value.trim(),
    };

    const statusInfo = {
      status: fields.status.value,
      observacoes: fields.observacoes.value.trim(),
      dataCadastro: fields.dataCadastro.value,
      regiao: fields.regiao.value,
    };

    const informacoes = {
      nome,
      codigo: fields.codigo.value.trim(),
      cpf,
      inscricaoEstadual: fields.inscricaoEstadual.value.trim(),
      rg: fields.rg.value.trim(),
      estadoCivil: fields.estadoCivil.value,
      sexo: fields.sexo.value,
      suframa: fields.suframa.value.trim(),
    };

    const dadosPF = {
      informacoes,
      contatos,
      endereco,
      comunicacao,
      status: statusInfo,
      pagamentos,
      vendedores,
      industrias,
      transportadoras,
    };

    const clienteId = fields.id.value;

    if (clienteId) {
      // Atualizar cliente existente
      storage.update((draft) => {
        const clienteExistente = draft.clientes.find((c) => c.id === clienteId);
        if (clienteExistente) {
          clienteExistente.tipo = "PF";
          clienteExistente.nome = informacoes.nome;
          clienteExistente.documento = informacoes.cpf;
          clienteExistente.email = comunicacao.email;
          clienteExistente.telefone = comunicacao.telefone;
          clienteExistente.observacoes = statusInfo.observacoes;
          clienteExistente.dadosPF = dadosPF;

          // Atualizar referências em orçamentos
          draft.orcamentos.forEach((orcamento) => {
            if (orcamento.clienteId === clienteId) {
              orcamento.clienteNome = clienteExistente.nome;
            }
          });

          // Atualizar referências em pedidos
          draft.pedidos.forEach((pedido) => {
            if (pedido.clienteId === clienteId) {
              pedido.clienteNome = clienteExistente.nome;
            }
          });

          // Atualizar referências em CRM
          draft.crm.forEach((registro) => {
            if (registro.clienteId === clienteId) {
              registro.clienteNome = clienteExistente.nome;
            }
          });

          draft.clientes.sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
          );
        }
      });
      window.alert("Cliente PF atualizado com sucesso!");
    } else {
      // Criar novo cliente
      storage.update((draft) => {
        const id = generateId("cli-pf");
        const cliente = {
          id,
          tipo: "PF",
          nome: informacoes.nome,
          documento: informacoes.cpf,
          email: comunicacao.email,
          telefone: comunicacao.telefone,
          observacoes: statusInfo.observacoes,
          dadosPF,
        };
        draft.clientes.push(cliente);
        draft.clientes.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
        );
      });
      window.alert("Cliente PF cadastrado com sucesso!");
    }

    window.location.href = "clientes.html";
  });
}

function initTransportadorasPage() {
  const form = document.querySelector("#transportadoraForm");
  if (!form) return;

  const overlay = document.querySelector("#transportadoraOverlay");
  const drawer = document.querySelector("#transportadoraDrawer");
  const titleEl = document.querySelector("#transportadoraDrawerTitulo");
  const descEl = document.querySelector("#transportadoraDrawerDescricao");
  const openBtn = document.querySelector("#transportadoraCriar");
  const editBtn = document.querySelector("#transportadoraEditar");
  const removeBtn = document.querySelector("#transportadoraRemover");
  const closeBtn = document.querySelector("#transportadoraDrawerFechar");
  const cancelBtn = document.querySelector("#transportadoraCancelar");
  const submitBtn = form.querySelector('button[type="submit"]');
  const listContainer = document.querySelector("#transportadorasLista");

  const fields = {
    id: document.querySelector("#transportadoraId"),
    nome: document.querySelector("#transportadoraNome"),
    prazo: document.querySelector("#transportadoraPrazo"),
    custo: document.querySelector("#transportadoraCusto"),
    cobertura: document.querySelector("#transportadoraCobertura"),
  };

  let selectedId = "";

  const updateActionsState = () => {
    const hasSelection = Boolean(selectedId);
    if (editBtn) editBtn.disabled = !hasSelection;
    if (removeBtn) removeBtn.disabled = !hasSelection;
  };

  const clearForm = () => {
    form.reset();
    fields.id.value = "";
  };

  const closeForm = () => {
    clearForm();
    hideDrawer(drawer, overlay);
  };

  overlay?.addEventListener("click", closeForm);
  closeBtn?.addEventListener("click", closeForm);
  cancelBtn?.addEventListener("click", closeForm);

  openBtn?.addEventListener("click", () => {
    clearForm();
    titleEl.textContent = "Nova transportadora";
    descEl.textContent =
      "Cadastre parceiros logísticos com prazo e custo estimados para reutilizar nos pedidos.";
    submitBtn.textContent = "Salvar transportadora";
    showDrawer(drawer, overlay);
    focusFirstInput(fields.nome);
  });

  editBtn?.addEventListener("click", () => {
    if (!selectedId) {
      window.alert("Selecione uma transportadora para editar.");
      return;
    }
    const transportadora = storage
      .load()
      .transportadoras.find((item) => item.id === selectedId);
    if (!transportadora) {
      window.alert("A transportadora selecionada não está mais disponível.");
      selectedId = "";
      updateActionsState();
      render();
      return;
    }
    fields.id.value = transportadora.id;
    fields.nome.value = transportadora.nome;
    fields.prazo.value = transportadora.prazo;
    fields.custo.value = transportadora.custo;
    fields.cobertura.value = transportadora.cobertura || "";
    titleEl.textContent = "Editar transportadora";
    descEl.textContent =
      "Ajuste as informações operacionais da transportadora selecionada.";
    submitBtn.textContent = "Atualizar transportadora";
    showDrawer(drawer, overlay);
    focusFirstInput(fields.nome);
  });

  removeBtn?.addEventListener("click", async () => {
    if (!selectedId) {
      window.alert("Selecione uma transportadora para remover.");
      return;
    }

    // Verificar relacionamentos
    let relacionados = 0;
    try {
      const API = window.oursalesAPI;
      if (API && API.shouldUseAPI()) {
        // Na API, a exclusão em cascata é tratada pelo backend
        relacionados = 1; // Assumir que pode ter relacionamentos
      } else {
        relacionados = storage
          .load()
          .pedidos.filter(
            (pedido) => pedido.transportadoraId === selectedId
          ).length;
      }
    } catch (error) {
      console.error("Erro ao verificar relacionamentos:", error);
    }

    let mensagem = "Confirma remover esta transportadora?";
    if (relacionados) {
      mensagem = `Esta transportadora está vinculada a ${relacionados} pedido(s).\nAo remover, esses pedidos também serão excluídos. Deseja continuar?`;
    }

    if (!window.confirm(mensagem)) {
      return;
    }

    try {
      const API = window.oursalesAPI;
      if (API) {
        await API.deleteTransportadora(selectedId);
      } else {
        storage.update((draft) => {
          draft.transportadoras = draft.transportadoras.filter(
            (item) => item.id !== selectedId
          );
          draft.pedidos = draft.pedidos.filter(
            (pedido) => pedido.transportadoraId !== selectedId
          );
        });
      }
      selectedId = "";
      await render();
    } catch (error) {
      console.error("Erro ao remover transportadora:", error);
      window.alert(
        "Erro ao remover transportadora: " +
          (error.message || "Erro desconhecido")
      );
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = fields.id.value;
    const prazo = Number.parseInt(fields.prazo.value, 10);
    const custo = Number.parseFloat(fields.custo.value);

    if (!Number.isFinite(prazo) || prazo <= 0) {
      window.alert("Informe um prazo médio válido (em dias).");
      return;
    }

    if (!Number.isFinite(custo) || custo < 0) {
      window.alert("Informe um custo médio válido.");
      return;
    }

    const data = {
      nome: fields.nome.value.trim(),
      prazo,
      custo,
      cobertura: fields.cobertura.value.trim(),
    };

    if (!data.nome) {
      window.alert("Informe o nome da transportadora.");
      return;
    }

    if (id) {
      storage.update((draft) => {
        const transportadora = draft.transportadoras.find(
          (item) => item.id === id
        );
        if (!transportadora) return;
        Object.assign(transportadora, data);
        draft.pedidos.forEach((pedido) => {
          if (pedido.transportadoraId === id) {
            pedido.transportadoraNome = data.nome;
          }
        });
        draft.transportadoras.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
        );
      });
      selectedId = id;
    } else {
      let createdId = "";
      storage.update((draft) => {
        const nova = { id: generateId("tra"), ...data };
        draft.transportadoras.push(nova);
        draft.transportadoras.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
        );
        createdId = nova.id;
      });
      selectedId = createdId;
    }

    closeForm();
    render();
  });

  listContainer?.addEventListener("change", (event) => {
    const input = event.target.closest(
      'input[type="radio"][name="transportadoraSelecionada"]'
    );
    if (!input) return;
    selectedId = input.value;
    syncSelection(listContainer, "transportadoraSelecionada", selectedId);
    updateActionsState();
  });

  listContainer?.addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-id]");
    if (!row) return;
    const input = row.querySelector(
      'input[type="radio"][name="transportadoraSelecionada"]'
    );
    if (input) {
      // Toggle: se já está selecionado, desmarcar
      if (selectedId === input.value) {
        input.checked = false;
        selectedId = "";
      } else {
        input.checked = true;
        selectedId = input.value;
      }
      syncSelection(listContainer, "transportadoraSelecionada", selectedId);
      updateActionsState();
    }
  });

  async function render() {
    // Carregar transportadoras da API ou localStorage
    let transportadoras = [];
    try {
      const API = window.oursalesAPI;
      if (API) {
        const response = await API.getTransportadoras();
        transportadoras = Array.isArray(response)
          ? response
          : response.data || [];
      } else {
        transportadoras = storage.load().transportadoras;
      }
    } catch (error) {
      console.error("Erro ao carregar transportadoras:", error);
      transportadoras = storage.load().transportadoras;
    }

    if (
      selectedId &&
      !transportadoras.some(
        (transportadora) => transportadora.id === selectedId
      )
    ) {
      selectedId = "";
    }

    if (!transportadoras.length) {
      listContainer.innerHTML =
        '<div class="empty-state">Nenhuma transportadora cadastrada.</div>';
      updateActionsState();
      return;
    }

    const linhas = transportadoras
      .map(
        (transportadora) => `
          <tr class="table-row${
            transportadora.id === selectedId ? " is-selected" : ""
          }" data-id="${transportadora.id}">
            <td class="select-cell">
              <label class="select-radio">
                <input type="radio" name="transportadoraSelecionada" value="${
                  transportadora.id
                }" ${transportadora.id === selectedId ? "checked" : ""} />
                <span class="bubble"></span>
              </label>
            </td>
            <td><strong>${transportadora.nome}</strong></td>
            <td>${transportadora.prazo} dia(s)</td>
            <td>${formatCurrency(transportadora.custo)}</td>
            <td>${transportadora.cobertura || "-"}</td>
          </tr>
        `
      )
      .join("");

    listContainer.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="select-cell">Selecionar</th>
              <th>Transportadora</th>
              <th>Prazo Médio</th>
              <th>Custo Médio</th>
              <th>Cobertura</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;

    syncSelection(listContainer, "transportadoraSelecionada", selectedId);
    updateActionsState();
  }

  render();
}

function initIndustriasPage() {
  const openBtn = document.querySelector("#industriaCriar");
  const editBtn = document.querySelector("#industriaEditar");
  const removeBtn = document.querySelector("#industriaRemover");
  const listContainer = document.querySelector("#industriasLista");

  let selectedId = "";

  const updateActionsState = () => {
    const checkedBoxes =
      listContainer?.querySelectorAll(
        'input[type="checkbox"][name="industriaSelecionada"]:checked'
      ) || [];
    const hasSelection = checkedBoxes.length > 0;
    const hasSingleSelection = checkedBoxes.length === 1;

    // Editar só funciona com uma seleção
    if (editBtn) editBtn.disabled = !hasSingleSelection;
    // Remover funciona com uma ou múltiplas seleções
    if (removeBtn) removeBtn.disabled = !hasSelection;
  };

  if (openBtn) {
    console.log("✅ Botão industriaCriar encontrado, adicionando listener");
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("✅ Click no botão industriaCriar detectado");
      window.location.href = "industria-form.html";
    });
  } else {
    console.error("❌ Botão #industriaCriar não encontrado!");
  }

  removeBtn?.addEventListener("click", async () => {
    const checkedBoxes =
      listContainer?.querySelectorAll(
        'input[type="checkbox"][name="industriaSelecionada"]:checked'
      ) || [];

    if (checkedBoxes.length === 0) {
      window.alert("Selecione uma ou mais indústrias para remover.");
      return;
    }

    const count = checkedBoxes.length;
    const message =
      count === 1
        ? "Confirma remover esta indústria?"
        : `Confirma remover ${count} indústrias?`;

    if (!window.confirm(message)) {
      return;
    }

    const idsToRemove = Array.from(checkedBoxes).map((cb) => cb.value);

    try {
      const API = window.oursalesAPI;
      if (API) {
        // Remover uma por uma via API
        for (const id of idsToRemove) {
          await API.deleteIndustria(id);
        }
      } else {
        storage.update((draft) => {
          draft.industrias = draft.industrias.filter(
            (industria) => !idsToRemove.includes(industria.id)
          );
        });
      }
      selectedId = "";
      await render();
    } catch (error) {
      console.error("Erro ao remover indústria(s):", error);
      window.alert(
        "Erro ao remover indústria(s): " +
          (error.message || "Erro desconhecido")
      );
    }
  });

  // Event listener para seleção via checkbox
  listContainer?.addEventListener("change", (event) => {
    const input = event.target.closest(
      'input[type="checkbox"][name="industriaSelecionada"]'
    );
    if (!input) return;

    // Atualizar selectedId se apenas uma estiver selecionada
    const checkedBoxes = listContainer.querySelectorAll(
      'input[type="checkbox"][name="industriaSelecionada"]:checked'
    );
    if (checkedBoxes.length === 1) {
      selectedId = checkedBoxes[0].value;
    } else if (checkedBoxes.length === 0) {
      selectedId = "";
    } else {
      // Múltiplas seleções - não atualizar selectedId para edição
      selectedId = "";
    }

    updateActionsState();
  });

  editBtn?.addEventListener("click", () => {
    const checkedBoxes =
      listContainer?.querySelectorAll(
        'input[type="checkbox"][name="industriaSelecionada"]:checked'
      ) || [];

    if (checkedBoxes.length === 0) {
      window.alert("Selecione uma indústria para editar.");
      return;
    }

    if (checkedBoxes.length > 1) {
      window.alert("Selecione apenas uma indústria para editar.");
      return;
    }

    selectedId = checkedBoxes[0].value;
    window.sessionStorage.setItem("oursales:editIndustria", selectedId);
    window.location.href = "industria-form.html";
  });

  async function render() {
    // Carregar indústrias da API ou localStorage
    let industrias = [];
    try {
      const API = window.oursalesAPI;
      if (API) {
        const response = await API.getIndustrias();
        industrias = Array.isArray(response) ? response : response.data || [];
      } else {
        industrias = storage.load().industrias;
      }
    } catch (error) {
      console.error("Erro ao carregar indústrias:", error);
      industrias = storage.load().industrias;
    }

    if (
      selectedId &&
      !industrias.some((industria) => industria.id === selectedId)
    ) {
      selectedId = "";
    }

    if (!industrias.length) {
      listContainer.innerHTML =
        '<div class="empty-state">Nenhuma indústria cadastrada.</div>';
      updateActionsState();
      return;
    }

    // Obter colunas personalizadas
    const customColumns = getCustomColumns("industrias");
    const allColumns = [
      "razaoSocial",
      "nomeFantasia",
      "cnpj",
      "contato",
      "telefone",
      "email",
      "endereco",
      "dataCadastro",
      "observacoes",
    ];
    const visibleColumns =
      customColumns.length > 0 ? customColumns : allColumns;

    const linhas = industrias
      .map((industria) => {
        let rowContent = `
          <tr class="table-row${
            industria.id === selectedId ? " is-selected" : ""
          }" data-id="${industria.id}">
            <td class="select-cell">
              <label class="select-radio">
                <input type="checkbox" name="industriaSelecionada" value="${
                  industria.id
                }" />
              </label>
            </td>`;

        // Renderizar colunas dinamicamente
        visibleColumns.forEach((column) => {
          let cellContent = "";
          switch (column) {
            case "razaoSocial":
              cellContent = industria.razaoSocial || "-";
              break;
            case "nomeFantasia":
              cellContent = industria.nomeFantasia || industria.nome || "-";
              break;
            case "cnpj":
              cellContent = industria.cnpj || "-";
              break;
            case "telefone":
              cellContent = industria.telefone || "-";
              break;
            case "email":
              cellContent = industria.email || "-";
              break;
            case "contato":
              cellContent = industria.contato || "-";
              break;
            case "endereco":
              cellContent = industria.endereco || "-";
              break;
            case "dataCadastro":
              cellContent = industria.dataCadastro || "-";
              break;
            case "observacoes":
              cellContent = industria.observacoes || "-";
              break;
            default:
              cellContent = "-";
          }

          const className = column === "razaoSocial" ? "" : "dynamic-column";
          rowContent += `<td class="${className}">${cellContent}</td>`;
        });

        rowContent += "</tr>";
        return rowContent;
      })
      .join("");

    // Construir cabeçalho dinamicamente
    const headerCells = visibleColumns
      .map((column) => {
        const labels = {
          razaoSocial: "Razão Social",
          nomeFantasia: "Nome Fantasia",
          cnpj: "CNPJ",
          telefone: "Telefone",
          email: "E-mail",
          contato: "Contato",
          endereco: "Endereço",
          dataCadastro: "Data de Cadastro",
          observacoes: "Observações",
        };
        return `<th>${labels[column] || column}</th>`;
      })
      .join("");

    listContainer.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="select-cell">
                <input type="checkbox" class="select-all-checkbox" title="Selecionar todos">
              </th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;

    // Atualizar estado dos botões baseado na seleção
    updateActionsState();

    // Adicionar click nas linhas para seleção (igual às outras páginas)
    listContainer.querySelectorAll("tbody tr").forEach((row) => {
      row.style.cursor = "pointer";
      row.addEventListener("click", (e) => {
        // Não selecionar se clicou no checkbox ou botão
        if (
          e.target.closest('input[type="checkbox"]') ||
          e.target.closest("button")
        ) {
          return;
        }

        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });

      // Double click para editar
      row.addEventListener("dblclick", (e) => {
        // Não editar se clicou no checkbox ou botão
        if (
          e.target.closest('input[type="checkbox"]') ||
          e.target.closest("button")
        ) {
          return;
        }

        const industriaId = row.getAttribute("data-id");
        if (industriaId) {
          // Selecionar a indústria
          const checkbox = row.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event("change", { bubbles: true }));
          }
          // Aguardar um pouco para garantir que a seleção foi processada
          setTimeout(() => {
            window.sessionStorage.setItem(
              "oursales:editIndustria",
              industriaId
            );
            window.location.href = "industria-form.html";
          }, 100);
        }
      });
    });
  }

  render();
}

/**
 * Industria Form Page - Página separada para criar/editar indústrias
 */
function initIndustriaFormPage() {
  const form = document.querySelector("#industriaForm");
  if (!form) {
    console.error("Formulário #industriaForm não encontrado");
    return;
  }

  const formTitle = document.querySelector("#industriaFormTitle");

  const fields = {
    id: document.querySelector("#industriaId"),
    razaoSocial: document.querySelector("#industriaRazaoSocial"),
    nomeFantasia: document.querySelector("#industriaNomeFantasia"),
    cnpj: document.querySelector("#industriaCNPJ"),
    inscricaoEstadual: document.querySelector("#industriaInscricaoEstadual"),
    email: document.querySelector("#industriaEmail"),
    comissao: document.querySelector("#industriaComissao"),
    pagamentoComissao: document.querySelector("#industriaPagamentoComissao"),
    status: document.querySelector("#industriaStatus"),
    logoURL: document.querySelector("#industriaLogoURL"),
    endereco: document.querySelector("#industriaEndereco"),
    bairro: document.querySelector("#industriaBairro"),
    cep: document.querySelector("#industriaCEP"),
    cidade: document.querySelector("#industriaCidade"),
    estado: document.querySelector("#industriaEstado"),
    telefone: document.querySelector("#industriaTelefone"),
    telefoneAdicional: document.querySelector("#industriaTelefoneAdicional"),
    observacoes: document.querySelector("#industriaObservacoes"),
    validarEmbalagem: document.querySelector("#industriaValidarEmbalagem"),
  };

  // Verificar se campos obrigatórios foram encontrados
  if (!fields.razaoSocial) {
    console.error("Campo razaoSocial não encontrado");
  }
  if (!fields.cnpj) {
    console.error("Campo cnpj não encontrado");
  }

  console.log("Campos encontrados:", fields);

  let condicoesPagamento = [];
  let contatos = [];
  let tabelasPrecos = [];
  let selectedTabelaId = "";
  let editingIndustriaId =
    window.sessionStorage.getItem("oursales:editIndustria") || null;

  if (editingIndustriaId) {
    window.sessionStorage.removeItem("oursales:editIndustria");
  }

  // Elementos para tabelas de preços
  const novaTabelaNome = document.querySelector("#novaTabelaNome");
  const tabelaAdicionarBtn = document.querySelector("#tabelaAdicionar");
  const tabelasLista = document.querySelector("#tabelasLista");

  // Submit do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Formulário de indústria submetido");
    console.log("Campos:", fields);

    // Verificar se os campos obrigatórios estão preenchidos
    if (!fields.razaoSocial || !fields.razaoSocial.value.trim()) {
      window.alert("Por favor, preencha a Razão Social.");
      fields.razaoSocial?.focus();
      return;
    }

    if (!fields.cnpj || !fields.cnpj.value.trim()) {
      window.alert("Por favor, preencha o CNPJ.");
      fields.cnpj?.focus();
      return;
    }

    const data = {
      razaoSocial: fields.razaoSocial.value.trim(),
      nomeFantasia: fields.nomeFantasia.value.trim(),
      cnpj: fields.cnpj.value.trim(),
      inscricaoEstadual: fields.inscricaoEstadual.value.trim(),
      email: fields.email.value.trim(),
      comissao: Number.parseFloat(fields.comissao.value) || 0,
      pagamentoComissao: fields.pagamentoComissao.value,
      status: fields.status.value,
      logoURL: fields.logoURL.value.trim(),
      endereco: fields.endereco.value.trim(),
      bairro: fields.bairro.value.trim(),
      cep: fields.cep.value.trim(),
      cidade: fields.cidade.value.trim(),
      estado: fields.estado.value,
      telefone: fields.telefone.value.trim(),
      telefoneAdicional: fields.telefoneAdicional.value.trim(),
      observacoes: fields.observacoes.value.trim(),
      validarEmbalagem: fields.validarEmbalagem.checked,
      tabelasPrecos: tabelasPrecos,
      condicoesPagamento: condicoesPagamento,
      contatos: contatos,
      // Campos compatíveis com a versão antiga
      nome: fields.nomeFantasia.value.trim(),
    };

    console.log("Dados a serem salvos:", data);

    const API = window.oursalesAPI;
    if (!API) {
      window.alert("Erro: API não disponível. Recarregue a página.");
      return;
    }

    try {
      if (editingIndustriaId) {
        console.log("Editando indústria ID:", editingIndustriaId);
        await API.updateIndustria(editingIndustriaId, data);
        console.log("Indústria atualizada com sucesso");
        window.alert("Indústria atualizada com sucesso!");
      } else {
        console.log("Criando nova indústria");
        await API.createIndustria(data);
        console.log("Indústria criada com sucesso");
        window.alert("Indústria criada com sucesso!");
      }

      window.location.href = "industrias.html";
    } catch (error) {
      console.error("Erro ao salvar indústria:", error);
      console.error("Stack trace:", error.stack);
      window.alert(
        "Erro ao salvar indústria: " +
          error.message +
          ". Por favor, verifique o console para mais detalhes."
      );
    }
  });

  // Funções para Tabelas de Preços
  const renderTabelasPrecos = () => {
    if (!tabelasLista) return;

    if (tabelasPrecos.length === 0) {
      tabelasLista.innerHTML = `
        <tr>
          <td colspan="2" class="empty-state">
            Nenhuma tabela de preço cadastrada
          </td>
        </tr>
      `;
      return;
    }

    tabelasLista.innerHTML = tabelasPrecos
      .map(
        (tabela, index) => `
        <tr>
          <td>${tabela.nome}</td>
          <td style="text-align: center;">
            <button
              type="button"
              class="button-danger button-small"
              onclick="window.removeTabelaPreco(${index})"
            >
              Remover
            </button>
          </td>
        </tr>
      `
      )
      .join("");
  };

  const adicionarTabelaPreco = () => {
    const nome = novaTabelaNome?.value.trim();

    if (!nome) {
      window.alert("Preencha o nome da tabela.");
      return;
    }

    // Verificar se já existe uma tabela com esse nome
    const existeTabela = tabelasPrecos.some(
      (t) => t.nome.toLowerCase() === nome.toLowerCase()
    );
    if (existeTabela) {
      window.alert("Já existe uma tabela com esse nome.");
      return;
    }

    const novaTabela = {
      id: `tab-${Date.now()}`,
      nome: nome,
      produtos: [],
    };

    tabelasPrecos.push(novaTabela);
    renderTabelasPrecos();

    // Limpar campo
    novaTabelaNome.value = "";

    window.alert("Tabela de preço adicionada com sucesso!");
  };

  window.removeTabelaPreco = (index) => {
    if (window.confirm("Confirma remover esta tabela de preço?")) {
      tabelasPrecos.splice(index, 1);
      renderTabelasPrecos();
    }
  };

  // Event listeners para tabelas de preços
  tabelaAdicionarBtn?.addEventListener("click", adicionarTabelaPreco);

  // Permitir adicionar com Enter
  novaTabelaNome?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      adicionarTabelaPreco();
    }
  });

  // Inicialização
  if (editingIndustriaId) {
    const industria = storage
      .load()
      .industrias.find((item) => item.id === editingIndustriaId);
    if (industria) {
      formTitle.textContent = `🏭 Fornecedor - Editando ${
        industria.nomeFantasia || industria.nome
      }`;
      fields.razaoSocial.value = industria.razaoSocial || "";
      fields.nomeFantasia.value =
        industria.nomeFantasia || industria.nome || "";
      fields.cnpj.value = industria.cnpj || "";
      fields.inscricaoEstadual.value = industria.inscricaoEstadual || "";
      fields.email.value = industria.email || "";
      fields.comissao.value = industria.comissao || 0;
      fields.pagamentoComissao.value = industria.pagamentoComissao || "";
      fields.status.value = industria.status || "ativo";
      fields.logoURL.value = industria.logoURL || "";
      fields.endereco.value = industria.endereco || "";
      fields.bairro.value = industria.bairro || "";
      fields.cep.value = industria.cep || "";
      fields.cidade.value = industria.cidade || "";
      fields.estado.value = industria.estado || "";
      fields.telefone.value = industria.telefone || "";
      fields.telefoneAdicional.value = industria.telefoneAdicional || "";
      fields.observacoes.value = industria.observacoes || "";
      fields.validarEmbalagem.checked = industria.validarEmbalagem || false;

      // Carregar tabelas de preços
      if (industria.tabelasPrecos) {
        tabelasPrecos = [...industria.tabelasPrecos];
        renderTabelasPrecos();
      }

      // Carregar condições de pagamento
      if (industria.condicoesPagamento) {
        condicoesPagamento = [...industria.condicoesPagamento];
        renderCondicoesPagamento();
      }

      // Carregar contatos
      if (industria.contatos) {
        contatos = [...industria.contatos];
        renderContatos();
      }
    }
  }

  // Funções para Condições de Pagamento
  const renderCondicoesPagamento = () => {
    const tbody = document.querySelector("#condicoesPagamentoLista");
    if (!tbody) return;

    if (condicoesPagamento.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">
            Nenhuma condição de pagamento cadastrada
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = condicoesPagamento
      .map(
        (condicao, index) => `
        <tr>
          <td>${condicao.descricao}</td>
          <td>${condicao.parcelas}</td>
          <td>${condicao.intervalo}</td>
          <td>${condicao.desconto}</td>
          <td>${formatCurrency(condicao.pedidoMinimo)}</td>
          <td style="text-align: center;">
            <button
              type="button"
              class="button-danger button-small"
              onclick="window.removeCondicaoPagamento(${index})"
            >
              Remover
            </button>
          </td>
        </tr>
      `
      )
      .join("");
  };

  const adicionarCondicaoPagamentoBtn = document.querySelector(
    "#adicionarCondicaoPagamento"
  );
  adicionarCondicaoPagamentoBtn?.addEventListener("click", () => {
    const descricao = document
      .querySelector("#condicaoPagamentoDescricao")
      ?.value.trim();
    const parcelas =
      document.querySelector("#condicaoPagamentoParcelas")?.value || "1";
    const intervalo =
      document.querySelector("#condicaoPagamentoIntervalo")?.value || "0";
    const desconto =
      document.querySelector("#condicaoPagamentoDesconto")?.value || "0";
    const pedidoMinimo =
      document.querySelector("#condicaoPagamentoPedidoMinimo")?.value || "0";

    if (!descricao) {
      window.alert("Preencha a descrição da condição.");
      return;
    }

    condicoesPagamento.push({
      descricao,
      parcelas: Number.parseInt(parcelas),
      intervalo: Number.parseInt(intervalo),
      desconto: Number.parseFloat(desconto),
      pedidoMinimo: Number.parseFloat(pedidoMinimo),
    });

    renderCondicoesPagamento();

    // Limpar campos
    document.querySelector("#condicaoPagamentoDescricao").value = "";
    document.querySelector("#condicaoPagamentoParcelas").value = "";
    document.querySelector("#condicaoPagamentoIntervalo").value = "";
    document.querySelector("#condicaoPagamentoDesconto").value = "";
    document.querySelector("#condicaoPagamentoPedidoMinimo").value = "";
  });

  window.removeCondicaoPagamento = (index) => {
    if (window.confirm("Confirma remover esta condição de pagamento?")) {
      condicoesPagamento.splice(index, 1);
      renderCondicoesPagamento();
    }
  };

  // Funções para Contatos
  const renderContatos = () => {
    const tbody = document.querySelector("#contatosLista");
    if (!tbody) return;

    if (contatos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            Nenhum contato cadastrado
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = contatos
      .map(
        (contato, index) => `
        <tr>
          <td>${contato.nome}</td>
          <td>${contato.email}</td>
          <td>${contato.telefone}</td>
          <td>${
            contato.aniversario
              ? new Date(contato.aniversario).toLocaleDateString("pt-BR")
              : "-"
          }</td>
          <td style="text-align: center;">
            <button
              type="button"
              class="button-danger button-small"
              onclick="window.removeContato(${index})"
            >
              Remover
            </button>
          </td>
        </tr>
      `
      )
      .join("");
  };

  const adicionarContatoBtn = document.querySelector("#adicionarContato");
  adicionarContatoBtn?.addEventListener("click", () => {
    const nome = document.querySelector("#contatoNome")?.value.trim();
    const email = document.querySelector("#contatoEmail")?.value.trim();
    const telefone = document.querySelector("#contatoTelefone")?.value.trim();
    const aniversario = document.querySelector("#contatoAniversario")?.value;

    if (!nome || !email || !telefone) {
      window.alert("Preencha nome, e-mail e telefone do contato.");
      return;
    }

    contatos.push({
      nome,
      email,
      telefone,
      aniversario: aniversario || null,
    });

    renderContatos();

    // Limpar campos
    document.querySelector("#contatoNome").value = "";
    document.querySelector("#contatoEmail").value = "";
    document.querySelector("#contatoTelefone").value = "";
    document.querySelector("#contatoAniversario").value = "";
  });

  window.removeContato = (index) => {
    if (window.confirm("Confirma remover este contato?")) {
      contatos.splice(index, 1);
      renderContatos();
    }
  };

  renderTabelasPrecos();
  renderCondicoesPagamento();
  renderContatos();
}

function initProdutosPage() {
  const form = document.querySelector("#produtoForm");
  // Não retornar cedo - a página de listagem não tem formulário
  // if (!form) return;

  const overlay = document.querySelector("#produtoOverlay");
  const drawer = document.querySelector("#produtoDrawer");
  const titleEl = document.querySelector("#produtoDrawerTitulo");
  const descEl = document.querySelector("#produtoDrawerDescricao");
  const openBtn = document.querySelector("#produtoCriar");
  const editBtn = document.querySelector("#produtoEditar");
  const importBtn = document.querySelector("#produtoImportar");
  const removeBtn = document.querySelector("#produtoRemover");
  const closeBtn = document.querySelector("#produtoDrawerFechar");
  const cancelBtn = document.querySelector("#produtoCancelar");
  const submitBtn = form.querySelector('button[type="submit"]');
  const listContainer = document.querySelector("#produtosLista");

  // Elementos para drawer de importação
  const importProdutosOverlay = document.querySelector(
    "#importProdutosOverlay"
  );
  const importProdutosDrawer = document.querySelector("#importProdutosDrawer");
  const importProdutosCloseBtn = document.querySelector(
    "#importProdutosDrawerFechar"
  );
  const importProdutosCancelBtn = document.querySelector(
    "#importProdutosCancelar"
  );
  const importProdutosForm = document.querySelector("#importProdutosForm");
  const importIndustriaSelect = document.querySelector("#importIndustria");
  const importTabelaPrecoSelect = document.querySelector("#importTabelaPreco");
  const produtosImportacaoLista = document.querySelector(
    "#produtosImportacaoLista"
  );

  const fields = {
    id: document.querySelector("#produtoId"),
    nome: document.querySelector("#produtoNome"),
    sku: document.querySelector("#produtoSKU"),
    categoria: document.querySelector("#produtoCategoria"),
    preco: document.querySelector("#produtoPreco"),
    estoque: document.querySelector("#produtoEstoque"),
    descricao: document.querySelector("#produtoDescricao"),
  };

  let selectedId = "";

  const updateActionsState = () => {
    const hasSelection = Boolean(selectedId);
    if (editBtn) editBtn.disabled = !hasSelection;
    if (removeBtn) removeBtn.disabled = !hasSelection;
  };

  // Event listener para botão criar - funciona mesmo sem formulário
  if (openBtn) {
    console.log("✅ Botão produtoCriar encontrado, adicionando listener");
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("✅ Click no botão produtoCriar detectado");
      window.location.href = "produto-form.html";
    });
  } else {
    console.error("❌ Botão #produtoCriar não encontrado!");
  }

  // Só processar formulário se ele existir (página produto-form.html)
  if (form) {
    const clearForm = () => {
      form.reset();
      if (fields.id) fields.id.value = "";
    };

    const closeForm = () => {
      clearForm();
      if (drawer && overlay) hideDrawer(drawer, overlay);
    };

    // Event listeners condicionais - só adicionar se os elementos existirem
    if (overlay) overlay.addEventListener("click", closeForm);
    if (closeBtn) closeBtn.addEventListener("click", closeForm);
    if (cancelBtn) cancelBtn.addEventListener("click", closeForm);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const id = fields.id ? fields.id.value : "";
      const preco = Number.parseFloat(fields.preco ? fields.preco.value : 0);
      const estoque = Number.parseInt(
        fields.estoque ? fields.estoque.value : 0,
        10
      );

      if (!Number.isFinite(preco) || preco < 0) {
        window.alert("Informe um preço válido.");
        return;
      }

      if (!Number.isFinite(estoque) || estoque < 0) {
        window.alert("Informe o estoque disponível.");
        return;
      }

      const data = {
        nome: fields.nome ? fields.nome.value.trim() : "",
        sku: fields.sku ? fields.sku.value.trim() : "",
        categoria: fields.categoria ? fields.categoria.value.trim() : "",
        preco,
        estoque,
        descricao: fields.descricao ? fields.descricao.value.trim() : "",
      };

      if (!data.nome || !data.sku) {
        window.alert("Preencha nome e SKU do produto.");
        return;
      }

      if (id) {
        storage.update((draft) => {
          const produto = draft.produtos.find((item) => item.id === id);
          if (!produto) return;
          Object.assign(produto, data);
          draft.produtos.sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
          );
        });
        selectedId = id;
      } else {
        let createdId = "";
        storage.update((draft) => {
          const novo = { id: generateId("pro"), ...data };
          draft.produtos.push(novo);
          draft.produtos.sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
          );
          createdId = novo.id;
        });
        selectedId = createdId;
      }

      closeForm();
      if (typeof render === "function") render();
    });
  }

  // Event listeners para importação (funcionam independente do formulário)
  // Botão de importar agora redireciona para configurações via onclick no HTML
  // importBtn?.addEventListener("click", () => {
  //   window.location.href = "configuracoes.html#importar-produtos";
  // });
  importBtn?.addEventListener("click", () => {
    window.location.href = "importar-produtos.html";
  });

  importProdutosOverlay?.addEventListener("click", () => {
    hideDrawer(importProdutosDrawer, importProdutosOverlay);
  });
  importProdutosCloseBtn?.addEventListener("click", () => {
    hideDrawer(importProdutosDrawer, importProdutosOverlay);
  });
  importProdutosCancelBtn?.addEventListener("click", () => {
    hideDrawer(importProdutosDrawer, importProdutosOverlay);
  });

  importIndustriaSelect?.addEventListener("change", (e) => {
    carregarTabelasPrecosParaImportacao(e.target.value);
    carregarProdutosParaImportacao("");
  });

  importTabelaPrecoSelect?.addEventListener("change", (e) => {
    carregarProdutosParaImportacao(e.target.value);
  });

  importProdutosForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const industriaId = importIndustriaSelect.value;
    const tabelaId = importTabelaPrecoSelect.value;
    const importarTodos = document.querySelector(
      "#importarTodosProdutos"
    ).checked;
    const precoPadrao =
      parseFloat(document.querySelector("#precoPadraoImportacao").value) || 100;

    if (!industriaId || !tabelaId) {
      window.alert("Selecione uma indústria e tabela de preços.");
      return;
    }

    try {
      const tabela = getTabelaPreco(tabelaId);
      if (!tabela || !tabela.produtos) {
        window.alert("Nenhum produto encontrado na tabela selecionada.");
        return;
      }

      let produtosParaImportar = [];

      if (importarTodos) {
        produtosParaImportar = tabela.produtos.map((item) => ({
          ...item.produto,
          precoVenda: item.preco * (precoPadrao / 100),
          industriaId: industriaId,
        }));
      } else {
        const checkboxes = document.querySelectorAll(
          'input[name="produtoImportacao"]:checked'
        );
        if (checkboxes.length === 0) {
          window.alert("Selecione pelo menos um produto para importar.");
          return;
        }

        produtosParaImportar = Array.from(checkboxes).map((checkbox) => {
          const item = tabela.produtos.find(
            (p) => p.produto.id === checkbox.value
          );
          return {
            ...item.produto,
            precoVenda: item.preco * (precoPadrao / 100),
            industriaId: industriaId,
          };
        });
      }

      // Adicionar produtos ao catálogo geral
      storage.update((draft) => {
        produtosParaImportar.forEach((produto) => {
          const produtoExistente = draft.produtos.find(
            (p) => p.sku === produto.sku
          );
          if (!produtoExistente) {
            draft.produtos.push({
              id: generateId("pro"),
              ...produto,
            });
          }
        });
      });

      hideDrawer(importProdutosDrawer, importProdutosOverlay);
      render();
      window.alert(
        `${produtosParaImportar.length} produto(s) importado(s) com sucesso!`
      );
    } catch (error) {
      console.error("Erro ao importar produtos:", error);
      window.alert("Erro ao importar produtos.");
    }
  });

  removeBtn?.addEventListener("click", async () => {
    if (!selectedId) {
      window.alert("Selecione um produto para remover.");
      return;
    }

    if (!window.confirm("Confirma remover este produto do catálogo?")) {
      return;
    }

    try {
      const API = window.oursalesAPI;
      if (API) {
        await API.deleteProduto(selectedId);
      } else {
        storage.update((draft) => {
          draft.produtos = draft.produtos.filter(
            (produto) => produto.id !== selectedId
          );
        });
      }
      selectedId = "";
      await render();
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      window.alert(
        "Erro ao remover produto: " + (error.message || "Erro desconhecido")
      );
    }
  });

  listContainer?.addEventListener("change", (event) => {
    const input = event.target.closest(
      'input[type="radio"][name="produtoSelecionado"]'
    );
    if (!input) return;
    selectedId = input.value;
    syncSelection(listContainer, "produtoSelecionado", selectedId);
    updateActionsState();
  });

  listContainer?.addEventListener("change", (event) => {
    const input = event.target.closest(
      'input[type="checkbox"][name="produtoSelecionado"]'
    );
    if (!input) return;

    // Atualizar seleção
    const checkedBoxes = listContainer.querySelectorAll(
      'input[type="checkbox"][name="produtoSelecionado"]:checked'
    );
    if (checkedBoxes.length === 1) {
      selectedId = checkedBoxes[0].value;
    } else if (checkedBoxes.length === 0) {
      selectedId = "";
    }

    syncSelection(listContainer, "produtoSelecionado", selectedId);
    updateActionsState();
  });

  editBtn?.addEventListener("click", () => {
    if (!validateSingleSelection("edit")) {
      return;
    }
    const checkedBoxes = listContainer.querySelectorAll(
      'input[type="checkbox"][name="produtoSelecionado"]:checked'
    );
    selectedId = checkedBoxes[0].value;
    window.sessionStorage.setItem("oursales:editProduto", selectedId);
    window.location.href = "produto-form.html";
  });

  async function render() {
    // Carregar produtos da API ou localStorage
    let produtos = [];
    try {
      const API = window.oursalesAPI;
      if (API) {
        const response = await API.getProdutos();
        produtos = Array.isArray(response) ? response : response.data || [];
      } else {
        produtos = storage.load().produtos;
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      produtos = storage.load().produtos;
    }

    if (selectedId && !produtos.some((produto) => produto.id === selectedId)) {
      selectedId = "";
    }

    if (!produtos.length) {
      listContainer.innerHTML =
        '<div class="empty-state">Nenhum produto cadastrado.</div>';
      updateActionsState();
      return;
    }

    // Obter colunas personalizadas
    const customColumns = getCustomColumns("produtos");
    const allColumns = [
      "descricao",
      "categoria",
      "preco",
      "estoque",
      "sku",
      "marca",
    ];
    const visibleColumns =
      customColumns.length > 0 ? customColumns : allColumns;

    const linhas = produtos
      .map((produto) => {
        let rowContent = `
          <tr class="table-row${
            produto.id === selectedId ? " is-selected" : ""
          }" data-id="${produto.id}">
            <td class="select-cell">
              <label class="select-radio">
                <input type="checkbox" name="produtoSelecionado" value="${
                  produto.id
                }" />
              </label>
            </td>`;

        // Renderizar colunas dinamicamente
        visibleColumns.forEach((column) => {
          let cellContent = "";
          switch (column) {
            case "descricao":
              // Nome do produto é usado como descrição
              cellContent = produto.descricao || produto.nome || "-";
              break;
            case "categoria":
              cellContent = produto.categoria || "-";
              break;
            case "preco":
              cellContent = formatCurrency(
                produto.preco || produto.precoVenda || 0
              );
              break;
            case "estoque":
              cellContent = produto.estoque || produto.estoqueAtual || 0;
              break;
            case "sku":
              cellContent = produto.sku || produto.codigo || "-";
              break;
            case "marca":
              cellContent = produto.marca || "-";
              break;
            case "fornecedor":
              cellContent = produto.fornecedor || "-";
              break;
            case "dataCadastro":
              cellContent = produto.dataCadastro
                ? new Date(produto.dataCadastro).toLocaleDateString("pt-BR")
                : "-";
              break;
            case "ultimaVenda":
              cellContent = produto.ultimaVenda
                ? new Date(produto.ultimaVenda).toLocaleDateString("pt-BR")
                : "-";
              break;
            default:
              cellContent = "-";
          }

          // Primeira coluna (descrição) não tem classe dynamic-column
          const className = column === "descricao" ? "" : "dynamic-column";
          rowContent += `<td class="${className}">${cellContent}</td>`;
        });

        rowContent += "</tr>";
        return rowContent;
      })
      .join("");

    // Construir cabeçalho dinamicamente
    const headerCells = visibleColumns
      .map((column) => {
        const labels = {
          nome: "Produto",
          categoria: "Categoria",
          preco: "Preço",
          estoque: "Estoque",
          descricao: "Descrição",
          sku: "SKU",
          marca: "Marca",
          fornecedor: "Fornecedor",
          dataCadastro: "Data Cadastro",
          ultimaVenda: "Última Venda",
        };
        return `<th>${labels[column] || column}</th>`;
      })
      .join("");

    listContainer.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="select-cell">
                <input type="checkbox" class="select-all-checkbox" title="Selecionar todos">
              </th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;

    syncSelection(listContainer, "produtoSelecionado", selectedId);
    updateActionsState();

    // Adicionar click nas linhas para seleção
    listContainer.querySelectorAll("tbody tr").forEach((row) => {
      row.style.cursor = "pointer";
      row.addEventListener("click", (e) => {
        if (
          e.target.closest('input[type="checkbox"]') ||
          e.target.closest("button")
        ) {
          return;
        }
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });

      // Double click para editar
      row.addEventListener("dblclick", (e) => {
        // Não editar se clicou no checkbox ou botão
        if (
          e.target.closest('input[type="checkbox"]') ||
          e.target.closest("button")
        ) {
          return;
        }

        const produtoId = row.getAttribute("data-id");
        if (produtoId) {
          // Selecionar o produto
          const checkbox = row.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event("change", { bubbles: true }));
          }
          // Aguardar um pouco para garantir que a seleção foi processada
          setTimeout(() => {
            window.sessionStorage.setItem("oursales:editProduto", produtoId);
            window.location.href = "produto-form.html";
          }, 100);
        }
      });
    });
  }

  render();
}

/**
 * Produto Form Page - Página separada para criar/editar produtos
 */
function initProdutoFormPage() {
  const form = document.querySelector("#produtoForm");
  if (!form) return;

  const formTitle = document.querySelector("#produtoFormTitle");

  const fields = {
    id: document.querySelector("#produtoId"),
    industria: document.querySelector("#produtoIndustria"),
    sku: document.querySelector("#produtoSKU"),
    nome: document.querySelector("#produtoNome"),
    precoVenda: document.querySelector("#produtoPrecoVenda"),
    ncm: document.querySelector("#produtoNCM"),
    precoPromocao: document.querySelector("#produtoPrecoPromocao"),
    cores: document.querySelector("#produtoCores"),
    marca: document.querySelector("#produtoMarca"),
    markup: document.querySelector("#produtoMarkup"),
    margemLucro: document.querySelector("#produtoMargemLucro"),
    precoCompra: document.querySelector("#produtoPrecoCompra"),
    custoMedio: document.querySelector("#produtoCustoMedio"),
    margemMinima: document.querySelector("#produtoMargemMinima"),
    margemSeguranca: document.querySelector("#produtoMargemSeguranca"),
    ipi: document.querySelector("#produtoIPI"),
    unidadeMedida: document.querySelector("#produtoUnidadeMedida"),
    embalagem: document.querySelector("#produtoEmbalagem"),
    observacoes: document.querySelector("#produtoObservacoes"),
    tabelaPreco: document.querySelector("#produtoTabelaPreco"),
    categoria: document.querySelector("#produtoCategoria"),
    status: document.querySelector("#produtoStatus"),
    altura: document.querySelector("#produtoAltura"),
    largura: document.querySelector("#produtoLargura"),
    comprimento: document.querySelector("#produtoComprimento"),
    codigoOriginal: document.querySelector("#produtoCodigoOriginal"),
    modelo: document.querySelector("#produtoModelo"),
    pesoLiquido: document.querySelector("#produtoPesoLiquido"),
    fatorCubagem: document.querySelector("#produtoFatorCubagem"),
    fotoURL: document.querySelector("#produtoFotoURL"),
  };

  let substituicoesTributarias = [];
  let editingProdutoId =
    window.sessionStorage.getItem("oursales:editProduto") || null;

  if (editingProdutoId) {
    window.sessionStorage.removeItem("oursales:editProduto");
  }

  // Carregar indústrias para o select
  function carregarIndustrias() {
    try {
      const industrias = getIndustrias();
      const selectIndustria = fields.industria;

      // Limpar opções existentes (exceto a primeira)
      selectIndustria.innerHTML = '<option value="">Selecione</option>';

      // Adicionar indústrias
      industrias.forEach((industria) => {
        const option = document.createElement("option");
        option.value = industria.id;
        option.textContent = industria.nomeFantasia || industria.razaoSocial;
        selectIndustria.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar indústrias:", error);
    }
  }

  // Carregar indústrias ao inicializar
  carregarIndustrias();

  // Carregar tabelas de preços conforme a indústria
  function carregarTabelasPrecos(industriaId, selectedTabelaId = "") {
    try {
      const selectTabela = fields.tabelaPreco;
      if (!selectTabela) return;

      // Reset opções
      selectTabela.innerHTML = '<option value="">Selecione</option>';

      if (!industriaId) return;

      const industria = getIndustrias().find((i) => i.id === industriaId);
      const tabelas = industria?.tabelasPrecos || [];

      tabelas
        .slice()
        .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"))
        .forEach((t) => {
          const option = document.createElement("option");
          option.value = t.id;
          option.textContent = t.nome;
          selectTabela.appendChild(option);
        });

      if (selectedTabelaId) {
        selectTabela.value = selectedTabelaId;
      }
    } catch (error) {
      console.error("Erro ao carregar tabelas de preços:", error);
    }
  }

  // Atualizar tabelas ao mudar a indústria
  fields.industria?.addEventListener("change", (e) => {
    carregarTabelasPrecos(e.target.value);
  });

  // Funções auxiliares
  const calcularPrecoVenda = () => {
    const precoCompra = Number.parseFloat(fields.precoCompra.value) || 0;
    const markup = Number.parseFloat(fields.markup.value) || 0;

    if (precoCompra > 0 && markup > 0) {
      const precoCalculado = precoCompra * markup;
      fields.precoVenda.value = precoCalculado.toFixed(2);
    }
  };

  const calcularPrecoVendaPorMargem = () => {
    const precoCompra = Number.parseFloat(fields.precoCompra.value) || 0;
    const margemLucro = Number.parseFloat(fields.margemLucro.value) || 0;

    if (precoCompra > 0 && margemLucro > 0) {
      const precoCalculado = precoCompra / (1 - margemLucro / 100);
      fields.precoVenda.value = precoCalculado.toFixed(2);
    }
  };

  const gerarCodigo = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    fields.sku.value = `PROD-${timestamp}-${random}`;
  };

  const renderSubstituicoesTributarias = () => {
    const tbody = document.querySelector("#produtoSTTbody");
    if (!tbody) return;

    if (substituicoesTributarias.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="empty-state">
            Nenhuma substituição tributária adicionada!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = substituicoesTributarias
      .map(
        (st, index) => `
        <tr>
          <td><strong>${st.estado || st.uf || ""}</strong></td>
          <td>${st.aliquota || st.percentual || 0}%</td>
          <td style="text-align: center;">
            <button
              type="button"
              class="button-danger button-small"
              onclick="window.removeST(${index})"
              title="Remover"
            >
              <i class="ti ti-trash"></i>
            </button>
          </td>
        </tr>
      `
      )
      .join("");
  };

  // Event Listeners para Cálculos
  const calcularBtn = document.querySelector("#calcularPrecoVenda");
  calcularBtn?.addEventListener("click", calcularPrecoVenda);

  const calcularMargemBtn = document.querySelector("#calcularPrecoVendaMargem");
  calcularMargemBtn?.addEventListener("click", calcularPrecoVendaPorMargem);

  const gerarCodigoBtn = document.querySelector("#gerarCodigo");
  gerarCodigoBtn?.addEventListener("click", gerarCodigo);

  // Elementos de input de ST
  const estadoInput = document.querySelector("#stEstado");
  const aliquotaInput = document.querySelector("#stAliquota");

  // Função para adicionar ST
  const adicionarST = () => {
    const estado = estadoInput?.value?.trim().toUpperCase();
    const aliquota = aliquotaInput?.value?.trim();

    if (!estado || !aliquota) {
      window.alert("Preencha a UF e a porcentagem da ST.");
      return;
    }

    if (estado.length !== 2) {
      window.alert("A UF deve ter 2 caracteres (ex: BA, SP, RJ).");
      return;
    }

    const aliquotaNum = Number.parseFloat(aliquota);
    if (isNaN(aliquotaNum) || aliquotaNum < 0 || aliquotaNum > 100) {
      window.alert("A porcentagem da ST deve ser um número entre 0 e 100.");
      return;
    }

    // Verificar se o estado já foi adicionado
    const jaExiste = substituicoesTributarias.some(
      (st) => (st.estado || st.uf || "").toUpperCase() === estado
    );
    if (jaExiste) {
      window.alert("Esta UF já possui substituição tributária cadastrada.");
      return;
    }

    substituicoesTributarias.push({
      estado: estado,
      uf: estado, // Compatibilidade
      aliquota: aliquotaNum,
      percentual: aliquotaNum, // Compatibilidade
    });

    renderSubstituicoesTributarias();

    // Limpar campos
    estadoInput.value = "";
    aliquotaInput.value = "";
    estadoInput.focus();
  };

  // Adicionar ST - Event Listeners
  const adicionarSTBtn = document.querySelector("#produtoSTAdicionar");
  adicionarSTBtn?.addEventListener("click", adicionarST);

  // Permitir adicionar com Enter
  estadoInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      aliquotaInput?.focus();
    }
  });

  aliquotaInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      adicionarST();
    }
  });

  // Função global para remover ST
  window.removeST = (index) => {
    if (window.confirm("Confirma remover esta substituição tributária?")) {
      substituicoesTributarias.splice(index, 1);
      renderSubstituicoesTributarias();
    }
  };

  // Submit do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      industriaId: fields.industria.value,
      sku: fields.sku.value.trim(),
      nome: fields.nome.value.trim(),
      precoVenda: Number.parseFloat(fields.precoVenda.value) || 0,
      ncm: fields.ncm?.value.trim() || "",
      precoPromocao: Number.parseFloat(fields.precoPromocao.value) || 0,
      cores: fields.cores?.value.trim() || "",
      marca: fields.marca?.value.trim() || "",
      markup: Number.parseFloat(fields.markup.value) || 0,
      margemLucro: Number.parseFloat(fields.margemLucro.value) || 0,
      precoCompra: Number.parseFloat(fields.precoCompra.value) || 0,
      custoMedio: fields.custoMedio?.value || "ultimo",
      margemMinima: Number.parseFloat(fields.margemMinima.value) || 0,
      margemSeguranca: Number.parseFloat(fields.margemSeguranca.value) || 0,
      ipi: Number.parseFloat(fields.ipi.value) || 0,
      unidadeMedida: fields.unidadeMedida?.value.trim() || "",
      embalagem: fields.embalagem?.value.trim() || "",
      observacoes: fields.observacoes?.value.trim() || "",
      tabelaPreco: fields.tabelaPreco?.value || "",
      categoria: fields.categoria?.value || "",
      status: fields.status.value,
      altura: Number.parseFloat(fields.altura.value) || 0,
      largura: Number.parseFloat(fields.largura.value) || 0,
      comprimento: Number.parseFloat(fields.comprimento.value) || 0,
      codigoOriginal: fields.codigoOriginal?.value.trim() || "",
      modelo: fields.modelo?.value.trim() || "",
      pesoLiquido: Number.parseFloat(fields.pesoLiquido.value) || 0,
      fatorCubagem: Number.parseFloat(fields.fatorCubagem.value) || 0,
      fotoURL: fields.fotoURL?.value.trim() || "",
      substituicoesTributarias: substituicoesTributarias,
      // Campos legados para compatibilidade
      preco: Number.parseFloat(fields.precoVenda.value) || 0,
      estoque: 0, // Campo não está no formulário, mas mantido para compatibilidade
      descricao: fields.observacoes?.value.trim() || "",
    };

    const API = window.oursalesAPI;
    if (!API) {
      window.alert("Erro: API não disponível. Recarregue a página.");
      return;
    }

    try {
      if (editingProdutoId) {
        await API.updateProduto(editingProdutoId, data);
        window.alert("Produto atualizado com sucesso!");
      } else {
        await API.createProduto(data);
        window.alert("Produto criado com sucesso!");
      }
      window.location.href = "produtos.html";
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      window.alert(
        `Erro ao salvar produto: ${error.message || "Erro desconhecido"}`
      );
    }
  });

  // Event listener para botão Personalizar Campos
  const personalizarBtn = document.querySelector("#personalizarCampos");
  personalizarBtn?.addEventListener("click", () => {
    // Simular personalização de campos
    const camposPersonalizaveis = [
      "NCM",
      "Código Original",
      "Modelo",
      "Peso Líquido",
      "Fator de Cubagem",
      "Altura",
      "Largura",
      "Comprimento",
      "Foto URL",
      "Substituições Tributárias",
    ];

    const camposSelecionados = camposPersonalizaveis.filter((campo) =>
      window.confirm(`Incluir campo "${campo}" no formulário?`)
    );

    if (camposSelecionados.length > 0) {
      window.alert(
        `Campos personalizados adicionados:\n${camposSelecionados.join("\n")}`
      );
    } else {
      window.alert("Nenhum campo personalizado foi selecionado.");
    }
  });

  // Inicialização
  if (editingProdutoId) {
    const produto = storage
      .load()
      .produtos.find((item) => item.id === editingProdutoId);
    if (produto) {
      formTitle.textContent = `📦 Produto - Editando ${produto.nome}`;
      fields.industria.value = produto.industria || produto.industriaId || "";
      // Carregar tabelas de preço da indústria e selecionar a do produto, se houver
      carregarTabelasPrecos(
        fields.industria.value,
        produto.tabelaPreco || produto.tabelaPrecoId || ""
      );

      fields.sku.value = produto.sku || "";
      fields.nome.value = produto.nome || "";
      fields.precoVenda.value = produto.precoVenda || produto.preco || 0;
      fields.ncm.value = produto.ncm || "";
      fields.precoPromocao.value = produto.precoPromocao || 0;
      fields.cores.value = produto.cores || "";
      fields.marca.value = produto.marca || "";
      fields.markup.value = produto.markup || 0;
      fields.margemLucro.value = produto.margemLucro || 0;
      fields.precoCompra.value = produto.precoCompra || 0;
      fields.custoMedio.value = produto.custoMedio || "ultimo";
      fields.margemMinima.value = produto.margemMinima || 0;
      fields.margemSeguranca.value = produto.margemSeguranca || 0;
      fields.ipi.value = produto.ipi || 0;
      fields.unidadeMedida.value = produto.unidadeMedida || "";
      fields.embalagem.value = produto.embalagem || "";
      fields.observacoes.value = produto.observacoes || produto.descricao || "";
      if (!fields.tabelaPreco.value && produto.tabelaPreco) {
        // fallback caso tenha sido salvo nome ao invés de id
        const ind = getIndustrias().find(
          (i) => i.id === fields.industria.value
        );
        const byName = ind?.tabelasPrecos?.find(
          (t) => t.nome === produto.tabelaPreco
        );
        if (byName) fields.tabelaPreco.value = byName.id;
      }

      fields.categoria.value = produto.categoria || "";
      fields.status.value = produto.status || "ativo";
      fields.altura.value = produto.altura || 0;
      fields.largura.value = produto.largura || 0;
      fields.comprimento.value = produto.comprimento || 0;
      fields.codigoOriginal.value = produto.codigoOriginal || "";
      fields.modelo.value = produto.modelo || "";
      fields.pesoLiquido.value = produto.pesoLiquido || 0;
      fields.fatorCubagem.value = produto.fatorCubagem || 0;
      fields.fotoURL.value = produto.fotoURL || "";

      // Carregar substituições tributárias
      if (produto.substituicoesTributarias) {
        substituicoesTributarias = [...produto.substituicoesTributarias];
        renderSubstituicoesTributarias();
      } else {
        // Tentar carregar ST-UF das observações ou da tabela de preços
        const stUfMatch = (
          produto.observacoes ||
          produto.descricao ||
          ""
        ).match(/ST-UF:\s*([A-Z]{2})/i);
        if (stUfMatch) {
          const uf = stUfMatch[1].toUpperCase();
          // Se encontrou ST-UF mas não tem substituições, criar uma entrada padrão
          if (substituicoesTributarias.length === 0) {
            substituicoesTributarias.push({
              estado: uf,
              uf: uf,
              aliquota: 0, // Será preenchido manualmente
              percentual: 0,
            });
            renderSubstituicoesTributarias();
          }
        }

        // Verificar se há ST na tabela de preços
        if (produto.tabelaPrecoId || produto.tabelaPreco) {
          const data = storage.load();
          const industrias = data.industrias || [];
          const industria = industrias.find(
            (i) => i.id === produto.industriaId
          );

          if (industria && industria.tabelasPrecos) {
            const tabelaPreco = industria.tabelasPrecos.find(
              (t) => t.id === (produto.tabelaPrecoId || produto.tabelaPreco)
            );

            if (tabelaPreco && tabelaPreco.produtos) {
              const produtoTabela = tabelaPreco.produtos.find(
                (p) =>
                  p.produtoId === produto.id || p.produto?.id === produto.id
              );

              if (produtoTabela && produtoTabela.observacoes) {
                // Extrair ST-UF das observações da tabela de preços
                const stUfTabelaMatch =
                  produtoTabela.observacoes.match(/ST-UF:\s*([A-Z]{2})/i);
                if (stUfTabelaMatch) {
                  const ufTabela = stUfTabelaMatch[1].toUpperCase();
                  // Verificar se já não existe
                  const jaExiste = substituicoesTributarias.some(
                    (st) =>
                      (st.estado || st.uf || "").toUpperCase() === ufTabela
                  );
                  if (!jaExiste) {
                    substituicoesTributarias.push({
                      estado: ufTabela,
                      uf: ufTabela,
                      aliquota: 0, // Será preenchido manualmente
                      percentual: 0,
                    });
                    renderSubstituicoesTributarias();
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  renderSubstituicoesTributarias();
}

function initOrcamentosPage() {
  const openBtn = document.querySelector("#orcamentoCriar");
  const editBtn = document.querySelector("#orcamentoEditar");
  const removeBtn = document.querySelector("#orcamentoRemover");
  const listContainer = document.querySelector("#orcamentosLista");

  let selectedId = "";

  const updateActionsState = () => {
    const hasSelection = Boolean(selectedId);
    if (editBtn) editBtn.disabled = !hasSelection;
    if (removeBtn) removeBtn.disabled = !hasSelection;
  };

  // Event Listeners
  if (openBtn) {
    console.log("✅ Botão orcamentoCriar encontrado, adicionando listener");
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("✅ Click no botão orcamentoCriar detectado");
      window.location.href = "orcamento-form.html";
    });
  } else {
    console.error("❌ Botão #orcamentoCriar não encontrado!");
  }

  editBtn?.addEventListener("click", () => {
    if (!validateSingleSelection("edit")) {
      return;
    }
    const checkedBoxes = listContainer.querySelectorAll(
      'input[type="checkbox"][name="orcamentoSelecionado"]:checked'
    );
    selectedId = checkedBoxes[0].value;
    window.sessionStorage.setItem("oursales:editOrcamento", selectedId);
    window.location.href = "orcamento-form.html";
  });

  removeBtn?.addEventListener("click", async () => {
    if (!selectedId) {
      window.alert("Selecione um orçamento para remover.");
      return;
    }
    if (!window.confirm("Confirma remover este orçamento?")) {
      return;
    }

    try {
      const API = window.oursalesAPI;
      if (API) {
        await API.deleteOrcamento(selectedId);
      } else {
        storage.update((draft) => {
          draft.orcamentos = draft.orcamentos.filter(
            (item) => item.id !== selectedId
          );
        });
      }
      selectedId = "";
      await render();
    } catch (error) {
      console.error("Erro ao remover orçamento:", error);
      window.alert(
        "Erro ao remover orçamento: " + (error.message || "Erro desconhecido")
      );
    }
  });

  listContainer?.addEventListener("change", (event) => {
    const input = event.target.closest(
      'input[type="checkbox"][name="orcamentoSelecionado"]'
    );
    if (!input) return;

    // Atualizar seleção
    const checkedBoxes = listContainer.querySelectorAll(
      'input[type="checkbox"][name="orcamentoSelecionado"]:checked'
    );
    if (checkedBoxes.length === 1) {
      selectedId = checkedBoxes[0].value;
    } else if (checkedBoxes.length === 0) {
      selectedId = "";
    }

    syncSelection(listContainer, "orcamentoSelecionado", selectedId);
    updateActionsState();
  });

  listContainer?.addEventListener("click", (event) => {
    const listItem = event.target.closest(".list-item");
    if (!listItem) return;

    const orcamentoId = listItem.dataset.id;
    if (!orcamentoId) return;

    // Encontrar o radio button correspondente e fazer toggle
    const radioButton = listItem.querySelector(
      'input[type="radio"][name="orcamentoSelecionado"]'
    );
    if (radioButton) {
      // Toggle: se já está selecionado, desmarcar
      if (selectedId === orcamentoId) {
        radioButton.checked = false;
        selectedId = "";
      } else {
        radioButton.checked = true;
        selectedId = orcamentoId;
      }
      syncSelection(listContainer, "orcamentoSelecionado", selectedId);
      updateActionsState();
    }
  });

  async function render() {
    // Carregar orçamentos da API ou localStorage
    let orcamentos = [];
    try {
      const API = window.oursalesAPI;
      if (API) {
        const response = await API.getOrcamentos();
        orcamentos = Array.isArray(response) ? response : response.data || [];
      } else {
        orcamentos = storage.load().orcamentos;
      }
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
      orcamentos = storage.load().orcamentos;
    }

    if (selectedId && !orcamentos.some((item) => item.id === selectedId)) {
      selectedId = "";
    }

    if (!orcamentos.length) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <h3>Nenhum orçamento registrado</h3>
          <p>Clique em "Novo orçamento" para começar.</p>
        </div>
      `;
      updateActionsState();
      return;
    }

    // Obter colunas personalizadas
    const customColumns = getCustomColumns("orcamentos");
    const allColumns = [
      "cliente",
      "valorSemImposto",
      "valorComImposto",
      "validade",
      "observacoes",
      "status",
    ];
    const visibleColumns =
      customColumns.length > 0 ? customColumns : allColumns;

    const linhas = orcamentos
      .map((orcamento) => {
        let rowContent = `
          <tr class="table-row${
            orcamento.id === selectedId ? " is-selected" : ""
          }" data-id="${orcamento.id}">
            <td class="select-cell">
              <label class="select-radio">
                <input type="checkbox" name="orcamentoSelecionado" value="${
                  orcamento.id
                }" />
              </label>
            </td>`;

        // Renderizar colunas dinamicamente
        visibleColumns.forEach((column) => {
          let cellContent = "";
          switch (column) {
            case "cliente":
              cellContent = orcamento.clienteNome || "-";
              break;
            case "valorSemImposto":
              cellContent = formatCurrency(
                orcamento.valorSemImposto || orcamento.valor || 0
              );
              break;
            case "valorComImposto":
              cellContent = formatCurrency(
                orcamento.valorComImposto || orcamento.valor || 0
              );
              break;
            case "validade":
              cellContent = orcamento.validade
                ? new Date(orcamento.validade).toLocaleDateString("pt-BR")
                : "-";
              break;
            case "observacoes":
              cellContent = orcamento.observacoes || "-";
              break;
            case "status":
              cellContent = `<span class="status ${
                orcamento.status === "ativo" ? "active" : "inactive"
              }">${orcamento.status === "ativo" ? "Ativo" : "Inativo"}</span>`;
              break;
            case "dataCriacao":
              cellContent = orcamento.dataCriacao
                ? new Date(orcamento.dataCriacao).toLocaleDateString("pt-BR")
                : "-";
              break;
            case "vendedor":
              cellContent = orcamento.vendedor || "-";
              break;
            case "desconto":
              cellContent = orcamento.desconto ? `${orcamento.desconto}%` : "-";
              break;
            case "prazoEntrega":
              cellContent = orcamento.prazoEntrega || "-";
              break;
            default:
              cellContent = "-";
          }

          const className = column === "cliente" ? "" : "dynamic-column";
          rowContent += `<td class="${className}">${cellContent}</td>`;
        });

        rowContent += "</tr>";
        return rowContent;
      })
      .join("");

    // Construir cabeçalho dinamicamente
    const headerCells = visibleColumns
      .map((column) => {
        const labels = {
          cliente: "Cliente",
          valorSemImposto: "Valor Sem Imposto",
          valorComImposto: "Valor Com Imposto",
          validade: "Validade",
          observacoes: "Observações",
          status: "Status",
          dataCriacao: "Data Criação",
          vendedor: "Vendedor",
          desconto: "Desconto",
          prazoEntrega: "Prazo Entrega",
        };
        return `<th>${labels[column] || column}</th>`;
      })
      .join("");

    listContainer.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="select-cell">
                <input type="checkbox" class="select-all-checkbox" title="Selecionar todos">
              </th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;

    syncSelection(listContainer, "orcamentoSelecionado", selectedId);
    updateActionsState();

    // Adicionar click nas linhas para seleção
    listContainer.querySelectorAll("tbody tr").forEach((row) => {
      row.style.cursor = "pointer";
      row.addEventListener("click", (e) => {
        if (
          e.target.closest('input[type="checkbox"]') ||
          e.target.closest("button")
        ) {
          return;
        }
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });

      // Double click para editar
      row.addEventListener("dblclick", (e) => {
        // Não editar se clicou no checkbox ou botão
        if (
          e.target.closest('input[type="checkbox"]') ||
          e.target.closest("button")
        ) {
          return;
        }

        const orcamentoId = row.getAttribute("data-id");
        if (orcamentoId) {
          // Selecionar o orçamento
          const checkbox = row.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event("change", { bubbles: true }));
          }
          // Aguardar um pouco para garantir que a seleção foi processada
          setTimeout(() => {
            window.sessionStorage.setItem(
              "oursales:editOrcamento",
              orcamentoId
            );
            window.location.href = "orcamento-form.html";
          }, 100);
        }
      });
    });
  }

  // Inicialização
  render();
}

/**
 * Orçamento Form Page - Página separada para criar/editar orçamentos
 */
function initOrcamentoFormPage() {
  // Garantir que o scroll não esteja bloqueado (limpeza de resquícios do modal)
  // MAS NÃO resetar scroll position aqui para evitar problemas
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.margin = "";
  document.body.style.padding = "";

  const form = document.querySelector("#orcamentoForm");
  if (!form) return;

  const formTitle = document.querySelector("#orcamentoFormTitle");

  const fields = {
    id: document.querySelector("#orcamentoId"),
    cliente: document.querySelector("#orcamentoCliente"),
    comprador: document.querySelector("#orcamentoComprador"),
    transportadora: document.querySelector("#orcamentoTransportadora"),
    tipoFrete: document.querySelector("#orcamentoTipoFrete"),
    data: document.querySelector("#orcamentoData"),
    validade: document.querySelector("#orcamentoValidade"),
    previsaoEntrega: document.querySelector("#orcamentoPrevisaoEntrega"),
    notaFiscal: document.querySelector("#orcamentoNotaFiscal"),
    descricao: document.querySelector("#orcamentoDescricao"),
    cancelado: document.querySelector("#orcamentoCancelado"),
    ordemCompra: document.querySelector("#orcamentoOrdemCompra"),
    status: document.querySelector("#orcamentoStatus"),
    vendedor: document.querySelector("#orcamentoVendedor"),
    observacoes: document.querySelector("#orcamentoObservacoes"),
    condicaoPagamento: document.querySelector("#orcamentoCondicaoPagamento"),
    observacaoPrivada: document.querySelector("#orcamentoObservacaoPrivada"),
    valorFrete: document.querySelector("#valorFrete"),
    valorAcrescimo: document.querySelector("#valorAcrescimo"),
    valorDesconto: document.querySelector("#valorDesconto"),
  };

  let orcamentoItens = [];
  // Tornar acessível globalmente
  window.orcamentoItens = orcamentoItens;
  let editingOrcamentoId =
    window.sessionStorage.getItem("oursales:editOrcamento") || null;

  if (editingOrcamentoId) {
    window.sessionStorage.removeItem("oursales:editOrcamento");
  }

  // Funções auxiliares
  const refreshSelects = () => {
    fillClientesSelect(fields.cliente);
    fillTransportadorasSelect(fields.transportadora);
  };

  // Renderizar itens do orçamento
  function renderOrcamentoItens() {
    const tbody = document.querySelector("#orcamentoItensList");
    if (!tbody) return;

    if (orcamentoItens.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            Nenhum produto adicionado neste orçamento!
          </td>
        </tr>
      `;
      calculateTotals();
      return;
    }

    tbody.innerHTML = orcamentoItens
      .map((item, index) => {
        // Calcular preço da tabela dinâmico
        // Prioridade: descontos específicos do item + descontos aplicados dos quadrados > descontos do modal > preço original
        let precoTabelaDinamico = item.precoTabela || 0;

        // Descontos específicos do item (formato: [5, 3, 0, 0, 0, 0, 0] -> "5+3+0+0+0+0+0")
        const descontosItem = item.descontosItem || [0, 0, 0, 0, 0, 0, 0];
        const descontosItemTexto = descontosItem.join("+");
        const temDescontosItem = descontosItem.some((d) => d !== 0);

        // Se há descontos específicos do item ou descontos aplicados dos quadrados, recalcular
        const temDescontosQuadrados =
          item.descontosAplicados && item.descontosAplicados.length > 0;
        const temDescontosModal = item.descontos && item.descontos.length > 0;

        if (temDescontosItem || temDescontosQuadrados || temDescontosModal) {
          precoTabelaDinamico = item.precoComDesconto || precoTabelaDinamico;
        }

        // Observação específica do item
        const observacaoItem = item.observacaoItem || "";
        const temObservacao = observacaoItem.trim().length > 0;

        return `
        <tr>
          <td></td>
          <td style="position: relative; vertical-align: top;">
            <div style="margin-bottom: 4px;">
              <button 
                type="button" 
                onclick="window.editarDescontosItemOrcamento && window.editarDescontosItemOrcamento(${index})"
                style="background: ${
                  temDescontosItem ? "#3b82f6" : "#f3f4f6"
                }; color: ${
          temDescontosItem ? "white" : "#6b7280"
        }; border: 1px solid ${
          temDescontosItem ? "#3b82f6" : "#d1d5db"
        }; cursor: pointer; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;"
                title="Editar descontos específicos do item"
              >
                ${temDescontosItem ? descontosItemTexto : "0+0+0+0+0+0+0"}
              </button>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              ${item.codigo || "-"}
              <button 
                type="button" 
                onclick="window.abrirObservacaoItemOrcamento && window.abrirObservacaoItemOrcamento(${index})"
                style="background: none; border: none; cursor: pointer; padding: 2px; font-size: 14px; color: ${
                  temObservacao ? "#dc2626" : "#6b7280"
                };"
                title="${
                  temObservacao ? "Editar observação" : "Adicionar observação"
                }"
              >
                💬
              </button>
            </div>
            ${
              temObservacao
                ? `
              <div style="color: #dc2626; font-size: 12px; margin-top: 4px; padding: 4px; background: rgba(220, 38, 38, 0.1); border-radius: 4px; word-break: break-word; white-space: normal; line-height: 1.4;">
                ${observacaoItem}
              </div>
            `
                : ""
            }
          </td>
          <td style="vertical-align: top;">${item.produtoNome || "-"}</td>
          <td style="vertical-align: top;">${formatCurrency(
            precoTabelaDinamico
          )}</td>
          <td style="vertical-align: top;">${formatCurrency(
            item.precoFinal || 0
          )}</td>
          <td style="vertical-align: top;">
            <input type="number" min="0" step="0.01" value="${
              item.quantidade || 1
            }" 
                   style="width: 80px; padding: 4px;" 
                   onchange="window.atualizarQuantidadeItemOrcamento && window.atualizarQuantidadeItemOrcamento(${index}, this.value)">
          </td>
          <td style="vertical-align: top;">${formatCurrency(
            (item.precoFinal || 0) * (item.quantidade || 0)
          )}</td>
          <td style="vertical-align: top;">
            <button type="button" onclick="window.removerItemOrcamento && window.removerItemOrcamento(${index})" 
                    style="background: var(--danger-500); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
              <i class="ti ti-trash"></i>
            </button>
          </td>
        </tr>
      `;
      })
      .join("");
    calculateTotals();
  }

  // Tornar renderOrcamentoItens acessível globalmente
  window.renderOrcamentoItens = renderOrcamentoItens;

  window.atualizarQuantidadeItemOrcamento = function (index, quantidade) {
    orcamentoItens[index].quantidade = parseFloat(quantidade) || 0;
    // Recalcular totais do item
    const item = orcamentoItens[index];
    item.total = item.precoComDesconto * item.quantidade;
    item.totalBruto = item.precoFinal * item.quantidade;
    // Sincronizar com window.orcamentoItens
    window.orcamentoItens = orcamentoItens;
    renderOrcamentoItens();
    calculateTotals();
  };

  window.removerItemOrcamento = function (index) {
    orcamentoItens.splice(index, 1);
    // Sincronizar com window.orcamentoItens
    window.orcamentoItens = orcamentoItens;
    renderOrcamentoItens();
    calculateTotals();
  };

  window.abrirObservacaoItemOrcamento = function (index) {
    const item = orcamentoItens[index];
    const observacaoAtual = item.observacaoItem || "";
    const novaObservacao = window.prompt(
      "Observação específica do item:",
      observacaoAtual
    );

    if (novaObservacao !== null) {
      item.observacaoItem = novaObservacao.trim();
      // Sincronizar com window.orcamentoItens
      window.orcamentoItens = orcamentoItens;
      renderOrcamentoItens();
    }
  };

  window.editarDescontosItemOrcamento = function (index) {
    const item = orcamentoItens[index];
    const precoTabela = item.precoTabela || 0;
    const descontosGerais = item.descontosAplicados || [];
    const descontosItemAtuais = item.descontosItem || [0, 0, 0, 0, 0, 0, 0];

    // Criar overlay
    const overlay = document.createElement("div");
    overlay.id = "descontosItemOverlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Criar modal
    const modal = document.createElement("div");
    modal.id = "descontosItemModal";
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      z-index: 10001;
    `;

    // Obter descontos gerais do pedido (dos quadrados ou do modal)
    let descontosGeraisTexto =
      descontosGerais.length > 0
        ? descontosGerais.join("+")
        : item.descontos && item.descontos.length > 0
        ? item.descontos.join("+")
        : "Nenhum desconto geral aplicado";

    // Calcular preço com descontos gerais
    let precoComDescontosGerais = precoTabela;
    if (descontosGerais.length > 0) {
      descontosGerais.forEach((desc) => {
        if (desc > 0) {
          precoComDescontosGerais = precoComDescontosGerais * (1 - desc / 100);
        } else if (desc < 0) {
          precoComDescontosGerais =
            precoComDescontosGerais * (1 + Math.abs(desc) / 100);
        }
      });
    } else if (item.descontos && item.descontos.length > 0) {
      item.descontos.forEach((desc) => {
        if (desc > 0) {
          precoComDescontosGerais = precoComDescontosGerais * (1 - desc / 100);
        } else if (desc < 0) {
          precoComDescontosGerais =
            precoComDescontosGerais * (1 + Math.abs(desc) / 100);
        }
      });
    }

    modal.innerHTML = `
      <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #1f2937;">
          Descontos Específicos do Item
        </h2>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">
          ${item.produtoNome || item.codigo || "Item"}
        </p>
      </div>
      
      <div style="padding: 24px;">
        <div style="margin-bottom: 24px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Descontos Gerais do Pedido:</div>
          <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${descontosGeraisTexto}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">
            Preço com descontos gerais: ${formatCurrency(
              precoComDescontosGerais
            )}
          </div>
        </div>
        
        <div style="margin-bottom: 24px;">
          <label style="display: block; font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 12px;">
            Descontos Específicos do Item (%)
          </label>
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">
            ${[1, 2, 3, 4, 5, 6, 7]
              .map(
                (i) => `
              <div>
                <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">Desc ${i}</label>
                <input type="number" id="itemDesc${i}" step="0.01" placeholder="0" 
                       value="${descontosItemAtuais[i - 1] || ""}"
                       style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" />
              </div>
            `
              )
              .join("")}
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
            Use valores positivos para desconto e negativos para acréscimo
          </div>
        </div>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Preço Original</div>
              <div style="font-size: 18px; font-weight: 600; color: #1f2937;">${formatCurrency(
                precoTabela
              )}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Preço com Descontos</div>
              <div id="precoComDescontosItem" style="font-size: 18px; font-weight: 600; color: #059669;">${formatCurrency(
                precoComDescontosGerais
              )}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
        <button id="cancelarDescontosItemBtn" style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 14px; color: #374151;">
          Cancelar
        </button>
        <button id="aplicarDescontosItemBtn" style="padding: 10px 20px; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
          Aplicar
        </button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Função para calcular e atualizar preço
    const calcularPrecoItem = () => {
      const descontosItem = [];
      for (let i = 1; i <= 7; i++) {
        const valor =
          parseFloat(modal.querySelector(`#itemDesc${i}`).value) || 0;
        if (valor !== 0) descontosItem.push(valor);
      }

      // Calcular preço: primeiro descontos gerais, depois descontos específicos do item
      let novoPreco = precoTabela;

      // Aplicar descontos gerais primeiro (dos quadrados)
      descontosGerais.forEach((desc) => {
        if (desc > 0) {
          novoPreco = novoPreco * (1 - desc / 100);
        } else if (desc < 0) {
          novoPreco = novoPreco * (1 + Math.abs(desc) / 100);
        }
      });

      // Se não há descontos gerais, aplicar descontos do modal (se houver)
      if (
        descontosGerais.length === 0 &&
        item.descontos &&
        item.descontos.length > 0
      ) {
        item.descontos.forEach((desc) => {
          if (desc > 0) {
            novoPreco = novoPreco * (1 - desc / 100);
          } else if (desc < 0) {
            novoPreco = novoPreco * (1 + Math.abs(desc) / 100);
          }
        });
      }

      // Depois aplicar descontos específicos do item
      descontosItem.forEach((desc) => {
        if (desc > 0) {
          novoPreco = novoPreco * (1 - desc / 100);
        } else if (desc < 0) {
          novoPreco = novoPreco * (1 + Math.abs(desc) / 100);
        }
      });

      const precoEl = modal.querySelector("#precoComDescontosItem");
      if (precoEl) {
        precoEl.textContent = formatCurrency(novoPreco);
      }
    };

    // Event listeners para campos de desconto
    for (let i = 1; i <= 7; i++) {
      modal
        .querySelector(`#itemDesc${i}`)
        .addEventListener("input", calcularPrecoItem);
    }

    // Função para fechar modal
    const fecharModal = () => {
      overlay.remove();
      modal.remove();
    };

    // Botão cancelar
    modal
      .querySelector("#cancelarDescontosItemBtn")
      .addEventListener("click", fecharModal);

    // Botão aplicar
    modal
      .querySelector("#aplicarDescontosItemBtn")
      .addEventListener("click", () => {
        // Coletar descontos específicos do item
        const descontosItem = [];
        for (let i = 1; i <= 7; i++) {
          const valor =
            parseFloat(modal.querySelector(`#itemDesc${i}`).value) || 0;
          descontosItem.push(valor);
        }

        // Salvar descontos específicos do item
        item.descontosItem = descontosItem;

        // Recalcular preço
        let novoPrecoComDesconto = precoTabela;

        // Aplicar descontos gerais primeiro (dos quadrados)
        descontosGerais.forEach((desc) => {
          if (desc > 0) {
            novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
          } else if (desc < 0) {
            novoPrecoComDesconto =
              novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
          }
        });

        // Se não há descontos gerais, aplicar descontos do modal (se houver)
        if (
          descontosGerais.length === 0 &&
          item.descontos &&
          item.descontos.length > 0
        ) {
          item.descontos.forEach((desc) => {
            if (desc > 0) {
              novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
            } else if (desc < 0) {
              novoPrecoComDesconto =
                novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
            }
          });
        }

        // Depois aplicar descontos específicos do item
        descontosItem.forEach((desc) => {
          if (desc > 0) {
            novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
          } else if (desc < 0) {
            novoPrecoComDesconto =
              novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
          }
        });

        item.precoComDesconto = novoPrecoComDesconto;
        const ipi = item.ipi || 0;
        const st = item.st || 0;
        const valorIPI = (novoPrecoComDesconto * ipi) / 100;
        const valorST = (novoPrecoComDesconto * st) / 100;
        item.precoFinal = novoPrecoComDesconto + valorIPI + valorST;
        item.total = novoPrecoComDesconto * item.quantidade;
        item.totalBruto = item.precoFinal * item.quantidade;

        // Sincronizar com window.orcamentoItens
        window.orcamentoItens = orcamentoItens;
        renderOrcamentoItens();
        calculateTotals();

        fecharModal();
      });

    // Fechar ao clicar no overlay
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        fecharModal();
      }
    });

    // Calcular preço inicial
    calcularPrecoItem();
  };

  const calculateTotals = () => {
    const frete = Number.parseFloat(fields.valorFrete.value) || 0;
    const acrescimo = Number.parseFloat(fields.valorAcrescimo.value) || 0;
    const desconto = Number.parseFloat(fields.valorDesconto.value) || 0;

    let subtotal = 0;
    orcamentoItens.forEach((item) => {
      subtotal += (item.precoFinal || 0) * (item.quantidade || 0);
    });

    const totalSemImpostos = subtotal;
    const totalFinal = subtotal + frete + acrescimo - desconto;

    // Atualizar visualização
    const totalItensEl = document.querySelector("#totalItens");
    const totalProdutosEl = document.querySelector("#totalProdutos");
    const totalSemImpostosEl = document.querySelector("#totalSemImpostos");
    const totalFreteEl = document.querySelector("#totalFrete");
    const totalAcrescimoEl = document.querySelector("#totalAcrescimo");
    const totalDescontoEl = document.querySelector("#totalDesconto");
    const totalFinalEl = document.querySelector("#totalFinal");

    if (totalItensEl)
      totalItensEl.textContent = orcamentoItens.length.toFixed(2);
    if (totalProdutosEl)
      totalProdutosEl.textContent = orcamentoItens
        .reduce((sum, item) => sum + (item.quantidade || 0), 0)
        .toFixed(2);
    if (totalSemImpostosEl)
      totalSemImpostosEl.textContent = formatCurrency(totalSemImpostos);
    if (totalFreteEl) totalFreteEl.textContent = formatCurrency(frete);
    if (totalAcrescimoEl)
      totalAcrescimoEl.textContent = formatCurrency(acrescimo);
    if (totalDescontoEl) totalDescontoEl.textContent = formatCurrency(desconto);
    if (totalFinalEl) totalFinalEl.textContent = formatCurrency(totalFinal);
  };

  // Event Listeners
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const clienteId = fields.cliente.value;
    if (!clienteId) {
      window.alert("Selecione um cliente.");
      return;
    }

    const cliente = storage
      .load()
      .clientes.find((item) => item.id === clienteId);
    if (!cliente) {
      window.alert("Cliente não encontrado.");
      return;
    }

    // Mapear itens para o formato esperado pela API
    const itensFormatados = (window.orcamentoItens || orcamentoItens || []).map(
      (item) => ({
        produtoId: item.produtoId,
        quantidade: Number.parseFloat(item.quantidade) || 0,
        precoUnitario: Number.parseFloat(
          item.precoComDesconto || item.precoTabela || 0
        ),
        descontoValor: Number.parseFloat(item.descontoValor || 0),
        descontoPercentual: Number.parseFloat(item.descontoPercentual || 0),
        observacoes: item.observacoes || null,
      })
    );

    if (itensFormatados.length === 0) {
      window.alert("Adicione pelo menos um item ao orçamento.");
      return;
    }

    const data = {
      clienteId,
      dataValidade: fields.validade.value,
      itens: itensFormatados,
      descricao: fields.descricao.value.trim(),
      observacoes: fields.observacoes.value.trim(),
      condicaoPagamento: fields.condicaoPagamento?.value.trim() || "",
      status: fields.status?.value || "pendente",
    };

    const API = window.oursalesAPI;
    if (!API) {
      window.alert("Erro: API não disponível. Recarregue a página.");
      return;
    }

    try {
      if (editingOrcamentoId) {
        await API.updateOrcamento(editingOrcamentoId, data);
        window.alert("Orçamento atualizado com sucesso!");
      } else {
        await API.createOrcamento(data);
        window.alert("Orçamento criado com sucesso!");
      }
      window.location.href = "orcamentos.html";
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      window.alert(
        `Erro ao salvar orçamento: ${error.message || "Erro desconhecido"}`
      );
    }
  });

  // Event listeners para botões adicionais
  const salvarEnviarBtn = document.querySelector("#orcamentoSalvarEnviar");
  const visualizarBtn = document.querySelector("#orcamentoVisualizar");

  salvarEnviarBtn?.addEventListener("click", () => {
    // Simular envio do orçamento
    if (
      window.confirm("Confirma salvar e enviar o orçamento para o cliente?")
    ) {
      // Primeiro salvar o orçamento
      form.dispatchEvent(new Event("submit"));

      // Depois simular envio
      setTimeout(() => {
        window.alert("Orçamento salvo e enviado com sucesso!");
      }, 1000);
    }
  });

  visualizarBtn?.addEventListener("click", () => {
    // Simular visualização do orçamento
    const clienteId = fields.cliente.value;
    if (!clienteId) {
      window.alert("Selecione um cliente para visualizar o orçamento.");
      return;
    }

    const cliente = storage.load().clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      window.alert("Cliente não encontrado.");
      return;
    }

    // Criar uma nova janela com a visualização
    const visualizacao = `
      <html>
        <head>
          <title>Orçamento - ${cliente.nome}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .cliente-info { margin-bottom: 20px; }
            .totais { margin-top: 20px; text-align: right; }
            .total-final { font-size: 1.2em; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ORÇAMENTO</h1>
            <p>Cliente: ${cliente.nome}</p>
            <p>Data: ${new Date().toLocaleDateString("pt-BR")}</p>
          </div>
          <div class="cliente-info">
            <p><strong>Cliente:</strong> ${cliente.nome}</p>
            <p><strong>Documento:</strong> ${cliente.documento || "N/A"}</p>
            <p><strong>E-mail:</strong> ${cliente.email || "N/A"}</p>
          </div>
          <div class="totais">
            <p>Total de Itens: ${orcamentoItens.length}</p>
            <p>Total Final: ${formatCurrency(
              orcamentoItens.reduce(
                (sum, item) =>
                  sum + (item.precoFinal || 0) * (item.quantidade || 0),
                0
              )
            )}</p>
          </div>
        </body>
      </html>
    `;

    const novaJanela = window.open("", "_blank");
    novaJanela.document.write(visualizacao);
    novaJanela.document.close();
  });

  // Calcular totais ao mudar valores
  fields.valorFrete?.addEventListener("input", calculateTotals);
  fields.valorAcrescimo?.addEventListener("input", calculateTotals);
  fields.valorDesconto?.addEventListener("input", calculateTotals);

  // Busca de Produtos
  const filtroIndustria = document.querySelector("#filtroIndustria");
  const filtroTabelaPreco = document.querySelector("#filtroTabelaPreco");
  const produtoSearch = document.querySelector("#produtoSearch");
  const produtosSearchResults = document.querySelector(
    "#produtosSearchResults"
  );
  const produtosResultsList = document.querySelector("#produtosResultsList");

  // Carregar indústrias no filtro
  function carregarIndustriasFiltro() {
    if (!filtroIndustria) {
      console.warn("⚠️ filtroIndustria não encontrado");
      return;
    }
    const industrias = getIndustrias();
    console.log(
      "🔍 carregarIndustriasFiltro - encontradas",
      industrias.length,
      "indústrias"
    );
    filtroIndustria.innerHTML = '<option value="">Todas as indústrias</option>';
    industrias.forEach((ind) => {
      const option = document.createElement("option");
      option.value = ind.id;
      option.textContent = ind.nomeFantasia || ind.razaoSocial;
      filtroIndustria.appendChild(option);
    });
  }

  // Carregar tabelas de preços quando indústria mudar
  function carregarTabelasPrecoFiltro() {
    if (!filtroTabelaPreco || !filtroIndustria) {
      console.warn("⚠️ filtroTabelaPreco ou filtroIndustria não encontrado");
      return;
    }
    const industriaId = filtroIndustria.value;
    filtroTabelaPreco.innerHTML = '<option value="">Todas as tabelas</option>';

    if (!industriaId) {
      filtroTabelaPreco.disabled = false;
      // Carregar todas as tabelas
      const industrias = getIndustrias();
      let totalTabelas = 0;
      industrias.forEach((ind) => {
        const tabelas = ind.tabelasPrecos || [];
        totalTabelas += tabelas.length;
        tabelas.forEach((tab) => {
          const option = document.createElement("option");
          option.value = tab.id;
          option.textContent = `${ind.nomeFantasia || ind.razaoSocial} | ${
            tab.nome
          }`;
          filtroTabelaPreco.appendChild(option);
        });
      });
      console.log(
        "🔍 carregarTabelasPrecoFiltro - carregadas",
        totalTabelas,
        "tabelas (todas as indústrias)"
      );
      return;
    }

    filtroTabelaPreco.disabled = false;
    const industria = getIndustrias().find((i) => i.id === industriaId);
    const tabelas = industria?.tabelasPrecos || [];
    console.log(
      "🔍 carregarTabelasPrecoFiltro - indústria",
      industriaId,
      "- encontradas",
      tabelas.length,
      "tabelas"
    );
    tabelas.forEach((tab) => {
      const option = document.createElement("option");
      option.value = tab.id;
      option.textContent = tab.nome;
      filtroTabelaPreco.appendChild(option);
    });
  }

  // Buscar produtos
  function buscarProdutos() {
    if (!produtoSearch || !produtosResultsList || !produtosSearchResults)
      return;

    const searchTerm = (produtoSearch.value || "").trim().toLowerCase();
    const industriaId = filtroIndustria?.value || "";
    const tabelaPrecoId = filtroTabelaPreco?.value || "";

    if (!searchTerm || searchTerm.length < 2) {
      produtosSearchResults.style.display = "none";
      return;
    }

    // Sempre recarregar do localStorage para garantir dados atualizados
    storage.cache = null;
    const produtos = storage.load().produtos || [];
    const industrias = getIndustrias();

    console.log(
      "🔍 buscarProdutos (pedido) - termo:",
      searchTerm,
      "- produtos no sistema:",
      produtos.length,
      "- indústrias:",
      industrias.length
    );

    let resultados = produtos.filter((produto) => {
      // Filtrar por termo de busca
      const matchSearch =
        (produto.nome || "").toLowerCase().includes(searchTerm) ||
        (produto.codigo || "").toLowerCase().includes(searchTerm) ||
        (produto.codigoOriginal || produto.sku || "")
          .toLowerCase()
          .includes(searchTerm);

      if (!matchSearch) return false;

      // Filtrar por indústria
      if (industriaId && produto.industriaId !== industriaId) {
        return false;
      }

      // Filtrar por tabela de preço
      if (tabelaPrecoId && produto.tabelaPreco !== tabelaPrecoId) {
        // Verificar se o produto está na tabela de preço selecionada
        const industria = industrias.find(
          (i) => i.id === (produto.industriaId || industriaId)
        );
        const tabela = industria?.tabelasPrecos?.find(
          (t) => t.id === tabelaPrecoId
        );
        if (
          !tabela ||
          !tabela.produtos?.some((p) => p.produtoId === produto.id)
        ) {
          return false;
        }
      }

      return true;
    });

    // Para cada produto, encontrar o preço na tabela de preço
    resultados = resultados.map((produto) => {
      const industria = industrias.find((i) => i.id === produto.industriaId);
      let precoTabela = produto.precoVenda || 0;
      let tabelaPrecoNome = "";
      let industriaNome =
        industria?.nomeFantasia || industria?.razaoSocial || "";
      let codigoOriginal = produto.codigoOriginal || produto.sku || "-";
      let unidade = produto.unidadeMedida || "UN";
      let embalagem = produto.embalagem || produto.quantidadeEmbalagem || "-";

      // Se há tabela de preço selecionada, buscar o preço específico
      if (tabelaPrecoId) {
        const tabela = industria?.tabelasPrecos?.find(
          (t) => t.id === tabelaPrecoId
        );
        if (tabela) {
          tabelaPrecoNome = tabela.nome;
          const produtoTabela = tabela.produtos?.find(
            (p) => p.produtoId === produto.id
          );
          if (produtoTabela) {
            precoTabela = produtoTabela.preco || precoTabela;
          }
        }
      } else if (produto.tabelaPreco) {
        // Usar a tabela de preço do produto
        const tabela = industria?.tabelasPrecos?.find(
          (t) => t.id === produto.tabelaPreco
        );
        if (tabela) {
          tabelaPrecoNome = tabela.nome;
          const produtoTabela = tabela.produtos?.find(
            (p) => p.produtoId === produto.id
          );
          if (produtoTabela) {
            precoTabela = produtoTabela.preco || precoTabela;
          }
        }
      }

      return {
        ...produto,
        precoTabela,
        tabelaPrecoNome,
        industriaNome,
        codigoOriginal,
        unidade,
        embalagem,
      };
    });

    // Renderizar resultados
    if (resultados.length === 0) {
      produtosResultsList.innerHTML = `
        <div style="padding: var(--space-4); text-align: center; color: var(--text-tertiary);">
          Nenhum produto encontrado com os filtros selecionados.
        </div>
      `;
      produtosSearchResults.style.display = "block";
      return;
    }

    produtosResultsList.innerHTML = resultados
      .map((produto) => {
        const tagHtml =
          produto.tabelaPrecoNome && produto.industriaNome
            ? `<div style="margin-top: 8px;"><span style="display: inline-block; padding: 4px 12px; background: rgba(102, 126, 234, 0.1); border-radius: 12px; font-size: 12px; color: var(--primary-600);">${produto.industriaNome} | ${produto.tabelaPrecoNome}</span></div>`
            : "";

        return `
          <div style="padding: var(--space-3); border-bottom: 1px solid var(--border-light); cursor: pointer; transition: background 0.2s;" 
               onmouseover="this.style.background='rgba(102, 126, 234, 0.05)'" 
               onmouseout="this.style.background='white'"
               data-produto-id="${produto.id}">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div style="flex: 1;">
                <div style="display: flex; gap: var(--space-3); margin-bottom: var(--space-2);">
                  <strong style="color: var(--text-primary);">Cód. ${
                    produto.codigo || "-"
                  }</strong>
                  <span style="color: var(--text-secondary);">Cód. Interno: ${
                    produto.codigoOriginal || "-"
                  }</span>
                  <span style="color: var(--text-secondary);">Unid: ${
                    produto.unidade
                  }</span>
                  <span style="color: var(--text-secondary);">Emb: ${
                    produto.embalagem
                  }</span>
                </div>
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-2);">
                  ${produto.nome || produto.descricao || "-"}
                </div>
                ${tagHtml}
              </div>
              <div style="margin-left: var(--space-4); text-align: right;">
                <div style="font-size: 18px; font-weight: bold; color: var(--primary-600);">
                  R$ ${parseFloat(produto.precoTabela || 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    produtosSearchResults.style.display = "block";

    // Otimizado: usar event delegation (apenas um listener ao invés de N listeners)
    // Remove listener anterior se existir para evitar duplicatas
    if (produtosResultsList._clickHandler) {
      produtosResultsList.removeEventListener(
        "click",
        produtosResultsList._clickHandler
      );
    }
    produtosResultsList._clickHandler = (e) => {
      console.log("🔍 Handler de clique chamado", e.target);
      const item = e.target.closest("[data-produto-id]");
      console.log("🔍 Item encontrado:", item);
      if (item) {
        // CRÍTICO: Prevenir comportamento padrão e propagação ANTES de qualquer coisa
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // IMPORTANTE: Salvar posição de scroll e posição do elemento ANTES de qualquer outra operação
        const scrollY =
          window.scrollY ||
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          0;
        const itemRect = item.getBoundingClientRect();
        console.log("📌 Posição de scroll capturada no clique:", scrollY);
        console.log("📍 Posição do elemento:", itemRect);

        const produtoId = item.getAttribute("data-produto-id");
        console.log("🔍 Produto ID:", produtoId);
        console.log(
          "🔍 window.abrirProdutoModal existe?",
          typeof window.abrirProdutoModal
        );
        if (produtoId && window.abrirProdutoModal) {
          console.log("✅ Chamando abrirProdutoModal...");
          // Chamar IMEDIATAMENTE sem setTimeout para evitar problemas
          window.abrirProdutoModal(produtoId, scrollY, itemRect);
        } else {
          console.error(
            "❌ Erro: produtoId ou abrirProdutoModal não disponível"
          );
        }
        return false;
      }
    };
    produtosResultsList.addEventListener(
      "click",
      produtosResultsList._clickHandler,
      { capture: true } // Usar capture para garantir que seja processado primeiro
    );
  }

  // Event listeners para busca de produtos
  filtroIndustria?.addEventListener("change", () => {
    carregarTabelasPrecoFiltro();
    buscarProdutos();
  });

  filtroTabelaPreco?.addEventListener("change", buscarProdutos);

  // Otimizado: usar debounce para busca
  produtoSearch?.addEventListener("input", debounce(buscarProdutos, 300));

  // Inicializar busca - usar setTimeout para garantir que o DOM está pronto
  setTimeout(() => {
    console.log("🔍 Inicializando filtros de busca de produtos (orcamento)...");
    console.log("🔍 filtroIndustria existe?", !!filtroIndustria);
    console.log("🔍 filtroTabelaPreco existe?", !!filtroTabelaPreco);
    carregarIndustriasFiltro();
    carregarTabelasPrecoFiltro();
  }, 100);

  // Event listeners para botões de descontos adicionais
  const aplicarFiltrosBtn = document.querySelector("#aplicarFiltros");
  const limparFiltrosBtn = document.querySelector("#limparFiltros");

  aplicarFiltrosBtn?.addEventListener("click", () => {
    const filtro1 = parseFloat(document.querySelector("#filtro1")?.value || 0);
    const filtro2 = parseFloat(document.querySelector("#filtro2")?.value || 0);
    const filtro3 = parseFloat(document.querySelector("#filtro3")?.value || 0);
    const filtro4 = parseFloat(document.querySelector("#filtro4")?.value || 0);
    const filtro5 = parseFloat(document.querySelector("#filtro5")?.value || 0);
    const filtro6 = parseFloat(document.querySelector("#filtro6")?.value || 0);
    const filtro7 = parseFloat(document.querySelector("#filtro7")?.value || 0);

    // Coletar TODOS os descontos/acréscimos dos quadrados (cumulativos)
    // Valores positivos = desconto, valores negativos = acréscimo
    const descontosQuadrados = [
      filtro1,
      filtro2,
      filtro3,
      filtro4,
      filtro5,
      filtro6,
      filtro7,
    ].filter((d) => d !== 0); // Aceita valores positivos e negativos

    if (descontosQuadrados.length === 0) {
      window.alert("Informe pelo menos um desconto ou acréscimo para aplicar.");
      return;
    }

    // Aplicar descontos/acréscimos aos itens
    orcamentoItens.forEach((item) => {
      // SEMPRE usar o preço original da tabela como base
      const precoTabela = item.precoTabela || 0;

      // Primeiro aplicar descontos específicos do item (se houver)
      let novoPrecoComDesconto = precoTabela;
      const descontosItem = item.descontosItem || [0, 0, 0];
      descontosItem.forEach((desc) => {
        if (desc > 0) {
          novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
        } else if (desc < 0) {
          novoPrecoComDesconto =
            novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
        }
      });

      // Depois aplicar TODOS os descontos/acréscimos dos quadrados (cumulativo)
      descontosQuadrados.forEach((desc) => {
        if (desc > 0) {
          // Desconto: reduzir o preço
          novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
        } else if (desc < 0) {
          // Acréscimo: aumentar o preço
          novoPrecoComDesconto =
            novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
        }
      });

      item.precoComDesconto = novoPrecoComDesconto;

      // Recalcular IPI e ST sobre o novo preço
      const ipi = item.ipi || 0;
      const st = item.st || 0;
      const valorIPI = (item.precoComDesconto * ipi) / 100;
      const valorST = (item.precoComDesconto * st) / 100;
      item.precoFinal = item.precoComDesconto + valorIPI + valorST;

      // Atualizar totais
      item.total = item.precoComDesconto * item.quantidade;
      item.totalBruto = item.precoFinal * item.quantidade;

      // Salvar descontos aplicados (todos os descontos dos quadrados)
      item.descontosAplicados = [...descontosQuadrados];
    });

    // Sincronizar com window.orcamentoItens
    window.orcamentoItens = orcamentoItens;
    renderOrcamentoItens();
    calculateTotals();
  });

  limparFiltrosBtn?.addEventListener("click", () => {
    // Limpar todos os campos de filtro
    document.querySelector("#filtro1").value = "";
    document.querySelector("#filtro2").value = "";
    document.querySelector("#filtro3").value = "";
    document.querySelector("#filtro4").value = "";
    document.querySelector("#filtro5").value = "";
    document.querySelector("#filtro6").value = "";
    document.querySelector("#filtro7").value = "";

    // Remover TODOS os descontos e voltar ao preço original da tabela
    orcamentoItens.forEach((item) => {
      // Remover TODOS os descontos (quadrados, específicos do item, etc)
      if (item.descontosAplicados) {
        delete item.descontosAplicados;
      }
      if (item.descontoAdicional) {
        delete item.descontoAdicional;
      }
      if (item.descontosItem) {
        delete item.descontosItem;
      }

      // Voltar ao preço original da tabela (SEM nenhum desconto)
      const precoTabela = item.precoTabela || 0;
      item.precoComDesconto = precoTabela;

      // Recalcular IPI e ST sobre o novo preço
      const ipi = item.ipi || 0;
      const st = item.st || 0;
      const valorIPI = (item.precoComDesconto * ipi) / 100;
      const valorST = (item.precoComDesconto * st) / 100;
      item.precoFinal = item.precoComDesconto + valorIPI + valorST;

      // Atualizar totais
      item.total = item.precoComDesconto * item.quantidade;
      item.totalBruto = item.precoFinal * item.quantidade;
    });

    // Sincronizar com window.orcamentoItens
    window.orcamentoItens = orcamentoItens;
    renderOrcamentoItens();
    calculateTotals();
  });

  // Carregar dados se for edição
  if (editingOrcamentoId) {
    const API = window.oursalesAPI;
    if (API) {
      API.getOrcamento(editingOrcamentoId)
        .then((orcamento) => {
          if (orcamento) {
            const orcamentoData = orcamento.data || orcamento;
            formTitle.textContent = `🛒 Orçamento - Editando Nº ${
              orcamentoData.numero || editingOrcamentoId
            }`;
            fields.cliente.value = orcamentoData.clienteId || "";
            fields.data.value = orcamentoData.data || fields.data.value;
            fields.validade.value = orcamentoData.dataValidade || "";
            fields.descricao.value = orcamentoData.descricao || "";
            fields.observacoes.value = orcamentoData.observacoes || "";
            fields.condicaoPagamento.value =
              orcamentoData.condicaoPagamento || "";
            fields.status.value = orcamentoData.status || "pendente";
            orcamentoItens = orcamentoData.itens || [];
            window.orcamentoItens = orcamentoItens;
            renderOrcamentoItens();
            calculateTotals();
          }
        })
        .catch((error) => {
          console.error("Erro ao carregar orçamento:", error);
          // Fallback para localStorage
          const orcamento = storage
            .load()
            .orcamentos.find((item) => item.id === editingOrcamentoId);
          if (orcamento) {
            formTitle.textContent = `🛒 Orçamento - Editando Nº ${orcamento.id.toUpperCase()}`;
            fields.cliente.value = orcamento.clienteId || "";
            fields.data.value = orcamento.data || fields.data.value;
            fields.validade.value = orcamento.validade || "";
            fields.descricao.value = orcamento.descricao || "";
            fields.observacoes.value = orcamento.observacoes || "";
            fields.condicaoPagamento.value = orcamento.condicaoPagamento || "";
            fields.status.value = orcamento.status || "pendente";
            orcamentoItens = orcamento.itens || [];
            window.orcamentoItens = orcamentoItens;
            renderOrcamentoItens();
            calculateTotals();
          }
        });
    } else {
      // Modo localStorage
      const orcamento = storage
        .load()
        .orcamentos.find((item) => item.id === editingOrcamentoId);
      if (orcamento) {
        formTitle.textContent = `🛒 Orçamento - Editando Nº ${orcamento.id.toUpperCase()}`;
        fields.cliente.value = orcamento.clienteId || "";
        fields.data.value = orcamento.data || fields.data.value;
        fields.validade.value = orcamento.validade || "";
        fields.descricao.value = orcamento.descricao || "";
        fields.observacoes.value = orcamento.observacoes || "";
        fields.condicaoPagamento.value = orcamento.condicaoPagamento || "";
        fields.status.value = orcamento.status || "pendente";
        orcamentoItens = orcamento.itens || [];
        window.orcamentoItens = orcamentoItens;
        renderOrcamentoItens();
        calculateTotals();
      }
    }
  }

  // Inicialização
  refreshSelects();
  fields.data.value = new Date().toISOString().split("T")[0];
  renderOrcamentoItens();
  calculateTotals();
}

/**
 * Função global para abrir modal de detalhes do produto
 * Disponível para uso em orcamento-form e pedido-form
 */
window.abrirProdutoModal = function (
  produtoId,
  scrollYOverride = null,
  itemRect = null
) {
  // PREVENIR EXECUÇÕES SIMULTÂNEAS
  if (window._abrirProdutoModalEmExecucao) {
    console.log("⚠️ Modal já está sendo aberto, ignorando...");
    return;
  }
  window._abrirProdutoModalEmExecucao = true;

  try {
    console.log("🚀 abrirProdutoModal chamado com produtoId:", produtoId);

    // CRÍTICO: Capturar posição de scroll ANTES de qualquer modificação no DOM
    const scrollY =
      scrollYOverride !== null
        ? scrollYOverride
        : window.scrollY ||
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          0;

    console.log("📌 Posição de scroll capturada:", scrollY);

    // PRIMEIRO: Remover modais antigos se existirem (limpeza COMPLETA)
    const oldOverlay = document.getElementById("produtoDetalhesOverlay");
    const oldModal = document.getElementById("produtoDetalhesModal");
    if (oldOverlay) {
      console.log("Removendo overlay antigo");
      oldOverlay.remove();
    }
    if (oldModal) {
      console.log("Removendo modal antigo");
      oldModal.remove();
    }

    // DEPOIS: Verificar se ainda existe algum modal (após limpeza)
    const existingModal = document.getElementById("produtoDetalhesModal");
    if (existingModal) {
      console.log("⚠️ Modal ainda existe após remoção, forçando remoção...");
      existingModal.remove();
    }

    const produto = storage.load().produtos.find((p) => p.id === produtoId);
    if (!produto) {
      console.error("❌ Produto não encontrado:", produtoId);
      window.alert("Produto não encontrado.");
      window._abrirProdutoModalEmExecucao = false;
      return;
    }

    console.log("✅ Produto encontrado:", produto.nome);

    // Buscar dados do produto e tabela de preço
    const industrias = getIndustrias();
    const industria = industrias.find((i) => i.id === produto.industriaId);
    let precoTabela = produto.precoVenda || produto.precoTabela || 0;
    let tabelaPrecoNome = "";

    // CRÍTICO: Buscar tabela de preço do filtro selecionado OU do produto
    const filtroTabelaPrecoEl = document.querySelector("#filtroTabelaPreco");
    let tabelaPrecoId = filtroTabelaPrecoEl?.value || produto.tabelaPreco || "";

    // CRÍTICO: Buscar IPI e ST do produto na tabela de preço
    let ipiProduto = produto.ipi || 0;
    let stProduto = produto.st || 0;
    let produtoTabelaData = null;

    if (tabelaPrecoId && industria?.tabelasPrecos) {
      const tabela = industria.tabelasPrecos.find(
        (t) => t.id === tabelaPrecoId
      );
      if (tabela) {
        tabelaPrecoNome = tabela.nome;
        produtoTabelaData = tabela.produtos?.find(
          (p) => p.produtoId === produto.id || p.produto?.id === produto.id
        );
        if (produtoTabelaData) {
          precoTabela =
            produtoTabelaData.preco ||
            produtoTabelaData.precoVenda ||
            precoTabela;
          // CRÍTICO: IPI e ST vêm da tabela de preço, não do produto diretamente
          ipiProduto =
            produtoTabelaData.ipi !== undefined
              ? produtoTabelaData.ipi
              : produto.ipi || 0;
          stProduto =
            produtoTabelaData.st !== undefined
              ? produtoTabelaData.st
              : produto.st || 0;
        }
      }
    }

    // Se não encontrou na tabela específica, tentar buscar na tabela padrão do produto
    if (!produtoTabelaData && produto.tabelaPreco && industria?.tabelasPrecos) {
      const tabela = industria.tabelasPrecos.find(
        (t) => t.id === produto.tabelaPreco
      );
      if (tabela) {
        tabelaPrecoNome = tabela.nome;
        produtoTabelaData = tabela.produtos?.find(
          (p) => p.produtoId === produto.id || p.produto?.id === produto.id
        );
        if (produtoTabelaData) {
          precoTabela =
            produtoTabelaData.preco ||
            produtoTabelaData.precoVenda ||
            precoTabela;
          ipiProduto =
            produtoTabelaData.ipi !== undefined
              ? produtoTabelaData.ipi
              : produto.ipi || 0;
          stProduto =
            produtoTabelaData.st !== undefined
              ? produtoTabelaData.st
              : produto.st || 0;
        }
      }
    }

    // Se ainda não encontrou, usar valores padrão do produto
    if (!produtoTabelaData) {
      console.log(
        "⚠️ Produto não encontrado na tabela de preço, usando valores padrão do produto"
      );
    }

    // Criar overlay simples - apenas um backdrop
    const overlay = document.createElement("div");
    overlay.id = "produtoDetalhesOverlay";

    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
    left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.75) !important;
      backdrop-filter: blur(4px) !important;
      z-index: 99999 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
    `;

    // Guardar scroll position ANTES de qualquer modificação
    const savedScrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      0;
    overlay.dataset.scrollY = savedScrollY.toString();

    // Aplicar overflow hidden APENAS no body (simples)
    const originalBodyOverflow = document.body.style.overflow || "";
    overlay.dataset.bodyOverflow = originalBodyOverflow;
    document.body.style.overflow = "hidden";

    // Adicionar overlay ao body
    document.body.appendChild(overlay);

    // Criar modal novo - sempre centralizado
    const modal = document.createElement("div");
    modal.id = "produtoDetalhesModal";

    // Modal sempre centralizado - SIMPLES
    modal.style.cssText = `
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background: white !important;
      border-radius: 12px !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3) !important;
      z-index: 100000 !important;
      max-width: 800px !important;
      width: 90vw !important;
      max-height: 90vh !important;
      overflow-y: auto !important;
      display: flex !important;
      flex-direction: column !important;
      margin: 0 !important;
      padding: 0 !important;
    `;

    // Media query para mobile
    if (!document.getElementById("modal-responsive-style")) {
      const style = document.createElement("style");
      style.id = "modal-responsive-style";
      style.textContent = `
        @media (max-width: 768px) {
          #produtoDetalhesModal {
            width: 95vw !important;
            max-height: 95vh !important;
          }
        }
        @media (max-width: 480px) {
          #produtoDetalhesModal {
            width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const codigo = produto.codigo || produto.sku || "-";
    const codigoOriginal = produto.codigoOriginal || "";

    // Variáveis para cálculos - usar valores da tabela de preço
    let quantidadeAtual = 1;
    let ipiAtual = ipiProduto; // IPI da tabela de preço
    let stAtual = stProduto; // ST da tabela de preço
    const descontosAtuais = [0, 0, 0, 0, 0, 0, 0];

    // Função para calcular totais
    function calcularTotais() {
      let precoComDesconto = precoTabela;

      // Aplicar descontos/acréscimos acumulativos
      // Valores positivos = desconto, valores negativos = acréscimo
      descontosAtuais.forEach((desc) => {
        if (desc > 0) {
          // Desconto: reduzir o preço
          precoComDesconto = precoComDesconto * (1 - desc / 100);
        } else if (desc < 0) {
          // Acréscimo: aumentar o preço
          precoComDesconto = precoComDesconto * (1 + Math.abs(desc) / 100);
        }
      });

      const precoUnit = precoComDesconto;
      const total = precoUnit * quantidadeAtual;
      const valorIPI = (precoComDesconto * ipiAtual) / 100;
      const valorST = (precoComDesconto * stAtual) / 100;
      const totalBruto =
        total + valorIPI * quantidadeAtual + valorST * quantidadeAtual;

      // Atualizar campos
      const precoUnitEl = modal.querySelector("#calcPrecoUnit");
      const totalEl = modal.querySelector("#calcTotal");
      const totalBrutoEl = modal.querySelector("#calcTotalBruto");

      if (precoUnitEl) precoUnitEl.textContent = formatCurrency(precoUnit);
      if (totalEl) totalEl.textContent = formatCurrency(total);
      if (totalBrutoEl) totalBrutoEl.textContent = formatCurrency(totalBruto);
    }

    // HTML do modal
    modal.innerHTML = `
    <div style="padding: 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-weight: 600; font-size: 16px; color: #1f2937; margin-bottom: 4px;">
          ${codigo}${codigoOriginal ? ` | ${codigoOriginal}` : ""}
        </div>
        <div style="color: #6b7280; font-size: 14px;">${
          produto.nome || produto.descricao || "-"
        }</div>
      </div>
      <button id="modalFecharBtn" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; padding: 4px; line-height: 1;">&times;</button>
    </div>

    <div style="padding: 24px; flex: 1; overflow-y: auto;">
      <div style="display: grid; gap: 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div>
            <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Tab. Preço</label>
            <div style="font-size: 14px; color: #1f2937;">${
              tabelaPrecoNome || "-"
            }</div>
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Preço Tab.</label>
            <div style="font-size: 14px; font-weight: 600; color: #1f2937;">${formatCurrency(
              precoTabela
            )}</div>
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Embalagem</label>
            <div style="font-size: 14px; color: #1f2937;">${
              produto.embalagem || "-"
            }</div>
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Unidade</label>
            <div style="font-size: 14px; color: #1f2937;">${
              produto.unidadeMedida || produto.unidade || "UN"
            }</div>
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">NCM</label>
            <div style="font-size: 14px; color: #1f2937;">${
              produto.ncm || "-"
            }</div>
          </div>
          ${
            industria
              ? `
          <div>
            <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Indústria</label>
            <div style="font-size: 14px; color: #1f2937;">${
              industria.nomeFantasia ||
              industria.razaoSocial ||
              industria.nome ||
              "-"
            }</div>
          </div>
          `
              : ""
          }
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
          <div>
            <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">IPI (%)</label>
            <input type="number" id="modalIPI" step="0.01" min="0" value="${ipiAtual}" 
                   readonly
                   style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: #f3f4f6; color: #6b7280; cursor: not-allowed;" 
                   title="IPI definido na tabela de preço - não editável" />
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">ST (%)</label>
            <input type="number" id="modalST" step="0.01" min="0" value="${stAtual}" 
                   readonly
                   style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: #f3f4f6; color: #6b7280; cursor: not-allowed;" 
                   title="ST definido na tabela de preço - não editável" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
          <div>
            <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Quantidade</label>
            <input type="number" id="modalQuantidade" step="0.01" min="0.01" value="1" 
                   style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" />
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Preço Unit.</label>
            <div id="calcPrecoUnit" style="font-size: 14px; font-weight: 600; color: #1f2937; padding: 8px; background: #f3f4f6; border-radius: 6px;">${formatCurrency(
              precoTabela
            )}</div>
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Total</label>
            <div id="calcTotal" style="font-size: 14px; font-weight: 600; color: #1f2937; padding: 8px; background: #f3f4f6; border-radius: 6px;">${formatCurrency(
              precoTabela
            )}</div>
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Total Bruto</label>
            <div id="calcTotalBruto" style="font-size: 16px; font-weight: 700; color: #059669; padding: 8px; background: #f3f4f6; border-radius: 6px;">${formatCurrency(
              precoTabela
            )}</div>
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 8px;">Descontos (%)</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${[1, 2, 3, 4, 5, 6, 7]
              .map(
                (i) => `
              <input type="number" id="modalDesc${i}" step="0.01" placeholder="0" 
                     style="width: 80px; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" />
            `
              )
              .join("")}
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;">Observação</label>
          <textarea id="modalObservacao" rows="2" placeholder="Observações sobre o produto..." 
                    style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
        </div>
      </div>
    </div>

    <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px;">
      <button id="modalCancelarBtn" style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 14px; color: #374151;">
        Cancelar
      </button>
      <button id="modalAdicionarBtn" style="padding: 10px 20px; border: none; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;">
        + Adicionar
      </button>
    </div>
    `;

    // Adicionar modal ao body (não ao overlay) para position fixed funcionar corretamente
    document.body.appendChild(modal);

    // Função para fechar modal - SIMPLES
    function fecharModal() {
      // Liberar flag de execução
      window._abrirProdutoModalEmExecucao = false;

      // Restaurar overflow do body
      document.body.style.overflow = overlay.dataset.bodyOverflow || "";

      // Remover elementos
      overlay.remove();
      modal.remove();

      // Restaurar scroll position
      const savedScrollY = parseFloat(overlay.dataset.scrollY || "0") || 0;
      window.scrollTo(0, savedScrollY);
    }

    // Event listeners para cálculos
    modal.querySelector("#modalQuantidade").addEventListener("input", (e) => {
      quantidadeAtual = parseFloat(e.target.value) || 1;
      calcularTotais();
    });

    // IPI e ST são readonly - não precisam de listeners de input
    // Os valores são fixos e vêm da tabela de preço

    for (let i = 1; i <= 7; i++) {
      modal.querySelector(`#modalDesc${i}`).addEventListener("input", (e) => {
        const valor = e.target.value;
        // Aceitar valores vazios, positivos e negativos
        descontosAtuais[i - 1] = valor === "" ? 0 : parseFloat(valor) || 0;
        calcularTotais();
      });
    }

    // Botão fechar
    modal
      .querySelector("#modalFecharBtn")
      .addEventListener("click", fecharModal);

    // Botão cancelar
    modal
      .querySelector("#modalCancelarBtn")
      .addEventListener("click", fecharModal);

    // Botão adicionar
    modal.querySelector("#modalAdicionarBtn").addEventListener("click", () => {
      const quantidade =
        parseFloat(modal.querySelector("#modalQuantidade").value) || 1;
      // CRÍTICO: IPI e ST vêm da tabela de preço (valores readonly)
      // Usar valores das variáveis ipiAtual e stAtual que já foram carregados corretamente
      const ipi = ipiAtual; // Valor da tabela de preço (não editável)
      const st = stAtual; // Valor da tabela de preço (não editável)
      const observacoes = modal.querySelector("#modalObservacao").value.trim();

      // Calcular descontos/acréscimos
      // Valores positivos = desconto, valores negativos = acréscimo
      const descontos = [];
      for (let i = 1; i <= 7; i++) {
        const desc =
          parseFloat(modal.querySelector(`#modalDesc${i}`).value) || 0;
        if (desc !== 0) descontos.push(desc); // Aceita valores positivos e negativos
      }

      // Recalcular preço com descontos/acréscimos
      let precoComDesconto = precoTabela;
      descontos.forEach((desc) => {
        if (desc > 0) {
          // Desconto: reduzir o preço
          precoComDesconto = precoComDesconto * (1 - desc / 100);
        } else if (desc < 0) {
          // Acréscimo: aumentar o preço
          precoComDesconto = precoComDesconto * (1 + Math.abs(desc) / 100);
        }
      });

      const valorIPI = (precoComDesconto * ipi) / 100;
      const valorST = (precoComDesconto * st) / 100;
      const precoFinal = precoComDesconto + valorIPI + valorST;
      const totalBruto = precoFinal * quantidade;

      // Criar item
      const novoItem = {
        id: generateId("item"),
        produtoId: produto.id,
        produtoNome: produto.nome || produto.descricao,
        codigo: codigo,
        codigoOriginal: codigoOriginal,
        precoTabela: precoTabela,
        precoComDesconto: precoComDesconto,
        precoFinal: precoFinal,
        quantidade: quantidade,
        tabelaPrecoNome: tabelaPrecoNome,
        tabelaPrecoId: tabelaPrecoId,
        ipi: ipi,
        st: st,
        descontos: descontos,
        total: precoComDesconto * quantidade,
        totalBruto: totalBruto,
        observacoes: observacoes,
        embalagem: produto.embalagem || "",
        unidade: produto.unidadeMedida || produto.unidade || "",
      };

      // Sincronizar descontos do modal com os campos de filtro da página
      if (descontos.length > 0) {
        // Verificar se estamos em orçamento-form ou pedido-form
        const aplicarFiltrosBtn = document.querySelector("#aplicarFiltros");
        if (aplicarFiltrosBtn) {
          // Limpar campos existentes primeiro
          for (let i = 1; i <= 7; i++) {
            const filtroEl = document.querySelector(`#filtro${i}`);
            if (filtroEl) filtroEl.value = "";
          }

          // Preencher campos com os descontos do modal
          descontos.forEach((desc, idx) => {
            if (idx < 7) {
              const filtroEl = document.querySelector(`#filtro${idx + 1}`);
              if (filtroEl) filtroEl.value = desc.toString();
            }
          });
        }
      }

      // Verificar se estamos em orçamento ou pedido
      const isPedido =
        typeof window.pedidoItens !== "undefined" &&
        Array.isArray(window.pedidoItens);
      const isOrcamento =
        typeof orcamentoItens !== "undefined" && Array.isArray(orcamentoItens);

      if (isPedido) {
        // Verificar se o produto já existe (pelo código)
        const itemExistente = window.pedidoItens.find(
          (item) => item.codigo === codigo
        );

        if (itemExistente) {
          // Produto já existe: perguntar se quer somar a quantidade
          const quantidadeAtual = itemExistente.quantidade || 0;
          const quantidadeNova = quantidade;
          const confirmar = window.confirm(
            `O produto "${
              itemExistente.produtoNome || codigo
            }" já está no pedido com quantidade ${quantidadeAtual}.\n\n` +
              `Deseja adicionar mais ${quantidadeNova} unidades? (Total: ${
                quantidadeAtual + quantidadeNova
              })`
          );

          if (!confirmar) {
            // Não fechar o modal, apenas cancelar a adição
            return;
          }

          // Produto já existe: somar a quantidade
          itemExistente.quantidade = quantidadeAtual + quantidadeNova;
          // Atualizar descontos do modal (apenas para referência)
          if (descontos.length > 0) {
            itemExistente.descontos = descontos;
          } else {
            itemExistente.descontos = [];
          }

          // Recalcular preço considerando descontos específicos do item, descontos dos quadrados e descontos do modal
          let novoPrecoComDesconto = itemExistente.precoTabela || 0;

          // Primeiro aplicar descontos específicos do item (se houver)
          const descontosItem = itemExistente.descontosItem || [0, 0, 0];
          descontosItem.forEach((desc) => {
            if (desc > 0) {
              novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
            } else if (desc < 0) {
              novoPrecoComDesconto =
                novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
            }
          });

          // Depois aplicar descontos dos quadrados (se houver)
          if (
            itemExistente.descontosAplicados &&
            itemExistente.descontosAplicados.length > 0
          ) {
            itemExistente.descontosAplicados.forEach((desc) => {
              if (desc > 0) {
                novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
              } else if (desc < 0) {
                novoPrecoComDesconto =
                  novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
              }
            });
          }
          // Se não há descontos dos quadrados, aplicar descontos/acréscimos do modal
          else if (descontos.length > 0) {
            descontos.forEach((desc) => {
              if (desc > 0) {
                novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
              } else if (desc < 0) {
                novoPrecoComDesconto =
                  novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
              }
            });
          }

          itemExistente.precoComDesconto = novoPrecoComDesconto;
          const valorIPI = (novoPrecoComDesconto * ipi) / 100;
          const valorST = (novoPrecoComDesconto * st) / 100;
          itemExistente.precoFinal = novoPrecoComDesconto + valorIPI + valorST;
          // Recalcular total do item existente
          itemExistente.total =
            itemExistente.precoComDesconto * itemExistente.quantidade;
          itemExistente.totalBruto =
            itemExistente.precoFinal * itemExistente.quantidade;

          // Atualizar observações se houver (opcional: concatenar ou substituir)
          if (observacoes) {
            itemExistente.observacoes = itemExistente.observacoes
              ? `${itemExistente.observacoes} | ${observacoes}`
              : observacoes;
          }
          // Sincronizar com pedidoItens local
          pedidoItens = window.pedidoItens;
        } else {
          // Produto novo: adicionar normalmente
          window.pedidoItens.push(novoItem);
          // Sincronizar com pedidoItens local
          pedidoItens = window.pedidoItens;
        }

        if (typeof window.renderPedidoItens === "function") {
          window.renderPedidoItens();
        }
        if (typeof window.calculateTotalsPedido === "function") {
          window.calculateTotalsPedido();
        } else if (typeof calculateTotals === "function") {
          calculateTotals();
        }
      } else if (isOrcamento) {
        // Obter orcamentoItens do escopo global ou local
        const orcamentoItensLocal =
          typeof window.orcamentoItens !== "undefined" &&
          Array.isArray(window.orcamentoItens)
            ? window.orcamentoItens
            : orcamentoItens || [];
        // Verificar se o produto já existe (pelo código)
        const itemExistente = orcamentoItensLocal.find(
          (item) => item.codigo === codigo
        );

        if (itemExistente) {
          // Produto já existe: perguntar se quer somar a quantidade
          const quantidadeAtual = itemExistente.quantidade || 0;
          const quantidadeNova = quantidade;
          const confirmar = window.confirm(
            `O produto "${
              itemExistente.produtoNome || codigo
            }" já está no orçamento com quantidade ${quantidadeAtual}.\n\n` +
              `Deseja adicionar mais ${quantidadeNova} unidades? (Total: ${
                quantidadeAtual + quantidadeNova
              })`
          );

          if (!confirmar) {
            // Não fechar o modal, apenas cancelar a adição
            return;
          }

          // Produto já existe: somar a quantidade
          itemExistente.quantidade = quantidadeAtual + quantidadeNova;
          // Atualizar descontos do modal (apenas para referência)
          if (descontos.length > 0) {
            itemExistente.descontos = descontos;
          } else {
            itemExistente.descontos = [];
          }

          // Recalcular preço considerando descontos específicos do item, descontos dos quadrados e descontos do modal
          let novoPrecoComDesconto = itemExistente.precoTabela || 0;

          // Primeiro aplicar descontos específicos do item (se houver)
          const descontosItem = itemExistente.descontosItem || [0, 0, 0];
          descontosItem.forEach((desc) => {
            if (desc > 0) {
              novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
            } else if (desc < 0) {
              novoPrecoComDesconto =
                novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
            }
          });

          // Depois aplicar descontos dos quadrados (se houver)
          if (
            itemExistente.descontosAplicados &&
            itemExistente.descontosAplicados.length > 0
          ) {
            itemExistente.descontosAplicados.forEach((desc) => {
              if (desc > 0) {
                novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
              } else if (desc < 0) {
                novoPrecoComDesconto =
                  novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
              }
            });
          }
          // Se não há descontos dos quadrados, aplicar descontos/acréscimos do modal
          else if (descontos.length > 0) {
            descontos.forEach((desc) => {
              if (desc > 0) {
                novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
              } else if (desc < 0) {
                novoPrecoComDesconto =
                  novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
              }
            });
          }

          itemExistente.precoComDesconto = novoPrecoComDesconto;
          const valorIPI = (novoPrecoComDesconto * ipi) / 100;
          const valorST = (novoPrecoComDesconto * st) / 100;
          itemExistente.precoFinal = novoPrecoComDesconto + valorIPI + valorST;
          // Recalcular total do item existente
          itemExistente.total =
            itemExistente.precoComDesconto * itemExistente.quantidade;
          itemExistente.totalBruto =
            itemExistente.precoFinal * itemExistente.quantidade;

          // Atualizar observações se houver (opcional: concatenar ou substituir)
          if (observacoes) {
            itemExistente.observacoes = itemExistente.observacoes
              ? `${itemExistente.observacoes} | ${observacoes}`
              : observacoes;
          }
        } else {
          // Produto novo: adicionar normalmente
          orcamentoItensLocal.push(novoItem);
        }

        // Sincronizar com window.orcamentoItens e variável local
        window.orcamentoItens = orcamentoItensLocal;
        orcamentoItens = orcamentoItensLocal;

        if (typeof window.renderOrcamentoItens === "function") {
          window.renderOrcamentoItens();
        } else {
          renderOrcamentoItens();
        }
        if (typeof window.calculateTotals === "function") {
          window.calculateTotals();
        } else if (typeof calculateTotals === "function") {
          calculateTotals();
        }
      }

      fecharModal();

      // Limpar busca
      const produtoSearch = document.querySelector("#produtoSearch");
      const produtosSearchResults = document.querySelector(
        "#produtosSearchResults"
      );
      if (produtoSearch) produtoSearch.value = "";
      if (produtosSearchResults) produtosSearchResults.style.display = "none";
    });

    // Fechar ao clicar no overlay
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        fecharModal();
      }
    });

    // Fechar com ESC
    const escHandler = (e) => {
      if (e.key === "Escape") {
        fecharModal();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);

    // Calcular valores iniciais
    calcularTotais();

    // Focar no campo quantidade
    setTimeout(() => {
      const quantidadeInput = modal.querySelector("#modalQuantidade");
      if (quantidadeInput) {
        quantidadeInput.focus();
      }
    }, 100);
  } catch (error) {
    console.error("❌ Erro ao abrir modal:", error);
    console.error("Stack trace:", error.stack);

    // CRÍTICO: Resetar flag mesmo em caso de erro
    window._abrirProdutoModalEmExecucao = false;

    // Limpar qualquer overlay/modal parcial criado
    const errorOverlay = document.getElementById("produtoDetalhesOverlay");
    const errorModal = document.getElementById("produtoDetalhesModal");
    if (errorOverlay) errorOverlay.remove();
    if (errorModal) errorModal.remove();

    // Restaurar estilos do body em caso de erro
    document.body.style.overflow = overlay?.dataset?.bodyOverflow || "";
    document.documentElement.style.overflow =
      overlay?.dataset?.htmlOverflow || "";

    window.alert(
      "Erro ao abrir modal do produto. Verifique o console para mais detalhes."
    );
  }
};

/**
 * Pedido Form Page - Página separada para criar/editar pedidos
 */
function initPedidosPage() {
  const openBtn = document.querySelector("#pedidoCriar");
  const editBtn = document.querySelector("#pedidoEditar");
  const removeBtn = document.querySelector("#pedidoRemover");
  const listContainer = document.querySelector("#pedidosLista");

  let selectedPedidoId = "";

  const updateActionsState = () => {
    const hasSelection = Boolean(selectedPedidoId);
    if (editBtn) editBtn.disabled = !hasSelection;
    if (removeBtn) removeBtn.disabled = !hasSelection;
  };

  const renderPedidos = async () => {
    if (!listContainer) return;

    // Carregar pedidos da API ou localStorage
    let pedidos = [];
    try {
      const API = window.oursalesAPI;
      if (API) {
        const response = await API.getPedidos();
        pedidos = Array.isArray(response) ? response : response.data || [];
      } else {
        const state = storage.load();
        pedidos = state.pedidos || [];
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      const state = storage.load();
      pedidos = state.pedidos || [];
    }

    if (pedidos.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <h3>Nenhum pedido registrado</h3>
          <p>Clique em "Novo pedido" para começar.</p>
        </div>
      `;
      updateActionsState();
      return;
    }

    // Obter colunas personalizadas
    const customColumns = getCustomColumns("pedidos");
    const allColumns = [
      "cliente",
      "valorSemImposto",
      "valorComImposto",
      "dataEntrega",
      "status",
      "transportadora",
    ];
    const visibleColumns =
      customColumns.length > 0 ? customColumns : allColumns;

    const linhas = pedidos
      .map((pedido) => {
        let rowContent = `
          <tr class="table-row${
            pedido.id === selectedPedidoId ? " is-selected" : ""
          }" data-id="${pedido.id}">
            <td class="select-cell">
              <label class="select-radio">
                <input type="checkbox" name="pedidoSelecionado" value="${
                  pedido.id
                }" />
              </label>
            </td>`;

        // Renderizar colunas dinamicamente
        visibleColumns.forEach((column) => {
          let cellContent = "";
          switch (column) {
            case "cliente":
              cellContent = pedido.clienteNome || "-";
              break;
            case "valorSemImposto":
              cellContent = formatCurrency(
                pedido.valorSemImposto || pedido.valorTotal || 0
              );
              break;
            case "valorComImposto":
              cellContent = formatCurrency(
                pedido.valorComImposto || pedido.valorTotal || 0
              );
              break;
            case "dataEntrega":
              cellContent = pedido.dataEntrega
                ? new Date(pedido.dataEntrega).toLocaleDateString("pt-BR")
                : "-";
              break;
            case "status":
              cellContent = `<span class="status ${
                pedido.status === "ativo" ? "active" : "inactive"
              }">${pedido.status === "ativo" ? "Ativo" : "Inativo"}</span>`;
              break;
            case "transportadora":
              cellContent = pedido.transportadora || "-";
              break;
            case "observacoes":
              cellContent = pedido.observacoes || "-";
              break;
            case "dataCriacao":
              cellContent = pedido.dataPedido
                ? new Date(pedido.dataPedido).toLocaleDateString("pt-BR")
                : "-";
              break;
            case "vendedor":
              cellContent = pedido.vendedor || "-";
              break;
            case "prazoPagamento":
              cellContent = pedido.prazoPagamento || "-";
              break;
            default:
              cellContent = "-";
          }

          const className = column === "cliente" ? "" : "dynamic-column";
          rowContent += `<td class="${className}">${cellContent}</td>`;
        });

        rowContent += "</tr>";
        return rowContent;
      })
      .join("");

    // Construir cabeçalho dinamicamente
    const headerCells = visibleColumns
      .map((column) => {
        const labels = {
          cliente: "Cliente",
          valorSemImposto: "Valor Sem Imposto",
          valorComImposto: "Valor Com Imposto",
          dataEntrega: "Data Entrega",
          status: "Status",
          transportadora: "Transportadora",
          observacoes: "Observações",
          dataCriacao: "Data Criação",
          vendedor: "Vendedor",
          prazoPagamento: "Prazo Pagamento",
        };
        return `<th>${labels[column] || column}</th>`;
      })
      .join("");

    listContainer.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="select-cell">
                <input type="checkbox" class="select-all-checkbox" title="Selecionar todos">
              </th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;

    syncSelection(listContainer, "pedidoSelecionado", selectedPedidoId);
    updateActionsState();

    // Adicionar click nas linhas para seleção
    listContainer.querySelectorAll("tbody tr").forEach((row) => {
      row.style.cursor = "pointer";
      row.addEventListener("click", (e) => {
        if (
          e.target.closest('input[type="checkbox"]') ||
          e.target.closest("button")
        ) {
          return;
        }
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });

      // Double click para editar
      row.addEventListener("dblclick", (e) => {
        // Não editar se clicou no checkbox ou botão
        if (
          e.target.closest('input[type="checkbox"]') ||
          e.target.closest("button")
        ) {
          return;
        }

        const pedidoId = row.getAttribute("data-id");
        if (pedidoId) {
          // Selecionar o pedido
          const checkbox = row.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event("change", { bubbles: true }));
          }
          // Aguardar um pouco para garantir que a seleção foi processada
          setTimeout(() => {
            window.sessionStorage.setItem("oursales:editPedido", pedidoId);
            window.location.href = "pedido-form.html";
          }, 100);
        }
      });
    });
  };

  // Event listeners
  if (openBtn) {
    console.log("✅ Botão pedidoCriar encontrado, adicionando listener");
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("✅ Click no botão pedidoCriar detectado");
      window.location.href = "pedido-form.html";
    });
  } else {
    console.error("❌ Botão #pedidoCriar não encontrado!");
  }

  editBtn?.addEventListener("click", () => {
    if (!validateSingleSelection("edit")) {
      return;
    }
    const checkedBoxes = listContainer.querySelectorAll(
      'input[type="checkbox"][name="pedidoSelecionado"]:checked'
    );
    selectedPedidoId = checkedBoxes[0].value;
    window.sessionStorage.setItem("oursales:editPedido", selectedPedidoId);
    window.location.href = "pedido-form.html";
  });

  removeBtn?.addEventListener("click", async () => {
    if (!selectedPedidoId) {
      window.alert("Selecione um pedido para remover.");
      return;
    }

    // Buscar pedido
    let pedido;
    try {
      const API = window.oursalesAPI;
      if (API) {
        pedido = await API.getPedido(selectedPedidoId);
      } else {
        const state = storage.load();
        pedido = state.pedidos?.find((p) => p.id === selectedPedidoId);
      }
    } catch (error) {
      console.error("Erro ao buscar pedido:", error);
      const state = storage.load();
      pedido = state.pedidos?.find((p) => p.id === selectedPedidoId);
    }

    if (!pedido) {
      window.alert("Pedido não encontrado.");
      return;
    }

    const confirmacao = window.confirm(
      `Confirma remover o pedido #${
        pedido.numero || pedido.id
      }?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmacao) return;

    try {
      const API = window.oursalesAPI;
      if (API) {
        await API.deletePedido(selectedPedidoId);
      } else {
        storage.update((draft) => {
          draft.pedidos =
            draft.pedidos?.filter((p) => p.id !== selectedPedidoId) || [];
        });
      }
      selectedPedidoId = "";
      await renderPedidos();
      window.alert("Pedido removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover pedido:", error);
      window.alert(
        "Erro ao remover pedido: " + (error.message || "Erro desconhecido")
      );
    }
  });

  // Event listener para seleção
  listContainer?.addEventListener("change", (event) => {
    const input = event.target.closest(
      'input[type="checkbox"][name="pedidoSelecionado"]'
    );
    if (!input) return;

    // Atualizar seleção
    const checkedBoxes = listContainer.querySelectorAll(
      'input[type="checkbox"][name="pedidoSelecionado"]:checked'
    );
    if (checkedBoxes.length === 1) {
      selectedPedidoId = checkedBoxes[0].value;
    } else if (checkedBoxes.length === 0) {
      selectedPedidoId = "";
    }

    syncSelection(listContainer, "pedidoSelecionado", selectedPedidoId);
    updateActionsState();
  });

  // Event listener para clique em qualquer área do item
  listContainer?.addEventListener("click", (event) => {
    const listItem = event.target.closest(".list-item");
    if (!listItem) return;

    const pedidoId = listItem.dataset.id;
    if (!pedidoId) return;

    // Encontrar o radio button correspondente e fazer toggle
    const radioButton = listItem.querySelector(
      'input[type="radio"][name="pedidoSelecionado"]'
    );
    if (radioButton) {
      // Toggle: se já está selecionado, desmarcar
      if (selectedPedidoId === pedidoId) {
        radioButton.checked = false;
        selectedPedidoId = "";
      } else {
        radioButton.checked = true;
        selectedPedidoId = pedidoId;
      }
      syncSelection(listContainer, "pedidoSelecionado", selectedPedidoId);
      updateActionsState();
    }
  });

  renderPedidos();
}

function initPedidoFormPage() {
  // Garantir que o scroll não esteja bloqueado (limpeza de resquícios do modal)
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";

  const form = document.querySelector("#pedidoForm");
  if (!form) return;

  const formTitle = document.querySelector("#pedidoFormTitle");

  const fields = {
    id: document.querySelector("#pedidoId"),
    cliente: document.querySelector("#pedidoCliente"),
    comprador: document.querySelector("#pedidoComprador"),
    transportadora: document.querySelector("#pedidoTransportadora"),
    tipoFrete: document.querySelector("#pedidoTipoFrete"),
    dataVenda: document.querySelector("#pedidoDataVenda"),
    previsaoEntrega: document.querySelector("#pedidoPrevisaoEntrega"),
    dataFatura: document.querySelector("#pedidoDataFatura"),
    notaFiscal: document.querySelector("#pedidoNotaFiscal"),
    tipo: document.querySelector("#pedidoTipo"),
    cancelado: document.querySelector("#pedidoCancelado"),
    ordemCompra: document.querySelector("#pedidoOrdemCompra"),
    numeroERP: document.querySelector("#pedidoNumeroERP"),
    status: document.querySelector("#pedidoStatus"),
    vendedor: document.querySelector("#pedidoVendedor"),
    observacoes: document.querySelector("#pedidoObservacoes"),
    condicaoPagamento: document.querySelector("#pedidoCondicaoPagamento"),
    observacaoPrivada: document.querySelector("#pedidoObservacaoPrivada"),
    enderecoEntrega: document.querySelector("#pedidoEnderecoEntrega"),
    fatorCubagem: document.querySelector("#pedidoFatorCubagem"),
    valorFrete: document.querySelector("#valorFrete"),
    valorAcrescimo: document.querySelector("#valorAcrescimo"),
    valorDesconto: document.querySelector("#valorDesconto"),
  };

  let pedidoItens = [];
  let editingPedidoId =
    window.sessionStorage.getItem("oursales:editPedido") || null;

  if (editingPedidoId) {
    window.sessionStorage.removeItem("oursales:editPedido");
  }

  // Tornar pedidoItens acessível globalmente para o modal
  window.pedidoItens = pedidoItens;

  // Funções auxiliares
  const refreshSelects = () => {
    fillClientesSelect(fields.cliente);
    fillTransportadorasSelect(fields.transportadora);
  };

  const calculateTotals = () => {
    const frete = Number.parseFloat(fields.valorFrete.value) || 0;
    const acrescimo = Number.parseFloat(fields.valorAcrescimo.value) || 0;
    const desconto = Number.parseFloat(fields.valorDesconto.value) || 0;

    let subtotal = 0;
    window.pedidoItens.forEach((item) => {
      subtotal += (item.precoFinal || 0) * (item.quantidade || 0);
    });

    const totalSemImpostos = subtotal;
    const totalFinal = subtotal + frete + acrescimo - desconto;

    // Atualizar visualização
    const totalItensEl = document.querySelector("#totalItens");
    const totalProdutosEl = document.querySelector("#totalProdutos");
    const totalSemImpostosEl = document.querySelector("#totalSemImpostos");
    const totalFreteEl = document.querySelector("#totalFrete");
    const totalAcrescimoEl = document.querySelector("#totalAcrescimo");
    const totalDescontoEl = document.querySelector("#totalDesconto");
    const totalFinalEl = document.querySelector("#totalFinal");

    if (totalItensEl)
      totalItensEl.textContent = window.pedidoItens.length.toFixed(2);
    if (totalProdutosEl)
      totalProdutosEl.textContent = window.pedidoItens
        .reduce((sum, item) => sum + (item.quantidade || 0), 0)
        .toFixed(2);
    if (totalSemImpostosEl)
      totalSemImpostosEl.textContent = formatCurrency(totalSemImpostos);
    if (totalFreteEl) totalFreteEl.textContent = formatCurrency(frete);
    if (totalAcrescimoEl)
      totalAcrescimoEl.textContent = formatCurrency(acrescimo);
    if (totalDescontoEl) totalDescontoEl.textContent = formatCurrency(desconto);
    if (totalFinalEl) totalFinalEl.textContent = formatCurrency(totalFinal);
  };

  // Função para calcular totais do pedido (tornar acessível globalmente)
  window.calculateTotalsPedido = calculateTotals;

  // Renderizar itens do pedido
  function renderPedidoItens() {
    const tbody = document.querySelector("#pedidoItensList");
    if (!tbody) return;

    if (window.pedidoItens.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="empty-state">
            Nenhum produto adicionado neste pedido!
          </td>
        </tr>
      `;

      // Atualizar total da tabela
      const tabelaTotalEl = document.querySelector("#tabelaTotalPedido");
      if (tabelaTotalEl) {
        tabelaTotalEl.textContent = formatCurrency(0);
      }

      return;
    }

    // Buscar informações de indústria para cada produto
    const industrias = getIndustrias();

    tbody.innerHTML = window.pedidoItens
      .map((item, index) => {
        // Buscar indústria do produto
        const produto = storage
          .load()
          .produtos.find((p) => p.id === item.produtoId);
        const industria = produto
          ? industrias.find((i) => i.id === produto.industriaId)
          : null;
        const industriaNome = industria
          ? industria.nomeFantasia || industria.razaoSocial || "-"
          : "-";

        // Descontos específicos do item (formato: [5, 3, 0, 0, 0, 0, 0] -> "5+3+0+0+0+0+0")
        const descontosItem = item.descontosItem || [0, 0, 0, 0, 0, 0, 0];
        const descontosItemTexto = descontosItem.join("+");
        const temDescontosItem = descontosItem.some((d) => d !== 0);

        return `
        <tr>
          <td>
            <input type="checkbox" />
          </td>
          <td style="position: relative; vertical-align: top;">
            <div style="margin-bottom: 4px;">
              <button 
                type="button" 
                onclick="window.editarDescontosItemPedido && window.editarDescontosItemPedido(${index})"
                style="background: ${
                  temDescontosItem ? "#3b82f6" : "#f3f4f6"
                }; color: ${
          temDescontosItem ? "white" : "#6b7280"
        }; border: 1px solid ${
          temDescontosItem ? "#3b82f6" : "#d1d5db"
        }; cursor: pointer; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;"
                title="Editar descontos específicos do item"
              >
                ${temDescontosItem ? descontosItemTexto : "0+0+0+0+0+0+0"}
              </button>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              ${item.codigo || "-"}
              <button 
                type="button" 
                onclick="window.abrirObservacaoItemPedido && window.abrirObservacaoItemPedido(${index})"
                style="background: none; border: none; cursor: pointer; padding: 2px; font-size: 14px; color: ${
                  (item.observacaoItem || "").trim().length > 0
                    ? "#dc2626"
                    : "#6b7280"
                };"
                title="${
                  (item.observacaoItem || "").trim().length > 0
                    ? "Editar observação"
                    : "Adicionar observação"
                }"
              >
                💬
              </button>
            </div>
            ${
              (item.observacaoItem || "").trim().length > 0
                ? `
              <div style="color: #dc2626; font-size: 12px; margin-top: 4px; padding: 4px; background: rgba(220, 38, 38, 0.1); border-radius: 4px; word-break: break-word; white-space: normal; line-height: 1.4;">
                ${item.observacaoItem}
              </div>
            `
                : ""
            }
          </td>
          <td style="vertical-align: top;">${item.produtoNome || "-"}</td>
          <td style="vertical-align: top;">${industriaNome}</td>
          <td style="vertical-align: top;">-</td>
          <td style="vertical-align: top;">${formatCurrency(
            (() => {
              // Calcular preço da tabela dinâmico
              // Prioridade: descontos específicos do item + descontos aplicados dos quadrados > descontos do modal > preço original
              let precoTabelaDinamico = item.precoTabela || 0;

              // Se há descontos específicos do item ou descontos aplicados dos quadrados, recalcular
              const temDescontosItem =
                item.descontosItem && item.descontosItem.some((d) => d !== 0);
              const temDescontosQuadrados =
                item.descontosAplicados && item.descontosAplicados.length > 0;
              const temDescontosModal =
                item.descontos && item.descontos.length > 0;

              if (
                temDescontosItem ||
                temDescontosQuadrados ||
                temDescontosModal
              ) {
                precoTabelaDinamico =
                  item.precoComDesconto || precoTabelaDinamico;
              }
              return precoTabelaDinamico;
            })()
          )}</td>
          <td style="vertical-align: top;">${formatCurrency(
            item.precoFinal || 0
          )}</td>
          <td style="vertical-align: top;">
            <input type="number" min="0" step="0.01" value="${
              item.quantidade || 1
            }" 
                   style="width: 80px; padding: 4px;" 
                   onchange="window.atualizarQuantidadePedido && window.atualizarQuantidadePedido(${index}, this.value)">
          </td>
          <td style="vertical-align: top;">0</td>
          <td style="vertical-align: top;">${formatCurrency(
            (item.precoFinal || 0) * (item.quantidade || 0)
          )}</td>
        </tr>
      `;
      })
      .join("");

    // Atualizar total da tabela
    const total = window.pedidoItens.reduce(
      (sum, item) => sum + (item.precoFinal || 0) * (item.quantidade || 0),
      0
    );
    const tabelaTotalEl = document.querySelector("#tabelaTotalPedido");
    if (tabelaTotalEl) {
      tabelaTotalEl.textContent = formatCurrency(total);
    }
  }

  // Tornar função de renderização acessível globalmente
  window.renderPedidoItens = renderPedidoItens;

  // Função para atualizar quantidade do item do pedido
  window.atualizarQuantidadePedido = function (index, quantidade) {
    if (!window.pedidoItens || !Array.isArray(window.pedidoItens)) {
      console.error("window.pedidoItens não está disponível");
      return;
    }
    window.pedidoItens[index].quantidade = parseFloat(quantidade) || 0;
    // Atualizar total do item
    window.pedidoItens[index].total =
      window.pedidoItens[index].precoComDesconto *
      window.pedidoItens[index].quantidade;
    window.pedidoItens[index].totalBruto =
      window.pedidoItens[index].precoFinal *
      window.pedidoItens[index].quantidade;
    // Sincronizar com pedidoItens local
    pedidoItens[index] = window.pedidoItens[index];
    renderPedidoItens();
    calculateTotals();
  };

  // Função para remover item do pedido
  window.removerItemPedido = function (index) {
    if (!window.pedidoItens || !Array.isArray(window.pedidoItens)) {
      console.error("window.pedidoItens não está disponível");
      return;
    }
    window.pedidoItens.splice(index, 1);
    // Sincronizar com pedidoItens local
    pedidoItens = window.pedidoItens;
    renderPedidoItens();
    calculateTotals();
  };

  window.abrirObservacaoItemPedido = function (index) {
    if (!window.pedidoItens || !Array.isArray(window.pedidoItens)) {
      console.error("window.pedidoItens não está disponível");
      return;
    }
    const item = window.pedidoItens[index];
    const observacaoAtual = item.observacaoItem || "";
    const novaObservacao = window.prompt(
      "Observação específica do item:",
      observacaoAtual
    );

    if (novaObservacao !== null) {
      item.observacaoItem = novaObservacao.trim();
      // Sincronizar com pedidoItens local
      pedidoItens[index] = window.pedidoItens[index];
      renderPedidoItens();
    }
  };

  window.editarDescontosItemPedido = function (index) {
    if (!window.pedidoItens || !Array.isArray(window.pedidoItens)) {
      console.error("window.pedidoItens não está disponível");
      return;
    }
    const item = window.pedidoItens[index];
    const descontosAtuais = item.descontosItem || [0, 0, 0];
    const descontosTexto = descontosAtuais.join("+");

    const novoTexto = window.prompt(
      "Descontos específicos do item (formato: 5+3+0, use valores negativos para acréscimo):",
      descontosTexto
    );

    if (novoTexto !== null) {
      // Parse do texto (ex: "5+3+0" ou "5+-3+0")
      const partes = novoTexto.split("+").map((p) => parseFloat(p.trim()) || 0);
      // Garantir que temos 3 valores
      const descontos = [partes[0] || 0, partes[1] || 0, partes[2] || 0];

      item.descontosItem = descontos;

      // Recalcular preço com os novos descontos específicos do item
      const precoTabela = item.precoTabela || 0;
      let novoPrecoComDesconto = precoTabela;

      // Aplicar descontos específicos do item primeiro
      descontos.forEach((desc) => {
        if (desc > 0) {
          novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
        } else if (desc < 0) {
          novoPrecoComDesconto =
            novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
        }
      });

      // Depois aplicar descontos dos quadrados (se houver)
      if (item.descontosAplicados && item.descontosAplicados.length > 0) {
        item.descontosAplicados.forEach((desc) => {
          if (desc > 0) {
            novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
          } else if (desc < 0) {
            novoPrecoComDesconto =
              novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
          }
        });
      }
      // Se não há descontos dos quadrados, aplicar descontos do modal
      else if (item.descontos && item.descontos.length > 0) {
        item.descontos.forEach((desc) => {
          if (desc > 0) {
            novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
          } else if (desc < 0) {
            novoPrecoComDesconto =
              novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
          }
        });
      }

      item.precoComDesconto = novoPrecoComDesconto;
      const ipi = item.ipi || 0;
      const st = item.st || 0;
      const valorIPI = (novoPrecoComDesconto * ipi) / 100;
      const valorST = (novoPrecoComDesconto * st) / 100;
      item.precoFinal = novoPrecoComDesconto + valorIPI + valorST;
      item.total = novoPrecoComDesconto * item.quantidade;
      item.totalBruto = item.precoFinal * item.quantidade;

      // Sincronizar com pedidoItens local
      pedidoItens[index] = window.pedidoItens[index];
      renderPedidoItens();
      calculateTotals();
    }
  };

  // Função para calcular totais do pedido (tornar acessível globalmente)
  window.calculateTotalsPedido = calculateTotals;

  // Event Listeners
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const clienteId = fields.cliente.value;
    if (!clienteId) {
      window.alert("Selecione um cliente.");
      return;
    }

    const cliente = storage
      .load()
      .clientes.find((item) => item.id === clienteId);
    if (!cliente) {
      window.alert("Cliente não encontrado.");
      return;
    }

    // Mapear itens para o formato esperado pela API
    const itensFormatados = (window.pedidoItens || pedidoItens || []).map(
      (item) => ({
        produtoId: item.produtoId,
        quantidade: Number.parseFloat(item.quantidade) || 0,
        precoUnitario: Number.parseFloat(
          item.precoComDesconto || item.precoTabela || 0
        ),
        descontoValor: Number.parseFloat(item.descontoValor || 0),
        descontoPercentual: Number.parseFloat(item.descontoPercentual || 0),
        observacoes: item.observacoes || null,
      })
    );

    if (itensFormatados.length === 0) {
      window.alert("Adicione pelo menos um item ao pedido.");
      return;
    }

    const data = {
      clienteId,
      transportadoraId: fields.transportadora.value || "",
      itens: itensFormatados,
      dataVenda:
        fields.dataVenda.value || new Date().toISOString().split("T")[0],
      previsaoEntrega: fields.previsaoEntrega.value || "",
      dataFatura: fields.dataFatura.value || "",
      notaFiscal: fields.notaFiscal.value.trim(),
      tipo: fields.tipo?.value || "pedido",
      cancelado: fields.cancelado?.checked || false,
      ordemCompra: fields.ordemCompra?.value.trim() || "",
      numeroERP: fields.numeroERP?.value.trim() || "",
      status: fields.status?.value || "pendente",
      vendedor: fields.vendedor?.value || "",
      observacoes: fields.observacoes.value.trim(),
      condicaoPagamento: fields.condicaoPagamento?.value.trim() || "",
      observacaoPrivada: fields.observacaoPrivada?.value.trim() || "",
      enderecoEntrega: fields.enderecoEntrega?.value.trim() || "",
      fatorCubagem: Number.parseFloat(fields.fatorCubagem?.value) || 0,
    };

    const API = window.oursalesAPI;
    if (!API) {
      window.alert("Erro: API não disponível. Recarregue a página.");
      return;
    }

    try {
      if (editingPedidoId) {
        await API.updatePedido(editingPedidoId, data);
        window.alert("Pedido atualizado com sucesso!");
      } else {
        await API.createPedido(data);
        window.alert("Pedido criado com sucesso!");
      }
      window.location.href = "pedidos.html";
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
      window.alert(
        `Erro ao salvar pedido: ${error.message || "Erro desconhecido"}`
      );
    }
  });

  // Event listeners para botões adicionais
  const salvarEnviarBtn = document.querySelector("#pedidoSalvarEnviar");
  const visualizarBtn = document.querySelector("#pedidoVisualizar");
  const personalizarBtn = document.querySelector("#personalizarCampos");
  const procurarBtn = document.querySelector("#pedidoClienteProcurar");
  const clienteSearchInput = document.querySelector("#pedidoClienteSearch");

  salvarEnviarBtn?.addEventListener("click", () => {
    // Simular envio do pedido
    if (
      window.confirm("Confirma salvar e enviar o pedido para processamento?")
    ) {
      // Primeiro salvar o pedido
      form.dispatchEvent(new Event("submit"));

      // Depois simular envio
      setTimeout(() => {
        window.alert("Pedido salvo e enviado com sucesso!");
      }, 1000);
    }
  });

  visualizarBtn?.addEventListener("click", () => {
    // Simular visualização do pedido
    const clienteId = fields.cliente.value;
    if (!clienteId) {
      window.alert("Selecione um cliente para visualizar o pedido.");
      return;
    }

    const cliente = storage.load().clientes.find((c) => c.id === clienteId);
    if (!cliente) {
      window.alert("Cliente não encontrado.");
      return;
    }

    // Criar uma nova janela com a visualização
    const visualizacao = `
      <html>
        <head>
          <title>Pedido - ${cliente.nome}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .cliente-info { margin-bottom: 20px; }
            .totais { margin-top: 20px; text-align: right; }
            .total-final { font-size: 1.2em; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PEDIDO</h1>
            <p>Cliente: ${cliente.nome}</p>
            <p>Data: ${new Date().toLocaleDateString("pt-BR")}</p>
          </div>
          <div class="cliente-info">
            <p><strong>Cliente:</strong> ${cliente.nome}</p>
            <p><strong>Documento:</strong> ${cliente.documento || "N/A"}</p>
            <p><strong>E-mail:</strong> ${cliente.email || "N/A"}</p>
          </div>
          <div class="totais">
            <p>Total de Itens: ${pedidoItens.length}</p>
            <p>Total Final: ${formatCurrency(
              pedidoItens.reduce(
                (sum, item) =>
                  sum + (item.precoFinal || 0) * (item.quantidade || 0),
                0
              )
            )}</p>
          </div>
        </body>
      </html>
    `;

    const novaJanela = window.open("", "_blank");
    novaJanela.document.write(visualizacao);
    novaJanela.document.close();
  });

  personalizarBtn?.addEventListener("click", () => {
    // Simular personalização de campos
    const camposPersonalizaveis = [
      "Observações",
      "Observação Privada",
      "Endereço de Entrega",
      "Fator de Cubagem",
      "Número ERP",
    ];

    const camposSelecionados = camposPersonalizaveis.filter((campo) =>
      window.confirm(`Incluir campo "${campo}" no formulário?`)
    );

    if (camposSelecionados.length > 0) {
      window.alert(
        `Campos personalizados adicionados:\n${camposSelecionados.join("\n")}`
      );
    } else {
      window.alert("Nenhum campo personalizado foi selecionado.");
    }
  });

  procurarBtn?.addEventListener("click", () => {
    const termo = clienteSearchInput?.value.trim();
    if (!termo) {
      window.alert("Digite um termo para procurar.");
      return;
    }

    const clientes = storage.load().clientes;
    const resultados = clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(termo.toLowerCase()) ||
        cliente.documento?.includes(termo) ||
        cliente.email?.toLowerCase().includes(termo.toLowerCase())
    );

    if (resultados.length === 0) {
      window.alert("Nenhum cliente encontrado com o termo pesquisado.");
      return;
    }

    if (resultados.length === 1) {
      fields.cliente.value = resultados[0].id;
      clienteSearchInput.value = "";
      window.alert(`Cliente selecionado: ${resultados[0].nome}`);
    } else {
      const listaClientes = resultados
        .map((c) => `${c.nome} (${c.documento || "N/A"})`)
        .join("\n");
      window.alert(
        `Múltiplos clientes encontrados:\n\n${listaClientes}\n\nSelecione manualmente na lista.`
      );
    }
  });

  // Calcular totais ao mudar valores
  fields.valorFrete?.addEventListener("input", calculateTotals);
  fields.valorAcrescimo?.addEventListener("input", calculateTotals);
  fields.valorDesconto?.addEventListener("input", calculateTotals);

  // === BUSCA DE PRODUTOS (similar ao orçamento) ===
  const filtroIndustria = document.querySelector("#filtroIndustria");
  const filtroTabelaPreco = document.querySelector("#filtroTabelaPreco");
  const produtoSearch = document.querySelector("#produtoSearch");
  const produtosSearchResults = document.querySelector(
    "#produtosSearchResults"
  );
  const produtosResultsList = document.querySelector("#produtosResultsList");

  // Carregar indústrias no filtro
  function carregarIndustriasFiltro() {
    const industrias = getIndustrias();
    if (!filtroIndustria) {
      console.warn("⚠️ filtroIndustria não encontrado");
      return;
    }
    console.log(
      "🔍 carregarIndustriasFiltro - encontradas",
      industrias.length,
      "indústrias"
    );
    filtroIndustria.innerHTML = '<option value="">Todas as indústrias</option>';
    industrias.forEach((ind) => {
      const option = document.createElement("option");
      option.value = ind.id;
      option.textContent =
        ind.nomeFantasia || ind.razaoSocial || ind.nome || "-";
      filtroIndustria.appendChild(option);
    });
  }

  // Carregar tabelas de preço no filtro
  function carregarTabelasPrecoFiltro() {
    if (!filtroTabelaPreco || !filtroIndustria) {
      console.warn("⚠️ filtroTabelaPreco ou filtroIndustria não encontrado");
      return;
    }
    const industriaId = filtroIndustria.value;
    filtroTabelaPreco.innerHTML = '<option value="">Todas as tabelas</option>';

    if (!industriaId) {
      filtroTabelaPreco.disabled = false;
      // Carregar todas as tabelas
      const industrias = getIndustrias();
      let totalTabelas = 0;
      industrias.forEach((ind) => {
        const tabelas = ind.tabelasPrecos || [];
        totalTabelas += tabelas.length;
        tabelas.forEach((tab) => {
          const option = document.createElement("option");
          option.value = tab.id;
          option.textContent = `${ind.nomeFantasia || ind.razaoSocial} | ${
            tab.nome
          }`;
          filtroTabelaPreco.appendChild(option);
        });
      });
      console.log(
        "🔍 carregarTabelasPrecoFiltro - carregadas",
        totalTabelas,
        "tabelas (todas as indústrias)"
      );
      return;
    }

    filtroTabelaPreco.disabled = false;
    const industria = getIndustrias().find((i) => i.id === industriaId);
    const tabelas = industria?.tabelasPrecos || [];
    console.log(
      "🔍 carregarTabelasPrecoFiltro - indústria",
      industriaId,
      "- encontradas",
      tabelas.length,
      "tabelas"
    );
    tabelas.forEach((tab) => {
      const option = document.createElement("option");
      option.value = tab.id;
      option.textContent = tab.nome;
      filtroTabelaPreco.appendChild(option);
    });
  }

  // Buscar produtos
  function buscarProdutos() {
    if (!produtoSearch || !produtosResultsList || !produtosSearchResults)
      return;

    const searchTerm = (produtoSearch.value || "").trim().toLowerCase();
    const industriaId = filtroIndustria?.value || "";
    const tabelaPrecoId = filtroTabelaPreco?.value || "";

    if (!searchTerm || searchTerm.length < 2) {
      produtosSearchResults.style.display = "none";
      return;
    }

    // Sempre recarregar do localStorage para garantir dados atualizados
    storage.cache = null;
    const produtos = storage.load().produtos || [];
    const industrias = getIndustrias();

    console.log(
      "🔍 buscarProdutos (pedido) - termo:",
      searchTerm,
      "- produtos no sistema:",
      produtos.length,
      "- indústrias:",
      industrias.length
    );

    let resultados = produtos.filter((produto) => {
      // Filtrar por termo de busca
      const matchSearch =
        (produto.nome || "").toLowerCase().includes(searchTerm) ||
        (produto.codigo || "").toLowerCase().includes(searchTerm) ||
        (produto.codigoOriginal || produto.sku || "")
          .toLowerCase()
          .includes(searchTerm);

      if (!matchSearch) return false;

      // Filtrar por indústria
      if (industriaId && produto.industriaId !== industriaId) {
        return false;
      }

      // Filtrar por tabela de preço
      if (tabelaPrecoId && produto.tabelaPreco !== tabelaPrecoId) {
        // Verificar se o produto está na tabela de preço selecionada
        const industria = industrias.find(
          (i) => i.id === (produto.industriaId || industriaId)
        );
        const tabela = industria?.tabelasPrecos?.find(
          (t) => t.id === tabelaPrecoId
        );
        if (
          !tabela ||
          !tabela.produtos?.some((p) => p.produtoId === produto.id)
        ) {
          return false;
        }
      }

      return true;
    });

    // Para cada produto, encontrar o preço na tabela de preço
    resultados = resultados.map((produto) => {
      const industria = industrias.find((i) => i.id === produto.industriaId);
      let precoTabela = produto.precoVenda || 0;
      let tabelaPrecoNome = "";
      let industriaNome =
        industria?.nomeFantasia || industria?.razaoSocial || "";
      let codigoOriginal = produto.codigoOriginal || produto.sku || "-";
      let unidade = produto.unidadeMedida || "UN";
      let embalagem = produto.embalagem || produto.quantidadeEmbalagem || "-";

      // Se há tabela de preço selecionada, buscar o preço específico
      if (tabelaPrecoId) {
        const tabela = industria?.tabelasPrecos?.find(
          (t) => t.id === tabelaPrecoId
        );
        if (tabela) {
          tabelaPrecoNome = tabela.nome;
          const produtoTabela = tabela.produtos?.find(
            (p) => p.produtoId === produto.id
          );
          if (produtoTabela) {
            precoTabela = produtoTabela.preco || precoTabela;
          }
        }
      } else if (produto.tabelaPreco) {
        // Usar a tabela de preço do produto
        const tabela = industria?.tabelasPrecos?.find(
          (t) => t.id === produto.tabelaPreco
        );
        if (tabela) {
          tabelaPrecoNome = tabela.nome;
          const produtoTabela = tabela.produtos?.find(
            (p) => p.produtoId === produto.id
          );
          if (produtoTabela) {
            precoTabela = produtoTabela.preco || precoTabela;
          }
        }
      }

      return {
        ...produto,
        precoTabela,
        tabelaPrecoNome,
        industriaNome,
        codigoOriginal,
        unidade,
        embalagem,
      };
    });

    // Renderizar resultados
    if (resultados.length === 0) {
      produtosResultsList.innerHTML = `
        <div style="padding: var(--space-4); text-align: center; color: var(--text-tertiary);">
          Nenhum produto encontrado com os filtros selecionados.
        </div>
      `;
      produtosSearchResults.style.display = "block";
      return;
    }

    produtosResultsList.innerHTML = resultados
      .map((produto) => {
        const tagHtml =
          produto.tabelaPrecoNome && produto.industriaNome
            ? `<div style="margin-top: 8px;"><span style="display: inline-block; padding: 4px 12px; background: rgba(102, 126, 234, 0.1); border-radius: 12px; font-size: 12px; color: var(--primary-600);">${produto.industriaNome} | ${produto.tabelaPrecoNome}</span></div>`
            : "";

        return `
          <div style="padding: var(--space-3); border-bottom: 1px solid var(--border-light); cursor: pointer; transition: background 0.2s;" 
               onmouseover="this.style.background='rgba(102, 126, 234, 0.05)'" 
               onmouseout="this.style.background='white'"
               data-produto-id="${produto.id}">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div style="flex: 1;">
                <div style="display: flex; gap: var(--space-3); margin-bottom: var(--space-2);">
                  <strong style="color: var(--text-primary);">Cód. ${
                    produto.codigo || "-"
                  }</strong>
                  <span style="color: var(--text-secondary);">Cód. Interno: ${
                    produto.codigoOriginal || "-"
                  }</span>
                  <span style="color: var(--text-secondary);">Unid: ${
                    produto.unidade || "-"
                  }</span>
                  <span style="color: var(--text-secondary);">Emb: ${
                    produto.embalagem || "-"
                  }</span>
                </div>
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-2);">
                  ${produto.nome || produto.descricao || "-"}
                </div>
                ${tagHtml}
              </div>
              <div style="margin-left: var(--space-4); text-align: right;">
                <div style="font-size: 18px; font-weight: bold; color: var(--primary-600);">
                  R$ ${parseFloat(produto.precoTabela || 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    produtosSearchResults.style.display = "block";

    // Otimizado: usar event delegation (apenas um listener ao invés de N listeners)
    // Remove listener anterior se existir para evitar duplicatas
    if (produtosResultsList._clickHandler) {
      produtosResultsList.removeEventListener(
        "click",
        produtosResultsList._clickHandler
      );
    }
    produtosResultsList._clickHandler = (e) => {
      console.log("🔍 Handler de clique chamado", e.target);
      const item = e.target.closest("[data-produto-id]");
      console.log("🔍 Item encontrado:", item);
      if (item) {
        // CRÍTICO: Prevenir comportamento padrão e propagação ANTES de qualquer coisa
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // IMPORTANTE: Salvar posição de scroll e posição do elemento ANTES de qualquer outra operação
        const scrollY =
          window.scrollY ||
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          0;
        const itemRect = item.getBoundingClientRect();
        console.log("📌 Posição de scroll capturada no clique:", scrollY);
        console.log("📍 Posição do elemento:", itemRect);

        const produtoId = item.getAttribute("data-produto-id");
        console.log("🔍 Produto ID:", produtoId);
        console.log(
          "🔍 window.abrirProdutoModal existe?",
          typeof window.abrirProdutoModal
        );
        if (produtoId && window.abrirProdutoModal) {
          console.log("✅ Chamando abrirProdutoModal...");
          // Chamar IMEDIATAMENTE sem setTimeout para evitar problemas
          window.abrirProdutoModal(produtoId, scrollY, itemRect);
        } else {
          console.error(
            "❌ Erro: produtoId ou abrirProdutoModal não disponível"
          );
        }
        return false;
      }
    };
    produtosResultsList.addEventListener(
      "click",
      produtosResultsList._clickHandler,
      { capture: true } // Usar capture para garantir que seja processado primeiro
    );
  }

  // Event listeners para busca
  filtroIndustria?.addEventListener("change", () => {
    carregarTabelasPrecoFiltro();
    buscarProdutos();
  });

  filtroTabelaPreco?.addEventListener("change", buscarProdutos);

  produtoSearch?.addEventListener("input", debounce(buscarProdutos, 300));

  // Inicializar busca - usar setTimeout para garantir que o DOM está pronto
  setTimeout(() => {
    console.log("🔍 Inicializando filtros de busca de produtos...");
    console.log("🔍 filtroIndustria existe?", !!filtroIndustria);
    console.log("🔍 filtroTabelaPreco existe?", !!filtroTabelaPreco);
    carregarIndustriasFiltro();
    carregarTabelasPrecoFiltro();
  }, 100);

  // Event listeners para botões de descontos adicionais
  const aplicarFiltrosBtn = document.querySelector("#aplicarFiltros");
  const limparFiltrosBtn = document.querySelector("#limparFiltros");

  aplicarFiltrosBtn?.addEventListener("click", () => {
    const filtro1 = parseFloat(document.querySelector("#filtro1")?.value || 0);
    const filtro2 = parseFloat(document.querySelector("#filtro2")?.value || 0);
    const filtro3 = parseFloat(document.querySelector("#filtro3")?.value || 0);
    const filtro4 = parseFloat(document.querySelector("#filtro4")?.value || 0);
    const filtro5 = parseFloat(document.querySelector("#filtro5")?.value || 0);
    const filtro6 = parseFloat(document.querySelector("#filtro6")?.value || 0);
    const filtro7 = parseFloat(document.querySelector("#filtro7")?.value || 0);

    // Coletar TODOS os descontos/acréscimos dos quadrados (cumulativos)
    // Valores positivos = desconto, valores negativos = acréscimo
    const descontosQuadrados = [
      filtro1,
      filtro2,
      filtro3,
      filtro4,
      filtro5,
      filtro6,
      filtro7,
    ].filter((d) => d !== 0); // Aceita valores positivos e negativos

    if (descontosQuadrados.length === 0) {
      window.alert("Informe pelo menos um desconto ou acréscimo para aplicar.");
      return;
    }

    // Aplicar descontos/acréscimos aos itens
    window.pedidoItens.forEach((item) => {
      // SEMPRE usar o preço original da tabela como base
      const precoTabela = item.precoTabela || 0;

      // Primeiro aplicar descontos específicos do item (se houver)
      let novoPrecoComDesconto = precoTabela;
      const descontosItem = item.descontosItem || [0, 0, 0];
      descontosItem.forEach((desc) => {
        if (desc > 0) {
          novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
        } else if (desc < 0) {
          novoPrecoComDesconto =
            novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
        }
      });

      // Depois aplicar TODOS os descontos/acréscimos dos quadrados (cumulativo)
      descontosQuadrados.forEach((desc) => {
        if (desc > 0) {
          // Desconto: reduzir o preço
          novoPrecoComDesconto = novoPrecoComDesconto * (1 - desc / 100);
        } else if (desc < 0) {
          // Acréscimo: aumentar o preço
          novoPrecoComDesconto =
            novoPrecoComDesconto * (1 + Math.abs(desc) / 100);
        }
      });

      item.precoComDesconto = novoPrecoComDesconto;

      // Recalcular IPI e ST sobre o novo preço
      const ipi = item.ipi || 0;
      const st = item.st || 0;
      const valorIPI = (item.precoComDesconto * ipi) / 100;
      const valorST = (item.precoComDesconto * st) / 100;
      item.precoFinal = item.precoComDesconto + valorIPI + valorST;

      // Atualizar totais
      item.total = item.precoComDesconto * item.quantidade;
      item.totalBruto = item.precoFinal * item.quantidade;

      // Salvar descontos aplicados (todos os descontos dos quadrados)
      item.descontosAplicados = [...descontosQuadrados];
    });

    // Sincronizar com pedidoItens local
    pedidoItens = window.pedidoItens;
    renderPedidoItens();
    calculateTotals();
  });

  limparFiltrosBtn?.addEventListener("click", () => {
    // Limpar todos os campos de filtro
    document.querySelector("#filtro1").value = "";
    document.querySelector("#filtro2").value = "";
    document.querySelector("#filtro3").value = "";
    document.querySelector("#filtro4").value = "";
    document.querySelector("#filtro5").value = "";
    document.querySelector("#filtro6").value = "";
    document.querySelector("#filtro7").value = "";

    // Remover TODOS os descontos e voltar ao preço original da tabela
    window.pedidoItens.forEach((item) => {
      // Remover TODOS os descontos (quadrados, específicos do item, etc)
      if (item.descontosAplicados) {
        delete item.descontosAplicados;
      }
      if (item.descontoAdicional) {
        delete item.descontoAdicional;
      }
      if (item.descontosItem) {
        delete item.descontosItem;
      }

      // Voltar ao preço original da tabela (SEM nenhum desconto)
      const precoTabela = item.precoTabela || 0;
      item.precoComDesconto = precoTabela;

      // Recalcular IPI e ST sobre o novo preço
      const ipi = item.ipi || 0;
      const st = item.st || 0;
      const valorIPI = (item.precoComDesconto * ipi) / 100;
      const valorST = (item.precoComDesconto * st) / 100;
      item.precoFinal = item.precoComDesconto + valorIPI + valorST;

      // Atualizar totais
      item.total = item.precoComDesconto * item.quantidade;
      item.totalBruto = item.precoFinal * item.quantidade;
    });

    // Sincronizar com pedidoItens local
    pedidoItens = window.pedidoItens;
    renderPedidoItens();
    calculateTotals();
  });
  // Inicialização
  refreshSelects();
  fields.dataVenda.value = new Date().toISOString().split("T")[0];

  // Carregar dados se for edição
  if (editingPedidoId) {
    const pedido = storage
      .load()
      .pedidos.find((item) => item.id === editingPedidoId);
    if (pedido) {
      formTitle.textContent = `🛒 Pedido - Editando Nº ${pedido.id.toUpperCase()}`;
      fields.cliente.value = pedido.clienteId || "";
      fields.transportadora.value = pedido.transportadoraId || "";
      fields.dataVenda.value = pedido.dataVenda || fields.dataVenda.value;
      fields.previsaoEntrega.value = pedido.previsaoEntrega || "";
      fields.dataFatura.value = pedido.dataFatura || "";
      fields.notaFiscal.value = pedido.notaFiscal || "";
      fields.tipo.value = pedido.tipo || "pedido";
      fields.cancelado.checked = pedido.cancelado || false;
      fields.ordemCompra.value = pedido.ordemCompra || "";
      fields.numeroERP.value = pedido.numeroERP || "";
      fields.status.value = pedido.status || "pendente";
      fields.vendedor.value = pedido.vendedor || "";
      fields.observacoes.value = pedido.observacoes || "";
      fields.condicaoPagamento.value = pedido.condicaoPagamento || "";
      fields.observacaoPrivada.value = pedido.observacaoPrivada || "";
      fields.enderecoEntrega.value = pedido.enderecoEntrega || "";
      fields.fatorCubagem.value = pedido.fatorCubagem || "";
      pedidoItens = pedido.itens || [];
      // Sincronizar com window.pedidoItens
      window.pedidoItens = pedidoItens;
      renderPedidoItens();
    }
  }

  // Inicialização
  refreshSelects();
  fields.dataVenda.value = new Date().toISOString().split("T")[0];
  renderPedidoItens();
  calculateTotals();
}

/**
 * Data Export/Import Module
 * Provides comprehensive backup and migration capabilities
 */
const DataManager = {
  /**
   * Exports all data as JSON file
   */
  exportJSON() {
    try {
      const data = storage.load();
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `oursales-backup-${timestamp}.json`;

      const exportData = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        data: data,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      this._downloadFile(blob, filename);
      window.alert(`Backup exportado com sucesso!\nArquivo: ${filename}`);
    } catch (error) {
      console.error("Erro ao exportar JSON:", error);
      window.alert(
        "Erro ao exportar dados. Verifique o console para detalhes."
      );
    }
  },

  /**
   * Exports all data as CSV files (one per entity)
   */
  exportCSV() {
    try {
      const data = storage.load();
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);

      // Export each entity type
      const exports = [];

      // Clientes
      if (data.clientes.length) {
        const clientesCSV = this._arrayToCSV(data.clientes, [
          { key: "id", label: "ID" },
          { key: "tipo", label: "Tipo" },
          { key: "nome", label: "Nome" },
          { key: "documento", label: "Documento" },
          { key: "email", label: "Email" },
          { key: "telefone", label: "Telefone" },
          { key: "observacoes", label: "Observações" },
        ]);
        exports.push({
          name: `clientes-${timestamp}.csv`,
          content: clientesCSV,
        });
      }

      // Transportadoras
      if (data.transportadoras.length) {
        const transpCSV = this._arrayToCSV(data.transportadoras, [
          { key: "id", label: "ID" },
          { key: "nome", label: "Nome" },
          { key: "prazo", label: "Prazo (dias)" },
          { key: "custo", label: "Custo Médio" },
          { key: "cobertura", label: "Cobertura" },
        ]);
        exports.push({
          name: `transportadoras-${timestamp}.csv`,
          content: transpCSV,
        });
      }

      // Produtos
      if (data.produtos.length) {
        const produtosCSV = this._arrayToCSV(data.produtos, [
          { key: "id", label: "ID" },
          { key: "nome", label: "Nome" },
          { key: "sku", label: "SKU" },
          { key: "categoria", label: "Categoria" },
          { key: "preco", label: "Preço" },
          { key: "estoque", label: "Estoque" },
          { key: "descricao", label: "Descrição" },
        ]);
        exports.push({
          name: `produtos-${timestamp}.csv`,
          content: produtosCSV,
        });
      }

      // Orçamentos
      if (data.orcamentos.length) {
        const orcamentosCSV = this._arrayToCSV(data.orcamentos, [
          { key: "id", label: "ID" },
          { key: "clienteNome", label: "Cliente" },
          { key: "descricao", label: "Descrição" },
          { key: "valor", label: "Valor" },
          { key: "validade", label: "Validade" },
          { key: "observacoes", label: "Observações" },
        ]);
        exports.push({
          name: `orcamentos-${timestamp}.csv`,
          content: orcamentosCSV,
        });
      }

      // Pedidos
      if (data.pedidos.length) {
        const pedidosCSV = this._arrayToCSV(data.pedidos, [
          { key: "id", label: "ID" },
          { key: "codigo", label: "Código" },
          { key: "clienteNome", label: "Cliente" },
          { key: "transportadoraNome", label: "Transportadora" },
          { key: "valor", label: "Valor" },
          { key: "entrega", label: "Data Entrega" },
          { key: "observacoes", label: "Observações" },
        ]);
        exports.push({ name: `pedidos-${timestamp}.csv`, content: pedidosCSV });
      }

      // CRM
      if (data.crm.length) {
        const crmCSV = this._arrayToCSV(data.crm, [
          { key: "id", label: "ID" },
          { key: "clienteNome", label: "Cliente" },
          { key: "canal", label: "Canal" },
          { key: "data", label: "Data" },
          { key: "resumo", label: "Resumo" },
          { key: "detalhes", label: "Detalhes" },
        ]);
        exports.push({ name: `crm-${timestamp}.csv`, content: crmCSV });
      }

      if (exports.length === 0) {
        window.alert("Não há dados para exportar.");
        return;
      }

      // Download each CSV file
      exports.forEach(({ name, content }) => {
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        this._downloadFile(blob, name);
      });

      window.alert(
        `${exports.length} arquivo(s) CSV exportado(s) com sucesso!`
      );
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      window.alert("Erro ao exportar CSV. Verifique o console para detalhes.");
    }
  },

  /**
   * Imports data from JSON file
   */
  importJSON(file) {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        // Validate structure
        if (!importedData.data) {
          throw new Error(
            "Formato de arquivo inválido. O arquivo deve conter a propriedade 'data'."
          );
        }

        const data = importedData.data;

        // Validate required collections
        const requiredCollections = [
          "clientes",
          "transportadoras",
          "produtos",
          "orcamentos",
          "pedidos",
          "crm",
        ];
        for (const collection of requiredCollections) {
          if (!Array.isArray(data[collection])) {
            data[collection] = [];
          }
        }

        // Confirm import
        const totalRecords = Object.values(data).reduce(
          (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
          0
        );

        const confirmMsg =
          `Deseja importar os dados?\n\n` +
          `• Clientes: ${data.clientes.length}\n` +
          `• Transportadoras: ${data.transportadoras.length}\n` +
          `• Produtos: ${data.produtos.length}\n` +
          `• Orçamentos: ${data.orcamentos.length}\n` +
          `• Pedidos: ${data.pedidos.length}\n` +
          `• CRM: ${data.crm.length}\n\n` +
          `Total: ${totalRecords} registro(s)\n\n` +
          `ATENÇÃO: Os dados atuais serão substituídos!`;

        if (!window.confirm(confirmMsg)) {
          return;
        }

        // Import data
        storage.set(data);

        window.alert(
          "Dados importados com sucesso! A página será recarregada."
        );
        window.location.reload();
      } catch (error) {
        console.error("Erro ao importar JSON:", error);
        window.alert(`Erro ao importar dados:\n${error.message}`);
      }
    };

    reader.onerror = () => {
      window.alert("Erro ao ler o arquivo.");
    };

    reader.readAsText(file);
  },

  /**
   * Clears all data with confirmation
   */
  clearAllData() {
    const data = storage.load();
    const totalRecords = Object.values(data).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );

    const confirmMsg =
      `ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n` +
      `Você está prestes a excluir TODOS os dados:\n` +
      `• ${data.clientes.length} cliente(s)\n` +
      `• ${data.transportadoras.length} transportadora(s)\n` +
      `• ${data.produtos.length} produto(s)\n` +
      `• ${data.orcamentos.length} orçamento(s)\n` +
      `• ${data.pedidos.length} pedido(s)\n` +
      `• ${data.crm.length} registro(s) CRM\n\n` +
      `Total: ${totalRecords} registro(s)\n\n` +
      `Recomendamos exportar um backup antes de continuar.\n\n` +
      `Deseja realmente LIMPAR TUDO?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    // Double confirmation
    const doubleConfirm = window.prompt(
      'Digite "CONFIRMAR" (em maiúsculas) para prosseguir:'
    );

    if (doubleConfirm !== "CONFIRMAR") {
      window.alert("Operação cancelada.");
      return;
    }

    // Clear data
    storage.set(deepClone(defaultState));

    window.alert("Todos os dados foram removidos. A página será recarregada.");
    window.location.reload();
  },

  /**
   * Converts array of objects to CSV string
   * @private
   */
  _arrayToCSV(array, columns) {
    const headers = columns.map((col) => col.label);
    const rows = array.map((item) =>
      columns.map((col) => {
        const value = item[col.key] ?? "";
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
    );

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  },

  /**
   * Downloads a blob as a file
   * @private
   */
  _downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

/**
 * Initialize home page with data statistics
 */
function initHomePage() {
  const statsContainer = document.querySelector("#dataStats");

  if (!statsContainer) return;

  // Render statistics
  function renderStats() {
    const data = storage.load();

    const stats = [
      {
        label: "Clientes",
        value: data.clientes.length,
        sublabel: "cadastrados",
      },
      {
        label: "Produtos",
        value: data.produtos.length,
        sublabel: "no catálogo",
      },
      {
        label: "Transportadoras",
        value: data.transportadoras.length,
        sublabel: "parceiras",
      },
      {
        label: "Orçamentos",
        value: data.orcamentos.length,
        sublabel: "registrados",
      },
      { label: "Pedidos", value: data.pedidos.length, sublabel: "fechados" },
      {
        label: "Interações CRM",
        value: data.crm.length,
        sublabel: "registradas",
      },
    ];

    statsContainer.innerHTML = stats
      .map(
        (stat) => `
        <div class="data-stat-item">
          <span class="data-stat-label">${stat.label}</span>
          <span class="data-stat-value">${stat.value}</span>
          <span class="data-stat-sublabel">${stat.sublabel}</span>
        </div>
      `
      )
      .join("");
  }

  renderStats();
}

/**
 * Settings and Configuration Module
 */
const SettingsManager = {
  STORAGE_KEY: "oursales:settings",

  defaultSettings: {
    fontSize: "medium",
    dateFormat: "dd/mm/yyyy",
    currency: "BRL",
    itemsPerPage: 25,
    autoBackup: false,
    confirmDelete: true,
    installDate: new Date().toISOString(),
  },

  load() {
    try {
      const saved = window.localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return { ...this.defaultSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn("Erro ao carregar configurações:", error);
    }
    return { ...this.defaultSettings };
  },

  save(settings) {
    try {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      return false;
    }
  },

  reset() {
    const installDate = this.load().installDate;
    const resetSettings = { ...this.defaultSettings, installDate };
    return this.save(resetSettings);
  },
};

/**
 * Sector Import/Export Manager
 */
const SectorManager = {
  /**
   * Parse CSV string to array of objects
   * Suporta vírgula e ponto-e-vírgula como delimitadores
   */
  parseCSV(csvString) {
    const lines = csvString.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("Arquivo CSV vazio ou inválido");
    }

    // Detectar delimitador (vírgula ou ponto-e-vírgula)
    const firstLine = lines[0];
    const delimiter = firstLine.includes(";") ? ";" : ",";

    const headers = firstLine.split(delimiter).map((h) =>
      h
        .trim()
        .replace(/"/g, "")
        .replace(/^\uFEFF/, "")
    ); // Remove BOM
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].replace(/"/g, "") : "";
      });
      data.push(row);
    }

    return data;
  },

  /**
   * Parse Excel file to array of objects
   */
  parseExcel(arrayBuffer) {
    try {
      if (typeof XLSX === "undefined") {
        throw new Error(
          "Biblioteca XLSX não carregada. Verifique sua conexão com a internet."
        );
      }

      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: "",
      });

      return jsonData;
    } catch (error) {
      throw new Error(`Erro ao ler arquivo Excel: ${error.message}`);
    }
  },

  /**
   * Export sector data to Excel (.xlsx)
   */
  exportExcel(sector) {
    try {
      if (typeof XLSX === "undefined") {
        window.alert(
          "Biblioteca Excel não disponível.\n\nPor favor, verifique sua conexão com a internet e recarregue a página."
        );
        return;
      }

      const data = storage.load();
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);

      let exportData = [];
      let filename = "";

      switch (sector) {
        case "clientes":
          exportData = data.clientes.map((item) => ({
            ID: item.id,
            Tipo: item.tipo,
            Nome: item.nome,
            Documento: item.documento,
            Email: item.email,
            Telefone: item.telefone,
            Observações: item.observacoes || "",
          }));
          filename = `clientes-${timestamp}.xlsx`;
          break;

        case "produtos":
          exportData = data.produtos.map((item) => ({
            ID: item.id,
            Nome: item.nome,
            SKU: item.sku,
            Categoria: item.categoria || "",
            Preço: item.preco,
            Estoque: item.estoque,
            Descrição: item.descricao || "",
          }));
          filename = `produtos-${timestamp}.xlsx`;
          break;

        case "transportadoras":
          exportData = data.transportadoras.map((item) => ({
            ID: item.id,
            Nome: item.nome,
            Prazo: item.prazo,
            Custo: item.custo,
            Cobertura: item.cobertura || "",
          }));
          filename = `transportadoras-${timestamp}.xlsx`;
          break;

        case "industrias":
          window.alert(
            "Módulo de Indústrias em desenvolvimento.\nEm breve você poderá exportar dados de indústrias."
          );
          return;

        default:
          throw new Error("Setor inválido");
      }

      if (exportData.length === 0) {
        window.alert(`Nenhum dado de ${sector} para exportar.`);
        return;
      }

      // Criar workbook e worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Ajustar largura das colunas
      const colWidths = Object.keys(exportData[0]).map((key) => {
        const maxLength = Math.max(
          key.length,
          ...exportData.map((row) =>
            String(row[key]).length > 50 ? 50 : String(row[key]).length
          )
        );
        return { wch: maxLength + 2 };
      });
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        sector.charAt(0).toUpperCase() + sector.slice(1)
      );

      // Gerar e baixar arquivo
      XLSX.writeFile(workbook, filename);

      window.alert(
        `✅ ${exportData.length} registro(s) de ${sector} exportado(s) com sucesso para Excel!`
      );
    } catch (error) {
      console.error(`Erro ao exportar ${sector} para Excel:`, error);
      window.alert(`Erro ao exportar ${sector} para Excel:\n${error.message}`);
    }
  },

  /**
   * Export sector data to CSV (Excel-compatible with BOM)
   */
  exportCSV(sector) {
    try {
      const data = storage.load();
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);

      let csvData = [];
      let filename = "";
      let columns = [];

      switch (sector) {
        case "clientes":
          csvData = data.clientes;
          filename = `clientes-${timestamp}.csv`;
          columns = [
            { key: "id", label: "ID" },
            { key: "tipo", label: "Tipo" },
            { key: "nome", label: "Nome" },
            { key: "documento", label: "Documento" },
            { key: "email", label: "Email" },
            { key: "telefone", label: "Telefone" },
            { key: "observacoes", label: "Observações" },
          ];
          break;

        case "produtos":
          csvData = data.produtos;
          filename = `produtos-${timestamp}.csv`;
          columns = [
            { key: "id", label: "ID" },
            { key: "nome", label: "Nome" },
            { key: "sku", label: "SKU" },
            { key: "categoria", label: "Categoria" },
            { key: "preco", label: "Preço" },
            { key: "estoque", label: "Estoque" },
            { key: "descricao", label: "Descrição" },
          ];
          break;

        case "transportadoras":
          csvData = data.transportadoras;
          filename = `transportadoras-${timestamp}.csv`;
          columns = [
            { key: "id", label: "ID" },
            { key: "nome", label: "Nome" },
            { key: "prazo", label: "Prazo" },
            { key: "custo", label: "Custo" },
            { key: "cobertura", label: "Cobertura" },
          ];
          break;

        case "industrias":
          window.alert(
            "Módulo de Indústrias em desenvolvimento.\nEm breve você poderá exportar dados de indústrias."
          );
          return;

        default:
          throw new Error("Setor inválido");
      }

      if (csvData.length === 0) {
        window.alert(`Nenhum dado de ${sector} para exportar.`);
        return;
      }

      // Gerar CSV com ponto-e-vírgula (padrão Excel BR)
      const csv = this._arrayToExcelCSV(csvData, columns);

      // Adicionar BOM UTF-8 para o Excel reconhecer corretamente
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csv], {
        type: "text/csv;charset=utf-8;",
      });

      DataManager._downloadFile(blob, filename);

      window.alert(
        `✅ ${csvData.length} registro(s) de ${sector} exportado(s) com sucesso para CSV!`
      );
    } catch (error) {
      console.error(`Erro ao exportar ${sector} para CSV:`, error);
      window.alert(`Erro ao exportar ${sector} para CSV:\n${error.message}`);
    }
  },

  /**
   * Convert array to Excel-compatible CSV (with semicolon)
   */
  _arrayToExcelCSV(array, columns) {
    const headers = columns.map((col) => col.label);
    const rows = array.map((item) =>
      columns.map((col) => {
        const value = item[col.key] ?? "";
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
    );

    // Usar ponto-e-vírgula como delimitador (padrão Excel brasileiro)
    return [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\n");
  },

  /**
   * Import sector data from CSV or Excel
   */
  importSector(sector, file) {
    const fileName = file.name.toLowerCase();
    const isExcel =
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".xlsm");

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        let parsedData = [];

        if (isExcel) {
          // Arquivo Excel
          parsedData = this.parseExcel(event.target.result);
        } else {
          // Arquivo CSV
          const csvString = event.target.result;
          parsedData = this.parseCSV(csvString);
        }

        if (parsedData.length === 0) {
          throw new Error("Nenhum dado encontrado no arquivo");
        }

        // Validate and transform data based on sector
        let validatedData = [];
        let entityName = "";

        switch (sector) {
          case "clientes":
            entityName = "clientes";
            validatedData = parsedData.map((row) => ({
              id: row.id || row.ID || generateId("cli"),
              tipo: row.tipo || row.Tipo || "PJ",
              nome: row.nome || row.Nome || "",
              documento: row.documento || row.Documento || "",
              email: row.email || row.Email || "",
              telefone: row.telefone || row.Telefone || "",
              observacoes: row.observacoes || row.Observações || "",
            }));
            break;

          case "produtos":
            entityName = "produtos";
            validatedData = parsedData.map((row) => ({
              id: row.id || row.ID || generateId("pro"),
              nome: row.nome || row.Nome || "",
              sku: row.sku || row.SKU || "",
              categoria: row.categoria || row.Categoria || "",
              preco:
                Number.parseFloat(row.preco || row.Preço || row.preco || 0) ||
                0,
              estoque:
                Number.parseInt(row.estoque || row.Estoque || 0, 10) || 0,
              descricao: row.descricao || row.Descrição || "",
            }));
            break;

          case "transportadoras":
            entityName = "transportadoras";
            validatedData = parsedData.map((row) => ({
              id: row.id || row.ID || generateId("tra"),
              nome: row.nome || row.Nome || "",
              prazo: Number.parseInt(row.prazo || row.Prazo || 0, 10) || 1,
              custo: Number.parseFloat(row.custo || row.Custo || 0) || 0,
              cobertura: row.cobertura || row.Cobertura || "",
            }));
            break;

          case "industrias":
            window.alert("Módulo de Indústrias em desenvolvimento.");
            return;

          default:
            throw new Error("Setor inválido");
        }

        // Confirm import
        const confirmMsg =
          `Deseja importar ${validatedData.length} registro(s) de ${entityName}?\n\n` +
          `ATENÇÃO: Os dados existentes de ${entityName} serão SUBSTITUÍDOS!\n\n` +
          `Recomendamos fazer um backup antes de continuar.`;

        if (!window.confirm(confirmMsg)) {
          return;
        }

        // Import data
        storage.update((draft) => {
          draft[entityName] = validatedData;

          // Sort by name
          if (entityName !== "industrias") {
            draft[entityName].sort((a, b) =>
              a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
            );
          }
        });

        window.alert(
          `${validatedData.length} registro(s) de ${entityName} importado(s) com sucesso!\n\nA página será recarregada.`
        );
        window.location.reload();
      } catch (error) {
        console.error(`Erro ao importar ${sector}:`, error);
        window.alert(`Erro ao importar ${sector}:\n${error.message}`);
      }
    };

    reader.onerror = () => {
      window.alert(`Erro ao ler o arquivo ${isExcel ? "Excel" : "CSV"}.`);
    };

    // Ler arquivo conforme o tipo
    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file, "UTF-8");
    }
  },
};

/**
 * Initialize settings page
 */
function initCrmPage() {
  // Placeholder para página CRM
  console.log("CRM page initialized");
}

function initConfiguracoesPage() {
  const statsContainer = document.querySelector("#dataStats");
  const exportJSONBtn = document.querySelector("#exportJSON");
  const exportCSVBtn = document.querySelector("#exportCSV");
  const importDataBtn = document.querySelector("#importData");
  const clearDataBtn = document.querySelector("#clearAllData");
  const preferencesForm = document.querySelector("#preferencesForm");
  const resetPreferencesBtn = document.querySelector("#resetPreferences");
  const showShortcutsBtn = document.querySelector("#showShortcuts");

  // System info elements
  const systemVersion = document.querySelector("#systemVersion");
  const storageUsed = document.querySelector("#storageUsed");
  const totalRecords = document.querySelector("#totalRecords");
  const lastBackup = document.querySelector("#lastBackup");
  const browserInfo = document.querySelector("#browserInfo");
  const installDate = document.querySelector("#installDate");

  if (!statsContainer) return;

  // Update sector counts
  function updateSectorCounts() {
    const data = storage.load();

    // Contadores de importação/exportação
    const countClientes = document.querySelector("#countClientes");
    const countProdutos = document.querySelector("#countProdutos");
    const countTransportadoras = document.querySelector(
      "#countTransportadoras"
    );
    const countIndustrias = document.querySelector("#countIndustrias");

    if (countClientes) countClientes.textContent = data.clientes.length;
    if (countProdutos) countProdutos.textContent = data.produtos.length;
    if (countTransportadoras)
      countTransportadoras.textContent = data.transportadoras.length;
    if (countIndustrias) countIndustrias.textContent = 0; // Placeholder
  }

  // Sector buttons event listeners
  document.addEventListener("click", (event) => {
    const target = event.target;

    // Export sector to Excel
    if (
      target.matches('[data-action="export-excel"]') ||
      target.closest('[data-action="export-excel"]')
    ) {
      const button = target.matches('[data-action="export-excel"]')
        ? target
        : target.closest('[data-action="export-excel"]');
      const sector = button.dataset.sector;
      if (sector) {
        SectorManager.exportExcel(sector);
      }
      return;
    }

    // Export sector to CSV
    if (
      target.matches('[data-action="export-csv"]') ||
      target.closest('[data-action="export-csv"]')
    ) {
      const button = target.matches('[data-action="export-csv"]')
        ? target
        : target.closest('[data-action="export-csv"]');
      const sector = button.dataset.sector;
      if (sector) {
        SectorManager.exportCSV(sector);
      }
      return;
    }

    // Import sector (CSV or Excel)
    if (
      target.matches('[data-action="import"]') ||
      target.closest('[data-action="import"]')
    ) {
      event.preventDefault();
      event.stopPropagation();

      const button = target.matches('[data-action="import"]')
        ? target
        : target.closest('[data-action="import"]');
      const sector = button.dataset.sector;

      console.log("Import button clicked for sector:", sector); // Debug

      if (sector) {
        // Redirecionar para página específica de importação de produtos
        if (sector === "produtos") {
          console.log("Redirecting to importar-produtos.html"); // Debug
          window.location.href = "importar-produtos.html";
          return;
        }

        // Para outros setores, manter o comportamento original
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".csv,.xlsx,.xls";
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            SectorManager.importSector(sector, file);
          }
        };
        fileInput.click();
      }
      return;
    }
  });

  // Render statistics
  function renderStats() {
    const data = storage.load();

    const stats = [
      {
        label: "Clientes",
        value: data.clientes.length,
        sublabel: "cadastrados",
      },
      {
        label: "Produtos",
        value: data.produtos.length,
        sublabel: "no catálogo",
      },
      {
        label: "Transportadoras",
        value: data.transportadoras.length,
        sublabel: "parceiras",
      },
      {
        label: "Orçamentos",
        value: data.orcamentos.length,
        sublabel: "registrados",
      },
      { label: "Pedidos", value: data.pedidos.length, sublabel: "fechados" },
      {
        label: "Interações CRM",
        value: data.crm.length,
        sublabel: "registradas",
      },
    ];

    statsContainer.innerHTML = stats
      .map(
        (stat) => `
        <div class="data-stat-item">
          <span class="data-stat-label">${stat.label}</span>
          <span class="data-stat-value">${stat.value}</span>
          <span class="data-stat-sublabel">${stat.sublabel}</span>
        </div>
      `
      )
      .join("");
  }

  // Render system information
  function renderSystemInfo() {
    const data = storage.load();
    const settings = SettingsManager.load();

    // Calculate storage used
    try {
      const dataString = JSON.stringify(data);
      const bytes = new Blob([dataString]).size;
      const kb = (bytes / 1024).toFixed(2);
      const mb = (bytes / 1024 / 1024).toFixed(2);
      storageUsed.textContent = bytes > 1024 * 1024 ? `${mb} MB` : `${kb} KB`;
    } catch (error) {
      storageUsed.textContent = "Erro ao calcular";
    }

    // Total records
    const total = Object.values(data).reduce(
      (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
      0
    );
    totalRecords.textContent = total.toLocaleString("pt-BR");

    // Last backup
    const lastBackupDate = window.localStorage.getItem("oursales:lastBackup");
    if (lastBackupDate) {
      lastBackup.textContent = formatDateTime(lastBackupDate);
    } else {
      lastBackup.textContent = "Nunca";
    }

    // Browser info
    const browser = navigator.userAgent.match(
      /(Firefox|Chrome|Safari|Opera|Edge)\/[\d.]+/
    );
    browserInfo.textContent = browser ? browser[0] : navigator.userAgent;

    // Install date
    if (settings.installDate) {
      const date = new Date(settings.installDate);
      installDate.textContent = date.toLocaleDateString("pt-BR");
    }
  }

  // Load preferences
  function loadPreferences() {
    const settings = SettingsManager.load();

    document.querySelector("#prefFontSize").value = settings.fontSize;
    document.querySelector("#prefDateFormat").value = settings.dateFormat;
    document.querySelector("#prefCurrency").value = settings.currency;
    document.querySelector("#prefItemsPerPage").value = settings.itemsPerPage;
    document.querySelector("#prefAutoBackup").checked = settings.autoBackup;
    document.querySelector("#prefConfirmDelete").checked =
      settings.confirmDelete;
  }

  // Event listeners for backup
  exportJSONBtn?.addEventListener("click", () => {
    DataManager.exportJSON();
    window.localStorage.setItem(
      "oursales:lastBackup",
      new Date().toISOString()
    );
    renderSystemInfo();
  });

  exportCSVBtn?.addEventListener("click", () => {
    DataManager.exportCSV();
    window.localStorage.setItem(
      "oursales:lastBackup",
      new Date().toISOString()
    );
    renderSystemInfo();
  });

  importDataBtn?.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        DataManager.importJSON(file);
      }
    };
    fileInput.click();
  });

  clearDataBtn?.addEventListener("click", () => {
    DataManager.clearAllData();
  });

  // Preferences form
  preferencesForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const settings = {
      fontSize: document.querySelector("#prefFontSize").value,
      dateFormat: document.querySelector("#prefDateFormat").value,
      currency: document.querySelector("#prefCurrency").value,
      itemsPerPage: Number.parseInt(
        document.querySelector("#prefItemsPerPage").value,
        10
      ),
      autoBackup: document.querySelector("#prefAutoBackup").checked,
      confirmDelete: document.querySelector("#prefConfirmDelete").checked,
      installDate: SettingsManager.load().installDate,
    };

    if (SettingsManager.save(settings)) {
      window.alert("Preferências salvas com sucesso!");

      // Apply font size immediately
      document.documentElement.className = `font-${settings.fontSize}`;
    } else {
      window.alert("Erro ao salvar preferências.");
    }
  });

  resetPreferencesBtn?.addEventListener("click", () => {
    if (
      window.confirm(
        "Deseja restaurar todas as configurações para os valores padrão?"
      )
    ) {
      SettingsManager.reset();
      loadPreferences();
      window.alert("Configurações restauradas!");
    }
  });

  showShortcutsBtn?.addEventListener("click", () => {
    const shortcuts = `
ATALHOS DE TECLADO DISPONÍVEIS:

Navegação:
• Ctrl/Cmd + 1-7: Ir para páginas (Início, Clientes, etc.)
• Escape: Fechar modais/drawers

Ações:
• Ctrl/Cmd + N: Novo registro (na página atual)
• Ctrl/Cmd + E: Editar
• Ctrl/Cmd + S: Salvar formulário
• Ctrl/Cmd + F: Buscar/Filtrar

Backup:
• Ctrl/Cmd + B: Exportar backup JSON
• Ctrl/Cmd + Shift + B: Exportar CSV

Em breve mais atalhos serão implementados!
    `.trim();

    window.alert(shortcuts);
  });

  // Initialize
  updateSectorCounts();
  renderStats();
  renderSystemInfo();
  loadPreferences();
}

const pageInitializers = {
  home: initHomePage,
  clientes: initClientesPage,
  "cliente-pj": initClientePJPage,
  "cliente-pf": initClientePFPage,
  transportadoras: initTransportadorasPage,
  industrias: initIndustriasPage,
  "industria-form": initIndustriaFormPage,
  produtos: initProdutosPage,
  "produto-form": initProdutoFormPage,
  orcamentos: initOrcamentosPage,
  "orcamento-form": initOrcamentoFormPage,
  pedidos: initPedidosPage,
  "pedido-form": initPedidoFormPage,
  crm: initCrmPage,
  configuracoes: initConfiguracoesPage,
};

function init() {
  seedDataIfEmpty();
  highlightActiveNav();
  const page = document.body.dataset.page;
  const initializer = pageInitializers[page];
  if (initializer) {
    initializer();
  }
}

document.addEventListener("DOMContentLoaded", init);
