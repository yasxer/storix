import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Printer } from "lucide-react"
import Link from "next/link"
import { ExportCsvButton } from "@/components/admin/history/export-csv-button"

export default async function HistoryPage() {
  const supabase = await createClient() as any

  // Fetch recent bons (sales receipts)
  const { data: bonsData } = await supabase
    .from("bons")
    .select(`
      *,
      profiles ( full_name ),
      bon_items ( quantity )
    `)
    .order("created_at", { ascending: false })
    .limit(200)

  const bons = bonsData as any[] | null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Sales History</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Browse all retail sales (bons) ordered by latest first.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Excel / CSV Export button */}
          <ExportCsvButton data={bons || []} filename="hanot-sales-history" />
        </div>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm text-left">
            <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Receipt ID</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Khadem</th>
                <th className="px-6 py-3 font-medium">Items Sold</th>
                <th className="px-6 py-3 font-medium">Total (DA)</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
              {bons?.map((bon: any) => {
                const totalItems = bon.bon_items.reduce((sum: number, item: any) => sum + item.quantity, 0)
                
                return (
                  <tr key={bon.id} className={`hover:bg-[#f8f9fa] transition-colors ${bon.is_deleted ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      ...{bon.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      {format(new Date(bon.created_at), "dd MMM yyyy, HH:mm")}
                    </td>
                    <td className="px-6 py-4">
                      {bon.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline">{totalItems}</Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                      {bon.total_price.toLocaleString()} DA
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link href={`/admin/history/${bon.id}`}>
                        <Button title="View Details" variant="outline" size="icon">
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}

              {(!bons || bons.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    No sales history found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

