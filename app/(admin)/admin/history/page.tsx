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

        <div className="bg-white md:border border-gray-100 md:rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8f9fa] text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Session ID</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Khadem</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th> 
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
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
                        <Badge className="bg-[var(--wise-mint)] text-[var(--wise-dark-green)] border-none">
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

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3 p-3 bg-gray-50/50 rounded-b-xl border-t border-gray-100">
             {(!shifts || shifts.length === 0) ? (
                <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
                   No daily shifts recorded yet.
                </div>
             ) : (
                shifts.map((shift: any) => (
                   <div key={shift.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="text-[13px] font-bold text-[var(--wise-dark-green)] block mb-0.5 uppercase tracking-wider">Shift Date</div>
                            <h3 className="font-black text-gray-900 text-lg leading-tight">{format(new Date(shift.date), "dd MMM")}</h3>
                         </div>
                         <div className="flex flex-col items-end gap-1.5">
                            {shift.is_closed ? (
                              <Badge variant="outline" className="text-[10px] px-2 h-5 text-gray-500 bg-gray-50 border-gray-200 font-bold tracking-widest uppercase">
                                Closed
                              </Badge>
                            ) : (
                              <Badge className="bg-[var(--wise-mint)] text-[var(--wise-dark-green)] text-[10px] px-2 h-5 border-none font-bold tracking-widest uppercase">
                                Active (Open)
                              </Badge>
                            )}
                            <span className="font-mono text-[10px] font-bold text-gray-400">
                              #{shift.id.slice(0, 8)}
                            </span>
                         </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-100">
                         <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Khadem</span>
                         <span className="font-bold text-sm text-gray-900">{shift.profiles?.full_name || "Unknown"}</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                         <div>
                            {shift.is_closed && (
                               <ReopenShiftButton sessionId={shift.id} isClosed={shift.is_closed} />
                            )}
                         </div>
                         <Link href={`/admin/history/sessions/${shift.id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold text-[var(--wise-dark-green)] border-gray-200 hover:border-[var(--wise-mint)] hover:bg-[var(--wise-mint)]/10 transition-colors">
                               View Day <Eye className="w-3.5 h-3.5 ml-1" />
                            </Button>
                         </Link>
                      </div>
                   </div>
                ))
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
