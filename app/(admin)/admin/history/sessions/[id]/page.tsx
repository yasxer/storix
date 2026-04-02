import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ReopenShiftButton } from "@/components/admin/history/reopen-shift-button"
import { notFound } from "next/navigation"

export default async function SessionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const sessionId = resolvedParams.id

  const supabase = await createClient() as any

  // Fetch the specific daily session
  const { data: sessionData } = await supabase
    .from("daily_sessions")
    .select(`
      *,
      profiles!khadem_id ( full_name )
    `)
    .eq("id", sessionId)
    .single()

  if (!sessionData) notFound()
  const session = sessionData as any

  // Fetch all bons explicitly for this session
  const { data: bonsData } = await supabase
    .from("bons")
    .select(`
      *,
      profiles!khadem_id ( full_name ),
      bon_items ( quantity )
    `)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })

  const bons = bonsData as any[] | null
  
  // Calculate specific totals for this day's session
  const totalRecette = bons?.filter(b => !b.is_deleted).reduce((sum, bon) => sum + (bon.total_price || 0), 0) || 0
  const totalBons = bons?.filter(b => !b.is_deleted).length || 0

  return (
    <div className="space-y-8">
      {/* Header & Session Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/history">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">
              Shift Details
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1 flex items-center gap-2">
              {format(new Date(session.date), "EEEE, dd MMMM yyyy")}
              <span className="opacity-50">•</span>
              {session.profiles?.full_name || "Unknown Khadem"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {session.is_closed ? (
             <>
               <Badge variant="outline" className="text-gray-500 bg-gray-50 border-gray-200 py-1.5 px-3">
                 Shift Closed
               </Badge>
               <ReopenShiftButton sessionId={session.id} isClosed={session.is_closed} />
             </>
          ) : (
             <Badge className="bg-[var(--color-success)] text-white border-transparent py-1.5 px-3">
               Shift Active
             </Badge>
          )}
        </div>
      </div>

      {/* Recette Card */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Total Revenue (Recette)
            </h3>
            <p className="text-3xl font-bold text-[var(--color-primary)]">
               {totalRecette.toLocaleString()} <span className="text-xl font-normal opacity-80">DA</span>
            </p>
         </div>
         <div className="h-10 w-px bg-gray-200 hidden md:block" />
         <div>
            <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Total Receipts
            </h3>
            <p className="text-2xl font-semibold text-gray-800">
               {totalBons} <span className="text-base font-normal text-gray-500">bons</span>
            </p>
         </div>
      </div>

      {/* Bons Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold font-display text-[var(--color-text)]">Receipts for this Shift</h2>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm text-left">
              <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-3 font-medium">Receipt ID</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium">Items Sold</th>
                  <th className="px-6 py-3 font-medium">Total (DA)</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th> 
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
                {bons?.map((bon: any) => {
                  const itemsCount = bon.bon_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0

                  return (
                    <tr key={bon.id} className={`hover:bg-[#f8f9fa] transition-colors ${bon.is_deleted ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        ...{bon.id.slice(-8)}
                        {bon.is_deleted && <span className="ml-2 text-red-500 font-semibold">(Deleted)</span>}
                      </td>
                      <td className="px-6 py-4 font-medium whitespace-nowrap">  
                        {format(new Date(bon.created_at), "HH:mm")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline">{itemsCount}</Badge>
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
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                      No sales recorded in this shift yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
