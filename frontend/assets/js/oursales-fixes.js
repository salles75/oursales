/**
 * OurSales - Arquivo Único de Correções e Otimizações (OTIMIZADO)
 * Consolida todas as correções e otimizações em um só arquivo
 */

// Flag para evitar execuções múltiplas
let fixesApplied = false;

// === REMOÇÃO DE DADOS FICTÍCIOS ===
function removeFakeData() {
  console.log("OurSales - Removendo dados fictícios");

  // IDs específicos dos dados fictícios de exemplo (não remover dados válidos criados pelo usuário)
  // NOTA: Não removemos indústrias, produtos ou transportadoras porque seus IDs
  // são gerados dinamicamente e podem ser válidos
  const fakeIds = {
    clientes: ["cli-horizonte", "cli-mercadao"],
    orcamentos: ["orc-evolution"],
    pedidos: ["ped-0007"]
    // NÃO incluir industrias, produtos, transportadoras - todas são válidas se criadas pelo usuário
  };

  // Remover apenas dados fictícios específicos, preservando dados válidos do usuário
  if (localStorage.getItem("oursales:data")) {
    try {
      const data = JSON.parse(localStorage.getItem("oursales:data"));
      let hasFakeData = false;
      let needsCleanup = false;

      // Verificar apenas IDs específicos dos dados de exemplo
      if (data.clientes?.some((c) => fakeIds.clientes.includes(c.id))) {
        hasFakeData = true;
        needsCleanup = true;
      }
      if (data.orcamentos?.some((o) => fakeIds.orcamentos.includes(o.id))) {
        hasFakeData = true;
        needsCleanup = true;
      }
      if (data.pedidos?.some((p) => fakeIds.pedidos.includes(p.id))) {
        hasFakeData = true;
        needsCleanup = true;
      }

      // Se encontrou dados fictícios, remover apenas eles, preservando o resto
      if (needsCleanup) {
        console.log("Removendo apenas dados fictícios específicos do localStorage");
        const cleanedData = {
          clientes: data.clientes?.filter((c) => !fakeIds.clientes.includes(c.id)) || data.clientes || [],
          industrias: data.industrias || [], // SEMPRE preservar indústrias
          produtos: data.produtos || [], // SEMPRE preservar produtos
          transportadoras: data.transportadoras || [], // SEMPRE preservar transportadoras
          orcamentos: data.orcamentos?.filter((o) => !fakeIds.orcamentos.includes(o.id)) || data.orcamentos || [],
          pedidos: data.pedidos?.filter((p) => !fakeIds.pedidos.includes(p.id)) || data.pedidos || [],
          crm: data.crm || []
        };
        localStorage.setItem("oursales:data", JSON.stringify(cleanedData));
        console.log("✅ Dados fictícios removidos, dados válidos preservados");
      } else {
        console.log("✅ Nenhum dado fictício encontrado (ou já foi removido anteriormente)");
      }
    } catch (error) {
      console.warn("Erro ao verificar dados fictícios:", error);
      // Não remover nada se houver erro
    }
  }

  // Sobrescrever a função seedDataIfEmpty para não carregar dados fictícios
  setTimeout(() => {
    if (typeof seedDataIfEmpty === "function") {
      window.seedDataIfEmpty = function () {
        const state = storage.load();
        const hasData = Object.values(state).some(
          (collection) => collection.length
        );
        if (hasData) {
          return;
        }
        // Sistema limpo - sem dados fictícios
        storage.set({
          clientes: [],
          transportadoras: [],
          industrias: [],
          produtos: [],
          orcamentos: [],
          pedidos: [],
          crm: [],
        });
      };
    }
  }, 100);
}

