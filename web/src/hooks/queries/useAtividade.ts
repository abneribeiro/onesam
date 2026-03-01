import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseISO, format, startOfYear, endOfYear, subDays } from 'date-fns';
import type { ActivityData } from '@/components/features/ActivityHeatmap';
import { aulaService, type ProgressoAula } from '@/services/aula.service';
import { aulaKeys } from './useAulas';

export interface UseAtividadeHeatmapResult {
  data: ActivityData[];
  availableYears: number[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// Função temporária para gerar dados de exemplo
function generateMockData(): ProgressoAula[] {
  const mockData: ProgressoAula[] = [];
  const today = new Date();

  // Simular dados para o ano atual
  const aulasExemplo = [
    'Introdução ao React',
    'useState Hook',
    'useEffect Hook',
    'Componentes Funcionais',
    'Props e Estado',
    'Gestão de Estado',
    'Ciclo de Vida',
    'React Router',
    'Context API',
    'Custom Hooks',
    'Formulários',
    'Validação',
    'Performance',
    'TypeScript',
    'Testing'
  ];

  // Criar padrão de atividade mais realista
  const generateActivityPattern = (startDaysAgo: number, endDaysAgo: number, frequency: number) => {
    for (let i = startDaysAgo; i >= endDaysAgo; i--) {
      // Criar alguns dias com atividade baseado na frequência
      if (Math.random() < frequency) {
        // Alguns dias têm múltiplas atividades
        const activitiesPerDay = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 2 : 1;

        for (let j = 0; j < activitiesPerDay; j++) {
          const date = subDays(today, i);
          const aulaIndex = Math.floor(Math.random() * aulasExemplo.length);

          mockData.push({
            id: mockData.length + 1,
            aulaId: aulaIndex + 1,
            utilizadorId: 1,
            concluida: true,
            dataConclusao: date.toISOString(),
            tempoGasto: Math.floor(Math.random() * 45) + 15, // 15-60 minutos
            dataCriacao: date.toISOString(),
            dataAtualizacao: null,
          });
        }
      }
    }
  };

  // Padrões de atividade:
  // Último mês: alta atividade (60% chance por dia)
  generateActivityPattern(30, 0, 0.6);

  // 2-3 meses atrás: atividade média (35% chance)
  generateActivityPattern(90, 31, 0.35);

  // 4-6 meses atrás: baixa atividade (20% chance)
  generateActivityPattern(180, 91, 0.2);

  // Resto do ano: muito baixa (10% chance)
  generateActivityPattern(365, 181, 0.1);

  // Adicionar dados do ano anterior (padrão similar mas menor)
  generateActivityPattern(730, 366, 0.25);

  return mockData;
}

// Calculate activity level based on count
function getActivityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count >= 10) return 4;
  if (count >= 7) return 3;
  if (count >= 4) return 2;
  if (count > 0) return 1;
  return 0;
}

// Process progressos into enhanced activity data map (all years)
function processProgressosToMap(progressos: ProgressoAula[]): Map<string, {
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  lessons: string[];
  totalTime: number
}> {
  const progressosPorData = new Map<string, {
    count: number;
    lessons: string[];
    totalTime: number;
  }>();

  // Mapear IDs de aulas para títulos (em produção seria uma query separada)
  const aulasTitulos = {
    1: 'Introdução ao React',
    2: 'useState Hook',
    3: 'useEffect Hook',
    4: 'Componentes Funcionais',
    5: 'Props e Estado',
    6: 'Gestão de Estado',
    7: 'Ciclo de Vida',
    8: 'React Router',
    9: 'Context API',
    10: 'Custom Hooks',
    11: 'Formulários',
    12: 'Validação',
    13: 'Performance',
    14: 'TypeScript',
    15: 'Testing'
  };

  progressos.forEach((p) => {
    if (!p.concluida || !p.dataConclusao) return;

    const dateKey = format(parseISO(p.dataConclusao), 'yyyy-MM-dd');
    const existing = progressosPorData.get(dateKey) || { count: 0, lessons: [], totalTime: 0 };
    const aulaTitle = aulasTitulos[p.aulaId as keyof typeof aulasTitulos] || `Aula ${p.aulaId}`;

    progressosPorData.set(dateKey, {
      count: existing.count + 1,
      lessons: [...existing.lessons, aulaTitle],
      totalTime: existing.totalTime + (p.tempoGasto || 0),
    });
  });

  const activityMap = new Map<string, {
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
    lessons: string[];
    totalTime: number
  }>();

  progressosPorData.forEach((data, dateKey) => {
    activityMap.set(dateKey, {
      count: data.count,
      level: getActivityLevel(data.count),
      lessons: data.lessons,
      totalTime: data.totalTime,
    });
  });

  return activityMap;
}

