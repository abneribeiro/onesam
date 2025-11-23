'use client';

import { useMemo, useCallback, memo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, isSameDay, subYears, isAfter } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ActivityData {
  date: Date;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ActivityHeatmapProps {
  data: ActivityData[];
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  isLoading?: boolean;
}

// Memoized cell component to prevent unnecessary re-renders
const HeatmapCell = memo(function HeatmapCell({
  date,
  level,
  count,
  cellSize,
  gridColumn,
  gridRow,
}: {
  date: Date | null;
  level: 0 | 1 | 2 | 3 | 4;
  count: number;
  cellSize: number;
  gridColumn: number;
  gridRow: number;
}) {
  const levelColors = {
    0: 'bg-muted/30',
    1: 'bg-green-200 dark:bg-green-900',
    2: 'bg-green-400 dark:bg-green-700',
    3: 'bg-green-600 dark:bg-green-500',
    4: 'bg-green-800 dark:bg-green-300',
  };

  if (!date) {
    return (
      <div
        style={{
          width: cellSize,
          height: cellSize,
          gridColumn,
          gridRow,
        }}
      />
    );
  }

  const dateStr = format(date, 'dd MMM yyyy', { locale: pt });

  return (
    <div
      className={cn(
        'rounded-sm border border-border/50 transition-all hover:scale-110 hover:border-border hover:z-10 cursor-pointer',
        levelColors[level]
      )}
      style={{
        width: cellSize,
        height: cellSize,
        gridColumn,
        gridRow,
      }}
      title={`${dateStr}: ${count} atividade${count !== 1 ? 's' : ''}`}
    />
  );
});

// Memoized legend component
const Legend = memo(function Legend({ cellSize }: { cellSize: number }) {
  const levelColors = {
    0: 'bg-muted/30',
    1: 'bg-green-200 dark:bg-green-900',
    2: 'bg-green-400 dark:bg-green-700',
    3: 'bg-green-600 dark:bg-green-500',
    4: 'bg-green-800 dark:bg-green-300',
  };

  return (
    <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
      <span>Menos</span>
      <div className="flex gap-1">
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <div
            key={level}
            className={cn('rounded-sm border border-border/50', levelColors[level])}
            style={{ width: cellSize, height: cellSize }}
          />
        ))}
      </div>
      <span>Mais</span>
    </div>
  );
});

// Year selector component like GitHub
const YearSelector = memo(function YearSelector({
  availableYears,
  selectedYear,
  onYearChange,
}: {
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}) {
  const currentYearIndex = availableYears.indexOf(selectedYear);
  const canGoNext = currentYearIndex > 0;
  const canGoPrev = currentYearIndex < availableYears.length - 1;

  const handlePrev = useCallback(() => {
    if (canGoPrev) {
      onYearChange(availableYears[currentYearIndex + 1]);
    }
  }, [canGoPrev, onYearChange, availableYears, currentYearIndex]);

  const handleNext = useCallback(() => {
    if (canGoNext) {
      onYearChange(availableYears[currentYearIndex - 1]);
    }
  }, [canGoNext, onYearChange, availableYears, currentYearIndex]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handlePrev}
        disabled={!canGoPrev}
        aria-label="Ano anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[4rem] text-center">{selectedYear}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleNext}
        disabled={!canGoNext}
        aria-label="Próximo ano"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});