// === CORREÇÃO COMPLETA DE BUG VISUAL ===
function fixVisualBug() {
  console.log("OurSales - Aplicando correção completa de bug visual");

  // Correção completa via CSS inline
  const completeFix = document.createElement("style");
  completeFix.textContent = `
    /* REMOVER TODOS OS ÍCONES DE CHECK DE TODOS OS ELEMENTOS */
    
    /* Botões - remover qualquer conteúdo ::after */
    button::after,
    button[type="button"]::after,
    button[type="submit"]::after,
    button[type="reset"]::after,
    .button::after,
    .button-primary::after,
    .button-secondary::after,
    .button-danger::after,
    .square-card-button::after,
    .modern-button::after,
    .dropdown-button::after,
    .btn::after {
      content: none !important;
      display: none !important;
    }
    
    /* Elementos de seleção - remover conteúdo ::after */
    select::after,
    .select::after,
    .modern-form-select::after,
    .dropdown-select::after,
    .custom-select::after,
    select::before,
    .select::before,
    .modern-form-select::before,
    .dropdown-select::before,
    .custom-select::before {
      content: none !important;
      display: none !important;
    }
    
    /* Elementos de lista e cards - remover conteúdo ::after */
    .list-item::after,
    .table-row::after,
    .modern-card::after,
    .card::after,
    .modern-list::after,
    .modern-list-header::after,
    .modern-list-title::after,
    .modern-list-description::after,
    .modern-list-toolbar::after {
      content: none !important;
      display: none !important;
    }
    
    /* Elementos de formulário - remover conteúdo ::after */
    .form-group::after,
    .field-group::after,
    .modern-form-field::after,
    .input-group::after,
    .form-control::after {
      content: none !important;
      display: none !important;
    }
    
    /* Elementos de navegação - remover conteúdo ::after */
    nav::after,
    nav a::after,
    .nav-link::after,
    .breadcrumb::after,
    .pagination::after {
      content: none !important;
      display: none !important;
    }
    
    /* Elementos de header e footer - remover conteúdo ::after */
    header::after,
    .header::after,
    .header-left::after,
    .header-right::after,
    .header-logo::after,
    .header-brand::after,
    footer::after,
    .footer::after {
      content: none !important;
      display: none !important;
    }
    
    /* Elementos de drawer e modal - remover conteúdo ::after */
    .drawer::after,
    .modal::after,
    .overlay::after,
    .popup::after {
      content: none !important;
      display: none !important;
    }
    
    /* Elementos específicos do OurSales - remover conteúdo ::after */
    .empty-state::after,
    .loading::after,
    .error::after,
    .success::after,
    .warning::after {
      content: none !important;
      display: none !important;
    }
    
    /* GARANTIR QUE APENAS CHECKBOXES TENHAM O SÍMBOLO DE CHECK */
    input[type="checkbox"]:checked::after {
      content: '✓' !important;
      position: absolute !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      color: white !important;
      font-size: 12px !important;
      font-weight: bold !important;
      z-index: 10 !important;
      pointer-events: none !important;
    }
    
    /* Remover check de checkboxes não marcados */
    input[type="checkbox"]:not(:checked)::after {
      content: none !important;
    }
    
    /* Remover check de outros tipos de input */
    input[type="text"]::after,
    input[type="email"]::after,
    input[type="password"]::after,
    input[type="number"]::after,
    input[type="tel"]::after,
    input[type="url"]::after,
    input[type="search"]::after,
    input[type="date"]::after,
    input[type="time"]::after,
    input[type="datetime-local"]::after,
    input[type="radio"]::after {
      content: none !important;
    }
    
    /* Remover check de elementos de seleção customizados */
    .select-radio::after,
    .select-radio .bubble::after,
    .bubble::after,
    .radio-button::after,
    .checkbox-custom::after {
      content: '' !important;
    }
    
    /* CORREÇÃO ESPECÍFICA PARA ELEMENTOS PROBLEMÁTICOS */
    *:not(input[type="checkbox"]):not(.checkbox)::after {
      content: none !important;
    }
    
    /* CORREÇÃO ESPECÍFICA PARA ELEMENTOS DE SELEÇÃO */
    select,
    .select,
    .modern-form-select,
    .dropdown-select,
    .custom-select {
      background-image: none !important;
    }
    
    select::after,
    select::before,
    .select::after,
    .select::before,
    .modern-form-select::after,
    .modern-form-select::before,
    .dropdown-select::after,
    .dropdown-select::before,
    .custom-select::after,
    .custom-select::before {
      content: none !important;
      display: none !important;
      background-image: none !important;
    }
    
    /* Forçar remoção de qualquer conteúdo ::after em elementos específicos */
    [class*="button"]::after,
    [class*="btn"]::after,
    [class*="select"]::after,
    [class*="card"]::after,
    [class*="list"]::after,
    [class*="item"]::after,
    [class*="header"]::after,
    [class*="footer"]::after,
    [class*="nav"]::after,
    [class*="form"]::after {
      content: none !important;
    }
  `;

  document.head.appendChild(completeFix);

  // Correção adicional via JavaScript
  setTimeout(() => {
    console.log("OurSales - Aplicando correção JavaScript adicional");

    // Remover qualquer atributo que possa estar causando o problema
    const allElements = document.querySelectorAll("*");
    allElements.forEach((element) => {
      // Verificar se o elemento tem conteúdo ::after indesejado
      const computedStyle = window.getComputedStyle(element, "::after");
      if (
        computedStyle.content &&
        computedStyle.content !== "none" &&
        computedStyle.content !== '""' &&
        computedStyle.content !== "''"
      ) {
        // Se não for um checkbox, remover o conteúdo
        if (element.tagName !== "INPUT" || element.type !== "checkbox") {
          element.style.setProperty("--after-content", "none", "important");
          element.style.setProperty("content", "none", "important");
        }
      }
    });

    // Correção específica para elementos com classes problemáticas
    const problematicClasses = [
      "button",
      "btn",
      "select",
      "card",
      "list",
      "item",
      "header",
      "footer",
      "nav",
      "form",
      "square-card-button",
      "button-primary",
      "button-secondary",
      "modern-form-select",
    ];

    problematicClasses.forEach((className) => {
      const elements = document.querySelectorAll(`.${className}`);
      elements.forEach((element) => {
        element.style.setProperty("--after-content", "none", "important");
      });
    });

    // Correção específica para elementos de seleção
    const selectElements = document.querySelectorAll(
      "select, .select, .modern-form-select, .dropdown-select, .custom-select"
    );
    selectElements.forEach((element) => {
      element.style.setProperty("background-image", "none", "important");
      element.style.setProperty("--after-content", "none", "important");
      element.style.setProperty("--before-content", "none", "important");

      // Remover qualquer pseudo-elemento
      const afterStyle = window.getComputedStyle(element, "::after");
      const beforeStyle = window.getComputedStyle(element, "::before");

      if (afterStyle.content && afterStyle.content !== "none") {
        element.style.setProperty("content", "none", "important");
      }
      if (beforeStyle.content && beforeStyle.content !== "none") {
        element.style.setProperty("content", "none", "important");
      }
    });

    console.log(
      "OurSales - Correção completa de bug visual aplicada com sucesso"
    );
  }, 300);
}

