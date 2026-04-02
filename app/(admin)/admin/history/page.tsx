import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Printer } from "lucide-react"
import Link from "next/link"
import { ExportCsvButton } from "@/components/admin/history/export-csv-button"  
import { ReopenShiftButton } from "@/components/admin/history/reopen-shift-button"

export default async function HistoryPage() {
  const supabase = await createClient() as any

  // Fetch daily sessions (shifts)
  const { data: shiftsData } = await supabase
    .from("daily_sessions")
    .select("*, profiles!khadem_id ( full_name )")
    .order("date", { ascending: false })
    .limit(30)

  const shifts = shiftsData as any[] | null

  return (
    <div className="space-y-8">
      {/* Shifts Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Daily History (Shifts)</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Manage Khadem sessions and view their receipts.        
            </p>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-3 font-medium">Session ID</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Khadem</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th> 
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
                {shifts?.map((shift: any) => (
                  <tr key={shift.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">  
                      ...{shift.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">    
                      {format(new Date(shift.date), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      {shift.profiles?.full_name || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      {shift.is_closed ? (
                        <Badge variant="outline" className="text-gray-500 bg-gray-50 border-gray-200">
                          Closed
                        </Badge>
                      ) : (
                        <Badge className="bg-[var(--color-success)] text-white border-transparent">
                          Active (Open)
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {shift.is_closed && (
                         <ReopenShiftButton sessionId={shift.id} isClosed={shift.is_closed} />
                      )}
                      
                      <Link href={`/admin/history/sessions/${shift.id}`}>
                         <Button title="View Session details and Revenue" variant="outline" size="sm" className="hidden md:inline-flex">
                           View Day
                         </Button>
                         <Button title="View Session details and Revenue" variant="outline" size="icon" className="md:hidden">
                           <Eye className="h-4 w-4 text-[var(--color-text-muted)]" />
                         </Button>
                      </Link>
                    </td>
                  </tr>
                ))}

                {(!shifts || shifts.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                      No daily shifts recorded yet.
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
