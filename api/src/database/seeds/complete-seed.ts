import { db } from '../db';
import { utilizadores, admins, formandos, areas, categorias, cursos, inscricoes, reviews, notificacoes, account, progressoAulas, aulas, modulos } from '../schema';
import { eq } from 'drizzle-orm';
import { auth } from '../../lib/auth';

import logger from '../../utils/logger';
import { addDays, subDays, subHours, subMonths } from 'date-fns';

const shouldClean = process.argv.includes('--clean');

async function cleanDatabase() {
  logger.info('Cleaning database...');

  await db.delete(progressoAulas);
  await db.delete(notificacoes);
  await db.delete(inscricoes);
  await db.delete(cursos);
  await db.delete(categorias);
  await db.delete(areas);
  await db.delete(formandos);
  await db.delete(admins);
  await db.delete(account);
  await db.delete(utilizadores);

  logger.info('Database cleaned');
}

async function seedAreas() {
  logger.info('Seeding areas...');

  const areasData = [
    {
      nome: 'Tecnologia da Informação',
      descricao: 'Cursos relacionados com programação, desenvolvimento de software e infraestrutura de TI'
    },
    {
      nome: 'Gestão e Liderança',
      descricao: 'Cursos de gestão de equipas, liderança estratégica e gestão de projetos'
    },
    {
      nome: 'Marketing Digital',
      descricao: 'Cursos de estratégias digitais, SEO, redes sociais e publicidade online'
    },
    {
      nome: 'Design e Criatividade',
      descricao: 'Cursos de design gráfico, UX/UI e ferramentas criativas'
    },
    {
      nome: 'Recursos Humanos',
      descricao: 'Cursos de gestão de talento, recrutamento e desenvolvimento organizacional'
    },
    {
      nome: 'Finanças e Contabilidade',
      descricao: 'Cursos de gestão financeira, contabilidade e análise de investimentos'
    },
    {
      nome: 'Comunicação',
      descricao: 'Cursos de comunicação empresarial, apresentações e oratória'
    },
    {
      nome: 'Vendas e Comercial',
      descricao: 'Cursos de técnicas de venda, negociação e gestão comercial'
    }
  ];

  const insertedAreas = await db.insert(areas).values(areasData).returning();
  logger.info('Areas created', { count: insertedAreas.length });

  return insertedAreas;
}

async function seedCategorias(areasInserted: any[]) {
  logger.info('Seeding categorias...');

  const categoriasData = [
    { areaId: areasInserted[0].id, nome: 'Desenvolvimento Web', descricao: 'Frontend, Backend e Fullstack' },
    { areaId: areasInserted[0].id, nome: 'DevOps e Cloud', descricao: 'CI/CD, Docker, Kubernetes, AWS' },
    { areaId: areasInserted[0].id, nome: 'Data Science', descricao: 'Machine Learning, IA e análise de dados' },

    { areaId: areasInserted[1].id, nome: 'Liderança Estratégica', descricao: 'Gestão de equipas e tomada de decisão' },
    { areaId: areasInserted[1].id, nome: 'Gestão de Projetos', descricao: 'Metodologias ágeis e gestão tradicional' },
    { areaId: areasInserted[1].id, nome: 'Gestão de Mudança', descricao: 'Transformação digital e cultural' },

    { areaId: areasInserted[2].id, nome: 'Redes Sociais', descricao: 'Instagram, Facebook, LinkedIn, TikTok' },
    { areaId: areasInserted[2].id, nome: 'SEO e SEM', descricao: 'Otimização e marketing de motores de busca' },
    { areaId: areasInserted[2].id, nome: 'Email Marketing', descricao: 'Automação e estratégias de email' },

    { areaId: areasInserted[3].id, nome: 'Design Gráfico', descricao: 'Photoshop, Illustrator e branding' },
    { areaId: areasInserted[3].id, nome: 'UX/UI Design', descricao: 'Experiência e interface de utilizador' },
    { areaId: areasInserted[3].id, nome: 'Motion Design', descricao: 'Animação e design em movimento' },

    { areaId: areasInserted[4].id, nome: 'Recrutamento e Seleção', descricao: 'Técnicas de entrevista e avaliação' },
    { areaId: areasInserted[4].id, nome: 'Gestão de Desempenho', descricao: 'Avaliação e desenvolvimento de colaboradores' },
    { areaId: areasInserted[4].id, nome: 'Cultura Organizacional', descricao: 'Employee experience e engagement' },

    { areaId: areasInserted[5].id, nome: 'Análise Financeira', descricao: 'Demonstrações financeiras e KPIs' },
    { areaId: areasInserted[5].id, nome: 'Contabilidade Geral', descricao: 'Princípios contabilísticos e fiscalidade' },
    { areaId: areasInserted[5].id, nome: 'Gestão de Investimentos', descricao: 'Portfólios e mercados financeiros' },

    { areaId: areasInserted[6].id, nome: 'Comunicação Empresarial', descricao: 'Redação e comunicação corporativa' },
    { areaId: areasInserted[6].id, nome: 'Oratória', descricao: 'Apresentações em público e storytelling' },
    { areaId: areasInserted[6].id, nome: 'Comunicação Digital', descricao: 'Content marketing e comunicação online' },

    { areaId: areasInserted[7].id, nome: 'Técnicas de Venda', descricao: 'Prospecção e fecho de vendas' },
    { areaId: areasInserted[7].id, nome: 'Negociação', descricao: 'Estratégias e táticas de negociação' },
    { areaId: areasInserted[7].id, nome: 'Gestão Comercial', descricao: 'Pipeline e CRM' }
  ];

  const insertedCategorias = await db.insert(categorias).values(categoriasData).returning();
  logger.info('Categorias created', { count: insertedCategorias.length });

  return insertedCategorias;
}

async function seedUtilizadores() {
  logger.info('Seeding utilizadores...');

  const adminsData = [
    {
      nome: 'Administrador Principal',
      email: 'admin@onesam.pt',
      senha: 'Admin@2025',
      departamento: 'Administração Geral',
      nivelAcesso: 'super_admin'
    },
    {
      nome: 'João Silva',
      email: 'joao.silva@onesam.pt',
      senha: 'Admin@2025',
      departamento: 'Tecnologia',
      nivelAcesso: 'admin'
    },
    {
      nome: 'Maria Santos',
      email: 'maria.santos@onesam.pt',
      senha: 'Admin@2025',
      departamento: 'Recursos Humanos',
      nivelAcesso: 'admin'
    }
  ];

  const formandosData = [
    { nome: 'Pedro Costa', email: 'pedro.costa@teste.pt', senha: 'Formando@123', empresa: 'Tech Solutions', cargo: 'Desenvolvedor Frontend', areaInteresse: 'Desenvolvimento Web', objetivos: 'Aprender React e TypeScript' },
    { nome: 'Ana Pereira', email: 'ana.pereira@teste.pt', senha: 'Formando@123', empresa: 'Digital Marketing Lda', cargo: 'Marketing Manager', areaInteresse: 'Marketing Digital', objetivos: 'Melhorar estratégias de redes sociais' },
    { nome: 'Carlos Oliveira', email: 'carlos.oliveira@teste.pt', senha: 'Formando@123', empresa: 'Design Studio', cargo: 'Designer Gráfico', areaInteresse: 'Design', objetivos: 'Dominar Figma e UX/UI' },
    { nome: 'Sofia Rodrigues', email: 'sofia.rodrigues@teste.pt', senha: 'Formando@123', empresa: 'Consultoria HR', cargo: 'HR Manager', areaInteresse: 'Recursos Humanos', objetivos: 'Aprofundar gestão de talento' },
    { nome: 'Miguel Fernandes', email: 'miguel.fernandes@teste.pt', senha: 'Formando@123', empresa: 'FinTech Corp', cargo: 'Analista Financeiro', areaInteresse: 'Finanças', objetivos: 'Especialização em análise de investimentos' },
    { nome: 'Rita Alves', email: 'rita.alves@teste.pt', senha: 'Formando@123', empresa: 'Startup XYZ', cargo: 'Product Manager', areaInteresse: 'Gestão', objetivos: 'Metodologias ágeis e Scrum' },
    { nome: 'Tiago Martins', email: 'tiago.martins@teste.pt', senha: 'Formando@123', empresa: 'CloudTech', cargo: 'DevOps Engineer', areaInteresse: 'DevOps', objetivos: 'Kubernetes e AWS avançado' },
    { nome: 'Beatriz Sousa', email: 'beatriz.sousa@teste.pt', senha: 'Formando@123', empresa: 'E-commerce Plus', cargo: 'Vendedora', areaInteresse: 'Vendas', objetivos: 'Técnicas de venda consultiva' },
    { nome: 'Rui Gonçalves', email: 'rui.goncalves@teste.pt', senha: 'Formando@123', empresa: 'Media Group', cargo: 'Gestor de Comunicação', areaInteresse: 'Comunicação', objetivos: 'Storytelling e content marketing' },
    { nome: 'Catarina Lopes', email: 'catarina.lopes@teste.pt', senha: 'Formando@123', empresa: 'Data Analytics', cargo: 'Data Scientist', areaInteresse: 'Data Science', objetivos: 'Machine Learning e Python' },
    { nome: 'Bruno Ferreira', email: 'bruno.ferreira@teste.pt', senha: 'Formando@123', empresa: 'Freelancer', cargo: 'Desenvolvedor Full Stack', areaInteresse: 'Programação', objetivos: 'Node.js e Next.js' },
    { nome: 'Inês Carvalho', email: 'ines.carvalho@teste.pt', senha: 'Formando@123', empresa: 'Agency Creative', cargo: 'Motion Designer', areaInteresse: 'Design', objetivos: 'After Effects avançado' },
    { nome: 'Diogo Pinto', email: 'diogo.pinto@teste.pt', senha: 'Formando@123', empresa: 'Sales Corp', cargo: 'Diretor Comercial', areaInteresse: 'Gestão Comercial', objetivos: 'Liderança de equipes de vendas' },
    { nome: 'Mariana Nunes', email: 'mariana.nunes@teste.pt', senha: 'Formando@123', empresa: 'Banco XYZ', cargo: 'Contabilista', areaInteresse: 'Contabilidade', objetivos: 'Certificação contabilística' },
    { nome: 'André Ribeiro', email: 'andre.ribeiro@teste.pt', senha: 'Formando@123', empresa: 'Tech Startup', cargo: 'CTO', areaInteresse: 'Liderança Técnica', objetivos: 'Gestão de equipas de engenharia' },
    { nome: 'Joana Teixeira', email: 'joana.teixeira@teste.pt', senha: 'Formando@123', empresa: 'SEO Agency', cargo: 'SEO Specialist', areaInteresse: 'SEO', objetivos: 'SEO técnico e link building' },
    { nome: 'Nuno Correia', email: 'nuno.correia@teste.pt', senha: 'Formando@123', empresa: 'Innovation Lab', cargo: 'UX Designer', areaInteresse: 'UX/UI', objetivos: 'Design thinking e prototipagem' }
  ];

  const insertedAdmins = [];
  const insertedFormandos = [];

  for (const admin of adminsData) {
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: admin.email,
        password: admin.senha,
        name: admin.nome,
        tipoPerfil: 'admin',
      } as any,
    });

    if (!signUpResult || !signUpResult.user) {
      logger.error('Failed to create admin user', { email: admin.email });
      continue;
    }

    const userId = parseInt(signUpResult.user.id as string, 10);

    await db.update(utilizadores)
      .set({
        emailVerified: true,
        tipoPerfil: 'admin',
        ativo: true
      })
      .where(eq(utilizadores.id, userId));

    const [adminProfile] = await db.insert(admins).values({
      utilizadorId: userId,
      departamento: admin.departamento,
      nivelAcesso: admin.nivelAcesso
    }).returning();

    await db.update(utilizadores)
      .set({ perfilId: adminProfile.id })
      .where(eq(utilizadores.id, userId));

    insertedAdmins.push({ user: signUpResult.user, profile: adminProfile });
  }

  for (const formando of formandosData) {
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: formando.email,
        password: formando.senha,
        name: formando.nome,
        tipoPerfil: 'formando',
      } as any,
    });

    if (!signUpResult || !signUpResult.user) {
      logger.error('Failed to create formando user', { email: formando.email });
      continue;
    }

    const userId = parseInt(signUpResult.user.id as string, 10);

    await db.update(utilizadores)
      .set({
        emailVerified: true,
        tipoPerfil: 'formando',
        ativo: true
      })
      .where(eq(utilizadores.id, userId));

    const [formandoProfile] = await db.insert(formandos).values({
      utilizadorId: userId,
      empresa: formando.empresa,
      cargo: formando.cargo,
      areaInteresse: formando.areaInteresse,
      objetivosAprendizagem: formando.objetivos
    }).returning();

    await db.update(utilizadores)
      .set({ perfilId: formandoProfile.id })
      .where(eq(utilizadores.id, userId));

    insertedFormandos.push({ user: signUpResult.user, profile: formandoProfile });
  }

  logger.info('Utilizadores created', {
    admins: insertedAdmins.length,
    formandos: insertedFormandos.length
  });

  return { admins: insertedAdmins, formandos: insertedFormandos };
}

