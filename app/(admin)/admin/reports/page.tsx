import { createClient } from "@/lib/supabase/server"
import { format, parseISO } from "date-fns"
import { ExportReportsButton } from "@/components/admin/reports/export-reports-button"
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react"

interface MonthData {
  monthStr: string; // YYYY-MM
  retailSales: number;
  onlineSales: number;
  expenses: number;
}

export default async function ReportsPage() {
  const supabase = await createClient() as any

  const [bonsRes, ordersRes, vouchersRes] = await Promise.all([
    supabase.from("bons").select("created_at, total_price"),
    supabase.from("orders").select("created_at, total_price").eq("status", "delivered"),
    supabase.from("purchase_vouchers").select("created_at, total_amount")
  ])

  const bons = (bonsRes.data as any[]) || []
  const orders = (ordersRes.data as any[]) || []
  const vouchers = (vouchersRes.data as any[]) || []

  // Aggregate by Month
  const acc = new Map<string, MonthData>()

  const addValue = (dateStr: string, field: keyof Omit<MonthData, 'monthStr'>, amount: number) => {
    try {
      const parsed = parseISO(dateStr)
      if (isNaN(parsed.getTime())) return // skip invalid
      const monthStr = format(parsed, "yyyy-MM")
      if (!acc.has(monthStr)) {
        acc.set(monthStr, { monthStr, retailSales: 0, onlineSales: 0, expenses: 0 })
      }
      const existing = acc.get(monthStr)!
      existing[field] += amount
    } catch {
      // ignore parse errors
    }
  }

  bons.forEach(b => addValue(b.created_at, "retailSales", b.total_price))
  orders.forEach(o => addValue(o.created_at, "onlineSales", o.total_price))
  vouchers.forEach(v => addValue(v.created_at, "expenses", v.total_amount))

  const metrics = Array.from(acc.values())
    .sort((a, b) => b.monthStr.localeCompare(a.monthStr)) // Sort descending
    .map(m => ({
      month: format(parseISO(`${m.monthStr}-01`), "MMMM yyyy"),
      retailSales: m.retailSales,
      onlineSales: m.onlineSales,
      expenses: m.expenses,
      netProfit: (m.retailSales + m.onlineSales) - m.expenses
    }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Monthly Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Financial breakdown of retail sales, online sales, and purchase expenses.
          </p>
        </div>
        {metrics.length > 0 && <ExportReportsButton data={metrics} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-[var(--color-border)] p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-xs uppercase tracking-wider">All Time Sales</span>
          </div>
          <div className="text-2xl font-bold">
            {metrics.reduce((a, b) => a + b.retailSales + b.onlineSales, 0).toLocaleString()} DA
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-xs uppercase tracking-wider">All Time Expenses</span>
          </div>
          <div className="text-2xl font-bold">
            {metrics.reduce((a, b) => a + b.expenses, 0).toLocaleString()} DA
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-xs uppercase tracking-wider">All Time Profit</span>
          </div>
          <div className="text-2xl font-bold text-[var(--color-primary)]">
            {metrics.reduce((a, b) => a + b.netProfit, 0).toLocaleString()} DA
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm text-left">
            <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] text-xs uppercase font-semibold border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Month</th>
                <th className="px-6 py-3 font-medium text-right">Retail Sales</th>
                <th className="px-6 py-3 font-medium text-right">Online Sales</th>
                <th className="px-6 py-3 font-medium text-right">Expenses (Stock)</th>
                <th className="px-6 py-3 font-medium text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
              {metrics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No financial data found to generate reports.
                  </td>
                </tr>
              ) : (
                metrics.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {row.month}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      +{row.retailSales.toLocaleString()} DA
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      +{row.onlineSales.toLocaleString()} DA
                    </td>
                    <td className="px-6 py-4 text-right text-red-500 font-medium">
                      -{row.expenses.toLocaleString()} DA
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${row.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {row.netProfit > 0 ? "+" : ""}{row.netProfit.toLocaleString()} DA
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

