"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Search, Printer, Package, Check } from "lucide-react"
import { createSupplierOrder } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Supplier {
  id: string
  name: string
}

interface Article {
  id: string
  title: string
  base_price: number
}

export default function BonCommandeForm({ suppliers, articles }: { suppliers: Supplier[], articles: Article[] }) {
  const router = useRouter()
  const [supplierName, setSupplierName] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<{ article_name: string, expected_quantity: number, expected_price: number }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false)

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const addProductToItems = (article: Article) => {
    setItems([...items, { 
      article_name: article.title, 
      expected_quantity: 1, 
      expected_price: article.base_price 
    }])
    toast.success(`${article.title} ajouté`)
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.expected_quantity * item.expected_price), 0)

  const handleSaveAndPrint = async () => {
    if (!supplierName.trim()) return toast.error("Le nom du fournisseur est obligatoire")
    if (items.length === 0) return toast.error("Veuillez ajouter au moins un produit")
    if (items.some(i => !i.article_name.trim())) return toast.error("Le nom de chaque article est obligatoire")

    setIsSubmitting(true)
    const res = await createSupplierOrder({
      supplier_name: supplierName,
      notes,
      total_estimated_amount: totalAmount,
      items
    })
    setIsSubmitting(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Bon de commande enregistré avec succès !")
      window.open(`/print/supplier_order/${res.orderId}`, '_blank')
      setSupplierName("")
      setNotes("")
      setItems([])
      router.refresh()
    }
  }

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 max-w-5xl mx-auto mt-6">
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="space-y-2">
          <label className="text-sm font-black uppercase tracking-widest text-gray-400">Fournisseur</label>
          <div className="relative group">
            <select 
              className="w-full h-12 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-2xl appearance-none focus:ring-2 focus:ring-[var(--wise-mint)] focus:border-[var(--wise-dark-green)] transition-all font-bold text-gray-900"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            >
              <option value="">-- Sélectionner un fournisseur --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
              <option value="custom">+ Autre (Saisie manuelle)</option>
            </select>
            {supplierName === "custom" && (
              <Input 
                className="mt-3 h-12 rounded-2xl font-bold"
                placeholder="Entrez le nom du fournisseur..."
                value={supplierName === "custom" ? "" : supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            )}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600">
              <Plus className="w-4 h-4 rotate-45" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-black uppercase tracking-widest text-gray-400">Notes / Date Prévue</label>
          <Input 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Livraison Samedi matin..." 
            className="h-12 rounded-2xl bg-gray-50 border-gray-200 font-medium"
          />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
             <Package className="w-6 h-6 text-[var(--wise-dark-green)]" />
             Articles à commander
          </h3>
          
          <Dialog open={isProductPickerOpen} onOpenChange={setIsProductPickerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--wise-dark-green)] hover:bg-[var(--wise-dark-green)]/90 text-[var(--wise-mint)] font-bold rounded-2xl h-11 px-6 shadow-lg shadow-[var(--wise-dark-green)]/20 transition-all active:scale-95">
                <Plus className="w-5 h-5 mr-2" /> Ajouter un produit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="p-6 bg-[var(--wise-dark-green)] text-white">
                <DialogTitle className="text-2xl font-black">Sélectionner des produits</DialogTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--wise-mint)] w-5 h-5" />
                  <Input 
                    placeholder="Rechercher un produit..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-[var(--wise-mint)]/60 rounded-2xl focus:bg-white/20"
                  />
                </div>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                {filteredArticles.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 font-bold">Aucun produit trouvé.</div>
                ) : filteredArticles.map(article => (
                  <div 
                    key={article.id} 
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 hover:border-[var(--wise-mint)] transition-all cursor-pointer group"
                    onClick={() => addProductToItems(article)}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-[var(--wise-dark-green)]">{article.title}</h4>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">{article.base_price.toLocaleString()} DA</p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 group-hover:bg-[var(--wise-mint)] group-hover:text-[var(--wise-dark-green)] transition-colors">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t bg-gray-50 flex justify-end">
                <Button onClick={() => setIsProductPickerOpen(false)} className="bg-gray-900 text-white font-bold rounded-xl px-8">Terminer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {items.length === 0 ? (
          <div className="py-20 border-2 border-dashed border-gray-100 rounded-3xl text-center flex flex-col items-center justify-center bg-gray-50/50">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-bold">Votre liste est vide.</p>
            <p className="text-xs text-gray-300 mt-1">Ajoutez des produits pour commencer.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <tr>
                  <th className="px-6 py-4">Désignation</th>
                  <th className="px-6 py-4 text-center w-32">Quantité</th>
                  <th className="px-6 py-4 text-right w-40">Prix Estimé (DA)</th>
                  <th className="px-6 py-4 text-center w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{item.article_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Input 
                        type="number"
                        min="1"
                        value={item.expected_quantity || ""}
                        onChange={(e) => updateItem(idx, "expected_quantity", parseInt(e.target.value) || 0)}
                        className="h-10 rounded-xl text-center font-black border-gray-100 focus:border-[var(--wise-dark-green)]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input 
                        type="number"
                        min="0"
                        value={item.expected_price || ""}
                        onChange={(e) => updateItem(idx, "expected_price", parseFloat(e.target.value) || 0)}
                        className="h-10 rounded-xl text-right font-black border-gray-100 focus:border-[var(--wise-dark-green)] text-red-600"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => removeItem(idx)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-8 mt-4 gap-6">
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Estimé du Bon</span>
          <span className="text-3xl font-black text-[var(--wise-dark-green)] tracking-tighter">
            {totalAmount.toLocaleString()} <span className="text-sm font-bold opacity-60">DA</span>
          </span>
        </div>
        
        <Button 
          onClick={handleSaveAndPrint} 
          disabled={isSubmitting || items.length === 0}
          className="bg-[var(--wise-dark-green)] hover:bg-[var(--wise-dark-green)]/90 text-[var(--wise-mint)] font-black text-lg h-16 px-10 rounded-2xl shadow-xl shadow-[var(--wise-dark-green)]/30 flex gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/30 border-t-white" />
          ) : (
            <Printer className="w-6 h-6" />
          )}
          Enregistrer & Imprimer
        </Button>
      </div>
    </div>
  )
}
