import { CourseCardSkeleton, CourseCardGridSkeleton } from '@/components/ui/loading-system';

/**
 * @deprecated Use CourseCardSkeleton from @/components/ui/loading-system instead
 * This component is kept for backwards compatibility
 */
export function CardSkeleton() {
  return <CourseCardSkeleton />;
}

interface CardGridSkeletonProps {
  count?: number;
}

/**
 * @deprecated Use CourseCardGridSkeleton from @/components/ui/loading-system instead
 * This component is kept for backwards compatibility
 */
export function CardGridSkeleton({ count = 6 }: CardGridSkeletonProps) {
  return <CourseCardGridSkeleton count={count} />;
}
