'use client';

import * as React from "react"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  GraduationCap,
  FolderTree,
  type LucideIcon,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { NavMain } from "@/components/NavMain"
import { NavUser } from "@/components/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import type { TipoPerfil } from "@/types"

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  roles: TipoPerfil[]
  isActive?: boolean
  badge?: number
  items?: {
    title: string
    url: string
  }[]
}

const getNavigationData = (role: TipoPerfil): NavItem[] => {
  if (role === 'admin') {
    return [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
        roles: ["admin"],
      },
      {
        title: "Cursos",
        url: "/admin/cursos",
        icon: BookOpen,
        roles: ["admin"],
        items: [
          {
            title: "Todos os Cursos",
            url: "/admin/cursos",
          },
          {
            title: "Criar Curso",
            url: "/admin/cursos/criar",
          },
          {
            title: "Categorias",
            url: "/admin/categorias",
          },
        ],
      },
      {
        title: "Areas",
        url: "/admin/areas",
        icon: FolderTree,
        roles: ["admin"],
      },
      {
        title: "Utilizadores",
        url: "/admin/utilizadores",
        icon: Users,
        roles: ["admin"],
        items: [
          {
            title: "Todos",
            url: "/admin/utilizadores",
          },
          {
            title: "Criar Utilizador",
            url: "/admin/utilizadores/criar",
          },
        ],
      },
      {
        title: "Inscricoes",
        url: "/admin/inscricoes",
        icon: FileText,
        roles: ["admin"],
      },
    ];
  }

  return [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ["formando"],
    },
    {
      title: "Catalogo de Cursos",
      url: "/cursos",
      icon: BookOpen,
      roles: ["formando"],
    },
    {
      title: "Minhas Inscricoes",
      url: "/minhas-inscricoes",
      icon: FileText,
      roles: ["formando"],
    },
  ];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentUser } = useAuth()

  const navigationData = currentUser ? getNavigationData(currentUser.tipoPerfil) : []
  const filteredNav = navigationData.filter((item) =>
    currentUser ? item.roles.includes(currentUser.tipoPerfil) : false
  )

  const user = currentUser ? {
    name: currentUser.nome,
    email: currentUser.email,
    avatar: currentUser.avatar || "",
  } : undefined

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-16 items-center px-6 gap-3">
          {/* Logo with gradient */}
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-200 hover:scale-105">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              OneSAM
            </span>
            <p className="text-xs text-muted-foreground">Plataforma de Formacao</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>

      <SidebarFooter className="gap-2">
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
