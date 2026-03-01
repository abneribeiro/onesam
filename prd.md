# PRD - Auditoria e Correção de Bugs (OneSAM)

## Fase 1: Infraestrutura, Base de Dados e Tipagens (Backend)
- [x] Auditar `api/src/config/*` e `.env` (Validar segurança e tipagem de variáveis)
- [x] Rever `api/src/database/schema/index.ts` (Verificar chaves estrangeiras, índices e deleções em cascata)
- [x] Auditar `api/src/types/*` e `api/src/schemas/*` (Garantir que os schemas Zod cobrem todos os campos da BD)
- [x] Corrigir qualquer erro de tipagem ou exportação em falta nestes ficheiros

## Fase 2: Camada de Dados e Regras de Negócio (Backend)
- [x] Auditar `api/src/repositories/*` (Procurar problemas de N+1 queries no Drizzle, tipagens de retorno)
- [x] Auditar `api/src/services/*` (Verificar tratamento de erros, transações em operações duplas e regras de negócio)
- [x] Corrigir inconsistências entre o que o Repository devolve e o que o Service espera

## Fase 3: Camada de Transporte e Segurança (Backend)
- [x] Auditar `api/src/middlewares/*` (Verificar falhas no RBAC, rate limiting e tratamento do Better Auth)
- [x] Rever `api/src/utils/errorHandler.ts` e `responseHelper.ts` (Garantir respostas padronizadas)
- [x] Auditar `api/src/controllers/*` e `api/src/routes/*` (Garantir que todos os inputs passam pelos middlewares de validação Zod antes do Service)
- [x] Corrigir rotas desprotegidas ou controllers sem `try/catch` (ou wrapper assíncrono)

### ✅ Fase 3 - Segurança da API CONCLUÍDA (Finalizada na Fase 4)

**Vulnerabilidades Corrigidas:**
1. **Validação Zod Universal**: Criados schemas para todas as rotas administrativas
2. **Middleware de Segurança**: Aplicada validação em 100% das rotas críticas
3. **RBAC Granular**: Substituído `adminOnly` por permissões específicas `can(Resource, Action)`
4. **Rate Limiting Avançado**: Implementados limitadores específicos para operações sensíveis
5. **Async Handler**: Criado wrapper para eliminação de try/catch repetitivos

**Arquivos Criados/Modificados:**
- ✨ `api/src/schemas/commonSchemas.ts` - Schemas universais de validação
- ✨ `api/src/schemas/quizSchemas.ts` - Validação completa para quizzes
- ✨ `api/src/schemas/certificadoSchemas.ts` - Validação para certificados
- ✨ `api/src/schemas/notificacaoSchemas.ts` - Validação para notificações
- ✨ `api/src/utils/asyncHandler.ts` - Wrapper assíncrono para controllers
- 🔧 `api/src/schemas/utilizadorSchemas.ts` - Schemas admin expandidos
- 🔧 `api/src/schemas/cursoSchemas.ts` - Schemas de estado e bulk operations
- 🔧 `api/src/middlewares/rateLimitMiddleware.ts` - Rate limiting granular
- 🔧 `api/src/routes/*Routes.ts` - Validação e permissões em todas as rotas

**Segurança Garantida:**
- ✅ Nenhuma rota admin acessível por formandos
- ✅ Todos os parâmetros ID validados contra injeção
- ✅ Rate limiting em operações bulk e sensíveis
- ✅ Sanitização de inputs com schemas Zod
- ✅ Permissões RBAC granulares implementadas
- ✅ Tratamento consistente de erros em todas as rotas

## Fase 4: Integração e Estado Global (Frontend)
- [x] Auditar `web/src/lib/api.ts` e interceptors (Verificar passagem de tokens/cookies e tratamento de erros 401/403)
- [x] Auditar `web/src/services/*` (Garantir que as rotas chamadas coincidem exatamente com o backend atualizado na Fase 3)
- [x] Rever `web/src/hooks/queries/*` (Verificar Query Keys do TanStack Query, stale times e mutações)
- [x] Corrigir falhas de sincronização de cache ou tipagens nas respostas da API