// === CORREÇÃO DE BOTÕES DE ADICIONAR EM FORMULÁRIOS ===
function fixAddButtons() {
  console.log("OurSales - Corrigindo botões de adicionar em formulários");

  // Aguardar o DOM estar pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixAddButtons);
    return;
  }

  // Aplicar imediatamente se o DOM já estiver pronto
  console.log("OurSales - DOM pronto, aplicando botões inline imediatamente");
  addInlineAddButtons();

  // Também aplicar quando a página estiver completamente carregada
  if (document.readyState === "complete") {
    setTimeout(() => {
      console.log(
        "OurSales - Página completamente carregada, aplicando botões inline"
      );
      addInlineAddButtons();
    }, 100);
  }

  // Função para aguardar as funções estarem disponíveis
  function waitForFunctions() {
    return new Promise((resolve) => {
      const checkFunctions = () => {
        if (
          typeof addVendedorRow === "function" &&
          typeof addIndustriaRow === "function" &&
          typeof addTransportadoraRow === "function" &&
          typeof addContatoRow === "function" &&
          typeof addPagamentoRow === "function"
        ) {
          resolve();
        } else {
          setTimeout(checkFunctions, 100);
        }
      };
      checkFunctions();
    });
  }

  // Aguardar funções estarem disponíveis e então corrigir botões
  waitForFunctions().then(() => {
    console.log(
      "OurSales - Funções de adicionar detectadas, corrigindo botões"
    );
    applyButtonFixes();
    addInlineAddButtons();
  });

  // Aplicar correções também após um delay adicional
  setTimeout(() => {
    console.log("OurSales - Aplicando correção adicional de botões");
    applyButtonFixes();
    addInlineAddButtons();
  }, 1000);

  // Aplicar correções imediatamente também (para casos onde as funções não existem)
  setTimeout(() => {
    console.log("OurSales - Aplicando correção imediata de botões inline");
    addInlineAddButtons();
  }, 100);

  function applyButtonFixes() {
    // Botões de adicionar para clientes PJ
    const pjButtons = [
      { id: "#pjVendedorAdicionar", action: () => addVendedorRow() },
      { id: "#pjIndustriaAdicionar", action: () => addIndustriaRow() },
      {
        id: "#pjTransportadoraAdicionar",
        action: () => addTransportadoraRow(),
      },
      { id: "#pjContatoAdicionar", action: () => addContatoRow() },
      { id: "#pjPagamentoAdicionar", action: () => addPagamentoRow() },
    ];

    // Botões de adicionar para clientes PF
    const pfButtons = [
      { id: "#pfVendedorAdicionar", action: () => addVendedorRow() },
      { id: "#pfIndustriaAdicionar", action: () => addIndustriaRow() },
      {
        id: "#pfTransportadoraAdicionar",
        action: () => addTransportadoraRow(),
      },
      { id: "#pfContatoAdicionar", action: () => addContatoRow() },
      { id: "#pfPagamentoAdicionar", action: () => addPagamentoRow() },
    ];

    // Corrigir botões PJ
    pjButtons.forEach(({ id, action }) => {
      const button = document.querySelector(id);
      if (button) {
        // Remover event listeners existentes
        button.replaceWith(button.cloneNode(true));
        const newButton = document.querySelector(id);

        // Adicionar novo event listener
        newButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`OurSales - Clicando em ${id}`);
          try {
            action();
          } catch (error) {
            console.error(`Erro ao executar ação de ${id}:`, error);
          }
        });
      }
    });

    // Corrigir botões PF
    pfButtons.forEach(({ id, action }) => {
      const button = document.querySelector(id);
      if (button) {
        // Remover event listeners existentes
        button.replaceWith(button.cloneNode(true));
        const newButton = document.querySelector(id);

        // Adicionar novo event listener
        newButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`OurSales - Clicando em ${id}`);
          try {
            action();
          } catch (error) {
            console.error(`Erro ao executar ação de ${id}:`, error);
          }
        });
      }
    });

    console.log("OurSales - Botões de adicionar corrigidos com sucesso");
  }

  // Adicionar botões "Adicionar" inline nas linhas das tabelas
  function addInlineAddButtons() {
    console.log("OurSales - Adicionando botões inline nas linhas das tabelas");

    // Adicionar botões inline para todas as linhas existentes
    addInlineButtonsToExistingRows();

    // Observar mudanças nas tabelas para adicionar botões em novas linhas
    observeTableChanges();

    // Aplicar novamente após um pequeno delay para garantir que todos os elementos estejam prontos
    setTimeout(() => {
      console.log("OurSales - Aplicando botões inline novamente após delay");
      addInlineButtonsToExistingRows();
    }, 500);
  }

  function addInlineButtonsToExistingRows() {
    console.log("OurSales - Procurando linhas com botões remover...");

    // Selecionar todas as linhas de tabela que têm botão "Remover" (método mais compatível)
    const allRows = document.querySelectorAll("tr");
    const rowsWithRemove = Array.from(allRows).filter((row) => {
      const removeButton =
        row.querySelector('button[data-action="remove"]') ||
        Array.from(row.querySelectorAll("button")).find((btn) =>
          btn.textContent.includes("Remover")
        ) ||
        row.textContent.includes("Remover");
      return removeButton;
    });

    console.log(
      `OurSales - Encontradas ${rowsWithRemove.length} linhas com botão remover`
    );

    rowsWithRemove.forEach((row, index) => {
      console.log(`OurSales - Processando linha ${index + 1}`);

      // Encontrar a célula de ações (última célula da linha)
      const cells = row.querySelectorAll("td");
      const actionsCell = cells[cells.length - 1];

      if (actionsCell && !actionsCell.querySelector(".button-add-inline")) {
        // Determinar qual função usar baseado no contexto
        let addFunction = null;
        const tableId = row.closest("table")?.id || "";
        const rowText = row.textContent.toLowerCase();

        console.log(
          `OurSales - Linha ${
            index + 1
          }: tableId="${tableId}", rowText="${rowText}"`
        );

        if (
          tableId.includes("Vendedor") ||
          rowText.includes("vendedor") ||
          row.querySelector('select[name*="Vendedor"]')
        ) {
          addFunction = () => addVendedorRow();
          console.log("OurSales - Detectada linha de vendedor");
        } else if (
          tableId.includes("Industria") ||
          rowText.includes("indústria") ||
          rowText.includes("industria") ||
          row.querySelector('select[name*="Industria"]')
        ) {
          addFunction = () => addIndustriaRow();
          console.log("OurSales - Detectada linha de indústria");
        } else if (
          tableId.includes("Transportadora") ||
          rowText.includes("transportadora") ||
          row.querySelector('select[name*="Transportadora"]')
        ) {
          addFunction = () => addTransportadoraRow();
          console.log("OurSales - Detectada linha de transportadora");
        } else if (
          tableId.includes("Contato") ||
          rowText.includes("contato") ||
          row.querySelector('input[name*="Contato"]')
        ) {
          addFunction = () => addContatoRow();
          console.log("OurSales - Detectada linha de contato");
        } else if (
          tableId.includes("Pagamento") ||
          rowText.includes("pagamento") ||
          rowText.includes("condição") ||
          row.querySelector('input[name*="Pagamento"]')
        ) {
          addFunction = () => addPagamentoRow();
          console.log("OurSales - Detectada linha de pagamento");
        }

        // Sempre criar o botão, mesmo se não tiver função específica
        console.log(
          `OurSales - Criando botão adicionar para linha ${index + 1}`
        );

        // Criar botão "Adicionar" inline
        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "button-add-inline button-primary";
        addButton.innerHTML = "➕";
        addButton.title = "Adicionar nova linha";
        addButton.style.marginRight = "8px";
        addButton.style.fontSize = "12px";
        addButton.style.padding = "4px 8px";
        addButton.style.backgroundColor = "#007bff";
        addButton.style.color = "white";
        addButton.style.border = "none";
        addButton.style.borderRadius = "4px";

        addButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("OurSales - Adicionando nova linha inline");
          try {
            // Verificar se a função existe antes de chamar
            if (addFunction && typeof addFunction === "function") {
              addFunction();
            } else {
              console.log(
                "OurSales - Função não encontrada, tentando método alternativo"
              );
              // Método alternativo: clicar no botão "Adicionar" principal da seção
              const sectionButton = Array.from(
                actionsCell
                  .closest("table")
                  .parentElement.querySelectorAll("button")
              ).find((btn) => btn.textContent.includes("Adicionar"));
              if (sectionButton) {
                sectionButton.click();
              }
            }
          } catch (error) {
            console.error("Erro ao adicionar linha inline:", error);
            // Fallback: tentar clicar no botão principal da seção
            try {
              const sectionButton = Array.from(
                actionsCell
                  .closest("table")
                  .parentElement.querySelectorAll("button")
              ).find((btn) => btn.textContent.includes("Adicionar"));
              if (sectionButton) {
                sectionButton.click();
              }
            } catch (fallbackError) {
              console.error("Erro no fallback:", fallbackError);
            }
          }
        });

        // Encontrar o botão "Remover" e substituir por ícone de lixeira
        const removeButton =
          actionsCell.querySelector('button[data-action="remove"]') ||
          Array.from(actionsCell.querySelectorAll("button")).find((btn) =>
            btn.textContent.includes("Remover")
          );

        if (removeButton) {
          // Atualizar o botão remover com ícone de lixeira
          removeButton.innerHTML = "🗑️";
          removeButton.title = "Remover linha";
          removeButton.style.backgroundColor = "#dc3545";
          removeButton.style.color = "white";
          removeButton.style.border = "none";
          removeButton.style.borderRadius = "4px";
          removeButton.style.fontSize = "12px";
          removeButton.style.padding = "4px 8px";

          // Inserir o botão "Adicionar" antes do botão "Remover"
          actionsCell.insertBefore(addButton, removeButton);
          console.log(
            `OurSales - Botão adicionar criado na linha ${index + 1}`
          );
        }
      }
    });

    console.log("OurSales - Finalizada adição de botões inline");
  }

  function observeTableChanges() {
    // Observar mudanças nas tabelas para adicionar botões em novas linhas
    const tables = document.querySelectorAll("table");

    tables.forEach((table) => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (
                node.nodeType === Node.ELEMENT_NODE &&
                node.tagName === "TR"
              ) {
                setTimeout(() => addInlineButtonsToExistingRows(), 100);
              }
            });
          }
        });
      });

      observer.observe(table, {
        childList: true,
        subtree: true,
      });
    });
  }
}

