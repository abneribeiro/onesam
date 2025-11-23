"use client"

import { Table } from "@tanstack/react-table"
import { Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onBulkDelete?: (ids: number[]) => void
  deleteLoading?: boolean
  filterComponent?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Pesquisar...",
  searchKey,
  searchValue,
  onSearchChange,
  onBulkDelete,
  deleteLoading = false,
  filterComponent,
}: DataTableToolbarProps<TData>) {
  const isFiltered = searchValue && searchValue.length > 0
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelection = selectedRows.length > 0

  const handleBulkDelete = () => {
    if (onBulkDelete && hasSelection) {
      const ids = selectedRows.map((row) => (row.original as { id: number }).id)
      onBulkDelete(ids)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {onSearchChange && (
          <div className="relative">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={() => onSearchChange("")}
                className="absolute right-0 top-0 h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        {filterComponent}
        {hasSelection && onBulkDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={deleteLoading}
            className="h-8"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar ({selectedRows.length})
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
