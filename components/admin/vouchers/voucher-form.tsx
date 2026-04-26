"use client"

import { useState, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trash2, Search, Package, ChevronRight, Layers } from "lucide-react"
import { createPurchaseVoucher, updatePurchaseVoucher } from "@/app/(admin)/admin/vouchers/actions"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProductSelectModal } from "./product-select-modal"
import { cn } from "@/lib/utils"

const voucherSchema = z.object({
  supplier_id: z.string().min(1, "Fournisseur (Provider) is required"),
  notes: z.string().optional(),
  items: z.array(z.object({
    article_id: z.string().min(1, "Article required"),
    size_id: z.string().min(1, "Size required"),
    color_id: z.string().min(1, "Color required"),
    quantity: z.coerce.number().int().min(1, "Must be at least 1"),
    purchase_price: z.coerce.number().min(0, "Cost must be positive"),
    sale_price: z.coerce.number().min(0, "Sale price must be positive")
  })).min(1, "Add at least one item")
})

type VoucherFormValues = z.infer<typeof voucherSchema>

export function VoucherForm({ articles, suppliers = [], initialData, redirectPath = "/admin/vouchers" }: { articles: any[], suppliers?: any[], initialData?: any, redirectPath?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [pendingData, setPendingData] = useState<VoucherFormValues | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema) as any,
    defaultValues: initialData ? {
      supplier_id: initialData.supplier_id || "",
      notes: initialData.notes || "",
      items: initialData.purchase_voucher_items || []
    } : {
      supplier_id: "",
      notes: "",
      items: []
    }
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const watchedItems = form.watch("items")
  const totalCost = watchedItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.purchase_price || 0)), 0)

  // Group items by article_id for the UI
  const groupedItems = useMemo(() => {
    const groups: Record<string, { article: any, indices: number[] }> = {};
    watchedItems.forEach((item, index) => {
      const articleId = item.article_id;
      if (articleId) {
        if (!groups[articleId]) {
          const article = articles.find(a => a.id === articleId);
          groups[articleId] = { article, indices: [] };
        }
        groups[articleId].indices.push(index);
      }
    });
    return groups;
  }, [watchedItems, articles]);

  const handleProductSelect = (article: any) => {
    // When a product is selected, add a default size/color entry if not already present
    const firstSize = article.article_sizes?.[0];
    const firstColor = firstSize?.article_size_colors?.[0];

    if (!firstSize || !firstColor) {
      alert("This product has no sizes or colors defined.");
      return;
    }

    // Check if this product already has items
    const existingIndices = watchedItems.reduce((acc: number[], item, idx) => {
      if (item.article_id === article.id) acc.push(idx);
      return acc;
    }, []);

    if (existingIndices.length === 0) {
      append({
        article_id: article.id,
        size_id: firstSize.id,
        color_id: firstColor.id,
        quantity: 1,
        purchase_price: article.purchase_price || 0,
        sale_price: article.base_price || 0
      });
    } else {
      // Maybe flash the existing product or just do nothing
      console.log("Product already in list");
    }
  };

  const addSizeForProduct = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    // Find a size that isn't already added for this product
    const existingSizeIdsForProduct = watchedItems
      .filter(item => item.article_id === articleId)
      .map(item => item.size_id);

    const nextAvailableSize = article.article_sizes.find((s: any) => !existingSizeIdsForProduct.includes(s.id));

    if (!nextAvailableSize) {
      // If all sizes are already added, just add the first one again or alert
      // User said "mn9der ndir 2 man nafs size", so we should check more carefully.
      // Actually, they said "byna mn9der ndir 2 man nafs size" meaning they SHOULDN'T be able to?
      // Or they can? "byna" usually means "obviously". 
      // In Arabic context "byna mn9derch" means "obviously I can't".
      alert("All available sizes for this product are already in the list.");
      return;
    }

    const firstColor = nextAvailableSize.article_size_colors?.[0];
    if (!firstColor) {
      alert("This size has no colors defined.");
      return;
    }

    append({
      article_id: articleId,
      size_id: nextAvailableSize.id,
      color_id: firstColor.id,
      quantity: 1,
      purchase_price: article.purchase_price || 0,
      sale_price: article.base_price || 0
    });
  };

  const handlePreSubmit = (data: VoucherFormValues) => {
    setPendingData(data)
    setPaymentAmount(0)
    setDialogOpen(true)
  }

  const confirmSubmit = async () => {
    if (!pendingData) return;
    setIsLoading(true)
    try {
      let result;
      if (initialData) {
        result = await updatePurchaseVoucher(initialData.id, { 
            ...pendingData, 
            notes: pendingData.notes || "",
            payment_amount: paymentAmount
        })
      } else {
        result = await createPurchaseVoucher({ 
            ...pendingData, 
            notes: pendingData.notes || "",
            payment_amount: paymentAmount
        })
      }
      
      if (result.error) throw new Error(result.error)
      
      setDialogOpen(false)
      router.push(redirectPath)
      router.refresh()
    } catch (e: any) {
      alert("Error saving voucher: " + e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(handlePreSubmit)} className="space-y-8">
        {/* Header Info */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--wise-mint)]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 ml-1">Fournisseur (Provider)</label>
            <select
              {...form.register("supplier_id")}
              className="w-full h-12 px-4 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--wise-mint)] outline-none transition-all"
            >
              <option value="">-- Sélectionnez un fournisseur --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.phone || 'Pas de numéro'})</option>
              ))}
            </select>
            {form.formState.errors.supplier_id && <p className="text-xs text-red-500 mt-1">{form.formState.errors.supplier_id.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 ml-1">Notes Additionnelles</label>
            <Input 
              {...form.register("notes")} 
              placeholder="e.g. Référence de la facture..." 
              className="h-12 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--wise-mint)] transition-all"
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Articles à Réceptionner</h3>
              <p className="text-sm text-gray-500">Ajoutez les produits et leurs variantes reçus.</p>
            </div>
            <Button 
              type="button" 
              onClick={() => setProductModalOpen(true)}
              className="rounded-full h-12 px-6 bg-[var(--wise-dark-green)] hover:opacity-90 text-[var(--wise-mint)] font-bold shadow-md hover:shadow-lg transition-all gap-2"
            >
              <Plus className="h-5 w-5" /> Ajouter un Produit
            </Button>
          </div>

          <div className="space-y-6">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <Package size={40} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Aucun produit ajouté</h4>
                <p className="text-gray-500 max-w-xs mx-auto mb-8">Commencez par rechercher et sélectionner un produit pour l'ajouter au bon d'achat.</p>
                <Button variant="outline" onClick={() => setProductModalOpen(true)} className="rounded-full px-8 h-12 border-gray-200 hover:bg-gray-50">
                  Rechercher un Produit
                </Button>
              </div>
            ) : (
              Object.entries(groupedItems).map(([articleId, group]) => (
                <div key={articleId} className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Product Header */}
                  <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-[var(--wise-dark-green)] shadow-sm">
                        <Package size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 leading-tight">{group.article?.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Barcode: {group.article?.barcode || "N/A"}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{group.indices.length} variant(s)</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addSizeForProduct(articleId)}
                      className="rounded-full bg-white border-gray-200 hover:bg-[var(--wise-mint)] hover:text-[var(--wise-dark-green)] hover:border-[var(--wise-mint)] font-bold gap-1.5 h-9"
                    >
                      <Plus className="h-4 w-4" /> Taille
                    </Button>
                  </div>

                  {/* Sizes/Variants List */}
                  <div className="p-4 space-y-3">
                    {group.indices.map((idx) => {
                      const item = watchedItems[idx];
                      const availableSizes = group.article?.article_sizes || [];
                      const targetSize = availableSizes.find((s: any) => s.id === item.size_id);
                      const availableColors = targetSize?.article_size_colors || [];

                      return (
                        <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-gray-50/30 border border-gray-50 hover:border-gray-200 transition-colors">
                          {/* Size Selection */}
                          <div className="lg:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Taille</label>
                            <select
                              {...form.register(`items.${idx}.size_id`)}
                              className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[var(--wise-mint)] outline-none"
                              onChange={(e) => {
                                // Check if this size is already added for this product
                                const isDuplicate = watchedItems.some((it, i) => i !== idx && it.article_id === articleId && it.size_id === e.target.value);
                                if (isDuplicate) {
                                  alert("Cette taille est déjà ajoutée pour ce produit.");
                                  return;
                                }
                                form.setValue(`items.${idx}.size_id`, e.target.value);
                                form.setValue(`items.${idx}.color_id`, ""); // Reset color when size changes
                              }}
                            >
                              <option value="">Taille</option>
                              {availableSizes.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.size_label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Color Selection */}
                          <div className="lg:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Couleur</label>
                            <select
                              {...form.register(`items.${idx}.color_id`)}
                              disabled={!item.size_id}
                              className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[var(--wise-mint)] outline-none disabled:opacity-50"
                            >
                              <option value="">Couleur</option>
                              {availableColors.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.color_name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Pricing & Qty */}
                          <div className="lg:col-span-7 grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Quantité</label>
                              <Input type="number" min={1} {...form.register(`items.${idx}.quantity`)} className="h-10 rounded-xl bg-white" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">P. Achat (DA)</label>
                              <Input type="number" step="0.01" min={0} {...form.register(`items.${idx}.purchase_price`)} className="h-10 rounded-xl bg-white" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">P. Vente (DA)</label>
                              <Input type="number" step="0.01" min={0} {...form.register(`items.${idx}.sale_price`)} className="h-10 rounded-xl bg-white font-bold text-[var(--wise-dark-green)]" />
                            </div>
                          </div>

                          {/* Remove */}
                          <div className="lg:col-span-1 flex justify-end items-end pb-1">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => remove(idx)}
                              className="h-10 w-10 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            >
                              <Trash2 size={20} />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Section / Total - Normal Layout */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm mt-10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
              <Layers size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest opacity-60">Total du Bon d'Achat</p>
              <h3 className="text-3xl font-black text-gray-900">{totalCost.toLocaleString()} <span className="text-sm font-normal opacity-70">DA</span></h3>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <Button 
              disabled={isLoading} 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              className="flex-1 md:flex-none h-14 px-8 rounded-2xl font-bold border-gray-200"
            >
              Annuler
            </Button>
            <Button 
              disabled={isLoading || watchedItems.length === 0} 
              type="submit" 
              className="flex-1 md:flex-none bg-[var(--wise-dark-green)] text-[var(--wise-mint)] hover:opacity-90 h-14 px-10 rounded-2xl font-bold shadow-md gap-2 text-lg"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Enregistrer le Bon
            </Button>
          </div>
        </div>
      </form>

      {/* Modals */}
      <ProductSelectModal 
        open={productModalOpen} 
        onOpenChange={setProductModalOpen}
        articles={articles}
        onSelect={handleProductSelect}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-0 !p-0 overflow-hidden shadow-2xl rounded-[2rem]">
          <DialogHeader className="sr-only">
            <DialogTitle>Paiement Fournisseur</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col">
            <div className="px-8 py-6 border-b bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">Paiement</h2>
              <p className="text-sm text-gray-500 mt-1">Détails sur le versement au fournisseur</p>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between p-6 bg-[var(--wise-mint)]/10 text-[var(--wise-dark-green)] rounded-3xl border border-[var(--wise-mint)]/20">
                <span className="font-bold">Total à payer:</span>
                <span className="text-3xl font-black">{totalCost.toLocaleString()} DA</span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block ml-1">
                    Montant Versé (DZD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      min={0}
                      step="0.01"
                      className="text-2xl py-8 px-6 bg-gray-50 border-gray-100 rounded-2xl font-black focus:bg-white focus:ring-4 focus:ring-[var(--wise-mint)]/30 outline-none transition-all"
                      value={paymentAmount || ""} 
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl border-gray-200 font-bold" onClick={() => setPaymentAmount(0)}>
                    Crédit Total (0)
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl border-[var(--wise-mint)] text-[var(--wise-dark-green)] hover:bg-[var(--wise-mint)]/10 font-bold" onClick={() => setPaymentAmount(totalCost)}>
                    Tout Payé
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-gray-50 border-t flex justify-end gap-4">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="font-bold">Annuler</Button>
              <Button onClick={confirmSubmit} disabled={isLoading} className="bg-[var(--wise-dark-green)] hover:opacity-90 text-[var(--wise-mint)] min-w-[180px] h-14 rounded-2xl font-bold shadow-lg">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
