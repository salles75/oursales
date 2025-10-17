# Painel Master Admin - OurSales

## Visão Geral

O **Painel Master Admin** é o cérebro central do sistema OurSales, projetado exclusivamente para o proprietário do sistema. Este painel oferece controle total sobre todas as instâncias, clientes e configurações globais do sistema multi-tenant.

## Arquitetura Multi-Tenant

### Conceito

- **OurSales**: Plataforma SaaS onde cada cliente tem sua própria instância
- **Master Admin**: Controle centralizado de todas as instâncias
- **Clientes**: Empresas que compram e usam o sistema
- **Instâncias**: Ambientes isolados para cada cliente

### Fluxo de Negócio

1. Cliente se cadastra no OurSales
2. Sistema cria uma instância exclusiva (ex: `cliente.oursales.com`)
3. Cliente acessa sua instância personalizada
4. Master Admin monitora e gerencia todas as instâncias

## Funcionalidades do Painel Master

### 🏠 Dashboard Master

- **Métricas Globais**: Total de clientes, instâncias ativas, receita mensal
- **Status do Sistema**: Monitoramento em tempo real de todas as instâncias
- **Atividades Recentes**: Log de ações importantes do sistema

### 👥 Controle Global

#### Gerenciar Clientes

- **Listar Todos os Clientes**: Visualização completa com filtros
- **Criar Novo Cliente**: Cadastro com geração automática de subdomínio
- **Editar Clientes**: Modificar informações, planos e status
- **Acessar Instâncias**: Acesso direto às instâncias dos clientes
- **Suspender/Ativar**: Controle total sobre o status dos clientes

#### Instâncias Ativas

- **Monitoramento**: Status, CPU, memória de cada instância
- **Ações em Massa**: Reiniciar, backup, atualização em lote
- **Controle Individual**: Ações específicas por instância
- **Manutenção**: Modo manutenção para atualizações

#### Faturamento

- **Receita Mensal**: Controle financeiro completo
- **Configurar Planos**: Definir preços dos planos (Básico, Profissional, Empresarial, Enterprise)
- **Faturas Pendentes**: Gerenciar cobranças e pagamentos
- **Relatórios Financeiros**: Análise de receita e crescimento

#### Suporte & Tickets

- **Central de Suporte**: Todos os tickets de todos os clientes
- **Estatísticas**: Tempo médio de resposta, satisfação
- **Atendimento Unificado**: Suporte centralizado

### ⚙️ Configurações Globais

#### Template Padrão

- **Aparência Base**: Configurações que se aplicam a todas as instâncias
- **Logo e Cores**: Identidade visual padrão
- **Personalização**: CSS e JavaScript globais

#### Configurações Base

- **Informações da Empresa**: Dados da OurSales
- **Configurações Operacionais**: Fuso horário, moeda, idioma
- **Políticas**: Regras que se aplicam globalmente

#### Fluxos Padrão

- **Processos de Vendas**: Configurações base para todos os clientes
- **Comissões**: Estrutura padrão de comissões
- **Aprovações**: Fluxos de aprovação padrão

#### Configurações Financeiras

- **Impostos**: Configurações fiscais padrão
- **Formas de Pagamento**: Opções disponíveis globalmente
- **Políticas de Cobrança**: Regras de faturamento

### 📊 Dados & Estrutura

#### Padrões de Tabelas

- **Templates de Importação**: Estruturas padrão para importação de dados
- **Validações**: Regras que se aplicam a todas as instâncias
- **Flexibilidade**: Cada cliente pode personalizar seus padrões

#### Importação de Dados

- **Templates Globais**: Padrões disponíveis para todos os clientes
- **Validação Centralizada**: Controle de qualidade dos dados
- **Exportação**: Backup e migração de dados

#### Backup & Restauração

- **Backup Global**: Backup de todas as instâncias
- **Restauração Seletiva**: Restaurar instâncias específicas
- **Versionamento**: Controle de versões dos backups

### 🔧 Sistema

#### Logs do Sistema

- **Logs Centralizados**: Todos os logs de todas as instâncias
- **Filtros Avançados**: Busca por cliente, data, tipo de erro
- **Monitoramento**: Alertas e notificações automáticas

#### Usuários & Permissões

- **Usuários Master**: Administradores do sistema OurSales
- **Permissões Granulares**: Controle fino de acesso
- **Auditoria**: Log de todas as ações administrativas

#### Segurança

- **Autenticação**: JWT com Redis para cache
- **Autorização**: Controle de acesso baseado em roles
- **Auditoria**: Log completo de ações administrativas
- **Backup de Segurança**: Criptografia e proteção de dados

## Estrutura de Dados

### Modelos Principais

#### Cliente

