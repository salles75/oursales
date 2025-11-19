# Implementação da Página de Produtos

## Resumo das Alterações

Foi criada uma página completa de formulário de produtos (`produto-form.html`) seguindo a mesma estrutura das páginas de orçamentos e pedidos, mas com os campos específicos mostrados nos prints fornecidos.

## Arquivos Criados

### 1. `produto-form.html`

Página completa de formulário de produtos com as seguintes seções:

#### Ações do Formulário

- Botão **Salvar**
- Botão **Cancelar**
- Botão **Personalizar Campos** (alinhado à direita)

#### Informações do Produto

- **Indústria** \* (dropdown: Nacional, Importado)
- **Código do Produto (SKU)** \* com botão "🔄 Gerar Código"
- **Nome do Produto** \*
- **Preço de Venda** com botão "🧮 Calcular Preço de Venda"
- **NCM (Mercosul)** (8 dígitos)
- **Preço em Promoção**
- **Cores Disponíveis** (textarea)
- **Marca do produto**

#### Custo e Precificação

- **Markup Multiplicador**
- **Margem de Lucro (%)** com botão "🧮 Calcular Preço de Venda"
- **Preço de Compra / Fabricação**
- **Cálculo do Custo Médio (Compra)** (dropdown: Último preço de compra, Média dos últimos preços, Manual)
- **Margem de Lucro Mínima (%)**
- **Margem de Segurança (Lucro)**

#### Informações Complementares

- **IPI (%)** \* (obrigatório)
- **Unidade Medida** (UN, KG, PCT, CX, FARDO)
- **Embalagem** (quantidade por embalagem)
- **Observações** (textarea)
- **Tabela de Preço** (dropdown)
- **Categoria** (dropdown: Bebidas, Alimentos, Suplementos, Kits)
- **Status** \* (dropdown: Ativo, Inativo)
- **Altura da Unidade (m)**
- **Largura da Unidade (m)**
- **Comprimento da Unidade (m)**
- **Código Original** (código do fabricante)
- **Modelo**
- **Peso Líquido (Kg)**
- **Fator Cubagem (Kg/m3)**

#### Foto do Produto

- Campo **URL da foto do produto**
- Botão **Upload por Url da Imagem**
- **Área de arrastar e soltar** para upload de imagens
- Preview das imagens carregadas

#### Substituição Tributária por Estado

- **Estado** (dropdown com todos os 27 estados)
- **S. Tributária (%)** (campo numérico)
- Botão **➕ Adicionar**
- **Tabela** mostrando estados cadastrados com suas alíquotas
- Botão de remover por estado

#### Botão Flutuante

- Botão circular vermelho com "+" no canto inferior direito para ações rápidas

## Arquivos Modificados

### 1. `assets/js/app.js`

- Alterado o evento do botão `produtoCriar` para redirecionar para `produto-form.html`

```javascript
openBtn?.addEventListener("click", () => {
  window.location.href = "produto-form.html";
});
```

### 2. `assets/css/style.css`

Adicionados novos estilos para a página de produtos:

- **Área de Upload de Arquivos**
  - `.file-upload-area` - Container da área de upload
  - `.upload-zone` - Zona de arrastar e soltar
  - `.upload-zone:hover` - Efeito hover
  - `.upload-zone.dragover` - Estado quando arrastando arquivo
  - `#imagensPreview` - Grid de preview de imagens
  - `.image-preview-item` - Item individual de preview
  - Botão de remover imagem

## Estrutura Visual

A página segue exatamente a estrutura mostrada nos prints:

1. **Cabeçalho** com título "📦 Produto Cadastrando"
2. **Barra de navegação** consistente com outras páginas
3. **Formulário organizado em cards** para melhor legibilidade
4. **Seção de Custo e Precificação** com cálculos automáticos
5. **Área de upload de imagens** com drag & drop
6. **Tabela de substituição tributária** por estado
7. **Campos agrupados** para melhor UX
8. **Botão flutuante** para ações rápidas

## Funcionalidades Planejadas

### Campos com Botões de Ação

1. **Gerar Código** - Gera automaticamente um SKU único
2. **Calcular Preço de Venda** - Calcula baseado no markup ou margem de lucro
3. **Upload por URL** - Adiciona imagem através de URL
4. **Adicionar ST** - Adiciona substituição tributária para um estado

### Upload de Imagens

- Drag & drop de múltiplas imagens
- Preview das imagens antes de salvar
- Botão para remover imagens
- Suporte para URL de imagens externas

### Substituição Tributária

- Adicionar múltiplos estados com diferentes alíquotas
- Tabela dinâmica mostrando os estados cadastrados
- Remover estados individualmente

### Cálculos Automáticos

- Calcular preço de venda baseado em:
  - Markup multiplicador
  - Margem de lucro percentual
  - Preço de compra/fabricação
- Calcular automaticamente o custo médio

## Próximos Passos Sugeridos

1. **Implementar a lógica JavaScript** em `assets/js/app.js` para:

   - Gerar código SKU automaticamente
   - Calcular preços de venda
   - Gerenciar upload de imagens (drag & drop)
   - Adicionar/remover substituição tributária
   - Salvar e carregar produtos
   - Validação de campos

2. **Conectar com o backend**:

   - API endpoints para CRUD de produtos
   - Upload de imagens para servidor/CDN
   - Sincronização com sistema de estoque
   - Integração com ERP

3. **Validações**:

   - Validação de NCM (8 dígitos)
   - Validação de SKU único
   - Validação de preços (não negativos)
   - Validação de dimensões e peso
   - Validação de imagens (tipo e tamanho)

4. **Melhorias**:
   - Busca de NCM automaticamente
   - Sugestão de preços baseado em concorrência
   - Histórico de alterações de preço
   - Cálculo automático de cubagem
   - Integração com catálogo online

## Campos Obrigatórios

- Indústria
- Código do Produto (SKU)
- Nome do Produto
- IPI (%)
- Status

## Diferenças em Relação às Páginas Anteriores

### Recursos Exclusivos de Produtos

- **Área de Upload de Imagens** - Suporte completo para múltiplas imagens
- **Seção de Custo e Precificação** - Cálculos financeiros avançados
- **Substituição Tributária por Estado** - Gestão fiscal estadual
- **Dimensões físicas** - Altura, largura, comprimento e peso
- **Código Original e Modelo** - Informações do fabricante
- **Fator Cubagem** - Cálculo logístico

### Botões de Ação Especiais

- Gerar Código (automático)
- Calcular Preço de Venda (2 locais diferentes)
- Upload por URL

## Tecnologias Utilizadas

- HTML5 semântico
- CSS3 com variáveis CSS e Grid/Flexbox
- Formulários acessíveis e validados
- Área de drag & drop para upload
- Design responsivo
- Consistência visual com o sistema OurSales

## Compatibilidade

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Responsivo para desktop e tablet
- Suporte a arrastar e soltar imagens
- Suporte a múltiplos formatos de imagem

## Considerações de UX

1. **Agrupamento lógico** - Campos relacionados agrupados em seções
2. **Labels descritivos** - Placeholders com exemplos práticos
3. **Feedback visual** - Estados hover e dragover claramente definidos
4. **Botões de ação próximos** - Botões auxiliares ao lado dos campos relevantes
5. **Validação inline** - Campos obrigatórios marcados com \*
6. **Preview de imagens** - Feedback imediato do upload
7. **Tabela de ST** - Visualização clara dos estados cadastrados
