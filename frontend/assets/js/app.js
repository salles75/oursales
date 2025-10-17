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
      window.localStorage.setItem(storageKey, JSON.stringify(this.cache));
    } catch (error) {
      console.warn("Falha ao salvar dados:", error);
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
  const state = storage.load();
  return state.industrias || [];
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

  editBtn?.addEventListener("click", () => {
    if (!selectedId) {
      window.alert("Selecione um cliente para editar.");
      return;
    }
    const cliente = storage
      .load()
      .clientes.find((item) => item.id === selectedId);
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
      const docNumeros = (cliente.documento || "").replace(/\D/g, "");
      tipoCliente = docNumeros.length === 14 ? "PJ" : "PF";
    }

    // Redirecionar para a página correta baseado no tipo
    const pagina = tipoCliente === "PJ" ? "cliente-pj.html" : "cliente-pf.html";
    window.location.href = `${pagina}?id=${selectedId}`;
  });

  removeBtn?.addEventListener("click", () => {
    if (!selectedId) {
      window.alert("Selecione um cliente para remover.");
      return;
    }
    const state = storage.load();
    const relatedOrcamentos = state.orcamentos.filter(
      (orcamento) => orcamento.clienteId === selectedId
    ).length;
    const relatedPedidos = state.pedidos.filter(
      (pedido) => pedido.clienteId === selectedId
    ).length;
    const relatedCrm = state.crm.filter(
      (registro) => registro.clienteId === selectedId
    ).length;

    let mensagem = "Confirma remover este cliente?";
    if (relatedOrcamentos || relatedPedidos || relatedCrm) {
      mensagem = `Este cliente possui ${relatedOrcamentos} orçamento(s), ${relatedPedidos} pedido(s) e ${relatedCrm} interação(ões) no CRM.\nAo remover, esses registros também serão excluídos. Deseja continuar?`;
    }

    if (!window.confirm(mensagem)) {
      return;
    }

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

    selectedId = "";
    render();
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

  function render() {
    const clientes = storage.load().clientes;
    if (selectedId && !clientes.some((cliente) => cliente.id === selectedId)) {
      selectedId = "";
    }

    if (!clientes.length) {
      listContainer.innerHTML =
        '<div class="empty-state">Nenhum cliente cadastrado.</div>';
      updateActionsState();
      return;
    }

    const linhas = clientes
      .map(
        (cliente) => `
          <tr class="table-row${
            cliente.id === selectedId ? " is-selected" : ""
          }" data-id="${cliente.id}">
            <td class="select-cell">
              <label class="select-radio">
                <input type="radio" name="clienteSelecionado" value="${
                  cliente.id
                }" ${cliente.id === selectedId ? "checked" : ""} />
                <span class="bubble"></span>
              </label>
            </td>
            <td>
              <strong>${cliente.nome}</strong>
              <div class="muted">${cliente.email}</div>
            </td>
            <td>${cliente.documento}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.observacoes || "-"}</td>
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
              <th>Cliente</th>
              <th>Documento</th>
              <th>Telefone</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;

    syncSelection(listContainer, "clienteSelecionado", selectedId);
    updateActionsState();
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

  const vendedoresLista = [
    "Ana Souza",
    "Bruno Oliveira",
    "Carla Ribeiro",
    "Diego Martins",
    "Fernanda Costa",
  ];

  const industriasLista = [
    "Todas as Indústrias",
    "Alimentos",
    "Bebidas",
    "Higiene",
    "Limpeza",
    "Cosméticos",
  ];

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
        <button type="button" class="button-danger" data-action="remove">Remover</button>
      </td>
    `;
    tr.querySelector('[data-action="remove"]').addEventListener(
      "click",
      (event) => event.currentTarget.closest("tr").remove()
    );
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
        <button type="button" class="button-danger" data-action="remove">Remover</button>
      </td>
    `;
    tr.querySelector('[data-action="remove"]').addEventListener(
      "click",
      (event) => event.currentTarget.closest("tr").remove()
    );
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
        <button type="button" class="button-danger" data-action="remove">Remover</button>
      </td>
    `;
    tr.querySelector('[data-action="remove"]').addEventListener(
      "click",
      (event) => event.currentTarget.closest("tr").remove()
    );
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
        <button type="button" class="button-danger" data-action="remove">Remover</button>
      </td>
    `;
    tr.querySelector('[data-action="remove"]').addEventListener(
      "click",
      (event) => event.currentTarget.closest("tr").remove()
    );
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
        <button type="button" class="button-danger" data-action="remove">Remover</button>
      </td>
    `;
    tr.querySelector('[data-action="remove"]').addEventListener(
      "click",
      (event) => event.currentTarget.closest("tr").remove()
    );
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
    const nomeFantasia = fields.nomeFantasia.value.trim();
    const cnpj = fields.cnpj.value.trim();

    if (!razaoSocial || !nomeFantasia || !cnpj) {
      window.alert("Informe Razão Social, Nome Fantasia e CNPJ.");
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

    if (!contatos.length) {
      window.alert("Cadastre ao menos um contato com nome informado.");
      return;
    }

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

  const vendedoresLista = [
    "Ana Souza",
    "Bruno Oliveira",
    "Carla Ribeiro",
    "Diego Martins",
    "Fernanda Costa",
  ];

  const industriasLista = [
    "Todas as Indústrias",
    "Alimentos",
    "Bebidas",
    "Higiene",
    "Limpeza",
    "Cosméticos",
  ];

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
        <button type="button" class="button-danger" data-action="remove">Remover</button>
      </td>
    `;
    tr.querySelector('[data-action="remove"]').addEventListener(
      "click",
      (event) => event.currentTarget.closest("tr").remove()
    );
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
        <button type="button" class="button-danger" data-action="remove">Remover</button>
      </td>
    `;
    tr.querySelector('[data-action="remove"]').addEventListener(
      "click",
      (event) => event.currentTarget.closest("tr").remove()
    );
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
        <button type="button" class="button-danger" data-action="remove">Remover</button>
      </td>
    `;
    tr.querySelector('[data-action="remove"]').addEventListener(
      "click",
      (event) => event.currentTarget.closest("tr").remove()
    );
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
        <button type="button" class="button-danger" data-action="remove">Remover</button>
      </td>
    `;
    tr.querySelector('[data-action="remove"]').addEventListener(
      "click",
      (event) => event.currentTarget.closest("tr").remove()
    );
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

    if (!contatos.length) {
      window.alert("Cadastre ao menos um contato com nome informado.");
      return;
    }

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

  removeBtn?.addEventListener("click", () => {
    if (!selectedId) {
      window.alert("Selecione uma transportadora para remover.");
      return;
    }
    const relacionados = storage
      .load()
      .pedidos.filter(
        (pedido) => pedido.transportadoraId === selectedId
      ).length;

    let mensagem = "Confirma remover esta transportadora?";
    if (relacionados) {
      mensagem = `Esta transportadora está vinculada a ${relacionados} pedido(s).\nAo remover, esses pedidos também serão excluídos. Deseja continuar?`;
    }

    if (!window.confirm(mensagem)) {
      return;
    }

    storage.update((draft) => {
      draft.transportadoras = draft.transportadoras.filter(
        (item) => item.id !== selectedId
      );
      draft.pedidos = draft.pedidos.filter(
        (pedido) => pedido.transportadoraId !== selectedId
      );
    });

    selectedId = "";
    render();
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

  function render() {
    const transportadoras = storage.load().transportadoras;
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
    const hasSelection = Boolean(selectedId);
    if (editBtn) editBtn.disabled = !hasSelection;
    if (removeBtn) removeBtn.disabled = !hasSelection;
  };

  openBtn?.addEventListener("click", () => {
    window.location.href = "industria-form.html";
  });

  editBtn?.addEventListener("click", () => {
    if (!selectedId) {
      window.alert("Selecione uma indústria para editar.");
      return;
    }
    window.sessionStorage.setItem("oursales:editIndustria", selectedId);
    window.location.href = "industria-form.html";
  });

  removeBtn?.addEventListener("click", () => {
    if (!selectedId) {
      window.alert("Selecione uma indústria para remover.");
      return;
    }

    if (!window.confirm("Confirma remover esta indústria?")) {
      return;
    }

    storage.update((draft) => {
      draft.industrias = draft.industrias.filter(
        (industria) => industria.id !== selectedId
      );
    });

    selectedId = "";
    render();
  });

  listContainer?.addEventListener("change", (event) => {
    const input = event.target.closest(
      'input[type="radio"][name="industriaSelecionada"]'
    );
    if (!input) return;
    selectedId = input.value;
    syncSelection(listContainer, "industriaSelecionada", selectedId);
    updateActionsState();
  });

  listContainer?.addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-id]");
    if (!row) return;
    const input = row.querySelector(
      'input[type="radio"][name="industriaSelecionada"]'
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
      syncSelection(listContainer, "industriaSelecionada", selectedId);
      updateActionsState();
    }
  });

  function render() {
    const industrias = storage.load().industrias;
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

    const linhas = industrias
      .map(
        (industria) => `
          <tr class="table-row${
            industria.id === selectedId ? " is-selected" : ""
          }" data-id="${industria.id}">
            <td class="select-cell">
              <label class="select-radio">
                <input type="radio" name="industriaSelecionada" value="${
                  industria.id
                }" ${industria.id === selectedId ? "checked" : ""} />
                <span class="bubble"></span>
              </label>
            </td>
            <td>
              <strong>${industria.nome}</strong>
              <div class="muted">${industria.cnpj || "CNPJ não informado"}</div>
            </td>
            <td>${industria.telefone || "-"}</td>
            <td>${industria.email || "-"}</td>
            <td>${
              industria.prazoEntrega ? industria.prazoEntrega + " dias" : "-"
            }</td>
            <td>${industria.condicaoPagamento || "-"}</td>
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
              <th>Indústria / Fornecedor</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Prazo Entrega</th>
              <th>Condição Pagamento</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;

    syncSelection(listContainer, "industriaSelecionada", selectedId);
    updateActionsState();
  }

  render();
}

/**
 * Industria Form Page - Página separada para criar/editar indústrias
 */
function initIndustriaFormPage() {
  const form = document.querySelector("#industriaForm");
  if (!form) return;

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
  form.addEventListener("submit", (e) => {
    e.preventDefault();

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

    if (editingIndustriaId) {
      storage.update((draft) => {
        const industria = draft.industrias.find(
          (item) => item.id === editingIndustriaId
        );
        if (industria) {
          Object.assign(industria, data);
        }
      });
      window.alert("Indústria atualizada com sucesso!");
    } else {
      storage.update((draft) => {
        const nova = { id: generateId("ind"), ...data };
        draft.industrias.push(nova);
      });
      window.alert("Indústria cadastrada com sucesso!");
    }

    window.location.href = "industrias.html";
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
  if (!form) return;

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
    window.location.href = "produto-form.html";
  });

  editBtn?.addEventListener("click", () => {
    if (!selectedId) {
      window.alert("Selecione um produto para editar.");
      return;
    }
    window.sessionStorage.setItem("oursales:editProduto", selectedId);
    window.location.href = "produto-form.html";
  });

  // Event listeners para importação
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

  removeBtn?.addEventListener("click", () => {
    if (!selectedId) {
      window.alert("Selecione um produto para remover.");
      return;
    }

    if (!window.confirm("Confirma remover este produto do catálogo?")) {
      return;
    }

    storage.update((draft) => {
      draft.produtos = draft.produtos.filter(
        (produto) => produto.id !== selectedId
      );
    });

    selectedId = "";
    render();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = fields.id.value;
    const preco = Number.parseFloat(fields.preco.value);
    const estoque = Number.parseInt(fields.estoque.value, 10);

    if (!Number.isFinite(preco) || preco < 0) {
      window.alert("Informe um preço válido.");
      return;
    }

    if (!Number.isFinite(estoque) || estoque < 0) {
      window.alert("Informe o estoque disponível.");
      return;
    }

    const data = {
      nome: fields.nome.value.trim(),
      sku: fields.sku.value.trim(),
      categoria: fields.categoria.value.trim(),
      preco,
      estoque,
      descricao: fields.descricao.value.trim(),
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
    render();
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

  listContainer?.addEventListener("click", (event) => {
    const row = event.target.closest("tr[data-id]");
    if (!row) return;
    const input = row.querySelector(
      'input[type="radio"][name="produtoSelecionado"]'
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
      syncSelection(listContainer, "produtoSelecionado", selectedId);
      updateActionsState();
    }
  });

  function render() {
    const produtos = storage.load().produtos;
    if (selectedId && !produtos.some((produto) => produto.id === selectedId)) {
      selectedId = "";
    }

    if (!produtos.length) {
      listContainer.innerHTML =
        '<div class="empty-state">Nenhum produto cadastrado.</div>';
      updateActionsState();
      return;
    }

    const linhas = produtos
      .map(
        (produto) => `
          <tr class="table-row${
            produto.id === selectedId ? " is-selected" : ""
          }" data-id="${produto.id}">
            <td class="select-cell">
              <label class="select-radio">
                <input type="radio" name="produtoSelecionado" value="${
                  produto.id
                }" ${produto.id === selectedId ? "checked" : ""} />
                <span class="bubble"></span>
              </label>
            </td>
            <td>
              <strong>${produto.nome}</strong>
              <div class="muted">SKU: ${produto.sku}</div>
            </td>
            <td>${produto.categoria || "-"}</td>
            <td>${formatCurrency(produto.preco)}</td>
            <td>${produto.estoque}</td>
            <td>${produto.descricao || "-"}</td>
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
              <th>Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
    `;

    syncSelection(listContainer, "produtoSelecionado", selectedId);
    updateActionsState();
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
    const tbody = document.querySelector("#stListaEstados");
    if (!tbody) return;

    if (substituicoesTributarias.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="empty-state">
            Nenhuma substituição tributária cadastrada
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = substituicoesTributarias
      .map(
        (st, index) => `
        <tr>
          <td>${st.estado}</td>
          <td>${st.aliquota}%</td>
          <td style="text-align: center;">
            <button
              type="button"
              class="button-danger button-small"
              onclick="window.removeST(${index})"
            >
              🗑️
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

  // Adicionar ST
  const adicionarSTBtn = document.querySelector("#adicionarST");
  adicionarSTBtn?.addEventListener("click", () => {
    const estado = document.querySelector("#stEstado")?.value;
    const aliquota = document.querySelector("#stAliquota")?.value;

    if (!estado || !aliquota) {
      window.alert("Preencha o estado e a alíquota.");
      return;
    }

    // Verificar se o estado já foi adicionado
    const jaExiste = substituicoesTributarias.some(
      (st) => st.estado === estado
    );
    if (jaExiste) {
      window.alert("Este estado já possui substituição tributária cadastrada.");
      return;
    }

    substituicoesTributarias.push({
      estado,
      aliquota: Number.parseFloat(aliquota),
    });

    renderSubstituicoesTributarias();

    // Limpar campos
    document.querySelector("#stAliquota").value = "";
  });

  // Função global para remover ST
  window.removeST = (index) => {
    if (window.confirm("Confirma remover esta substituição tributária?")) {
      substituicoesTributarias.splice(index, 1);
      renderSubstituicoesTributarias();
    }
  };

  // Submit do formulário
  form.addEventListener("submit", (e) => {
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

    if (editingProdutoId) {
      storage.update((draft) => {
        const produto = draft.produtos.find(
          (item) => item.id === editingProdutoId
        );
        if (produto) {
          Object.assign(produto, data);
        }
      });
      window.alert("Produto atualizado com sucesso!");
    } else {
      storage.update((draft) => {
        const novo = { id: generateId("pro"), ...data };
        draft.produtos.push(novo);
      });
      window.alert("Produto criado com sucesso!");
    }

    window.location.href = "produtos.html";
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
      fields.industria.value = produto.industria || "";
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
      fields.tabelaPreco.value = produto.tabelaPreco || "";
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
  openBtn?.addEventListener("click", () => {
    window.location.href = "orcamento-form.html";
  });

  editBtn?.addEventListener("click", () => {
    if (!selectedId) {
      window.alert("Selecione um orçamento para editar.");
      return;
    }
    window.sessionStorage.setItem("oursales:editOrcamento", selectedId);
    window.location.href = "orcamento-form.html";
  });

  removeBtn?.addEventListener("click", () => {
    if (!selectedId) {
      window.alert("Selecione um orçamento para remover.");
      return;
    }
    if (!window.confirm("Confirma remover este orçamento?")) {
      return;
    }
    storage.update((draft) => {
      draft.orcamentos = draft.orcamentos.filter(
        (item) => item.id !== selectedId
      );
    });
    selectedId = "";
    render();
  });

  listContainer?.addEventListener("change", (event) => {
    const input = event.target.closest(
      'input[type="radio"][name="orcamentoSelecionado"]'
    );
    if (!input) return;
    selectedId = input.value;
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

  function render() {
    const orcamentos = storage.load().orcamentos;
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

    listContainer.innerHTML = orcamentos
      .map(
        (orcamento) => `
        <div class="list-item" data-id="${orcamento.id}">
          <div class="list-item-content">
            <div class="list-item-header">
              <h3>${orcamento.descricao}</h3>
              <span class="status ${
                orcamento.status === "ativo" ? "active" : "inactive"
              }">
                ${orcamento.status === "ativo" ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div class="list-item-details">
              <p><strong>Cliente:</strong> ${orcamento.clienteNome || "N/A"}</p>
              <p><strong>Valor:</strong> ${formatCurrency(
                orcamento.valor || 0
              )}</p>
              <p><strong>Validade:</strong> ${
                orcamento.validade
                  ? new Date(orcamento.validade).toLocaleDateString("pt-BR")
                  : "N/A"
              }</p>
              ${
                orcamento.observacoes
                  ? `<p><strong>Observações:</strong> ${orcamento.observacoes}</p>`
                  : ""
              }
            </div>
          </div>
          <div class="list-item-actions">
            <input
              type="radio"
              name="orcamentoSelecionado"
              value="${orcamento.id}"
              ${orcamento.id === selectedId ? "checked" : ""}
            />
          </div>
        </div>
      `
      )
      .join("");

    syncSelection(listContainer, "orcamentoSelecionado", selectedId);
    updateActionsState();
  }

  // Inicialização
  render();
}

/**
 * Orçamento Form Page - Página separada para criar/editar orçamentos
 */
function initOrcamentoFormPage() {
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
  form.addEventListener("submit", (e) => {
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

    const data = {
      clienteId,
      clienteNome: cliente.nome,
      data: fields.data.value || new Date().toISOString().split("T")[0],
      validade: fields.validade.value,
      descricao: fields.descricao.value.trim(),
      observacoes: fields.observacoes.value.trim(),
      condicaoPagamento: fields.condicaoPagamento?.value.trim() || "",
      status: fields.status?.value || "pendente",
      valor:
        Number.parseFloat(
          document
            .querySelector("#totalFinal")
            ?.textContent.replace(/[^\d,]/g, "")
            .replace(",", ".")
        ) || 0,
    };

    if (editingOrcamentoId) {
      storage.update((draft) => {
        const orcamento = draft.orcamentos.find(
          (item) => item.id === editingOrcamentoId
        );
        if (orcamento) {
          Object.assign(orcamento, data);
        }
      });
      window.alert("Orçamento atualizado com sucesso!");
    } else {
      storage.update((draft) => {
        const novo = { id: generateId("orc"), ...data };
        draft.orcamentos.push(novo);
      });
      window.alert("Orçamento criado com sucesso!");
    }

    window.location.href = "orcamentos.html";
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

  // Inicialização
  refreshSelects();
  fields.data.value = new Date().toISOString().split("T")[0];

  // Carregar dados se for edição
  if (editingOrcamentoId) {
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
    }
  }

  calculateTotals();
}

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

  const renderPedidos = () => {
    if (!listContainer) return;

    const state = storage.load();
    const pedidos = state.pedidos || [];

    if (pedidos.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <h3>Nenhum pedido registrado</h3>
          <p>Clique em "Novo pedido" para começar.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = pedidos
      .map(
        (pedido) => `
        <div class="list-item" data-id="${pedido.id}">
          <div class="list-item-content">
            <div class="list-item-header">
              <h3>Pedido #${pedido.numero || pedido.id}</h3>
              <span class="status ${
                pedido.status === "ativo" ? "active" : "inactive"
              }">
                ${pedido.status === "ativo" ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div class="list-item-details">
              <p><strong>Cliente:</strong> ${pedido.clienteNome || "N/A"}</p>
              <p><strong>Valor:</strong> ${formatCurrency(
                pedido.valorTotal || 0
              )}</p>
              <p><strong>Data:</strong> ${
                pedido.dataPedido
                  ? new Date(pedido.dataPedido).toLocaleDateString("pt-BR")
                  : "N/A"
              }</p>
              ${
                pedido.dataEntrega
                  ? `<p><strong>Entrega:</strong> ${new Date(
                      pedido.dataEntrega
                    ).toLocaleDateString("pt-BR")}</p>`
                  : ""
              }
            </div>
          </div>
          <div class="list-item-actions">
            <input
              type="radio"
              name="pedidoSelecionado"
              value="${pedido.id}"
              ${selectedPedidoId === pedido.id ? "checked" : ""}
            />
          </div>
        </div>
      `
      )
      .join("");

    syncSelection(listContainer, "pedidoSelecionado", selectedPedidoId);
    updateActionsState();
  };

  // Event listeners
  openBtn?.addEventListener("click", () => {
    window.location.href = "pedido-form.html";
  });

  editBtn?.addEventListener("click", () => {
    if (!selectedPedidoId) {
      window.alert("Selecione um pedido para editar.");
      return;
    }
    window.sessionStorage.setItem("oursales:editPedido", selectedPedidoId);
    window.location.href = "pedido-form.html";
  });

  removeBtn?.addEventListener("click", () => {
    if (!selectedPedidoId) {
      window.alert("Selecione um pedido para remover.");
      return;
    }

    const state = storage.load();
    const pedido = state.pedidos?.find((p) => p.id === selectedPedidoId);
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

    storage.update((draft) => {
      draft.pedidos =
        draft.pedidos?.filter((p) => p.id !== selectedPedidoId) || [];
    });

    selectedPedidoId = "";
    renderPedidos();
    window.alert("Pedido removido com sucesso!");
  });

  // Event listener para seleção
  listContainer?.addEventListener("change", (event) => {
    const input = event.target.closest(
      'input[type="radio"][name="pedidoSelecionado"]'
    );
    if (!input) return;
    selectedPedidoId = input.value;
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
    pedidoItens.forEach((item) => {
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

    if (totalItensEl) totalItensEl.textContent = pedidoItens.length.toFixed(2);
    if (totalProdutosEl)
      totalProdutosEl.textContent = pedidoItens
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
  form.addEventListener("submit", (e) => {
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

    const data = {
      clienteId,
      clienteNome: cliente.nome,
      transportadoraId: fields.transportadora.value || "",
      transportadoraNome: fields.transportadora.value
        ? storage
            .load()
            .transportadoras.find((t) => t.id === fields.transportadora.value)
            ?.nome || ""
        : "",
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
      valor:
        Number.parseFloat(
          document
            .querySelector("#totalFinal")
            ?.textContent.replace(/[^\d,]/g, "")
            .replace(",", ".")
        ) || 0,
    };

    if (editingPedidoId) {
      storage.update((draft) => {
        const pedido = draft.pedidos.find(
          (item) => item.id === editingPedidoId
        );
        if (pedido) {
          Object.assign(pedido, data);
        }
      });
      window.alert("Pedido atualizado com sucesso!");
    } else {
      storage.update((draft) => {
        const novo = { id: generateId("ped"), ...data };
        draft.pedidos.push(novo);
      });
      window.alert("Pedido criado com sucesso!");
    }

    window.location.href = "pedidos.html";
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
    }
  }

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
