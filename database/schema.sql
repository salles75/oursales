-- =====================================================
-- OurSales - Schema de Banco de Dados PostgreSQL
-- Projetado para alta escalabilidade e grandes volumes
-- =====================================================

-- Extensões para melhor performance e funcionalidades
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text otimizada
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- Para índices compostos otimizados

-- =====================================================
-- TABELA: usuarios
-- Gerenciamento de usuários do sistema
-- =====================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) NOT NULL DEFAULT 'vendedor', -- admin, gerente, vendedor
    ativo BOOLEAN DEFAULT true,
    foto_url TEXT,
    telefone VARCHAR(20),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil) WHERE ativo = true;

-- =====================================================
-- TABELA: clientes
-- Cadastro unificado de clientes (PF e PJ)
-- =====================================================
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(2) NOT NULL CHECK (tipo IN ('PF', 'PJ')),
    
    -- Dados PF
    nome_completo VARCHAR(255),
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    data_nascimento DATE,
    
    -- Dados PJ
    razao_social VARCHAR(255),
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE,
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    
    -- Contato
    email VARCHAR(255),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    website VARCHAR(255),
    
    -- Endereço
    cep VARCHAR(9),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    pais VARCHAR(100) DEFAULT 'Brasil',
    
    -- Informações comerciais
    limite_credito DECIMAL(15,2) DEFAULT 0,
    saldo_devedor DECIMAL(15,2) DEFAULT 0,
    score_credito INTEGER DEFAULT 0 CHECK (score_credito BETWEEN 0 AND 1000),
    condicao_pagamento VARCHAR(100),
    desconto_padrao DECIMAL(5,2) DEFAULT 0,
    
    -- Classificação e segmentação
    segmento VARCHAR(100), -- Varejo, Atacado, Indústria, etc
    porte VARCHAR(50), -- Pequeno, Médio, Grande
    status VARCHAR(50) DEFAULT 'ativo', -- ativo, inativo, bloqueado, prospecto
    tags TEXT[], -- Array de tags para classificação
    
    -- Vendedor responsável
    vendedor_id UUID REFERENCES usuarios(id),
    
    -- Observações
    observacoes TEXT,
    
    -- Metadados
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    criado_por UUID REFERENCES usuarios(id),
    
    -- Constraint: CPF para PF, CNPJ para PJ
    CONSTRAINT chk_cliente_documento CHECK (
        (tipo = 'PF' AND cpf IS NOT NULL) OR 
        (tipo = 'PJ' AND cnpj IS NOT NULL)
    )
);

