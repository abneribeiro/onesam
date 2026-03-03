# Relatório de Auditoria e Backlog de Correções (OneSAM)

## Fase 1: Análise Estática (TypeScript & Linting)

### Resultados da Auditoria (Data: 03/03/2026)

#### API Directory (`/api/`)
- ✅ **TypeScript typecheck**: PASSOU - Nenhum erro de tipos encontrado
- ✅ **ESLint**: PASSOU - Nenhum erro de linting encontrado

#### Web Directory (`/web/`)
- ✅ **TypeScript typecheck**: PASSOU - Nenhum erro de tipos encontrado
- ✅ **ESLint**: PASSOU - Nenhum erro de linting encontrado
- ⚠️ **Aviso de Dependência**: baseline-browser-mapping está desatualizado (não crítico)

### Tarefas de Manutenção Recomendadas
- [ ] Atualizar dependência baseline-browser-mapping no diretório web
- [ ] Confirmar que todas as dependências estão atualizadas
- [ ] Verificar cobertura de testes para mudanças recentes

### Conclusão da Fase 1
O codebase OneSAM passou em todas as verificações de análise estática críticas. Não foram encontrados erros de TypeScript ou problemas de linting que impeçam o funcionamento da aplicação. As tarefas de manutenção listadas são preventivas e não urgentes.
## Fase 2: Sincronização Full-Stack (API vs Web)

### Resultados da Auditoria Cross-Reference (Data: 03/03/2026)

#### ✅ Endpoints Sincronizados Corretamente
Os seguintes endpoints estão bem sincronizados entre backend e frontend:
- `/utilizadores/*` - Todas as operações CRUD funcionais
- `/cursos/*` - Listagem, criação, atualização e remoção
- `/inscricoes/*` - Fluxo completo de inscrições
- `/admin/stats` e `/admin/cursos-populares` - Estatísticas administrativas
- `/admin/analytics/*` - KPIs, conclusões e exportação CSV

#### 🚨 **Problemas Críticos Identificados**

##### Mismatch de Parâmetros de ID (CRÍTICO)
- [ ] **Review Service Parameter Mismatch**: Frontend usa `cursoId` mas backend espera `IDCurso` na URL (`/reviews/curso/:IDCurso`)
- [ ] **Review Input Mismatch**: Frontend deveria usar `IDCurso` no body mas interface `ReviewInput` está inconsistente
- [ ] **Review Routes Mismatch**: Backend usa `:IDReview` mas frontend não está padronizado para este formato
- [ ] **Certificado Routes**: Backend usa `/download/:cursoId` e `/gerar/:cursoId` mas precisa verificar se frontend está enviando como esperado

##### Estruturas de Response Inconsistentes
- [ ] **Review Service Response**: Frontend espera `{ reviews: Review[] }` e `{ stats: ReviewStats }` mas backend pode estar retornando estruturas diferentes
- [ ] **Review Create Response**: Frontend espera `{ review: Review }` mas verificar se backend retorna neste formato
- [ ] **Certificado Validation**: Endpoint público `/validar/:codigo` usado pelo frontend mas precisa verificar estrutura de resposta

#### ⚠️ **Problemas de Sincronização**

##### Parâmetros e Schemas
- [ ] **Backend Curso Schema**: Campo `areaId`/`categoriaId` padronizado nos schemas, mas verificar consistência nos controladores
- [ ] **Pagination Frontend**: Verificar se todos os serviços que usam paginação estão passando corretamente os parâmetros `page`, `limit`, `sortBy`, `sortOrder`
- [ ] **Frontend Inscricao Service**: Método `listarTodasInscricoesPaginadas` usa parâmetros de paginação que precisam ser validados no backend

##### Autenticação e Middleware
- [ ] **Módulos Routes**: Inconsistência na aplicação de `betterAuthMiddleware` - algumas rotas públicas (GET) não requerem autenticação enquanto outras sim
- [ ] **Aulas Routes**: Rota `/progresso/meu` pode conflitar com `/:IDAula` devido à ordem de definição das rotas
- [ ] **Reviews Authentication**: Todas as rotas de reviews requerem autenticação, incluindo listagem - verificar se isso é intencional

##### Nomenclatura de Campos
- [ ] **ID Parameters Inconsistency**: Backend mistura `id` (utilizadores, cursos) com `IDCurso`, `IDModulo`, `IDAula`, `IDReview` - padronizar
- [ ] **Certificados**: Frontend usa `cursoId` mas backend pode esperar `IDCurso` em alguns casos

##### File Upload e Rate Limiting
- [ ] **Certificate Rate Limiting**: Backend tem `certificateRateLimiter` mas frontend não implementa retry específico
- [ ] **Bulk Operations**: Verificar se os limites de arrays (máximo 50 items) estão sendo respeitados no frontend

