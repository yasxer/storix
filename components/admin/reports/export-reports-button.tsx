"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ReportData {
  month: string;
  retailSales: number;
  onlineSales: number;
  expenses: number;
  netProfit: number;
}

export function ExportReportsButton({ data }: { data: ReportData[] }) {
  const handleExport = () => {
    const headers = ["Month", "Retail Sales (DA)", "Online Sales (DA)", "Expenses (DA)", "Net Profit (DA)"]
    const rows = data.map(r => [
      r.month,
      r.retailSales,
      r.onlineSales,
      r.expenses,
      r.netProfit
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `monthly_reports_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={handleExport} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}

