# ✅ Checklist de Produção - OurSales

## 🔒 Segurança

- [ ] **Alterar JWT_SECRET** para um valor forte e único
- [ ] **Alterar senhas do banco** (DATABASE_URL no .env e docker-compose.yml)
- [ ] **Alterar senha do PgAdmin** (docker-compose.yml)
- [ ] **Configurar CORS** com domínios específicos (sem wildcards)
- [ ] **Habilitar HTTPS** via proxy reverso ou load balancer
- [ ] **Configurar firewall** para portas necessárias apenas
- [ ] **Remover ou proteger** endpoints de desenvolvimento (PgAdmin, Redis Commander)
- [ ] **Revisar permissões** de arquivos e diretórios
- [ ] **Implementar SSL/TLS** no PostgreSQL
- [ ] **Configurar backup criptografado**

## 🗄️ Banco de Dados

- [ ] **Ajustar connection pool** conforme carga esperada
- [ ] **Configurar backups automáticos** (diários + incrementais)
- [ ] **Testar restauração** de backups
- [ ] **Configurar replicação** (read replicas) se necessário
- [ ] **Ajustar parâmetros** do PostgreSQL para produção
- [ ] **Habilitar logs de queries lentas** (> 1s)
- [ ] **Configurar particionamento** de tabelas grandes
- [ ] **Verificar índices** em todas as queries frequentes
- [ ] **Implementar archiving** de dados antigos
- [ ] **Documentar estratégia** de disaster recovery

## ⚡ Performance

- [ ] **Configurar CDN** para arquivos estáticos
- [ ] **Habilitar compressão** gzip/brotli no Nginx
- [ ] **Configurar cache headers** apropriados
- [ ] **Ajustar tamanho** do Redis conforme necessário
- [ ] **Configurar rate limiting** por perfil de usuário
- [ ] **Implementar paginação** em todas as listagens
- [ ] **Otimizar queries** N+1 com includes estratégicos
- [ ] **Configurar keep-alive** no Nginx
- [ ] **Habilitar HTTP/2** no Nginx
- [ ] **Minificar e comprimir** assets frontend

## 📊 Monitoramento

- [ ] **Configurar APM** (Application Performance Monitoring)
- [ ] **Implementar alertas** para erros críticos
- [ ] **Configurar monitoramento** de recursos (CPU, RAM, Disco)
- [ ] **Monitorar latência** de requisições (p50, p95, p99)
- [ ] **Configurar health checks** externos (uptime monitoring)
- [ ] **Implementar logging centralizado** (ELK, Grafana Loki)
- [ ] **Configurar métricas** de negócio (vendas, conversões)
- [ ] **Monitorar tamanho** do banco de dados
- [ ] **Alertas de espaço** em disco
- [ ] **Dashboard executivo** com métricas principais

## 🐳 Docker & Infraestrutura

- [ ] **Usar imagens oficiais** e versionadas (não usar :latest)
- [ ] **Configurar health checks** em todos os services
- [ ] **Limitar recursos** (CPU e memória) por container
- [ ] **Configurar restart policies** apropriados
- [ ] **Separar networks** (frontend, backend, database)
- [ ] **Usar secrets** do Docker para dados sensíveis
- [ ] **Configurar logging driver** (json-file com rotação)
- [ ] **Implementar blue-green** ou rolling deployments
- [ ] **Configurar auto-scaling** se usando orquestrador (K8s)
- [ ] **Documentar topologia** da infraestrutura

## 🔐 Compliance & Auditoria

- [ ] **LGPD/GDPR**: Implementar políticas de privacidade
- [ ] **Auditoria**: Verificar logs de todas operações críticas
- [ ] **Retenção de dados**: Definir e implementar políticas
- [ ] **Anonimização**: Dados sensíveis em logs e relatórios
- [ ] **Consentimento**: Sistema de opt-in/opt-out
- [ ] **Direito ao esquecimento**: Funcionalidade de deletar dados
- [ ] **Criptografia**: Dados sensíveis em repouso
- [ ] **Backup compliance**: Backups seguem regulamentações
- [ ] **Documentação**: Processos de segurança documentados
- [ ] **Treinamento**: Equipe treinada em práticas seguras

## 🚀 Deploy & CI/CD

- [ ] **Configurar CI/CD** pipeline
- [ ] **Testes automatizados** (unitários, integração, e2e)
- [ ] **Linting** automatizado no CI
- [ ] **Vulnerability scanning** de dependências
- [ ] **Container scanning** para vulnerabilidades
- [ ] **Testes de carga** antes de deploy
- [ ] **Estratégia de rollback** documentada e testada
- [ ] **Versionamento semântico** de releases
- [ ] **Changelog** mantido atualizado
- [ ] **Deploy tags** no Git para cada release

## 📝 Documentação