async function seedCursos(areasInserted: any[], categoriasInserted: any[]) {
  logger.info('Seeding cursos...');

  const hoje = new Date();

  const cursosData = [
    {
      nome: 'React 19 Completo - Do Básico ao Avançado',
      descricao: 'Aprenda React 19 com TypeScript, hooks, context API e boas práticas de desenvolvimento frontend moderno',
      imagemCurso: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      nivel: 'intermedio' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 15),
      dataFim: addDays(hoje, 45),
      dataLimiteInscricao: addDays(hoje, 10),
      limiteVagas: 30,
      cargaHoraria: 40,
      notaMinimaAprovacao: 12,
      areaId: areasInserted[0].id,
      categoriaId: categoriasInserted[0].id
    },
    {
      nome: 'Python para Data Science',
      descricao: 'Domine Python, Pandas, NumPy e Machine Learning para análise de dados e ciência de dados',
      imagemCurso: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
      nivel: 'avancado' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 20),
      dataFim: addDays(hoje, 40),
      dataLimiteInscricao: addDays(hoje, 5),
      limiteVagas: 25,
      cargaHoraria: 60,
      notaMinimaAprovacao: 14,
      areaId: areasInserted[0].id,
      categoriaId: categoriasInserted[2].id
    },
    {
      nome: 'DevOps Essencial - Docker e Kubernetes',
      descricao: 'Aprenda containers, orquestração, CI/CD e as melhores práticas de DevOps',
      imagemCurso: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
      nivel: 'avancado' as const,
      estado: 'planeado' as const,
      visivel: true,
      certificado: true,
      dataInicio: addDays(hoje, 30),
      dataFim: addDays(hoje, 90),
      dataLimiteInscricao: addDays(hoje, 25),
      limiteVagas: 20,
      cargaHoraria: 50,
      notaMinimaAprovacao: 13,
      areaId: areasInserted[0].id,
      categoriaId: categoriasInserted[1].id
    },
    {
      nome: 'Introdução à Programação Web',
      descricao: 'HTML, CSS e JavaScript para iniciantes - crie seus primeiros websites',
      imagemCurso: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      nivel: 'iniciante' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 10),
      dataFim: addDays(hoje, 50),
      dataLimiteInscricao: addDays(hoje, 15),
      limiteVagas: 50,
      cargaHoraria: 30,
      notaMinimaAprovacao: 10,
      areaId: areasInserted[0].id,
      categoriaId: categoriasInserted[0].id
    },
    {
      nome: 'Liderança Estratégica para Gestores',
      descricao: 'Desenvolva competências de liderança, tomada de decisão e gestão de equipas de alta performance',
      imagemCurso: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      nivel: 'avancado' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 25),
      dataFim: addDays(hoje, 35),
      dataLimiteInscricao: addDays(hoje, 3),
      limiteVagas: 15,
      cargaHoraria: 40,
      notaMinimaAprovacao: 12,
      areaId: areasInserted[1].id,
      categoriaId: categoriasInserted[3].id
    },
    {
      nome: 'Gestão de Projetos com Metodologias Ágeis',
      descricao: 'Scrum, Kanban e frameworks ágeis para gestão eficaz de projetos',
      imagemCurso: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      nivel: 'intermedio' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 18),
      dataFim: addDays(hoje, 42),
      dataLimiteInscricao: addDays(hoje, 8),
      limiteVagas: 35,
      cargaHoraria: 35,
      notaMinimaAprovacao: 11,
      areaId: areasInserted[1].id,
      categoriaId: categoriasInserted[4].id
    },
    {
      nome: 'Transformação Digital nas Organizações',
      descricao: 'Lidere processos de mudança e transformação digital com sucesso',
      imagemCurso: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
      nivel: 'avancado' as const,
      estado: 'planeado' as const,
      visivel: true,
      certificado: true,
      dataInicio: addDays(hoje, 45),
      dataFim: addDays(hoje, 105),
      dataLimiteInscricao: addDays(hoje, 40),
      limiteVagas: 20,
      cargaHoraria: 45,
      notaMinimaAprovacao: 13,
      areaId: areasInserted[1].id,
      categoriaId: categoriasInserted[5].id
    },
    {
      nome: 'Marketing nas Redes Sociais',
      descricao: 'Estratégias avançadas para Instagram, Facebook, LinkedIn e TikTok',
      imagemCurso: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
      nivel: 'intermedio' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 12),
      dataFim: addDays(hoje, 48),
      dataLimiteInscricao: addDays(hoje, 12),
      limiteVagas: 40,
      cargaHoraria: 30,
      notaMinimaAprovacao: 11,
      areaId: areasInserted[2].id,
      categoriaId: categoriasInserted[6].id
    },
    {
      nome: 'SEO e Google Ads - Marketing de Performance',
      descricao: 'Otimização para motores de busca e campanhas pagas de alto ROI',
      imagemCurso: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      nivel: 'avancado' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 8),
      dataFim: addDays(hoje, 52),
      dataLimiteInscricao: addDays(hoje, 18),
      limiteVagas: 30,
      cargaHoraria: 40,
      notaMinimaAprovacao: 12,
      areaId: areasInserted[2].id,
      categoriaId: categoriasInserted[7].id
    },
    {
      nome: 'Email Marketing e Automação',
      descricao: 'Crie campanhas de email eficazes e automatize seu marketing',
      imagemCurso: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
      nivel: 'iniciante' as const,
      estado: 'planeado' as const,
      visivel: true,
      certificado: false,
      dataInicio: addDays(hoje, 20),
      dataFim: addDays(hoje, 50),
      dataLimiteInscricao: addDays(hoje, 15),
      limiteVagas: 45,
      cargaHoraria: 20,
      notaMinimaAprovacao: 10,
      areaId: areasInserted[2].id,
      categoriaId: categoriasInserted[8].id
    },
    {
      nome: 'Design Gráfico com Adobe Creative Suite',
      descricao: 'Photoshop, Illustrator e InDesign para criação profissional',
      imagemCurso: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      nivel: 'intermedio' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 22),
      dataFim: addDays(hoje, 38),
      dataLimiteInscricao: addDays(hoje, 6),
      limiteVagas: 25,
      cargaHoraria: 50,
      notaMinimaAprovacao: 12,
      areaId: areasInserted[3].id,
      categoriaId: categoriasInserted[9].id
    },
    {
      nome: 'UX/UI Design - Experiência do Utilizador',
      descricao: 'Design thinking, prototipagem e criação de interfaces centradas no utilizador',
      imagemCurso: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800',
      nivel: 'intermedio' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 15),
      dataFim: addDays(hoje, 45),
      dataLimiteInscricao: addDays(hoje, 10),
      limiteVagas: 30,
      cargaHoraria: 45,
      notaMinimaAprovacao: 12,
      areaId: areasInserted[3].id,
      categoriaId: categoriasInserted[10].id
    },
    {
      nome: 'Motion Design e Animação',
      descricao: 'After Effects e animação para vídeos e motion graphics profissionais',
      imagemCurso: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
      nivel: 'avancado' as const,
      estado: 'planeado' as const,
      visivel: true,
      certificado: true,
      dataInicio: addDays(hoje, 35),
      dataFim: addDays(hoje, 95),
      dataLimiteInscricao: addDays(hoje, 30),
      limiteVagas: 20,
      cargaHoraria: 55,
      notaMinimaAprovacao: 13,
      areaId: areasInserted[3].id,
      categoriaId: categoriasInserted[11].id
    },
    {
      nome: 'Recrutamento e Seleção Estratégica',
      descricao: 'Técnicas avançadas de entrevista, avaliação e atração de talento',
      imagemCurso: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      nivel: 'intermedio' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 10),
      dataFim: addDays(hoje, 50),
      dataLimiteInscricao: addDays(hoje, 15),
      limiteVagas: 30,
      cargaHoraria: 35,
      notaMinimaAprovacao: 11,
      areaId: areasInserted[4].id,
      categoriaId: categoriasInserted[12].id
    },
    {
      nome: 'Gestão de Desempenho e Avaliação',
      descricao: 'Sistemas de avaliação, feedback e desenvolvimento de colaboradores',
      imagemCurso: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      nivel: 'avancado' as const,
      estado: 'terminado' as const,
      visivel: true,
      certificado: true,
      dataInicio: subMonths(hoje, 3),
      dataFim: subMonths(hoje, 1),
      dataLimiteInscricao: subMonths(hoje, 4),
      limiteVagas: 25,
      cargaHoraria: 40,
      notaMinimaAprovacao: 12,
      areaId: areasInserted[4].id,
      categoriaId: categoriasInserted[13].id
    },
    {
      nome: 'Cultura Organizacional e Employee Experience',
      descricao: 'Construa culturas fortes e melhore a experiência dos colaboradores',
      imagemCurso: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
      nivel: 'intermedio' as const,
      estado: 'terminado' as const,
      visivel: true,
      certificado: true,
      dataInicio: subMonths(hoje, 4),
      dataFim: subMonths(hoje, 2),
      dataLimiteInscricao: subMonths(hoje, 5),
      limiteVagas: 35,
      cargaHoraria: 30,
      notaMinimaAprovacao: 11,
      areaId: areasInserted[4].id,
      categoriaId: categoriasInserted[14].id
    },
    {
      nome: 'Análise Financeira para Gestores',
      descricao: 'Leia e interprete demonstrações financeiras e tome decisões baseadas em dados',
      imagemCurso: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
      nivel: 'intermedio' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 14),
      dataFim: addDays(hoje, 46),
      dataLimiteInscricao: addDays(hoje, 11),
      limiteVagas: 30,
      cargaHoraria: 40,
      notaMinimaAprovacao: 12,
      areaId: areasInserted[5].id,
      categoriaId: categoriasInserted[15].id
    },
    {
      nome: 'Contabilidade Geral e Fiscalidade',
      descricao: 'Princípios contabilísticos, demonstrações financeiras e obrigações fiscais',
      imagemCurso: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
      nivel: 'iniciante' as const,
      estado: 'planeado' as const,
      visivel: true,
      certificado: true,
      dataInicio: addDays(hoje, 25),
      dataFim: addDays(hoje, 85),
      dataLimiteInscricao: addDays(hoje, 20),
      limiteVagas: 40,
      cargaHoraria: 50,
      notaMinimaAprovacao: 11,
      areaId: areasInserted[5].id,
      categoriaId: categoriasInserted[16].id
    },
    {
      nome: 'Gestão de Investimentos e Portfólios',
      descricao: 'Estratégias de investimento, análise de risco e gestão de carteiras',
      imagemCurso: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
      nivel: 'avancado' as const,
      estado: 'terminado' as const,
      visivel: true,
      certificado: true,
      dataInicio: subMonths(hoje, 5),
      dataFim: subMonths(hoje, 2),
      dataLimiteInscricao: subMonths(hoje, 6),
      limiteVagas: 20,
      cargaHoraria: 60,
      notaMinimaAprovacao: 13,
      areaId: areasInserted[5].id,
      categoriaId: categoriasInserted[17].id
    },
    {
      nome: 'Comunicação Empresarial Eficaz',
      descricao: 'Redação corporativa, comunicação interna e externa',
      imagemCurso: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800',
      nivel: 'iniciante' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: false,
      dataInicio: subDays(hoje, 8),
      dataFim: addDays(hoje, 22),
      dataLimiteInscricao: addDays(hoje, 7),
      limiteVagas: 50,
      cargaHoraria: 20,
      notaMinimaAprovacao: 10,
      areaId: areasInserted[6].id,
      categoriaId: categoriasInserted[18].id
    },
    {
      nome: 'Oratória e Apresentações em Público',
      descricao: 'Domine a arte de falar em público e fazer apresentações impactantes',
      imagemCurso: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
      nivel: 'intermedio' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 20),
      dataFim: addDays(hoje, 40),
      dataLimiteInscricao: addDays(hoje, 5),
      limiteVagas: 25,
      cargaHoraria: 30,
      notaMinimaAprovacao: 11,
      areaId: areasInserted[6].id,
      categoriaId: categoriasInserted[19].id
    },
    {
      nome: 'Content Marketing e Storytelling',
      descricao: 'Crie conteúdo envolvente e conte histórias que conectam com sua audiência',
      imagemCurso: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800',
      nivel: 'intermedio' as const,
      estado: 'terminado' as const,
      visivel: true,
      certificado: true,
      dataInicio: subMonths(hoje, 3),
      dataFim: subMonths(hoje, 1),
      dataLimiteInscricao: subMonths(hoje, 4),
      limiteVagas: 35,
      cargaHoraria: 35,
      notaMinimaAprovacao: 11,
      areaId: areasInserted[6].id,
      categoriaId: categoriasInserted[20].id
    },
    {
      nome: 'Técnicas Avançadas de Venda',
      descricao: 'Prospecção, qualificação e fecho de vendas de alto valor',
      imagemCurso: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
      nivel: 'avancado' as const,
      estado: 'em_curso' as const,
      visivel: true,
      certificado: true,
      dataInicio: subDays(hoje, 12),
      dataFim: addDays(hoje, 48),
      dataLimiteInscricao: addDays(hoje, 13),
      limiteVagas: 30,
      cargaHoraria: 40,
      notaMinimaAprovacao: 12,
      areaId: areasInserted[7].id,
      categoriaId: categoriasInserted[21].id
    },
    {
      nome: 'Negociação: Estratégias e Táticas',
      descricao: 'Técnicas de negociação win-win e gestão de conflitos',
      imagemCurso: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
      nivel: 'intermedio' as const,
      estado: 'terminado' as const,
      visivel: true,
      certificado: true,
      dataInicio: subMonths(hoje, 4),
      dataFim: subMonths(hoje, 2),
      dataLimiteInscricao: subMonths(hoje, 5),
      limiteVagas: 30,
      cargaHoraria: 30,
      notaMinimaAprovacao: 11,
      areaId: areasInserted[7].id,
      categoriaId: categoriasInserted[22].id
    },
    {
      nome: 'Gestão Comercial e CRM',
      descricao: 'Pipeline de vendas, métricas comerciais e gestão de relacionamento com clientes',
      imagemCurso: 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=800',
      nivel: 'intermedio' as const,
      estado: 'planeado' as const,
      visivel: true,
      certificado: true,
      dataInicio: addDays(hoje, 40),
      dataFim: addDays(hoje, 100),
      dataLimiteInscricao: addDays(hoje, 35),
      limiteVagas: 35,
      cargaHoraria: 40,
      notaMinimaAprovacao: 11,
      areaId: areasInserted[7].id,
      categoriaId: categoriasInserted[23].id
    },
    {
      nome: 'Node.js e Express - Backend Completo',
      descricao: 'Construa APIs RESTful robustas com Node.js, Express e MongoDB',
      imagemCurso: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      nivel: 'intermedio' as const,
      estado: 'terminado' as const,
      visivel: true,
      certificado: true,
      dataInicio: subMonths(hoje, 5),
      dataFim: subMonths(hoje, 3),
      dataLimiteInscricao: subMonths(hoje, 6),
      limiteVagas: 30,
      cargaHoraria: 50,
      notaMinimaAprovacao: 12,
      areaId: areasInserted[0].id,
      categoriaId: categoriasInserted[0].id
    },
    {
      nome: 'TypeScript Avançado',
      descricao: 'Domine TypeScript com tipos avançados, generics e design patterns',
      imagemCurso: 'https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=800',
      nivel: 'avancado' as const,
      estado: 'terminado' as const,
      visivel: true,
      certificado: true,
      dataInicio: subMonths(hoje, 4),
      dataFim: subMonths(hoje, 2),
      dataLimiteInscricao: subMonths(hoje, 5),
      limiteVagas: 25,
      cargaHoraria: 40,
      notaMinimaAprovacao: 13,
      areaId: areasInserted[0].id,
      categoriaId: categoriasInserted[0].id
    },
    {
      nome: 'Figma para Designers',
      descricao: 'Design de interfaces, prototipagem e colaboração no Figma',
      imagemCurso: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800',
      nivel: 'iniciante' as const,
      estado: 'planeado' as const,
      visivel: true,
      certificado: false,
      dataInicio: addDays(hoje, 15),
      dataFim: addDays(hoje, 45),
      dataLimiteInscricao: addDays(hoje, 10),
      limiteVagas: 40,
      cargaHoraria: 25,
      notaMinimaAprovacao: 10,
      areaId: areasInserted[3].id,
      categoriaId: categoriasInserted[10].id
    },
    {
      nome: 'Excel Avançado para Negócios',
      descricao: 'Fórmulas complexas, tabelas dinâmicas e automação com VBA',
      imagemCurso: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
      nivel: 'avancado' as const,
      estado: 'terminado' as const,
      visivel: true,
      certificado: true,
      dataInicio: subMonths(hoje, 6),
      dataFim: subMonths(hoje, 4),
      dataLimiteInscricao: subMonths(hoje, 7),
      limiteVagas: 40,
      cargaHoraria: 35,
      notaMinimaAprovacao: 12,
      areaId: areasInserted[5].id,
      categoriaId: categoriasInserted[15].id
    },
    {
      nome: 'Power BI para Análise de Dados',
      descricao: 'Visualização de dados, dashboards interativos e DAX',
      imagemCurso: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      nivel: 'intermedio' as const,
      estado: 'arquivado' as const,
      visivel: false,
      certificado: true,
      dataInicio: subMonths(hoje, 8),
      dataFim: subMonths(hoje, 6),
      dataLimiteInscricao: subMonths(hoje, 9),
      limiteVagas: 30,
      cargaHoraria: 40,
      notaMinimaAprovacao: 11,
      areaId: areasInserted[0].id,
      categoriaId: categoriasInserted[2].id
    },
    {
      nome: 'Introdução ao Cloud Computing',
      descricao: 'AWS, Azure e GCP - conceitos fundamentais de cloud',
      imagemCurso: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      nivel: 'iniciante' as const,
      estado: 'arquivado' as const,
      visivel: false,
      certificado: false,
      dataInicio: subMonths(hoje, 10),
      dataFim: subMonths(hoje, 8),
      dataLimiteInscricao: subMonths(hoje, 11),
      limiteVagas: 35,
      cargaHoraria: 30,
      notaMinimaAprovacao: 10,
      areaId: areasInserted[0].id,
      categoriaId: categoriasInserted[1].id
    }
  ];

  const insertedCursos = await db.insert(cursos).values(cursosData).returning();
  logger.info('Cursos created', { count: insertedCursos.length });

  return insertedCursos;
}

