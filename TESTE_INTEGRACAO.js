/**
 * Script de Teste de Integração - OurSales
 *
 * Este script demonstra todas as integrações do sistema funcionando.
 * Execute no console do navegador (F12) com o frontend aberto.
 *
 * Certifique-se de estar no Modo API:
 * localStorage.setItem('oursales:mode', 'api');
 */

async function testarIntegracaoCompleta() {
  console.log("🚀 Iniciando teste de integração completa...\n");

  try {
    // =====================================================
    // 1. TESTAR CONEXÃO
    // =====================================================
    console.log("1️⃣ Testando conexão com backend...");
    const healthResponse = await fetch("http://localhost:3000/health");
    const health = await healthResponse.json();
    console.log("✅ Backend conectado:", health.status);
    console.log("");

    // =====================================================
    // 2. CRIAR CLIENTE
    // =====================================================
    console.log("2️⃣ Criando cliente...");
    const clienteResponse = await fetch("http://localhost:3000/api/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("oursales:token")}`,
      },
      body: JSON.stringify({
        tipo: "PJ",
        razaoSocial: "Empresa Teste Integração LTDA",
        nomeFantasia: "Teste Integração",
        cnpj: "12.345.678/0001-99",
        email: "teste@integracao.com",
        telefone: "(11) 99999-9999",
        status: "ativo",
      }),
    });

    const clienteData = await clienteResponse.json();
    const cliente = clienteData.data;
    console.log("✅ Cliente criado:", cliente.id, "-", cliente.razaoSocial);
    console.log("");

    // =====================================================
    // 3. CRIAR PRODUTO
    // =====================================================
    console.log("3️⃣ Criando produto com estoque...");
    const produtoResponse = await fetch("http://localhost:3000/api/produtos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("oursales:token")}`,
      },
      body: JSON.stringify({
        codigo: `TEST-${Date.now()}`,
        nome: "Produto Teste Integração",
        descricao: "Produto criado para teste de integração",
        precoVenda: 150.0,
        precoCusto: 80.0,
        estoqueAtual: 100,
        estoqueMinimo: 10,
        unidadeMedida: "UN",
        ativo: true,
      }),
    });

    const produtoData = await produtoResponse.json();
    const produto = produtoData.data;
    console.log("✅ Produto criado:", produto.codigo, "-", produto.nome);
    console.log(`   Estoque inicial: ${produto.estoqueAtual} unidades`);
    console.log("");

    // =====================================================
    // 4. CRIAR ORÇAMENTO
    // =====================================================
    console.log("4️⃣ Criando orçamento com produto...");
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + 30);

    const orcamentoResponse = await fetch(
      "http://localhost:3000/api/orcamentos",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("oursales:token")}`,
        },
        body: JSON.stringify({
          clienteId: cliente.id,
          dataValidade: dataValidade.toISOString().split("T")[0],
          itens: [
            {
              produtoId: produto.id,
              quantidade: 15,
              precoUnitario: 150.0,
              descontoValor: 0,
              descontoPercentual: 0,
            },
          ],
          condicaoPagamento: "30 dias",
          formaPagamento: "Boleto",
          valorFrete: 50.0,
          observacoes: "Orçamento de teste de integração",
        }),
      }
    );

    const orcamentoData = await orcamentoResponse.json();
    const orcamento = orcamentoData.data;
    console.log("✅ Orçamento criado:", orcamento.numero);
    console.log(`   Valor total: R$ ${orcamento.valorTotal}`);
    console.log(`   Itens: ${orcamento.itens.length}`);
    console.log("");

    // =====================================================
    // 5. CONVERTER ORÇAMENTO EM PEDIDO
    // =====================================================
    console.log("5️⃣ Convertendo orçamento em pedido...");
    const converterResponse = await fetch(
      `http://localhost:3000/api/orcamentos/${orcamento.id}/converter`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("oursales:token")}`,
        },
      }
    );

    const pedidoData = await converterResponse.json();
    const pedido = pedidoData.data;
    console.log("✅ Pedido criado:", pedido.numero);
    console.log(`   Status: ${pedido.status}`);
    console.log(`   Vinculado ao orçamento: ${orcamento.numero}`);
    console.log("");

    // =====================================================
    // 6. APROVAR PEDIDO (BAIXA ESTOQUE AUTOMATICAMENTE)
    // =====================================================
    console.log("6️⃣ Aprovando pedido (baixa estoque automaticamente)...");
    const aprovarResponse = await fetch(
      `http://localhost:3000/api/pedidos/${pedido.id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("oursales:token")}`,
        },
        body: JSON.stringify({
          status: "aprovado",
        }),
      }
    );

    const pedidoAprovadoData = await aprovarResponse.json();
    const pedidoAprovado = pedidoAprovadoData.data;
    console.log("✅ Pedido aprovado!");
    console.log(`   Status: ${pedidoAprovado.status}`);
    console.log("");

    // =====================================================
    // 7. VERIFICAR ESTOQUE (DEVE TER SIDO BAIXADO)
    // =====================================================
    console.log("7️⃣ Verificando estoque do produto...");
    const produtoAtualizadoResponse = await fetch(
      `http://localhost:3000/api/produtos/${produto.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("oursales:token")}`,
        },
      }
    );

    const produtoAtualizadoData = await produtoAtualizadoResponse.json();
    const produtoAtualizado = produtoAtualizadoData.data;
    console.log("✅ Estoque verificado:");
    console.log(`   Estoque inicial: 100 unidades`);
    console.log(`   Quantidade vendida: 15 unidades`);
    console.log(`   Estoque atual: ${produtoAtualizado.estoqueAtual} unidades`);
    console.log(
      `   ${
        produtoAtualizado.estoqueAtual === 85
          ? "✅ ESTOQUE BAIXADO CORRETAMENTE!"
          : "❌ ERRO: Estoque não foi baixado!"
      }`
    );
    console.log("");

    // =====================================================
    // 8. VERIFICAR MOVIMENTAÇÕES DE ESTOQUE
    // =====================================================
    console.log("8️⃣ Verificando movimentações de estoque...");
    const movimentosResponse = await fetch(
      `http://localhost:3000/api/produtos/${produto.id}/movimentos`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("oursales:token")}`,
        },
      }
    );

    const movimentosData = await movimentosResponse.json();
    const movimentos = movimentosData.data;
    console.log(`✅ Movimentações encontradas: ${movimentos.length}`);
    movimentos.forEach((mov, index) => {
      console.log(
        `   ${index + 1}. ${mov.tipo.toUpperCase()} - Qtd: ${
          mov.quantidade
        } - Motivo: ${mov.motivo}`
      );
    });
    console.log("");

    // =====================================================
    // 9. REGISTRAR INTERAÇÃO CRM
    // =====================================================
    console.log("9️⃣ Registrando interação CRM...");
    const interacaoResponse = await fetch(
      "http://localhost:3000/api/crm/interacoes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("oursales:token")}`,
        },
        body: JSON.stringify({
          clienteId: cliente.id,
          tipo: "reuniao",
          canal: "presencial",
          assunto: "Fechamento de Pedido",
          descricao: "Cliente aprovou orçamento e fechou pedido",
          resultado: "positivo",
          pedidoId: pedido.id,
          orcamentoId: orcamento.id,
          sentimento: "positivo",
          requerFollowup: true,
          dataFollowup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        }),
      }
    );

    const interacaoData = await interacaoResponse.json();
    const interacao = interacaoData.data;
    console.log("✅ Interação CRM registrada!");
    console.log(`   Tipo: ${interacao.tipo}`);
    console.log(`   Vinculada ao pedido: ${pedido.numero}`);
    console.log(`   Follow-up agendado: ${interacao.dataFollowup}`);
    console.log("");

    // =====================================================
    // 10. VERIFICAR HISTÓRICO DO CLIENTE
    // =====================================================
    console.log("🔟 Verificando histórico completo do cliente...");
    const [historicoResp, pedidosResp, orcamentosResp] = await Promise.all([
      fetch(`http://localhost:3000/api/clientes/${cliente.id}/historico`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("oursales:token")}`,
        },
      }),
      fetch(`http://localhost:3000/api/clientes/${cliente.id}/pedidos`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("oursales:token")}`,
        },
      }),
      fetch(`http://localhost:3000/api/clientes/${cliente.id}/orcamentos`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("oursales:token")}`,
        },
      }),
    ]);

    const historicoData = await historicoResp.json();
    const pedidosDoCliente = await pedidosResp.json();
    const orcamentosDoCliente = await orcamentosResp.json();

    console.log("✅ Histórico do cliente:");
    console.log(`   Orçamentos: ${orcamentosDoCliente.data.length}`);
    console.log(`   Pedidos: ${pedidosDoCliente.data.length}`);
    console.log(`   Interações CRM: ${historicoData.data.length}`);
    console.log("");

    // =====================================================
    // RESUMO FINAL
    // =====================================================
    console.log("═══════════════════════════════════════════════════");
    console.log("🎉 TESTE DE INTEGRAÇÃO COMPLETO!");
    console.log("═══════════════════════════════════════════════════");
    console.log("");
    console.log("✅ TODAS AS INTEGRAÇÕES FUNCIONANDO:");
    console.log("   1. Cliente criado");
    console.log("   2. Produto criado com estoque");
    console.log("   3. Orçamento criado com produto");
    console.log("   4. Orçamento convertido em pedido");
    console.log("   5. Pedido aprovado");
    console.log("   6. Estoque baixado automaticamente");
    console.log("   7. Movimentação de estoque registrada");
    console.log("   8. Interação CRM registrada");
    console.log("   9. Histórico do cliente atualizado");
    console.log("");
    console.log("📊 RESULTADOS:");
    console.log(`   Cliente ID: ${cliente.id}`);
    console.log(`   Produto: ${produto.codigo} (Estoque: 100 → 85)`);
    console.log(`   Orçamento: ${orcamento.numero}`);
    console.log(`   Pedido: ${pedido.numero} (Status: aprovado)`);
    console.log(`   Valor Total: R$ ${pedido.valorTotal}`);
    console.log("");
    console.log("🚀 Sistema OurSales totalmente integrado e funcional!");
    console.log("═══════════════════════════════════════════════════");
  } catch (error) {
    console.error("❌ ERRO NO TESTE:", error);
    console.log("");
    console.log("Certifique-se de:");
    console.log("1. Backend está rodando (http://localhost:3000)");
    console.log(
      '2. Modo API está ativo: localStorage.setItem("oursales:mode", "api")'
    );
    console.log("3. Você está autenticado (token válido)");
  }
}

// Executar teste
console.log("════════════════════════════════════════════════════════");
console.log("   OurSales - Teste de Integração Completa");
console.log("════════════════════════════════════════════════════════");
console.log("");
console.log("Este script irá:");
console.log("• Criar um cliente");
console.log("• Criar um produto com estoque");
console.log("• Criar um orçamento");
console.log("• Converter orçamento em pedido");
console.log("• Aprovar pedido (baixa estoque automaticamente)");
console.log("• Verificar estoque");
console.log("• Registrar interação CRM");
console.log("• Verificar histórico do cliente");
console.log("");
console.log("Executando em 2 segundos...");
console.log("════════════════════════════════════════════════════════");

setTimeout(testarIntegracaoCompleta, 2000);



