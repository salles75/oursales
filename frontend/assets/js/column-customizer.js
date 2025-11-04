/**
 * OurSales - Sistema de Personalização de Colunas
 * Permite adicionar/remover colunas dinamicamente nas tabelas
 */

class ColumnCustomizer {
  constructor() {
    this.customColumns = this.loadCustomColumns();
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Aguardar DOM estar pronto
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.addCustomizeButtons();
        this.bindEvents();
      });
    } else {
      this.addCustomizeButtons();
      this.bindEvents();
    }
  }

  addCustomizeButtons() {
    const pages = [
      "clientes",
      "orcamentos",
      "pedidos",
      "produtos",
      "industrias",
    ];

    pages.forEach((page) => {
      const toolbar = document.querySelector(
        `[data-page="${page}"] .modern-list-toolbar`
      );
      if (toolbar && !toolbar.querySelector(".customize-columns-btn")) {
        const customizeBtn = document.createElement("button");
        customizeBtn.type = "button";
        customizeBtn.className =
          "square-card-button outline customize-columns-btn";
        customizeBtn.innerHTML = "Personalizar Colunas";
        customizeBtn.setAttribute("data-page", page);
        toolbar.appendChild(customizeBtn);
      }
    });
  }

  bindEvents() {
    // Event delegation para botões de personalizar colunas
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("customize-columns-btn")) {
        const page = e.target.getAttribute("data-page");
        this.openCustomizeModal(page);
      }
    });

    // Event delegation para checkbox "Selecionar Todos"
    document.addEventListener("change", (e) => {
      if (e.target.classList.contains("select-all-checkbox")) {
        this.toggleSelectAll(e.target);
      }
    });
  }

  detectVisibleColumns(page) {
    // Mapear nomes de páginas para seletores de tabela
    const pageSelectors = {
      clientes: '[data-page="clientes"]',
      orcamentos: '[data-page="orcamentos"]',
      pedidos: '[data-page="pedidos"]',
      produtos: '[data-page="produtos"]',
      industrias: '[data-page="industrias"]'
    };
    
    // Mapear labels das colunas para keys
    const labelToKeyMap = {
      clientes: {
        'Cliente': 'nome',
        'CNPJ/CPF': 'documento',
        'E-mail': 'email',
        'Telefone': 'telefone',
        'Observações': 'observacoes',
        'Endereço': 'endereco',
        'Cidade': 'cidade',
        'Estado': 'estado',
        'CEP': 'cep',
        'Data de Cadastro': 'dataCadastro',
        'Última Compra': 'ultimaCompra',
        'Total de Compras': 'totalCompras'
      },
      orcamentos: {
        'Cliente': 'cliente',
        'Valor Sem Imposto': 'valorSemImposto',
        'Valor Com Imposto': 'valorComImposto',
        'Validade': 'validade',
        'Observações': 'observacoes',
        'Status': 'status',
        'Data de Criação': 'dataCriacao',
        'Vendedor': 'vendedor',
        'Desconto': 'desconto',
        'Prazo de Entrega': 'prazoEntrega'
      },
      pedidos: {
        'Cliente': 'cliente',
        'Valor Sem Imposto': 'valorSemImposto',
        'Valor Com Imposto': 'valorComImposto',
        'Data de Entrega': 'dataEntrega',
        'Status': 'status',
        'Transportadora': 'transportadora',
        'Observações': 'observacoes',
        'Data de Criação': 'dataCriacao',
        'Vendedor': 'vendedor',
        'Prazo de Pagamento': 'prazoPagamento'
      },
      produtos: {
        'Nome do Produto': 'nome',
        'Categoria': 'categoria',
        'Preço': 'preco',
        'Estoque': 'estoque',
        'Descrição': 'descricao',
        'SKU': 'sku',
        'Marca': 'marca',
        'Fornecedor': 'fornecedor',
        'Data de Cadastro': 'dataCadastro',
        'Última Venda': 'ultimaVenda'
      },
      industrias: {
        'Razão Social': 'razaoSocial',
        'Nome Fantasia': 'nomeFantasia',
        'CNPJ': 'cnpj',
        'Contato': 'contato',
        'Telefone': 'telefone',
        'E-mail': 'email',
        'Endereço': 'endereco',
        'Data de Cadastro': 'dataCadastro',
        'Observações': 'observacoes'
      }
    };
    
    const selector = pageSelectors[page];
    if (!selector) return [];
    
    const pageElement = document.querySelector(selector);
    if (!pageElement) return [];
    
    // Procurar pela tabela
    const table = pageElement.querySelector('table.data-table') || 
                  pageElement.querySelector('table') ||
                  pageElement.querySelector('.data-table table');
    
    if (!table) return [];
    
    // Pegar os headers (th) da tabela, exceto o de seleção
    const headers = Array.from(table.querySelectorAll('thead th'));
    const visibleKeys = [];
    
    headers.forEach(th => {
      const text = th.textContent.trim();
      // Ignorar checkbox de seleção
      if (text === '' || text === '☐' || th.querySelector('input[type="checkbox"]')) {
        return;
      }
      
      // Converter label para key usando o mapeamento
      const keyMap = labelToKeyMap[page];
      if (keyMap && keyMap[text]) {
        visibleKeys.push(keyMap[text]);
      } else {
        // Tentar encontrar a key diretamente
        const dataColumn = th.getAttribute('data-column');
        if (dataColumn) {
          visibleKeys.push(dataColumn);
        }
      }
    });
    
    return visibleKeys;
  }

  openCustomizeModal(page) {
    // Detectar colunas visíveis na tabela atual
    const visibleColumnsFromTable = this.detectVisibleColumns(page);
    
    // Se não houver colunas salvas mas há colunas visíveis na tela, usar as visíveis
    if ((!this.customColumns[page] || this.customColumns[page].length === 0) && visibleColumnsFromTable.length > 0) {
      this.customColumns[page] = visibleColumnsFromTable;
      this.saveCustomColumnsToStorage();
    }

    // Criar modal de personalização
    const modal = document.createElement("div");
    modal.className = "modal-overlay customize-modal";
    modal.innerHTML = `
      <div class="modal-content customize-content">
        <div class="modal-header">
          <h3>Personalizar Colunas - ${this.getPageTitle(page)}</h3>
          <button type="button" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="available-columns">
            <h4>Colunas Disponíveis</h4>
            <div class="columns-list" id="availableColumns-${page}">
              ${this.renderAvailableColumns(page)}
            </div>
          </div>
          <div class="selected-columns">
            <h4>Colunas Selecionadas</h4>
            <div class="columns-list" id="selectedColumns-${page}">
              ${this.renderSelectedColumns(page)}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary modal-close">Cancelar</button>
          <button type="button" class="btn btn-primary" data-action="save" data-page="${page}">Salvar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Bind events do modal
    this.bindModalEvents(modal, page);
    
    // Inicializar drag and drop para colunas selecionadas
    this.initDragAndDrop(modal, page);
  }

  renderAvailableColumns(page) {
    const availableColumns = this.getAvailableColumns(page);
    const selectedColumns = this.customColumns[page] || [];

    return availableColumns
      .filter((col) => !selectedColumns.includes(col.key))
      .map(
        (col) => `
        <div class="column-item" data-key="${col.key}">
          <label>
            <input type="checkbox" value="${col.key}">
            <span>${col.label}</span>
          </label>
        </div>
      `
      )
      .join("");
  }

  renderSelectedColumns(page) {
    const selectedColumns = this.customColumns[page] || [];
    const availableColumns = this.getAvailableColumns(page);

    return selectedColumns
      .map((key) => {
        const col = availableColumns.find((c) => c.key === key);
        return col
          ? `
        <div class="column-item selected" data-key="${key}" draggable="true">
          <span class="drag-handle" title="Arrastar para reordenar">☰</span>
          <label>
            <input type="checkbox" checked value="${key}">
            <span>${col.label}</span>
          </label>
          <button type="button" class="remove-column" data-key="${key}">&times;</button>
        </div>
      `
          : "";
      })
      .join("");
  }

  getAvailableColumns(page) {
    const baseColumns = {
      clientes: [
        { key: "nome", label: "Nome/Razão Social" },
        { key: "documento", label: "CNPJ/CPF" },
        { key: "email", label: "E-mail" },
        { key: "telefone", label: "Telefone" },
        { key: "observacoes", label: "Observações" },
        { key: "endereco", label: "Endereço" },
        { key: "cidade", label: "Cidade" },
        { key: "estado", label: "Estado" },
        { key: "cep", label: "CEP" },
        { key: "dataCadastro", label: "Data de Cadastro" },
        { key: "ultimaCompra", label: "Última Compra" },
        { key: "totalCompras", label: "Total de Compras" },
      ],
      orcamentos: [
        { key: "cliente", label: "Cliente" },
        { key: "valorSemImposto", label: "Valor Sem Imposto" },
        { key: "valorComImposto", label: "Valor Com Imposto" },
        { key: "validade", label: "Validade" },
        { key: "observacoes", label: "Observações" },
        { key: "status", label: "Status" },
        { key: "dataCriacao", label: "Data de Criação" },
        { key: "vendedor", label: "Vendedor" },
        { key: "desconto", label: "Desconto" },
        { key: "prazoEntrega", label: "Prazo de Entrega" },
      ],
      pedidos: [
        { key: "cliente", label: "Cliente" },
        { key: "valorSemImposto", label: "Valor Sem Imposto" },
        { key: "valorComImposto", label: "Valor Com Imposto" },
        { key: "dataEntrega", label: "Data de Entrega" },
        { key: "status", label: "Status" },
        { key: "transportadora", label: "Transportadora" },
        { key: "observacoes", label: "Observações" },
        { key: "dataCriacao", label: "Data de Criação" },
        { key: "vendedor", label: "Vendedor" },
        { key: "prazoPagamento", label: "Prazo de Pagamento" },
      ],
      produtos: [
        { key: "nome", label: "Nome do Produto" },
        { key: "categoria", label: "Categoria" },
        { key: "preco", label: "Preço" },
        { key: "estoque", label: "Estoque" },
        { key: "descricao", label: "Descrição" },
        { key: "sku", label: "SKU" },
        { key: "marca", label: "Marca" },
        { key: "fornecedor", label: "Fornecedor" },
        { key: "dataCadastro", label: "Data de Cadastro" },
        { key: "ultimaVenda", label: "Última Venda" },
      ],
      industrias: [
        { key: "razaoSocial", label: "Razão Social" },
        { key: "nomeFantasia", label: "Nome Fantasia" },
        { key: "cnpj", label: "CNPJ" },
        { key: "contato", label: "Contato" },
        { key: "telefone", label: "Telefone" },
        { key: "email", label: "E-mail" },
        { key: "endereco", label: "Endereço" },
        { key: "dataCadastro", label: "Data de Cadastro" },
        { key: "observacoes", label: "Observações" },
      ],
    };

    return baseColumns[page] || [];
  }

  getPageTitle(page) {
    const titles = {
      clientes: "Clientes",
      orcamentos: "Orçamentos",
      pedidos: "Pedidos",
      produtos: "Produtos",
      industrias: "Indústrias",
    };
    return titles[page] || page;
  }

  bindModalEvents(modal, page) {
    // Função helper para fechar modal
    const closeModal = () => {
      try {
        if (modal && modal.parentNode) {
          modal.classList.add("fade-out");
          setTimeout(() => {
            if (modal.parentNode) {
              modal.parentNode.removeChild(modal);
            }
          }, 200);
        }
      } catch (e) {
        console.error("Erro ao fechar modal:", e);
      }
    };

    // Fechar modal (clique no X ou botão Cancelar)
    modal.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    });

    // Fechar modal ao clicar fora
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("modal-overlay")) {
        closeModal();
      }
    });

    // Fechar com ESC
    const escHandler = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);

    // Salvar configurações
    const saveBtn = modal.querySelector('[data-action="save"]');
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        this.saveCustomColumns(page, modal);
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
        this.refreshTable(page);
      });
    }

    // Adicionar/remover colunas
    modal.addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        this.updateColumnSelection(page, modal, e.target);
      }
    });

    // Remover coluna
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-column")) {
        const key = e.target.getAttribute("data-key");
        this.removeColumn(page, modal, key);
      }
    });
  }

  updateColumnSelection(page, modal, checkbox) {
    const key = checkbox.value;
    const isSelected = checkbox.checked;

    if (isSelected) {
      this.addColumnToSelected(page, modal, key);
    } else {
      this.removeColumnFromSelected(page, modal, key);
    }
  }

  addColumnToSelected(page, modal, key) {
    const availableColumns = this.getAvailableColumns(page);
    const col = availableColumns.find((c) => c.key === key);

    if (col) {
      const selectedContainer = modal.querySelector("#selectedColumns-" + page);
      const columnItem = document.createElement("div");
      columnItem.className = "column-item selected";
      columnItem.setAttribute("data-key", key);
      columnItem.setAttribute("draggable", "true");
      columnItem.innerHTML = `
        <span class="drag-handle" title="Arrastar para reordenar">☰</span>
        <label>
          <input type="checkbox" checked value="${key}">
          <span>${col.label}</span>
        </label>
        <button type="button" class="remove-column" data-key="${key}">&times;</button>
      `;
      selectedContainer.appendChild(columnItem);
    }
  }

  removeColumnFromSelected(page, modal, key) {
    const selectedItem = modal.querySelector(
      `#selectedColumns-${page} .column-item[data-key="${key}"]`
    );
    if (selectedItem) {
      selectedItem.remove();
    }
  }

  removeColumn(page, modal, key) {
    // Remover da lista selecionada
    this.removeColumnFromSelected(page, modal, key);

    // Marcar como não selecionado na lista disponível
    const availableCheckbox = modal.querySelector(
      `#availableColumns-${page} input[value="${key}"]`
    );
    if (availableCheckbox) {
      availableCheckbox.checked = false;
    }
  }

  initDragAndDrop(modal, page) {
    const selectedContainer = modal.querySelector(`#selectedColumns-${page}`);
    if (!selectedContainer) return;

    let draggedElement = null;

    // Event listener para início do drag
    selectedContainer.addEventListener('dragstart', (e) => {
      // Permitir drag apenas se clicar no item ou no handle
      const item = e.target.closest('.column-item.selected');
      if (!item) return;
      
      // Prevenir drag se clicar no checkbox ou botão remover
      if (e.target.type === 'checkbox' || e.target.classList.contains('remove-column')) {
        e.preventDefault();
        return;
      }
      
      draggedElement = item;
      draggedElement.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    // Event listener durante o drag
    selectedContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      const afterElement = this.getDragAfterElement(selectedContainer, e.clientY);
      const dragging = selectedContainer.querySelector('.dragging');
      
      // Remover indicador visual anterior
      selectedContainer.querySelectorAll('.column-item.selected').forEach(item => {
        item.classList.remove('drag-over');
      });
      
      // Adicionar indicador visual na posição de drop
      if (afterElement && dragging) {
        afterElement.classList.add('drag-over');
      }
      
      if (dragging) {
        if (afterElement == null) {
          selectedContainer.appendChild(dragging);
        } else {
          selectedContainer.insertBefore(dragging, afterElement);
        }
      }
    });

    // Event listener quando solta
    selectedContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      
      // Remover todos os indicadores visuais
      selectedContainer.querySelectorAll('.column-item.selected').forEach(item => {
        item.classList.remove('drag-over');
      });
      
      if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
      }
    });

    // Event listener para finalizar drag
    selectedContainer.addEventListener('dragend', (e) => {
      // Remover todos os indicadores visuais
      selectedContainer.querySelectorAll('.column-item.selected').forEach(item => {
        item.classList.remove('dragging', 'drag-over');
      });
      
      draggedElement = null;
    });
  }

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.column-item.selected:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  saveCustomColumns(page, modal) {
    try {
      // Obter ordem atual baseada na posição dos elementos no DOM
      const selectedContainer = modal.querySelector(`#selectedColumns-${page}`);
      const items = selectedContainer.querySelectorAll('.column-item.selected');
      const selectedColumns = Array.from(items).map(item => item.getAttribute('data-key'));

      console.log(`Salvando colunas para ${page}:`, selectedColumns);

      this.customColumns[page] = selectedColumns;
      this.saveCustomColumnsToStorage();

      console.log("Colunas salvas com sucesso:", this.customColumns);
      
      // Retornar sucesso
      return true;
    } catch (error) {
      console.error("Erro ao salvar colunas:", error);
      window.alert("Erro ao salvar colunas. Por favor, tente novamente.");
      return false;
    }
  }

  refreshTable(page) {
    // Salvar as configurações no localStorage primeiro
    this.saveCustomColumnsToStorage();

    // Disparar evento personalizado para atualizar colunas
    const event = new CustomEvent("columnsUpdated", {
      detail: { page, columns: this.customColumns[page] },
    });
    document.dispatchEvent(event);

    // Recarregar a página para aplicar as mudanças
    setTimeout(() => {
      window.location.reload();
    }, 200);
  }

  loadCustomColumns() {
    try {
      const saved = localStorage.getItem("oursales-custom-columns");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  saveCustomColumnsToStorage() {
    try {
      localStorage.setItem(
        "oursales-custom-columns",
        JSON.stringify(this.customColumns)
      );
    } catch (e) {
      console.error("Erro ao salvar colunas personalizadas:", e);
    }
  }

  getCustomColumns(page) {
    return this.customColumns[page] || [];
  }
}

// Inicializar o sistema
const columnCustomizer = new ColumnCustomizer();