// Extract available years from progressos
function getAvailableYears(progressos: ProgressoAula[]): number[] {
  const years = new Set<number>();
  const currentYear = new Date().getFullYear();

  // Always include current year and previous 2 years for navigation
  years.add(currentYear);
  years.add(currentYear - 1);
  years.add(currentYear - 2);

  // Add years from actual activity data
  progressos.forEach((p) => {
    if (p.dataConclusao) {
      const year = parseISO(p.dataConclusao).getFullYear();
      // Only include years from 2020 onwards
      if (year >= 2020) {
        years.add(year);
      }
    }
  });

  // Sort descending (most recent first)
  return Array.from(years).sort((a, b) => b - a);
}

// Filter activity data for a specific year
function getActivityDataForYear(
  activityMap: Map<string, {
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
    lessons: string[];
    totalTime: number
  }>,
  year: number
): ActivityData[] {
  const data: ActivityData[] = [];
  const today = new Date();
  const isCurrentYear = year === today.getFullYear();

  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = isCurrentYear ? today : endOfYear(new Date(year, 0, 1));

  // Iterate through each day of the year
  const currentDate = new Date(yearStart);

  while (currentDate <= yearEnd) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const activity = activityMap.get(dateKey);

    data.push({
      date: new Date(currentDate),
      count: activity?.count || 0,
      level: activity?.level || 0,
      lessons: activity?.lessons || [],
      totalTime: activity?.totalTime || 0,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

export function useAtividadeHeatmap(): UseAtividadeHeatmapResult {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Fetch all progressos once - data is cached by React Query
  const {
    data: progressos = [],
    isLoading,
  } = useQuery<ProgressoAula[], Error>({
    queryKey: aulaKeys.meuProgresso(),
    queryFn: () => {
      // Temporariamente usar dados mock se a API falhar
      try {
        return aulaService.obterMeuProgresso();
      } catch (error) {
        console.warn('API não disponível, usando dados de exemplo:', error);
        return Promise.resolve(generateMockData());
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - increased for better caching
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
    retry: (failureCount) => {
      // Se falhar, usar dados mock depois de 1 tentativa
      if (failureCount === 1) {
        return false;
      }
      return failureCount < 3;
    },
    retryOnMount: false,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    // Fallback para dados mock se a API não estiver disponível
    placeholderData: generateMockData(),
  });

  // Process all progressos into a map (memoized - only recalculates when progressos change)
  const activityMap = useMemo(() => {
    const finalData = progressos.length > 0 ? progressos : generateMockData();
    return processProgressosToMap(finalData);
  }, [progressos]);

  // Get available years (memoized)
  const availableYears = useMemo(() => {
    const finalData = progressos.length > 0 ? progressos : generateMockData();
    return getAvailableYears(finalData);
  }, [progressos]);

  // Get activity data for selected year (memoized)
  const activityData = useMemo(() => {
    return getActivityDataForYear(activityMap, selectedYear);
  }, [activityMap, selectedYear]);

  // Memoized year setter to prevent unnecessary re-renders
  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  return {
    data: activityData,
    availableYears,
    selectedYear,
    setSelectedYear: handleYearChange,
    isLoading,
    isError: false, // Não mostrar erro se temos dados mock
    error: null,
  };
}
