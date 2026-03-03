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
*Esta secção usará as regras do Next.js (Server/Client, hidratação) e erros do Tailwind para listar anomalias.*
## Fase 4: Lógica de Negócio, Notificações e Logs
*Esta secção analisará os ficheiros de log e o fluxo de notificações à procura de exceções silenciosas.*



Avança para a Fase 2 da auditoria. MODO READ-ONLY: NÃO alteres código.
Faz um scan cruzado entre o backend (api/src/routes e api/src/schemas) e o frontend (web/src/services e web/src/hooks/queries). Procura por:

    Endpoints que o frontend chama, mas que não existem ou mudaram de URL na API.

    Mismatches de tipagem (ex: o frontend envia userId, mas o Zod da API exige utilizadorId).

    Parâmetros em falta nos Axios interceptors.
    Documenta cada anomalia encontrada como uma micro-tarefa [ ] no ficheiro relatorio-auditoria.md sob a 'Fase 2'. Atualiza o Markdown e faz commit