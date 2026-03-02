<p align="center">
  <img src="docs/images/logo.png" alt="OneSAM Logo" width="200"/>
</p>

<h1 align="center">OneSAM - Plataforma de Formação</h1>

<p align="center">
  <strong>Sistema de Gestão de Aprendizagem Empresarial</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/versão-3.0.0-blue.svg" alt="Versão"/></a>
  <a href="#"><img src="https://img.shields.io/badge/licença-MIT-green.svg" alt="Licença"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js&logoColor=white" alt="Node.js"/></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Next.js-16-000000.svg?logo=next.js&logoColor=white" alt="Next.js"/></a>
  <a href="#"><img src="https://img.shields.io/badge/PostgreSQL-15+-4169E1.svg?logo=postgresql&logoColor=white" alt="PostgreSQL"/></a>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Express.js-5.1-000000.svg?logo=express&logoColor=white" alt="Express"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Drizzle_ORM-0.44-C5F74F.svg" alt="Drizzle"/></a>
  <a href="#"><img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4.svg?logo=tailwindcss&logoColor=white" alt="TailwindCSS"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Supabase-Enabled-3ECF8E.svg?logo=supabase&logoColor=white" alt="Supabase"/></a>
</p>

<p align="center">
  <a href="#-sobre-o-projeto">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-arquitetura">Arquitetura</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-instalação">Instalação</a> •
  <a href="#-documentação-da-api">API</a>
