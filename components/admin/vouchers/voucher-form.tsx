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

const voucherSchema = z.object({
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

export function VoucherForm({ articles, initialData }: { articles: any[], initialData?: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema) as any,
    defaultValues: initialData ? {
      notes: initialData.notes || "",
      items: initialData.purchase_voucher_items || []
    } : {
      notes: "",
      items: [{ article_id: "", size_id: "", color_id: "", quantity: 1, purchase_price: 0, sale_price: 0 }]
    }
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  const onSubmit = async (data: VoucherFormValues) => {
    setIsLoading(true)
    try {
      let result;
      if (initialData) {
        result = await updatePurchaseVoucher(initialData.id, { ...data, notes: data.notes || "" })
      } else {
        result = await createPurchaseVoucher({ ...data, notes: data.notes || "" })
      }
      
      if (result.error) throw new Error(result.error)
      
      router.push("/admin/vouchers")
      router.refresh()
    } catch (e: any) {
      alert("Error saving voucher: " + e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit, e => console.log(e))} className="space-y-6">
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <label className="block text-sm font-medium mb-1">Notes / Fournisseur (Supplier)</label>
        <Input {...form.register("notes")} placeholder="e.g. Bought from Supplier X, delivery note #1234" />
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
                    // Update article, clear size and color, set default sale price
                    form.setValue(`items.${index}.article_id`, e.target.value);
                    form.setValue(`items.${index}.size_id`, "");
                    form.setValue(`items.${index}.color_id`, "");
                    const a = articles.find(art => art.id === e.target.value);
                    if (a) form.setValue(`items.${index}.sale_price`, a.base_price);
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
          Save Voucher & Update Stock
        </Button>
      </div>
    </form>
  )
}
