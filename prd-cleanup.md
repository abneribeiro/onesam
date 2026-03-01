# PRD - Auditoria Final: Limpeza, Sincronização e Documentação (OneSAM)

## Fase 1: Limpeza de Código e Padrões Profissionais (Global) ✅ CONCLUÍDA
- [x] Procurar e REMOVER todos os emojis (`🚀`, `✨`, `🐛`, etc.) de ficheiros de código, comentários e mensagens de erro (tanto no `api/` como no `web/`).
- [x] Procurar e APAGAR comentários conversacionais, óbvios ou desnecessários (ex: `// Esta função faz o login`, `// TODO`, `// Here is the implementation`). Manter apenas comentários de lógica complexa de negócio.
- [x] Identificar e remover "Dead Code" (variáveis declaradas mas nunca usadas, imports não utilizados, ficheiros soltos sem referências).

## Fase 2: Eliminação de Redundâncias e DRY (Frontend & Backend) ✅ CONCLUÍDA
- [x] Auditar `web/src/utils/` e `api/src/utils/`. Identificar funções duplicadas (ex: formatação de datas, sanitização) e consolidar.
- [x] Auditar `web/src/components/features/` e `web/src/components/ui/`. Garantir que não existem componentes "custom" que reinventem a roda de componentes já existentes do Shadcn UI.
- [x] Verificar ficheiros de Tipos (`types/`). Eliminar tipos redundantes e usar Inferência do Zod (`z.infer`) sempre que um schema Zod já exista para aquela entidade.

## Fase 3: Sincronização Cliente/Servidor (Full Stack) ✅ CONCLUÍDA
- [x] Mapear todas as rotas registadas em `api/src/routes/` e comparar com as chamadas feitas em `web/src/services/`.
- [x] Garantir que o frontend não está a chamar endpoints que já não existem ou cujos métodos/URLs mudaram (ex: rotas que passaram de `adminOnly` para RBAC).
- [x] Validar que os payloads (dados enviados no body) pelo frontend nos formulários (`web/src/components/forms/`) correspondem exatamente aos schemas Zod exigidos pela API em `api/src/schemas/`.

## Fase 4: Atualização da Documentação da API (Backend) ✅ CONCLUÍDA
- [x] Auditar a geração do Swagger/OpenAPI e do Scalar em `api/src/docs/` ou onde estiver configurado.
- [x] Garantir que TODAS as rotas atuais (incluindo Quizzes, Certificados, Analytics, etc.) estão corretamente documentadas com as respetivas tags.
- [x] Atualizar a documentação para refletir os novos schemas Zod de validação (exigências de body, query params, etc.).
- [x] Validar que os requisitos de segurança (ex: uso de cookies de sessão do Better Auth ou Bearer tokens) estão devidamente explicados nos endpoints da documentação.

## Fase 5: Validação Final de Qualidade (Linting & Typechecking) ✅ CONCLUÍDA
- [x] Correr `bun run typecheck` na pasta `api/`. Corrigir autonomamente qualquer erro do TypeScript (sem usar `any` como fuga).
- [x] Correr `bun run typecheck` na pasta `web/`. Corrigir autonomamente qualquer erro do TypeScript.
- [x] Correr `bun run lint:fix` na pasta `api/` para formatação final.
- [x] Correr `bun run lint:fix` na pasta `web/` para formatação final.
- [x] Confirmar que o terminal devolve "Exit code 0" (Verde) para todos os testes.