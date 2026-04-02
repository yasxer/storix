import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { VoucherRowActions } from "@/components/admin/vouchers/voucher-row-actions"

export default async function VouchersPage() {
  const supabase = await createClient() as any

  const { data: vouchers } = await supabase
    .from("purchase_vouchers")
    .select(`
      *,
      profiles ( full_name ),
      purchase_voucher_items (
        quantity,
        purchase_price,
        sale_price,
        articles ( title ),
        article_sizes ( size_label ),
        article_size_colors ( color_name )
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Purchase Vouchers</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Browse history of incoming stock and supplier deliveries.
          </p>
        </div>
        <Link href="/khadem/vouchers/new">
          <Button className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]">
            <Plus className="h-4 w-4" />
            New Voucher (Bon d'Achat)
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Notes / Fournisseur</th>
                <th className="px-6 py-3 font-medium">Items Typed</th>
                <th className="px-6 py-3 font-medium">Total Qty Received</th>
                <th className="px-6 py-3 font-medium text-right">Created By</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
              {vouchers?.map((voucher: any) => {
                const totalQty = voucher.purchase_voucher_items.reduce((sum: number, item: any) => sum + item.quantity, 0)
                const articleCount = new Set(voucher.purchase_voucher_items.map((i: any) => i.articles?.title)).size
                
                return (
                  <tr key={voucher.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      {format(new Date(voucher.created_at), "dd MMM yyyy, HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {voucher.notes || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {articleCount} unique products
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--color-primary)]">
                      +{totalQty} units
                    </td>
                    <td className="px-6 py-4 text-right">
                      {voucher.profiles?.full_name || "Admin"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <VoucherRowActions voucher={voucher} />
                    </td>
                  </tr>
                )
              })}

              {(!vouchers || vouchers.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    No purchase vouchers yet. Click "New Voucher" to add stock.
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

