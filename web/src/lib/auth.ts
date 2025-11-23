import type { TipoPerfil } from '../types';

export function getDefaultRedirectPath(perfil: TipoPerfil): string {
  switch (perfil) {
    case 'admin':
      return '/admin/dashboard';
    case 'formando':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}
