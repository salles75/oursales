/**
 * OurSales - Storage Adapter
 * Adaptador que permite alternar entre localStorage (offline) e API (online)
 */

import api from "./api.js";

// Modo de operação: 'local' ou 'api'
let storageMode = localStorage.getItem("oursales:mode") || "local";

// Definir modo de armazenamento
export function setStorageMode(mode) {
  if (!["local", "api"].includes(mode)) {
    throw new Error("Modo inválido. Use 'local' ou 'api'");
  }
  storageMode = mode;
  localStorage.setItem("oursales:mode", mode);
  console.log(`Modo de armazenamento alterado para: ${mode}`);
}

// Obter modo atual
export function getStorageMode() {
  return storageMode;
}

// =====================================================
// ADAPTADORES - CLIENTES
// =====================================================

export const clientesAdapter = {
  async listar(params = {}) {
    if (storageMode === "api") {
      const response = await api.clientes.listar(params);
      return response.data;
    } else {
      // Modo localStorage
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      return state.clientes || [];
    }
  },

  async buscar(id) {
    if (storageMode === "api") {
      const response = await api.clientes.buscar(id);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const clientes = state.clientes || [];
      return clientes.find((c) => c.id === id);
    }
  },

  async criar(clienteData) {
    if (storageMode === "api") {
      const response = await api.clientes.criar(clienteData);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      if (!state.clientes) state.clientes = [];

      const novoCliente = {
        ...clienteData,
        id: `cli-${Date.now()}`,
        criadoEm: new Date().toISOString(),
      };

      state.clientes.push(novoCliente);
      localStorage.setItem("oursales:data", JSON.stringify(state));
      return novoCliente;
    }
  },

  async atualizar(id, clienteData) {
    if (storageMode === "api") {
      const response = await api.clientes.atualizar(id, clienteData);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const clientes = state.clientes || [];
      const index = clientes.findIndex((c) => c.id === id);

      if (index >= 0) {
        clientes[index] = { ...clientes[index], ...clienteData };
        localStorage.setItem("oursales:data", JSON.stringify(state));
        return clientes[index];
      }
      throw new Error("Cliente não encontrado");
    }
  },

  async deletar(id) {
    if (storageMode === "api") {
      await api.clientes.deletar(id);
      return { success: true };
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const clientes = state.clientes || [];
      state.clientes = clientes.filter((c) => c.id !== id);
      localStorage.setItem("oursales:data", JSON.stringify(state));
      return { success: true };
    }
  },
};

// =====================================================
// ADAPTADORES - PRODUTOS
// =====================================================

export const produtosAdapter = {
  async listar(params = {}) {
    if (storageMode === "api") {
      const response = await api.produtos.listar(params);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      return state.produtos || [];
    }
  },

  async buscar(id) {
    if (storageMode === "api") {
      const response = await api.produtos.buscar(id);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const produtos = state.produtos || [];
      return produtos.find((p) => p.id === id);
    }
  },

  async criar(produtoData) {
    if (storageMode === "api") {
      const response = await api.produtos.criar(produtoData);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      if (!state.produtos) state.produtos = [];

      const novoProduto = {
        ...produtoData,
        id: `prod-${Date.now()}`,
        criadoEm: new Date().toISOString(),
      };

      state.produtos.push(novoProduto);
      localStorage.setItem("oursales:data", JSON.stringify(state));
      return novoProduto;
    }
  },

  async atualizar(id, produtoData) {
    if (storageMode === "api") {
      const response = await api.produtos.atualizar(id, produtoData);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const produtos = state.produtos || [];
      const index = produtos.findIndex((p) => p.id === id);

      if (index >= 0) {
        produtos[index] = { ...produtos[index], ...produtoData };
        localStorage.setItem("oursales:data", JSON.stringify(state));
        return produtos[index];
      }
      throw new Error("Produto não encontrado");
    }
  },

  async deletar(id) {
    if (storageMode === "api") {
      await api.produtos.deletar(id);
      return { success: true };
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const produtos = state.produtos || [];
      state.produtos = produtos.filter((p) => p.id !== id);
      localStorage.setItem("oursales:data", JSON.stringify(state));
      return { success: true };
    }
  },
};

// =====================================================
// ADAPTADORES - ORÇAMENTOS
// =====================================================