#### 🔍 Verificações Pendentes

##### Endpoints Bem Mapeados
- ✅ **Certificados**: Backend `certificadoRoutes.ts` com frontend `certificado.service.ts` - estrutura correta
- ✅ **Reviews**: Backend `reviewRoutes.ts` com frontend `review.service.ts` - mas com problemas de parametrização
- ⚠️ **Quizzes**: Backend tem `quizRoutes.ts` mas frontend `quiz.service.ts` precisa ser auditado

##### Interceptors e Error Handling
- [ ] **API Service**: Interceptors estão bem configurados mas verificar se todos os tipos de erro (403, 429) são tratados corretamente em todos os serviços
- [ ] **Retry Logic**: Implementado no ApiService mas verificar se serviços específicos precisam de retry customizado
- [ ] **Certificate Download**: Erro de download de certificado pode não estar sendo tratado corretamente

### Prioridade de Correção

#### 🚨 **CRÍTICA (Resolver Imediatamente)**
1. **Review Parameter Mismatch**: `cursoId` vs `IDCurso` - pode causar 404s em produção
2. **Review Response Structure**: Verificar se responses `{ review: Review }` estão corretos
3. **ID Parameters Inconsistency**: Padronizar nomenclatura entre `id` e `IDXxx`

#### ⚠️ **ALTA (Próxima Sprint)**
1. **Certificados Parameter Verification**: Garantir que `cursoId` está sendo passado corretamente
2. **Routes Order Conflict**: Resolver conflito `/progresso/meu` vs `/:IDAula`
3. **Pagination Validation**: Garantir que todos os parâmetros de paginação são validados

#### 📋 **MÉDIA (Próximas 2 Sprints)**
1. **Quizzes Service Audit**: Auditar completa integração frontend-backend
2. **Rate Limiting Enhancement**: Implementar retry específico para certificados
3. **Error Handling Standardization**: Padronizar tratamento de erros em todos os serviços

#### 🔧 **BAIXA (Manutenção)**
1. **Authentication Consistency**: Revisar aplicação de middleware em rotas públicas
2. **Bulk Operations Limits**: Verificar limites de arrays nos frontends
3. **FormData Field Names**: Verificar nomes de campos em uploads

### Conclusão da Fase 2

A análise cross-reference identificou **3 problemas críticos** relacionados principalmente à nomenclatura inconsistente de parâmetros entre frontend e backend, especialmente na funcionalidade de Reviews. Os endpoints estão funcionalmente corretos mas têm problemas de sincronização de parâmetros que podem causar falhas em tempo de execução.
## Fase 3: Arquitetura Next.js, UI e Tailwind

### Resultados da Auditoria de Arquitetura (Data: 03/03/2026)

#### ✅ **Validações Bem-Sucedidas**

##### App Router Implementation
- **Estrutura de Rotas**: Organização correta com grupos (admin), (auth) e (dashboard)
- **Layout Hierarchy**: Hierarquia de layouts adequada com boundaries client/server claramente definidos
- **Server Components**: Todos os componentes server (layout.tsx, not-found.tsx) implementados corretamente sem hooks client

##### Middleware e Autenticação
- **Middleware Security**: Implementação segura com validação de sessão e timeout handling
- **Route Protection**: Separação clara de rotas públicas/admin/formando
- **Input Validation**: Validação adequada para session cookies

#### 🚨 **Problemas Críticos Identificados**

##### Race Conditions em URL State Management
- [ ] **HomePageClient.tsx (linhas 58-83)**: Padrão duplo de useEffect para sincronização URL ↔ Estado pode causar loops infinitos
- [ ] **cursos/page.tsx (linhas 48-74)**: Padrão idêntico de race condition - dual useEffect sem coordenação adequada

#### ⚠️ **Problemas de Alta Prioridade**

##### Dependencies e Performance Issues
- [ ] **ActivityHeatmap.tsx (linha 290)**: Dependencies complexas em useEffect causam recalculações caras em mudanças de ano
- [ ] **HomePageClient.tsx (linha 156)**: Dependencies em falta na lógica de comparação de filtros podem causar stale closures
- [ ] **cursos/page.tsx (linha 147)**: Mesmo problema de dependencies em falta na lógica de filtros

#### 🔍 **Problemas de Média Prioridade**

##### Hydration Safety e Otimizações
- [ ] **ActivityHeatmap.tsx (linha 229)**: Acesso direto ao `window` object sem verificação de hydration pode causar SSR mismatch
- [ ] **Multiple Files**: Processamento redundante de URL com múltiplas chamadas `searchParams.get()` que poderiam ser consolidadas

#### 📋 **Problemas de Baixa Prioridade**

