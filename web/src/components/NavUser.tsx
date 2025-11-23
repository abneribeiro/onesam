'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  ChevronsUpDown,
  LogOut,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { ConfirmDialog } from "@/components/features"
import { useNotificacoesNaoLidasCount } from "@/hooks/useNotificacoes"
import { Badge } from "@/components/ui/badge"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { logout } = useAuth()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { count: notificationsCount } = useNotificacoesNaoLidasCount()

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await logout()
    } finally {
      setLoggingOut(false)
      setShowLogoutDialog(false)
      router.replace('/login')
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/perfil')}>
                  <User />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/notificacoes')} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell />
                    Notificações
                  </div>
                  {notificationsCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {notificationsCount > 99 ? '99+' : notificationsCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowLogoutDialog(true)}
                className="text-destructive"
              >
                <LogOut />
                Terminar Sessão
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Terminar Sessão"
        description="Tem certeza que deseja sair da aplicação?"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleLogout}
        loading={loggingOut}
      />
    </>
  )
}
