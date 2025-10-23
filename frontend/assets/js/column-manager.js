/**
 * Gerenciador de Colunas Personalizadas
 * Sistema para personalizar colunas em tabelas de orçamentos e pedidos
 */

class ColumnManager {
  constructor(tipo) {
    this.tipo = tipo; // 'orcamentos' ou 'pedidos'
    this.colunasDisponiveis = [];
    this.colunasAtivas = [];
    this.apiBase = "/api/configuracoes";
  }

  /**
   * Carregar configurações de colunas
   */
  async carregarConfiguracoes() {
    try {
      // Usar localStorage em vez da API
      const configKey = `colunas_${this.tipo}`;
      const configSalva = localStorage.getItem(configKey);

      if (configSalva) {
        this.colunasAtivas = JSON.parse(configSalva);
      } else {
        this.colunasAtivas = this.getColunasPadrao();
      }

      return this.colunasAtivas;
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      this.colunasAtivas = this.getColunasPadrao();
      return this.colunasAtivas;
    }
  }

  /**
   * Carregar colunas disponíveis
   */
  async carregarColunasDisponiveis() {
    try {
      // Usar dados locais em vez da API
      this.colunasDisponiveis = this.getColunasCompletas();
      return this.colunasDisponiveis;
    } catch (error) {
      console.error("Erro ao carregar colunas disponíveis:", error);
      this.colunasDisponiveis = this.getColunasCompletas();
      return this.colunasDisponiveis;
    }
  }

  /**
   * Salvar configurações de colunas
   */
  async salvarConfiguracoes(colunas) {
    try {
      // Usar localStorage em vez da API
      const configKey = `colunas_${this.tipo}`;
      localStorage.setItem(configKey, JSON.stringify(colunas));
      this.colunasAtivas = colunas;
      return true;
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      throw error;
    }
  }

  /**
   * Obter colunas padrão
   */
  getColunasPadrao() {
    const padroes = {
      orcamentos: [
        "tipo",
        "numero",
        "razaoSocial",
        "cliente",
        "industria",
        "valor",
        "valorComImposto",
        "dataOrcamento",
        "codigoCliente",
        "vendedor",
        "digitador",
        "dataAtualizacao",
        "transportadora",
      ],
      pedidos: [
        "tipo",
        "numero",
        "razaoSocial",
        "cliente",
        "industria",
        "valor",
        "valorComImposto",
        "dataPedido",
        "codigoCliente",
        "vendedor",
        "digitador",
        "dataAtualizacao",
        "transportadora",
        "status",
      ],
    };

    return padroes[this.tipo] || [];
  }

  /**
   * Obter todas as colunas disponíveis
   */
  getColunasCompletas() {
    const completas = {
      orcamentos: [
        "tipo",
        "numero",
        "razaoSocial",
        "cliente",
        "industria",
        "valor",
        "valorComImposto",
        "dataOrcamento",
        "codigoCliente",
        "vendedor",
        "digitador",
        "dataAtualizacao",
        "transportadora",
        "status",
        "dataValidade",
        "condicaoPagamento",
        "formaPagamento",
        "prazoEntregaDias",
        "subtotal",
        "descontoValor",
        "descontoPercentual",
        "acrescimoValor",
        "valorFrete",
        "observacoes",
        "observacoesInternas",
        "convertidoPedido",
        "dataConversao",
        "criadoEm",
        "atualizadoEm",
        "criadoPor",
        "clienteCnpj",
        "clienteCpf",
        "clienteCidade",
        "clienteEstado",
        "clienteTelefone",
        "clienteEmail",
        "clienteSegmento",
        "clienteStatus",
        "vendedorEmail",
        "vendedorTelefone",
        "transportadoraCidade",
        "transportadoraEstado",
        "totalItens",
      ],
      pedidos: [
        "tipo",
        "numero",
        "razaoSocial",
        "cliente",
        "industria",
        "valor",
        "valorComImposto",
        "dataPedido",
        "codigoCliente",
        "vendedor",
        "digitador",
        "dataAtualizacao",
        "transportadora",
        "status",
        "numeroPedidoCliente",
        "dataAprovacao",
        "dataFaturamento",
        "dataEntregaPrevista",
        "dataEntregaRealizada",
        "condicaoPagamento",
        "formaPagamento",
        "prazoEntregaDias",
        "subtotal",
        "descontoValor",
        "descontoPercentual",
        "acrescimoValor",
        "valorFrete",
        "codigoRastreamento",
        "notaFiscal",
        "chaveNfe",
        "observacoes",
        "observacoesInternas",
        "motivoCancelamento",
        "criadoEm",
        "atualizadoEm",
        "criadoPor",
        "aprovadoPor",
        "canceladoPor",
        "clienteCnpj",
        "clienteCpf",
        "clienteCidade",
        "clienteEstado",
        "clienteTelefone",
        "clienteEmail",
        "clienteSegmento",
        "clienteStatus",
        "vendedorEmail",
        "vendedorTelefone",
        "transportadoraCidade",
        "transportadoraEstado",
        "totalItens",
      ],
    };

    return completas[this.tipo] || [];
  }

