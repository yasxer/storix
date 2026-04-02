import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { OrderRowActions } from "@/components/admin/orders/order-row-actions"
import { Badge } from "@/components/ui/badge"

export default async function OrdersPage() {
  const supabase = await createClient() as any

  const { data: ordersData, error } = await supabase
    .from("orders")
    .select(`*
    `)
    .order("created_at", { ascending: false })

  const orders = ordersData as any[] | null

  if (error) {
    console.error("Error fetching orders:", error)
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Online Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage e-commerce orders, view statuses, and track fulfillment.</p>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-4">
            <span className="text-sm text-gray-500">All Orders ({orders?.length || 0})</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] whitespace-nowrap text-sm text-left">
            <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] text-xs uppercase font-semibold border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Order Details</th>
                <th className="px-6 py-3 font-medium">Client Info</th>
                <th className="px-6 py-3 font-medium">Destination</th>
                <th className="px-6 py-3 font-medium">Date Status</th>
                <th className="px-6 py-3 font-medium text-right font-medium">Pricing</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
              {orders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No orders have been placed yet.
                  </td>
                </tr>
              ) : (
                orders?.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--color-primary)] hover:underline mb-1 cursor-pointer">#{order.id.slice(0, 8)}</div>
                      <span className="text-xs text-gray-500 font-mono"><span className={"w-2 h-2 inline-block rounded-full bg-blue-500  mr-1"}></span>C.O.D</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.client_name} {order.client_lastname}</div>
                      <div className="text-gray-500 text-xs mt-1">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium capitalize">{order.wilaya}</div>
                      <div className="text-gray-500 text-xs mt-1">{order.delivery_type} delivery</div>
                    </td>
                     <td className="px-6 py-4">
                      <div className="font-medium">{format(new Date(order.created_at), "dd MMM yyyy")}</div>
                      <Badge className={`capitalize mt-1 font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`} variant="outline">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="font-bold">{order.total_price.toLocaleString()} DA</span>
                       <div className="text-xs text-gray-500 mt-1 uppercase">+ {order.delivery_fee.toLocaleString()} DA (Shipping)</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <OrderRowActions order={order} />
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