-- Índices para performance em buscas
CREATE INDEX idx_clientes_tipo ON clientes(tipo);
CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_vendedor ON clientes(vendedor_id);
CREATE INDEX idx_clientes_cpf ON clientes(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_clientes_cnpj ON clientes(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_clientes_nome_trgm ON clientes USING gin(nome_completo gin_trgm_ops);
CREATE INDEX idx_clientes_razao_trgm ON clientes USING gin(razao_social gin_trgm_ops);
CREATE INDEX idx_clientes_tags ON clientes USING gin(tags);
CREATE INDEX idx_clientes_cidade_estado ON clientes(cidade, estado);

-- =====================================================
-- TABELA: transportadoras
-- Cadastro de empresas transportadoras
-- =====================================================
CREATE TABLE transportadoras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(20),
    
    -- Contato
    email VARCHAR(255),
    telefone VARCHAR(20),
    website VARCHAR(255),
    
    -- Endereço
    cep VARCHAR(9),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    -- Informações operacionais
    prazo_medio_dias INTEGER DEFAULT 0,
    custo_medio_kg DECIMAL(10,4),
    custo_minimo DECIMAL(10,2),
    cobertura_estados TEXT[], -- Array de UF atendidas
    tipos_servico TEXT[], -- Expresso, Normal, Econômico
    
    -- Avaliação
    avaliacao DECIMAL(3,2) DEFAULT 0 CHECK (avaliacao BETWEEN 0 AND 5),
    total_entregas INTEGER DEFAULT 0,
    entregas_no_prazo INTEGER DEFAULT 0,
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    
    -- Metadados
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    criado_por UUID REFERENCES usuarios(id)
);

-- Índices
CREATE INDEX idx_transportadoras_cnpj ON transportadoras(cnpj);
CREATE INDEX idx_transportadoras_ativo ON transportadoras(ativo);
CREATE INDEX idx_transportadoras_cobertura ON transportadoras USING gin(cobertura_estados);
CREATE INDEX idx_transportadoras_avaliacao ON transportadoras(avaliacao) WHERE ativo = true;

-- =====================================================
-- TABELA: categorias_produtos
-- Categorização hierárquica de produtos
-- =====================================================
CREATE TABLE categorias_produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria_pai_id UUID REFERENCES categorias_produtos(id),
    nivel INTEGER DEFAULT 0,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categorias_pai ON categorias_produtos(categoria_pai_id);
CREATE INDEX idx_categorias_nivel ON categorias_produtos(nivel);

-- =====================================================
-- TABELA: produtos
-- Catálogo de produtos
-- =====================================================
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE,
    ean VARCHAR(13),
    
    -- Informações básicas
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    descricao_detalhada TEXT,
    categoria_id UUID REFERENCES categorias_produtos(id),
    
    -- Preços e custos
    preco_custo DECIMAL(15,2) DEFAULT 0,
    preco_venda DECIMAL(15,2) NOT NULL,
    preco_promocional DECIMAL(15,2),
    margem_lucro DECIMAL(5,2),
    
    -- Estoque
    estoque_atual INTEGER DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 0,
    estoque_maximo INTEGER DEFAULT 0,
    localizacao_estoque VARCHAR(100),
    
    -- Especificações
    unidade_medida VARCHAR(20) DEFAULT 'UN', -- UN, KG, M, L, etc
    peso_bruto DECIMAL(10,3),
    peso_liquido DECIMAL(10,3),
    largura DECIMAL(10,2),
    altura DECIMAL(10,2),
    profundidade DECIMAL(10,2),
    
    -- Informações comerciais
    ncm VARCHAR(10), -- Nomenclatura Comum do Mercosul
    cest VARCHAR(10), -- Código Especificador da Substituição Tributária
    icms DECIMAL(5,2),
    ipi DECIMAL(5,2),
    
    -- Mídia
    imagem_principal_url TEXT,
    imagens_urls TEXT[],
    
    -- Status e classificação
    ativo BOOLEAN DEFAULT true,
    destaque BOOLEAN DEFAULT false,
    tags TEXT[],
    
    -- Fornecedor
    fornecedor_nome VARCHAR(255),
    fornecedor_codigo VARCHAR(100),
    
    -- Metadados
    visualizacoes INTEGER DEFAULT 0,
    vendas_total INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    criado_por UUID REFERENCES usuarios(id)
);

-- Índices para alta performance
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_sku ON produtos(sku);
CREATE INDEX idx_produtos_ean ON produtos(ean);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);
CREATE INDEX idx_produtos_nome_trgm ON produtos USING gin(nome gin_trgm_ops);
CREATE INDEX idx_produtos_tags ON produtos USING gin(tags);
CREATE INDEX idx_produtos_preco ON produtos(preco_venda) WHERE ativo = true;

-- =====================================================
-- TABELA: orcamentos
-- Propostas comerciais
-- =====================================================
CREATE TABLE orcamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(20) UNIQUE NOT NULL,
    
    -- Relacionamentos
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    vendedor_id UUID NOT NULL REFERENCES usuarios(id),
    
    -- Datas
    data_emissao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_validade DATE NOT NULL,
    
    -- Valores
    subtotal DECIMAL(15,2) DEFAULT 0,
    desconto_valor DECIMAL(15,2) DEFAULT 0,
    desconto_percentual DECIMAL(5,2) DEFAULT 0,
    acrescimo_valor DECIMAL(15,2) DEFAULT 0,
    valor_frete DECIMAL(15,2) DEFAULT 0,
    valor_total DECIMAL(15,2) NOT NULL,
    
    -- Condições comerciais
    condicao_pagamento VARCHAR(100),
    forma_pagamento VARCHAR(100),
    prazo_entrega_dias INTEGER,
    transportadora_id UUID REFERENCES transportadoras(id),
    
    -- Status e observações
    status VARCHAR(50) DEFAULT 'em_analise', -- em_analise, enviado, aprovado, rejeitado, expirado, convertido
    observacoes TEXT,
    observacoes_internas TEXT,
    
    -- Conversão
    convertido_pedido BOOLEAN DEFAULT false,
    pedido_id UUID,
    data_conversao TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    criado_por UUID REFERENCES usuarios(id)
);

