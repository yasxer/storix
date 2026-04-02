import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Phone, Package, Tag, Calculator } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id
  
  const supabase = await createClient() as any

  const { data: orderData } = await supabase
    .from("orders")
    .select(`
      *,
      promotions ( code, value, type ),
      order_items (
        quantity,
        unit_price,
        articles ( title ),
        article_sizes ( size_label ),
        article_size_colors ( color_name )
      )
    `)
    .eq("id", id)
    .single()

  if (!orderData) notFound()
  const order = orderData as any

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const subtotal = order.order_items.reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Order #{order.id.slice(0, 8)}</h1>
              <Badge className={`capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                {order.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 font-mono mt-1">
              Placed on {format(new Date(order.created_at), "dd MMM yyyy, HH:mm")}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{order.total_price.toLocaleString()} DA</div>
          <div className="text-sm text-gray-500 font-medium">Includes delivery fee: {order.delivery_fee.toLocaleString()} DA</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-4 flex items-center"><MapPin className="w-4 h-4 mr-2" /> Shipping Details</h3>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-gray-500">Customer:</span>
              <span className="font-medium text-[var(--color-text)]">{order.client_name} {order.client_lastname}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-gray-500">Phone:</span>
              <span className="font-medium text-[var(--color-text)] flex items-center gap-2">
                  <Phone className="w-3 h-3 text-gray-400" /> {order.phone}
              </span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-gray-500">Address:</span>
              <span className="font-medium text-[var(--color-text)]">{order.address}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-gray-500">Wilaya:</span>
              <span className="font-medium text-[var(--color-text)] capitalize">{order.wilaya}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-gray-500">Method:</span>
              <span className="font-medium text-[var(--color-text)] capitalize">{order.delivery_type.replace('_', ' ')}</span>
            </div>
            {order.notes && (
              <div className="grid grid-cols-[100px_1fr] gap-2 mt-4 pt-4 border-t">
                <span className="text-gray-500">Notes:</span>
                <span className="text-[var(--color-text)] bg-yellow-50 p-2 rounded text-xs select-text">{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 shadow-sm">
           <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-4 flex items-center"><Calculator className="w-4 h-4 mr-2" /> Order Summary</h3>
           <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal:</span>
              <span className="font-medium">{subtotal.toLocaleString()} DA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping ({order.wilaya}):</span>
              <span className="font-medium">+{order.delivery_fee.toLocaleString()} DA</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between">
                 <span className="text-gray-500 flex items-center"><Tag className="w-3 h-3 mr-1" /> Discount ({order.promotions?.code || "Coupon"}):</span>
                 <span className="font-medium text-orange-600">- {order.discount_amount.toLocaleString()} DA</span>
              </div>
            )}
            <div className="flex justify-between mt-4 pt-4 border-t">
              <span className="text-gray-500 font-semibold text-lg">Total Paid:</span>
              <span className="font-bold text-xl text-[var(--color-primary)]">{order.total_price.toLocaleString()} DA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
          <Package className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-bold text-lg">Ordered Items ({order.order_items.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] text-xs uppercase font-semibold border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Size</th>
                <th className="px-6 py-3 font-medium">Color</th>
                <th className="px-6 py-3 font-medium text-center">Qty</th>
                <th className="px-6 py-3 font-medium text-right">Unit Price</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
              {order.order_items.map((item: any, idx: number) => {
                const total = item.unit_price * item.quantity;
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
