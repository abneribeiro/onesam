# PRD - Auditoria e Correção de Bugs (OneSAM)

## Fase 1: Infraestrutura, Base de Dados e Tipagens (Backend)
- [ ] Auditar `api/src/config/*` e `.env` (Validar segurança e tipagem de variáveis)
- [ ] Rever `api/src/database/schema/index.ts` (Verificar chaves estrangeiras, índices e deleções em cascata)
- [ ] Auditar `api/src/types/*` e `api/src/schemas/*` (Garantir que os schemas Zod cobrem todos os campos da BD)
- [ ] Corrigir qualquer erro de tipagem ou exportação em falta nestes ficheiros

## Fase 2: Camada de Dados e Regras de Negócio (Backend)
- [ ] Auditar `api/src/repositories/*` (Procurar problemas de N+1 queries no Drizzle, tipagens de retorno)
- [ ] Auditar `api/src/services/*` (Verificar tratamento de erros, transações em operações duplas e regras de negócio)
- [ ] Corrigir inconsistências entre o que o Repository devolve e o que o Service espera

## Fase 3: Camada de Transporte e Segurança (Backend)
- [ ] Auditar `api/src/middlewares/*` (Verificar falhas no RBAC, rate limiting e tratamento do Better Auth)
- [ ] Rever `api/src/utils/errorHandler.ts` e `responseHelper.ts` (Garantir respostas padronizadas)
- [ ] Auditar `api/src/controllers/*` e `api/src/routes/*` (Garantir que todos os inputs passam pelos middlewares de validação Zod antes do Service)
- [ ] Corrigir rotas desprotegidas ou controllers sem `try/catch` (ou wrapper assíncrono)

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


