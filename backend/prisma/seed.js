/**
 * Script de Seed - Dados Iniciais
 * Popula o banco com dados de exemplo para testes
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Limpar dados existentes (cuidado em produção!)
  if (process.env.NODE_ENV !== "production") {
    console.log("⚠️  Limpando dados existentes...");
    await prisma.auditoria.deleteMany();
    await prisma.contaReceber.deleteMany();
    await prisma.movimentoEstoque.deleteMany();
    await prisma.crmInteracao.deleteMany();
    await prisma.pedidoItem.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.orcamentoItem.deleteMany();
    await prisma.orcamento.deleteMany();
    await prisma.produto.deleteMany();
    await prisma.categoriaProduto.deleteMany();
    await prisma.transportadora.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.usuario.deleteMany();
  }

  // Hash de senha padrão
  const senhaHash = await bcrypt.hash("admin123", 10);

  // 1. Criar Usuários
  console.log("👤 Criando usuários...");
  const admin = await prisma.usuario.create({
    data: {
      nome: "Administrador",
      email: "admin@oursales.com",
      senhaHash,
      perfil: "admin",
      telefone: "(11) 98888-8888",
      ativo: true,
    },
  });

  const vendedor1 = await prisma.usuario.create({
    data: {
      nome: "João Silva",
      email: "joao@oursales.com",
      senhaHash,
      perfil: "vendedor",
      telefone: "(11) 97777-7777",
      ativo: true,
    },
  });

  const vendedor2 = await prisma.usuario.create({
    data: {
      nome: "Maria Santos",
      email: "maria@oursales.com",
      senhaHash,
      perfil: "vendedor",
      telefone: "(11) 96666-6666",
      ativo: true,
    },
  });

  console.log(`✅ ${3} usuários criados`);

  // 2. Criar Categorias de Produtos
  console.log("📁 Criando categorias...");
  const catEletronicos = await prisma.categoriaProduto.create({
    data: {
      nome: "Eletrônicos",
      descricao: "Produtos eletrônicos diversos",
      nivel: 0,
      ordem: 1,
    },
  });

  const catInformatica = await prisma.categoriaProduto.create({
    data: {
      nome: "Informática",
      descricao: "Produtos de informática",
      nivel: 0,
      ordem: 2,
    },
  });

  console.log(`✅ ${2} categorias criadas`);

  // 3. Criar Produtos
  console.log("📦 Criando produtos...");
  const produtos = await Promise.all([
    prisma.produto.create({
      data: {
        codigo: "PROD-001",
        sku: "NOTE-DELL-001",
        nome: "Notebook Dell Inspiron 15",
        descricao: "Notebook Dell i5, 8GB RAM, 256GB SSD",
        categoriaId: catInformatica.id,
        precoCusto: 2500.0,
        precoVenda: 3200.0,
        estoqueAtual: 15,
        estoqueMinimo: 5,
        estoqueMaximo: 50,
        unidadeMedida: "UN",
        ativo: true,
        tags: ["notebook", "dell", "informatica"],
        criadoPorId: admin.id,
      },
    }),
    prisma.produto.create({
      data: {
        codigo: "PROD-002",
        sku: "MOUSE-LOG-001",
        nome: "Mouse Logitech MX Master 3",
        descricao: "Mouse ergonômico sem fio",
        categoriaId: catInformatica.id,
        precoCusto: 250.0,
        precoVenda: 380.0,
        estoqueAtual: 45,
        estoqueMinimo: 10,
        estoqueMaximo: 100,
        unidadeMedida: "UN",
        ativo: true,
        tags: ["mouse", "logitech", "acessorio"],
        criadoPorId: admin.id,
      },
    }),
    prisma.produto.create({
      data: {
        codigo: "PROD-003",
        sku: "MON-SAMSUNG-001",
        nome: 'Monitor Samsung 27" 4K',
        descricao: "Monitor LED 27 polegadas 4K UHD",
        categoriaId: catEletronicos.id,
        precoCusto: 1200.0,
        precoVenda: 1599.0,
        estoqueAtual: 8,
        estoqueMinimo: 3,
        estoqueMaximo: 20,
        unidadeMedida: "UN",
        ativo: true,
        tags: ["monitor", "samsung", "4k"],
        criadoPorId: admin.id,
      },
    }),
  ]);

  console.log(`✅ ${produtos.length} produtos criados`);

  // 4. Criar Transportadoras
  console.log("🚚 Criando transportadoras...");
  const transportadoras = await Promise.all([
    prisma.transportadora.create({
      data: {
        razaoSocial: "Transportadora Rápida Ltda",
        nomeFantasia: "Rápida Express",
        cnpj: "12.345.678/0001-90",
        email: "contato@rapidaexpress.com.br",
        telefone: "(11) 3000-0000",
        prazoMedioDias: 5,
        custoMedioKg: 15.5,
        coberturaEstados: ["SP", "RJ", "MG", "ES"],
        tiposServico: ["Normal", "Expresso"],
        avaliacao: 4.5,
        ativo: true,
        criadoPorId: admin.id,
      },
    }),
    prisma.transportadora.create({
      data: {
        razaoSocial: "Logística Nacional S.A.",
        nomeFantasia: "Log Nacional",
        cnpj: "98.765.432/0001-10",
        email: "contato@lognacional.com.br",
        telefone: "(11) 4000-0000",
        prazoMedioDias: 7,
        custoMedioKg: 12.0,
        coberturaEstados: ["SP", "RJ", "MG", "ES", "PR", "SC", "RS"],
        tiposServico: ["Normal", "Econômico"],
        avaliacao: 4.2,
        ativo: true,
        criadoPorId: admin.id,
      },
    }),
  ]);

  console.log(`✅ ${transportadoras.length} transportadoras criadas`);

  // 5. Criar Clientes
  console.log("👥 Criando clientes...");
  const clientes = await Promise.all([
    // Cliente PJ
    prisma.cliente.create({
      data: {
        tipo: "PJ",
        razaoSocial: "Tech Solutions Ltda",
        nomeFantasia: "Tech Solutions",
        cnpj: "11.222.333/0001-44",
        inscricaoEstadual: "123.456.789.012",
        email: "contato@techsolutions.com.br",
        telefone: "(11) 5000-0000",
        cep: "01310-100",
        logradouro: "Av. Paulista",
        numero: "1000",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP",
        limiteCredito: 50000.0,
        status: "ativo",
        segmento: "Tecnologia",
        porte: "Médio",
        vendedorId: vendedor1.id,
        criadoPorId: admin.id,
      },
    }),
    // Cliente PF
    prisma.cliente.create({
      data: {
        tipo: "PF",
        nomeCompleto: "Carlos Eduardo Oliveira",
        cpf: "123.456.789-00",
        dataNascimento: new Date("1985-05-15"),
        email: "carlos@email.com",
        celular: "(11) 98765-4321",
        cep: "04567-890",
        logradouro: "Rua das Flores",
        numero: "123",
        bairro: "Jardins",
        cidade: "São Paulo",
        estado: "SP",
        limiteCredito: 10000.0,
        status: "ativo",
        vendedorId: vendedor2.id,
        criadoPorId: admin.id,
      },
    }),
    // Mais um cliente PJ
    prisma.cliente.create({
      data: {
        tipo: "PJ",
        razaoSocial: "Comércio de Equipamentos XPTO Ltda",
        nomeFantasia: "XPTO Equipamentos",
        cnpj: "22.333.444/0001-55",
        email: "vendas@xpto.com.br",
        telefone: "(11) 6000-0000",
        cep: "02000-000",
        logradouro: "Rua Comercial",
        numero: "500",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "SP",
        limiteCredito: 30000.0,
        status: "ativo",
        segmento: "Varejo",
        porte: "Pequeno",
        vendedorId: vendedor1.id,
        criadoPorId: admin.id,
      },
    }),
  ]);

  console.log(`✅ ${clientes.length} clientes criados`);

  // 6. Criar Orçamento exemplo
  console.log("📋 Criando orçamento exemplo...");
  const orcamento = await prisma.orcamento.create({
    data: {
      numero: "ORC-2025-001",
      clienteId: clientes[0].id,
      vendedorId: vendedor1.id,
      dataValidade: new Date("2025-12-31"),
      valorTotal: 5179.0,
      status: "enviado",
      condicaoPagamento: "30 dias",
      formaPagamento: "Boleto",
      prazoEntregaDias: 7,
      transportadoraId: transportadoras[0].id,
      criadoPorId: vendedor1.id,
      itens: {
        create: [
          {
            produtoId: produtos[0].id,
            quantidade: 1,
            precoUnitario: 3200.0,
            subtotal: 3200.0,
            ordem: 1,
          },
          {
            produtoId: produtos[1].id,
            quantidade: 2,
            precoUnitario: 380.0,
            subtotal: 760.0,
            ordem: 2,
          },
          {
            produtoId: produtos[2].id,
            quantidade: 1,
            precoUnitario: 1599.0,
            subtotal: 1599.0,
            ordem: 3,
          },
        ],
      },
    },
  });

  console.log(`✅ Orçamento criado: ${orcamento.numero}`);

  // 7. Criar Pedido exemplo
  console.log("📦 Criando pedido exemplo...");
  const pedido = await prisma.pedido.create({
    data: {
      numero: "PED-2025-001",
      clienteId: clientes[1].id,
      vendedorId: vendedor2.id,
      transportadoraId: transportadoras[1].id,
      valorTotal: 4758.0,
      status: "aprovado",
      condicaoPagamento: "30 dias",
      formaPagamento: "Cartão",
      prazoEntregaDias: 7,
      dataEntregaPrevista: new Date("2025-10-15"),
      criadoPorId: vendedor2.id,
      aprovadoPorId: admin.id,
      itens: {
        create: [
          {
            produtoId: produtos[0].id,
            quantidade: 1,
            precoUnitario: 3200.0,
            subtotal: 3200.0,
            ordem: 1,
          },
          {
            produtoId: produtos[2].id,
            quantidade: 1,
            precoUnitario: 1599.0,
            subtotal: 1599.0,
            ordem: 2,
          },
        ],
      },
    },
  });

  console.log(`✅ Pedido criado: ${pedido.numero}`);

  // 8. Criar interação CRM
  console.log("💬 Criando interação CRM...");
  await prisma.crmInteracao.create({
    data: {
      clienteId: clientes[0].id,
      usuarioId: vendedor1.id,
      tipo: "reuniao",
      canal: "presencial",
      assunto: "Apresentação de produtos",
      descricao: "Reunião para apresentar novo catálogo de produtos.",
      resultado: "positivo",
      duracaoMinutos: 60,
      tags: ["reuniao", "novos-produtos"],
      sentimento: "positivo",
    },
  });

  console.log("✅ Interação CRM criada");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📊 Resumo:");
  console.log(`   - Usuários: 3`);
  console.log(`   - Categorias: 2`);
  console.log(`   - Produtos: 3`);
  console.log(`   - Transportadoras: 2`);
  console.log(`   - Clientes: 3`);
  console.log(`   - Orçamentos: 1`);
  console.log(`   - Pedidos: 1`);
  console.log(`   - Interações CRM: 1`);
  console.log("\n🔑 Credenciais de Acesso:");
  console.log("   Email: admin@oursales.com");
  console.log("   Senha: admin123");
  console.log("\n⚠️  ALTERE A SENHA EM PRODUÇÃO!\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
