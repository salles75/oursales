-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "industria_id" UUID;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "clienteId" UUID;

-- CreateTable
CREATE TABLE "industrias" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "razao_social" VARCHAR(255) NOT NULL,
    "nome_fantasia" VARCHAR(255) NOT NULL,
    "cnpj" VARCHAR(18) NOT NULL,
    "inscricao_estadual" VARCHAR(20),
    "email" VARCHAR(255),
    "telefone" VARCHAR(20),
    "endereco" VARCHAR(255),
    "cidade" VARCHAR(100),
    "estado" VARCHAR(2),
    "cep" VARCHAR(10),
    "comissao" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ativo',
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "industrias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tabelas_precos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "tipo" VARCHAR(20) NOT NULL DEFAULT 'venda',
    "industria_id" UUID NOT NULL,
    "margem_minima" DECIMAL(5,2),
    "desconto_maximo" DECIMAL(5,2),
    "validade_inicio" DATE,
    "validade_fim" DATE,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabelas_precos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tabelas_precos_produtos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tabela_preco_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "preco" DECIMAL(15,2) NOT NULL,
    "margem_lucro" DECIMAL(5,2),
    "desconto" DECIMAL(5,2) DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabelas_precos_produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "categoria" VARCHAR(100) NOT NULL,
    "chave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arquivos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(255) NOT NULL,
    "nome_arquivo" VARCHAR(255) NOT NULL,
    "caminho" VARCHAR(500) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "tamanho" BIGINT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arquivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "padroes_tabelas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "colunas" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "padroes_tabelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes_oursales" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "cnpj" VARCHAR(18),
    "plano" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ativo',
    "subdomain" VARCHAR(50) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_oursales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instancias_oursales" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "clienteId" UUID NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ativo',
    "recursos" TEXT NOT NULL,
    "ultima_atividade" TIMESTAMPTZ,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instancias_oursales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturas_oursales" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "clienteId" UUID NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "plano" VARCHAR(50) NOT NULL,
    "data_vencimento" DATE NOT NULL,
    "data_pagamento" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pendente',
    "metodo_pagamento" VARCHAR(50),
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faturas_oursales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "industrias_cnpj_key" ON "industrias"("cnpj");

-- CreateIndex
CREATE INDEX "industrias_cnpj_idx" ON "industrias"("cnpj");

-- CreateIndex
CREATE INDEX "industrias_status_idx" ON "industrias"("status");

-- CreateIndex
CREATE INDEX "industrias_nome_fantasia_idx" ON "industrias"("nome_fantasia");

-- CreateIndex
CREATE INDEX "tabelas_precos_industria_id_idx" ON "tabelas_precos"("industria_id");

-- CreateIndex
CREATE INDEX "tabelas_precos_ativa_idx" ON "tabelas_precos"("ativa");

-- CreateIndex
CREATE INDEX "tabelas_precos_tipo_idx" ON "tabelas_precos"("tipo");

-- CreateIndex
CREATE INDEX "tabelas_precos_produtos_tabela_preco_id_idx" ON "tabelas_precos_produtos"("tabela_preco_id");

-- CreateIndex
CREATE INDEX "tabelas_precos_produtos_produto_id_idx" ON "tabelas_precos_produtos"("produto_id");

-- CreateIndex
CREATE INDEX "tabelas_precos_produtos_ativo_idx" ON "tabelas_precos_produtos"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "tabelas_precos_produtos_tabela_preco_id_produto_id_key" ON "tabelas_precos_produtos"("tabela_preco_id", "produto_id");

-- CreateIndex
CREATE INDEX "configuracoes_categoria_idx" ON "configuracoes"("categoria");

-- CreateIndex
CREATE INDEX "configuracoes_ativo_idx" ON "configuracoes"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_categoria_chave_key" ON "configuracoes"("categoria", "chave");

-- CreateIndex
CREATE INDEX "arquivos_tipo_idx" ON "arquivos"("tipo");

-- CreateIndex
CREATE INDEX "arquivos_ativo_idx" ON "arquivos"("ativo");

-- CreateIndex
CREATE INDEX "padroes_tabelas_tipo_idx" ON "padroes_tabelas"("tipo");

-- CreateIndex
CREATE INDEX "padroes_tabelas_ativo_idx" ON "padroes_tabelas"("ativo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_oursales_subdomain_key" ON "clientes_oursales"("subdomain");

-- CreateIndex
CREATE INDEX "clientes_oursales_status_idx" ON "clientes_oursales"("status");

-- CreateIndex
CREATE INDEX "clientes_oursales_plano_idx" ON "clientes_oursales"("plano");

-- CreateIndex
CREATE INDEX "clientes_oursales_subdomain_idx" ON "clientes_oursales"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "instancias_oursales_clienteId_key" ON "instancias_oursales"("clienteId");

-- CreateIndex
CREATE INDEX "instancias_oursales_status_idx" ON "instancias_oursales"("status");

-- CreateIndex
CREATE INDEX "instancias_oursales_clienteId_idx" ON "instancias_oursales"("clienteId");

-- CreateIndex
CREATE INDEX "faturas_oursales_clienteId_idx" ON "faturas_oursales"("clienteId");

-- CreateIndex
CREATE INDEX "faturas_oursales_status_idx" ON "faturas_oursales"("status");

-- CreateIndex
CREATE INDEX "faturas_oursales_data_vencimento_idx" ON "faturas_oursales"("data_vencimento");

-- CreateIndex
CREATE INDEX "produtos_industria_id_idx" ON "produtos"("industria_id");

-- CreateIndex
CREATE INDEX "usuarios_clienteId_idx" ON "usuarios"("clienteId");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_oursales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_industria_id_fkey" FOREIGN KEY ("industria_id") REFERENCES "industrias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tabelas_precos" ADD CONSTRAINT "tabelas_precos_industria_id_fkey" FOREIGN KEY ("industria_id") REFERENCES "industrias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tabelas_precos_produtos" ADD CONSTRAINT "tabelas_precos_produtos_tabela_preco_id_fkey" FOREIGN KEY ("tabela_preco_id") REFERENCES "tabelas_precos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tabelas_precos_produtos" ADD CONSTRAINT "tabelas_precos_produtos_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instancias_oursales" ADD CONSTRAINT "instancias_oursales_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_oursales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturas_oursales" ADD CONSTRAINT "faturas_oursales_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_oursales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