// === CORREÇÃO DE BOTÕES DE CLIENTES ===
function fixClientButtons() {
  console.log("OurSales - Corrigindo botões de clientes");

  // Aguardar o DOM estar pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixClientButtons);
    return;
  }

  // Corrigir botões de criação de clientes
  const pjBtn = document.querySelector("#clienteCriarPJ");
  const pfBtn = document.querySelector("#clienteCriarPF");
  const editBtn = document.querySelector("#clienteEditar");
  const removeBtn = document.querySelector("#clienteRemover");
  const crmBtn = document.querySelector("#clienteCRM");

  // Remover event listeners duplicados
  if (pjBtn) {
    pjBtn.replaceWith(pjBtn.cloneNode(true));
    const newPjBtn = document.querySelector("#clienteCriarPJ");
    newPjBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = "cliente-pj.html";
    });
  }

  if (pfBtn) {
    pfBtn.replaceWith(pfBtn.cloneNode(true));
    const newPfBtn = document.querySelector("#clienteCriarPF");
    newPfBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = "cliente-pf.html";
    });
  }

  // Corrigir botões de ação
  if (editBtn) {
    editBtn.replaceWith(editBtn.cloneNode(true));
    const newEditBtn = document.querySelector("#clienteEditar");
    newEditBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!window.selectedId) {
        window.alert("Selecione um cliente para editar.");
        return;
      }
      // Redirecionar para página de edição
      const cliente = storage
        .load()
        .clientes.find((c) => c.id === window.selectedId);
      if (cliente) {
        const tipoCliente =
          cliente.tipo ||
          (cliente.documento?.replace(/\D/g, "").length === 14 ? "PJ" : "PF");
        const pagina =
          tipoCliente === "PJ" ? "cliente-pj.html" : "cliente-pf.html";
        window.location.href = `${pagina}?id=${window.selectedId}`;
      }
    });
  }

  if (removeBtn) {
    removeBtn.replaceWith(removeBtn.cloneNode(true));
    const newRemoveBtn = document.querySelector("#clienteRemover");
    newRemoveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!window.selectedId) {
        window.alert("Selecione um cliente para remover.");
        return;
      }
      if (window.confirm("Tem certeza que deseja remover este cliente?")) {
        storage.mutate((draft) => {
          draft.clientes = draft.clientes.filter(
            (c) => c.id !== window.selectedId
          );
        });
        window.selectedId = "";
        if (typeof render === "function") render();
        if (typeof updateActionsState === "function") updateActionsState();
      }
    });
  }

  if (crmBtn) {
    crmBtn.replaceWith(crmBtn.cloneNode(true));
    const newCrmBtn = document.querySelector("#clienteCRM");
    newCrmBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!window.selectedId) {
        window.alert("Selecione um cliente para abrir o CRM.");
        return;
      }
      window.sessionStorage.setItem("oursales:crmTarget", window.selectedId);
      window.location.href = "crm.html";
    });
  }
}

