import type { TipoPerfil } from './api.types';

declare module 'better-auth' {
  interface User {
    ativo: boolean;
    tipoPerfil: TipoPerfil;
    perfilId?: number;
  }
}
