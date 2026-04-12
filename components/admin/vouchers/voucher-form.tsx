"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { createPurchaseVoucher, updatePurchaseVoucher } from "@/app/(admin)/admin/vouchers/actions"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
      items: [{ article_id: "", size_id: "", color_id: "", quantity: 1, purchase_price: 0, sale_price: 0 }]
    }
  })

  // Watch for calculating total cost
  const watchedItems = form.watch("items")
  const totalCost = watchedItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.purchase_price || 0)), 0)

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  const handlePreSubmit = (data: VoucherFormValues) => {
    setPendingData(data)
    setPaymentAmount(0) // Default no payment, or set to totalCost if you prefer fully paid default
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
            payment_amount: paymentAmount // Send payment to update action if needed
        })
      } else {
        result = await createPurchaseVoucher({ 
            ...pendingData, 
            notes: pendingData.notes || "",
            payment_amount: paymentAmount // Brand new
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
      <form onSubmit={form.handleSubmit(handlePreSubmit, e => console.log(e))} className="space-y-6">
        <div className="bg-white border rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fournisseur (Provider)</label>
            <select
              {...form.register("supplier_id")}
              className="w-full h-10 px-3 border border-gray-200 rounded text-sm bg-white"
            >
              <option value="">-- Sélectionnez un fournisseur --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.phone || 'Pas de numéro'})</option>
              ))}
            </select>
            {form.formState.errors.supplier_id && <p className="text-xs text-red-500 mt-1">{form.formState.errors.supplier_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes Additionnelles</label>
            <Input {...form.register("notes")} placeholder="e.g. Référence de la facture, etc." />
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="font-bold">Items Received</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ article_id: "", size_id: "", color_id: "", quantity: 1, purchase_price: 0, sale_price: 0 })}>
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>

        {fields.map((field, index) => {
          const selectedArticleId = form.watch(`items.${index}.article_id`);
          const selectedSizeId = form.watch(`items.${index}.size_id`);
          
          const targetArticle = articles.find(a => a.id === selectedArticleId);
          const availableSizes = targetArticle?.article_sizes || [];
          const targetSize = availableSizes.find((s: any) => s.id === selectedSizeId);
          const availableColors = targetSize?.article_size_colors || [];

          return (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end p-4 border rounded bg-gray-50/50">
              
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
                <select
                  {...form.register(`items.${index}.article_id`)}
                  className="w-full h-10 px-3 border border-gray-200 rounded text-sm bg-white"
                  onChange={(e) => {
                      // Update article, clear size and color, set default sale price & purchase price
                      form.setValue(`items.${index}.article_id`, e.target.value);
                      form.setValue(`items.${index}.size_id`, "");
                      form.setValue(`items.${index}.color_id`, "");
                      const a = articles.find(art => art.id === e.target.value);
                      if (a) {
                        form.setValue(`items.${index}.sale_price`, a.base_price);
                        form.setValue(`items.${index}.purchase_price`, a.purchase_price || 0);
                      }
                  }}
                >
                  <option value="">-- Select Product --</option>
                  {articles.map(a => (
                    <option key={a.id} value={a.id}>{a.title} ({a.barcode || 'No Code'})</option>
                  ))}
                </select>
                {form.formState.errors.items?.[index]?.article_id && <p className="text-xs text-red-500 mt-1">Required</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
                <select
                  {...form.register(`items.${index}.size_id`)}
                  disabled={!selectedArticleId}
                  className="w-full h-10 px-3 border border-gray-200 rounded text-sm bg-white disabled:opacity-50"
                  onChange={(e) => {
                    form.setValue(`items.${index}.size_id`, e.target.value);
                    form.setValue(`items.${index}.color_id`, "");
                  }}
                >
                  <option value="">-- Size --</option>
                  {availableSizes.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.size_label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Color Variant</label>
                <select
                  {...form.register(`items.${index}.color_id`)}
                  disabled={!selectedSizeId}
                  className="w-full h-10 px-3 border border-gray-200 rounded text-sm bg-white disabled:opacity-50"
                >
                  <option value="">-- Color --</option>
                  {availableColors.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.color_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2 col-span-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                  <Input type="number" min={1} {...form.register(`items.${index}.quantity`)} className="bg-white h-10" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1" title="Purchase Price (Cost)">Achat</label>
                  <Input type="number" step="0.01" min={0} {...form.register(`items.${index}.purchase_price`)} className="bg-white h-10" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1" title="Sale Price">Vente</label>
                  <Input type="number" step="0.01" min={0} {...form.register(`items.${index}.sale_price`)} className="bg-white h-10" />
                </div>
              </div>

              <div className="md:col-span-6 flex justify-end">
                 <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2 text-xs" onClick={() => remove(index)} disabled={fields.length === 1}>
                  <Trash2 className="h-3 w-3 mr-1" /> Remove row
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end gap-4">
          <Button disabled={isLoading} type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button disabled={isLoading} type="submit" className="min-w-[150px]">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Enregistrer (Continuer)
          </Button>
        </div>
      </form>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-0 !p-0 overflow-hidden shadow-xl rounded-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Paiement Fournisseur</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col">
            <div className="px-6 py-5 border-b bg-gray-50/50">
              <h2 className="text-xl font-bold flex items-center gap-2">Paiement Fournisseur</h2>
              <p className="text-sm text-gray-500 mt-1">Détails sur le versement d'argent (Payment)</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-100">
                <span className="font-medium">Total du Bon d'Achat:</span>
                <span className="text-2xl font-bold">{totalCost.toFixed(2)} DZD</span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    Combien avez-vous payé (Versement)? <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Entrez 0 si c'est du crédit (crédit total).</p>
                  <div className="relative">
                    <Input 
                      type="number" 
                      min={0}
                      step="0.01"
                      className="text-lg py-5 bg-white border-gray-200"
                      value={paymentAmount || ""} 
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)} 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">DZD</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setPaymentAmount(0)}>
                    Pas de Versement (0)
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => setPaymentAmount(totalCost)}>
                    Paiement Total
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-xl">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={confirmSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer et Sauvegarder"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
