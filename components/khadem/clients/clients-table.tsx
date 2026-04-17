"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Trash2, Eye, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

import { deleteClient } from "@/app/(khadem)/khadem/clients/actions"

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
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] border-b text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 font-semibold">Nom du Client</th>       
              <th className="px-6 py-4 font-semibold w-56 hidden md:table-cell">Téléphone</th>
              <th className="px-6 py-4 font-semibold text-right">Total Acheté</th>
              <th className="px-6 py-4 font-semibold text-right">Total Versé</th>       
              <th className="px-6 py-4 font-semibold text-right text-red-600">Dette (Crédit)</th>
              <th className="px-6 py-4 font-semibold text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {clients.map((client) => (
               <tr key={client.id} className="hover:bg-[#f8f9fa] transition-colors group">
                <td className="px-6 py-4 font-bold text-gray-900">
                  <span>{client.name}</span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell text-gray-500 font-medium">     
                  {client.phone || "—"}
                </td>
                <td className="px-6 py-4 text-right text-gray-500 font-bold">
                  {client.total_bought.toFixed(2)} DA
                </td>
                <td className="px-6 py-4 text-right text-[var(--wise-dark-green)] font-black">  
                  {client.total_paid.toFixed(2)} DA
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-3 py-1 rounded-md text-[11px] font-black ${   
                    client.solde > 0
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-green-50 text-[var(--wise-dark-green)] border border-[var(--wise-green)]'        
                  }`}>
                    {client.solde.toFixed(2)} DA
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
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-xl border-none ring-1 ring-gray-100">
                      <DropdownMenuItem className="cursor-pointer rounded-xl font-medium p-2" onClick={() => router.push(`/khadem/clients/${client.id}`)}>
                        <Eye className="mr-2 h-4 w-4 text-gray-400" />
                        Voir Détails
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 rounded-xl font-medium p-2"
                        onClick={() => handleDelete(client.id, client.solde)}
                        disabled={deletingId === client.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-red-400" />
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

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-3 p-3 bg-[#f7f8f9] rounded-b-xl border-t border-gray-100">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
             <div className="flex justify-between items-start">
                <div>
                   <h3 className="font-bold text-gray-900 text-sm">{client.name}</h3>
                   <span className="text-xs font-bold text-gray-400 mt-0.5 inline-block">{client.phone || "No phone"}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                      <span className="sr-only">Menu</span>
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 z-[60] shadow-xl border-none ring-1 ring-gray-100">
                    <DropdownMenuItem className="cursor-pointer rounded-xl font-medium p-2" onClick={() => router.push(`/khadem/clients/${client.id}`)}>
                      <Eye className="mr-2 h-4 w-4 text-gray-400" />
                      Voir Détails
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 rounded-xl font-medium p-2"
                      onClick={() => handleDelete(client.id, client.solde)}
                      disabled={deletingId === client.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
             </div>
             
             <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Total Brought</span>
                   <span className="font-bold text-gray-700 text-xs">{client.total_bought.toFixed(2)} DA</span>
                </div>
                <div className="flex flex-col text-right">
                   <span className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Total Paid</span>
                   <span className="font-black text-[var(--wise-dark-green)] text-xs">{client.total_paid.toFixed(2)} DA</span>
                </div>
             </div>
             
             <div className="bg-gray-50/80 p-3 rounded-xl flex justify-between items-center mt-1 border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-500">Current Debt</span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${   
                  client.solde > 0
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-[var(--wise-mint)] text-[var(--wise-dark-green)] border border-[var(--wise-green)]'        
                }`}>
                  {client.solde.toFixed(2)} DA
                </span>
             </div>
          </div>
        ))}
      </div>
    </>
  )
}