- [ ] **API documentation** (Swagger/OpenAPI)
- [ ] **Runbooks** para operações comuns
- [ ] **Disaster recovery** procedures
- [ ] **Onboarding** guide para novos desenvolvedores
- [ ] **Architecture decision records** (ADRs)
- [ ] **Diagramas** de arquitetura atualizados
- [ ] **Contatos** de emergência documentados
- [ ] **SLAs** definidos e documentados
- [ ] **Changelog** público para usuários
- [ ] **Release notes** para cada versão

## 🧪 Testes

- [ ] **Cobertura de testes** > 80%
- [ ] **Testes de integração** com banco real
- [ ] **Testes de carga** (stress testing)
- [ ] **Testes de segurança** (penetration testing)
- [ ] **Testes de failover** (chaos engineering)
- [ ] **Testes de backup/restore**
- [ ] **Testes de migração** de dados
- [ ] **Testes de performance** (benchmarks)
- [ ] **Testes de usabilidade**
- [ ] **Testes de acessibilidade** (WCAG)

## 📧 Notificações & Comunicação

- [ ] **Email transacional** configurado
- [ ] **Templates de email** profissionais
- [ ] **Notificações push** (se aplicável)
- [ ] **Webhooks** para integrações
- [ ] **Logs de envio** de emails/notificações
- [ ] **Rate limiting** de envios
- [ ] **Opt-out** de notificações
- [ ] **Status page** para incidentes
- [ ] **Canal de suporte** definido
- [ ] **FAQ** e knowledge base

## 💰 Custos & Capacidade

- [ ] **Estimar custos** mensais de infraestrutura
- [ ] **Planejar capacidade** para crescimento esperado
- [ ] **Configurar alertas** de custos
- [ ] **Otimizar recursos** não utilizados
- [ ] **Reserved instances** para economia (cloud)
- [ ] **Auto-scaling policies** baseadas em métricas
- [ ] **Data lifecycle** policies para reduzir custos
- [ ] **Monitorar custos** por serviço/recurso
- [ ] **Budget** anual definido
- [ ] **ROI tracking** do sistema

## 🔄 Manutenção

- [ ] **Janela de manutenção** definida e comunicada
- [ ] **Processo de atualização** documentado
- [ ] **Atualização de dependências** agendada
- [ ] **Rotação de logs** configurada
- [ ] **Limpeza de dados** antigos automatizada
- [ ] **Vacuum/Analyze** do PostgreSQL agendado
- [ ] **Renovação de certificados** SSL automatizada
- [ ] **Revisão de segurança** trimestral
- [ ] **Performance review** mensal
- [ ] **Retrospectivas** de incidentes

## ✅ Go-Live

- [ ] **Smoke tests** em produção
- [ ] **Verificar todas as integrações** externas
- [ ] **DNS configurado** corretamente
- [ ] **Email de boas-vindas** enviado
- [ ] **Monitoramento ativo** e alertas funcionando
- [ ] **Equipe de plantão** escalada
- [ ] **Comunicação** aos usuários sobre go-live
- [ ] **Rollback plan** pronto
- [ ] **Feature flags** configuradas
- [ ] **Celebrar!** 🎉

---

## 📌 Notas Importantes

### Variáveis de Ambiente Críticas

```env
# Produção - ALTERAR OBRIGATORIAMENTE
JWT_SECRET="[Gere com: openssl rand -base64 32]"
DATABASE_URL="postgresql://user:SENHA_FORTE@host:5432/db"
DB_PASSWORD="[Senha forte com 20+ caracteres]"

# CORS - Domínios específicos
CORS_ORIGIN="https://seudominio.com,https://www.seudominio.com"

# Email
SMTP_HOST="smtp.seuservidor.com"
SMTP_PORT="587"
SMTP_USER="noreply@seudominio.com"
SMTP_PASS="[Senha do SMTP]"
```

### Comandos Úteis de Produção

```bash
# Backup
docker-compose exec postgres pg_dump -U oursales_user oursales > backup.sql

# Restore
docker-compose exec -T postgres psql -U oursales_user oursales < backup.sql

# Logs em tempo real
docker-compose logs -f api

# Verificar saúde
curl https://seudominio.com/health

# Restart graceful
docker-compose restart api

# Deploy
make deploy
```

### Contatos de Emergência

- **DevOps**: [contato]
- **DBA**: [contato]
- **Segurança**: [contato]
- **Suporte**: [contato]

### SLA Targets

- **Uptime**: 99.9% (43.2 min downtime/mês)
- **Latência**: < 200ms (p95)
- **Taxa de erro**: < 0.1%
- **Backup**: RPO 1h, RTO 4h

---

**Última revisão**: 08/10/2025  
**Próxima revisão**: [Data]  
**Responsável**: [Nome]
