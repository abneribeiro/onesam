'use client';

import { useMemo, useCallback, memo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Target } from 'lucide-react';

export interface ActivityData {
  date: Date;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  lessons?: string[];
  totalTime?: number;
}

// Configurações de metas
const DAILY_GOAL = 1; // Meta de 1 atividade por dia

interface ActivityHeatmapProps {
  data: ActivityData[];
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  isLoading?: boolean;
}

// GitHub-style activity cell component
const HeatmapCell = memo(function HeatmapCell({
  date,
  level,
  count,
  cellSize,
  gridColumn,
  gridRow,
  lessons = [],
  totalTime = 0,
}: {
  date: Date | null;
  level: 0 | 1 | 2 | 3 | 4;
  count: number;
  cellSize: number;
  gridColumn: number;
  gridRow: number;
  lessons?: string[];
  totalTime?: number;
}) {
  // MOVE: All hooks to the top (before any conditional returns)
  const [isHovered, setIsHovered] = useState(false);

  // COMPUTE: Required values (handle null date safely)
  const dateStr = date ? format(date, 'dd MMM yyyy', { locale: pt }) : '';
  const atingiuMeta = count >= DAILY_GOAL;

  // MOVE: useMemo hook here (before any returns)
  const tooltipContent = useMemo(() => {
    if (!date || count === 0) {
      return `${dateStr}: Nenhuma atividade`;
    }

    let tooltip = `${dateStr}: ${count} atividade${count !== 1 ? 's' : ''}`;

    if (totalTime > 0) {
      tooltip += `\n⏱️ ${totalTime}min estudados`;
    }

    if (lessons.length > 0) {
      tooltip += `\n📚 `;
      if (lessons.length <= 2) {
        tooltip += lessons.join(', ');
      } else {
        tooltip += `${lessons.slice(0, 2).join(', ')}...+${lessons.length - 2}`;
      }
    }

    if (atingiuMeta) {
      tooltip += '\n🎯 Meta atingida!';
    }

    return tooltip;
  }, [date, dateStr, count, totalTime, lessons, atingiuMeta]);

  // GitHub-inspired activity colors
  const ACTIVITY_COLORS = {
    0: '#ebedf0', // light gray
    1: '#c6e48b', // very light green
    2: '#7bc96f', // light green
    3: '#239a3b', // medium green
    4: '#196127'  // dark green
  };

  // HANDLE: Null date in final return (not early return)
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

  return (
    <div
      className="relative cursor-pointer transition-opacity duration-200 ease-out"
      style={{
        width: cellSize,
        height: cellSize,
        gridColumn,
        gridRow,
        borderRadius: '3px',
        backgroundColor: level === 0 ? '#ebedf0' : ACTIVITY_COLORS[level],
        border: level === 0 ? '1px solid #d1d5da' : 'none',
        opacity: isHovered ? 0.8 : 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={tooltipContent}
    >

    </div>
  );
});

// Clean legend with GitHub-style colors
const Legend = memo(function Legend({ cellSize }: { cellSize: number }) {
  // GitHub-inspired activity colors
  const ACTIVITY_COLORS = {
    0: '#ebedf0', // light gray
    1: '#c6e48b', // very light green
    2: '#7bc96f', // light green
    3: '#239a3b', // medium green
    4: '#196127'  // dark green
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-500">Menos</span>
      <div className="flex gap-1">
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <div
            key={level}
            className="transition-opacity duration-200 hover:opacity-70"
            style={{
              width: cellSize,
              height: cellSize,
              borderRadius: '3px',
              backgroundColor: level === 0 ? '#ebedf0' : ACTIVITY_COLORS[level],
              border: level === 0 ? '1px solid #d1d5da' : 'none',
            }}
          />
        ))}
      </div>
      <span className="text-emerald-600 font-medium">Mais</span>
    </div>
  );
});

