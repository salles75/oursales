-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "perfil" VARCHAR(50) NOT NULL DEFAULT 'vendedor',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "foto_url" TEXT,
    "telefone" VARCHAR(20),
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_acesso" TIMESTAMPTZ,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tipo" VARCHAR(2) NOT NULL,
    "nome_completo" VARCHAR(255),
    "cpf" VARCHAR(14),
    "rg" VARCHAR(20),
    "data_nascimento" DATE,
    "razao_social" VARCHAR(255),
    "nome_fantasia" VARCHAR(255),
    "cnpj" VARCHAR(18),
    "inscricao_estadual" VARCHAR(20),
    "inscricao_municipal" VARCHAR(20),
    "email" VARCHAR(255),
    "telefone" VARCHAR(20),
    "celular" VARCHAR(20),
    "website" VARCHAR(255),
    "cep" VARCHAR(9),
    "logradouro" VARCHAR(255),
    "numero" VARCHAR(20),
    "complemento" VARCHAR(100),
    "bairro" VARCHAR(100),
    "cidade" VARCHAR(100),
    "estado" VARCHAR(2),
    "pais" VARCHAR(100) NOT NULL DEFAULT 'Brasil',
    "limite_credito" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "saldo_devedor" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "score_credito" INTEGER NOT NULL DEFAULT 0,
    "condicao_pagamento" VARCHAR(100),
    "desconto_padrao" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "segmento" VARCHAR(100),
    "porte" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ativo',
    "tags" TEXT[],
    "vendedor_id" UUID,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_por" UUID,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportadoras" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "razao_social" VARCHAR(255) NOT NULL,
    "nome_fantasia" VARCHAR(255),
    "cnpj" VARCHAR(18) NOT NULL,
    "inscricao_estadual" VARCHAR(20),
    "email" VARCHAR(255),
    "telefone" VARCHAR(20),
    "website" VARCHAR(255),
    "cep" VARCHAR(9),
    "logradouro" VARCHAR(255),
    "numero" VARCHAR(20),
    "complemento" VARCHAR(100),
    "bairro" VARCHAR(100),
    "cidade" VARCHAR(100),
    "estado" VARCHAR(2),
    "prazo_medio_dias" INTEGER NOT NULL DEFAULT 0,
    "custo_medio_kg" DECIMAL(10,4),
    "custo_minimo" DECIMAL(10,2),
    "cobertura_estados" TEXT[],
    "tipos_servico" TEXT[],
    "avaliacao" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_entregas" INTEGER NOT NULL DEFAULT 0,
    "entregas_no_prazo" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_por" UUID,

    CONSTRAINT "transportadoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_produtos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "categoria_pai_id" UUID,
    "nivel" INTEGER NOT NULL DEFAULT 0,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "codigo" VARCHAR(50) NOT NULL,
    "sku" VARCHAR(100),
    "ean" VARCHAR(13),
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "descricao_detalhada" TEXT,
    "categoria_id" UUID,
    "preco_custo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "preco_venda" DECIMAL(15,2) NOT NULL,
    "preco_promocional" DECIMAL(15,2),
    "margem_lucro" DECIMAL(5,2),
    "estoque_atual" INTEGER NOT NULL DEFAULT 0,
    "estoque_minimo" INTEGER NOT NULL DEFAULT 0,
    "estoque_maximo" INTEGER NOT NULL DEFAULT 0,
    "localizacao_estoque" VARCHAR(100),
    "unidade_medida" VARCHAR(20) NOT NULL DEFAULT 'UN',
    "peso_bruto" DECIMAL(10,3),
    "peso_liquido" DECIMAL(10,3),
    "largura" DECIMAL(10,2),
    "altura" DECIMAL(10,2),
    "profundidade" DECIMAL(10,2),
    "ncm" VARCHAR(10),
    "cest" VARCHAR(10),
    "icms" DECIMAL(5,2),
    "ipi" DECIMAL(5,2),
    "imagem_principal_url" TEXT,
    "imagens_urls" TEXT[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "fornecedor_nome" VARCHAR(255),
    "fornecedor_codigo" VARCHAR(100),
    "visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "vendas_total" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_por" UUID,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "numero" VARCHAR(20) NOT NULL,
    "cliente_id" UUID NOT NULL,
    "vendedor_id" UUID NOT NULL,
    "data_emissao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_validade" DATE NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "desconto_valor" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "desconto_percentual" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "acrescimo_valor" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valor_frete" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valor_total" DECIMAL(15,2) NOT NULL,
    "condicao_pagamento" VARCHAR(100),
    "forma_pagamento" VARCHAR(100),
    "prazo_entrega_dias" INTEGER,
    "transportadora_id" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'em_analise',
    "observacoes" TEXT,
    "observacoes_internas" TEXT,
    "convertido_pedido" BOOLEAN NOT NULL DEFAULT false,
    "pedido_id" UUID,
    "data_conversao" TIMESTAMPTZ,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_por" UUID,

    CONSTRAINT "orcamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamentos_itens" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "orcamento_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "preco_unitario" DECIMAL(15,2) NOT NULL,
    "desconto_percentual" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "desconto_valor" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "observacoes" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orcamentos_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "numero" VARCHAR(20) NOT NULL,
    "numero_pedido_cliente" VARCHAR(50),
    "cliente_id" UUID NOT NULL,
    "vendedor_id" UUID NOT NULL,
    "orcamento_id" UUID,
    "transportadora_id" UUID,
    "data_pedido" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_aprovacao" TIMESTAMPTZ,
    "data_faturamento" TIMESTAMPTZ,
    "data_entrega_prevista" DATE,
    "data_entrega_realizada" DATE,
    "subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "desconto_valor" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "desconto_percentual" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "acrescimo_valor" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valor_frete" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valor_total" DECIMAL(15,2) NOT NULL,
    "condicao_pagamento" VARCHAR(100),
    "forma_pagamento" VARCHAR(100),
    "prazo_entrega_dias" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'aguardando_aprovacao',
    "codigo_rastreamento" VARCHAR(100),
    "nota_fiscal" VARCHAR(20),
    "chave_nfe" VARCHAR(44),
    "observacoes" TEXT,
    "observacoes_internas" TEXT,
    "motivo_cancelamento" TEXT,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criado_por" UUID,
    "aprovado_por" UUID,
    "cancelado_por" UUID,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_itens" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "pedido_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "preco_unitario" DECIMAL(15,2) NOT NULL,
    "desconto_percentual" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "desconto_valor" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "quantidade_separada" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "quantidade_entregue" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_interacoes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "cliente_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "canal" VARCHAR(50),
    "assunto" VARCHAR(255),
    "descricao" TEXT NOT NULL,
    "resultado" VARCHAR(100),
    "data_interacao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duracao_minutos" INTEGER,
    "requer_followup" BOOLEAN NOT NULL DEFAULT false,
    "data_followup" DATE,
    "followup_realizado" BOOLEAN NOT NULL DEFAULT false,
    "anexos_urls" TEXT[],
    "orcamento_id" UUID,
    "pedido_id" UUID,
    "tags" TEXT[],
    "sentimento" VARCHAR(20),
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_interacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentos_estoque" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "produto_id" UUID NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "estoque_anterior" INTEGER NOT NULL,
    "estoque_posterior" INTEGER NOT NULL,
    "pedido_id" UUID,
    "usuario_id" UUID NOT NULL,
    "motivo" VARCHAR(255),
    "observacoes" TEXT,
    "custo_unitario" DECIMAL(15,2),
    "custo_total" DECIMAL(15,2),
    "data_movimento" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentos_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financeiro_contas_receber" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "cliente_id" UUID NOT NULL,
    "pedido_id" UUID,
    "usuario_id" UUID NOT NULL,
    "numero_documento" VARCHAR(50),
    "numero_parcela" INTEGER,
    "total_parcelas" INTEGER,
    "valor_original" DECIMAL(15,2) NOT NULL,
    "valor_juros" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valor_desconto" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valor_pago" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valor_pendente" DECIMAL(15,2) NOT NULL,
    "data_emissao" DATE NOT NULL,
    "data_vencimento" DATE NOT NULL,
    "data_pagamento" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'em_aberto',
    "forma_pagamento" VARCHAR(100),
    "banco" VARCHAR(100),
    "agencia" VARCHAR(20),
    "conta" VARCHAR(20),
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financeiro_contas_receber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tabela" VARCHAR(100) NOT NULL,
    "registro_id" UUID NOT NULL,
    "acao" VARCHAR(20) NOT NULL,
    "usuario_id" UUID,
    "dados_anteriores" JSONB,
    "dados_novos" JSONB,
    "campos_alterados" TEXT[],
    "ip_address" INET,
    "user_agent" TEXT,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_perfil_ativo_idx" ON "usuarios"("perfil", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_key" ON "clientes"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cnpj_key" ON "clientes"("cnpj");

-- CreateIndex
CREATE INDEX "clientes_tipo_idx" ON "clientes"("tipo");

-- CreateIndex
CREATE INDEX "clientes_status_idx" ON "clientes"("status");

-- CreateIndex
CREATE INDEX "clientes_vendedor_id_idx" ON "clientes"("vendedor_id");

-- CreateIndex
CREATE INDEX "clientes_cpf_idx" ON "clientes"("cpf");

-- CreateIndex
CREATE INDEX "clientes_cnpj_idx" ON "clientes"("cnpj");

-- CreateIndex
CREATE INDEX "clientes_cidade_estado_idx" ON "clientes"("cidade", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "transportadoras_cnpj_key" ON "transportadoras"("cnpj");

-- CreateIndex
CREATE INDEX "transportadoras_cnpj_idx" ON "transportadoras"("cnpj");

-- CreateIndex
CREATE INDEX "transportadoras_ativo_idx" ON "transportadoras"("ativo");

-- CreateIndex
CREATE INDEX "categorias_produtos_categoria_pai_id_idx" ON "categorias_produtos"("categoria_pai_id");

-- CreateIndex
CREATE INDEX "categorias_produtos_nivel_idx" ON "categorias_produtos"("nivel");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_codigo_key" ON "produtos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_sku_key" ON "produtos"("sku");

-- CreateIndex
CREATE INDEX "produtos_codigo_idx" ON "produtos"("codigo");

-- CreateIndex
CREATE INDEX "produtos_sku_idx" ON "produtos"("sku");

-- CreateIndex
CREATE INDEX "produtos_ean_idx" ON "produtos"("ean");

-- CreateIndex
CREATE INDEX "produtos_categoria_id_idx" ON "produtos"("categoria_id");

-- CreateIndex
CREATE INDEX "produtos_ativo_idx" ON "produtos"("ativo");

-- CreateIndex
CREATE INDEX "produtos_preco_venda_idx" ON "produtos"("preco_venda");

-- CreateIndex
CREATE UNIQUE INDEX "orcamentos_numero_key" ON "orcamentos"("numero");

-- CreateIndex
CREATE INDEX "orcamentos_numero_idx" ON "orcamentos"("numero");

-- CreateIndex
CREATE INDEX "orcamentos_cliente_id_idx" ON "orcamentos"("cliente_id");

-- CreateIndex
CREATE INDEX "orcamentos_vendedor_id_idx" ON "orcamentos"("vendedor_id");

-- CreateIndex
CREATE INDEX "orcamentos_status_idx" ON "orcamentos"("status");

-- CreateIndex
CREATE INDEX "orcamentos_data_emissao_idx" ON "orcamentos"("data_emissao");

-- CreateIndex
CREATE INDEX "orcamentos_data_validade_idx" ON "orcamentos"("data_validade");

-- CreateIndex
CREATE INDEX "orcamentos_convertido_pedido_idx" ON "orcamentos"("convertido_pedido");

-- CreateIndex
CREATE INDEX "orcamentos_itens_orcamento_id_idx" ON "orcamentos_itens"("orcamento_id");

-- CreateIndex
CREATE INDEX "orcamentos_itens_produto_id_idx" ON "orcamentos_itens"("produto_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_numero_key" ON "pedidos"("numero");

-- CreateIndex
CREATE INDEX "pedidos_numero_idx" ON "pedidos"("numero");

-- CreateIndex
CREATE INDEX "pedidos_cliente_id_idx" ON "pedidos"("cliente_id");

-- CreateIndex
CREATE INDEX "pedidos_vendedor_id_idx" ON "pedidos"("vendedor_id");

-- CreateIndex
CREATE INDEX "pedidos_status_idx" ON "pedidos"("status");

-- CreateIndex
CREATE INDEX "pedidos_data_pedido_idx" ON "pedidos"("data_pedido");

-- CreateIndex
CREATE INDEX "pedidos_data_entrega_prevista_idx" ON "pedidos"("data_entrega_prevista");

-- CreateIndex
CREATE INDEX "pedidos_transportadora_id_idx" ON "pedidos"("transportadora_id");

-- CreateIndex
CREATE INDEX "pedidos_chave_nfe_idx" ON "pedidos"("chave_nfe");

-- CreateIndex
CREATE INDEX "pedidos_itens_pedido_id_idx" ON "pedidos_itens"("pedido_id");

-- CreateIndex
CREATE INDEX "pedidos_itens_produto_id_idx" ON "pedidos_itens"("produto_id");

-- CreateIndex
CREATE INDEX "crm_interacoes_cliente_id_idx" ON "crm_interacoes"("cliente_id");

-- CreateIndex
CREATE INDEX "crm_interacoes_usuario_id_idx" ON "crm_interacoes"("usuario_id");

-- CreateIndex
CREATE INDEX "crm_interacoes_tipo_idx" ON "crm_interacoes"("tipo");

-- CreateIndex
CREATE INDEX "crm_interacoes_data_interacao_idx" ON "crm_interacoes"("data_interacao");

-- CreateIndex
CREATE INDEX "crm_interacoes_data_followup_idx" ON "crm_interacoes"("data_followup");

-- CreateIndex
CREATE INDEX "movimentos_estoque_produto_id_idx" ON "movimentos_estoque"("produto_id");

-- CreateIndex
CREATE INDEX "movimentos_estoque_tipo_idx" ON "movimentos_estoque"("tipo");

-- CreateIndex
CREATE INDEX "movimentos_estoque_data_movimento_idx" ON "movimentos_estoque"("data_movimento");

-- CreateIndex
CREATE INDEX "movimentos_estoque_pedido_id_idx" ON "movimentos_estoque"("pedido_id");

-- CreateIndex
CREATE INDEX "financeiro_contas_receber_cliente_id_idx" ON "financeiro_contas_receber"("cliente_id");

-- CreateIndex
CREATE INDEX "financeiro_contas_receber_pedido_id_idx" ON "financeiro_contas_receber"("pedido_id");

-- CreateIndex
CREATE INDEX "financeiro_contas_receber_usuario_id_idx" ON "financeiro_contas_receber"("usuario_id");

-- CreateIndex
CREATE INDEX "financeiro_contas_receber_status_idx" ON "financeiro_contas_receber"("status");

-- CreateIndex
CREATE INDEX "financeiro_contas_receber_data_vencimento_idx" ON "financeiro_contas_receber"("data_vencimento");

-- CreateIndex
CREATE INDEX "auditoria_tabela_idx" ON "auditoria"("tabela");

-- CreateIndex
CREATE INDEX "auditoria_registro_id_idx" ON "auditoria"("registro_id");

-- CreateIndex
CREATE INDEX "auditoria_usuario_id_idx" ON "auditoria"("usuario_id");

-- CreateIndex
CREATE INDEX "auditoria_criado_em_idx" ON "auditoria"("criado_em");

-- CreateIndex
CREATE INDEX "auditoria_acao_idx" ON "auditoria"("acao");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportadoras" ADD CONSTRAINT "transportadoras_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias_produtos" ADD CONSTRAINT "categorias_produtos_categoria_pai_id_fkey" FOREIGN KEY ("categoria_pai_id") REFERENCES "categorias_produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_transportadora_id_fkey" FOREIGN KEY ("transportadora_id") REFERENCES "transportadoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos_itens" ADD CONSTRAINT "orcamentos_itens_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "orcamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos_itens" ADD CONSTRAINT "orcamentos_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_transportadora_id_fkey" FOREIGN KEY ("transportadora_id") REFERENCES "transportadoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_aprovado_por_fkey" FOREIGN KEY ("aprovado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cancelado_por_fkey" FOREIGN KEY ("cancelado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_itens" ADD CONSTRAINT "pedidos_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_itens" ADD CONSTRAINT "pedidos_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_interacoes" ADD CONSTRAINT "crm_interacoes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_interacoes" ADD CONSTRAINT "crm_interacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_interacoes" ADD CONSTRAINT "crm_interacoes_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "orcamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_interacoes" ADD CONSTRAINT "crm_interacoes_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentos_estoque" ADD CONSTRAINT "movimentos_estoque_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentos_estoque" ADD CONSTRAINT "movimentos_estoque_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentos_estoque" ADD CONSTRAINT "movimentos_estoque_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financeiro_contas_receber" ADD CONSTRAINT "financeiro_contas_receber_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financeiro_contas_receber" ADD CONSTRAINT "financeiro_contas_receber_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financeiro_contas_receber" ADD CONSTRAINT "financeiro_contas_receber_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
