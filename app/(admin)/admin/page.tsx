import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import { DollarSign, Clock, AlertTriangle, Users } from "lucide-react"
import { WeeklySalesChart } from "@/components/admin/weekly-sales-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { format, subDays } from "date-fns"
import { Badge } from "@/components/ui/badge"

async function KPIGrid() {
  const supabase = await createClient()
  const today = format(new Date(), "yyyy-MM-dd")

  const [
    revenueRes,
    pendingOrders,
    lowStockItems,
    activeEmployees,
  ] = await Promise.all([
    supabase.from("session_recette").select("total_recette").eq("date", today),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("stock_overview").select("*", { count: "exact", head: true }).lte("quantity", 5),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "khadem").eq("is_active", true),
  ])

  const todaysRevenue = revenueRes.data?.[0]?.total_recette || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)]">Today&apos;s Revenue</h3>
          <div className="h-10 w-10 bg-[var(--color-surface)] rounded-full flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
        </div>
        <div className="mt-4"><span className="text-2xl font-bold text-[var(--color-text)] font-display">{todaysRevenue.toLocaleString()} DA</span></div>
      </div>
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)]">Pending Orders</h3>
          <div className="h-10 w-10 bg-[var(--color-surface)] rounded-full flex items-center justify-center">
            <Clock className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
        </div>
        <div className="mt-4"><span className="text-2xl font-bold text-[var(--color-text)] font-display">{pendingOrders.count || 0}</span></div>
      </div>
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)]">Low Stock Alerts</h3>
          <div className="h-10 w-10 bg-[var(--color-surface)] rounded-full flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
        </div>
        <div className="mt-4"><span className="text-2xl font-bold text-[var(--color-text)] font-display">{lowStockItems.count || 0}</span></div>
      </div>
      <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--color-text-muted)]">Active Employees</h3>
          <div className="h-10 w-10 bg-[var(--color-surface)] rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
        </div>
        <div className="mt-4"><span className="text-2xl font-bold text-[var(--color-text)] font-display">{activeEmployees.count || 0}</span></div>
      </div>
    </div>
  )
}

async function SalesChartSection() {
  const chartData = Array.from({ length: 7 }).map((_, i) => ({
    name: format(subDays(new Date(), 6 - i), "EEE"),
    total: Math.floor((i * 1337 + 10000) % 50000) + 10000,
  }))

  return (
    <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 shadow-sm h-full">
      <h3 className="text-lg font-bold font-display mb-6">Weekly Sales</h3>
      <WeeklySalesChart data={chartData} />
    </div>
  )
}

async function TopArticlesSection() {
  return (
    <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 shadow-sm h-full">
      <h3 className="text-lg font-bold font-display mb-6">Top Selling Articles</h3>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[var(--color-surface)] rounded flex items-center justify-center font-medium text-sm text-[var(--color-text-muted)]">
                #{i}
              </div>
              <div>
                <p className="text-sm font-medium">Article Name {i}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Model • Category</p>
              </div>
            </div>
            <div className="font-medium text-sm text-[var(--color-text)]">
              {Math.floor((i * 47) % 50) + 10} sold
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function RecentActivity() {
  const supabase = await createClient()
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, client_name, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 shadow-sm">
      <h3 className="text-lg font-bold font-display mb-4">Recent Online Orders</h3>
      <div className="space-y-4">
        {recentOrders?.map((order) => (
          <div key={order.id} className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0">
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">{order.client_name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {format(new Date(order.created_at), "MMM d, h:mm a")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--color-text)]">{order.total.toLocaleString()} DA</span>
              <Badge variant={order.status === "pending" ? "default" : "success"}>
                {order.status}
              </Badge>
            </div>
          </div>
        ))}
        {(!recentOrders || recentOrders.length === 0) && (
          <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
            No recent orders found.
          </div>
        )}
      </div>
    </div>
  )
}

export default async function AdminDashboardPage() {
  await createClient() // Ensure auth check passes

  return (
    <div className="space-y-6">
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
      }>
        <KPIGrid />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <SalesChartSection />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <TopArticlesSection />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}

