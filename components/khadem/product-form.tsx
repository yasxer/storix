"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trash2, UploadCloud, X, ScanLine, Wand2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { v4 as uuidv4 } from "uuid"
import { ScannerModal } from "@/app/(khadem)/khadem/pos/scanner-modal"
import { getUploadUrl, deleteFileFromR2 } from "@/app/actions/storage"

// Types
type Category = { id: string; name: string }
type Model = { id: string; name: string; category_id: string }

// Schema
const productSchema = z.object({
  title: z.string().min(2, "Title is required"),
  base_price: z.coerce.number().min(0, "Price must be positive"),
  purchase_price: z.coerce.number().min(0, "Purchase price must be positive").default(0),
  category_id: z.string().min(1, "Category is required"),
  model_id: z.string().optional(),
  charika: z.string().optional(),
  description: z.string().optional(),
  low_stock_threshold: z.coerce.number().int().min(0).default(5),
  barcode: z.string().optional(),
  is_published: z.boolean().default(true),
  
  matrix_sizes: z.array(z.object({
    id: z.string(),
    size_label: z.string().min(1, "Size is required"),
    price_override: z.coerce.number().nullable().optional(),
  })).min(1, "At least one size is required"),
  matrix_colors: z.array(z.object({
    id: z.string(),
    color_name: z.string().min(1, "Name is required"),
    color_hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})([,/]\s*#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))*$/, "Must be HEX"),
  })).min(1, "At least one color is required")
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductForm({ categories, models, initialData }: { categories: Category[], models: Model[], initialData?: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [existingPhotos, setExistingPhotos] = useState<{ id: string; photo_url: string; position: number }[]>(
    initialData?.existingPhotos || []
  )
  
  const getInitialValues = () => {
    if (!initialData) return {
      title: "",
      base_price: 0,
      purchase_price: 0,
      charika: "",
      description: "",
      category_id: "",
      model_id: "",
      low_stock_threshold: 5,
      barcode: "",
      is_published: true,
      matrix_sizes: [{ id: uuidv4(), size_label: "Standard", price_override: null }],
      matrix_colors: [{ id: uuidv4(), color_name: "Default", color_hex: "#000000" }]
    };

    const matrix_sizes = (initialData.sizes || []).map((s: any) => ({
      id: s.id,
      size_label: s.size_label,
      price_override: s.price_override
    }));

    const matrix_colors = (initialData.sizes?.[0]?.colors || []).map((c: any) => ({
      id: c.id,
      color_name: c.color_name,
      color_hex: c.color_hex
    }));

    return {
      ...initialData,
      matrix_sizes: matrix_sizes.length > 0 ? matrix_sizes : [{ id: uuidv4(), size_label: "Standard", price_override: null }],
      matrix_colors: matrix_colors.length > 0 ? matrix_colors : [{ id: uuidv4(), color_name: "Default", color_hex: "#000000" }]
    };
  };

  const form = useForm<ProductFormValues>({
    // @ts-ignore
    resolver: zodResolver(productSchema),
    defaultValues: getInitialValues() as unknown as ProductFormValues
  })

  const selectedCategoryId = form.watch("category_id")
  const filteredModels = models.filter(m => m.category_id === selectedCategoryId)

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control: form.control,
    name: "matrix_sizes"
  })

  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({
    control: form.control,
    name: "matrix_colors"
  })

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: acceptedFiles => setPhotos(prev => [...prev, ...acceptedFiles])
  })

  const removeExistingPhoto = async (photoId: string, photoUrl: string) => {
    try {
      const parts = photoUrl.split('/');
      const fileName = parts.pop();
      if (fileName) await deleteFileFromR2(fileName);
      
      const { error } = await supabase.from("article_photos").delete().eq("id", photoId)
      if (error) throw error
      setExistingPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (err) {
      console.error(err)
    }
  }

  const generateBarcode = () => {
    const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    form.setValue("barcode", randomBarcode, { shouldValidate: true });
  }

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true)
    try {
      const { data: product, error: productErr } = await supabase.from("articles").upsert({
        id: (initialData as any)?.id || uuidv4(),
        title: data.title,
        base_price: data.base_price,
        purchase_price: data.purchase_price,
        category_id: data.category_id,
        model_id: data.model_id || null,
        charika: data.charika || null,
        description: data.description || null,
        low_stock_threshold: data.low_stock_threshold,
        barcode: data.barcode || null,
        is_published: data.is_published,
      }, { onConflict: "id" }).select().single()

      if (productErr) throw productErr
      const articleId = product.id

      for (const file of photos) {
        const uploadUrl = await getUploadUrl(file.name, file.type)
        await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
        const photoUrl = uploadUrl.split("?")[0]
        await supabase.from("article_photos").insert({ article_id: articleId, photo_url: photoUrl, position: 0 })
      }

      const currentSizeIds: string[] = []
      for (const size of data.matrix_sizes) {
        const { data: upsertedSize, error: sizeErr } = await supabase.from("article_sizes").upsert({
          id: size.id,
          article_id: articleId,
          size_label: size.size_label,
          is_standard: true,
          price_override: size.price_override || null
        }, { onConflict: "id" }).select().single()

        if (sizeErr || !upsertedSize) throw sizeErr
        currentSizeIds.push(upsertedSize.id)

        const currentColorIds: string[] = []
        for (const color of data.matrix_colors) {
          // Find existing color to avoid unique constraint issues
          const { data: existingColor } = await supabase.from("article_size_colors")
            .select("id")
            .eq("size_id", upsertedSize.id)
            .eq("color_name", color.color_name)
            .maybeSingle();

          const colorId = existingColor?.id || uuidv4();

          const { data: upsertedColor, error: colorErr } = await supabase.from("article_size_colors").upsert({
            id: colorId,
            size_id: upsertedSize.id,
            color_name: color.color_name,
            color_hex: color.color_hex,
          }, { onConflict: "id" }).select().single()
          if (colorErr || !upsertedColor) throw colorErr
          currentColorIds.push(upsertedColor.id)
        }

        const { data: existingColors } = await supabase.from("article_size_colors").select("id").eq("size_id", upsertedSize.id);
        const colorsToDelete = (existingColors || []).filter(c => !currentColorIds.includes(c.id)).map(c => c.id);
        if (colorsToDelete.length > 0) await supabase.from("article_size_colors").delete().in("id", colorsToDelete);
      }

      const { data: existingSizes } = await supabase.from("article_sizes").select("id").eq("article_id", articleId);
      const sizesToDelete = (existingSizes || []).filter(s => !currentSizeIds.includes(s.id)).map(s => s.id);
      if (sizesToDelete.length > 0) await supabase.from("article_sizes").delete().in("id", sizesToDelete);

      router.push("/khadem/products")
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Product Information</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input {...form.register("title")} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select {...form.register("category_id")} className="w-full h-10 px-3 rounded-md border border-[var(--color-border)] bg-white text-sm">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <select {...form.register("model_id")} className="w-full h-10 px-3 rounded-md border border-[var(--color-border)] bg-white text-sm" disabled={!selectedCategoryId}>
                  <option value="">Select Model</option>
                  {filteredModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Inventory</h3>
            <div className="flex gap-2">
              <Input {...form.register("barcode")} placeholder="Barcode" className="flex-1" />
              <Button type="button" variant="outline" size="icon" onClick={() => setIsScanning(true)} title="Scan Barcode"><ScanLine className="h-4 w-4" /></Button>
              <Button type="button" variant="outline" size="icon" onClick={generateBarcode} title="Generate Barcode"><Wand2 className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Pricing</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Price</label>
              <Input type="number" {...form.register("base_price")} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Photos</h3>
            <div {...getRootProps()} className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50">
              <input {...getInputProps()} />
              <UploadCloud className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-500">Upload photos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-[var(--color-border)]">
        <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Variants (Matrix)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[var(--color-primary)] rounded-full" /> 1. Sizes
            </h4>
            {sizeFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3 p-3 bg-[#fafafa] border border-[var(--color-border)] rounded-lg group">
                <div className="flex-1 space-y-2">
                  <Input {...form.register(`matrix_sizes.${index}.size_label`)} placeholder="Size" className="bg-white h-9" />
                  <Input type="number" {...form.register(`matrix_sizes.${index}.price_override`)} placeholder="Price Override" className="bg-white h-7 text-xs w-32" />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeSize(index)} disabled={sizeFields.length === 1}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="w-full border-dashed" onClick={() => appendSize({ id: uuidv4(), size_label: "", price_override: null })}><Plus className="h-3 w-3 mr-2" /> Add Size</Button>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
              <div className="w-1.5 h-6 bg-purple-500 rounded-full" /> 2. Colors
            </h4>
            <ColorsFieldArray control={form.control} register={form.register} setValue={form.setValue} watch={form.watch} />
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end gap-3 border-t border-[var(--color-border)]">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="min-w-32">{isLoading ? 'Saving...' : 'Save'}</Button>
      </div>

      <ScannerModal isOpen={isScanning} onClose={() => setIsScanning(false)} onScan={(code) => { form.setValue("barcode", code); setIsScanning(false); }} />
    </form>
  )
}

const STANDARD_COLORS = [
  { name: "Noir", hex: "#000000" },
  { name: "Blanc", hex: "#ffffff" },
  { name: "Rouge", hex: "#ff0000" },
  { name: "Bleu", hex: "#0000ff" },
  { name: "Gris", hex: "#808080" },
  { name: "Noir/Argent", hex: "#000000,#c0c0c0" },
  { name: "Mix...", hex: "#ffffff,#000000" }
];

function ColorsFieldArray({ control, register, setValue, watch }: { control: any, register: any, setValue: any, watch: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "matrix_colors" })
  return (
    <div className="mt-2 pl-4 border-l-2 border-[var(--color-primary)]/20">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-wrap gap-2">
          {STANDARD_COLORS.map(c => (
            <Button key={c.name} type="button" variant="outline" size="sm" onClick={() => append({ id: uuidv4(), color_name: c.name, color_hex: c.hex })}>
              <div className="w-3 h-3 rounded-full mr-2 border border-gray-300" style={c.hex.includes(',') ? { background: `linear-gradient(135deg, ${c.hex.split(/[,/]/)[0]} 50%, ${c.hex.split(/[,/]/)[1]} 50%)` } : { backgroundColor: c.hex }}></div>
              {c.name}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {fields.map((colorField, colorIndex) => {
          const currentColorHex = watch(`matrix_colors.${colorIndex}.color_hex`);
          const hexParts = (currentColorHex || "").split(/[,/]/).map((s: string) => s.trim());
          return (
            <div key={colorField.id} className="flex items-end gap-3 p-3 bg-white border border-[var(--color-border)] rounded-lg group shadow-sm">
              <div className="flex-1 min-w-[120px]">
                <Input {...register(`matrix_colors.${colorIndex}.color_name`)} placeholder="Color Name" className="h-9 text-xs" />
              </div>
              <div className="flex items-center border border-[var(--color-border)] h-9 rounded bg-white overflow-hidden px-2">
                <input type="color" value={hexParts[0] || "#000000"} onChange={(e) => { const parts = [...hexParts]; parts[0] = e.target.value; setValue(`matrix_colors.${colorIndex}.color_hex`, parts.join(",")); }} className="w-6 h-6 p-0 border-0 cursor-pointer" />
                <Input value={currentColorHex} onChange={(e) => setValue(`matrix_colors.${colorIndex}.color_hex`, e.target.value)} className="border-0 h-full text-[10px] w-20 px-1 focus-visible:ring-0" />
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => { const parts = [...hexParts]; if (parts.length > 1) setValue(`matrix_colors.${colorIndex}.color_hex`, parts[0]); else setValue(`matrix_colors.${colorIndex}.color_hex`, `${parts[0]},#ffffff`); }}><Plus className="h-3 w-3" /></Button>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(colorIndex)} disabled={fields.length === 1}><X className="h-4 w-4" /></Button>
            </div>
          );
        })}
      </div>
      <Button type="button" variant="outline" size="sm" className="w-full border-dashed mt-4" onClick={() => append({ id: uuidv4(), color_name: "", color_hex: "#000000" })}><Plus className="h-3 w-3 mr-2" /> Add Color</Button>
    </div>
  )
}