```prisma
model Cliente {
  id          String   @id @default(uuid())
  nome        String
  email       String
  cnpj        String?
  plano       String   // basico, profissional, empresarial, enterprise
  status      String   // ativo, suspenso, cancelado, trial
  subdomain   String   @unique
  url         String
  instancia   Instancia?
  faturas     Fatura[]
  usuarios    Usuario[]
}
```

#### Instância

```prisma
model Instancia {
  id            String   @id @default(uuid())
  clienteId     String   @unique
  url           String
  status        String   // ativo, parado, manutencao, reiniciando
  recursos      String   // JSON com CPU, memoria, armazenamento
  ultimaAtividade DateTime?
  cliente       Cliente  @relation(fields: [clienteId], references: [id])
}
```

#### Fatura

```prisma
model Fatura {
  id              String   @id @default(uuid())
  clienteId       String
  valor           Decimal
  plano           String
  dataVencimento  DateTime
  dataPagamento   DateTime?
  status          String   // pendente, pago, vencido, cancelado
  cliente         Cliente  @relation(fields: [clienteId], references: [id])
}
```

## API Endpoints

### Controle Global

- `GET /api/admin/clients` - Listar todos os clientes
- `POST /api/admin/clients` - Criar novo cliente
- `GET /api/admin/instances` - Listar todas as instâncias
- `POST /api/admin/instances/:id/action` - Executar ação na instância
- `GET /api/admin/stats` - Estatísticas globais

### Configurações

- `GET /api/admin/config` - Obter configurações globais
- `PUT /api/admin/config` - Atualizar configurações globais
- `POST /api/admin/upload` - Upload de arquivos globais

### Padrões e Dados

- `GET /api/admin/patterns` - Listar padrões de tabelas
- `POST /api/admin/patterns` - Criar novo padrão
- `POST /api/admin/patterns/import` - Importar padrões
- `GET /api/admin/patterns/export` - Exportar padrões

### Sistema

- `GET /api/admin/logs` - Logs do sistema
- `POST /api/admin/backup` - Criar backup
- `POST /api/admin/restore` - Restaurar backup

## Segurança

### Autenticação

- **JWT Tokens**: Autenticação baseada em tokens
- **Redis Cache**: Cache de sessões e dados de usuário
- **Refresh Tokens**: Renovação automática de tokens

### Autorização

- **Role-Based Access**: Controle baseado em papéis
- **Admin Only**: Acesso exclusivo para administradores
- **Audit Trail**: Log completo de todas as ações

### Proteção de Dados

- **Criptografia**: Dados sensíveis criptografados
- **Backup Seguro**: Backups criptografados
- **Isolamento**: Dados de clientes isolados por instância

## Monitoramento

### Métricas

- **Performance**: Tempo de resposta das instâncias
- **Uso de Recursos**: CPU, memória, armazenamento
- **Disponibilidade**: Uptime de cada instância
- **Crescimento**: Novos clientes e receita

### Alertas

- **Instâncias Offline**: Notificação imediata
- **Recursos Críticos**: Alertas de uso alto
- **Erros do Sistema**: Notificação de falhas
- **Faturas Vencidas**: Alertas financeiros

## Escalabilidade

### Arquitetura

- **Microserviços**: Componentes independentes
- **Load Balancer**: Distribuição de carga
- **Database Sharding**: Distribuição de dados
- **CDN**: Distribuição de conteúdo estático

### Recursos

- **Auto-scaling**: Escalamento automático
- **Resource Pooling**: Compartilhamento de recursos
- **Backup Automático**: Backups programados
- **Disaster Recovery**: Recuperação de desastres

## Roadmap

### Fase 1 - MVP ✅

- [x] Painel Master básico
- [x] Gerenciamento de clientes
- [x] Monitoramento de instâncias
- [x] Configurações globais

### Fase 2 - Avançado

- [ ] Analytics avançados
- [ ] API para integrações
- [ ] Marketplace de plugins
- [ ] White-label completo

### Fase 3 - Enterprise

- [ ] Multi-região
- [ ] Compliance (LGPD, SOX)
- [ ] SLA avançados
- [ ] Suporte 24/7

## Conclusão

O Painel Master Admin é o coração do sistema OurSales, oferecendo controle total e visibilidade completa sobre todas as operações. Com esta ferramenta, o proprietário pode:

- **Escalar o negócio** com controle total
- **Monitorar performance** de todas as instâncias
- **Gerenciar receita** de forma centralizada
- **Oferecer suporte** unificado
- **Configurar padrões** globais
- **Garantir segurança** e compliance

Este painel transforma o OurSales em uma plataforma SaaS robusta e escalável, pronta para atender centenas ou milhares de clientes de forma eficiente e segura.