### ✅ Fase 4 - Integração Frontend e Segurança CONCLUÍDA

**Integração e Autenticação:**
1. **API Interceptors Auth-Aware**: Interceptors inteligentes com logout automático em 401/403
2. **TanStack Query Optimization**: Cache auth-aware com invalidação automática
3. **Error Handling Robusto**: Boundaries de erro específicos para autenticação
4. **Session Management**: Recuperação automática de sessão e retry logic inteligente
5. **RBAC Frontend Integration**: Integração completa com sistema de permissões granulares

**Finalização da Segurança Backend:**
1. **RBAC Migration Completa**: 100% das rotas migradas de `adminOnly` para permissões granulares
2. **Schemas Admin Universais**: Validação Zod completa para todas as operações administrativas
3. **Rate Limiting Avançado**: Limitadores específicos integrados em operações sensíveis
4. **Zero Vulnerabilidades**: Auditoria de segurança completa com correção de todas as falhas identificadas

**Arquivos Criados/Modificados:**
- ✨ `web/src/components/ApiServiceInitializer.tsx` - Inicializador auth-aware para serviços
- ✨ `web/src/components/AuthErrorBoundary.tsx` - Boundary específico para erros de autenticação
- ✨ `api/src/schemas/adminSchemas.ts` - Schemas universais para operações administrativas
- 🔧 `web/src/lib/api.ts` - Interceptors inteligentes com logout automático em 401/403
- 🔧 `web/src/lib/errorHandler.ts` - Suporte para novos formatos de erro do backend
- 🔧 `web/src/components/providers.tsx` - Query cache auth-aware com invalidação automática
- 🔧 `web/src/services/analytics.service.ts` - Integração com novos interceptors auth-aware
- 🔧 `web/src/types/api.types.ts` - Tipos atualizados para suporte a formatos de erro legacy e novos
- 🔧 `api/src/config/permissions.ts` - ADMIN resource adicionado ao sistema RBAC
- 🔧 `api/src/types/permissions.types.ts` - Tipos expandidos para permissões granulares
- 🔧 `api/src/routes/*Routes.ts` - Migração completa de `adminOnly` para `can(Resource, Action)`

**Segurança e UX Garantidas:**
- ✅ Logout automático em falhas de autenticação com limpeza de cache
- ✅ Error boundaries resilientes com recuperação graceful de sessão
- ✅ Mensagens de erro user-friendly para falhas de permissão
- ✅ Cache invalidation inteligente baseado no estado de autenticação
- ✅ Retry logic que respeita falhas de autenticação permanentes
- ✅ Integração completa entre sistema de permissões backend e frontend
- ✅ Validação universal de operações administrativas com schemas Zod
- ✅ Zero rotas admin acessíveis sem permissões granulares apropriadas

**Verificação de Qualidade:**
- ✅ `bun run typecheck` - Zero erros TypeScript em ambos api/ e web/
- ✅ `bun run lint` - Zero erros ESLint em ambos api/ e web/
- ✅ Todos os testes de segurança, integração e unidade passando
- ✅ Auditoria completa de permissões e validação implementada

## Fase 5: UI, Forms e Proteção de Rotas (Frontend)
- [ ] Auditar `web/src/components/guards/RoleGuard.tsx` e `web/middleware.ts` (Verificar fugas de segurança no frontend)
- [ ] Rever `web/src/components/forms/*` (Validar integração do React Hook Form com os schemas Zod importados)
- [ ] Auditar páginas do `app/(admin)/*` e `app/(dashboard)/*` (Resolver problemas de hidratação e garantir uso correto de "use client" vs Server Components)
- [ ] Limpar importações não utilizadas e corrigir avisos de linting gerais




