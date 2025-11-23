'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { cursoService } from '@/services/curso.service';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface DynamicLabel {
  id: string;
  name: string;
  type: 'curso' | 'utilizador';
}

const routeLabels: Record<string, string> = {
  '/': 'Início',
  '/dashboard': 'Dashboard',
  '/cursos': 'Cursos',
  '/minhas-inscricoes': 'Minhas Inscrições',
  '/perfil': 'Perfil',
  '/notificacoes': 'Notificações',
  '/admin': 'Admin',
  '/admin/dashboard': 'Dashboard',
  '/admin/cursos': 'Cursos',
  '/admin/cursos/criar': 'Criar Curso',
  '/admin/utilizadores': 'Utilizadores',
  '/admin/utilizadores/criar': 'Criar Utilizador',
  '/admin/inscricoes': 'Inscrições',
  '/admin/areas': 'Áreas',
  '/admin/categorias': 'Categorias',
};

const subRouteLabels: Record<string, string> = {
  'conteudo': 'Conteúdo',
  'editar': 'Editar',
  'inscricoes': 'Inscrições',
  'progresso': 'Progresso',
  'avaliacoes': 'Avaliações',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, DynamicLabel>>({});

  const segments = pathname.split('/').filter(Boolean);
  const isAdminArea = segments[0] === 'admin';
  const homeHref = isAdminArea ? '/admin' : '/dashboard';

  useEffect(() => {
    const fetchDynamicLabels = async () => {
      const newLabels: Record<string, DynamicLabel> = {};

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const prevSegment = segments[i - 1];

        if (/^\d+$/.test(segment)) {
          if (prevSegment === 'cursos') {
            try {
              const curso = await cursoService.buscarCurso(Number(segment));
              if (curso) {
                newLabels[segment] = {
                  id: segment,
                  name: curso.nome,
                  type: 'curso',
                };
              }
            } catch {
              // Ignore errors - will show ID as fallback
            }
          }
        }
      }

      if (Object.keys(newLabels).length > 0) {
        setDynamicLabels(newLabels);
      }
    };

    fetchDynamicLabels();
  }, [pathname]);

  const allBreadcrumbs: BreadcrumbItem[] = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const prevSegment = segments[index - 1];

    if (routeLabels[path]) {
      return {
        label: routeLabels[path],
        path: path,
      };
    }

    if (subRouteLabels[segment]) {
      return {
        label: subRouteLabels[segment],
        path: path,
      };
    }

    if (/^\d+$/.test(segment)) {
      const dynamicLabel = dynamicLabels[segment];
      if (dynamicLabel) {
        return {
          label: dynamicLabel.name,
          path: path,
        };
      }

      if (prevSegment === 'cursos') {
        return {
          label: `Curso #${segment}`,
          path: path,
        };
      }

      if (prevSegment === 'utilizadores') {
        return {
          label: `Utilizador #${segment}`,
          path: path,
        };
      }

      return {
        label: `#${segment}`,
        path: path,
      };
    }

    return {
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: path,
    };
  });

  // Filter out the first breadcrumb if it matches the home destination
  // to avoid duplication (Home icon already points there)
  const breadcrumbs = allBreadcrumbs.filter((item, index) => {
    if (index === 0 && item.path === homeHref) {
      return false;
    }
    return true;
  });

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link
        href={homeHref}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Início</span>
      </Link>

      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <Fragment key={item.path}>
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link
                href={item.path}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