</p>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Screenshots](#-screenshots)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Stack Tecnológica](#-stack-tecnológica)
- [Sistema de Design](#-sistema-de-design)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Modelo de Dados](#-modelo-de-dados)
- [Documentação da API](#-documentação-da-api)
- [Autenticação e Autorização](#-autenticação-e-autorização)
- [Frontend](#-frontend)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **OneSAM** é uma plataforma de gestão de aprendizagem (LMS) empresarial desenvolvida para facilitar a formação profissional em organizações. O sistema permite a gestão completa do ciclo de vida de cursos, desde a criação até à certificação dos formandos.

### Objetivos Principais

- 📚 **Gestão de Cursos** - Criar, organizar e monitorizar cursos de formação
- 👥 **Gestão de Inscrições** - Controlar o processo de inscrição e aprovação
- 📊 **Acompanhamento de Progresso** - Monitorizar o progresso dos formandos
- 🏆 **Certificação** - Emitir certificados de conclusão
- 📈 **Analytics** - Dashboards com métricas e estatísticas

<p align="center">
  <img src="docs/images/dashboard-preview.png" alt="Dashboard Preview" width="800"/>
  <br/>
  <em>Painel de Controlo do Administrador</em>
</p>

---

## 📸 Screenshots

<details>
<summary><strong>📱 Ver Screenshots</strong></summary>

### Página Inicial
<p align="center">
  <img src="docs/images/homepage.png" alt="Página Inicial" width="800"/>
</p>

### Catálogo de Cursos
<p align="center">
  <img src="docs/images/catalog.png" alt="Catálogo de Cursos" width="800"/>
</p>

### Detalhe do Curso
<p align="center">
  <img src="docs/images/course-detail.png" alt="Detalhe do Curso" width="800"/>
</p>

### Visualizador de Conteúdo
<p align="center">
  <img src="docs/images/content-viewer.png" alt="Visualizador de Conteúdo" width="800"/>
</p>

### Dashboard do Formando
<p align="center">
  <img src="docs/images/student-dashboard.png" alt="Dashboard do Formando" width="800"/>
</p>

### Painel Administrativo
<p align="center">
  <img src="docs/images/admin-panel.png" alt="Painel Administrativo" width="800"/>
</p>

### Gestão de Inscrições
<p align="center">
  <img src="docs/images/enrollments.png" alt="Gestão de Inscrições" width="800"/>
</p>

### Sistema de Notificações
<p align="center">
  <img src="docs/images/notifications.png" alt="Notificações" width="800"/>
</p>

</details>

---

## ✨ Funcionalidades

### 👤 Para Formandos

| Funcionalidade | Descrição |
|----------------|-----------|
| 🔐 **Autenticação** | Registo, login e recuperação de palavra-passe |
| 📚 **Catálogo de Cursos** | Navegação e pesquisa de cursos disponíveis |
| 📝 **Inscrições** | Solicitar inscrição em cursos |
| 📖 **Conteúdo** | Aceder a aulas (vídeo, documentos, texto, quizzes) |
| 📊 **Progresso** | Acompanhar progresso nas aulas |
| ⭐ **Avaliações** | Avaliar cursos com estrelas e comentários |
| 🔔 **Notificações** | Receber alertas sobre inscrições e novidades |
| 👤 **Perfil** | Gerir dados pessoais e avatar |
| 📜 **Certificados** | Obter certificados de conclusão |

### 👑 Para Administradores

| Funcionalidade | Descrição |
|----------------|-----------|
| 📊 **Dashboard** | Visão geral com estatísticas e métricas |
| 📚 **Gestão de Cursos** | CRUD completo de cursos com imagens |
| 📁 **Módulos e Aulas** | Organizar conteúdo hierarquicamente |
| 🏷️ **Áreas e Categorias** | Classificar cursos por temas |
| 👥 **Gestão de Utilizadores** | Administrar contas e permissões |
| ✅ **Aprovação de Inscrições** | Aceitar ou rejeitar pedidos |
| 🔔 **Notificações em Massa** | Enviar comunicações aos formandos |
| 📈 **Relatórios** | Exportar dados e estatísticas |
| 🔍 **Auditoria** | Registar todas as ações no sistema |

### 🔄 Fluxos de Trabalho Automatizados

```mermaid
graph LR
    A[Curso Planeado] -->|Data Início| B[Curso em Andamento]
    B -->|Data Fim| C[Curso Terminado]
    C -->|Manual| D[Curso Arquivado]
```

---

## 🏗 Arquitetura do Sistema

### Visão Geral

O OneSAM segue uma **arquitetura em camadas** com separação clara de responsabilidades:

```mermaid
graph TD
    %% Definição de Estilos
    classDef box fill:#fff,stroke:#333,stroke-width:1px;
    classDef db fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;

    %% 1. HTTP Layer
    subgraph HTTP_Layer [HTTP Layer]
        direction LR
        CORS --> Logger --> Recovery --> AuthMid[Auth]
    end

    %% 2. Handler Layer
    subgraph Handler_Layer [Handler Layer]
        direction LR
        %% Usamos nós invisíveis (~~~) para alinhar lado a lado sem setas
        AuthH[Auth] ~~~ User ~~~ Equipment ~~~ Reservation ~~~ Notif
    end

    %% 3. Service Layer
    subgraph Service_Layer [Service Layer]
        SvcDesc["(Business Logic, Validation, Notifications)"]
    end

    %% 4. Repository Layer
    subgraph Repository_Layer [Repository Layer]
        RepoDesc["(Data Access, SQL Queries)"]
    end

    %% 5. Database
    DB[("PostgreSQL")]:::db

    %% Conexões entre as camadas
    %% Conectamos o final do HTTP ao meio dos Handlers para estética
    AuthMid --> Equipment
    
    %% Conectamos os Handlers ao Serviço
    User --> SvcDesc
    Equipment --> SvcDesc
    Reservation --> SvcDesc
    
    %% Resto do fluxo
    SvcDesc --> RepoDesc
    RepoDesc --> DB
```

### Padrão de Arquitectura Backend

```
Request → Route → Middleware → Controller → Service → Repository → Database
                      │
                      ▼
              Validation (Zod)
                      │
                      ▼
              Response Helper
```

### Diagrama de Componentes

```mermaid
graph TB
    subgraph Frontend["Frontend (Next.js)"]
        Pages[App Router Pages]
        Components[UI Components]
        Hooks[Query Hooks]
        Services[API Services]
        Context[Auth Context]
    end

    subgraph Backend["Backend (Express)"]
        Routes[API Routes]
        Middleware[Middlewares]
        Controllers[Controllers]
        BServices[Services]
        Repos[Repositories]
    end

    subgraph Database["Base de Dados"]
        PG[(PostgreSQL)]
        Storage[(Supabase Storage)]
    end

    Pages --> Components
    Components --> Hooks
    Hooks --> Services
    Services --> Routes
    Context --> Services

    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> BServices
    BServices --> Repos
    Repos --> PG
    BServices --> Storage
```

---

## 🛠 Stack Tecnológica

### Backend

| Categoria | Tecnologia | Versão | Descrição |
|-----------|------------|--------|-----------|
| **Framework** | Express.js | 5.1.0 | Framework web minimalista |
| **Runtime** | Node.js | 18+ | Ambiente de execução JavaScript |
| **Linguagem** | TypeScript | 5.9.3 | Tipagem estática para JavaScript |
| **ORM** | Drizzle ORM | 0.44.6 | ORM type-safe para PostgreSQL |
| **Base de Dados** | PostgreSQL | 15+ | Base de dados relacional |
| **Autenticação** | Better Auth | 1.2.9 | Sistema de autenticação completo |
| **Validação** | Zod | 4.1.12 | Validação de esquemas em runtime |
| **Logging** | Winston | 3.17.0 | Sistema de logs estruturado |
| **Upload** | Multer | 1.4.5 | Processamento de ficheiros |
| **Email** | Nodemailer | 7.0.10 | Envio de emails transacionais |
| **Storage** | Supabase | - | Armazenamento de ficheiros |
| **Segurança** | Helmet | 8.1.0 | Headers de segurança HTTP |
| **Testes** | Jest | 29.7.0 | Framework de testes |
| **CRON** | node-cron | 3.0.3 | Tarefas agendadas |

### Frontend

| Categoria | Tecnologia | Versão | Descrição |
|-----------|------------|--------|-----------|
| **Framework** | Next.js | 16.0.3 | Framework React full-stack |
| **Biblioteca UI** | React | 19.2.0 | Biblioteca de interfaces |
| **Componentes** | Radix UI | 1.x | Componentes acessíveis |
| **Styling** | TailwindCSS | 4 | Framework CSS utilitário |
| **Estado** | TanStack Query | 5.90.10 | Gestão de estado do servidor |
| **Formulários** | React Hook Form | 7.66.1 | Gestão de formulários |
| **HTTP** | Axios | 1.13.2 | Cliente HTTP |
| **Tabelas** | TanStack Table | 8.21.3 | Tabelas interactivas |
| **Ícones** | Lucide React | 0.554.0 | Biblioteca de ícones |
| **Vídeo** | react-player | 3.4.0 | Player de vídeo |
| **Datas** | date-fns | 4.1.0 | Utilitários de datas |
| **Temas** | next-themes | 0.4.6 | Gestão de temas |
| **Notificações** | Sonner | 2.0.7 | Toast notifications |

### Diagrama de Tecnologias

```
┌────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │  Next.js 16 │  │  React 19   │  │TailwindCSS 4│  │ Radix UI  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │TanStack Qry │  │  Hook Form  │  │    Zod      │  │   Axios   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘ │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │ Express 5   │  │ TypeScript  │  │ Better Auth │  │   Zod     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │ Drizzle ORM │  │   Winston   │  │   Multer    │  │  Helmet   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘ │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│                          INFRAESTRUTURA                             │
│  ┌────────────────────────┐  ┌─────────────────────────────────┐  │
│  │      PostgreSQL 15     │  │       Supabase Storage          │  │
│  │   (Base de Dados)      │  │    (Ficheiros / Imagens)        │  │
│  └────────────────────────┘  └─────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Sistema de Design

### Biblioteca de Componentes

O OneSAM utiliza uma biblioteca de componentes baseada em **Radix UI** com **shadcn/ui**, garantindo acessibilidade e consistência visual.

#### Componentes Disponíveis

<details>
<summary><strong>📦 Ver Lista Completa de Componentes</strong></summary>

| Categoria | Componentes |
|-----------|-------------|
| **Formulários** | Button, Input, Textarea, Select, Checkbox, Switch, Slider, Label |
| **Layout** | Card, Separator, ScrollArea, Sheet, Collapsible |
| **Navegação** | Tabs, Accordion, Breadcrumb, Sidebar, NavMain, NavUser |
| **Feedback** | Alert, AlertDialog, Badge, Dialog, Tooltip, Popover, Progress |
| **Dados** | DataTable, Pagination |
| **Menus** | DropdownMenu, ContextMenu |
| **Específicos** | CursoCard, StatusBadge, UserAvatar, StatsCard, ActivityHeatmap |

</details>

### Paleta de Cores

```css
/* Cores Principais */
--primary: #2563EB;        /* Azul Principal */
--primary-foreground: #FFFFFF;

/* Cores da Marca */
--brand-500: #3B82F6;
--brand-600: #2563EB;

/* Cores de Acento */
--accent-500: #8B5CF6;
--accent-600: #7C3AED;

/* Estados */
--success: #22C55E;        /* Verde - Sucesso */
--warning: #F59E0B;        /* Amarelo - Aviso */
--error-600: #DC2626;      /* Vermelho - Erro */
--info: #3B82F6;           /* Azul - Informação */

/* Neutras */
--background: #FFFFFF;
--foreground: #0F172A;
--muted: #F1F5F9;
--border: #E2E8F0;
```

### Tipografia

```css
/* Fonte Principal */
font-family: 'Geist', system-ui, sans-serif;

/* Escala de Tamanhos */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### Sistema de Espaçamento

```css
/* Escala de Espaçamento (TailwindCSS) */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-12: 3rem;    /* 48px */
```

### Componentes de UI

<p align="center">
  <img src="docs/images/ui-components.png" alt="UI Components" width="800"/>
  <br/>
  <em>Biblioteca de Componentes UI</em>
</p>

### Padrões de Formulários

<p align="center">
  <img src="docs/images/form-patterns.png" alt="Form Patterns" width="600"/>
  <br/>
  <em>Padrões de Formulários</em>
</p>

---

## 📁 Estrutura do Projeto

```
onesam/
├── 📁 api/                           # Backend (Express.js)
│   ├── 📁 src/
│   │   ├── 📄 app.ts                 # Configuração do Express
│   │   ├── 📁 config/                # Configurações
│   │   │   ├── 📄 permissions.ts     # Permissões RBAC
│   │   │   └── 📄 swagger.ts         # Documentação API
│   │   ├── 📁 controllers/           # Controladores
│   │   │   ├── 📄 cursoController.ts
│   │   │   ├── 📄 inscricaoController.ts
│   │   │   ├── 📄 utilizadorController.ts
│   │   │   └── 📄 ...
│   │   ├── 📁 database/
│   │   │   ├── 📄 db.ts              # Conexão à BD
│   │   │   ├── 📁 schema/            # Esquemas Drizzle
│   │   │   └── 📁 seeds/             # Dados de teste
│   │   ├── 📁 lib/
│   │   │   └── 📄 auth.ts            # Better Auth config
│   │   ├── 📁 middlewares/           # Middlewares
│   │   │   ├── 📄 betterAuthMiddleware.ts
│   │   │   ├── 📄 rbacMiddleware.ts
│   │   │   └── 📄 ...
│   │   ├── 📁 repositories/          # Camada de dados
│   │   ├── 📁 routes/                # Rotas da API
│   │   ├── 📁 schemas/               # Validação Zod
│   │   ├── 📁 services/              # Lógica de negócio
│   │   ├── 📁 types/                 # Tipos TypeScript
│   │   └── 📁 utils/                 # Utilitários
│   │       ├── 📄 errorHandler.ts
│   │       ├── 📄 logger.ts
│   │       └── 📄 responseHelper.ts
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   └── 📄 .env.example
│
├── 📁 web/                           # Frontend (Next.js)
│   ├── 📁 src/
│   │   ├── 📁 app/                   # App Router
│   │   │   ├── 📁 (admin)/           # Rotas admin
│   │   │   ├── 📁 (auth)/            # Rotas autenticação
│   │   │   ├── 📁 (dashboard)/       # Rotas dashboard
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 components/
│   │   │   ├── 📁 ui/                # Componentes base
│   │   │   ├── 📁 features/          # Componentes específicos
│   │   │   ├── 📁 forms/             # Formulários
│   │   │   └── 📁 guards/            # Guardas de autorização
│   │   ├── 📁 contexts/              # Contextos React
│   │   ├── 📁 hooks/
│   │   │   └── 📁 queries/           # React Query hooks
│   │   ├── 📁 lib/                   # Utilitários
│   │   ├── 📁 services/              # Serviços API
│   │   ├── 📁 styles/                # Estilos globais
│   │   └── 📁 types/                 # Tipos TypeScript
│   ├── 📄 package.json
│   ├── 📄 next.config.ts
│   └── 📄 tailwind.config.ts
│
├── 📁 docs/                          # Documentação
│   └── 📁 images/                    # Imagens da documentação
│
└── 📄 README.md                      # Este ficheiro
```

---

## 🗃 Modelo de Dados

### Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    UTILIZADORES ||--o| ADMINS : "tem"
    UTILIZADORES ||--o| FORMANDOS : "tem"
    UTILIZADORES ||--o{ INSCRICOES : "faz"
    UTILIZADORES ||--o{ NOTIFICACOES : "recebe"
    UTILIZADORES ||--o{ REVIEWS : "escreve"
    UTILIZADORES ||--o{ PROGRESSO_AULAS : "progride"

    AREAS ||--o{ CATEGORIAS : "contém"
    AREAS ||--o{ CURSOS : "classifica"
    CATEGORIAS ||--o{ CURSOS : "classifica"

    CURSOS ||--o{ INSCRICOES : "tem"
    CURSOS ||--o{ MODULOS : "contém"
    CURSOS ||--o{ REVIEWS : "recebe"

    MODULOS ||--o{ AULAS : "contém"
    AULAS ||--o{ PROGRESSO_AULAS : "rastreia"

    UTILIZADORES {
        uuid id PK
        string nome
        string email UK
        boolean emailVerified
        enum tipoPerfil
        string avatar
        boolean ativo
        timestamp dataCriacao
    }

    CURSOS {
        uuid id PK
        string nome
        text descricao
        string imagemCurso
        enum estado
        enum nivel
        date dataInicio
        date dataFim
        boolean visivel
        int limiteVagas
        int cargaHoraria
    }

    INSCRICOES {
        uuid id PK
        uuid cursoId FK
        uuid utilizadorId FK
        enum estado
        timestamp dataInscricao
    }

    MODULOS {
        uuid id PK
        uuid cursoId FK
        string titulo
        text descricao
        int ordem
    }

    AULAS {
        uuid id PK
        uuid moduloId FK
        string titulo
        enum tipo
        text conteudo
        string url
        int duracao
        int ordem
    }
```

### Tabelas Principais

<details>
<summary><strong>📊 Ver Detalhes das Tabelas</strong></summary>

#### Utilizadores
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| nome | VARCHAR(255) | Nome completo |
| email | VARCHAR(255) | Email único |
| emailVerified | BOOLEAN | Email verificado |
| tipoPerfil | ENUM | 'admin' ou 'formando' |
| avatar | VARCHAR(255) | URL do avatar |
| ativo | BOOLEAN | Estado da conta |

#### Cursos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| nome | VARCHAR(255) | Nome do curso |
| descricao | TEXT | Descrição detalhada |
| imagemCurso | VARCHAR(255) | URL da imagem |
| estado | ENUM | planeado, em_curso, terminado, arquivado |
| nivel | ENUM | iniciante, intermedio, avancado |
| dataInicio | DATE | Data de início |
| dataFim | DATE | Data de término |
| visivel | BOOLEAN | Visibilidade no catálogo |
| limiteVagas | INTEGER | Limite de inscrições |

#### Inscrições
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| cursoId | UUID (FK) | Referência ao curso |
| utilizadorId | UUID (FK) | Referência ao utilizador |
| estado | ENUM | pendente, aceite, rejeitada, cancelada |
| dataInscricao | TIMESTAMP | Data da inscrição |

#### Aulas
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| moduloId | UUID (FK) | Referência ao módulo |
| titulo | VARCHAR(255) | Título da aula |
| tipo | ENUM | video, documento, link, texto, quiz |
| conteudo | TEXT | Conteúdo (HTML/texto) |
| url | VARCHAR(255) | URL do recurso |
| duracao | INTEGER | Duração em minutos |
| ordem | INTEGER | Ordem de apresentação |

</details>

---

## 📡 Documentação da API

### Base URL

```
Desenvolvimento: http://localhost:3000/api
Produção: https://api.onesam.pt/api
```

### Documentação Interactiva

| Ferramenta | URL | Descrição |
|------------|-----|-----------|
| **Swagger UI** | `/api/docs` | Interface interactiva |
| **Scalar** | `/api/reference` | Referência moderna |
| **OpenAPI** | `/api/openapi.json` | Especificação JSON |

### Endpoints Principais

#### 🔐 Autenticação

```http
POST /api/auth/sign-up          # Registar novo utilizador
POST /api/auth/sign-in/email    # Login com email/password
POST /api/auth/sign-out         # Logout
GET  /api/auth/session          # Obter sessão atual
POST /api/auth/forget-password  # Recuperar password
POST /api/auth/reset-password   # Redefinir password
```

#### 📚 Cursos

```http
GET    /api/cursos              # Listar cursos (público)
GET    /api/cursos/:id          # Obter curso por ID
POST   /api/cursos              # Criar curso (admin)
PUT    /api/cursos/:id          # Atualizar curso (admin)
DELETE /api/cursos/:id          # Eliminar curso (admin)
PATCH  /api/cursos/:id/estado   # Alterar estado (admin)
```

#### 📝 Inscrições

```http
GET    /api/inscricoes                    # Listar inscrições
GET    /api/inscricoes/minhas             # Minhas inscrições
POST   /api/inscricoes                    # Criar inscrição
PUT    /api/inscricoes/:id                # Atualizar inscrição
PATCH  /api/inscricoes/:id/aprovar        # Aprovar (admin)
PATCH  /api/inscricoes/:id/rejeitar       # Rejeitar (admin)
DELETE /api/inscricoes/:id                # Cancelar inscrição
```

#### 📖 Conteúdo

```http
GET    /api/modulos/curso/:cursoId        # Módulos do curso
POST   /api/modulos                       # Criar módulo (admin)
PUT    /api/modulos/:id                   # Atualizar módulo (admin)
DELETE /api/modulos/:id                   # Eliminar módulo (admin)

GET    /api/aulas/modulo/:moduloId        # Aulas do módulo
POST   /api/aulas                         # Criar aula (admin)
PUT    /api/aulas/:id                     # Atualizar aula (admin)
DELETE /api/aulas/:id                     # Eliminar aula (admin)
```

#### 👤 Utilizadores

```http
GET    /api/utilizadores                  # Listar (admin)
GET    /api/utilizadores/:id              # Obter por ID
PUT    /api/utilizadores/:id              # Atualizar perfil
DELETE /api/utilizadores/:id              # Eliminar (admin)
```

### Formato de Resposta

#### Sucesso

```json
{
  "mensagem": "Operação realizada com sucesso",
  "dados": {
    "id": "uuid",
    "nome": "Exemplo"
  }
}
```

#### Erro

```json
{
  "erro": "Descrição do erro",
  "detalhes": ["Detalhe 1", "Detalhe 2"]
}
```

### Códigos de Estado

| Código | Significado |
|--------|-------------|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `204` | Sucesso sem conteúdo |
| `400` | Pedido inválido |
| `401` | Não autenticado |
| `403` | Não autorizado |
| `404` | Recurso não encontrado |
| `422` | Erro de validação |
| `429` | Demasiados pedidos |
| `500` | Erro interno |

### Exemplos de Pedidos

<details>
<summary><strong>📋 Ver Exemplos</strong></summary>

#### Criar Curso

```bash
curl -X POST http://localhost:3000/api/cursos \
  -H "Content-Type: multipart/form-data" \
  -H "Cookie: session=..." \
  -F "nome=Introdução ao TypeScript" \
  -F "descricao=Aprenda TypeScript do zero" \
  -F "IDArea=1" \
  -F "IDCategoria=1" \
  -F "nivel=iniciante" \
  -F "dataInicio=2024-02-01" \
  -F "dataFim=2024-03-01" \
  -F "imagem=@curso.jpg"
```

#### Listar Cursos com Filtros

```bash
curl "http://localhost:3000/api/cursos?estado=em_curso&nivel=iniciante&page=1&limit=10"
```

#### Criar Inscrição

```bash
curl -X POST http://localhost:3000/api/inscricoes \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"cursoId": "uuid-do-curso"}'
```

</details>

---

## 🔐 Autenticação e Autorização

### Sistema de Autenticação

O OneSAM utiliza o **Better Auth** para gestão de autenticação com as seguintes características:

- 🔒 **Sessões Seguras** - Tokens JWT com duração de 7 dias
- 🍪 **Cookies HTTP-Only** - Proteção contra XSS
- 🔄 **Cache de Sessão** - 1 hora para melhor performance
- ✉️ **Verificação de Email** - Suporte integrado
- 🔑 **Recuperação de Password** - Fluxo completo

### Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as Utilizador
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Login (email, password)
    F->>B: POST /api/auth/sign-in/email
    B->>D: Validar credenciais
    D-->>B: Utilizador encontrado
    B->>B: Criar sessão
    B-->>F: Set-Cookie: session=token
    F-->>U: Redirecionar para Dashboard
```

### Controlo de Acesso (RBAC)

#### Perfis de Utilizador

| Perfil | Descrição | Permissões |
|--------|-----------|------------|
| **admin** | Administrador do sistema | Acesso total |
| **formando** | Formando/Aluno | Acesso limitado |

#### Matriz de Permissões

| Recurso | Admin | Formando |
|---------|-------|----------|
| **Cursos** | Criar, Ler, Atualizar, Eliminar | Ler |
| **Inscrições** | Gerir todas, Aprovar, Rejeitar | Criar, Ler próprias |
| **Conteúdo** | CRUD completo | Ler (se inscrito) |
| **Utilizadores** | CRUD completo | Ler, Atualizar próprio |
| **Áreas/Categorias** | CRUD completo | Ler |
| **Notificações** | Criar, Gerir | Ler próprias |
| **Relatórios** | Exportar tudo | Exportar próprios |
| **Auditoria** | Ler, Exportar | - |

### Guardas de Rota (Frontend)

```typescript
// Proteção de rotas administrativas
<AdminGuard>
  <AdminDashboard />
</AdminGuard>

// Proteção de rotas autenticadas
<AuthGuard>
  <Dashboard />
</AuthGuard>
```

---

## 💻 Frontend

### Arquitetura de Páginas (App Router)

```
src/app/
├── (admin)/                    # Grupo de layout admin
│   └── admin/
│       ├── dashboard/          # Dashboard administrativo
│       ├── cursos/             # Gestão de cursos
│       ├── inscricoes/         # Gestão de inscrições
│       ├── utilizadores/       # Gestão de utilizadores
│       ├── areas/              # Gestão de áreas
│       └── categorias/         # Gestão de categorias
│
├── (auth)/                     # Grupo de layout autenticação
│   ├── login/                  # Página de login
│   ├── register/               # Página de registo
│   ├── forgot-password/        # Recuperar password
│   └── reset-password/[token]/ # Redefinir password
│
├── (dashboard)/                # Grupo de layout dashboard
│   ├── dashboard/              # Dashboard do formando
│   ├── cursos/                 # Catálogo de cursos
│   │   ├── [id]/               # Detalhes do curso
│   │   └── [id]/conteudo/      # Visualizador de conteúdo
│   ├── minhas-inscricoes/      # Inscrições do utilizador
│   ├── notificacoes/           # Centro de notificações
│   └── perfil/                 # Perfil do utilizador
│
├── layout.tsx                  # Layout raiz
└── page.tsx                    # Página inicial
```

### Gestão de Estado

#### TanStack Query (Estado do Servidor)

```typescript
// hooks/queries/useCursos.ts
export function useCursos(filtros?: FiltrosCurso) {
  return useQuery({
    queryKey: cursoKeys.list(filtros),
    queryFn: () => cursoService.listarCursos(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useCreateCurso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cursoService.criarCurso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cursoKeys.lists() });
    },
  });
}
```

#### React Context (Estado do Cliente)

```typescript
// contexts/AuthContext.tsx
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Serviços API

```typescript
// services/api.ts
class ApiService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 30000,
      withCredentials: true,
    });
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.axios.get(url);
    return response.data.dados ?? response.data;
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await this.axios.post(url, data);
    return response.data.dados ?? response.data;
  }
}

export const api = new ApiService();
```

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js** 18.0 ou superior
- **npm** 9.0 ou superior
- **PostgreSQL** 15 ou superior (ou conta Supabase)
- **Git**

### Instalação Rápida

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/onesam.git
cd onesam

# 2. Instalar dependências do backend
cd api
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as suas credenciais

# 4. Aplicar schema à base de dados
npm run db:push

# 5. Popular base de dados com dados de teste
npm run seed

# 6. Instalar dependências do frontend
cd ../web
npm install

# 7. Configurar variáveis de ambiente do frontend
cp .env.example .env.local
# Editar .env.local

# 8. Iniciar os serviços
# Terminal 1 (Backend):
cd api && npm run dev

# Terminal 2 (Frontend):
cd web && npm run dev
```

### Variáveis de Ambiente

#### Backend (`api/.env`)

```env
# Aplicação
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Supabase (Base de Dados + Storage)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_KEY=sua_chave_de_servico
DATABASE_URL=postgresql://postgres:password@host:5432/postgres

# Autenticação
BETTER_AUTH_SECRET=chave_secreta_minimo_32_caracteres

# Email (Opcional)
EMAIL_USER=email@exemplo.pt
EMAIL_PASSWORD=senha_app
EMAIL_FROM=no-reply@onesam.pt

# Logging
LOG_LEVEL=info
```

#### Frontend (`web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## 📜 Scripts Disponíveis

### Backend (`api/`)

| Script | Comando | Descrição |
|--------|---------|-----------|
| **Desenvolvimento** | `npm run dev` | Servidor com hot-reload |
| **Build** | `npm run build` | Compilar TypeScript |
| **Produção** | `npm start` | Iniciar servidor |
| **Testes** | `npm test` | Executar testes |
| **Testes (Watch)** | `npm run test:watch` | Testes em modo watch |
| **DB: Gerar** | `npm run db:generate` | Gerar migrações |
| **DB: Migrar** | `npm run db:migrate` | Aplicar migrações |
| **DB: Push** | `npm run db:push` | Push schema directo |
| **DB: Studio** | `npm run db:studio` | Interface Drizzle |
| **Seed** | `npm run seed` | Popular BD |
| **Seed: Clean** | `npm run seed:clean` | Limpar e repopular |

### Frontend (`web/`)

| Script | Comando | Descrição |
|--------|---------|-----------|
| **Desenvolvimento** | `npm run dev` | Servidor Next.js |
| **Build** | `npm run build` | Build de produção |
| **Produção** | `npm start` | Servidor de produção |
| **Lint** | `npm run lint` | Verificar código |

---

## 🧪 Testes

### Executar Testes

```bash
# Backend - Todos os testes
cd api && npm test

# Backend - Modo watch
npm run test:watch

# Backend - Com cobertura
npm run test:coverage
```

### Estrutura de Testes

```
api/
├── __tests__/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   └── integration/
│       ├── routes/
│       └── repositories/
```

---

## 📦 Deployment

### Produção

1. **Build do Backend**
   ```bash
   cd api
   npm run build
   ```

2. **Build do Frontend**
   ```bash
   cd web
   npm run build
   ```

3. **Configurar variáveis de ambiente de produção**

4. **Executar migrações**
   ```bash
   npm run db:migrate
   ```

### Plataformas Recomendadas

| Componente | Plataforma | Alternativas |
|------------|------------|--------------|
| **Backend** | Railway, Render | Heroku, DigitalOcean |
| **Frontend** | Vercel | Netlify, Cloudflare Pages |
| **Base de Dados** | Supabase | Railway, PlanetScale |
| **Storage** | Supabase | AWS S3, Cloudflare R2 |

---

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o repositório
2. Criar **branch** para a feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** das alterações (`git commit -m 'feat: adicionar nova funcionalidade'`)
4. **Push** para o branch (`git push origin feature/nova-funcionalidade`)
5. Abrir **Pull Request**

### Convenções de Commit

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: manutenção
```

### Guia de Estilo

- **TypeScript** obrigatório
- **ESLint** e **Prettier** configurados
- Testes para novas funcionalidades
- Documentação de código quando necessário

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - consulte o ficheiro [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipa

<table>
  <tr>
    <td align="center">
      <a href="#">
        <img src="docs/images/team/developer.png" width="100px;" alt=""/>
        <br />
        <sub><b>Developer</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## 📞 Contacto

- **Email**: suporte@onesam.pt
- **Website**: [https://onesam.pt](https://onesam.pt)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/onesam/issues)

---

<p align="center">
  <strong>OneSAM</strong> - Plataforma de Formação Empresarial
  <br/>
</p>

<p align="center">
  <a href="#-onesam---plataforma-de-formação">⬆️ Voltar ao Topo</a>
</p>
