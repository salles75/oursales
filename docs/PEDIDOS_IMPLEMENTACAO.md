# Implementação da Página de Pedidos

## Resumo das Alterações

Foi criada uma página completa de formulário de pedidos (`pedido-form.html`) seguindo a mesma estrutura da página de orçamentos, mas com os campos específicos mostrados nos prints fornecidos.

## Arquivos Criados

### 1. `pedido-form.html`

Página completa de formulário de pedidos com as seguintes seções:

#### Ações do Formulário

- Botão **Salvar**
- Botão **Salvar e Enviar**
- Botão **Visualizar**
- Botão **Cancelar**
- Botão **Personalizar Campos** (alinhado à direita)

#### Informações sobre o Pedido

- **Cliente** com campo de busca (Razão Social, Nome Fantasia, Código ou CNPJ/CPF)
- **Comprador** (dropdown)
- **Transportadora** (campo de texto livre)
- **Frete** (dropdown: CIF, FOB, Sem Frete)
- **Dt. Venda** (obrigatório)
- **Previsão Entrega** com link "Adicionar na Agenda SV"
- **Dt. Fatura**
- **Nota Fiscal**

#### Itens do Pedido

- Alerta informativo sobre importação de produtos
- Botões de ação:
  - 🔍 Busca Avançada
  - 🛒 Modo Cesta de Compra
  - 🗑️ Excluir item
  - ⋮ Mais Ações
- Campo de busca: "Nome do produto, código/código original ou EAN"
- Filtros de quantidade (7 campos numéricos)
- Botões: Aplicar e Limpar %
- Tabela com colunas:
  - Checkbox de seleção
  - Código
  - Descrição
  - Fornecedor/Marca
  - Comissão 👁️
  - R$ Tabela
  - Preço Final
  - Qtde
  - Qtde. Faturada
  - Total R$

#### Totais do Pedido

Grid com 3 colunas mostrando:

**Coluna 1:**

- Qtde. Itens
- Qtde Produtos
- Total Peso Líquido
- Total IPI

**Coluna 2:**

- Acréscimo
- Total Peso Bruto
- Total S/ Impostos

**Coluna 3:**

- Frete
- Desconto
- Total ST
- **Total Final** (destacado)

#### Calculadora de Frete

- Valor do Frete (R$)
- Acréscimo (R$)
- Desconto (R$)

#### Informações Complementares

- **Condição de Pagamento** (textarea com botão de copiar)
- **Tipo** (dropdown: Pedido, Orçamento, Cotação)
- **Cancelado** (checkbox)
- **Vendedor** (obrigatório, dropdown com opções incluindo "Guilherme")
- **Status** (dropdown: Pendente, Aprovado, Faturado, Em Separação, Em Transporte, Entregue, Cancelado)
- **Observações** (textarea)
- **Observação Privada** (textarea)
- **Endereço de Entrega** (textarea)
- **Fator Cubagem (Kg/m3)** (numérico)
- **Nº Ordem de Compra**
- **Nº Pedido ERP**

#### Botão Flutuante

- Botão circular vermelho com "+" no canto inferior direito para ações rápidas

## Arquivos Modificados

### 1. `pedidos.html`

- Alterado o botão "Novo pedido" de `<button>` para `<a href="pedido-form.html">` para redirecionar ao formulário completo

### 2. `orcamentos.html`

- Alterado o botão "Novo orçamento" de `<button>` para `<a href="orcamento-form.html">` para manter consistência

### 3. `assets/css/style.css`

Adicionados novos estilos para suportar a página de pedidos:

- **Alertas e Notificações** (`.alert`, `.alert-info`, `.alert-warning`, `.alert-danger`, `.alert-success`)
- **Filtros de Quantidade** (`.quantity-filters`)
- **Botão Flutuante** (`.fab-button`)
- **Estado Vazio em Tabelas** (`.empty-state`)
- **Estilos para grouped one** (`.grouped.one`)

## Estrutura Visual

A página segue exatamente a estrutura mostrada nos prints:

1. **Cabeçalho** com título dinâmico (ex: "Pedido Alterando - Nº 12866")
2. **Barra de navegação** consistente com outras páginas
3. **Formulário organizado em cards** para melhor legibilidade
4. **Tabela responsiva** para itens do pedido
5. **Grid de totais** em 3 colunas
6. **Campos agrupados** para melhor UX
7. **Botão flutuante** para ações rápidas

## Próximos Passos Sugeridos

1. Implementar a lógica JavaScript em `assets/js/app.js` para:

   - Busca de clientes
   - Adição/remoção de produtos
   - Cálculo automático dos totais
   - Salvar e carregar pedidos
   - Integração com a Agenda SV
   - Importação de produtos

2. Conectar com o backend:

   - API endpoints para CRUD de pedidos
   - Sincronização com ERP
   - Geração de PDF/impressão
   - Envio de pedidos por e-mail

3. Validações:
   - Validação de campos obrigatórios
   - Validação de datas
   - Validação de valores numéricos
   - Verificação de estoque

## Comparação com Orçamentos

A estrutura é idêntica à página de orçamentos (`orcamento-form.html`), mas com os seguintes campos adicionais específicos para pedidos:

- Qtde. Faturada (na tabela de produtos)
- Dt. Venda (ao invés de Dt. Orçamento)
- Link "Adicionar na Agenda SV"
- Nº Pedido ERP
- Status específicos de pedido (Faturado, Em Separação, Em Transporte, Entregue)
- Comissão na tabela de produtos

## Tecnologias Utilizadas

- HTML5 semântico
- CSS3 com variáveis CSS
- Layout responsivo com Grid e Flexbox
- Formulários acessíveis
- Design consistente com o sistema OurSales
