"use client"

import { useState, useMemo } from "react"
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { MoreHorizontal, Pencil, Trash2, TrendingDown, TrendingUp, PackageSearch, CalendarDays, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Printer } from "lucide-react"
import { deleteClientTransaction } from "@/app/(admin)/admin/clients/actions"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import { ModifyPurchaseDialog } from "./modify-purchase-dialog"

export function ClientTransactionsTable({ transactions, clientId }: { transactions: any[], clientId: string }) {
  const [editingTx, setEditingTx]     = useState<any | null>(null)
  const [isEditOpen, setIsEditOpen]   = useState(false)
  const [deletingId, setDeletingId]   = useState<string | null>(null)
  const [modifyingTx, setModifyingTx] = useState<any | null>(null)
  const [isModifyOpen, setIsModifyOpen] = useState(false)

  const [filterDate, setFilterDate] = useState("")

  const handleEdit = (tx: any) => { setEditingTx(tx); setIsEditOpen(true) }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette transaction ? (Attention : cette action ne rajoutera pas automatiquement le produit dans le stock)")) {
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
      <div className="flex flex-wrap items-center gap-2 p-4 border-b bg-gray-50">
        <CalendarDays className="h-4 w-4 text-gray-400 shrink-0" />
        <span className="text-sm font-semibold text-gray-600">Date :</span>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="h-8 text-sm w-40 bg-white"
          />
        </div>
        {hasFilter && (
          <>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 ml-2"
              onClick={() => setFilterDate("")}>
              <X className="h-3.5 w-3.5 mr-1" /> Effacer
            </Button>
            <span className="text-sm font-medium text-gray-500 ml-auto bg-white px-3 py-1 rounded-full border">{filtered.length} résultat(s)</span>
          </>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border-b font-medium">
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
                <td colSpan={5} className="px-6 py-12 text-center">
                  <CalendarDays className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucune transaction trouvée pour cette période.</p>
                </td>
              </tr>
            ) : filtered.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors group">
                <td className="px-6 py-4 text-gray-500">
                  {format(new Date(tx.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {tx.type === "purchase" ? (
                      <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-md text-xs font-bold border border-red-100 flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" /> Achat
                      </span>
                    ) : (
                      <span className="bg-green-50 text-green-600 px-2.5 py-0.5 rounded-md text-xs font-bold border border-green-100 flex items-center gap-1">
                        <TrendingDown className="h-3.5 w-3.5" /> Versement
                      </span>
                    )}
                    <span className="text-gray-700 font-medium truncate max-w-[280px]">
                      {tx.description || (tx.type === "purchase" ? "Achat" : "Versement")}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-red-600">
                  {tx.type === "purchase" ? Number(tx.amount).toFixed(2) + " DZD" : "-"}
                </td>
                <td className="px-6 py-4 text-right font-bold text-green-600">
                  {tx.type === "payment" ? Number(tx.amount).toFixed(2) + " DZD" : "-"}
                </td>
                <td className="px-6 py-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="sr-only">Menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white rounded-xl shadow-lg border-gray-100 p-1">
                      {tx.type === "purchase" && (
                        <>
                          <DropdownMenuItem
                            className="cursor-pointer rounded-lg text-sm font-semibold m-0.5 text-blue-600 focus:bg-blue-50 focus:text-blue-700"
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
                      <DropdownMenuItem className="cursor-pointer rounded-lg text-sm font-semibold m-0.5 focus:bg-gray-50" onClick={() => handleEdit(tx)}>
                        <Pencil className="mr-2 h-4 w-4 text-gray-500" />
                        Modifier Montant
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer rounded-lg text-sm font-semibold m-0.5 text-red-600 focus:bg-red-50 focus:text-red-700"
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
          <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <CalendarDays className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aucune opération</p>
          </div>
        ) : filtered.map(tx => (
          <div key={tx.id} className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 relative flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {format(new Date(tx.created_at), "dd MMM, HH:mm", { locale: fr })}
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight pr-8">
                  {tx.description || (tx.type === "purchase" ? "Achat" : "Versement")}
                </h3>
              </div>
              <div className="absolute right-3 top-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-gray-50">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-white rounded-xl shadow-xl border-gray-100 p-1">
                    {tx.type === "purchase" && (
                      <>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg text-sm font-bold m-1 text-blue-600 focus:bg-blue-50"
                          onClick={() => { setModifyingTx(tx); setIsModifyOpen(true) }}
                        >
                          <PackageSearch className="mr-2 h-4 w-4" /> Modifier Bon
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg text-sm font-bold m-1 text-[var(--wise-dark-green)] focus:bg-[var(--wise-mint)]"
                          onClick={() => window.open(`/print/client_purchase/${tx.id}`, '_blank')}
                        >
                          <Printer className="mr-2 h-4 w-4" /> Imprimer
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem className="cursor-pointer rounded-lg text-sm font-bold m-1 focus:bg-gray-100" onClick={() => handleEdit(tx)}>
                      <Pencil className="mr-2 h-4 w-4 text-gray-500" /> Modifier Montant
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-lg text-sm font-bold m-1 text-red-600 focus:bg-red-50"
                      onClick={() => handleDelete(tx.id)}
                      disabled={deletingId === tx.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
              {tx.type === "purchase" ? (
                <>
                  <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3" /> ACHAT
                  </span>
                  <span className="font-black text-red-600 text-xl tracking-tight">
                    {Number(tx.amount).toFixed(0)} <span className="text-[10px] opacity-30">DA</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="bg-[var(--wise-mint)] text-[var(--wise-dark-green)] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent flex items-center gap-1.5">
                    <TrendingDown className="h-3 w-3" /> PAYÉ
                  </span>
                  <span className="font-black text-[var(--wise-dark-green)] text-xl tracking-tight">
                    {Number(tx.amount).toFixed(0)} <span className="text-[10px] opacity-30">DA</span>
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