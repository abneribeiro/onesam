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

### ✅ Fase 3 - Segurança da API CONCLUÍDA

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
- [ ] Auditar `web/src/lib/api.ts` e interceptors (Verificar passagem de tokens/cookies e tratamento de erros 401/403)
- [ ] Auditar `web/src/services/*` (Garantir que as rotas chamadas coincidem exatamente com o backend atualizado na Fase 3)
- [ ] Rever `web/src/hooks/queries/*` (Verificar Query Keys do TanStack Query, stale times e mutações)
- [ ] Corrigir falhas de sincronização de cache ou tipagens nas respostas da API

## Fase 5: UI, Forms e Proteção de Rotas (Frontend)
- [ ] Auditar `web/src/components/guards/RoleGuard.tsx` e `web/middleware.ts` (Verificar fugas de segurança no frontend)
- [ ] Rever `web/src/components/forms/*` (Validar integração do React Hook Form com os schemas Zod importados)
- [ ] Auditar páginas do `app/(admin)/*` e `app/(dashboard)/*` (Resolver problemas de hidratação e garantir uso correto de "use client" vs Server Components)
- [ ] Limpar importações não utilizadas e corrigir avisos de linting gerais