async function seedInscricoes(formandosInserted: any[], cursosInserted: any[]) {
  logger.info('Seeding inscricoes...');

  const inscricoesData = [
    { cursoId: cursosInserted[0].id, utilizadorId: formandosInserted[0].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[0].id, utilizadorId: formandosInserted[10].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[1].id, utilizadorId: formandosInserted[9].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[3].id, utilizadorId: formandosInserted[0].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[3].id, utilizadorId: formandosInserted[1].user.id, estado: 'pendente' as const },
    { cursoId: cursosInserted[4].id, utilizadorId: formandosInserted[5].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[4].id, utilizadorId: formandosInserted[14].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[5].id, utilizadorId: formandosInserted[5].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[5].id, utilizadorId: formandosInserted[12].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[7].id, utilizadorId: formandosInserted[1].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[7].id, utilizadorId: formandosInserted[15].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[8].id, utilizadorId: formandosInserted[1].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[8].id, utilizadorId: formandosInserted[15].user.id, estado: 'pendente' as const },
    { cursoId: cursosInserted[10].id, utilizadorId: formandosInserted[2].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[10].id, utilizadorId: formandosInserted[11].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[11].id, utilizadorId: formandosInserted[2].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[11].id, utilizadorId: formandosInserted[16].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[13].id, utilizadorId: formandosInserted[3].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[14].id, utilizadorId: formandosInserted[3].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[15].id, utilizadorId: formandosInserted[3].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[16].id, utilizadorId: formandosInserted[4].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[16].id, utilizadorId: formandosInserted[13].user.id, estado: 'pendente' as const },
    { cursoId: cursosInserted[18].id, utilizadorId: formandosInserted[4].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[19].id, utilizadorId: formandosInserted[8].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[20].id, utilizadorId: formandosInserted[8].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[21].id, utilizadorId: formandosInserted[8].user.id, estado: 'rejeitada' as const },
    { cursoId: cursosInserted[22].id, utilizadorId: formandosInserted[7].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[22].id, utilizadorId: formandosInserted[12].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[23].id, utilizadorId: formandosInserted[7].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[25].id, utilizadorId: formandosInserted[0].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[26].id, utilizadorId: formandosInserted[10].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[5].id, utilizadorId: formandosInserted[6].user.id, estado: 'pendente' as const },
    { cursoId: cursosInserted[7].id, utilizadorId: formandosInserted[6].user.id, estado: 'pendente' as const },
    { cursoId: cursosInserted[11].id, utilizadorId: formandosInserted[6].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[0].id, utilizadorId: formandosInserted[11].user.id, estado: 'rejeitada' as const },
    { cursoId: cursosInserted[4].id, utilizadorId: formandosInserted[13].user.id, estado: 'cancelada' as const },
    { cursoId: cursosInserted[8].id, utilizadorId: formandosInserted[14].user.id, estado: 'pendente' as const },
    { cursoId: cursosInserted[13].id, utilizadorId: formandosInserted[15].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[16].id, utilizadorId: formandosInserted[16].user.id, estado: 'aceite' as const },
    { cursoId: cursosInserted[19].id, utilizadorId: formandosInserted[9].user.id, estado: 'rejeitada' as const }
  ];

  const insertedInscricoes = await db.insert(inscricoes).values(inscricoesData).returning();
  logger.info('Inscricoes created', { count: insertedInscricoes.length });

  return insertedInscricoes;
}