-- Índices
CREATE INDEX idx_orcamentos_numero ON orcamentos(numero);
CREATE INDEX idx_orcamentos_cliente ON orcamentos(cliente_id);
CREATE INDEX idx_orcamentos_vendedor ON orcamentos(vendedor_id);
CREATE INDEX idx_orcamentos_status ON orcamentos(status);
CREATE INDEX idx_orcamentos_data_emissao ON orcamentos(data_emissao DESC);
CREATE INDEX idx_orcamentos_data_validade ON orcamentos(data_validade);
CREATE INDEX idx_orcamentos_convertido ON orcamentos(convertido_pedido);

-- =====================================================
-- TABELA: orcamentos_itens
-- Itens dos orçamentos (relacionamento muitos-para-muitos)
-- =====================================================
CREATE TABLE orcamentos_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES produtos(id),
    
    -- Detalhes do item
    quantidade DECIMAL(10,3) NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(15,2) NOT NULL,
    desconto_percentual DECIMAL(5,2) DEFAULT 0,
    desconto_valor DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    
    -- Informações adicionais
    observacoes TEXT,
    ordem INTEGER DEFAULT 0,
    
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_orcamentos_itens_orcamento ON orcamentos_itens(orcamento_id);
CREATE INDEX idx_orcamentos_itens_produto ON orcamentos_itens(produto_id);

-- =====================================================
-- TABELA: pedidos
-- Pedidos confirmados
-- =====================================================
CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(20) UNIQUE NOT NULL,
    numero_pedido_cliente VARCHAR(50), -- Número do pedido do cliente (quando houver)
    
    -- Relacionamentos
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    vendedor_id UUID NOT NULL REFERENCES usuarios(id),
    orcamento_id UUID REFERENCES orcamentos(id),
    transportadora_id UUID REFERENCES transportadoras(id),
    
    -- Datas
    data_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    data_faturamento TIMESTAMP WITH TIME ZONE,
    data_entrega_prevista DATE,
    data_entrega_realizada DATE,
    
    -- Valores
    subtotal DECIMAL(15,2) DEFAULT 0,
    desconto_valor DECIMAL(15,2) DEFAULT 0,
    desconto_percentual DECIMAL(5,2) DEFAULT 0,
    acrescimo_valor DECIMAL(15,2) DEFAULT 0,
    valor_frete DECIMAL(15,2) DEFAULT 0,
    valor_total DECIMAL(15,2) NOT NULL,
    
    -- Condições comerciais
    condicao_pagamento VARCHAR(100),
    forma_pagamento VARCHAR(100),
    prazo_entrega_dias INTEGER,
    
    -- Status e rastreamento
    status VARCHAR(50) DEFAULT 'aguardando_aprovacao', 
    -- aguardando_aprovacao, aprovado, em_producao, em_separacao, 
    -- faturado, em_transito, entregue, cancelado
    
    codigo_rastreamento VARCHAR(100),
    nota_fiscal VARCHAR(20),
    chave_nfe VARCHAR(44),
    
    -- Observações
    observacoes TEXT,
    observacoes_internas TEXT,
    motivo_cancelamento TEXT,
    
    -- Metadados
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    criado_por UUID REFERENCES usuarios(id),
    aprovado_por UUID REFERENCES usuarios(id),
    cancelado_por UUID REFERENCES usuarios(id)
);