// === OTIMIZAÇÕES DE PERFORMANCE ===

// Debounce para eventos de scroll e resize
// Usar função local com nome diferente para evitar conflito com app.js
const debounceLocal = function(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait || 300);
  };
};

// Throttle para eventos frequentes
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Otimizar scroll com requestAnimationFrame
let scrollTimeout;
function optimizedScroll() {
  if (scrollTimeout) {
    cancelAnimationFrame(scrollTimeout);
  }
  scrollTimeout = requestAnimationFrame(() => {
    // Aplicar lazy loading apenas quando necessário
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;

    // Só aplicar lazy loading se estiver próximo do final da página
    if (
      scrollTop + windowHeight >
      document.documentElement.scrollHeight - 1000
    ) {
      if (typeof applyLazyLoading === "function") {
        applyLazyLoading();
      }
    }
  });
}

// Otimizações de CSS
function optimizeCSS() {
  // Adicionar will-change para elementos que fazem animação
  const style = document.createElement("style");
  style.textContent = `
    /* Otimizações de performance */
    .header-logo,
    .square-card-button,
    .table-row,
    .list-item {
      will-change: transform;
    }
    
    /* Reduzir animações em dispositivos com preferência por movimento reduzido */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    /* Otimizar scroll */
    .modern-list,
    .table-container {
      contain: layout style paint;
    }
    
    /* Melhorar performance de hover */
    .table-row:hover,
    .list-item:hover {
      transform: translateZ(0);
    }
  `;
  document.head.appendChild(style);
}

