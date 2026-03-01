/**
 * Configuração completa do Swagger/OpenAPI 3.0 - OneSAM Platform
 * Documentação abrangente de todos os endpoints da API
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'OneSAM Platform API',
    version: '3.0.0',
    description: `
# API de Gestão de Cursos e Formação Profissional

## Visão Geral
A OneSAM Platform oferece uma API RESTful completa para gestão de cursos, formações, avaliações e certificados.

## Autenticação
A API utiliza Better Auth para autenticação moderna e segura. A autenticação pode ser feita via:
- **Session Cookies**: Cookies HTTP-only seguros (método recomendado)
- **Bearer Token**: Header \`Authorization: Bearer <token>\` (opcional)

### Better Auth Endpoints
- \`POST /auth/sign-up\` - Registro de novos utilizadores
- \`POST /auth/sign-in\` - Login com email/password
- \`POST /auth/sign-out\` - Logout (invalida sessão)
- \`GET /auth/session\` - Obter dados da sessão atual
- \`POST /auth/reset-password\` - Solicitar recuperação de senha
- \`POST /auth/reset-password/verify\` - Confirmar nova senha

### Configuração da Sessão
- **Duração**: 7 dias (renovação automática)
- **Cookies**: HTTP-only, Secure, SameSite
- **Renovação**: Automática a cada 24 horas de uso

## Perfis de Usuário
- **Admin/Gestor**: Acesso completo à plataforma
- **Formador**: Criação e gestão de cursos próprios
- **Formando**: Inscrição em cursos e realização de avaliações

## Formato de Respostas
Todas as respostas seguem o padrão português:
\`\`\`json
{
  "dados": { ... },      // Dados retornados (opcional)
  "mensagem": "..."      // Mensagem de sucesso (opcional)
}
\`\`\`

Formato de erro:
\`\`\`json
{
  "erro": "Mensagem do erro",
  "detalhes": "Detalhes adicionais" // opcional
}
\`\`\`

## Status Codes
- **200**: Sucesso
- **201**: Criado com sucesso
- **204**: Sucesso sem conteúdo
- **400**: Requisição inválida
- **401**: Não autenticado
- **403**: Sem permissão
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor
    `,
    contact: {
      name: 'OneSAM Team',
      email: 'suporte@onesam.pt',
    },
    license: {
      name: 'ISC',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Servidor de Desenvolvimento',
    },
    {
      url: 'https://api.onesam.pt/api',
      description: 'Servidor de Produção',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token no header Authorization',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT access token em httpOnly cookie',
      },
    },
    schemas: {
      // Schemas de Erro
      Error: {
        type: 'object',
        properties: {
          erro: {
            type: 'string',
            example: 'Erro na requisição',
          },
          detalhes: {
            type: 'string',
            example: 'Detalhes adicionais do erro',
          },
        },
      },

      // Schemas de Utilizador
      Utilizador: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'João Silva' },
          email: { type: 'string', format: 'email', example: 'joao@exemplo.pt' },
          tipoPerfil: {
            type: 'string',
            enum: ['admin', 'formando'],
            example: 'formando'
          },
          perfilId: { type: 'integer', nullable: true, example: 1 },
          avatar: { type: 'string', nullable: true, example: 'https://storage.com/avatar.jpg' },
          ativo: { type: 'boolean', example: true },
          emailVerified: { type: 'boolean', example: true },
          dataCriacao: { type: 'string', format: 'date-time' },
          dataAtualizacao: { type: 'string', format: 'date-time', nullable: true },
        },
      },

      // Better Auth Schema - Corrigido
      SignInRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'utilizador@exemplo.pt' },
          password: { type: 'string', format: 'password', example: 'SenhaSegura123!' },
        },
      },

      // Mantido para compatibilidade legacy
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'utilizador@exemplo.pt' },
          password: { type: 'string', format: 'password', example: 'SenhaSegura123!' },
        },
      },

      // Better Auth Response - Atualizado
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/Utilizador' },
          session: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              token: { type: 'string' },
              expiresAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },

      // Mantido para compatibilidade legacy
      LoginResponse: {
        type: 'object',
        properties: {
          utilizador: { $ref: '#/components/schemas/Utilizador' },
          token: { type: 'string', description: 'JWT access token' },
        },
      },

      // Better Auth Schema - Corrigido
      SignUpRequest: {
        type: 'object',
        required: ['nome', 'email', 'password', 'tipoPerfil'],
        properties: {
          nome: { type: 'string', example: 'João Silva' },
          email: { type: 'string', format: 'email', example: 'joao@exemplo.pt' },
          password: { type: 'string', format: 'password', minLength: 8 },
          tipoPerfil: { type: 'string', enum: ['admin', 'formando'], example: 'formando' },
          avatar: { type: 'string', nullable: true },
          // Campos específicos de formando (opcionais)
          empresa: { type: 'string', nullable: true },
          cargo: { type: 'string', nullable: true },
          areaInteresse: { type: 'string', nullable: true },
          objetivosAprendizagem: { type: 'string', nullable: true },
        },
      },

      // Mantido para compatibilidade legacy
      RegisterRequest: {
        type: 'object',
        required: ['nome', 'email', 'password', 'perfil'],
        properties: {
          nome: { type: 'string', example: 'João Silva' },
          email: { type: 'string', format: 'email', example: 'joao@exemplo.pt' },
          password: { type: 'string', format: 'password', minLength: 8 },
          perfil: { type: 'string', enum: ['admin', 'formando'], example: 'formando' },
          telefone: { type: 'string', nullable: true },
          linkedin: { type: 'string', nullable: true },
        },
      },

      // Schemas de Curso
      Curso: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          areaId: { type: 'integer', nullable: true, example: 1 },
          categoriaId: { type: 'integer', nullable: true, example: 1 },
          nome: { type: 'string', example: 'Introdução ao TypeScript' },
          descricao: { type: 'string', nullable: true, example: 'Aprenda os fundamentos do TypeScript' },
          imagemCurso: { type: 'string', nullable: true },
          certificado: { type: 'boolean', example: false },
          dataInicio: { type: 'string', format: 'date-time' },
          dataFim: { type: 'string', format: 'date-time' },
          dataLimiteInscricao: { type: 'string', format: 'date-time' },
          estado: {
            type: 'string',
            enum: ['planeado', 'em_curso', 'terminado', 'arquivado'],
            example: 'planeado'
          },
          visivel: { type: 'boolean', example: true },
          nivel: {
            type: 'string',
            enum: ['iniciante', 'intermedio', 'avancado'],
            example: 'iniciante'
          },
          limiteVagas: { type: 'integer', nullable: true, example: 30 },
          cargaHoraria: { type: 'integer', nullable: true, example: 40 },
          notaMinimaAprovacao: { type: 'integer', example: 10 },
          dataCriacao: { type: 'string', format: 'date-time' },
          dataAtualizacao: { type: 'string', format: 'date-time', nullable: true },
        },
      },

      CursoInput: {
        type: 'object',
        required: ['nome', 'dataInicio', 'dataFim', 'dataLimiteInscricao'],
        properties: {
          nome: { type: 'string', minLength: 3, maxLength: 255 },
          descricao: { type: 'string' },
          nivel: { type: 'string', enum: ['iniciante', 'intermedio', 'avancado'] },
          dataInicio: { type: 'string', format: 'date-time' },
          dataFim: { type: 'string', format: 'date-time' },
          dataLimiteInscricao: { type: 'string', format: 'date-time' },
          limiteVagas: { type: 'integer', minimum: 1 },
          cargaHoraria: { type: 'integer', minimum: 1 },
          notaMinimaAprovacao: { type: 'integer', minimum: 0, maximum: 20 },
          certificado: { type: 'boolean' },
          visivel: { type: 'boolean' },
          estado: { type: 'string', enum: ['planeado', 'em_curso', 'terminado', 'arquivado'] },
          areaId: { type: 'integer' }, // Padronizado
          categoriaId: { type: 'integer' }, // Padronizado
        },
      },

      // Schemas de Inscrição
      Inscricao: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          cursoId: { type: 'integer', example: 1 },
          utilizadorId: { type: 'integer', example: 1 },
          dataInscricao: { type: 'string', format: 'date-time' },
          estado: {
            type: 'string',
            enum: ['pendente', 'aceite', 'rejeitada', 'cancelada'],
            example: 'pendente'
          },
          dataCriacao: { type: 'string', format: 'date-time' },
          dataAtualizacao: { type: 'string', format: 'date-time', nullable: true },
        },
      },

      InscricaoInput: {
        type: 'object',
        required: ['cursoId'], // Padronizado
        properties: {
          cursoId: { type: 'integer', example: 1 }, // Padronizado de IDCurso
        },
      },

      // Schemas de Categoria e Área
      Categoria: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          areaId: { type: 'integer', nullable: true, example: 1 },
          nome: { type: 'string', example: 'Programação' },
          descricao: { type: 'string', nullable: true },
          dataCriacao: { type: 'string', format: 'date-time' },
          dataAtualizacao: { type: 'string', format: 'date-time', nullable: true },
        },
      },

      Area: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Tecnologia' },
          descricao: { type: 'string', nullable: true },
          dataCriacao: { type: 'string', format: 'date-time' },
          dataAtualizacao: { type: 'string', format: 'date-time', nullable: true },
        },
      },

      // Schemas de Módulo
      Modulo: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          cursoId: { type: 'integer', example: 1 },
          titulo: { type: 'string', example: 'Introdução ao Curso' },
          descricao: { type: 'string', nullable: true },
          ordem: { type: 'integer', example: 1 },
          dataCriacao: { type: 'string', format: 'date-time' },
          dataAtualizacao: { type: 'string', format: 'date-time', nullable: true },
          aulas: {
            type: 'array',
            items: { $ref: '#/components/schemas/Aula' },
          },
        },
      },

      ModuloInput: {
        type: 'object',
        required: ['titulo', 'cursoId'], // Padronizado
        properties: {
          titulo: { type: 'string', minLength: 3 },
          descricao: { type: 'string' },
          ordem: { type: 'integer' },
          cursoId: { type: 'integer' }, // Padronizado de IDCurso
        },
      },

      ModuloUpdate: {
        type: 'object',
        properties: {
          titulo: { type: 'string', minLength: 3 },
          descricao: { type: 'string' },
          ordem: { type: 'integer' },
        },
      },

      // Schemas de Aula
      Aula: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          moduloId: { type: 'integer', example: 1 },
          titulo: { type: 'string', example: 'Primeira Aula' },
          descricao: { type: 'string', nullable: true },
          tipo: {
            type: 'string',
            enum: ['video', 'documento', 'link', 'texto', 'quiz'],
            example: 'video',
          },
          conteudo: { type: 'string', nullable: true },
          url: { type: 'string', nullable: true },
          duracao: { type: 'integer', nullable: true, description: 'Duração em minutos' },
          ordem: { type: 'integer', example: 1 },
          obrigatoria: { type: 'boolean', example: true },
          dataCriacao: { type: 'string', format: 'date-time' },
          dataAtualizacao: { type: 'string', format: 'date-time', nullable: true },
          progresso: { $ref: '#/components/schemas/ProgressoAula' },
        },
      },

      AulaInput: {
        type: 'object',
        required: ['titulo', 'tipo', 'moduloId'], // Padronizado
        properties: {
          titulo: { type: 'string', minLength: 3 },
          descricao: { type: 'string' },
          tipo: { type: 'string', enum: ['video', 'documento', 'link', 'texto', 'quiz'] },
          conteudo: { type: 'string' },
          url: { type: 'string' },
          duracao: { type: 'integer' },
          ordem: { type: 'integer' },
          obrigatoria: { type: 'boolean' },
          moduloId: { type: 'integer' }, // Padronizado de IDModulo
        },
      },

      AulaUpdate: {
        type: 'object',
        properties: {
          titulo: { type: 'string', minLength: 3 },
          descricao: { type: 'string' },
          tipo: { type: 'string', enum: ['video', 'documento', 'link', 'texto', 'quiz'] },
          conteudo: { type: 'string' },
          url: { type: 'string' },
          duracao: { type: 'integer' },
          ordem: { type: 'integer' },
          obrigatoria: { type: 'boolean' },
        },
      },

      ProgressoAula: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          aulaId: { type: 'integer', example: 1 },
          utilizadorId: { type: 'integer', example: 1 },
          concluida: { type: 'boolean', example: true },
          dataConclusao: { type: 'string', format: 'date-time', nullable: true },
          tempoGasto: { type: 'integer', nullable: true, description: 'Tempo gasto em minutos' },
          dataCriacao: { type: 'string', format: 'date-time' },
          dataAtualizacao: { type: 'string', format: 'date-time', nullable: true },
        },
      },

      // Schemas de Notificação
      Notificacao: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          utilizadorId: { type: 'integer', example: 1 },
          tipo: {
            type: 'string',
            enum: ['inscricao_aprovada', 'inscricao_rejeitada', 'novo_curso', 'lembrete', 'sistema'],
            example: 'inscricao_aprovada',
          },
          titulo: { type: 'string', example: 'Inscrição aprovada' },
          mensagem: { type: 'string', example: 'Sua inscrição no curso foi aprovada' },
          lida: { type: 'boolean', example: false },
          dataCriacao: { type: 'string', format: 'date-time' },
          dataLeitura: { type: 'string', format: 'date-time', nullable: true },
        },
      },

      // Schemas de Review/Avaliação - ADICIONADO
      Review: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          cursoId: { type: 'integer', example: 1 },
          utilizadorId: { type: 'integer', example: 1 },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          comentario: { type: 'string', nullable: true, example: 'Excelente curso!' },
          dataCriacao: { type: 'string', format: 'date-time' },
          dataAtualizacao: { type: 'string', format: 'date-time', nullable: true },
          utilizador: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              nome: { type: 'string' },
              avatar: { type: 'string', nullable: true },
            },
          },
        },
      },

      ReviewInput: {
        type: 'object',
        required: ['cursoId', 'rating'],
        properties: {
          cursoId: { type: 'integer', example: 1 },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          comentario: { type: 'string', maxLength: 2000, example: 'Ótimo curso, recomendo!' },
        },
      },

      ReviewUpdate: {
        type: 'object',
        properties: {
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
          comentario: { type: 'string', maxLength: 2000, example: 'Curso atualizado' },
        },
      },

      ReviewStats: {
        type: 'object',
        properties: {
          totalReviews: { type: 'integer', example: 25 },
          mediaRating: { type: 'number', format: 'float', example: 4.2 },
          distribuicao: {
            type: 'object',
            properties: {
              5: { type: 'integer', example: 10 },
              4: { type: 'integer', example: 8 },
              3: { type: 'integer', example: 4 },
              2: { type: 'integer', example: 2 },
              1: { type: 'integer', example: 1 },
            },
          },
        },
      },

      // Schemas de Quiz
      QuizPergunta: {
        type: 'object',
        required: ['pergunta', 'opcoes', 'respostaCorreta'],
        properties: {
          pergunta: { type: 'string', minLength: 5, maxLength: 500, example: 'Qual é a capital de Portugal?' },
          opcoes: {
            type: 'array',
            minItems: 2,
            maxItems: 6,
            items: { type: 'string', maxLength: 200 },
            example: ['Lisboa', 'Porto', 'Coimbra', 'Braga'],
          },
          respostaCorreta: { type: 'integer', minimum: 0, example: 0 },
          ordem: { type: 'integer', minimum: 1, example: 1 },
        },
      },

      CreateQuizRequest: {
        type: 'object',
        required: ['aulaId', 'titulo', 'perguntas'],
        properties: {
          aulaId: { type: 'integer', minimum: 1, example: 1 },
          titulo: { type: 'string', minLength: 3, maxLength: 255, example: 'Quiz de Geografia de Portugal' },
          notaMinima: { type: 'number', minimum: 0, maximum: 20, default: 10, example: 12 },
          maxTentativas: { type: 'integer', minimum: 1, maximum: 10, default: 3, example: 3 },
          perguntas: {
            type: 'array',
            minItems: 1,
            maxItems: 50,
            items: { $ref: '#/components/schemas/QuizPergunta' },
          },
        },
      },

      UpdateQuizRequest: {
        type: 'object',
        properties: {
          aulaId: { type: 'integer', minimum: 1, example: 1 },
          titulo: { type: 'string', minLength: 3, maxLength: 255, example: 'Quiz de Geografia de Portugal (Atualizado)' },
          notaMinima: { type: 'number', minimum: 0, maximum: 20, example: 12 },
          maxTentativas: { type: 'integer', minimum: 1, maximum: 10, example: 5 },
          perguntas: {
            type: 'array',
            minItems: 1,
            maxItems: 50,
            items: { $ref: '#/components/schemas/QuizPergunta' },
          },
        },
      },

      Quiz: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          aulaId: { type: 'integer', example: 1 },
          titulo: { type: 'string', example: 'Quiz de Geografia de Portugal' },
          notaMinima: { type: 'number', example: 12 },
          maxTentativas: { type: 'integer', example: 3 },
          criadoEm: { type: 'string', format: 'date-time' },
          atualizadoEm: { type: 'string', format: 'date-time' },
          totalPerguntas: { type: 'integer', example: 10 },
        },
      },

      QuizCompleto: {
        allOf: [
          { $ref: '#/components/schemas/Quiz' },
          {
            type: 'object',
            properties: {
              perguntas: {
                type: 'array',
                items: {
                  allOf: [
                    { $ref: '#/components/schemas/QuizPergunta' },
                    {
                      type: 'object',
                      properties: {
                        id: { type: 'integer', example: 1 },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },

      QuizParaResolver: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          titulo: { type: 'string', example: 'Quiz de Geografia de Portugal' },
          notaMinima: { type: 'number', example: 12 },
          maxTentativas: { type: 'integer', example: 3 },
          tentativasRealizadas: { type: 'integer', example: 1 },
          perguntas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                pergunta: { type: 'string', example: 'Qual é a capital de Portugal?' },
                opcoes: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['Lisboa', 'Porto', 'Coimbra', 'Braga'],
                },
                ordem: { type: 'integer', example: 1 },
              },
            },
          },
        },
      },

      SubmitQuizRequest: {
        type: 'object',
        required: ['respostas'],
        properties: {
          respostas: {
            type: 'array',
            minItems: 1,
            maxItems: 50,
            items: {
              type: 'object',
              required: ['perguntaId', 'respostaSelecionada'],
              properties: {
                perguntaId: { type: 'integer', minimum: 1, example: 1 },
                respostaSelecionada: { type: 'integer', minimum: 0, example: 0 },
              },
            },
          },
        },
      },

      QuizResult: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nota: { type: 'number', minimum: 0, maximum: 20, example: 15.5 },
          aprovado: { type: 'boolean', example: true },
          totalPerguntas: { type: 'integer', example: 10 },
          respostasCorretas: { type: 'integer', example: 8 },
          tentativa: { type: 'integer', example: 2 },
          dataSubmissao: { type: 'string', format: 'date-time' },
          tempoResolucao: { type: 'integer', description: 'Tempo em segundos', example: 1200 },
        },
      },

      QuizAttempt: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          quizId: { type: 'integer', example: 1 },
          utilizadorId: { type: 'integer', example: 1 },
          nota: { type: 'number', minimum: 0, maximum: 20, example: 15.5 },
          aprovado: { type: 'boolean', example: true },
          tentativa: { type: 'integer', example: 2 },
          dataSubmissao: { type: 'string', format: 'date-time' },
          tempoResolucao: { type: 'integer', description: 'Tempo em segundos', example: 1200 },
          respostasCorretas: { type: 'integer', example: 8 },
          totalPerguntas: { type: 'integer', example: 10 },
        },
      },

      // Schemas de Certificado
      Certificate: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          codigo: { type: 'string', example: 'CERT-ABC123XYZ' },
          cursoId: { type: 'integer', example: 1 },
          utilizadorId: { type: 'integer', example: 1 },
          notaFinal: { type: 'number', minimum: 0, maximum: 20, example: 17.5 },
          dataEmissao: { type: 'string', format: 'date-time' },
          validoAte: { type: 'string', format: 'date-time', nullable: true },
          curso: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              nome: { type: 'string', example: 'Curso de Programação Web' },
              cargaHoraria: { type: 'integer', example: 40 },
              categoria: { type: 'string', example: 'Tecnologia' },
            },
          },
          utilizador: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              nome: { type: 'string', example: 'João Silva' },
              email: { type: 'string', format: 'email', example: 'joao.silva@example.com' },
            },
          },
        },
      },

      CertificateValidation: {
        type: 'object',
        properties: {
          valido: { type: 'boolean', example: true },
          codigo: { type: 'string', example: 'CERT-ABC123XYZ' },
          dataEmissao: { type: 'string', format: 'date-time' },
          validoAte: { type: 'string', format: 'date-time', nullable: true },
          curso: {
            type: 'object',
            properties: {
              nome: { type: 'string', example: 'Curso de Programação Web' },
              cargaHoraria: { type: 'integer', example: 40 },
              categoria: { type: 'string', example: 'Tecnologia' },
              instituicao: { type: 'string', example: 'OneSAM Platform' },
            },
          },
          formando: {
            type: 'object',
            properties: {
              nome: { type: 'string', example: 'João Silva' },
              notaFinal: { type: 'number', minimum: 0, maximum: 20, example: 17.5 },
            },
          },
        },
      },
    },
  },

  // Definição de Endpoints
  paths: {
    // Health Check
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check da API',
        description: 'Verifica o estado de saúde da API',
        responses: {
          '200': {
            description: 'API operacional',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    version: { type: 'string', example: '3.0.0' },
                    timestamp: { type: 'string', format: 'date-time' },
                    environment: { type: 'string', example: 'development' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // Better Auth Endpoints - Atualizados
    '/auth/sign-up': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar novo utilizador',
        description: 'Cria uma nova conta usando Better Auth. Campos customizados são validados conforme configuração.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignUpRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Utilizador criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
            headers: {
              'Set-Cookie': {
                description: 'Session cookie definido automaticamente',
                schema: { type: 'string' },
              },
            },
          },
          '400': {
            description: 'Dados inválidos ou validação falhou',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Validation failed' },
                    details: { type: 'object' },
                  },
                },
              },
            },
          },
          '409': {
            description: 'Email já está em uso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'User already exists' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/auth/sign-in': {
      post: {
        tags: ['Auth'],
        summary: 'Autenticar utilizador',
        description: 'Login com email e password usando Better Auth',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignInRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login bem-sucedido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
            headers: {
              'Set-Cookie': {
                description: 'Session cookie definido automaticamente',
                schema: { type: 'string' },
              },
            },
          },
          '401': {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Invalid credentials' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Dados de entrada inválidos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Invalid input' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/auth/sign-out': {
      post: {
        tags: ['Auth'],
        summary: 'Terminar sessão',
        description: 'Logout usando Better Auth - invalida a sessão atual',
        responses: {
          '200': {
            description: 'Logout realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                  },
                },
              },
            },
            headers: {
              'Set-Cookie': {
                description: 'Session cookie removido',
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    },

    '/auth/session': {
      get: {
        tags: ['Auth'],
        summary: 'Obter sessão atual',
        description: 'Retorna a sessão e dados do utilizador autenticado via Better Auth',
        responses: {
          '200': {
            description: 'Dados da sessão',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': {
            description: 'Não autenticado ou sessão expirada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Unauthorized' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Solicitar recuperação de senha',
        description: 'Envia email para recuperação de senha usando Better Auth',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'utilizador@exemplo.pt' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Email de recuperação enviado (sempre retorna 200 por segurança)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Se o email existir, receberá instruções de recuperação' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Email inválido',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Invalid email format' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/auth/reset-password/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Confirmar recuperação de senha',
        description: 'Define nova senha usando token de recuperação Better Auth',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string', example: 'reset-token-uuid' },
                  password: { type: 'string', format: 'password', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Senha alterada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Password reset successful' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Token inválido ou expirado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Invalid or expired token' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // Better Auth não requer refresh token manual - sessions são gerenciadas automaticamente
    // Endpoint mantido para compatibilidade, mas sessions Better Auth são renovadas automaticamente
    '/auth/session/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Renovar sessão (Better Auth)',
        description: 'Com Better Auth, as sessões são renovadas automaticamente. Este endpoint força uma verificação de sessão.',
        responses: {
          '200': {
            description: 'Sessão verificada/renovada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    session: { $ref: '#/components/schemas/AuthResponse' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Sessão inválida ou expirada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Session expired' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // Curso Endpoints
    '/cursos': {
      get: {
        tags: ['Cursos'],
        summary: 'Listar cursos',
        description: 'Lista todos os cursos visíveis (rota pública)',
        parameters: [
          {
            name: 'estado',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['planeado', 'em_curso', 'terminado', 'arquivado'],
            },
            description: 'Filtrar por estado do curso',
          },
          {
            name: 'nivel',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['iniciante', 'intermedio', 'avancado'],
            },
            description: 'Filtrar por nível',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de cursos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Curso' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Cursos'],
        summary: 'Criar curso',
        description: 'Cria um novo curso (apenas formadores e admin)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/CursoInput' },
                  {
                    type: 'object',
                    properties: {
                      imagemCurso: {
                        type: 'string',
                        format: 'binary',
                        description: 'Imagem do curso (opcional)',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Curso criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensagem: { type: 'string' },
                    curso: { $ref: '#/components/schemas/Curso' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '403': {
            description: 'Sem permissão',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },

    '/cursos/bulk-delete': {
      post: {
        tags: ['Cursos'],
        summary: 'Deletar cursos em massa',
        description: 'Remove múltiplos cursos (apenas admin)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ids'],
                properties: {
                  ids: {
                    type: 'array',
                    items: { type: 'integer' },
                    example: [1, 2, 3],
                    description: 'Array de IDs dos cursos a deletar',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Cursos deletados com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensagem: { type: 'string', example: 'Cursos deletados com sucesso' },
                    deletedCount: { type: 'integer', example: 3 },
                  },
                },
              },
            },
          },
          '403': { description: 'Sem permissão (apenas admin)' },
          '400': { description: 'Lista de IDs inválida' },
        },
      },
    },

    '/cursos/{id}': {
      get: {
        tags: ['Cursos'],
        summary: 'Obter curso por ID',
        description: 'Retorna os detalhes de um curso específico (rota pública)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do curso',
          },
        ],
        responses: {
          '200': {
            description: 'Detalhes do curso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Curso' },
              },
            },
          },
          '404': {
            description: 'Curso não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Cursos'],
        summary: 'Atualizar curso',
        description: 'Atualiza os dados de um curso (apenas formador responsável ou admin)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do curso',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  imagemCurso: {
                    type: 'string',
                    format: 'binary',
                  },
                  nome: { type: 'string' },
                  descricao: { type: 'string' },
                  estado: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Curso atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Curso' },
              },
            },
          },
          '403': {
            description: 'Sem permissão',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '404': {
            description: 'Curso não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Cursos'],
        summary: 'Deletar curso',
        description: 'Remove um curso (apenas admin)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do curso',
          },
        ],
        responses: {
          '204': {
            description: 'Curso deletado com sucesso',
          },
          '403': {
            description: 'Sem permissão',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '404': {
            description: 'Curso não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },

    '/cursos/{id}/estado': {
      put: {
        tags: ['Cursos'],
        summary: 'Alterar estado do curso',
        description: 'Altera o estado de um curso (apenas admin)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do curso',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['estado'],
                properties: {
                  estado: {
                    type: 'string',
                    enum: ['planeado', 'em_curso', 'terminado', 'arquivado'],
                    example: 'em_curso',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Estado alterado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Curso' },
              },
            },
          },
          '403': {
            description: 'Sem permissão',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '404': {
            description: 'Curso não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },

    // Inscrição Endpoints
    '/inscricoes': {
      get: {
        tags: ['Inscrições'],
        summary: 'Listar todas as inscrições',
        description: 'Lista todas as inscrições da plataforma (apenas admin)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de todas as inscrições',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Inscricao' },
                },
              },
            },
          },
          '403': {
            description: 'Sem permissão (apenas admin)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Inscrições'],
        summary: 'Inscrever em curso',
        description: 'Formando se inscreve em um curso',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InscricaoInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Inscrição criada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensagem: { type: 'string' },
                    inscricao: { $ref: '#/components/schemas/Inscricao' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Dados inválidos ou inscrição duplicada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '403': {
            description: 'Apenas formandos podem se inscrever',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },

    '/inscricoes/minhas': {
      get: {
        tags: ['Inscrições'],
        summary: 'Minhas inscrições',
        description: 'Lista inscrições do formando autenticado',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de inscrições',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Inscricao' },
                },
              },
            },
          },
        },
      },
    },

    '/inscricoes/{id}/aprovar': {
      put: {
        tags: ['Inscrições'],
        summary: 'Aprovar inscrição',
        description: 'Formador ou admin aprova uma inscrição pendente',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID da inscrição',
          },
        ],
        responses: {
          '200': {
            description: 'Inscrição aprovada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensagem: { type: 'string' },
                    inscricao: { $ref: '#/components/schemas/Inscricao' },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Sem permissão',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '404': {
            description: 'Inscrição não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },

    // Categoria e Área Endpoints
    '/categorias': {
      get: {
        tags: ['Categorias'],
        summary: 'Listar categorias',
        description: 'Lista todas as categorias de cursos (rota pública)',
        responses: {
          '200': {
            description: 'Lista de categorias',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Categoria' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Categorias'],
        summary: 'Criar categoria',
        description: 'Cria uma nova categoria (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome'],
                properties: {
                  nome: { type: 'string', example: 'Programação' },
                  descricao: { type: 'string' },
                  IDArea: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Categoria criada com sucesso' },
          '403': { description: 'Sem permissão' },
        },
      },
    },

    '/areas': {
      get: {
        tags: ['Áreas'],
        summary: 'Listar áreas',
        description: 'Lista todas as áreas de conhecimento (rota pública)',
        responses: {
          '200': {
            description: 'Lista de áreas',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Area' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Áreas'],
        summary: 'Criar área',
        description: 'Cria uma nova área (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome'],
                properties: {
                  nome: { type: 'string', example: 'Tecnologia' },
                  descricao: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Área criada com sucesso' },
          '403': { description: 'Sem permissão' },
        },
      },
    },

    '/areas/{id}': {
      get: {
        tags: ['Áreas'],
        summary: 'Obter área',
        description: 'Retorna uma área específica (rota pública)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Área encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Area' },
              },
            },
          },
          '404': { description: 'Área não encontrada' },
        },
      },
      put: {
        tags: ['Áreas'],
        summary: 'Atualizar área',
        description: 'Atualiza uma área (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Área atualizada' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Área não encontrada' },
        },
      },
      delete: {
        tags: ['Áreas'],
        summary: 'Deletar área',
        description: 'Remove uma área (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Área deletada' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Área não encontrada' },
        },
      },
    },

    '/categorias/{id}': {
      get: {
        tags: ['Categorias'],
        summary: 'Obter categoria',
        description: 'Retorna uma categoria específica (rota pública)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Categoria encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Categoria' },
              },
            },
          },
          '404': { description: 'Categoria não encontrada' },
        },
      },
      put: {
        tags: ['Categorias'],
        summary: 'Atualizar categoria',
        description: 'Atualiza uma categoria (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Categoria atualizada' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Categoria não encontrada' },
        },
      },
      delete: {
        tags: ['Categorias'],
        summary: 'Deletar categoria',
        description: 'Remove uma categoria (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Categoria deletada' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Categoria não encontrada' },
        },
      },
    },

    // Utilizadores Endpoints
    '/utilizadores/perfil': {
      get: {
        tags: ['Utilizadores'],
        summary: 'Obter perfil atual',
        description: 'Retorna o perfil do utilizador autenticado',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Perfil do utilizador',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Utilizador' },
              },
            },
          },
          '401': { description: 'Não autenticado' },
        },
      },
      put: {
        tags: ['Utilizadores'],
        summary: 'Atualizar perfil',
        description: 'Atualiza dados do perfil do utilizador',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string', minLength: 2, maxLength: 255 },
                  email: { type: 'string', format: 'email' },
                  localizacao: { type: 'string', maxLength: 255 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Perfil atualizado' },
          '400': { description: 'Dados inválidos' },
          '401': { description: 'Não autenticado' },
        },
      },
    },

    '/utilizadores/perfil/avatar': {
      post: {
        tags: ['Utilizadores'],
        summary: 'Upload de avatar',
        description: 'Faz upload da foto de perfil',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  avatar: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Avatar atualizado' },
          '400': { description: 'Arquivo inválido' },
          '401': { description: 'Não autenticado' },
        },
      },
    },

    '/utilizadores/perfil/senha': {
      post: {
        tags: ['Utilizadores'],
        summary: 'Alterar senha',
        description: 'Altera a senha do utilizador',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['senhaAtual', 'novaSenha'],
                properties: {
                  senhaAtual: { type: 'string' },
                  novaSenha: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Senha alterada' },
          '400': { description: 'Dados inválidos' },
          '401': { description: 'Senha atual incorreta' },
        },
      },
    },

    '/utilizadores/perfil-publico/{id}': {
      get: {
        tags: ['Utilizadores'],
        summary: 'Ver perfil público',
        description: 'Retorna o perfil público de um utilizador',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Perfil público',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Utilizador' },
              },
            },
          },
          '404': { description: 'Utilizador não encontrado' },
        },
      },
    },

    '/utilizadores': {
      get: {
        tags: ['Utilizadores'],
        summary: 'Listar utilizadores',
        description: 'Lista todos os utilizadores (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de utilizadores',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Utilizador' },
                },
              },
            },
          },
          '403': { description: 'Sem permissão' },
        },
      },
      post: {
        tags: ['Utilizadores'],
        summary: 'Criar utilizador',
        description: 'Cria novo utilizador (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': { description: 'Utilizador criado' },
          '400': { description: 'Dados inválidos' },
          '403': { description: 'Sem permissão' },
        },
      },
    },

    '/utilizadores/{id}': {
      get: {
        tags: ['Utilizadores'],
        summary: 'Obter utilizador',
        description: 'Retorna um utilizador específico (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Utilizador encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Utilizador' },
              },
            },
          },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Utilizador não encontrado' },
        },
      },
      put: {
        tags: ['Utilizadores'],
        summary: 'Atualizar utilizador',
        description: 'Atualiza dados de um utilizador (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  ativo: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Utilizador atualizado' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Utilizador não encontrado' },
        },
      },
      delete: {
        tags: ['Utilizadores'],
        summary: 'Deletar utilizador',
        description: 'Remove um utilizador (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Utilizador deletado' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Utilizador não encontrado' },
        },
      },
    },

    '/utilizadores/{id}/toggle-ativo': {
      patch: {
        tags: ['Utilizadores'],
        summary: 'Ativar/Desativar utilizador',
        description: 'Alterna o estado ativo do utilizador (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Estado alterado' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Utilizador não encontrado' },
        },
      },
    },

    '/utilizadores/bulk-delete': {
      post: {
        tags: ['Utilizadores'],
        summary: 'Deletar utilizadores em massa',
        description: 'Remove múltiplos utilizadores (apenas admin)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ids'],
                properties: {
                  ids: {
                    type: 'array',
                    items: { type: 'integer' },
                    example: [1, 2, 3],
                    description: 'Array de IDs dos utilizadores a deletar',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Utilizadores deletados com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensagem: { type: 'string', example: 'Utilizadores deletados com sucesso' },
                    deletedCount: { type: 'integer', example: 3 },
                  },
                },
              },
            },
          },
          '403': { description: 'Sem permissão (apenas admin)' },
          '400': { description: 'Lista de IDs inválida' },
        },
      },
    },

    // Admin Endpoints
    '/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Estatísticas da plataforma',
        description: 'Retorna estatísticas gerais (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Estatísticas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalUtilizadores: { type: 'integer' },
                    totalCursos: { type: 'integer' },
                    totalInscricoes: { type: 'integer' },
                    cursosEmAndamento: { type: 'integer' },
                  },
                },
              },
            },
          },
          '403': { description: 'Sem permissão' },
        },
      },
    },

    '/admin/cursos-populares': {
      get: {
        tags: ['Admin'],
        summary: 'Cursos populares',
        description: 'Retorna os cursos mais populares (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Cursos populares',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      curso: { $ref: '#/components/schemas/Curso' },
                      totalInscricoes: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
          '403': { description: 'Sem permissão' },
        },
      },
    },

    // Inscrições - endpoints adicionais
    '/inscricoes/curso/{id}': {
      get: {
        tags: ['Inscrições'],
        summary: 'Inscrições por curso',
        description: 'Lista inscrições de um curso específico',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de inscrições',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Inscricao' },
                },
              },
            },
          },
          '404': { description: 'Curso não encontrado' },
        },
      },
    },

    '/inscricoes/{id}/rejeitar': {
      put: {
        tags: ['Inscrições'],
        summary: 'Rejeitar inscrição',
        description: 'Rejeita uma inscrição pendente',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Inscrição rejeitada' },
          '404': { description: 'Inscrição não encontrada' },
        },
      },
    },

    '/inscricoes/{id}/cancelar': {
      put: {
        tags: ['Inscrições'],
        summary: 'Cancelar inscrição',
        description: 'Cancela uma inscrição',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Inscrição cancelada' },
          '404': { description: 'Inscrição não encontrada' },
        },
      },
    },

    // === MÓDULOS ===
    '/modulos': {
      get: {
        tags: ['Módulos'],
        summary: 'Listar módulos',
        description: 'Lista todos os módulos',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de módulos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    modulos: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Modulo' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Módulos'],
        summary: 'Criar módulo',
        description: 'Cria um novo módulo (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ModuloInput' },
            },
          },
        },
        responses: {
          '201': { description: 'Módulo criado com sucesso' },
          '400': { description: 'Dados inválidos' },
          '403': { description: 'Sem permissão' },
        },
      },
    },

    '/modulos/curso/{id}': {
      get: {
        tags: ['Módulos'],
        summary: 'Listar módulos por curso',
        description: 'Lista todos os módulos de um curso específico',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'includeAulas',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Incluir aulas de cada módulo',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de módulos do curso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    modulos: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Modulo' },
                    },
                  },
                },
              },
            },
          },
          '404': { description: 'Curso não encontrado' },
        },
      },
    },

    '/modulos/{id}': {
      get: {
        tags: ['Módulos'],
        summary: 'Obter módulo',
        description: 'Retorna um módulo específico',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Módulo encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    modulo: { $ref: '#/components/schemas/Modulo' },
                  },
                },
              },
            },
          },
          '404': { description: 'Módulo não encontrado' },
        },
      },
      put: {
        tags: ['Módulos'],
        summary: 'Atualizar módulo',
        description: 'Atualiza um módulo (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ModuloUpdate' },
            },
          },
        },
        responses: {
          '200': { description: 'Módulo atualizado' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Módulo não encontrado' },
        },
      },
      delete: {
        tags: ['Módulos'],
        summary: 'Deletar módulo',
        description: 'Remove um módulo (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Módulo deletado' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Módulo não encontrado' },
        },
      },
    },

    '/modulos/curso/{IDCurso}/reorder': {
      put: {
        tags: ['Módulos'],
        summary: 'Reordenar módulos',
        description: 'Reordena os módulos de um curso (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  modulos: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        ordem: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Módulos reordenados' },
          '403': { description: 'Sem permissão' },
        },
      },
    },

    // === AULAS ===
    '/aulas': {
      get: {
        tags: ['Aulas'],
        summary: 'Listar aulas',
        description: 'Lista todas as aulas',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de aulas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    aulas: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Aula' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Aulas'],
        summary: 'Criar aula',
        description: 'Cria uma nova aula (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AulaInput' },
            },
          },
        },
        responses: {
          '201': { description: 'Aula criada com sucesso' },
          '400': { description: 'Dados inválidos' },
          '403': { description: 'Sem permissão' },
        },
      },
    },

    '/aulas/modulo/{id}': {
      get: {
        tags: ['Aulas'],
        summary: 'Listar aulas por módulo',
        description: 'Lista todas as aulas de um módulo específico',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de aulas do módulo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    aulas: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Aula' },
                    },
                  },
                },
              },
            },
          },
          '404': { description: 'Módulo não encontrado' },
        },
      },
    },

    '/aulas/{id}': {
      get: {
        tags: ['Aulas'],
        summary: 'Obter aula',
        description: 'Retorna uma aula específica',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Aula encontrada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    aula: { $ref: '#/components/schemas/Aula' },
                  },
                },
              },
            },
          },
          '404': { description: 'Aula não encontrada' },
        },
      },
      put: {
        tags: ['Aulas'],
        summary: 'Atualizar aula',
        description: 'Atualiza uma aula (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AulaUpdate' },
            },
          },
        },
        responses: {
          '200': { description: 'Aula atualizada' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Aula não encontrada' },
        },
      },
      delete: {
        tags: ['Aulas'],
        summary: 'Deletar aula',
        description: 'Remove uma aula (admin only)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Aula deletada' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Aula não encontrada' },
        },
      },
    },

    '/aulas/{id}/concluir': {
      post: {
        tags: ['Aulas'],
        summary: 'Marcar aula como concluída',
        description: 'Marca uma aula como concluída pelo formando',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tempoGasto: { type: 'integer', description: 'Tempo gasto em minutos' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Aula marcada como concluída',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    progresso: { $ref: '#/components/schemas/ProgressoAula' },
                  },
                },
              },
            },
          },
          '404': { description: 'Aula não encontrada' },
        },
      },
      delete: {
        tags: ['Aulas'],
        summary: 'Desmarcar aula como concluída',
        description: 'Remove a marcação de conclusão de uma aula',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Marcação removida' },
          '404': { description: 'Aula não encontrada' },
        },
      },
    },

    '/aulas/progresso/curso/{IDCurso}': {
      get: {
        tags: ['Aulas'],
        summary: 'Obter progresso do curso',
        description: 'Retorna o progresso do formando em um curso',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Progresso do curso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    progresso: {
                      type: 'object',
                      properties: {
                        totalAulas: { type: 'integer' },
                        aulasConcluidas: { type: 'integer' },
                        percentual: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/aulas/progresso/meu': {
      get: {
        tags: ['Aulas'],
        summary: 'Obter meu progresso',
        description: 'Retorna todo o progresso do formando autenticado',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de progressos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    progressos: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ProgressoAula' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // === NOTIFICAÇÕES ===
    '/notificacoes': {
      get: {
        tags: ['Notificações'],
        summary: 'Listar notificações',
        description: 'Lista todas as notificações do utilizador',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de notificações',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    notificacoes: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Notificacao' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/notificacoes/nao-lidas': {
      get: {
        tags: ['Notificações'],
        summary: 'Listar notificações não lidas',
        description: 'Lista notificações não lidas do utilizador',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de notificações não lidas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    notificacoes: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Notificacao' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/notificacoes/nao-lidas/count': {
      get: {
        tags: ['Notificações'],
        summary: 'Contar notificações não lidas',
        description: 'Retorna a contagem de notificações não lidas',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Contagem de notificações',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'integer', example: 5 },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/notificacoes/{id}/marcar-lida': {
      put: {
        tags: ['Notificações'],
        summary: 'Marcar notificação como lida',
        description: 'Marca uma notificação específica como lida',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Notificação marcada como lida' },
          '404': { description: 'Notificação não encontrada' },
        },
      },
    },

    '/notificacoes/marcar-todas-lidas': {
      put: {
        tags: ['Notificações'],
        summary: 'Marcar todas como lidas',
        description: 'Marca todas as notificações do utilizador como lidas',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': { description: 'Todas as notificações marcadas como lidas' },
        },
      },
    },

    '/notificacoes/{id}': {
      delete: {
        tags: ['Notificações'],
        summary: 'Deletar notificação',
        description: 'Remove uma notificação',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Notificação deletada' },
          '404': { description: 'Notificação não encontrada' },
        },
      },
    },

    // === REVIEWS/AVALIAÇÕES - ADICIONADO ===
    '/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Criar review/avaliação',
        description: 'Cria uma nova avaliação para um curso (apenas formandos)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Review criada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensagem: { type: 'string' },
                    review: { $ref: '#/components/schemas/Review' },
                  },
                },
              },
            },
          },
          '400': { description: 'Dados inválidos' },
          '403': { description: 'Sem permissão (apenas formandos)' },
          '409': { description: 'Já possui avaliação para este curso' },
        },
      },
    },

    '/reviews/minhas': {
      get: {
        tags: ['Reviews'],
        summary: 'Minhas reviews',
        description: 'Lista todas as reviews do utilizador autenticado',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de reviews do utilizador',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Review' },
                },
              },
            },
          },
        },
      },
    },

    '/reviews/{id}': {
      get: {
        tags: ['Reviews'],
        summary: 'Obter review',
        description: 'Retorna uma review específica',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Review encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Review' },
              },
            },
          },
          '404': { description: 'Review não encontrada' },
        },
      },
      put: {
        tags: ['Reviews'],
        summary: 'Atualizar review',
        description: 'Atualiza uma review (apenas autor)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewUpdate' },
            },
          },
        },
        responses: {
          '200': { description: 'Review atualizada' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Review não encontrada' },
        },
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Deletar review',
        description: 'Remove uma review (autor ou admin)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Review deletada' },
          '403': { description: 'Sem permissão' },
          '404': { description: 'Review não encontrada' },
        },
      },
    },

    '/reviews/curso/{id}': {
      get: {
        tags: ['Reviews'],
        summary: 'Reviews por curso',
        description: 'Lista todas as reviews de um curso específico',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do curso',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de reviews do curso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Review' },
                },
              },
            },
          },
          '404': { description: 'Curso não encontrado' },
        },
      },
    },

    '/reviews/curso/{id}/stats': {
      get: {
        tags: ['Reviews'],
        summary: 'Estatísticas de reviews do curso',
        description: 'Retorna estatísticas das avaliações de um curso',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do curso',
          },
        ],
        responses: {
          '200': {
            description: 'Estatísticas das reviews',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewStats' },
              },
            },
          },
          '404': { description: 'Curso não encontrado' },
        },
      },
    },

    '/reviews/curso/{id}/minha': {
      get: {
        tags: ['Reviews'],
        summary: 'Minha review do curso',
        description: 'Retorna a review do utilizador para um curso específico',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do curso',
          },
        ],
        responses: {
          '200': {
            description: 'Review do utilizador',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Review' },
              },
            },
          },
          '404': { description: 'Review não encontrada' },
        },
      },
    },

    // Quiz Endpoints - Sistema de Avaliações
    '/quizzes': {
      post: {
        tags: ['Quizzes'],
        summary: 'Criar novo quiz',
        description: 'Cria um novo quiz para uma aula específica (apenas admins)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateQuizRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Quiz criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dados: { $ref: '#/components/schemas/Quiz' },
                    mensagem: { type: 'string', example: 'Quiz criado com sucesso' },
                  },
                },
              },
            },
          },
          '400': { description: 'Dados inválidos' },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Sem permissão para criar quizzes' },
          '404': { description: 'Aula não encontrada' },
        },
      },
    },

    '/quizzes/aula/{aulaId}': {
      get: {
        tags: ['Quizzes'],
        summary: 'Listar quizzes por aula',
        description: 'Lista todos os quizzes de uma aula específica',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'aulaId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID da aula',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de quizzes da aula',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dados: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Quiz' },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autenticado' },
          '404': { description: 'Aula não encontrada' },
        },
      },
    },

    '/quizzes/{id}': {
      get: {
        tags: ['Quizzes'],
        summary: 'Obter quiz específico',
        description: 'Retorna detalhes completos de um quiz (apenas admins)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do quiz',
          },
        ],
        responses: {
          '200': {
            description: 'Dados do quiz',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dados: { $ref: '#/components/schemas/QuizCompleto' },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Sem permissão para ver este quiz' },
          '404': { description: 'Quiz não encontrado' },
        },
      },
      put: {
        tags: ['Quizzes'],
        summary: 'Atualizar quiz',
        description: 'Atualiza um quiz existente (apenas admins)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do quiz',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateQuizRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Quiz atualizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dados: { $ref: '#/components/schemas/Quiz' },
                    mensagem: { type: 'string', example: 'Quiz atualizado com sucesso' },
                  },
                },
              },
            },
          },
          '400': { description: 'Dados inválidos' },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Sem permissão para atualizar quiz' },
          '404': { description: 'Quiz não encontrado' },
        },
      },
      delete: {
        tags: ['Quizzes'],
        summary: 'Deletar quiz',
        description: 'Remove um quiz permanentemente (apenas admins)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do quiz',
          },
        ],
        responses: {
          '200': {
            description: 'Quiz deletado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensagem: { type: 'string', example: 'Quiz deletado com sucesso' },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Sem permissão para deletar quiz' },
          '404': { description: 'Quiz não encontrado' },
        },
      },
    },

    '/quizzes/{id}/resolver': {
      get: {
        tags: ['Quizzes'],
        summary: 'Obter quiz para resolver',
        description: 'Retorna quiz preparado para resolução (sem respostas corretas)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do quiz',
          },
        ],
        responses: {
          '200': {
            description: 'Quiz para resolução',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dados: { $ref: '#/components/schemas/QuizParaResolver' },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Sem permissão ou quiz já concluído' },
          '404': { description: 'Quiz não encontrado' },
        },
      },
    },

    '/quizzes/{id}/submeter': {
      post: {
        tags: ['Quizzes'],
        summary: 'Submeter quiz',
        description: 'Submete respostas de um quiz para avaliação (com rate limiting)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do quiz',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SubmitQuizRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Quiz submetido com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dados: { $ref: '#/components/schemas/QuizResult' },
                    mensagem: { type: 'string', example: 'Quiz submetido com sucesso' },
                  },
                },
              },
            },
          },
          '400': { description: 'Dados inválidos ou quiz já submetido' },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Sem permissão ou limite de tentativas excedido' },
          '404': { description: 'Quiz não encontrado' },
          '429': { description: 'Rate limit excedido - aguarde antes de tentar novamente' },
        },
      },
    },

    '/quizzes/{id}/tentativas': {
      get: {
        tags: ['Quizzes'],
        summary: 'Obter tentativas do quiz',
        description: 'Lista tentativas realizadas pelo utilizador neste quiz',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do quiz',
          },
          {
            name: 'pagina',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: 'Número da página',
          },
          {
            name: 'limite',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
            description: 'Limite de resultados por página',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de tentativas do quiz',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dados: {
                      type: 'object',
                      properties: {
                        tentativas: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/QuizAttempt' },
                        },
                        total: { type: 'integer' },
                        pagina: { type: 'integer' },
                        limite: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autenticado' },
          '404': { description: 'Quiz não encontrado' },
        },
      },
    },

    '/quizzes/{id}/pode-reitentar': {
      get: {
        tags: ['Quizzes'],
        summary: 'Verificar se pode reitentar',
        description: 'Verifica se o utilizador pode fazer nova tentativa no quiz',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do quiz',
          },
        ],
        responses: {
          '200': {
            description: 'Status de retry disponível',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dados: {
                      type: 'object',
                      properties: {
                        podeReitentar: { type: 'boolean' },
                        tentativasRealizadas: { type: 'integer' },
                        maxTentativas: { type: 'integer' },
                        ultimaTentativa: { type: 'string', format: 'date-time', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autenticado' },
          '404': { description: 'Quiz não encontrado' },
        },
      },
    },

    // Certificate Endpoints - Sistema de Certificados
    '/certificados/validar/{codigo}': {
      get: {
        tags: ['Certificados'],
        summary: 'Validar certificado (público)',
        description: 'Valida a autenticidade de um certificado usando seu código único. Endpoint público.',
        parameters: [
          {
            name: 'codigo',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^[a-zA-Z0-9]{8,64}$',
            },
            description: 'Código único do certificado (8-64 caracteres alfanuméricos)',
          },
        ],
        responses: {
          '200': {
            description: 'Certificado válido',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dados: { $ref: '#/components/schemas/CertificateValidation' },
                  },
                },
              },
            },
          },
          '400': { description: 'Código do certificado inválido' },
          '404': { description: 'Certificado não encontrado ou inválido' },
        },
      },
    },

    '/certificados': {
      get: {
        tags: ['Certificados'],
        summary: 'Listar meus certificados',
        description: 'Lista todos os certificados do utilizador autenticado com filtros opcionais',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'pagina',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: 'Número da página',
          },
          {
            name: 'limite',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
            description: 'Limite de resultados por página',
          },
          {
            name: 'cursoNome',
            in: 'query',
            schema: { type: 'string', maxLength: 255 },
            description: 'Filtrar por nome do curso',
          },
          {
            name: 'dataInicio',
            in: 'query',
            schema: { type: 'string', format: 'date-time' },
            description: 'Data de início do período de filtragem',
          },
          {
            name: 'dataFim',
            in: 'query',
            schema: { type: 'string', format: 'date-time' },
            description: 'Data de fim do período de filtragem',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de certificados',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dados: {
                      type: 'object',
                      properties: {
                        certificados: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Certificate' },
                        },
                        total: { type: 'integer' },
                        pagina: { type: 'integer' },
                        limite: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Parâmetros de consulta inválidos' },
          '401': { description: 'Não autenticado' },
        },
      },
    },

    '/certificados/download/{cursoId}': {
      get: {
        tags: ['Certificados'],
        summary: 'Download do certificado',
        description: 'Download do certificado em PDF para um curso específico (com rate limiting)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'cursoId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do curso',
          },
        ],
        responses: {
          '200': {
            description: 'Arquivo PDF do certificado',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
            headers: {
              'Content-Disposition': {
                description: 'Nome do arquivo do certificado',
                schema: { type: 'string' },
              },
            },
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Curso não concluído ou certificado não disponível' },
          '404': { description: 'Curso ou certificado não encontrado' },
          '429': { description: 'Rate limit excedido - aguarde antes de tentar novamente' },
        },
      },
    },

    '/certificados/elegibilidade/{cursoId}': {
      get: {
        tags: ['Certificados'],
        summary: 'Verificar elegibilidade para certificado',
        description: 'Verifica se o utilizador é elegível para receber certificado do curso',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'cursoId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do curso',
          },
        ],
        responses: {
          '200': {
            description: 'Status de elegibilidade',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dados: {
                      type: 'object',
                      properties: {
                        elegivel: { type: 'boolean' },
                        motivo: { type: 'string', nullable: true },
                        progressoCurso: { type: 'number', minimum: 0, maximum: 100 },
                        notaFinal: { type: 'number', minimum: 0, maximum: 20, nullable: true },
                        notaMinimaRequerida: { type: 'number', minimum: 0, maximum: 20 },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autenticado' },
          '404': { description: 'Curso não encontrado ou utilizador não inscrito' },
        },
      },
    },

    '/certificados/gerar/{cursoId}': {
      post: {
        tags: ['Certificados'],
        summary: 'Gerar certificado',
        description: 'Gera um novo certificado para o curso concluído (com rate limiting)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: 'cursoId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do curso',
          },
        ],
        responses: {
          '201': {
            description: 'Certificado gerado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dados: { $ref: '#/components/schemas/Certificate' },
                    mensagem: { type: 'string', example: 'Certificado gerado com sucesso' },
                  },
                },
              },
            },
          },
          '400': { description: 'Certificado já existe ou curso não concluído' },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Não elegível para certificado' },
          '404': { description: 'Curso não encontrado' },
          '429': { description: 'Rate limit excedido - aguarde antes de tentar novamente' },
        },
      },
    },
  },

  // Tags organizadas por módulo
  tags: [
    {
      name: 'System',
      description: 'Endpoints do sistema (health check)',
    },
    {
      name: 'Auth',
      description: 'Autenticação, autorização e gestão de sessões',
    },
    {
      name: 'Cursos',
      description: 'Gestão de cursos',
    },
    {
      name: 'Inscrições',
      description: 'Gestão de inscrições em cursos',
    },
    {
      name: 'Categorias',
      description: 'Categorias de cursos',
    },
    {
      name: 'Áreas',
      description: 'Áreas de conhecimento',
    },
    {
      name: 'Utilizadores',
      description: 'Gestão de utilizadores e perfis',
    },
    {
      name: 'Admin',
      description: 'Endpoints administrativos e estatísticas',
    },
    {
      name: 'Módulos',
      description: 'Gestão de módulos de cursos',
    },
    {
      name: 'Aulas',
      description: 'Gestão de aulas e progresso do formando',
    },
    {
      name: 'Notificações',
      description: 'Notificações do utilizador',
    },
    {
      name: 'Reviews',
      description: 'Sistema de avaliações e reviews de cursos',
    },
    {
      name: 'Quizzes',
      description: 'Sistema de quizzes e avaliações de aprendizagem',
    },
    {
      name: 'Certificados',
      description: 'Gestão e validação de certificados de conclusão',
    },
  ],
};
