import { useMemo, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { parseISO, format, startOfYear, endOfYear } from 'date-fns';
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

// Calculate activity level based on count
function getActivityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count >= 10) return 4;
  if (count >= 7) return 3;
  if (count >= 4) return 2;
  if (count > 0) return 1;
  return 0;
}

// Process progressos into activity data map (all years)
function processProgressosToMap(progressos: ProgressoAula[]): Map<string, { count: number; level: 0 | 1 | 2 | 3 | 4 }> {
  const progressosPorData = new Map<string, number>();

  progressos.forEach((p) => {
    if (!p.concluida || !p.dataConclusao) return;
    const dateKey = format(parseISO(p.dataConclusao), 'yyyy-MM-dd');
    progressosPorData.set(dateKey, (progressosPorData.get(dateKey) || 0) + 1);
  });

  const activityMap = new Map<string, { count: number; level: 0 | 1 | 2 | 3 | 4 }>();

  progressosPorData.forEach((count, dateKey) => {
    activityMap.set(dateKey, {
      count,
      level: getActivityLevel(count),
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
  activityMap: Map<string, { count: number; level: 0 | 1 | 2 | 3 | 4 }>,
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
    isError,
    error,
  } = useQuery<ProgressoAula[], Error>({
    queryKey: aulaKeys.meuProgresso(),
    queryFn: () => aulaService.obterMeuProgresso(),
    staleTime: 1000 * 60 * 10, // 10 minutes - increased for better caching
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
    retry: 3,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  // Process all progressos into a map (memoized - only recalculates when progressos change)
  const activityMap = useMemo(() => {
    return processProgressosToMap(progressos);
  }, [progressos]);

  // Get available years (memoized)
  const availableYears = useMemo(() => {
    return getAvailableYears(progressos);
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
    isError,
    error: error ?? null,
  };
}
