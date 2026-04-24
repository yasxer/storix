"use client"

import { useState, useMemo } from "react"
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { MoreHorizontal, Pencil, Trash2, TrendingDown, TrendingUp, PackageSearch, CalendarDays, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Printer } from "lucide-react"
import { deleteClientTransaction } from "@/app/(khadem)/khadem/clients/actions"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import { ModifyPurchaseDialog } from "./modify-purchase-dialog"

export function ClientTransactionsTable({ transactions, clientId }: { transactions: any[], clientId: string }) {
  const [editingTx, setEditingTx] = useState<any | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [modifyingTx, setModifyingTx] = useState<any | null>(null)
  const [isModifyOpen, setIsModifyOpen] = useState(false)

  const [filterDate, setFilterDate] = useState("")

  const handleEdit = (tx: any) => { setEditingTx(tx); setIsEditOpen(true) }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette transaction ? (Le stock ne sera pas restauré automatiquement)")) {
      setDeletingId(id)
      const res = await deleteClientTransaction(id, clientId)
      setDeletingId(null)
      if (res.error) alert("Erreur: " + res.error)
    }
  }

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (!filterDate) return true
      const date = new Date(tx.created_at)
      const selected = parseISO(filterDate)
      return date >= startOfDay(selected) && date <= endOfDay(selected)
    })
  }, [transactions, filterDate])

  const hasFilter = !!filterDate

  return (
    <>
      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
        <CalendarDays className="h-4 w-4 text-gray-400 shrink-0" />
        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Date :</span>
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="h-8 text-xs rounded-xl w-40 bg-white"
            />
          </div>
          {hasFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-red-500 hover:bg-red-50 rounded-xl"
              onClick={() => setFilterDate("")}
            >
              <X className="h-3 w-3 mr-1" /> Effacer
            </Button>
          )}
        </div>
        {hasFilter && (
          <span className="text-xs font-black text-gray-500 ml-auto">
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-400 border-b font-medium">
            <tr>
              <th className="px-6 py-4">Date et Heure</th>
              <th className="px-6 py-4">Type / Description</th>
              <th className="px-6 py-4 text-right">Achat (Dette)</th>
              <th className="px-6 py-4 text-right">Versement</th>
              <th className="px-6 py-4 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                  Aucune transaction pour cette période.
                </td>
              </tr>
            ) : filtered.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 text-gray-500">
                  {format(new Date(tx.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {tx.type === "purchase" ? (
                      <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-bold border border-red-100 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Achat
                      </span>
                    ) : (
                      <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs font-bold border border-green-100 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" /> Versement
                      </span>
                    )}
                    <span className="text-gray-700 truncate max-w-[240px]">{tx.description || (tx.type === "purchase" ? "Achat" : "Versement")}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium text-red-600">
                  {tx.type === "purchase" ? Number(tx.amount).toFixed(2) + " DA" : "-"}
                </td>
                <td className="px-6 py-4 text-right font-medium text-green-600">
                  {tx.type === "payment" ? Number(tx.amount).toFixed(2) + " DA" : "-"}
                </td>
                <td className="px-6 py-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 opacity-80 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-white/95 backdrop-blur rounded-xl shadow-lg border-gray-100 p-1">
                      {tx.type === "purchase" && (
                        <>
                          <DropdownMenuItem
                            className="cursor-pointer rounded-lg text-sm font-semibold m-0.5 text-blue-600 focus:bg-blue-50"
                            onClick={() => { setModifyingTx(tx); setIsModifyOpen(true) }}
                          >
                            <PackageSearch className="mr-2 h-4 w-4" />
                            Modifier Bon
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer rounded-lg text-sm font-semibold m-0.5 text-[var(--wise-dark-green)] focus:bg-[var(--wise-mint)]"
                            onClick={() => window.open(`/print/client_purchase/${tx.id}`, '_blank')}
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimer Facture
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem className="cursor-pointer rounded-lg text-sm font-semibold m-0.5 focus:bg-gray-100" onClick={() => handleEdit(tx)}>
                        <Pencil className="mr-2 h-4 w-4 text-gray-500" />
                        Modifier Montant
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer rounded-lg text-sm font-semibold m-0.5 text-red-600 focus:bg-red-50"
                        onClick={() => handleDelete(tx.id)}
                        disabled={deletingId === tx.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3 py-2">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">Aucune transaction pour cette période.</div>
        ) : filtered.map(tx => (
          <div key={tx.id} className="bg-white rounded-3xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 relative group flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                  {format(new Date(tx.created_at), "dd MMM, HH:mm", { locale: fr })}
                </div>
                <h3 className="font-bold text-gray-900 text-[13px] leading-tight mt-1 line-clamp-2 pr-8">
                  {tx.description || (tx.type === "purchase" ? "Achat" : "Versement")}
                </h3>
              </div>
              <div className="absolute right-2 top-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-5 w-5 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border-gray-100 p-1">
                    {tx.type === "purchase" && (
                      <>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg text-sm font-semibold m-1 text-blue-600 focus:bg-blue-50"
                          onClick={() => { setModifyingTx(tx); setIsModifyOpen(true) }}
                        >
                          <PackageSearch className="mr-2 h-4 w-4" />
                          Modifier Bon
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg text-sm font-semibold m-1 text-[var(--wise-dark-green)] focus:bg-[var(--wise-mint)]"
                          onClick={() => window.open(`/print/client_purchase/${tx.id}`, '_blank')}
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimer Facture
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem className="cursor-pointer rounded-lg text-sm font-semibold m-1 focus:bg-gray-100" onClick={() => handleEdit(tx)}>
                      <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                      Modifier Montant
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-lg text-sm font-semibold m-1 text-red-600 focus:bg-red-50 focus:text-red-700"
                      onClick={() => handleDelete(tx.id)}
                      disabled={deletingId === tx.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
              {tx.type === "purchase" ? (
                <>
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-bold border border-red-100 flex items-center gap-1 uppercase tracking-widest">
                    <TrendingUp className="h-3 w-3" /> Achat
                  </span>
                  <span className="font-black text-red-600 text-lg tracking-tight">
                    +{Number(tx.amount).toFixed(2)} <span className="text-[10px] opacity-70">DA</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="bg-[var(--wise-mint)]/20 text-[var(--wise-dark-green)] px-2 py-0.5 rounded-md text-[10px] font-bold border border-[var(--wise-mint)] flex items-center gap-1 uppercase tracking-widest">
                    <TrendingDown className="h-3 w-3" /> Versement
                  </span>
                  <span className="font-black text-[var(--wise-dark-green)] text-lg tracking-tight">
                    -{Number(tx.amount).toFixed(2)} <span className="text-[10px] opacity-70">DA</span>
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingTx && (
        <EditTransactionDialog transaction={editingTx} open={isEditOpen} setOpen={setIsEditOpen} />
      )}
      {modifyingTx && (
        <ModifyPurchaseDialog transaction={modifyingTx} clientId={clientId} open={isModifyOpen} setOpen={setIsModifyOpen} />
      )}
    </>
  )
}
