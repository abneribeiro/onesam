import { db } from '../../db';
import { cursos, modulos, aulas } from '../../schema';
import {
  generateCourseData,
  generateModuleData,
  generateLessonData,
  getWebDevelopmentCourses,
  type LessonData
} from '../factories/course.factory';
import logger from '../../../utils/logger';

export async function seedCourses(areasInserted: any[], categoriasInserted: any[]) {
  logger.info('Seeding courses...');

  // Find TI area and Web Development category
  const tiArea = areasInserted.find(area => area.nome === 'Tecnologia da Informação');
  const webDevCategory = categoriasInserted.find(cat => cat.nome === 'Desenvolvimento Web' && cat.areaId === tiArea.id);

  // Generate web development courses
  const webDevCourses = getWebDevelopmentCourses(tiArea.id, webDevCategory.id);

  // Generate other sample courses for different areas
  const sampleCourses = [
    // Add more courses from different areas
    generateCourseData(
      areasInserted.find(a => a.nome === 'Design e Criatividade').id,
      categoriasInserted.find(c => c.nome === 'UX/UI Design').id,
      {
        nome: 'Fundamentos de UX Design',
        descricao: 'Princípios fundamentais de experiência do utilizador e design centrado no usuário.',
        nivel: 'iniciante',
        cargaHoraria: 25,
      }
    )
  ];

  const allCoursesData = [...webDevCourses, ...sampleCourses];
  const insertedCourses = await db.insert(cursos).values(allCoursesData).returning();
  logger.info('Courses created', { count: insertedCourses.length });

  return insertedCourses;
}

export async function seedModules(cursosInserted: any[]) {
  logger.info('Seeding modules...');

  const modulesData = [];

  // React course modules
  const reactCourse = cursosInserted.find(c => c.nome.includes('React 19'));
  if (reactCourse) {
    const reactModules = [
      generateModuleData(reactCourse.id, {
        titulo: 'Introdução ao React 19',
        descricao: 'Conceitos fundamentais e configuração do ambiente',
        ordem: 1,
      }),
      generateModuleData(reactCourse.id, {
        titulo: 'Hooks Avançados',
        descricao: 'Hooks customizados e patterns avançados',
        ordem: 2,
      })
    ];
    modulesData.push(...reactModules);
  }

  // UX course modules
  const uxCourse = cursosInserted.find(c => c.nome.includes('UX Design'));
  if (uxCourse) {
    const uxModules = [
      generateModuleData(uxCourse.id, {
        titulo: 'Fundamentos de UX',
        descricao: 'Princípios básicos de experiência do utilizador',
        ordem: 1,
      }),
      generateModuleData(uxCourse.id, {
        titulo: 'User Research',
        descricao: 'Métodos de pesquisa com utilizadores',
        ordem: 2,
      })
    ];
    modulesData.push(...uxModules);
  }

  const insertedModules = await db.insert(modulos).values(modulesData).returning();
  logger.info('Modules created', { count: insertedModules.length });

  return insertedModules;
}

export async function seedLessons(modulosInserted: any[]) {
  logger.info('Seeding lessons...');

  const lessonsData: LessonData[] = [];

  // Generate lessons for each module
  modulosInserted.forEach((module, moduleIndex) => {
    const moduleLessons: LessonData[] = [
      generateLessonData(module.id, {
        titulo: `Introdução ao ${module.titulo}`,
        tipo: 'video',
        ordem: 1,
        duracao: 25
      }),
      generateLessonData(module.id, {
        titulo: 'Conceitos Fundamentais',
        tipo: 'video',
        ordem: 2,
        duracao: 30
      }),
      generateLessonData(module.id, {
        titulo: 'Exercícios Práticos',
        tipo: 'documento',
        ordem: 3,
        customUrl: `https://docs.google.com/document/d/exercicios-modulo-${moduleIndex + 1}`
      }),
      generateLessonData(module.id, {
        titulo: 'Quiz de Avaliação',
        tipo: 'quiz',
        ordem: 4,
        duracao: 15
      })
    ];

    lessonsData.push(...moduleLessons);
  });

  const insertedLessons = await db.insert(aulas).values(lessonsData).returning();
  logger.info('Lessons created', { count: insertedLessons.length });

  return insertedLessons;
}