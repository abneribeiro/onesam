# PRD - Migração Cloud (Koyeb + Vercel + Supabase)

## Status da Implementação
**Última atualização:** 01/03/2026
**Estado geral:** 🟡 Preparação completa, pronto para deploy

---

## Fase 1: Setup de Dados e Storage (Supabase)
- [ ] ⚠️ **Pendente**: Extrair `DATABASE_URL` (Connection String) do painel do Supabase
- [ ] ⚠️ **Pendente**: Extrair `SUPABASE_URL` e `SUPABASE_ANON_KEY` das definições de API do Supabase
- [ ] ⚠️ **Pendente**: Criar buckets no Supabase Storage para recursos do LMS (ex: `avatars`, `aulas`)
- [ ] ⚠️ **Pendente**: Configurar políticas de acesso (Storage Policies) para leitura pública nos buckets
- [ ] ⚠️ **Pendente**: Configurar o `.env` de produção localmente e correr `bun run db:migrate` para preparar a BD remota
- [ ] ⚠️ **Pendente**: Correr `bun run seed` para popular a BD do Supabase com os dados base (admin, categorias)

> **Nota**: A configuração de ambiente já suporta Supabase (`environment.ts` validado). Comandos de migração (`bun run db:migrate`) e seed (`bun run seed`) estão implementados e prontos.

## Fase 2: Preparação do Backend (Koyeb) ✅ **COMPLETA**
- [x] ✅ **Implementado**: Criar `api/Dockerfile` otimizado para Bun (baseado em `oven/bun:1`)
  - Multi-stage build com imagem slim para produção
  - Security: non-root user, health check, produção otimizada
- [x] ✅ **Implementado**: Criar `api/.dockerignore` (ignorar `node_modules`, `logs`, `.env`)
  - Configuração completa para deploy cloud
- [x] ✅ **Implementado**: Atualizar `api/package.json` com script `start` correto
  - Script aponta para `"bun run dist/app.js"`
- [x] ✅ **Implementado**: `api/src/config/environment.ts` com validação robusta
  - Validação Zod para todas variáveis de ambiente
  - Logs detalhados de configuração
- [x] ✅ **Implementado**: CORS configurado dinamicamente em `api/src/app.ts`
  - Suporte para múltiplas origens via `ALLOWED_ORIGINS`
  - Configuração automática para desenvolvimento e produção
- [x] ✅ **Implementado**: Better Auth com `trustProxy: true` em `api/src/lib/auth.ts`
  - Configurado para deployment em cloud (Koyeb)
- [x] ✅ **Implementado**: Código commitado e disponível no repositório

## Fase 3: Preparação do Frontend (Vercel) ✅ **COMPLETA**
- [x] ✅ **Implementado**: `web/src/lib/api.ts` usa dinamicamente `NEXT_PUBLIC_API_URL`
  - Configuração flexível para desenvolvimento e produção
- [x] ✅ **Validado**: Build sem erros de tipagem (`bun run build` passou)
  - ✓ Compilado com sucesso
  - ✓ TypeScript validado
  - ✓ 21 páginas geradas
- [x] ✅ **Implementado**: Sistema de configuração de ambiente robusto
  - `web/src/config/environment.ts` com validação Zod
  - Separação clara entre cliente e servidor

## Fase 4: Orquestração Final (Deploy) ❌ **PENDENTE**
- [ ] ❌ **Pendente**: Configurar serviço na Koyeb apontando para `/api`
- [ ] ❌ **Pendente**: Injetar variáveis de ambiente na Koyeb:
  - `DATABASE_URL` (do Supabase)
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
  - `BETTER_AUTH_SECRET` (gerar novo)
  - `BETTER_AUTH_URL` (será URL da Koyeb)
  - `FRONTEND_URL` (será URL da Vercel)
  - `NODE_ENV=production`
- [ ] ❌ **Pendente**: Confirmar deploy na Koyeb e obter URL público
- [ ] ❌ **Pendente**: Criar projeto na Vercel apontando para `/web`
- [ ] ❌ **Pendente**: Injetar variáveis de ambiente na Vercel:
  - `NEXT_PUBLIC_API_URL` (URL da Koyeb + /api)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] ❌ **Pendente**: Atualizar CORS e Trusted Origins com domínios de produção

---

## Checklist Final para Deploy

### Pré-requisitos ✅
- [x] ✅ Dockerfile e .dockerignore criados
- [x] ✅ Scripts de build e start configurados
- [x] ✅ Configuração de ambiente validada
- [x] ✅ CORS e Better Auth preparados para produção
- [x] ✅ Frontend compilando sem erros
- [x] ✅ API service configurado dinamicamente

### Próximos Passos
1. **Configurar Supabase** (extrair credenciais, criar buckets)
2. **Deploy Backend** (Koyeb + configurar env vars)
3. **Deploy Frontend** (Vercel + configurar env vars)
4. **Atualizar configurações** (CORS + Trusted Origins com URLs finais)

### Observações Importantes
- ⚠️ **Segurança**: Gerar novo `BETTER_AUTH_SECRET` para produção
- ⚠️ **Database**: Executar migrações na base de dados Supabase antes do primeiro deploy
- ⚠️ **Storage**: Configurar buckets e políticas de storage antes de usar uploads
- ✅ **Performance**: Configuração otimizada para produção (Dockerfile multi-stage)
- ✅ **Monitoring**: Health check endpoint implementado (`/api/health`)