export const ActivityHeatmap = memo(function ActivityHeatmap({
  data,
  availableYears,
  selectedYear,
  onYearChange,
  isLoading = false,
}: ActivityHeatmapProps) {
  const cellSize = 14;
  const cellGap = 3;

  // Build the grid structure for the selected year
  const { grid, months, totalWeeks } = useMemo(() => {
    const today = new Date();
    const isCurrentYear = selectedYear === today.getFullYear();

    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = isCurrentYear ? today : endOfYear(new Date(selectedYear, 0, 1));

    // Get all days in the year up to today (or end of year for past years)
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

    // Organize days into weeks (columns) with days of week as rows
    const gridDays: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = new Array(7).fill(null);
    let weekIndex = 0;

    // Fill in empty days at the start of the first week
    const firstDayOfWeek = getDay(yearStart); // 0 = Sunday

    allDays.forEach((day, index) => {
      const dayOfWeek = getDay(day); // 0 = Sunday, 6 = Saturday

      // Start a new week if needed
      if (index > 0 && dayOfWeek === 0) {
        gridDays.push(currentWeek);
        currentWeek = new Array(7).fill(null);
        weekIndex++;
      }

      currentWeek[dayOfWeek] = day;
    });

    // Push the last week
    if (currentWeek.some(d => d !== null)) {
      gridDays.push(currentWeek);
    }

    // Calculate month labels
    const monthLabels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    gridDays.forEach((week, wIndex) => {
      const firstValidDay = week.find(day => day !== null);
      if (firstValidDay) {
        const month = firstValidDay.getMonth();
        if (month !== lastMonth) {
          monthLabels.push({
            month: format(firstValidDay, 'MMM', { locale: pt }),
            weekIndex: wIndex,
          });
          lastMonth = month;
        }
      }
    });

    return { grid: gridDays, months: monthLabels, totalWeeks: gridDays.length };
  }, [selectedYear]);

  // Create a lookup map for activity data (optimized O(1) lookup)
  const activityMap = useMemo(() => {
    const map = new Map<string, ActivityData>();
    data.forEach(activity => {
      const key = format(activity.date, 'yyyy-MM-dd');
      map.set(key, activity);
    });
    return map;
  }, [data]);

  // Get activity for a specific date
  const getActivity = useCallback((date: Date): { level: 0 | 1 | 2 | 3 | 4; count: number } => {
    const key = format(date, 'yyyy-MM-dd');
    const activity = activityMap.get(key);
    return {
      level: activity?.level || 0,
      count: activity?.count || 0,
    };
  }, [activityMap]);

  // Calculate statistics
  const { totalActivities, currentStreak } = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.count, 0);

    // Calculate streak (consecutive days with activity from today backwards)
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = format(date, 'yyyy-MM-dd');
      const activity = activityMap.get(key);

      if (activity && activity.count > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return { totalActivities: total, currentStreak: streak };
  }, [data, activityMap]);

  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Atividade de Aprendizado</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse text-muted-foreground">A carregar...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Atividade de Aprendizado</CardTitle>
            <CardDescription>
              {totalActivities} atividade{totalActivities !== 1 ? 's' : ''} em {selectedYear}
              {selectedYear === new Date().getFullYear() && ` • Sequência atual: ${currentStreak} dia${currentStreak !== 1 ? 's' : ''}`}
            </CardDescription>
          </div>
          <YearSelector
            availableYears={availableYears}
            selectedYear={selectedYear}
            onYearChange={onYearChange}
          />
        </div>
      </CardHeader>
      <CardContent className="w-full flex-1">
        <div className="flex flex-col h-full gap-3">
          {/* Month labels */}
          <div
            className="relative text-xs text-muted-foreground"
            style={{
              marginLeft: 44,
              height: 20,
            }}
          >
            {months.map((monthData, index) => {
              const xPosition = monthData.weekIndex * (cellSize + cellGap);
              const nextMonth = months[index + 1];
              const hasEnoughSpace = !nextMonth || (nextMonth.weekIndex - monthData.weekIndex) >= 3;

              return (
                <span
                  key={`${monthData.month}-${monthData.weekIndex}`}
                  className="absolute whitespace-nowrap"
                  style={{
                    left: xPosition,
                  }}
                >
                  {hasEnoughSpace ? monthData.month : ''}
                </span>
              );
            })}
          </div>

          {/* Heatmap Grid */}
          <div className="flex gap-2 flex-1">
            {/* Day labels */}
            <div
              className="grid text-xs text-muted-foreground shrink-0 items-center"
              style={{
                gridTemplateRows: `repeat(7, ${cellSize}px)`,
                gap: `${cellGap}px`,
                width: 36,
              }}
            >
              <div className="text-right pr-1">Dom</div>
              <div className="text-right pr-1">Seg</div>
              <div className="text-right pr-1">Ter</div>
              <div className="text-right pr-1">Qua</div>
              <div className="text-right pr-1">Qui</div>
              <div className="text-right pr-1">Sex</div>
              <div className="text-right pr-1">Sáb</div>
            </div>

            {/* Grid */}
            <div
              className="grid overflow-x-auto pb-2"
              style={{
                gridTemplateColumns: `repeat(${totalWeeks}, ${cellSize}px)`,
                gridTemplateRows: `repeat(7, ${cellSize}px)`,
                gap: `${cellGap}px`,
              }}
            >
              {grid.map((week, weekIndex) =>
                week.map((day, dayIndex) => {
                  const activity = day ? getActivity(day) : { level: 0 as const, count: 0 };

                  return (
                    <HeatmapCell
                      key={`${weekIndex}-${dayIndex}`}
                      date={day}
                      level={activity.level}
                      count={activity.count}
                      cellSize={cellSize}
                      gridColumn={weekIndex + 1}
                      gridRow={dayIndex + 1}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Legend */}
          <Legend cellSize={cellSize} />
        </div>
      </CardContent>
    </Card>
  );
});

export default ActivityHeatmap;
