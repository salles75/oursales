# Padrão de Layout para Páginas de Importação

Este documento descreve o padrão de layout estabelecido para as páginas de importação do sistema OurSales.

## Estrutura Base

Todas as páginas de importação devem seguir a seguinte estrutura:

### 1. Layout em Grid (2 Colunas)

```css
.import-steps {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  margin-top: var(--space-4);
  align-items: start;
}
```

- **Desktop**: 2 colunas lado a lado
- **Mobile (< 1200px)**: 1 coluna (empilhado)

### 2. Cards de Passo

Cada passo deve estar dentro de um `.step-card`:

```html
<div class="step-card">
  <h2 class="step-title">
    <span class="step-number">1</span>
    Título do Passo
  </h2>
  <p class="step-description">
    Descrição do passo...
  </p>
  <!-- Conteúdo do passo -->
</div>
```

### 3. Elementos Padrão

#### Títulos
- Usar `.step-title` com número do passo em `.step-number`
- Número com gradiente azul (primary-500/600)
- Tamanho: `var(--text-base)`

#### Descrições
- Usar `.step-description`
- Cor: `var(--gray-600)`
- Tamanho: `var(--text-xs)`
- Line-height: 1.5

#### Botões de Download
- Classe: `.download-template-btn`
- Largura: 100%
- Cor: Gradiente verde (emerald-500/600)
- Padding: `var(--space-3) var(--space-4)`

#### Tabelas de Campos
- Classe: `.fields-table`
- Wrapper: `.fields-table-wrapper` (para scroll)
- Altura máxima: 350px com scroll
- Cabeçalho sticky

#### Formulários
- Classe: `.form-group` para cada campo
- Labels: `var(--text-xs)`, cor `var(--gray-700)`
- Inputs/Selects: `var(--text-xs)`, padding `var(--space-2) var(--space-3)`

### 4. Espaçamentos

- Gap entre cards: `var(--space-5)`
- Padding dos cards: `var(--space-4)`
- Margem entre elementos: `var(--space-3)`
- Margem inferior de grupos: `var(--space-3)`

### 5. Responsividade

```css
@media (max-width: 1200px) {
  .import-steps {
    grid-template-columns: 1fr;
  }
}
```

## Exemplo de Uso

Ver `importar-produtos.html` como referência completa.

## Notas Importantes

1. **Textos**: Sempre reescrever textos originais para evitar plágio, mantendo o significado
2. **Consistência**: Manter o mesmo padrão visual em todas as páginas de importação
3. **Acessibilidade**: Usar labels apropriados e estados de foco visíveis
4. **Performance**: Tabelas com scroll para não ocupar muito espaço vertical

