Perfeitamente entendido! Vamos juntar as duas coisas: o planeamento rigoroso e o código exato.

A melhor forma de garantires que o Claude Code não "inventa" configurações e usa **exatamente** os ficheiros que desenhámos para a nuvem (Koyeb + Supabase + Upstash), é colocar o próprio código dentro do PRD. Assim, o Claude apenas copia e aplica.

Aqui tens o **PRD definitivo** e os **4 Prompts atualizados** para dares ao Claude Code.

### Passo 1: Atualiza o teu ficheiro `prd-ambiente.md`

Substitui o conteúdo do teu ficheiro `prd-ambiente.md` por este bloco de texto:

```markdown
# PRD - Validação de Ambiente e Preparação para Deploy (OneSAM)

## Fase 1: Infraestrutura Local (Apenas Desenvolvimento)
- [x] Auditar `docker-compose.yml` na raiz (Garantir que PostgreSQL, Redis e MinIO têm volumes locais configurados para persistência).
- [x] Confirmar que o `docker-compose.yml` NÃO tem configurações de produção (é estritamente para o ambiente de dev local).
- [x] Verificar se as credenciais base locais (postgres/minio) e portas estão mapeadas corretamente.

## Fase 2: Limpeza e Criação do Dockerfile de Produção (Backend)
- [x] Procurar e APAGAR qualquer `Dockerfile`, `docker-compose.prod.yml` ou ficheiro `.dockerignore` que esteja na raiz do projeto ou na pasta `web/`.
- [x] Criar o ficheiro `api/.dockerignore` EXATAMENTE com este conteúdo:
```text
node_modules
dist
logs
.env
.env.*
*.log
npm-debug.log*
.git
.DS_Store

```

* [x] Criar o ficheiro `api/Dockerfile` EXATAMENTE com este conteúdo (Multi-stage build para a Koyeb):

```dockerfile
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["bun", "run", "dist/app.js"]

```

## Fase 3: Segurança e Variáveis de Ambiente (Supabase + Upstash)

* [ ] Atualizar `api/.env.example` EXATAMENTE com este template base (sem dados reais):

```env
NODE_ENV=production
PORT=3000
BASE_URL=[https://tua-api.koyeb.app](https://tua-api.koyeb.app)
FRONTEND_URL=[https://teu-frontend.vercel.app](https://teu-frontend.vercel.app)
DATABASE_URL=postgresql://utilizador:senha@host.supabase.com:6543/postgres
SUPABASE_URL=[https://xyz.supabase.co](https://xyz.supabase.co)
SUPABASE_SERVICE_KEY=your_service_key_here
SUPABASE_ANON_KEY=your_anon_key_here
REDIS_URL=rediss://default:senha@endpoint.upstash.io:6379
BETTER_AUTH_SECRET=your_auth_secret_here

```

* [ ] Atualizar `web/.env.local.example` EXATAMENTE com este template base:

```env
NEXT_PUBLIC_API_URL=[https://tua-api.koyeb.app](https://tua-api.koyeb.app)
NEXT_PUBLIC_APP_URL=[https://teu-frontend.vercel.app](https://teu-frontend.vercel.app)

```

* [ ] Fazer scan ao código e garantir que não ficaram JWT secrets ou chaves de DB reais esquecidas em nenhum ficheiro `.example` ou de configuração.

## Fase 4: Resiliência da Base de Dados e Seeds

* [ ] Validar a configuração do `api/drizzle.config.ts`.
* [ ] Verificar os ficheiros em `api/src/database/seeds/*` para garantir que a ordem de inserção respeita as chaves estrangeiras.
* [ ] Confirmar que não existem conflitos ou migrações pendentes no schema atual.

```