async function seedModulos(cursosInserted: any[]) {
  logger.info('Seeding modulos...');

  const modulosData = [
    // Módulos para React 19 (curso 0)
    { cursoId: cursosInserted[0].id, titulo: 'Introdução ao React 19', descricao: 'Fundamentos e novidades do React 19', ordem: 1, duracao: 120 },
    { cursoId: cursosInserted[0].id, titulo: 'Hooks e State Management', descricao: 'useState, useEffect, useContext e hooks personalizados', ordem: 2, duracao: 180 },
    { cursoId: cursosInserted[0].id, titulo: 'React Router e Navegação', descricao: 'Roteamento com TanStack Router', ordem: 3, duracao: 150 },
    { cursoId: cursosInserted[0].id, titulo: 'Formulários e Validação', descricao: 'React Hook Form e Zod validation', ordem: 4, duracao: 140 },
    { cursoId: cursosInserted[0].id, titulo: 'Projeto Final', descricao: 'Construindo uma aplicação completa', ordem: 5, duracao: 240 },

    // Módulos para Python Data Science (curso 1)
    { cursoId: cursosInserted[1].id, titulo: 'Fundamentos de Python', descricao: 'Sintaxe básica e estruturas de dados', ordem: 1, duracao: 150 },
    { cursoId: cursosInserted[1].id, titulo: 'NumPy e Pandas', descricao: 'Manipulação de dados com bibliotecas essenciais', ordem: 2, duracao: 200 },
    { cursoId: cursosInserted[1].id, titulo: 'Visualização de Dados', descricao: 'Matplotlib e Seaborn', ordem: 3, duracao: 160 },
    { cursoId: cursosInserted[1].id, titulo: 'Machine Learning', descricao: 'Scikit-learn e algoritmos de ML', ordem: 4, duracao: 220 },

    // Módulos para Programação Web (curso 3)
    { cursoId: cursosInserted[3].id, titulo: 'HTML Básico', descricao: 'Estrutura e tags HTML', ordem: 1, duracao: 90 },
    { cursoId: cursosInserted[3].id, titulo: 'CSS e Layouts', descricao: 'Estilização e Flexbox/Grid', ordem: 2, duracao: 120 },
    { cursoId: cursosInserted[3].id, titulo: 'JavaScript Fundamentos', descricao: 'Lógica e manipulação do DOM', ordem: 3, duracao: 150 },
    { cursoId: cursosInserted[3].id, titulo: 'Projeto Website', descricao: 'Criando seu primeiro site completo', ordem: 4, duracao: 180 },

    // Módulos para Liderança Estratégica (curso 4)
    { cursoId: cursosInserted[4].id, titulo: 'Fundamentos de Liderança', descricao: 'Estilos e princípios de liderança', ordem: 1, duracao: 100 },
    { cursoId: cursosInserted[4].id, titulo: 'Gestão de Equipas', descricao: 'Motivação e desenvolvimento de equipas', ordem: 2, duracao: 120 },
    { cursoId: cursosInserted[4].id, titulo: 'Tomada de Decisão', descricao: 'Frameworks e ferramentas de decisão', ordem: 3, duracao: 110 },
    { cursoId: cursosInserted[4].id, titulo: 'Comunicação de Liderança', descricao: 'Comunicação assertiva e feedback', ordem: 4, duracao: 100 },

    // Módulos para Gestão de Projetos Ágeis (curso 5)
    { cursoId: cursosInserted[5].id, titulo: 'Introdução ao Agile', descricao: 'Manifesto ágil e princípios', ordem: 1, duracao: 80 },
    { cursoId: cursosInserted[5].id, titulo: 'Scrum Framework', descricao: 'Sprints, ceremonies e artefatos', ordem: 2, duracao: 140 },
    { cursoId: cursosInserted[5].id, titulo: 'Kanban', descricao: 'Gestão de fluxo e WIP limits', ordem: 3, duracao: 100 },
    { cursoId: cursosInserted[5].id, titulo: 'Ferramentas Ágeis', descricao: 'Jira, Trello e boas práticas', ordem: 4, duracao: 90 },

    // Módulos para UX/UI Design (curso 11)
    { cursoId: cursosInserted[11].id, titulo: 'Fundamentos de UX', descricao: 'User research e personas', ordem: 1, duracao: 120 },
    { cursoId: cursosInserted[11].id, titulo: 'Design Thinking', descricao: 'Processo criativo e ideação', ordem: 2, duracao: 140 },
    { cursoId: cursosInserted[11].id, titulo: 'Prototipagem', descricao: 'Wireframes e protótipos interativos', ordem: 3, duracao: 160 },
    { cursoId: cursosInserted[11].id, titulo: 'UI Design', descricao: 'Componentes, tipografia e cores', ordem: 4, duracao: 150 },
  ];

  const insertedModulos = await db.insert(modulos).values(modulosData).returning();
  logger.info('Modulos created', { count: insertedModulos.length });

  return insertedModulos;
}