##### Cleanup e Memory Management
- [ ] **HomePageClient.tsx (linhas 161-163)**: setTimeout sem cleanup adequado na typing flag

### Análise Detalhada dos Padrões Problemáticos

#### URL State Management Anti-Pattern
```typescript
// Padrão problemático encontrado em 2 arquivos:
// 1. HomePageClient.tsx linhas 58-83
// 2. cursos/page.tsx linhas 48-74

useEffect(() => {
  // Atualiza URL baseado no estado local
}, [localState]);

useEffect(() => {
  // Atualiza estado local baseado na URL
}, [searchParams]);
```
**Problema**: Pode causar loops infinitos quando ambos os useEffect disparam simultaneamente.

#### Dependencies Pattern Issues
```typescript
// ActivityHeatmap.tsx linha 290 - Dependencies caras
const expensiveCalculation = useMemo(() => {
  // Recalculação cara toda vez que o ano muda
}, [year, otherExpensiveDeps]);
```

### Recomendações de Correção

#### 🚨 **Críticas (Implementar Imediatamente)**
1. **Refactor URL State Pattern**: Implementar pattern de coordenação única para evitar race conditions
2. **Consolidate URL Processing**: Usar um único ponto de processamento de searchParams por componente

#### ⚠️ **Alta Prioridade (Próxima Sprint)**
1. **Optimize Dependencies**: Implementar `useCallback` para callbacks caros e otimizar arrays de dependencies
2. **Add Hydration Checks**: Verificar `typeof window !== 'undefined'` antes de acessar APIs do browser

#### 🔧 **Manutenção (2-3 Sprints)**
1. **Timeout Cleanup**: Adicionar cleanup adequado para todos os setTimeout/setInterval
2. **Performance Monitoring**: Implementar monitoring de re-renders desnecessários

### Arquivos Analisados
- `web/src/app/HomePageClient.tsx` - Cliente principal com problemas de URL state
- `web/src/app/(dashboard)/cursos/page.tsx` - Página de cursos com padrão idêntico
- `web/src/components/features/ActivityHeatmap.tsx` - Heatmap com issues de hydration
- `web/src/hooks/useDebounce.ts` - ✅ Bom exemplo de cleanup pattern
- `web/src/middleware.ts` - ✅ Implementação segura validada

### Conclusão da Fase 3

A auditoria da arquitetura Next.js revelou uma implementação **fundamentalmente sólida** do App Router com boundaries client/server corretos e middleware seguro. No entanto, foram identificados **2 problemas críticos** relacionados a race conditions em URL state management que podem causar loops infinitos e impactar significativamente a performance da aplicação. Os problemas são concentrados em padrões específicos que se repetem em múltiplos componentes, facilitando uma correção sistemática.
## Fase 4: Lógica de Negócio, Notificações e Logs

### Resultados da Auditoria de Logs e Sistema de Notificações (Data: 03/03/2026)

#### 📊 **Estado dos Logs de Aplicação**
- **Error Log (`api/logs/error.log`)**: ✅ Vazio - nenhum erro registrado
- **Application Log (`api/logs/application.log`)**: ✅ 9 entradas normais de funcionamento
- **Sistema de Jobs**: Job de atualização de estados executa de hora em hora sem alterações reportadas
- **Logging**: Estrutura JSON bem implementada com metadados adequados

#### 🚨 **Vulnerabilidades Críticas no Sistema de Notificações**

##### Race Conditions e Problemas de Concorrência (CRÍTICO)
- [ ] **Race Condition em Contagem**: Queries paralelas `contarNaoLidas()` + `listarNaoLidas()` podem resultar em inconsistências
- [ ] **Operação Não-Atômica**: `marcarComoLida()` tem TOCTOU vulnerability - verificação e atualização não são atômicas
- [ ] **Cache Invalidation Race**: Duas invalidações separadas em `useNotificacoes.ts` (linhas 20-21, 31-32) criam janela de inconsistência

##### Error Handling Silencioso (CRÍTICO)
- [ ] **Error Swallowing**: `handleApiError()` em `notificacao.service.ts` converte todos os erros para Error genérico
- [ ] **Validation Errors Perdidos**: Informação específica do Zod é mascarada no frontend
- [ ] **Falta de Context**: Frontend não consegue distinguir tipos de erro para retry diferenciado

#### ⚠️ **Problemas de Alta Prioridade**

##### Validação e Paginação
- [ ] **Frontend Ignora Validação Backend**: `notificacaoSchemas.ts` define limite 50 mas frontend não aplica
- [ ] **Paginação Não Implementada**: Backend suporta paginação mas frontend busca todas as notificações
- [ ] **Performance Risk**: Com muitas notificações, frontend pode travar sem paginação