// === INICIALIZAÇÃO PRINCIPAL ===
function initOurSalesFixes() {
  console.log("OurSales - Inicializando todas as correções e otimizações");

  // Aplicar todas as correções
  removeFakeData();
  fixVisualBug();
  fixClientButtons();
  fixAddButtons();
  optimizeCSS();

  // Otimizar eventos de scroll
  const optimizedScrollHandler = throttle(optimizedScroll, 16); // ~60fps
  window.addEventListener("scroll", optimizedScrollHandler, { passive: true });

  // Otimizar resize
  const optimizedResizeHandler = debounceLocal(() => {
    // Recalcular layouts se necessário
    if (typeof applyLazyLoading === "function") {
      applyLazyLoading();
    }
  }, 250);
  window.addEventListener("resize", optimizedResizeHandler, { passive: true });

  // Preload de recursos críticos
  const criticalResources = ["assets/css/style.css", "assets/js/app.js"];

  criticalResources.forEach((resource) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = resource;
    link.as = resource.endsWith(".css") ? "style" : "script";
    document.head.appendChild(link);
  });

  // Aplicar correções de botões
  applyInlineButtons();

  console.log(
    "OurSales - Todas as correções e otimizações aplicadas com sucesso!"
  );
}

// === FUNÇÃO PARA APLICAR BOTÕES INLINE ===
// Esta função não é mais necessária pois os botões são criados diretamente no app.js
function applyInlineButtons() {
  console.log("OurSales - Botões inline já são criados diretamente no app.js");
}

// === INICIALIZAÇÃO OTIMIZADA ===
function initOurSalesFixes() {
  if (fixesApplied) {
    return; // Já executou, não executa novamente
  }

  console.log("OurSales - Inicializando todas as correções e otimizações");

  // Aplicar todas as correções
  removeFakeData();
  fixVisualBug();
  fixClientButtons();
  fixAddButtons();

  fixesApplied = true;
  console.log(
    "OurSales - Todas as correções e otimizações aplicadas com sucesso!"
  );
}

// Inicializar apenas uma vez quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initOurSalesFixes);
} else {
  initOurSalesFixes();
}