async function seedAulas(modulosInserted: any[]) {
  logger.info('Seeding aulas...');

  const aulasData = [
    // Aulas para módulo "Introdução ao React 19" (módulo 0)
    { moduloId: modulosInserted[0].id, titulo: 'O que é React?', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=SqcY0GlETPk', ordem: 1, duracao: 15 },
    { moduloId: modulosInserted[0].id, titulo: 'Instalação e Setup', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 2, duracao: 20 },
    { moduloId: modulosInserted[0].id, titulo: 'Primeiro Componente', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 3, duracao: 25 },
    { moduloId: modulosInserted[0].id, titulo: 'Documentação Oficial', tipo: 'link' as const, url: 'https://react.dev', ordem: 4, duracao: null },

    // Aulas para módulo "Hooks e State Management" (módulo 1)
    { moduloId: modulosInserted[1].id, titulo: 'useState Hook', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 1, duracao: 30 },
    { moduloId: modulosInserted[1].id, titulo: 'useEffect Hook', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 2, duracao: 35 },
    { moduloId: modulosInserted[1].id, titulo: 'useContext para State Global', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 3, duracao: 40 },
    { moduloId: modulosInserted[1].id, titulo: 'Quiz: Hooks', tipo: 'quiz' as const, url: 'https://quiz.example.com/react-hooks', ordem: 4, duracao: 15 },

    // Aulas para módulo "Fundamentos de Python" (módulo 5)
    { moduloId: modulosInserted[5].id, titulo: 'Introdução ao Python', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 1, duracao: 25 },
    { moduloId: modulosInserted[5].id, titulo: 'Variáveis e Tipos de Dados', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 2, duracao: 30 },
    { moduloId: modulosInserted[5].id, titulo: 'Listas e Dicionários', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 3, duracao: 35 },
    { moduloId: modulosInserted[5].id, titulo: 'Exercícios de Fixação', tipo: 'documento' as const, url: 'https://docs.google.com/document/d/exerc icios', ordem: 4, duracao: null },

    // Aulas para módulo "HTML Básico" (módulo 9)
    { moduloId: modulosInserted[9].id, titulo: 'Estrutura HTML', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 1, duracao: 20 },
    { moduloId: modulosInserted[9].id, titulo: 'Tags Essenciais', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 2, duracao: 25 },
    { moduloId: modulosInserted[9].id, titulo: 'Formulários HTML', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 3, duracao: 30 },

    // Aulas para módulo "Fundamentos de Liderança" (módulo 13)
    { moduloId: modulosInserted[13].id, titulo: 'O que faz um bom líder?', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 1, duracao: 25 },
    { moduloId: modulosInserted[13].id, titulo: 'Estilos de Liderança', tipo: 'texto' as const, conteudo: 'Existem diversos estilos de liderança: autocrática, democrática, transformacional...', ordem: 2, duracao: null },
    { moduloId: modulosInserted[13].id, titulo: 'Case Studies', tipo: 'documento' as const, url: 'https://docs.google.com/document/d/cases', ordem: 3, duracao: null },

    // Aulas para módulo "Introdução ao Agile" (módulo 17)
    { moduloId: modulosInserted[17].id, titulo: 'Manifesto Ágil', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 1, duracao: 20 },
    { moduloId: modulosInserted[17].id, titulo: 'Princípios Ágeis', tipo: 'texto' as const, conteudo: 'Os 12 princípios do manifesto ágil...', ordem: 2, duracao: null },
    { moduloId: modulosInserted[17].id, titulo: 'Agile vs Waterfall', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 3, duracao: 25 },

    // Aulas para módulo "Fundamentos de UX" (módulo 21)
    { moduloId: modulosInserted[21].id, titulo: 'Introdução ao UX', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 1, duracao: 30 },
    { moduloId: modulosInserted[21].id, titulo: 'User Research', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 2, duracao: 35 },
    { moduloId: modulosInserted[21].id, titulo: 'Criando Personas', tipo: 'video' as const, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ordem: 3, duracao: 40 },
    { moduloId: modulosInserted[21].id, titulo: 'Template de Persona', tipo: 'documento' as const, url: 'https://docs.google.com/document/d/persona-template', ordem: 4, duracao: null },
  ];

  const insertedAulas = await db.insert(aulas).values(aulasData).returning();
  logger.info('Aulas created', { count: insertedAulas.length });

  return insertedAulas;
}

async function seedReviews(cursosInserted: any[], formandosInserted: any[]) {
  logger.info('Seeding reviews...');

  const reviewsData = [
    // React 19 course reviews
    { cursoId: cursosInserted[0].id, utilizadorId: formandosInserted[0].user.id, rating: 5, comentario: 'Curso excepcional! O instrutor domina completamente React 19 e as explicações são muito claras. Aprendi muito sobre hooks e context API.' },
    { cursoId: cursosInserted[0].id, utilizadorId: formandosInserted[10].user.id, rating: 4, comentario: 'Muito bom curso, mas poderia ter mais exercícios práticos.' },

    // Python Data Science reviews
    { cursoId: cursosInserted[1].id, utilizadorId: formandosInserted[9].user.id, rating: 5, comentario: 'Fantástico! Abordagem prática e direta ao ponto. Os exemplos com Pandas e NumPy foram muito úteis.' },

    // Programação Web Iniciante reviews
    { cursoId: cursosInserted[3].id, utilizadorId: formandosInserted[0].user.id, rating: 5, comentario: 'Perfeito para iniciantes! Muito didático e bem estruturado.' },

    // Liderança Estratégica reviews
    { cursoId: cursosInserted[4].id, utilizadorId: formandosInserted[5].user.id, rating: 4, comentario: 'Ótimo conteúdo sobre gestão de equipas. Apliquei várias técnicas no meu trabalho.' },
    { cursoId: cursosInserted[4].id, utilizadorId: formandosInserted[14].user.id, rating: 5, comentario: 'Mudou completamente minha perspectiva sobre liderança. Altamente recomendado!' },

    // Gestão de Projetos Ágeis reviews
    { cursoId: cursosInserted[5].id, utilizadorId: formandosInserted[5].user.id, rating: 5, comentario: 'Excelente abordagem prática do Scrum e Kanban. Já estou a implementar na minha empresa.' },
    { cursoId: cursosInserted[5].id, utilizadorId: formandosInserted[12].user.id, rating: 4, comentario: 'Bom curso, mas poderia ter mais casos de estudo reais.' },

    // Marketing Redes Sociais reviews
    { cursoId: cursosInserted[7].id, utilizadorId: formandosInserted[1].user.id, rating: 5, comentario: 'Estratégias muito atuais e relevantes. Aumentei significativamente o engagement nas redes sociais da empresa.' },
    { cursoId: cursosInserted[7].id, utilizadorId: formandosInserted[15].user.id, rating: 5, comentario: 'Curso completo e atualizado. Recomendo!' },

    // SEO e Google Ads reviews
    { cursoId: cursosInserted[8].id, utilizadorId: formandosInserted[1].user.id, rating: 4, comentario: 'Muito bom conteúdo técnico sobre SEO. Aprendi bastante sobre otimização on-page e off-page.' },

    // Design Gráfico Adobe reviews
    { cursoId: cursosInserted[10].id, utilizadorId: formandosInserted[2].user.id, rating: 5, comentario: 'Curso sensacional! Dominei Photoshop e Illustrator de forma profissional.' },
    { cursoId: cursosInserted[10].id, utilizadorId: formandosInserted[11].user.id, rating: 5, comentario: 'Instrutor excelente e material de apoio de alta qualidade.' },

    // UX/UI Design reviews
    { cursoId: cursosInserted[11].id, utilizadorId: formandosInserted[2].user.id, rating: 4, comentario: 'Ótima introdução ao design thinking. Os workshops práticos foram muito úteis.' },
    { cursoId: cursosInserted[11].id, utilizadorId: formandosInserted[16].user.id, rating: 5, comentario: 'Aprendi a criar protótipos profissionais. Curso indispensável para designers!' },
    { cursoId: cursosInserted[11].id, utilizadorId: formandosInserted[6].user.id, rating: 5, comentario: 'Conteúdo atualizado e muito bem apresentado. Recomendo fortemente.' },

    // Recrutamento e Seleção reviews
    { cursoId: cursosInserted[13].id, utilizadorId: formandosInserted[3].user.id, rating: 4, comentario: 'Boas técnicas de entrevista e avaliação de candidatos.' },

    // Gestão de Desempenho reviews (curso terminado)
    { cursoId: cursosInserted[14].id, utilizadorId: formandosInserted[3].user.id, rating: 5, comentario: 'Excelente abordagem sobre feedback e desenvolvimento de colaboradores. Muito prático!' },

    // Análise Financeira reviews
    { cursoId: cursosInserted[16].id, utilizadorId: formandosInserted[4].user.id, rating: 5, comentario: 'Curso completo sobre análise de demonstrações financeiras. Muito útil para gestores.' },

    // Comunicação Empresarial reviews
    { cursoId: cursosInserted[18].id, utilizadorId: formandosInserted[4].user.id, rating: 4, comentario: 'Melhorou significativamente minha comunicação escrita profissional.' },

    // Oratória reviews
    { cursoId: cursosInserted[19].id, utilizadorId: formandosInserted[8].user.id, rating: 5, comentario: 'Transformou minha capacidade de falar em público. Técnicas muito eficazes!' },

    // Content Marketing reviews (curso terminado)
    { cursoId: cursosInserted[20].id, utilizadorId: formandosInserted[8].user.id, rating: 5, comentario: 'Aprendi a criar conteúdo que realmente conecta com a audiência. Curso fantástico!' },

    // Técnicas de Venda reviews
    { cursoId: cursosInserted[22].id, utilizadorId: formandosInserted[7].user.id, rating: 4, comentario: 'Boas estratégias de prospecção e fecho. Aumentei minhas vendas em 30%.' },
    { cursoId: cursosInserted[22].id, utilizadorId: formandosInserted[12].user.id, rating: 5, comentario: 'Curso prático e direto ao ponto. Excelente ROI!' },

    // Negociação reviews (curso terminado)
    { cursoId: cursosInserted[23].id, utilizadorId: formandosInserted[7].user.id, rating: 5, comentario: 'Técnicas de negociação win-win muito eficazes. Recomendo!' },

    // Node.js Backend reviews (curso terminado)
    { cursoId: cursosInserted[25].id, utilizadorId: formandosInserted[0].user.id, rating: 5, comentario: 'Melhor curso de Node.js que já fiz. Construí várias APIs RESTful durante o curso.' },

    // TypeScript Avançado reviews (curso terminado)
    { cursoId: cursosInserted[26].id, utilizadorId: formandosInserted[10].user.id, rating: 5, comentario: 'Domínio completo de TypeScript após este curso. Generics e tipos avançados explicados de forma clara.' },

    // Excel Avançado reviews (curso terminado) 
    { cursoId: cursosInserted[28].id, utilizadorId: formandosInserted[4].user.id, rating: 4, comentario: 'Aprendi VBA e automação de tarefas. Muito útil para análise de dados.' },
  ];

  const insertedReviews = await db.insert(reviews).values(reviewsData).returning();
  logger.info('Reviews created', { count: insertedReviews.length });

  return insertedReviews;
}

async function seedNotificacoes(formandosInserted: any[]) {
  logger.info('Seeding notificacoes...');

  const notificacoesData = [
    // Notificações de inscrições aprovadas
    {
      utilizadorId: formandosInserted[0].user.id,
      tipo: 'inscricao_aprovada' as const,
      titulo: 'Inscrição Aprovada!',
      mensagem: 'Sua inscrição no curso React 19 Completo foi aprovada. Você já pode começar a estudar!',
      lida: false,
      dataCriacao: subHours(new Date(), 2),
      linkAcao: '/cursos/1/conteudo'
    },
    {
      utilizadorId: formandosInserted[10].user.id,
      tipo: 'inscricao_aprovada' as const,
      titulo: 'Inscrição Aprovada!',
      mensagem: 'Sua inscrição no curso React 19 Completo foi aprovada.',
      lida: true,
      dataCriacao: subDays(new Date(), 1),
      linkAcao: '/cursos/1/conteudo'
    },
    {
      utilizadorId: formandosInserted[9].user.id,
      tipo: 'inscricao_aprovada' as const,
      titulo: 'Inscrição Aprovada!',
      mensagem: 'Sua inscrição no curso Python para Data Science foi aprovada.',
      lida: true,
      dataCriacao: subDays(new Date(), 3),
      linkAcao: '/cursos/2/conteudo'
    },

    // Notificações de inscrições rejeitadas
    {
      utilizadorId: formandosInserted[11].user.id,
      tipo: 'inscricao_rejeitada' as const,
      titulo: 'Inscrição Não Aprovada',
      mensagem: 'Infelizmente sua inscrição no curso React 19 Completo não foi aprovada. Por favor, entre em contato conosco para mais informações.',
      lida: false,
      dataCriacao: subHours(new Date(), 5),
      linkAcao: null
    },
    {
      utilizadorId: formandosInserted[9].user.id,
      tipo: 'inscricao_rejeitada' as const,
      titulo: 'Inscrição Não Aprovada',
      mensagem: 'Sua inscrição no curso Oratória e Apresentações em Público não foi aprovada.',
      lida: true,
      dataCriacao: subDays(new Date(), 2),
      linkAcao: null
    },

    // Notificações de novos cursos
    {
      utilizadorId: formandosInserted[0].user.id,
      tipo: 'novo_curso' as const,
      titulo: 'Novo Curso Disponível!',
      mensagem: 'Confira nosso novo curso: DevOps Essencial - Docker e Kubernetes. Inscrições abertas!',
      lida: false,
      dataCriacao: subHours(new Date(), 1),
      linkAcao: '/cursos/3'
    },
    {
      utilizadorId: formandosInserted[1].user.id,
      tipo: 'novo_curso' as const,
      titulo: 'Novo Curso Disponível!',
      mensagem: 'Novo curso de Email Marketing e Automação disponível. Não perca!',
      lida: false,
      dataCriacao: subHours(new Date(), 3),
      linkAcao: '/cursos/10'
    },
    {
      utilizadorId: formandosInserted[2].user.id,
      tipo: 'novo_curso' as const,
      titulo: 'Novo Curso Disponível!',
      mensagem: 'Motion Design e Animação - Aprenda After Effects e animação profissional.',
      lida: true,
      dataCriacao: subDays(new Date(), 1),
      linkAcao: '/cursos/12'
    },
    {
      utilizadorId: formandosInserted[5].user.id,
      tipo: 'novo_curso' as const,
      titulo: 'Novo Curso Disponível!',
      mensagem: 'Transformação Digital nas Organizações - Lidere processos de mudança com sucesso.',
      lida: false,
      dataCriacao: subHours(new Date(), 6),
      linkAcao: '/cursos/7'
    },

    // Lembretes de cursos
    {
      utilizadorId: formandosInserted[0].user.id,
      tipo: 'lembrete' as const,
      titulo: 'Lembrete de Curso',
      mensagem: 'Você ainda não concluiu o módulo 2 do curso React 19 Completo. Continue seus estudos!',
      lida: false,
      dataCriacao: subHours(new Date(), 4),
      linkAcao: '/cursos/1/conteudo'
    },
    {
      utilizadorId: formandosInserted[5].user.id,
      tipo: 'lembrete' as const,
      titulo: 'Prazo de Inscrição Terminando',
      mensagem: 'As inscrições para o curso Liderança Estratégica para Gestores terminam em 3 dias!',
      lida: false,
      dataCriacao: subHours(new Date(), 8),
      linkAcao: '/cursos/5'
    },

    // Notificações do sistema
    {
      utilizadorId: formandosInserted[0].user.id,
      tipo: 'sistema' as const,
      titulo: 'Bem-vindo à OneSAM!',
      mensagem: 'Obrigado por se juntar a nós. Explore nosso catálogo de cursos e comece sua jornada de aprendizagem.',
      lida: true,
      dataCriacao: subDays(new Date(), 15),
      linkAcao: '/cursos'
    },
    {
      utilizadorId: formandosInserted[1].user.id,
      tipo: 'sistema' as const,
      titulo: 'Atualização de Perfil',
      mensagem: 'Não se esqueça de completar seu perfil para uma experiência personalizada.',
      lida: false,
      dataCriacao: subDays(new Date(), 1),
      linkAcao: '/perfil'
    },
    {
      utilizadorId: formandosInserted[6].user.id,
      tipo: 'sistema' as const,
      titulo: 'Novidades na Plataforma',
      mensagem: 'Agora você pode acompanhar seu progresso em tempo real nos cursos. Confira!',
      lida: false,
      dataCriacao: subHours(new Date(), 12),
      linkAcao: '/dashboard'
    }
  ];

  const insertedNotificacoes = await db.insert(notificacoes).values(notificacoesData).returning();
  logger.info('Notificacoes created', { count: insertedNotificacoes.length });

  return insertedNotificacoes;
}

async function seedProgressoAulas(formandosInserted: any[], aulasInserted: any[]) {
  logger.info('Seeding progresso aulas (heatmap data)...');

  const hoje = new Date();
  const currentYear = hoje.getFullYear();
  const progressoData: {
    aulaId: number;
    utilizadorId: number;
    concluida: boolean;
    dataConclusao: Date;
    tempoGasto: number;
  }[] = [];

  // Helper function to create a specific date
  const createDate = (year: number, month: number, day: number) => new Date(year, month - 1, day);

  // Anos dinâmicos baseados na data atual
  const previousYear = currentYear - 1;

  logger.info(`Criando atividades para anos ${previousYear} e ${currentYear}`);

  // Usuário Pedro Costa (formando 0) - alta atividade com dados em múltiplos anos
  const pedroId = parseInt(formandosInserted[0].user.id as string, 10);

  // Dados no ANO ANTERIOR - incluindo janeiro e dezembro
  // Janeiro do ano anterior
  [3, 8, 15, 22, 28].forEach((day, idx) => {
    const aulaIndex = idx % aulasInserted.length;
    progressoData.push({
      aulaId: aulasInserted[aulaIndex].id,
      utilizadorId: pedroId,
      concluida: true,
      dataConclusao: createDate(previousYear, 1, day),
      tempoGasto: Math.floor(Math.random() * 30) + 20,
    });
  });

  // Dezembro do ano anterior
  [2, 5, 10, 15, 18, 22, 27].forEach((day, idx) => {
    const aulaIndex = (idx + 10) % aulasInserted.length;
    progressoData.push({
      aulaId: aulasInserted[aulaIndex].id,
      utilizadorId: pedroId,
      concluida: true,
      dataConclusao: createDate(previousYear, 12, day),
      tempoGasto: Math.floor(Math.random() * 30) + 20,
    });
  });

  // Outros meses do ano anterior para criar padrão visível
  for (let month = 2; month <= 11; month++) {
    const daysInMonth = month === 2 ? 3 : month <= 6 ? 4 : 5;
    for (let i = 0; i < daysInMonth; i++) {
      const day = 5 + (i * 6);
      const aulaIndex = (month * 5 + i + 20) % aulasInserted.length;
      progressoData.push({
        aulaId: aulasInserted[aulaIndex].id,
        utilizadorId: pedroId,
        concluida: true,
        dataConclusao: createDate(previousYear, month, day),
        tempoGasto: Math.floor(Math.random() * 30) + 20,
      });
    }
  }

  // Dados no ANO ATUAL - Janeiro
  [2, 5, 9, 14, 19, 23, 28].forEach((day, idx) => {
    const aulaIndex = (idx + 30) % aulasInserted.length;
    progressoData.push({
      aulaId: aulasInserted[aulaIndex].id,
      utilizadorId: pedroId,
      concluida: true,
      dataConclusao: createDate(currentYear, 1, day),
      tempoGasto: Math.floor(Math.random() * 30) + 20,
    });
  });

  // Simular atividade recente no ano atual
  for (let semana = 0; semana < 20; semana++) {
    const diasNaSemana = semana < 4 ? 5 : semana < 10 ? 3 : 2;
    for (let dia = 0; dia < diasNaSemana; dia++) {
      const diasAtras = (semana * 7) + Math.floor(Math.random() * 7);
      if (diasAtras < 140) {
        const aulaIndex = (semana * 5 + dia + 40) % aulasInserted.length;
        const existeJa = progressoData.some(
          p => p.aulaId === aulasInserted[aulaIndex].id && p.utilizadorId === pedroId
        );
        if (!existeJa) {
          progressoData.push({
            aulaId: aulasInserted[aulaIndex].id,
            utilizadorId: pedroId,
            concluida: true,
            dataConclusao: subDays(hoje, diasAtras),
            tempoGasto: Math.floor(Math.random() * 30) + 20,
          });
        }
      }
    }
  }

  // Usuário Ana Pereira (formando 1) - atividade média
  const anaId = parseInt(formandosInserted[1].user.id as string, 10);
  for (let semana = 0; semana < 15; semana++) {
    const diasNaSemana = semana < 5 ? 3 : 2;
    for (let dia = 0; dia < diasNaSemana; dia++) {
      const diasAtras = (semana * 7) + Math.floor(Math.random() * 7);
      if (diasAtras < 120) {
        const aulaIndex = (semana * 3 + dia + 5) % aulasInserted.length;
        const existeJa = progressoData.some(
          p => p.aulaId === aulasInserted[aulaIndex].id && p.utilizadorId === anaId
        );
        if (!existeJa) {
          progressoData.push({
            aulaId: aulasInserted[aulaIndex].id,
            utilizadorId: anaId,
            concluida: true,
            dataConclusao: subDays(hoje, diasAtras),
            tempoGasto: Math.floor(Math.random() * 25) + 15,
          });
        }
      }
    }
  }

  // Usuário Carlos Oliveira (formando 2) - atividade alta
  const carlosId = parseInt(formandosInserted[2].user.id as string, 10);
  for (let semana = 0; semana < 25; semana++) {
    const diasNaSemana = semana < 8 ? 4 : semana < 15 ? 3 : 2;
    for (let dia = 0; dia < diasNaSemana; dia++) {
      const diasAtras = (semana * 7) + Math.floor(Math.random() * 7);
      if (diasAtras < 175) {
        const aulaIndex = (semana * 4 + dia + 10) % aulasInserted.length;
        const existeJa = progressoData.some(
          p => p.aulaId === aulasInserted[aulaIndex].id && p.utilizadorId === carlosId
        );
        if (!existeJa) {
          progressoData.push({
            aulaId: aulasInserted[aulaIndex].id,
            utilizadorId: carlosId,
            concluida: true,
            dataConclusao: subDays(hoje, diasAtras),
            tempoGasto: Math.floor(Math.random() * 40) + 20,
          });
        }
      }
    }
  }

  // Usuário Sofia Rodrigues (formando 3) - atividade baixa mas constante
  const sofiaId = parseInt(formandosInserted[3].user.id as string, 10);
  for (let semana = 0; semana < 30; semana++) {
    const diasNaSemana = 1; // 1 dia por semana
    for (let dia = 0; dia < diasNaSemana; dia++) {
      const diasAtras = (semana * 7) + Math.floor(Math.random() * 7);
      if (diasAtras < 200) {
        const aulaIndex = (semana + 15) % aulasInserted.length;
        const existeJa = progressoData.some(
          p => p.aulaId === aulasInserted[aulaIndex].id && p.utilizadorId === sofiaId
        );
        if (!existeJa) {
          progressoData.push({
            aulaId: aulasInserted[aulaIndex].id,
            utilizadorId: sofiaId,
            concluida: true,
            dataConclusao: subDays(hoje, diasAtras),
            tempoGasto: Math.floor(Math.random() * 35) + 25,
          });
        }
      }
    }
  }

  // Usuário Rita Alves (formando 5) - atividade intensa recente
  const ritaId = parseInt(formandosInserted[5].user.id as string, 10);
  for (let semana = 0; semana < 12; semana++) {
    const diasNaSemana = semana < 3 ? 6 : semana < 6 ? 4 : 2;
    for (let dia = 0; dia < diasNaSemana; dia++) {
      const diasAtras = (semana * 7) + Math.floor(Math.random() * 7);
      if (diasAtras < 85) {
        const aulaIndex = (semana * 6 + dia + 20) % aulasInserted.length;
        const existeJa = progressoData.some(
          p => p.aulaId === aulasInserted[aulaIndex].id && p.utilizadorId === ritaId
        );
        if (!existeJa) {
          progressoData.push({
            aulaId: aulasInserted[aulaIndex].id,
            utilizadorId: ritaId,
            concluida: true,
            dataConclusao: subDays(hoje, diasAtras),
            tempoGasto: Math.floor(Math.random() * 50) + 10,
          });
        }
      }
    }
  }

  // Usuário Catarina Lopes (formando 9) - atividade média
  const catarinaId = parseInt(formandosInserted[9].user.id as string, 10);
  for (let semana = 0; semana < 18; semana++) {
    const diasNaSemana = semana % 2 === 0 ? 3 : 2;
    for (let dia = 0; dia < diasNaSemana; dia++) {
      const diasAtras = (semana * 7) + Math.floor(Math.random() * 7);
      if (diasAtras < 130) {
        const aulaIndex = (semana * 3 + dia) % aulasInserted.length;
        const existeJa = progressoData.some(
          p => p.aulaId === aulasInserted[aulaIndex].id && p.utilizadorId === catarinaId
        );
        if (!existeJa) {
          progressoData.push({
            aulaId: aulasInserted[aulaIndex].id,
            utilizadorId: catarinaId,
            concluida: true,
            dataConclusao: subDays(hoje, diasAtras),
            tempoGasto: Math.floor(Math.random() * 45) + 15,
          });
        }
      }
    }
  }

  // Usuário Bruno Ferreira (formando 10) - atividade muito alta (desenvolvedor dedicado)
  const brunoId = parseInt(formandosInserted[10].user.id as string, 10);

  // Dados do ANO ANTERIOR para Bruno - atividade consistente durante todo o ano
  // Janeiro do ano anterior
  [2, 4, 8, 10, 15, 18, 22, 25, 29].forEach((day, idx) => {
    const aulaIndex = (idx + 50) % aulasInserted.length;
    progressoData.push({
      aulaId: aulasInserted[aulaIndex].id,
      utilizadorId: brunoId,
      concluida: true,
      dataConclusao: createDate(previousYear, 1, day),
      tempoGasto: Math.floor(Math.random() * 60) + 30,
    });
  });

  // Fevereiro a Novembro do ano anterior
  for (let month = 2; month <= 11; month++) {
    const daysActivity = month <= 6 ? 8 : 10; // Mais ativo no segundo semestre
    for (let i = 0; i < daysActivity; i++) {
      const day = Math.min(2 + (i * 3), 28);
      const aulaIndex = (month * 10 + i + 60) % aulasInserted.length;
      progressoData.push({
        aulaId: aulasInserted[aulaIndex].id,
        utilizadorId: brunoId,
        concluida: true,
        dataConclusao: createDate(previousYear, month, day),
        tempoGasto: Math.floor(Math.random() * 60) + 30,
      });
    }
  }

  // Dezembro do ano anterior
  [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 26, 28, 30].forEach((day, idx) => {
    const aulaIndex = (idx + 70) % aulasInserted.length;
    progressoData.push({
      aulaId: aulasInserted[aulaIndex].id,
      utilizadorId: brunoId,
      concluida: true,
      dataConclusao: createDate(previousYear, 12, day),
      tempoGasto: Math.floor(Math.random() * 60) + 30,
    });
  });

  // Janeiro do ano atual
  [3, 6, 9, 13, 16, 20, 23, 27, 30].forEach((day, idx) => {
    const aulaIndex = (idx + 80) % aulasInserted.length;
    progressoData.push({
      aulaId: aulasInserted[aulaIndex].id,
      utilizadorId: brunoId,
      concluida: true,
      dataConclusao: createDate(currentYear, 1, day),
      tempoGasto: Math.floor(Math.random() * 60) + 30,
    });
  });

  // Atividade recente no ano atual
  for (let semana = 0; semana < 35; semana++) {
    const diasNaSemana = semana < 10 ? 5 : semana < 20 ? 4 : 3;
    for (let dia = 0; dia < diasNaSemana; dia++) {
      const diasAtras = (semana * 7) + Math.floor(Math.random() * 7);
      if (diasAtras < 245) {
        const aulaIndex = (semana * 5 + dia + 90) % aulasInserted.length;
        const existeJa = progressoData.some(
          p => p.aulaId === aulasInserted[aulaIndex].id && p.utilizadorId === brunoId
        );
        if (!existeJa) {
          progressoData.push({
            aulaId: aulasInserted[aulaIndex].id,
            utilizadorId: brunoId,
            concluida: true,
            dataConclusao: subDays(hoje, diasAtras),
            tempoGasto: Math.floor(Math.random() * 60) + 30,
          });
        }
      }
    }
  }

  // Inserir todos os dados de progresso
  if (progressoData.length > 0) {
    const insertedProgresso = await db.insert(progressoAulas).values(progressoData).returning();
    logger.info('Progresso aulas created (heatmap data)', { count: insertedProgresso.length });
    return insertedProgresso;
  }

  return [];
}

async function seedCursosCompletados(
  formandosInserted: any[],
  cursosInserted: any[],
  modulosInserted: any[],
  aulasInserted: any[]
) {
  logger.info('Seeding cursos completados (cursos 100% concluídos)...');

  const hoje = new Date();
  const progressoData: {
    aulaId: number;
    utilizadorId: number;
    concluida: boolean;
    dataConclusao: Date;
    tempoGasto: number;
  }[] = [];

  // Mapear módulos por curso
  const modulosPorCurso = new Map<number, number[]>();
  modulosInserted.forEach((modulo) => {
    const cursoId = modulo.cursoId;
    if (!modulosPorCurso.has(cursoId)) {
      modulosPorCurso.set(cursoId, []);
    }
    modulosPorCurso.get(cursoId)!.push(modulo.id);
  });

  // Mapear aulas por módulo
  const aulasPorModulo = new Map<number, number[]>();
  aulasInserted.forEach((aula) => {
    const moduloId = aula.moduloId;
    if (!aulasPorModulo.has(moduloId)) {
      aulasPorModulo.set(moduloId, []);
    }
    aulasPorModulo.get(moduloId)!.push(aula.id);
  });

  // Função para obter todas as aulas de um curso
  const getAulasDoCurso = (cursoId: number): number[] => {
    const modulosIds = modulosPorCurso.get(cursoId) || [];
    const aulasIds: number[] = [];
    modulosIds.forEach((moduloId) => {
      const aulas = aulasPorModulo.get(moduloId) || [];
      aulasIds.push(...aulas);
    });
    return aulasIds;
  };

  // Definir cursos completados por utilizador
  // Curso 3 (Programação Web Iniciante) - completado por Pedro Costa (formando 0)
  const pedroId = parseInt(formandosInserted[0].user.id as string, 10);
  const aulasCurso3 = getAulasDoCurso(cursosInserted[3].id);
  if (aulasCurso3.length > 0) {
    aulasCurso3.forEach((aulaId, index) => {
      progressoData.push({
        aulaId,
        utilizadorId: pedroId,
        concluida: true,
        dataConclusao: subDays(hoje, 30 + index * 2), // Completado há ~1 mês
        tempoGasto: Math.floor(Math.random() * 30) + 20,
      });
    });
    logger.info(`Curso 3 marcado como completado para Pedro Costa`, { aulas: aulasCurso3.length });
  }

  // Curso 5 (Gestão de Projetos Ágeis) - completado por Rita Alves (formando 5)
  const ritaId = parseInt(formandosInserted[5].user.id as string, 10);
  const aulasCurso5 = getAulasDoCurso(cursosInserted[5].id);
  if (aulasCurso5.length > 0) {
    aulasCurso5.forEach((aulaId, index) => {
      progressoData.push({
        aulaId,
        utilizadorId: ritaId,
        concluida: true,
        dataConclusao: subDays(hoje, 15 + index * 2), // Completado há ~2 semanas
        tempoGasto: Math.floor(Math.random() * 40) + 25,
      });
    });
    logger.info(`Curso 5 marcado como completado para Rita Alves`, { aulas: aulasCurso5.length });
  }

  // Curso 11 (UX/UI Design) - completado por Carlos Oliveira (formando 2)
  const carlosId = parseInt(formandosInserted[2].user.id as string, 10);
  const aulasCurso11 = getAulasDoCurso(cursosInserted[11].id);
  if (aulasCurso11.length > 0) {
    aulasCurso11.forEach((aulaId, index) => {
      progressoData.push({
        aulaId,
        utilizadorId: carlosId,
        concluida: true,
        dataConclusao: subDays(hoje, 45 + index * 3), // Completado há ~1.5 meses
        tempoGasto: Math.floor(Math.random() * 50) + 30,
      });
    });
    logger.info(`Curso 11 marcado como completado para Carlos Oliveira`, { aulas: aulasCurso11.length });
  }

  // Curso 0 (React 19) - completado por Bruno Ferreira (formando 10)
  const brunoId = parseInt(formandosInserted[10].user.id as string, 10);
  const aulasCurso0 = getAulasDoCurso(cursosInserted[0].id);
  if (aulasCurso0.length > 0) {
    aulasCurso0.forEach((aulaId, index) => {
      progressoData.push({
        aulaId,
        utilizadorId: brunoId,
        concluida: true,
        dataConclusao: subDays(hoje, 10 + index), // Completado há ~10 dias
        tempoGasto: Math.floor(Math.random() * 45) + 35,
      });
    });
    logger.info(`Curso 0 marcado como completado para Bruno Ferreira`, { aulas: aulasCurso0.length });
  }

  // Curso 4 (Liderança Estratégica) - completado por André Ribeiro (formando 14)
  const andreId = parseInt(formandosInserted[14].user.id as string, 10);
  const aulasCurso4 = getAulasDoCurso(cursosInserted[4].id);
  if (aulasCurso4.length > 0) {
    aulasCurso4.forEach((aulaId, index) => {
      progressoData.push({
        aulaId,
        utilizadorId: andreId,
        concluida: true,
        dataConclusao: subDays(hoje, 60 + index * 2), // Completado há ~2 meses
        tempoGasto: Math.floor(Math.random() * 35) + 20,
      });
    });
    logger.info(`Curso 4 marcado como completado para André Ribeiro`, { aulas: aulasCurso4.length });
  }

  // Inserir todos os dados de cursos completados
  if (progressoData.length > 0) {
    // Verificar se já existe progresso para essas aulas/utilizadores (evitar duplicatas)
    const insertedProgresso = await db.insert(progressoAulas).values(progressoData).onConflictDoNothing().returning();
    logger.info('Cursos completados seeded', {
      total: progressoData.length,
      inserted: insertedProgresso.length
    });
    return insertedProgresso;
  }

  return [];
}

export async function seedCompleteData() {
  try {
    logger.info('===== Starting complete database seed =====');

    if (shouldClean) {
      await cleanDatabase();
    }

    const areasInserted = await seedAreas();
    const categoriasInserted = await seedCategorias(areasInserted);
    const { admins: adminsInserted, formandos: formandosInserted } = await seedUtilizadores();
    const cursosInserted = await seedCursos(areasInserted, categoriasInserted);
    const inscricoesInserted = await seedInscricoes(formandosInserted, cursosInserted);
    const modulosInserted = await seedModulos(cursosInserted);
    const aulasInserted = await seedAulas(modulosInserted);
    const reviewsInserted = await seedReviews(cursosInserted, formandosInserted);
    const notificacoesInserted = await seedNotificacoes(formandosInserted);
    const progressoInserted = await seedProgressoAulas(formandosInserted, aulasInserted);
    const cursosCompletadosInserted = await seedCursosCompletados(formandosInserted, cursosInserted, modulosInserted, aulasInserted);

    logger.info('===== Complete seed finished successfully =====');
    logger.info('Summary:', {
      areas: areasInserted.length,
      categorias: categoriasInserted.length,
      admins: adminsInserted.length,
      formandos: formandosInserted.length,
      cursos: cursosInserted.length,
      inscricoes: inscricoesInserted.length,
      modulos: modulosInserted.length,
      aulas: aulasInserted.length,
      reviews: reviewsInserted.length,
      notificacoes: notificacoesInserted.length,
      progressoAulas: progressoInserted.length,
      cursosCompletados: cursosCompletadosInserted.length
    });

    return {
      areas: areasInserted,
      categorias: categoriasInserted,
      admins: adminsInserted,
      formandos: formandosInserted,
      cursos: cursosInserted,
      inscricoes: inscricoesInserted,
      modulos: modulosInserted,
      aulas: aulasInserted,
      reviews: reviewsInserted,
      notificacoes: notificacoesInserted,
      progressoAulas: progressoInserted,
      cursosCompletados: cursosCompletadosInserted
    };
  } catch (error) {
    logger.error('Error seeding complete data', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

if (require.main === module) {
  seedCompleteData()
    .then(() => {
      logger.info('Seed script executed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed script failed', error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    });
}
