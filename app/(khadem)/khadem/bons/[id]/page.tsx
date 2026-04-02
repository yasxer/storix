import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"
import { PrintButton } from "@/components/shared/print-button"

export default async function ViewBonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id
  
  const supabase = await createClient() as any

  // Fetch the Bon detailed information
  const { data: bonData } = await supabase
    .from("bons")
    .select(`
      *,
      profiles ( full_name ),
      bon_items (
        quantity,
        unit_price,
        discount_amount,
        articles ( title ),
        article_sizes ( size_label ),
        article_size_colors ( color_name )
      )
    `)
    .eq("id", id)
    .single()

  if (!bonData) notFound()
  const bon = bonData as any

  const totalItems = bon.bon_items.reduce((sum: number, item: any) => sum + item.quantity, 0)
  const subtotal = bon.bon_items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0)
  const totalDiscount = bon.bon_items.reduce((sum: number, item: any) => sum + item.discount_amount, 0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/khadem">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Receipt (Bon)</h1>
            <p className="text-sm text-gray-500 font-mono mt-1">
              ID: {bon.id}
            </p>
          </div>
        </div>
        
        <div>
           <PrintButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-4">Receipt Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sold By:</span>
              <span className="font-medium">{bon.profiles?.full_name || "Unknown"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span className="font-medium">{format(new Date(bon.created_at), "dd MMM yyyy, HH:mm")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Items:</span>
              <span className="font-medium">{totalItems} units</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-4">Pricing</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal:</span>
              <span className="font-medium">{subtotal.toLocaleString()} DA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Discount:</span>
              <span className="font-medium text-orange-600">- {totalDiscount.toLocaleString()} DA</span>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t">
              <span className="text-gray-500 font-semibold text-lg">Final Total:</span>
              <span className="font-bold text-xl text-green-600">{bon.total_price.toLocaleString()} DA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-bold text-lg">Sold Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] text-xs uppercase font-semibold border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Size</th>
                <th className="px-6 py-3 font-medium">Color</th>
                <th className="px-6 py-3 font-medium text-center">Qty</th>
                <th className="px-6 py-3 font-medium text-right">Unit Price</th>
                <th className="px-6 py-3 font-medium text-right">Discount</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
              {bon.bon_items.map((item: any, idx: number) => {
                const total = (item.unit_price * item.quantity) - item.discount_amount;
                return (
                  <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {item.articles?.title || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.article_sizes?.size_label || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.article_size_colors?.color_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.unit_price.toLocaleString()} DA
                    </td>
                    <td className="px-6 py-4 text-right text-orange-600">
                      {item.discount_amount > 0 ? `-${item.discount_amount.toLocaleString()} DA` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                      {total.toLocaleString()} DA
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