export const orcamentosAdapter = {
  async listar(params = {}) {
    if (storageMode === "api") {
      const response = await api.orcamentos.listar(params);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      return state.orcamentos || [];
    }
  },

  async buscar(id) {
    if (storageMode === "api") {
      const response = await api.orcamentos.buscar(id);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const orcamentos = state.orcamentos || [];
      return orcamentos.find((o) => o.id === id);
    }
  },

  async criar(orcamentoData) {
    if (storageMode === "api") {
      const response = await api.orcamentos.criar(orcamentoData);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      if (!state.orcamentos) state.orcamentos = [];

      const novoOrcamento = {
        ...orcamentoData,
        id: `orc-${Date.now()}`,
        criadoEm: new Date().toISOString(),
      };

      state.orcamentos.push(novoOrcamento);
      localStorage.setItem("oursales:data", JSON.stringify(state));
      return novoOrcamento;
    }
  },

  async atualizar(id, orcamentoData) {
    if (storageMode === "api") {
      const response = await api.orcamentos.atualizar(id, orcamentoData);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const orcamentos = state.orcamentos || [];
      const index = orcamentos.findIndex((o) => o.id === id);

      if (index >= 0) {
        orcamentos[index] = { ...orcamentos[index], ...orcamentoData };
        localStorage.setItem("oursales:data", JSON.stringify(state));
        return orcamentos[index];
      }
      throw new Error("Orçamento não encontrado");
    }
  },

  async deletar(id) {
    if (storageMode === "api") {
      await api.orcamentos.deletar(id);
      return { success: true };
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const orcamentos = state.orcamentos || [];
      state.orcamentos = orcamentos.filter((o) => o.id !== id);
      localStorage.setItem("oursales:data", JSON.stringify(state));
      return { success: true };
    }
  },

  async converterParaPedido(id) {
    if (storageMode === "api") {
      const response = await api.orcamentos.converterParaPedido(id);
      return response.data;
    } else {
      // Implementação local simplificada
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const orcamento = state.orcamentos?.find((o) => o.id === id);

      if (!orcamento) {
        throw new Error("Orçamento não encontrado");
      }

      const novoPedido = {
        ...orcamento,
        id: `ped-${Date.now()}`,
        numero: `PED-${Date.now()}`,
        orcamentoId: id,
        status: "aguardando_aprovacao",
        criadoEm: new Date().toISOString(),
      };

      if (!state.pedidos) state.pedidos = [];
      state.pedidos.push(novoPedido);

      // Marcar orçamento como convertido
      const orcIndex = state.orcamentos.findIndex((o) => o.id === id);
      if (orcIndex >= 0) {
        state.orcamentos[orcIndex].convertidoPedido = true;
        state.orcamentos[orcIndex].status = "convertido";
      }

      localStorage.setItem("oursales:data", JSON.stringify(state));
      return novoPedido;
    }
  },
};

// =====================================================
// ADAPTADORES - PEDIDOS
// =====================================================

export const pedidosAdapter = {
  async listar(params = {}) {
    if (storageMode === "api") {
      const response = await api.pedidos.listar(params);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      return state.pedidos || [];
    }
  },

  async buscar(id) {
    if (storageMode === "api") {
      const response = await api.pedidos.buscar(id);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const pedidos = state.pedidos || [];
      return pedidos.find((p) => p.id === id);
    }
  },

  async criar(pedidoData) {
    if (storageMode === "api") {
      const response = await api.pedidos.criar(pedidoData);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      if (!state.pedidos) state.pedidos = [];

      const novoPedido = {
        ...pedidoData,
        id: `ped-${Date.now()}`,
        numero: `PED-${Date.now()}`,
        criadoEm: new Date().toISOString(),
      };

      state.pedidos.push(novoPedido);
      localStorage.setItem("oursales:data", JSON.stringify(state));
      return novoPedido;
    }
  },

  async atualizar(id, pedidoData) {
    if (storageMode === "api") {
      const response = await api.pedidos.atualizar(id, pedidoData);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const pedidos = state.pedidos || [];
      const index = pedidos.findIndex((p) => p.id === id);

      if (index >= 0) {
        pedidos[index] = { ...pedidos[index], ...pedidoData };
        localStorage.setItem("oursales:data", JSON.stringify(state));
        return pedidos[index];
      }
      throw new Error("Pedido não encontrado");
    }
  },

  async deletar(id) {
    if (storageMode === "api") {
      await api.pedidos.deletar(id);
      return { success: true };
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const pedidos = state.pedidos || [];
      state.pedidos = pedidos.filter((p) => p.id !== id);
      localStorage.setItem("oursales:data", JSON.stringify(state));
      return { success: true };
    }
  },

  async atualizarStatus(id, statusData) {
    if (storageMode === "api") {
      const response = await api.pedidos.atualizarStatus(id, statusData);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const pedidos = state.pedidos || [];
      const index = pedidos.findIndex((p) => p.id === id);

      if (index >= 0) {
        pedidos[index].status = statusData.status;
        if (statusData.motivoCancelamento) {
          pedidos[index].motivoCancelamento = statusData.motivoCancelamento;
        }
        localStorage.setItem("oursales:data", JSON.stringify(state));
        return pedidos[index];
      }
      throw new Error("Pedido não encontrado");
    }
  },
};

