# Painel Administrativo - OurSales

## Visão Geral

O Painel Administrativo é uma interface completa para gerenciar configurações globais do sistema OurSales. Ele permite que administradores personalizem a aparência do site, gerenciem padrões de tabelas, façam backup dos dados e monitorem o sistema.

## Funcionalidades Principais

### 🔧 Configurações do Sistema

#### Aparência

- **Título do Site**: Personalizar o título exibido no navegador
- **Descrição**: Modificar a descrição do sistema
- **Cores**: Definir cores primária e secundária do tema
- **Logo**: Upload e gerenciamento da logo principal
- **Favicon**: Upload e gerenciamento do ícone do site

#### Segurança

- **Timeout de Sessão**: Definir tempo limite para sessões inativas
- **Tentativas de Login**: Configurar número máximo de tentativas
- **HTTPS**: Exigir conexão segura em produção
- **Log de Auditoria**: Habilitar/desabilitar logs de segurança

#### Notificações

- **Email**: Configurar servidor SMTP para notificações
- **Servidor SMTP**: Host, porta, usuário e senha
- **Notificações por Email**: Habilitar/desabilitar envio

### 📊 Padrões de Tabelas

#### Gerenciamento de Padrões

- **Criar Padrões**: Definir estruturas de dados para diferentes tipos de tabelas
- **Editar Padrões**: Modificar padrões existentes
- **Excluir Padrões**: Remover padrões não utilizados
- **Ativar/Desativar**: Controlar quais padrões estão ativos

#### Tipos de Tabela Suportados

- Produtos
- Clientes
- Transportadoras
- Indústrias
- Orçamentos
- Pedidos

#### Importação/Exportação

- **Importar JSON**: Carregar padrões a partir de arquivo JSON
- **Exportar JSON**: Salvar padrões em arquivo para backup
- **Validação**: Verificação automática de integridade dos dados

### 📥 Importação de Dados

#### Formatos Suportados

- **JSON**: Arquivos estruturados com padrões de tabelas
- **Validação**: Verificação de formato e integridade
- **Preview**: Visualização antes da importação

### 💾 Backup e Restauração

#### Backup

- **Backup Completo**: Inclui todos os dados do sistema
- **Backup Administrativo**: Apenas configurações e padrões
- **Download Automático**: Arquivo JSON para download

#### Restauração

- **Upload de Arquivo**: Restaurar a partir de backup
- **Validação**: Verificação de integridade do backup
- **Confirmação**: Proteção contra restauração acidental

### 📋 Logs do Sistema

#### Visualização

- **Filtros**: Por nível (INFO, WARN, ERROR) e data
- **Formatação**: Logs coloridos por nível de severidade
- **Detalhes**: Usuário, IP e timestamp para cada entrada

#### Níveis de Log

- **INFO**: Informações gerais do sistema
- **WARN**: Avisos e situações de atenção
- **ERROR**: Erros que requerem intervenção

## Estrutura Técnica

### Frontend

#### Arquivos Principais

- `admin.html`: Interface principal do painel
- `assets/js/admin.js`: Lógica do painel administrativo
- `assets/js/admin-api.js`: Integração com API backend

#### Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização moderna com gradientes
- **JavaScript ES6+**: Funcionalidades interativas
- **Fetch API**: Comunicação com backend

### Backend

#### Controladores

- `admin.controller.js`: Lógica de negócio administrativa
- `admin.routes.js`: Definição de rotas da API

#### Modelos de Dados

- `Configuracao`: Configurações do sistema
- `Arquivo`: Gerenciamento de uploads
- `PadraoTabela`: Padrões de estrutura de dados

#### Endpoints da API

##### Configurações

```
GET    /api/admin/config              # Obter configurações
PUT    /api/admin/config              # Atualizar configurações
```

##### Arquivos

```
POST   /api/admin/upload              # Upload de arquivos
GET    /api/admin/files/:tipo         # Listar arquivos por tipo
```

##### Padrões de Tabela

```
POST   /api/admin/patterns            # Criar padrão
GET    /api/admin/patterns            # Listar padrões
PUT    /api/admin/patterns/:id        # Atualizar padrão
DELETE /api/admin/patterns/:id        # Excluir padrão
POST   /api/admin/patterns/import     # Importar padrões
GET    /api/admin/patterns/export     # Exportar padrões
```

##### Logs e Backup

```
GET    /api/admin/logs                # Obter logs
POST   /api/admin/backup              # Criar backup
```

## Segurança

### Autenticação

- **Token JWT**: Autenticação baseada em tokens
- **Middleware**: Verificação automática de permissões
- **Sessão**: Controle de timeout e renovação

### Autorização

- **Perfil Admin**: Acesso restrito a administradores
- **Middleware**: Verificação de permissões em todas as rotas
- **Logs de Auditoria**: Registro de ações administrativas

### Validação

- **Input Sanitization**: Limpeza de dados de entrada
- **File Upload**: Validação de tipos e tamanhos
- **JSON Validation**: Verificação de estrutura de dados

## Como Usar

### Acesso ao Painel

1. Faça login como administrador
2. Clique no link "🔧 Admin" na navegação principal
3. O painel será carregado automaticamente

### Configurações Básicas

1. **Aparência**: Vá para a seção "Configurações"
2. **Logo**: Faça upload da logo na seção "Logo e Favicon"
3. **Cores**: Defina as cores do tema
4. **Salvar**: Clique em "Salvar" para aplicar as mudanças

### Padrões de Tabelas

1. **Criar**: Vá para "Padrões de Tabelas"
2. **Preencher**: Nome, tipo, colunas e descrição
3. **Salvar**: Clique em "Criar Padrão"
4. **Importar**: Use a seção "Importação" para carregar múltiplos padrões

### Backup

1. **Criar**: Vá para "Backup e Restauração"
2. **Download**: Clique em "Criar Backup"
3. **Restaurar**: Selecione arquivo e clique em "Restaurar Backup"

## Exemplo de Padrão de Tabela

```json
{
  "nome": "Produtos Básicos",
  "tipo": "produtos",
  "colunas": ["nome", "descricao", "preco", "categoria", "estoque", "ativo"],
  "descricao": "Padrão básico para cadastro de produtos",
  "ativo": true
}
```

## Troubleshooting

### Problemas Comuns

#### Erro de Autenticação

- Verifique se está logado como administrador
- Confirme se o token JWT é válido
- Recarregue a página e faça login novamente

#### Upload de Arquivos Falha

- Verifique o tamanho do arquivo (máximo 5MB)
- Confirme o formato (PNG, JPG, SVG para imagens)
- Verifique permissões de escrita no servidor

#### Padrões Não Carregam

- Verifique a conexão com o servidor
- Confirme se o backend está rodando
- Verifique os logs do navegador para erros

### Logs de Debug

- Abra o Console do Desenvolvedor (F12)
- Verifique mensagens de erro
- Confirme requisições de rede na aba Network

## Manutenção

### Atualizações

- Backup regular das configurações
- Teste de funcionalidades após atualizações
- Verificação de logs de erro

### Monitoramento

- Acompanhamento de logs do sistema
- Verificação de espaço em disco para uploads
- Monitoramento de performance da API

## Suporte

Para suporte técnico ou dúvidas sobre o painel administrativo:

1. Consulte os logs do sistema
2. Verifique a documentação da API
3. Entre em contato com a equipe de desenvolvimento
