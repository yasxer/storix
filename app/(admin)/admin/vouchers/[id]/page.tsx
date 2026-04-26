import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, Edit2 } from "lucide-react"
import Link from "next/link"

export default async function ViewVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id
  
  const supabase = await createClient() as any

  const { data: voucher } = await supabase
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
        article_size_colors ( color_name, color_hex )
      )
    `)
    .eq("id", id)
    .single()

  if (!voucher) notFound()

  const totalSpent = voucher.purchase_voucher_items.reduce((sum: number, item: any) => sum + (item.purchase_price * item.quantity), 0)
  const totalQty = voucher.purchase_voucher_items.reduce((sum: number, item: any) => sum + item.quantity, 0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/vouchers">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Voucher Details</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Recorded on {format(new Date(voucher.created_at), "PPP 'at' p")}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/print/voucher/${voucher.id}`} target="_blank">
            <Button variant="outline" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Imprimer le Bon
            </Button>
          </Link>
          <Link href={`/admin/vouchers/${voucher.id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-[var(--color-primary)]" />
              Modifier
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-4">Voucher Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Fournisseur / Notes:</span>
              <span className="font-medium">{voucher.notes || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Created By:</span>
              <span className="font-medium">{voucher.profiles?.full_name || "Admin"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span className="font-medium">{format(new Date(voucher.created_at), "dd MMM yyyy, HH:mm")}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-4">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Items (Rows):</span>
              <span className="font-medium">{voucher.purchase_voucher_items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Quantity Received:</span>
              <span className="font-bold text-[var(--color-primary)]">+{totalQty} units</span>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t">
              <span className="text-gray-500 font-semibold">Total Cost:</span>
              <span className="font-bold text-lg">{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-bold text-lg">Purchased Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] text-xs uppercase font-semibold border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Size</th>
                <th className="px-6 py-3 font-medium">Color</th>
                <th className="px-6 py-3 font-medium text-center">Qty</th>
                <th className="px-6 py-3 font-medium text-right">Purchase Price</th>
                <th className="px-6 py-3 font-medium text-right">Sale Price Set</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
              {voucher.purchase_voucher_items.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-6 py-4 font-medium">
                    {item.articles?.title || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {item.article_sizes?.size_label || '-'}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border shadow-sm" 
                      style={{ backgroundColor: item.article_size_colors?.color_hex || '#ccc' }} 
                      title={item.article_size_colors?.color_name}
                    ></div>
                    <span>{item.article_size_colors?.color_name || '-'}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right text-red-600">
                    {item.purchase_price.toLocaleString()} DA
                  </td>
                  <td className="px-6 py-4 text-right text-green-600">
                    {item.sale_price.toLocaleString()} DA
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">
                    {(item.purchase_price * item.quantity).toLocaleString()} DA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
