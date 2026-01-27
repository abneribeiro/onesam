import { DataTableSkeleton } from '@/components/ui/loading-system';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * @deprecated Use DataTableSkeleton from @/components/ui/loading-system instead
 * This component is kept for backwards compatibility
 */
export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return <DataTableSkeleton rows={rows} columns={columns} showActions={false} />;
}
