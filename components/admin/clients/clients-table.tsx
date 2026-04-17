"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Trash2, Eye, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

import { deleteClient } from "@/app/(admin)/admin/clients/actions"

export function ClientsTable({ clients }: { clients: any[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, solde: number) => {
    if (solde > 0) {
      alert("Impossible de supprimer ce client car il doit encore de l'argent (" + solde.toFixed(2) + " DZD)")
      return;
    }
    
    if (solde < 0) {
      alert("Impossible de supprimer ce client car il a un solde créditeur (" + solde.toFixed(2) + " DZD)")
      return;
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.")) {
      setDeletingId(id)
      const res = await deleteClient(id)
      
      setDeletingId(null)
      if (res.error) alert("Erreur: " + res.error)
      else router.refresh()
    }
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Users className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold font-display text-gray-900 mb-2">Aucun client trouvé</h3>
        <p className="text-gray-500 max-w-sm">
          Vous n'avez pas encore de clients enregistrés. Ajoutez votre premier client pour commencer.
        </p>
      </div>
    )
  }

  return (
    <>
    <div className="hidden md:block overflow-x-auto w-full">
      <table className="w-full text-sm text-left">
        <thead className="bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border-b font-medium">
          <tr>
            <th className="px-6 py-4 font-semibold">Nom du Client</th>       
            <th className="px-6 py-4 font-semibold w-56 hidden md:table-cell">Téléphone</th>
            <th className="px-6 py-4 font-semibold text-right">Total Acheté</th>
            <th className="px-6 py-4 font-semibold text-right">Total Versé</th>       
            <th className="px-6 py-4 font-semibold text-right text-red-600">Dette (Crédit)</th>
            <th className="px-6 py-4 font-semibold text-center w-24">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {clients.map((client) => (
             <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4 font-medium text-gray-900">
                <span>{client.name}</span>
              </td>
              <td className="px-6 py-4 hidden md:table-cell text-gray-500">     
                {client.phone || "—"}
              </td>
              <td className="px-6 py-4 text-right text-gray-500">
                {client.total_bought.toFixed(2)} DZD
              </td>
              <td className="px-6 py-4 text-right text-green-600 font-medium">  
                {client.total_paid.toFixed(2)} DZD
              </td>
              <td className="px-6 py-4 text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${   
                  client.solde > 0
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-green-50 text-green-600 border border-green-100'        
                }`}>
                  {client.solde.toFixed(2)} DZD
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="sr-only">Menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/admin/clients/${client.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir Détails
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-700"
                      onClick={() => handleDelete(client.id, client.solde)}
                      disabled={deletingId === client.id}
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
    <div className="md:hidden flex flex-col gap-3 bg-gray-50/50 p-3 rounded-b-xl border-t border-gray-100">
      {clients.map((client) => (
        <div key={client.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 relative transition-all group">
           <div className="flex justify-between items-start pr-8">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{client.name}</h3>
                <div className="text-[11px] font-bold text-gray-400 mt-0.5">
                  {client.phone || "No Phone"}
                </div>
              </div>
              <div className="absolute right-2 top-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Menu</span>
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border-[var(--color-border)] p-1">
                    <DropdownMenuItem className="cursor-pointer rounded-lg text-sm font-semibold m-1 focus:bg-[var(--wise-mint)] focus:text-[var(--wise-dark-green)]" onClick={() => router.push(`/admin/clients/${client.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir Détails
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer rounded-lg text-sm font-semibold m-1 text-red-600 focus:bg-red-50 focus:text-red-700"
                      onClick={() => handleDelete(client.id, client.solde)}
                      disabled={deletingId === client.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex flex-col">
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Acheté</span>
                 <span className="font-bold text-gray-700 text-xs">{client.total_bought.toFixed(2)} DZD</span>
              </div>
              <div className="bg-[var(--wise-mint)]/10 rounded-xl p-2.5 border border-[var(--wise-mint)]/20 flex flex-col">
                 <span className="text-[9px] font-bold text-[var(--wise-dark-green)] uppercase tracking-widest mb-0.5 opacity-60">Versé</span>
                 <span className="font-black text-[var(--wise-dark-green)] text-xs">{client.total_paid.toFixed(2)} DZD</span>
              </div>
           </div>

           <div className={`mt-1 flex items-center justify-between p-3 rounded-xl border ${
             client.solde > 0 ? "bg-red-50 border-red-100" : "bg-[var(--wise-mint)]/20 border-[var(--wise-mint)]/30"
           }`}>
             <span className={`text-[10px] uppercase font-bold tracking-widest ${
               client.solde > 0 ? "text-red-500" : "text-[var(--wise-dark-green)]"
             }`}>
               {client.solde > 0 ? "Dette" : "Crédit"}
             </span>
             <span className={`font-black text-sm ${
               client.solde > 0 ? "text-red-600" : "text-[var(--wise-dark-green)]"
             }`}>
               {client.solde.toFixed(2)} DZD
             </span>
           </div>
        </div>
      ))}
    </div>
    </>
  )
}
