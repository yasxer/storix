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
        <Link href="/admin/vouchers/new">
          <Button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--wise-dark-green)] hover:opacity-90 text-[var(--wise-mint)] rounded-xl py-6 sm:py-2">
            <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
            New Voucher (Bon d'Achat)
          </Button>
        </Link>
      </div>

      <div className="bg-white md:border border-[var(--color-border)] md:rounded-xl shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-3 p-3 bg-gray-50/50 rounded-b-xl border-t border-gray-100">
          {(!vouchers || vouchers.length === 0) ? (
            <div className="p-8 text-center text-[var(--color-text-muted)] bg-white rounded-2xl border border-[var(--color-border)]">
              No purchase vouchers yet. Click "New Voucher" to add stock.
            </div>
          ) : (
            vouchers.map((voucher: any) => {
              const totalQty = voucher.purchase_voucher_items.reduce((sum: number, item: any) => sum + item.quantity, 0)
              const articleCount = new Set(voucher.purchase_voucher_items.map((i: any) => i.articles?.title)).size
              
              return (
                <div key={voucher.id} className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-border)] flex flex-col gap-3">
                   <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900 text-[13px] leading-tight flex items-center gap-2">
                          <span className="truncate">{voucher.notes || "Unnamed Receipt"}</span>
                        </div>
                        <div className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                          {format(new Date(voucher.created_at), "dd MMM yyyy, HH:mm")}
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-[var(--color-border)] px-2 py-0.5 rounded-md flex items-center gap-1.5 shrink-0">
                         <span className="text-[10px] uppercase font-bold text-gray-500">By</span>
                         <span className="text-[10px] font-black">{voucher.profiles?.full_name || "Admin"}</span>
                      </div>
                   </div>

                   <div className="flex gap-2">
                      <div className="flex-1 bg-gray-50 rounded-xl p-2.5 border border-[var(--color-border)] flex flex-col justify-center">
                         <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Products</span>
                         <span className="font-black text-gray-900 text-xs">{articleCount} unique</span>
                      </div>
                      <div className="flex-1 bg-[var(--wise-mint)]/20 rounded-xl p-2.5 border border-[var(--wise-mint)] flex flex-col justify-center text-right border-opacity-50">
                         <span className="text-[9px] font-bold text-[var(--wise-dark-green)] uppercase tracking-widest mb-0.5 opacity-60">Qty Added</span>
                         <span className="font-black text-[var(--wise-dark-green)] text-xs">+{totalQty} units</span>
                      </div>
                   </div>

                   <div className="flex items-center justify-between mt-1 pt-3 border-t border-[var(--color-border)]">
                      <span className="font-mono text-[10px] font-black text-gray-300">
                        REF: {voucher.id.slice(0, 8)}
                      </span>
                      <VoucherRowActions voucher={voucher} />
                   </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