  /**
   * Obter rótulos das colunas
   */
  getRotulosColunas() {
    const rotulos = {
      tipo: "Tipo",
      numero: "Número",
      razaoSocial: "Razão Social",
      cliente: "Cliente",
      industria: "Indústria",
      valor: "Valor",
      valorComImposto: "Valor com Imposto",
      dataOrcamento: "Dt. Orçamento",
      dataPedido: "Dt. Pedido",
      codigoCliente: "Cód. Cliente",
      vendedor: "Vendedor",
      digitador: "Digitador",
      dataAtualizacao: "Dt. Atualização",
      transportadora: "Transportadora",
      status: "Status",
      dataValidade: "Dt. Validade",
      condicaoPagamento: "Condição de Pagamento",
      formaPagamento: "Forma de Pagamento",
      prazoEntregaDias: "Prazo Entrega (Dias)",
      subtotal: "Subtotal",
      descontoValor: "Desconto Valor",
      descontoPercentual: "Desconto %",
      acrescimoValor: "Acréscimo Valor",
      valorFrete: "Valor Frete",
      observacoes: "Observações",
      observacoesInternas: "Observações Internas",
      convertidoPedido: "Convertido Pedido",
      dataConversao: "Dt. Conversão",
      criadoEm: "Criado Em",
      atualizadoEm: "Atualizado Em",
      criadoPor: "Criado Por",
      aprovadoPor: "Aprovado Por",
      canceladoPor: "Cancelado Por",
      clienteCnpj: "CNPJ Cliente",
      clienteCpf: "CPF Cliente",
      clienteCidade: "Cidade Cliente",
      clienteEstado: "Estado Cliente",
      clienteTelefone: "Telefone Cliente",
      clienteEmail: "Email Cliente",
      clienteSegmento: "Segmento Cliente",
      clienteStatus: "Status Cliente",
      vendedorEmail: "Email Vendedor",
      vendedorTelefone: "Telefone Vendedor",
      transportadoraCidade: "Cidade Transportadora",
      transportadoraEstado: "Estado Transportadora",
      totalItens: "Total Itens",
      numeroPedidoCliente: "Nº Pedido Cliente",
      dataAprovacao: "Dt. Aprovação",
      dataFaturamento: "Dt. Faturamento",
      dataEntregaPrevista: "Dt. Entrega Prevista",
      dataEntregaRealizada: "Dt. Entrega Realizada",
      codigoRastreamento: "Código Rastreamento",
      notaFiscal: "Nota Fiscal",
      chaveNfe: "Chave NFe",
      motivoCancelamento: "Motivo Cancelamento",
    };

    return rotulos;
  }
}

/**
 * Modal de Personalização de Colunas
 */
class ColumnCustomizationModal {
  constructor(columnManager) {
    this.columnManager = columnManager;
    this.modal = null;
    this.colunasAtivas = [];
    this.colunasDisponiveis = [];
  }

  /**
   * Criar e mostrar o modal
   */
  async mostrar() {
    await this.carregarDados();
    this.criarModal();
    this.mostrarModal();
  }

  /**
   * Carregar dados necessários
   */
  async carregarDados() {
    this.colunasAtivas = await this.columnManager.carregarConfiguracoes();
    this.colunasDisponiveis =
      await this.columnManager.carregarColunasDisponiveis();
  }

