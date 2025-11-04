# 🔧 Painel Administrativo - OurSales

## 🚀 Visão Geral

O Painel Administrativo é uma interface completa e poderosa para gerenciar todas as configurações do sistema OurSales. Desenvolvido especificamente para administradores e donos do sistema, oferece controle total sobre a aparência, funcionalidades e dados do sistema.

## ✨ Funcionalidades Principais

### 🎨 Personalização Completa

- **Logo e Favicon**: Upload e gerenciamento de imagens
- **Cores do Sistema**: Personalização completa do tema
- **Título e Descrição**: Configuração de textos do site
- **Aparência**: Controle total sobre a interface

### 📊 Padrões de Tabelas

- **Criação de Padrões**: Defina estruturas de dados personalizadas
- **Importação/Exportação**: Gerencie padrões em lote
- **Validação**: Sistema inteligente de verificação
- **Tipos Suportados**: Produtos, Clientes, Transportadoras, Indústrias, Orçamentos, Pedidos

### 🔐 Segurança Avançada

- **Configurações de Sessão**: Timeout e tentativas de login
- **Logs de Auditoria**: Rastreamento completo de ações
- **HTTPS**: Configuração de segurança para produção
- **Autenticação**: Sistema robusto de permissões

### 📧 Notificações

- **SMTP Configurável**: Integração com qualquer provedor de email
- **Notificações Automáticas**: Sistema de alertas personalizável
- **Configuração Flexível**: Suporte a múltiplos servidores

### 💾 Backup e Restauração

- **Backup Completo**: Todos os dados do sistema
- **Backup Administrativo**: Apenas configurações
- **Restauração Segura**: Processo validado e protegido
- **Download Automático**: Arquivos JSON para backup

### 📋 Monitoramento

- **Logs em Tempo Real**: Visualização de atividades do sistema
- **Filtros Avançados**: Por nível, data e usuário
- **Interface Intuitiva**: Logs coloridos e organizados

## 🛠️ Como Usar

### 1. Acesso ao Painel

```
1. Faça login como administrador
2. Clique no botão "🔧 Admin" na navegação
3. O painel será carregado automaticamente
```

### 2. Configurações Básicas

```
1. Vá para "⚙️ Configurações"
2. Personalize título, cores e descrição
3. Faça upload da logo e favicon
4. Clique em "Salvar" para aplicar
```

### 3. Padrões de Tabelas

```
1. Acesse "📊 Padrões de Tabelas"
2. Clique em "➕ Criar Novo Padrão"
3. Preencha nome, tipo e colunas
4. Salve o padrão
```

### 4. Importação Rápida

```
1. Vá para "📥 Importação"
2. Cole o JSON ou selecione arquivo
3. Clique em "Importar Padrões"
4. Confirme a importação
```

## 📁 Estrutura de Arquivos

```
frontend/
├── admin.html                 # Interface principal
├── assets/js/
│   ├── admin.js              # Lógica do painel
│   └── admin-api.js          # Integração com API
└── docs/
    ├── PAINEL_ADMINISTRATIVO.md
    └── exemplos-padroes-tabelas.json

backend/
├── src/
│   ├── controllers/
│   │   └── admin.controller.js
│   ├── routes/
│   │   └── admin.routes.js
│   └── middlewares/
│       └── auth.js
└── prisma/
    └── schema.prisma
```

## 🔧 Configuração Técnica

### Requisitos

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Instalação

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
# Abrir admin.html no navegador
```

### Variáveis de Ambiente

```env
# Backend
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
JWT_SECRET="seu-jwt-secret"
NODE_ENV="development"

# Frontend
API_BASE_URL="http://localhost:3000/api"
```

## 📊 Exemplo de Padrão de Tabela

```json
{
  "nome": "Produtos Básicos",
  "tipo": "produtos",
  "colunas": ["codigo", "nome", "descricao", "preco", "estoque", "ativo"],
  "descricao": "Padrão básico para produtos",
  "ativo": true
}
```

## 🔒 Segurança

### Autenticação

- Token JWT com expiração configurável
- Middleware de verificação automática
- Sessões seguras com timeout

### Autorização

- Acesso restrito a administradores
- Verificação de permissões em todas as rotas
- Logs de auditoria completos

### Validação

- Sanitização de inputs
- Validação de arquivos upload
- Verificação de estrutura JSON

## 🚨 Troubleshooting

### Problemas Comuns

#### Erro de Autenticação

```
Solução: Verifique se está logado como admin
- Faça logout e login novamente
- Verifique se o token JWT é válido
- Confirme permissões de administrador
```

#### Upload de Arquivos Falha

```
Solução: Verifique configurações
- Tamanho máximo: 5MB
- Formatos: PNG, JPG, SVG, ICO
- Permissões de escrita no servidor
```

#### Padrões Não Carregam

```
Solução: Verifique conexão
- Backend rodando na porta 3000
- Conexão com banco de dados
- Logs do navegador (F12)
```

## 📈 Monitoramento

### Logs do Sistema

- **INFO**: Operações normais
- **WARN**: Situações de atenção
- **ERROR**: Erros que requerem ação

### Métricas

- Uso de memória
- Tempo de resposta
- Erros por minuto
- Usuários ativos

## 🔄 Backup e Restauração

### Backup Automático

```bash
# Criar backup completo
POST /api/admin/backup

# Download automático do arquivo JSON
```

### Restauração

```bash
# Upload do arquivo de backup
# Validação automática
# Confirmação de segurança
```

## 🎯 Próximas Funcionalidades

- [ ] Dashboard de métricas em tempo real
- [ ] Configuração de temas pré-definidos
- [ ] Backup automático agendado
- [ ] Notificações push
- [ ] Integração com serviços externos
- [ ] API para terceiros

## 📞 Suporte

Para suporte técnico:

1. Consulte a documentação completa
2. Verifique os logs do sistema
3. Entre em contato com a equipe de desenvolvimento

## 📄 Licença

Este projeto é propriedade do OurSales e está protegido por direitos autorais.

---

**Desenvolvido com ❤️ para o OurSales**

