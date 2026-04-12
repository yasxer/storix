"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash2, Eye, Truck, Wallet } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { deleteSupplier } from "@/app/(admin)/admin/suppliers/actions"

export function SuppliersTable({ suppliers }: { suppliers: any[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, solde: number) => {
    if (solde > 0) {
      alert("Impossible de supprimer ce fournisseur car il a encore un solde (crédit) de " + solde.toFixed(2) + " DZD")
      return;
    }
    
    if (confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.")) {
      setDeletingId(id)
      const res = await deleteSupplier(id)
      setDeletingId(null)
      if (res.error) alert(res.error)
      else router.refresh()
    }
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Truck className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold font-display text-gray-900 mb-2">Aucun fournisseur trouvé</h3>
        <p className="text-gray-500 max-w-sm">
          Vous n'avez pas encore de fournisseurs enregistrés. Ajoutez votre premier fournisseur pour commencer.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border-b font-medium">
          <tr>
            <th className="px-6 py-4 font-semibold">Nom / Entreprise</th>
            <th className="px-6 py-4 font-semibold w-56 hidden md:table-cell">Contact</th>
            <th className="px-6 py-4 font-semibold text-right">Achats Totaux</th>
            <th className="px-6 py-4 font-semibold text-right">Versé</th>
            <th className="px-6 py-4 font-semibold text-right text-red-600">Crédit Restant (Solde)</th>
            <th className="px-6 py-4 font-semibold text-center w-24">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {suppliers.map((sup) => (
            <tr key={sup.id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4 font-medium text-gray-900">
                <div className="flex flex-col">
                  <span>{sup.name}</span>
                  {sup.address && <span className="text-xs text-gray-500 font-normal mt-1">{sup.address}</span>}
                </div>
              </td>
              <td className="px-6 py-4 hidden md:table-cell text-gray-500">
                {sup.phone || "—"}
              </td>
              <td className="px-6 py-4 text-right text-gray-500">
                {sup.total_bought.toFixed(2)} DZD
              </td>
              <td className="px-6 py-4 text-right text-green-600 font-medium">
                {sup.total_paid.toFixed(2)} DZD
              </td>
              <td className="px-6 py-4 text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  sup.solde > 0 
                  ? 'bg-red-50 text-red-600 border border-red-100' 
                  : 'bg-green-50 text-green-600 border border-green-100'
                }`}>
                  {sup.solde.toFixed(2)} DZD
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
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/admin/suppliers/${sup.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir Détails & Versements
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-700" 
                      onClick={() => handleDelete(sup.id, sup.solde)}
                      disabled={deletingId === sup.id}
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
  )
}