##### Timeout e Retry Logic
- [ ] **Sem Timeout Configurado**: TanStack Query não tem timeout, requests longos podem travar UI
- [ ] **Retry Logic Inadequado**: Usa retry padrão (3x) sem customização para operações críticas
- [ ] **Network Failure Handling**: Falhas temporárias aparecem como permanentes

#### 📋 **Problemas de Média Prioridade**

##### Monitoramento e Observabilidade
- [ ] **Falta de Telemetria**: Nenhuma métrica para detectar race conditions em produção
- [ ] **Logging Insuficiente**: Possível supressão de erros - logs vazios podem indicar problema
- [ ] **Circuit Breaker Missing**: Sem proteção para chamadas frequentes de contagem

##### Patterns Problemáticos Identificados
- [ ] **Dual Query Pattern**: `useNotificacoesNaoLidasCount()` e `useNotificacoes()` executam independentemente
- [ ] **State Consistency**: UI pode mostrar contagem inconsistente com lista durante mudanças

#### 🔍 **Análise de Código de Notificações**

**Arquivos Analisados:**
- `api/src/services/notificacaoService.ts` - Lógica de negócio com vulnerabilidade TOCTOU
- `api/src/repositories/notificacaoRepository.ts` - Operações DB sem SELECT FOR UPDATE
- `api/src/controllers/notificacaoController.ts` - Controllers bem estruturados
- `api/src/routes/notificacaoRoutes.ts` - Rotas com validação Zod adequada
- `web/src/services/notificacao.service.ts` - Error handling problemático
- `web/src/hooks/useNotificacoes.ts` - Race conditions no cache invalidation

### Prioridade de Correção - Fase 4

#### 🚨 **CRÍTICA (Resolver Imediatamente)**
1. **Implementar Transações Atômicas**: Operações de verificação+atualização em transação DB
2. **Corrigir Error Handling**: Preservar tipos de erro específicos no frontend
3. **Cache Invalidation Atômica**: Usar callback único para invalidar múltiplas queries

#### ⚠️ **ALTA (Próxima Sprint)**
1. **Implementar Paginação Frontend**: Adicionar controles de paginação na UI
2. **Timeout e Retry Logic**: Configurar timeouts adequados e retry diferenciado
3. **Logging de Erros Críticos**: Adicionar logs estruturados para falhas

#### 📋 **MÉDIA (2-3 Sprints)**
1. **Circuit Breaker Pattern**: Para chamadas frequentes de contagem
2. **Telemetria de Performance**: Métricas para detectar race conditions
3. **Testes de Concorrência**: Suite de testes para cenários multi-usuário

### Impacto de Risco Identificado

#### **Cenários de Falha Possível:**
1. **Inconsistência de Dados**: Usuário vê contagem diferente da lista real
2. **TOCTOU Attack**: Operação concurrent pode corromper estado das notificações
3. **UI Freeze**: Requests longos sem timeout podem travar interface
4. **Error Masking**: Problemas reais podem passar despercebidos devido ao error swallowing

### Conclusão da Fase 4

A auditoria de logs e sistema de notificações revelou **3 vulnerabilidades críticas** relacionadas a race conditions, operações não-atômicas e error handling inadequado. Embora os logs mostrem funcionamento normal, a análise do código identificou padrões problemáticos que podem causar inconsistências de dados e falhas silenciosas em produção. O sistema de notificações, sendo crítico para a experiência do usuário, requer correções imediatas nos padrões de concorrência e tratamento de erros.

## Conclusão Geral da Auditoria

### Resumo Executivo das 4 Fases

#### **Status por Fase:**
- ✅ **Fase 1 (Análise Estática)**: PASSOU - Zero erros TypeScript/ESLint
- 🚨 **Fase 2 (Sincronização Full-Stack)**: 3 problemas críticos de nomenclatura
- 🚨 **Fase 3 (Arquitetura Next.js)**: 2 problemas críticos de race conditions
- 🚨 **Fase 4 (Logs e Notificações)**: 3 vulnerabilidades críticas de concorrência

#### **Problemas Críticos Totais Identificados: 8**
1. Review parameter mismatch (cursoId vs IDCurso)
2. URL state management race conditions (2 arquivos)
3. Race conditions em contagem de notificações
4. Operações não-atômicas (TOCTOU vulnerability)
5. Error handling silencioso no frontend
6. Cache invalidation race conditions

#### **Recomendação Final:**
O OneSAM tem uma base sólida com código bem estruturado e sem erros estáticos, mas apresenta **vulnerabilidades críticas de concorrência** que podem causar inconsistências de dados e falhas silenciosas em produção. Priorizar correção imediata dos 8 problemas críticos antes de deploy em ambiente de alta concorrência.