-- Índices para alta performance
CREATE INDEX idx_pedidos_numero ON pedidos(numero);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_vendedor ON pedidos(vendedor_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_data_pedido ON pedidos(data_pedido DESC);
CREATE INDEX idx_pedidos_data_entrega ON pedidos(data_entrega_prevista);
CREATE INDEX idx_pedidos_transportadora ON pedidos(transportadora_id);
CREATE INDEX idx_pedidos_nfe ON pedidos(chave_nfe) WHERE chave_nfe IS NOT NULL;

-- =====================================================
-- TABELA: pedidos_itens
-- Itens dos pedidos
-- =====================================================
CREATE TABLE pedidos_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES produtos(id),
    
    -- Detalhes do item
    quantidade DECIMAL(10,3) NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(15,2) NOT NULL,
    desconto_percentual DECIMAL(5,2) DEFAULT 0,
    desconto_valor DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    
    -- Controle de estoque
    quantidade_separada DECIMAL(10,3) DEFAULT 0,
    quantidade_entregue DECIMAL(10,3) DEFAULT 0,
    
    -- Informações adicionais
    observacoes TEXT,
    ordem INTEGER DEFAULT 0,
    
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_pedidos_itens_pedido ON pedidos_itens(pedido_id);
CREATE INDEX idx_pedidos_itens_produto ON pedidos_itens(produto_id);

-- =====================================================
-- TABELA: crm_interacoes
-- Histórico de interações com clientes (CRM)
-- =====================================================
CREATE TABLE crm_interacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamentos
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    
    -- Tipo e canal
    tipo VARCHAR(50) NOT NULL, -- ligacao, email, reuniao, whatsapp, visita, etc
    canal VARCHAR(50), -- telefone, email, presencial, online
    
    -- Detalhes da interação
    assunto VARCHAR(255),
    descricao TEXT NOT NULL,
    resultado VARCHAR(100), -- positivo, negativo, neutro, em_andamento
    
    -- Data e duração
    data_interacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duracao_minutos INTEGER,
    
    -- Follow-up
    requer_followup BOOLEAN DEFAULT false,
    data_followup DATE,
    followup_realizado BOOLEAN DEFAULT false,
    
    -- Anexos e relacionamentos
    anexos_urls TEXT[],
    orcamento_id UUID REFERENCES orcamentos(id),
    pedido_id UUID REFERENCES pedidos(id),
    
    -- Tags e classificação
    tags TEXT[],
    sentimento VARCHAR(20), -- positivo, neutro, negativo
    
    -- Metadados
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_crm_cliente ON crm_interacoes(cliente_id);
CREATE INDEX idx_crm_usuario ON crm_interacoes(usuario_id);
CREATE INDEX idx_crm_tipo ON crm_interacoes(tipo);
CREATE INDEX idx_crm_data ON crm_interacoes(data_interacao DESC);
CREATE INDEX idx_crm_followup ON crm_interacoes(data_followup) WHERE requer_followup = true AND followup_realizado = false;
CREATE INDEX idx_crm_tags ON crm_interacoes USING gin(tags);

-- =====================================================
-- TABELA: movimentos_estoque
-- Histórico de movimentações de estoque
-- =====================================================
CREATE TABLE movimentos_estoque (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES produtos(id),
    
    -- Tipo de movimento
    tipo VARCHAR(50) NOT NULL, -- entrada, saida, ajuste, devolucao, transferencia
    quantidade DECIMAL(10,3) NOT NULL,
    estoque_anterior INTEGER NOT NULL,
    estoque_posterior INTEGER NOT NULL,
    
    -- Referências
    pedido_id UUID REFERENCES pedidos(id),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    
    -- Detalhes
    motivo VARCHAR(255),
    observacoes TEXT,
    
    -- Custos
    custo_unitario DECIMAL(15,2),
    custo_total DECIMAL(15,2),
    
    data_movimento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_movimentos_produto ON movimentos_estoque(produto_id);
CREATE INDEX idx_movimentos_tipo ON movimentos_estoque(tipo);
CREATE INDEX idx_movimentos_data ON movimentos_estoque(data_movimento DESC);
CREATE INDEX idx_movimentos_pedido ON movimentos_estoque(pedido_id) WHERE pedido_id IS NOT NULL;

-- =====================================================
-- TABELA: financeiro_contas_receber
-- Controle de contas a receber
-- =====================================================
CREATE TABLE financeiro_contas_receber (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamentos
    cliente_id UUID NOT NULL REFERENCES clientes(id),
    pedido_id UUID REFERENCES pedidos(id),
    
    -- Identificação
    numero_documento VARCHAR(50),
    numero_parcela INTEGER,
    total_parcelas INTEGER,
    
    -- Valores
    valor_original DECIMAL(15,2) NOT NULL,
    valor_juros DECIMAL(15,2) DEFAULT 0,
    valor_desconto DECIMAL(15,2) DEFAULT 0,
    valor_pago DECIMAL(15,2) DEFAULT 0,
    valor_pendente DECIMAL(15,2) NOT NULL,
    
    -- Datas
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'em_aberto', -- em_aberto, pago, vencido, cancelado
    
    -- Informações de pagamento
    forma_pagamento VARCHAR(100),
    banco VARCHAR(100),
    agencia VARCHAR(20),
    conta VARCHAR(20),
    
    -- Observações
    observacoes TEXT,
    
    -- Metadados
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_contas_receber_cliente ON financeiro_contas_receber(cliente_id);
CREATE INDEX idx_contas_receber_pedido ON financeiro_contas_receber(pedido_id);
CREATE INDEX idx_contas_receber_status ON financeiro_contas_receber(status);
CREATE INDEX idx_contas_receber_vencimento ON financeiro_contas_receber(data_vencimento);
CREATE INDEX idx_contas_receber_vencidos ON financeiro_contas_receber(data_vencimento) 
    WHERE status = 'em_aberto' AND data_vencimento < CURRENT_DATE;

-- =====================================================
-- TABELA: auditoria
-- Log de auditoria para rastreabilidade
-- =====================================================
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tabela VARCHAR(100) NOT NULL,
    registro_id UUID NOT NULL,
    acao VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    usuario_id UUID REFERENCES usuarios(id),
    
    -- Dados da mudança
    dados_anteriores JSONB,
    dados_novos JSONB,
    campos_alterados TEXT[],
    
    -- Contexto
    ip_address INET,
    user_agent TEXT,
    
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_auditoria_tabela ON auditoria(tabela);
CREATE INDEX idx_auditoria_registro ON auditoria(registro_id);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_data ON auditoria(criado_em DESC);
CREATE INDEX idx_auditoria_acao ON auditoria(acao);

-- =====================================================
-- VIEWS PARA RELATÓRIOS E ANALYTICS
-- =====================================================

-- View: Vendas por vendedor
CREATE OR REPLACE VIEW vw_vendas_por_vendedor AS
SELECT 
    u.id as vendedor_id,
    u.nome as vendedor_nome,
    COUNT(DISTINCT p.id) as total_pedidos,
    SUM(p.valor_total) as valor_total_vendas,
    AVG(p.valor_total) as ticket_medio,
    COUNT(DISTINCT p.cliente_id) as total_clientes_atendidos,
    DATE_TRUNC('month', p.data_pedido) as mes_referencia
FROM pedidos p
INNER JOIN usuarios u ON p.vendedor_id = u.id
WHERE p.status NOT IN ('cancelado')
GROUP BY u.id, u.nome, DATE_TRUNC('month', p.data_pedido);

-- View: Produtos mais vendidos
CREATE OR REPLACE VIEW vw_produtos_mais_vendidos AS
SELECT 
    pr.id as produto_id,
    pr.codigo,
    pr.nome as produto_nome,
    pr.categoria_id,
    COUNT(pi.id) as total_pedidos,
    SUM(pi.quantidade) as quantidade_total_vendida,
    SUM(pi.subtotal) as valor_total_vendas,
    AVG(pi.preco_unitario) as preco_medio
FROM produtos pr
INNER JOIN pedidos_itens pi ON pr.id = pi.produto_id
INNER JOIN pedidos p ON pi.pedido_id = p.id
WHERE p.status NOT IN ('cancelado')
GROUP BY pr.id, pr.codigo, pr.nome, pr.categoria_id;

-- View: Clientes top
CREATE OR REPLACE VIEW vw_clientes_top AS
SELECT 
    c.id as cliente_id,
    c.tipo,
    COALESCE(c.razao_social, c.nome_completo) as cliente_nome,
    COUNT(DISTINCT p.id) as total_pedidos,
    SUM(p.valor_total) as valor_total_compras,
    AVG(p.valor_total) as ticket_medio,
    MAX(p.data_pedido) as ultima_compra,
    c.vendedor_id,
    c.status
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id AND p.status NOT IN ('cancelado')
GROUP BY c.id, c.tipo, COALESCE(c.razao_social, c.nome_completo), c.vendedor_id, c.status;

-- View: Dashboard executivo
CREATE OR REPLACE VIEW vw_dashboard_executivo AS
SELECT 
    DATE_TRUNC('day', p.data_pedido) as data,
    COUNT(DISTINCT p.id) as total_pedidos,
    COUNT(DISTINCT p.cliente_id) as clientes_unicos,
    SUM(p.valor_total) as faturamento_dia,
    AVG(p.valor_total) as ticket_medio,
    SUM(CASE WHEN p.status = 'entregue' THEN 1 ELSE 0 END) as pedidos_entregues,
    SUM(CASE WHEN p.status = 'cancelado' THEN 1 ELSE 0 END) as pedidos_cancelados
FROM pedidos p
GROUP BY DATE_TRUNC('day', p.data_pedido);

-- =====================================================
-- FUNÇÕES E TRIGGERS PARA AUTOMAÇÃO
-- =====================================================

-- Função: Atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER trigger_usuarios_atualizado
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_clientes_atualizado
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_transportadoras_atualizado
    BEFORE UPDATE ON transportadoras
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_produtos_atualizado
    BEFORE UPDATE ON produtos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_orcamentos_atualizado
    BEFORE UPDATE ON orcamentos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_pedidos_atualizado
    BEFORE UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

-- Função: Calcular subtotal de item
CREATE OR REPLACE FUNCTION calcular_subtotal_item()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal = (NEW.quantidade * NEW.preco_unitario) - NEW.desconto_valor;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_orcamentos_itens_subtotal
    BEFORE INSERT OR UPDATE ON orcamentos_itens
    FOR EACH ROW
    EXECUTE FUNCTION calcular_subtotal_item();

CREATE TRIGGER trigger_pedidos_itens_subtotal
    BEFORE INSERT OR UPDATE ON pedidos_itens
    FOR EACH ROW
    EXECUTE FUNCTION calcular_subtotal_item();

-- Função: Atualizar totais do orçamento
CREATE OR REPLACE FUNCTION atualizar_total_orcamento()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orcamentos
    SET 
        subtotal = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM orcamentos_itens
            WHERE orcamento_id = COALESCE(NEW.orcamento_id, OLD.orcamento_id)
        ),
        valor_total = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM orcamentos_itens
            WHERE orcamento_id = COALESCE(NEW.orcamento_id, OLD.orcamento_id)
        ) - COALESCE(
            (SELECT desconto_valor FROM orcamentos WHERE id = COALESCE(NEW.orcamento_id, OLD.orcamento_id)), 0
        ) + COALESCE(
            (SELECT valor_frete FROM orcamentos WHERE id = COALESCE(NEW.orcamento_id, OLD.orcamento_id)), 0
        )
    WHERE id = COALESCE(NEW.orcamento_id, OLD.orcamento_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_total_orcamento
    AFTER INSERT OR UPDATE OR DELETE ON orcamentos_itens
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_total_orcamento();

-- Função: Atualizar totais do pedido
CREATE OR REPLACE FUNCTION atualizar_total_pedido()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pedidos
    SET 
        subtotal = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM pedidos_itens
            WHERE pedido_id = COALESCE(NEW.pedido_id, OLD.pedido_id)
        ),
        valor_total = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM pedidos_itens
            WHERE pedido_id = COALESCE(NEW.pedido_id, OLD.pedido_id)
        ) - COALESCE(
            (SELECT desconto_valor FROM pedidos WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id)), 0
        ) + COALESCE(
            (SELECT valor_frete FROM pedidos WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id)), 0
        )
    WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_total_pedido
    AFTER INSERT OR UPDATE OR DELETE ON pedidos_itens
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_total_pedido();