// =====================================================
// ADAPTADORES - TRANSPORTADORAS
// =====================================================

export const transportadorasAdapter = {
  async listar(params = {}) {
    if (storageMode === "api") {
      const response = await api.transportadoras.listar(params);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      return state.transportadoras || [];
    }
  },

  async buscar(id) {
    if (storageMode === "api") {
      const response = await api.transportadoras.buscar(id);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const transportadoras = state.transportadoras || [];
      return transportadoras.find((t) => t.id === id);
    }
  },

  async criar(transportadoraData) {
    if (storageMode === "api") {
      const response = await api.transportadoras.criar(transportadoraData);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      if (!state.transportadoras) state.transportadoras = [];

      const novaTransportadora = {
        ...transportadoraData,
        id: `trans-${Date.now()}`,
        criadoEm: new Date().toISOString(),
      };

      state.transportadoras.push(novaTransportadora);
      localStorage.setItem("oursales:data", JSON.stringify(state));
      return novaTransportadora;
    }
  },

  async atualizar(id, transportadoraData) {
    if (storageMode === "api") {
      const response = await api.transportadoras.atualizar(
        id,
        transportadoraData
      );
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const transportadoras = state.transportadoras || [];
      const index = transportadoras.findIndex((t) => t.id === id);

      if (index >= 0) {
        transportadoras[index] = {
          ...transportadoras[index],
          ...transportadoraData,
        };
        localStorage.setItem("oursales:data", JSON.stringify(state));
        return transportadoras[index];
      }
      throw new Error("Transportadora não encontrada");
    }
  },

  async deletar(id) {
    if (storageMode === "api") {
      await api.transportadoras.deletar(id);
      return { success: true };
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const transportadoras = state.transportadoras || [];
      state.transportadoras = transportadoras.filter((t) => t.id !== id);
      localStorage.setItem("oursales:data", JSON.stringify(state));
      return { success: true };
    }
  },
};

// =====================================================
// ADAPTADORES - CRM
// =====================================================

export const crmAdapter = {
  async listarInteracoes(params = {}) {
    if (storageMode === "api") {
      const response = await api.crm.listarInteracoes(params);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      return state.crm || [];
    }
  },

  async buscarInteracao(id) {
    if (storageMode === "api") {
      const response = await api.crm.buscarInteracao(id);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const crm = state.crm || [];
      return crm.find((i) => i.id === id);
    }
  },

  async criarInteracao(interacaoData) {
    if (storageMode === "api") {
      const response = await api.crm.criarInteracao(interacaoData);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      if (!state.crm) state.crm = [];

      const novaInteracao = {
        ...interacaoData,
        id: `crm-${Date.now()}`,
        criadoEm: new Date().toISOString(),
      };

      state.crm.push(novaInteracao);
      localStorage.setItem("oursales:data", JSON.stringify(state));
      return novaInteracao;
    }
  },

  async atualizarInteracao(id, interacaoData) {
    if (storageMode === "api") {
      const response = await api.crm.atualizarInteracao(id, interacaoData);
      return response.data;
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const crm = state.crm || [];
      const index = crm.findIndex((i) => i.id === id);

      if (index >= 0) {
        crm[index] = { ...crm[index], ...interacaoData };
        localStorage.setItem("oursales:data", JSON.stringify(state));
        return crm[index];
      }
      throw new Error("Interação não encontrada");
    }
  },

  async deletarInteracao(id) {
    if (storageMode === "api") {
      await api.crm.deletarInteracao(id);
      return { success: true };
    } else {
      const state = JSON.parse(localStorage.getItem("oursales:data") || "{}");
      const crm = state.crm || [];
      state.crm = crm.filter((i) => i.id !== id);
      localStorage.setItem("oursales:data", JSON.stringify(state));
      return { success: true };
    }
  },
};

// Exportar tudo
export default {
  setStorageMode,
  getStorageMode,
  clientes: clientesAdapter,
  produtos: produtosAdapter,
  orcamentos: orcamentosAdapter,
  pedidos: pedidosAdapter,
  transportadoras: transportadorasAdapter,
  crm: crmAdapter,
};
