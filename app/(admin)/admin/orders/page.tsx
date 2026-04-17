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

      <div className="bg-white md:border border-gray-100 md:rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">All Orders ({orders?.length || 0})</h2>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-[#f8f9fa] text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Order Details</th>
                <th className="px-6 py-3 font-medium">Client Info</th>
                <th className="px-6 py-3 font-medium">Destination</th>
                <th className="px-6 py-3 font-medium">Date Status</th>
                <th className="px-6 py-3 font-medium text-right font-medium">Pricing</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {orders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 bg-white">
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

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-3 p-3 bg-gray-50/50 rounded-b-xl border-t border-gray-100">
          {(!orders || orders.length === 0) ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
              No orders have been placed yet.
            </div>
          ) : (
            orders.map((order) => (
               <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 relative transition-all group">
                  <div className="flex justify-between items-start">
                     <div>
                       <h3 className="font-bold text-gray-900 text-sm">{order.client_name} {order.client_lastname}</h3>
                       <div className="text-[11px] font-bold text-gray-400 mt-0.5">
                         {order.phone}
                       </div>
                     </div>
                     <div className="flex flex-col items-end">
                       <Badge className={`capitalize text-[10px] px-2 py-0 h-5 border-none font-bold ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`} variant="outline">
                         {order.status}
                       </Badge>
                       <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                         {format(new Date(order.created_at), "dd MMM")}
                       </span>
                     </div>
                  </div>
                  
                  <div className="flex items-end justify-between border-t border-gray-100 pt-3 mt-1">
                     <div className="flex flex-col gap-1.5">
                        <div className="font-bold text-[13px] text-[var(--wise-dark-green)] hover:underline cursor-pointer flex items-center gap-1.5">
                          #{order.id.slice(0, 8)} 
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 inline-block w-max">
                          {order.wilaya} • {order.delivery_type === "domicile" ? "To Door" : "To Desk"}
                        </span>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Total</span>
                        <div className="flex flex-col">
                           <span className="font-black text-[var(--wise-dark-green)] text-sm leading-none">{order.total_price.toLocaleString()} DA</span>
                           <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">+{order.delivery_fee.toLocaleString()} DA Ship</span>
                        </div>
                     </div>
                  </div>
                  <div className="absolute -top-3 right-0 opacity-0 pointer-events-none">
                     {/* Render order action but invisible so server action code generates */}
                     <OrderRowActions order={order} />
                  </div>
               </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

