"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ExcelExportButtonProps<T> {
  data: T[]
  filename?: string
  sheetName?: string
  columns: {
    header: string
    key: keyof T | ((item: T, index: number) => string | number | boolean | null | undefined)
  }[]
  className?: string
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
}

export function ExcelExportButton<T>({
  data,
  filename = "report",
  sheetName = "Sheet1",
  columns,
  variant = "outline",
  className,
}: ExcelExportButtonProps<T>) {
  const [open, setOpen] = React.useState(false)

  const exportToExcel = () => {
    // Transform data to rows based on columns
    const rows = data.map((item, index) => {
      const row: Record<string, any> = {}
      columns.forEach((col) => {
        if (typeof col.key === "function") {
          row[col.header] = col.key(item, index)
        } else {
          row[col.header] = item[col.key]
        }
      });
      return row
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate and download file
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    setOpen(false)
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button


          disabled={!data || data.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Excel Report
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Export to Excel?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to export {data.length} records to an Excel file named "{filename}.xlsx"?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={exportToExcel}>
            Confirm Export
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