  /**
   * Criar estrutura do modal
   */
  criarModal() {
    // Remover modal existente se houver
    const modalExistente = document.getElementById(
      "column-customization-modal"
    );
    if (modalExistente) {
      modalExistente.remove();
    }

    const modalHTML = `
      <div id="column-customization-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Personalizar Colunas</h3>
            <button class="modal-close" type="button">&times;</button>
          </div>
          <div class="modal-body">
            <div class="column-section">
              <h4>Adicionar Colunas</h4>
              <div class="add-column-controls">
                <select id="column-select" class="form-select">
                  <option value="">Selecione...</option>
                </select>
                <button id="add-column-btn" class="btn btn-primary" type="button">
                  <i class="icon-plus"></i> Adicionar
                </button>
              </div>
            </div>
            
            <div class="column-section">
              <h4>Colunas Ativas</h4>
              <p class="help-text">Para reordenar, clique sobre o nome da coluna e arraste.</p>
              <div id="active-columns" class="column-list">
                <!-- Colunas ativas serão inseridas aqui -->
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button id="save-columns-btn" class="btn btn-primary" type="button">
              <i class="icon-save"></i> Salvar
            </button>
            <button id="restore-defaults-btn" class="btn btn-secondary" type="button">
              Restaurar Padrões
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.modal = document.getElementById("column-customization-modal");

    this.configurarEventos();
    this.popularSelect();
    this.renderizarColunasAtivas();
  }

  /**
   * Configurar eventos do modal
   */
  configurarEventos() {
    // Fechar modal
    this.modal.querySelector(".modal-close").addEventListener("click", () => {
      this.fechar();
    });

    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.fechar();
      }
    });

    // Adicionar coluna
    document.getElementById("add-column-btn").addEventListener("click", () => {
      this.adicionarColuna();
    });

    // Salvar configurações
    document
      .getElementById("save-columns-btn")
      .addEventListener("click", () => {
        this.salvarConfiguracoes();
      });

    // Restaurar padrões
    document
      .getElementById("restore-defaults-btn")
      .addEventListener("click", () => {
        this.restaurarPadroes();
      });

    // Drag and drop para reordenar
    this.configurarDragAndDrop();
  }

  /**
   * Popular select com colunas disponíveis
   */
  popularSelect() {
    const select = document.getElementById("column-select");
    const rotulos = this.columnManager.getRotulosColunas();

    select.innerHTML = '<option value="">Selecione...</option>';

    this.colunasDisponiveis.forEach((coluna) => {
      if (!this.colunasAtivas.includes(coluna)) {
        const option = document.createElement("option");
        option.value = coluna;
        option.textContent = rotulos[coluna] || coluna;
        select.appendChild(option);
      }
    });
  }

  /**
   * Renderizar colunas ativas
   */
  renderizarColunasAtivas() {
    const container = document.getElementById("active-columns");
    const rotulos = this.columnManager.getRotulosColunas();

    container.innerHTML = "";

    this.colunasAtivas.forEach((coluna, index) => {
      const item = document.createElement("div");
      item.className = "column-item";
      item.draggable = true;
      item.dataset.column = coluna;
      item.dataset.index = index;

      item.innerHTML = `
        <span class="drag-handle">⋮⋮</span>
        <span class="column-name">${rotulos[coluna] || coluna}</span>
        <button class="remove-column-btn" type="button" data-column="${coluna}">
          <i class="icon-remove"></i> Remover
        </button>
      `;

      // Evento para remover coluna
      item.querySelector(".remove-column-btn").addEventListener("click", () => {
        this.removerColuna(coluna);
      });

      container.appendChild(item);
    });
  }

  /**
   * Adicionar coluna
   */
  adicionarColuna() {
    const select = document.getElementById("column-select");
    const coluna = select.value;

    if (coluna && !this.colunasAtivas.includes(coluna)) {
      this.colunasAtivas.push(coluna);
      this.popularSelect();
      this.renderizarColunasAtivas();
    }
  }

  /**
   * Remover coluna
   */
  removerColuna(coluna) {
    this.colunasAtivas = this.colunasAtivas.filter((c) => c !== coluna);
    this.popularSelect();
    this.renderizarColunasAtivas();
  }

  /**
   * Configurar drag and drop
   */
  configurarDragAndDrop() {
    const container = document.getElementById("active-columns");

    container.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("column-item")) {
        e.target.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.target.outerHTML);
      }
    });

    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
      const dragging = container.querySelector(".dragging");
      if (dragging) {
        const afterElement = this.getDragAfterElement(container, e.clientY);
        if (afterElement == null) {
          container.appendChild(dragging);
        } else {
          container.insertBefore(dragging, afterElement);
        }
        dragging.classList.remove("dragging");
        this.atualizarOrdemColunas();
      }
    });

    container.addEventListener("dragend", (e) => {
      e.target.classList.remove("dragging");
    });
  }

  /**
   * Obter elemento após o qual inserir o item arrastado
   */
  getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".column-item:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  /**
   * Atualizar ordem das colunas após drag and drop
   */
  atualizarOrdemColunas() {
    const container = document.getElementById("active-columns");
    const items = container.querySelectorAll(".column-item");
    this.colunasAtivas = Array.from(items).map((item) => item.dataset.column);
  }

  /**
   * Salvar configurações
   */
  async salvarConfiguracoes() {
    try {
      await this.columnManager.salvarConfiguracoes(this.colunasAtivas);
      alert("Configurações salvas com sucesso!");
      this.fechar();
      // Recarregar a tabela
      if (window.recarregarTabela) {
        window.recarregarTabela();
      }
    } catch (error) {
      alert("Erro ao salvar configurações: " + error.message);
    }
  }

  /**
   * Restaurar padrões
   */
  restaurarPadroes() {
    if (confirm("Deseja restaurar as colunas padrão?")) {
      this.colunasAtivas = this.columnManager.getColunasPadrao();
      this.popularSelect();
      this.renderizarColunasAtivas();
    }
  }

  /**
   * Mostrar modal
   */
  mostrarModal() {
    this.modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  /**
   * Fechar modal
   */
  fechar() {
    this.modal.style.display = "none";
    document.body.style.overflow = "";
  }
}

// Exportar classes para uso global
window.ColumnManager = ColumnManager;
window.ColumnCustomizationModal = ColumnCustomizationModal;
