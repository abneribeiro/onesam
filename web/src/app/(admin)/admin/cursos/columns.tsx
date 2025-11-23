"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye, BookOpen, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EstadoCursoBadge, NivelBadge } from "@/components/features/StatusBadge"
import type { CursoComRelations } from "@/types"

interface ColumnActions {
  onView: (id: number) => void
  onContent: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

export function createColumns(actions: ColumnActions): ColumnDef<CursoComRelations>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "nome",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("nome")}</div>,
    },
    {
      accessorKey: "nivel",
      header: "Nivel",
      cell: ({ row }) => <NivelBadge nivel={row.getValue("nivel")} />,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => <EstadoCursoBadge estado={row.getValue("estado")} />,
    },
    {
      accessorKey: "cargaHoraria",
      header: "Carga Horaria",
      cell: ({ row }) => {
        const carga = row.getValue("cargaHoraria") as number | null
        return <span>{carga ? `${carga}h` : "-"}</span>
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right"></div>,
      cell: ({ row }) => {
        const curso = row.original

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => actions.onView(curso.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.onContent(curso.id)}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Gerenciar Conteudo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.onEdit(curso.id)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => actions.onDelete(curso.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
