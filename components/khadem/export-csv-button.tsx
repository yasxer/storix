"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function ExportCsvButton({ data, filename }: { data: any[], filename: string }) {
  const handleExport = () => {
    if (!data || data.length === 0) return alert("No data to export.")

    // Generate CSV Header
    const headers = ["ID", "Date", "Khadem", "Total Items", "Total Price (DA)"]
    const csvRows = [headers.join(",")]

    // Generate CSV Rows
    data.forEach((row) => {
      const date = new Date(row.created_at).toLocaleString()
      const khadem = row.profiles?.full_name || "Admin"
      const totalItems = row.bon_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
      const items = [
        row.id,
        `"${date}"`,
        `"${khadem}"`,
        totalItems,
        row.total_price
      ]
      csvRows.push(items.join(","))
    })

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}
