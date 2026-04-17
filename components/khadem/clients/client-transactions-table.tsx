"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { MoreHorizontal, Pencil, Trash2, TrendingDown, TrendingUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { deleteClientTransaction } from "@/app/(khadem)/khadem/clients/actions"
import { EditTransactionDialog } from "./edit-transaction-dialog"

export function ClientTransactionsTable({ transactions, clientId }: { transactions: any[], clientId: string }) {
  const [editingTx, setEditingTx] = useState<any | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleEdit = (tx: any) => {
    setEditingTx(tx)
    setIsEditOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette transaction ? (Attention : cette action ne rajoutera pas automatiquement le produit dans le stock)")) {
      setDeletingId(id)
      const res = await deleteClientTransaction(id, clientId)
      setDeletingId(null)
      
      if (res.error) {
        alert("Erreur: " + res.error)
      }
    }
  }

  return (
    <>
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
          {transactions.map(tx => (
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
                  <span className="text-gray-700">{tx.description || (tx.type === "purchase" ? "Achat" : "Versement")}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right font-medium text-red-600">
                {tx.type === "purchase" ? Number(tx.amount).toFixed(2) + " DZD" : "-"}
              </td>
              <td className="px-6 py-4 text-right font-medium text-green-600">
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
                  <DropdownMenuContent align="end" className="w-48 bg-white">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(tx)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-700"
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

      {/* Mobile Cards View */}
      <div className="md:hidden flex flex-col gap-3 py-2">
        {transactions.map(tx => (
          <div key={tx.id} className="bg-white rounded-3xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 relative group flex flex-col gap-3">
             <div className="flex justify-between items-start">
               <div>
                  <div className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                    {format(new Date(tx.created_at), "dd MMM, HH:mm", { locale: fr })}
                  </div>
                  <h3 className="font-bold text-gray-900 text-[13px] leading-tight mt-1 line-clamp-2 pr-8">{tx.description || (tx.type === "purchase" ? "Achat" : "Versement")}</h3>
               </div>
               <div className="absolute right-2 top-2">
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="h-8 w-8 p-0">
                       <span className="sr-only">Menu</span>
                       <MoreHorizontal className="h-5 w-5 text-gray-400" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border-gray-100 p-1">
                     <DropdownMenuItem className="cursor-pointer rounded-lg text-sm font-semibold m-1 focus:bg-gray-100" onClick={() => handleEdit(tx)}>
                       <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                       Modifier
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
                     +{Number(tx.amount).toFixed(2)} <span className="text-[10px] opacity-70">DZD</span>
                   </span>
                 </>
               ) : (
                 <>
                   <span className="bg-[var(--wise-mint)]/20 text-[var(--wise-dark-green)] px-2 py-0.5 rounded-md text-[10px] font-bold border border-[var(--wise-mint)] flex items-center gap-1 uppercase tracking-widest">
                     <TrendingDown className="h-3 w-3" /> Versement
                   </span>
                   <span className="font-black text-[var(--wise-dark-green)] text-lg tracking-tight">
                     -{Number(tx.amount).toFixed(2)} <span className="text-[10px] opacity-70">DZD</span>
                   </span>
                 </>
               )}
             </div>
          </div>
        ))}
      </div>

      {editingTx && (
        <EditTransactionDialog
          transaction={editingTx}
          open={isEditOpen}
          setOpen={setIsEditOpen}
        />
      )}
    </>
  )
}