// Clean year selector
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
    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 transition-all"
        onClick={handlePrev}
        disabled={!canGoPrev}
        aria-label="Ano anterior"
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>
      <span className="text-sm font-semibold min-w-[3rem] text-center text-slate-700 dark:text-slate-300">
        {selectedYear}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 transition-all"
        onClick={handleNext}
        disabled={!canGoNext}
        aria-label="Próximo ano"
      >
        <ChevronRight className="h-3 w-3" />
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
  const [isMobile, setIsMobile] = useState(false);

  // Responsive breakpoint detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    const handleResize = () => checkMobile();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cellSize = isMobile ? 11 : 13;
  const cellGap = isMobile ? 2 : 3;

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

  // Calculate statistics with neutral language
  const { totalActivities, currentStreak } = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.count, 0);

    // Calculate streak
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

    return {
      totalActivities: total,
      currentStreak: streak,
    };
  }, [data, activityMap]);

  if (isLoading) {
    return (
      <div className="w-full bg-white p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-6 w-6 rounded-full bg-emerald-500 animate-pulse" />
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-center">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto mt-2" />
          </div>
        </div>
      </div>
    );
  }

  // Clean empty state
  if (data.length === 0) {
    return (
      <div className="w-full bg-white p-6">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-lg font-semibold text-slate-700">
            Atividade de Aprendizado
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Target className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="space-y-2">
            <p className="text-slate-600 dark:text-slate-400 font-medium">Nenhuma atividade registrada</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm max-w-xs">
              Complete aulas para começar a rastrear seu progresso de aprendizado!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6">
      {/* Simplified header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Atividade de Aprendizado</h2>
          <p className="text-sm text-slate-600">
            {totalActivities} atividade{totalActivities !== 1 ? 's' : ''} em {selectedYear} • Sequência atual: {currentStreak} dias
          </p>
        </div>
        <YearSelector
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
        />
      </div>

      <div className="flex flex-col h-full gap-4">
        {/* Month labels */}
        <div
          className="relative text-xs font-medium text-slate-600"
          style={{
            marginLeft: isMobile ? 28 : 40,
            height: 20,
          }}
        >
          {months.map((monthData, index) => {
            const xPosition = monthData.weekIndex * (cellSize + cellGap);
            const nextMonth = months[index + 1];
            const hasEnoughSpace = !nextMonth || (nextMonth.weekIndex - monthData.weekIndex) >= (isMobile ? 2 : 3);

            return (
              <span
                key={`${monthData.month}-${monthData.weekIndex}`}
                className="absolute whitespace-nowrap transition-opacity hover:opacity-100"
                style={{
                  left: xPosition,
                  opacity: hasEnoughSpace ? 1 : 0.6,
                }}
              >
                {hasEnoughSpace ? monthData.month : ''}
              </span>
            );
          })}
        </div>

        {/* Heatmap Grid */}
        <div className={cn("flex gap-3 flex-1 relative", isMobile && "overflow-x-auto")}>
          {/* Day labels */}
          <div
            className="grid text-xs font-medium text-slate-600 shrink-0 items-center"
            style={{
              gridTemplateRows: `repeat(7, ${cellSize}px)`,
              gap: `${cellGap}px`,
              width: isMobile ? 22 : 32,
            }}
          >
            <div className="text-right pr-2">{isMobile ? 'D' : 'Dom'}</div>
            <div className="text-right pr-2">{isMobile ? 'S' : 'Seg'}</div>
            <div className="text-right pr-2">{isMobile ? 'T' : 'Ter'}</div>
            <div className="text-right pr-2">{isMobile ? 'Q' : 'Qua'}</div>
            <div className="text-right pr-2">{isMobile ? 'Q' : 'Qui'}</div>
            <div className="text-right pr-2">{isMobile ? 'S' : 'Sex'}</div>
            <div className="text-right pr-2">{isMobile ? 'S' : 'Sáb'}</div>
          </div>

          {/* Heatmap grid */}
          <div
            className={cn("grid pb-3", !isMobile && "overflow-x-auto")}
            style={{
              gridTemplateColumns: `repeat(${totalWeeks}, ${cellSize}px)`,
              gridTemplateRows: `repeat(7, ${cellSize}px)`,
              gap: `${cellGap}px`,
              minWidth: isMobile ? totalWeeks * (cellSize + cellGap) : 'auto',
            }}
          >
            {grid.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const activity = day ? getActivity(day) : { level: 0 as const, count: 0 };
                const dayActivity = day ? activityMap.get(format(day, 'yyyy-MM-dd')) : undefined;

                return (
                  <HeatmapCell
                    key={`${weekIndex}-${dayIndex}`}
                    date={day}
                    level={activity.level}
                    count={activity.count}
                    cellSize={cellSize}
                    gridColumn={weekIndex + 1}
                    gridRow={dayIndex + 1}
                    lessons={dayActivity?.lessons || []}
                    totalTime={dayActivity?.totalTime || 0}
                  />
                );
              })
            )}
          </div>

          {/* Legend positioned at bottom-right */}
          <div className="absolute bottom-0 right-0">
            <Legend cellSize={cellSize} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default ActivityHeatmap;