-- Função: Registrar movimento de estoque ao criar/atualizar pedido
CREATE OR REPLACE FUNCTION registrar_movimento_estoque_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO movimentos_estoque (
            produto_id,
            tipo,
            quantidade,
            estoque_anterior,
            estoque_posterior,
            pedido_id,
            usuario_id,
            motivo
        )
        SELECT 
            NEW.produto_id,
            'saida',
            NEW.quantidade,
            p.estoque_atual,
            p.estoque_atual - NEW.quantidade,
            NEW.pedido_id,
            (SELECT vendedor_id FROM pedidos WHERE id = NEW.pedido_id),
            'Venda - Pedido'
        FROM produtos p
        WHERE p.id = NEW.produto_id;
        
        UPDATE produtos
        SET estoque_atual = estoque_atual - NEW.quantidade
        WHERE id = NEW.produto_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Nota: Este trigger só deve ser ativado quando o pedido for confirmado
-- Para controle mais fino, pode-se usar uma função separada chamada manualmente

-- =====================================================
-- PARTICIONAMENTO PARA ESCALABILIDADE
-- Tabelas grandes devem ser particionadas por data
-- =====================================================

-- Exemplo de particionamento para auditoria (por mês)
-- Isso melhora significativamente a performance em tabelas com milhões de registros

