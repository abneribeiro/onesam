"use client"

import { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  manualPagination?: boolean
  onPaginationChange?: (pageIndex: number, pageSize: number) => void
  pageCount?: number
}

export function DataTablePagination<TData>({
  table,
  manualPagination = false,
  onPaginationChange,
  pageCount,
}: DataTablePaginationProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows.length
  const totalRows = table.getFilteredRowModel().rows.length
  const currentPageIndex = table.getState().pagination.pageIndex
  const currentPageSize = table.getState().pagination.pageSize
  const totalPages = manualPagination ? (pageCount ?? 1) : table.getPageCount()

  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value)
    if (manualPagination && onPaginationChange) {
      onPaginationChange(0, newSize)
    } else {
      table.setPageSize(newSize)
    }
  }

  const handleFirstPage = () => {
    if (manualPagination && onPaginationChange) {
      onPaginationChange(0, currentPageSize)
    } else {
      table.setPageIndex(0)
    }
  }

  const handlePreviousPage = () => {
    if (manualPagination && onPaginationChange) {
      onPaginationChange(Math.max(0, currentPageIndex - 1), currentPageSize)
    } else {
      table.previousPage()
    }
  }

  const handleNextPage = () => {
    if (manualPagination && onPaginationChange) {
      onPaginationChange(Math.min(totalPages - 1, currentPageIndex + 1), currentPageSize)
    } else {
      table.nextPage()
    }
  }

  const handleLastPage = () => {
    if (manualPagination && onPaginationChange) {
      onPaginationChange(totalPages - 1, currentPageSize)
    } else {
      table.setPageIndex(totalPages - 1)
    }
  }

  const canPreviousPage = currentPageIndex > 0
  const canNextPage = currentPageIndex < totalPages - 1

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
      <div className="text-sm text-muted-foreground">
        {selectedRows > 0 ? (
          <span>
            {selectedRows} de {totalRows} linha(s) selecionada(s).
          </span>
        ) : (
          <span>Total de {totalRows} linha(s).</span>
        )}
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Linhas por pagina</p>
          <Select
            value={`${currentPageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={currentPageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          Pagina {currentPageIndex + 1} de {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleFirstPage}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Ir para primeira pagina</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handlePreviousPage}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Ir para pagina anterior</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleNextPage}
            disabled={!canNextPage}
          >
            <span className="sr-only">Ir para proxima pagina</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleLastPage}
            disabled={!canNextPage}
          >
            <span className="sr-only">Ir para ultima pagina</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
