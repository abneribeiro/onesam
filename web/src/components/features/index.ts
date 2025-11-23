/**
 * Barrel export para todos os componentes features
 * Permite importar múltiplos componentes de uma vez:
 * import { Logo, SearchInput, StatsCard } from '@/components/features';
 */

// Status and badges
export { EstadoBadge, EstadoCursoBadge, NivelBadge } from './StatusBadge';
export { PerfilBadge } from './PerfilBadge';

// UI Components
export { Logo } from './Logo';
export { SearchInput } from './SearchInput';
export { DateDisplay, DateRangeDisplay } from './DateDisplay';
export { UserAvatar } from './UserAvatar';
export { ConfirmDialog } from './ConfirmDialog';
export { StatsCard } from './StatsCard';
export { PasswordInput } from './PasswordInput';
export { CursoCard } from './CursoCard';
export { LazyImage } from './LazyImage';

// Accessibility
export { SkipToContent } from './SkipToContent';

// State components
export { EmptyState } from './EmptyState';
export { ErrorState } from './ErrorState';
export { LoadingState } from './LoadingState';

// Layout components
export { PageHeader } from './PageHeader';
export { StatCard } from './StatCard';