-- Criar tabela mãe particionada
CREATE TABLE auditoria_particionada (
    id UUID DEFAULT uuid_generate_v4(),
    tabela VARCHAR(100) NOT NULL,
    registro_id UUID NOT NULL,
    acao VARCHAR(20) NOT NULL,
    usuario_id UUID REFERENCES usuarios(id),
    dados_anteriores JSONB,
    dados_novos JSONB,
    campos_alterados TEXT[],
    ip_address INET,
    user_agent TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (criado_em);

-- Criar partições (exemplo para 2025-2026)
CREATE TABLE auditoria_2025_01 PARTITION OF auditoria_particionada
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE auditoria_2025_02 PARTITION OF auditoria_particionada
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Continue criando partições conforme necessário...
-- Em produção, use um job automatizado para criar partições futuras

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Usuário administrador padrão (senha: admin123 - TROCAR EM PRODUÇÃO!)
INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
('Administrador', 'admin@oursales.com', '$2b$10$YourHashedPasswordHere', 'admin');

-- Categorias de produtos exemplo
INSERT INTO categorias_produtos (nome, descricao, nivel) VALUES
('Eletrônicos', 'Produtos eletrônicos diversos', 0),
('Informática', 'Produtos de informática', 0),
('Móveis', 'Móveis e decoração', 0),
('Alimentos', 'Produtos alimentícios', 0);

-- =====================================================
-- COMENTÁRIOS NAS TABELAS (DOCUMENTAÇÃO)
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema com controle de acesso';
COMMENT ON TABLE clientes IS 'Cadastro unificado de clientes PF e PJ com informações comerciais completas';
COMMENT ON TABLE transportadoras IS 'Cadastro de empresas transportadoras para logística';
COMMENT ON TABLE produtos IS 'Catálogo completo de produtos com controle de estoque e preços';
COMMENT ON TABLE orcamentos IS 'Propostas comerciais enviadas aos clientes';
COMMENT ON TABLE pedidos IS 'Pedidos confirmados e em processo de atendimento';
COMMENT ON TABLE crm_interacoes IS 'Histórico completo de interações com clientes';
COMMENT ON TABLE movimentos_estoque IS 'Rastreamento de todas as movimentações de estoque';
COMMENT ON TABLE financeiro_contas_receber IS 'Controle financeiro de contas a receber';
COMMENT ON TABLE auditoria IS 'Log de auditoria para compliance e rastreabilidade';

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

