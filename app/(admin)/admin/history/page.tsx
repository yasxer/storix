import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ChevronDown } from "lucide-react"
import Link from "next/link"
import { ReopenShiftButton } from "@/components/admin/history/reopen-shift-button"

export default async function HistoryPage() {
  const supabase = await createClient() as any

  // Fetch daily sessions (shifts) along with bons to calculate revenue
  const { data: shiftsData } = await supabase
    .from("daily_sessions")
    .select("*, profiles!khadem_id ( full_name ), bons ( total_price, is_deleted )")
    .order("date", { ascending: false })
    .limit(100)

  const shiftsWithRevenue = (shiftsData || []).map((shift: any) => {
    const revenue = shift.bons
      ?.filter((b: any) => !b.is_deleted)
      .reduce((sum: number, b: any) => sum + Number(b.total_price), 0) || 0;
    return { ...shift, revenue };
  });

  // Group by date
  const groupedShifts = shiftsWithRevenue.reduce((acc: any, shift: any) => {
    const d = shift.date;
    if (!acc[d]) acc[d] = { date: d, shifts: [], totalRevenue: 0 };
    acc[d].shifts.push(shift);
    acc[d].totalRevenue += shift.revenue;
    return acc;
  }, {});

  const days = Object.values(groupedShifts).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Historique Journalier</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Cliquez sur un jour pour voir les sessions de chaque khadem et leurs recettes.        
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {days.map((dayGroup: any) => (
            <details key={dayGroup.date} className="group bg-white rounded-[32px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
              <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer select-none outline-none hover:bg-gray-50/50 transition-colors marker:content-none [&::-webkit-details-marker]:hidden">
                <div className="flex flex-col">
                  <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Journée
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight capitalize">
                    {format(new Date(dayGroup.date), "EEEE, dd MMMM yyyy", { locale: fr })}
                  </h2>
                </div>
                
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black text-[var(--wise-dark-green)] opacity-50 uppercase tracking-widest mb-1">Recette Totale</span>
                    <span className="text-xl font-black text-[var(--wise-dark-green)] leading-none">
                      {dayGroup.totalRevenue.toLocaleString()} <span className="text-xs opacity-50">DA</span>
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-open:rotate-180 transition-transform duration-300 shrink-0">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </summary>
              
              <div className="p-5 sm:p-6 pt-0 border-t border-gray-50 mt-2">
                {/* Mobile Total Revenue */}
                <div className="sm:hidden mb-6 mt-4 p-4 rounded-2xl bg-[var(--wise-mint)]/10 border border-[var(--wise-mint)]/20 flex justify-between items-center">
                   <span className="text-xs font-black text-[var(--wise-dark-green)] uppercase tracking-widest">Recette Totale</span>
                   <span className="text-lg font-black text-[var(--wise-dark-green)]">{dayGroup.totalRevenue.toLocaleString()} DA</span>
                </div>

                <div className="mt-2 space-y-3">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 mb-2">Sessions de la journée</h3>
                  {dayGroup.shifts.map((shift: any) => (
                    <div key={shift.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50/80 border border-gray-100 gap-4 hover:border-blue-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-base sm:text-lg shrink-0">
                          {shift.profiles?.full_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm sm:text-base">{shift.profiles?.full_name || "Unknown"}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {shift.is_closed ? (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-gray-500 bg-gray-100 border-gray-200 font-black tracking-widest uppercase">
                                Fermée
                              </Badge>
                            ) : (
                              <Badge className="bg-[var(--wise-mint)] text-[var(--wise-dark-green)] text-[9px] px-1.5 py-0 h-4 border-none font-black tracking-widest uppercase">
                                Ouverte
                              </Badge>
                            )}
                            <span className="font-mono text-[9px] font-bold text-gray-400">
                              #{shift.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 border-gray-200 pt-3 sm:pt-0">
                        <div className="flex flex-col items-start sm:items-end">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Recette Khadem</span>
                          <span className="text-base sm:text-lg font-black text-gray-900 leading-none">
                            {shift.revenue.toLocaleString()} <span className="text-[10px] opacity-50">DA</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {shift.is_closed && (
                            <ReopenShiftButton sessionId={shift.id} isClosed={shift.is_closed} />
                          )}
                          <Link href={`/admin/history/sessions/${shift.id}`}>
                            <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs font-bold text-blue-600 border-blue-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                              Détails <Eye className="w-3.5 h-3.5 ml-1.5 hidden sm:inline" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}

          {days.length === 0 && (
            <div className="p-12 text-center text-gray-400 bg-white rounded-[32px] border border-gray-100 font-medium">
              Aucun historique disponible.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
