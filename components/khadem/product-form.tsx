"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trash2, UploadCloud, X, RefreshCw } from "lucide-react"
import { useDropzone } from "react-dropzone"
import JsBarcode from "jsbarcode"
import { v4 as uuidv4 } from "uuid"

// Types
type Category = { id: string; name: string }
type Model = { id: string; name: string; category_id: string }

// Schema
const productSchema = z.object({
  title: z.string().min(2, "Title is required"),
  base_price: z.coerce.number().min(0, "Price must be positive"),
  category_id: z.string().min(1, "Category is required"),
  model_id: z.string().optional(),
  charika: z.string().optional(),
  description: z.string().optional(),
  low_stock_threshold: z.coerce.number().int().min(0).default(5),
  barcode: z.string().optional(),
  is_published: z.boolean().default(true),
  
  sizes: z.array(z.object({
    id: z.string(), // Temp ID for client-side
    size_label: z.string().min(1, "Size is required"),
    is_standard: z.boolean().default(true),
    price_override: z.coerce.number().nullable().optional(),
    colors: z.array(z.object({
      id: z.string(),
      color_name: z.string().min(1, "Name is required"),
      color_hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be HEX"),
      // Quantity removed from product creation. It will be 0 by default. Managed from Purchase Vouchers.
    })).min(1, "At least one color is required per size")
  })).min(1, "At least one size is required")
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductForm({ categories, models, initialData }: { categories: Category[], models: Model[], initialData?: ProductFormValues & { id: string, existingPhotos?: { id: string; photo_url: string; position: number }[] } }) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [localCategories, setLocalCategories] = useState(categories)
  const [localModels, setLocalModels] = useState(models)
  const [photos, setPhotos] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<{ id: string; photo_url: string; position: number }[]>(
    initialData?.existingPhotos || []
  )
  
  const form = useForm<ProductFormValues>({
    // @ts-ignore zodResolver types can complain about precise union inference differences
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      title: "",
      base_price: 0,
      charika: "",
      description: "",
      category_id: "",
      model_id: "",
      low_stock_threshold: 5,
      barcode: "",
      is_published: true,
      sizes: [{ id: uuidv4(), size_label: "Standard", is_standard: true, price_override: null, colors: [{ id: uuidv4(), color_name: "Default", color_hex: "#000000" }] }]
    }
  })

  // Filter models based on selected category
  const selectedCategoryId = form.watch("category_id")
  const filteredModels = localModels.filter(m => m.category_id === selectedCategoryId)

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control: form.control,
    name: "sizes"
  })

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: acceptedFiles => setPhotos(prev => [...prev, ...acceptedFiles])
  })

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingPhoto = async (id: string, url: string) => {
    if (!confirm('Are you sure you want to remove this photo?')) return;
    
    // delete from db
    await supabase.from('article_photos').delete().eq('id', id);
    
    // attempt to extract fileName and delete from bucket
    try {
      const parts = url.split('/');
      const fileName = parts.pop();
      if(fileName) {
         await supabase.storage.from('article-photos').remove([fileName]);
      }
    } catch(e) {}
    
    setExistingPhotos(prev => prev.filter(p => p.id !== id));
  }

  const generateBarcode = () => {
    // Generate a simple EAN-13 looking barcode for internal use (or custom)
    const code = Math.floor(100000000000 + Math.random() * 900000000000).toString()
    form.setValue("barcode", code)
  }

  const barcodeValue = form.watch("barcode")
  useEffect(() => {
    if (barcodeValue) {
      try {
        JsBarcode("#barcode-preview", barcodeValue, {
          format: "CODE128", // code128 is more forgiving with different length/char strings
          lineColor: "#111111",
          width: 2,
          height: 40,
          displayValue: true
        })
      } catch (e) {
        // If the code is invalid for the format, ignore or show custom handling
      }
    }
  }, [barcodeValue])

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true)
    try {
      // 1. Upload photos to 'article-photos' bucket
      const uploadedPhotos: string[] = []
      for (const file of photos) {
        const fileName = `${uuidv4()}-${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("article-photos")
          .upload(fileName, file)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from("article-photos")
          .getPublicUrl(fileName)
          
        uploadedPhotos.push(publicUrl)
      }

      // 2. Insert Article
      let articleId = initialData?.id;
      if (initialData) {
        const { error: articleErr } = await supabase.from("articles").update({
          title: data.title,
          base_price: data.base_price,
          category_id: data.category_id,
          model_id: data.model_id || null,
          charika: data.charika || null,
          description: data.description || null,
          low_stock_threshold: data.low_stock_threshold,
          barcode: data.barcode || null,
          is_published: data.is_published,
          updated_at: new Date().toISOString()
        }).eq("id", articleId!);
        if (articleErr) throw articleErr || new Error("Failed to update article");
      } else {
        const { data: article, error: articleErr } = await supabase.from("articles").insert({
          title: data.title,
          base_price: data.base_price,
          category_id: data.category_id,
          model_id: data.model_id || null,
          charika: data.charika || null,
          description: data.description || null,
          low_stock_threshold: data.low_stock_threshold,
          barcode: data.barcode || null,
          is_published: data.is_published
        }).select().single();
        if (articleErr || !article) throw articleErr || new Error("Failed to insert article");
        articleId = article.id;
      }

      // 3. Insert Photos DB references
      if (uploadedPhotos.length > 0) {
        const photoInserts = uploadedPhotos.map((url, position) => ({
          article_id: articleId!,
          photo_url: url,
          position: existingPhotos.length + position
        }))
        const { error: photoErr } = await supabase.from("article_photos").insert(photoInserts)
        if (photoErr) throw photoErr
      }

      // 4. Upsert Sizes and Colors
      const currentSizeIds: string[] = []
      
      for (const size of data.sizes) {
        const { data: upsertedSize, error: sizeErr } = await supabase.from("article_sizes").upsert({
          id: size.id,
          article_id: articleId!,
          size_label: size.size_label,
          is_standard: size.is_standard,
          price_override: size.price_override || null
        }, { onConflict: "id" }).select().single()

        if (sizeErr || !upsertedSize) throw sizeErr || new Error("Failed connecting size")
        currentSizeIds.push(upsertedSize.id)

        const currentColorIds: string[] = []
        for (const color of size.colors) {
          const { data: upsertedColor, error: colorErr } = await supabase.from("article_size_colors").upsert({
            id: color.id,
            size_id: upsertedSize.id,
            color_name: color.color_name,
            color_hex: color.color_hex,
          }, { onConflict: "id" }).select().single()
          
          if (colorErr || !upsertedColor) throw colorErr
          currentColorIds.push(upsertedColor.id)
        }

        if (initialData) {
          const initialColorsDict = initialData.sizes.find((s: any) => s.id === size.id)?.colors || []
          const removedColors = initialColorsDict.filter((c: any) => !currentColorIds.includes(c.id))
          if (removedColors.length > 0) {
            await supabase.from("article_size_colors").delete().in("id", removedColors.map((c: any) => c.id))
          }
        }
      }

      if (initialData) {
        const removedSizes = initialData.sizes.filter((s: any) => !currentSizeIds.includes(s.id))
        if (removedSizes.length > 0) {
          await supabase.from("article_sizes").delete().in("id", removedSizes.map((s: any) => s.id))
        }
      }

      router.push("/admin/products")
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert("Error saving product: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form 
      onSubmit={form.handleSubmit(onSubmit as any, (errors) => {
        console.log("Form Validation Errors:", errors);
        
        // Extract basic field error messages if any
        const errorMessages = [];
        if (errors.title) errorMessages.push("Title is required");
        if (errors.category_id) errorMessages.push("Category is required");
        if (errors.base_price) errorMessages.push("Base Price is required");
        if (errors.sizes) errorMessages.push("Please check Sizes and Colors (e.g. missing size name or color info)");
        
        alert("Please fix validation errors before saving:\n" + (errorMessages.length > 0 ? "- " + errorMessages.join("\n- ") : "Check sizes and colors"));
      })} 
      className="space-y-8"
    >
      
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input {...form.register("title")} placeholder="Product Name" className="bg-white" />
            {form.formState.errors.title && <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Base Price (DA)</label>
            <Input type="number" {...form.register("base_price")} className="bg-white" />
            {form.formState.errors.base_price && <p className="text-sm text-red-500 mt-1">{form.formState.errors.base_price.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Brand / Company (Charika)</label>
            <Input {...form.register("charika")} placeholder="Brand Name" className="bg-white" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...form.register("description")} placeholder="Product description..." className="w-full px-3 py-2 border border-[#e5e5e5] rounded focus:outline-none focus:border-[var(--color-primary)] bg-white text-sm min-h-[100px]" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <div className="flex gap-2">
              <select
                {...form.register("category_id")}
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded focus:outline-none focus:border-[var(--color-primary)] bg-white text-sm"
                onChange={(e) => {
                  form.setValue("category_id", e.target.value);
                  form.setValue("model_id", ""); // reset model
                }}
              >
                <option value="">Select a category...</option>
                {localCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Button type="button" variant="outline" size="icon" onClick={async () => {
                const name = prompt("Enter new category name:")
                if(!name) return
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                const { data, error } = await supabase.from("categories").insert({ name, slug }).select().single()
                if(error) return alert("Error creating category")
                setLocalCategories(prev => [...prev, data as Category].sort((a,b) => a.name.localeCompare(b.name)))
                form.setValue("category_id", data.id)
              }}><Plus className="h-4 w-4" /></Button>
            </div>
            {form.formState.errors.category_id && <p className="text-sm text-red-500 mt-1">{form.formState.errors.category_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Model (Optional)</label>
            <div className="flex gap-2">
              <select
                {...form.register("model_id")}
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded focus:outline-none focus:border-[var(--color-primary)] bg-white text-sm"
                disabled={!selectedCategoryId}
              >
                <option value="">Select a model...</option>
                {filteredModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <Button type="button" variant="outline" size="icon" disabled={!selectedCategoryId} onClick={async () => {
                const name = prompt("Enter new model name:")
                if(!name || !selectedCategoryId) return
                const { data, error } = await supabase.from("models").insert({ name, category_id: selectedCategoryId }).select().single()
                if(error) return alert("Error creating model")
                setLocalModels(prev => [...prev, data as Model].sort((a,b) => a.name.localeCompare(b.name)))
                form.setValue("model_id", data.id)
              }}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory & Barcode */}
      <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
        <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Inventory & Scanning</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
            <Input type="number" {...form.register("low_stock_threshold")} className="bg-white" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Barcode (EAN/UPC)</label>
            <div className="flex items-center gap-2">
              <Input {...form.register("barcode")} className="bg-white flex-1" placeholder="Scan or enter code" />
              <Button type="button" variant="secondary" onClick={generateBarcode}>
                <RefreshCw className="h-4 w-4 mr-2" /> Gen
              </Button>
            </div>
            {form.watch("barcode") && (
              <div className="mt-2 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg flex justify-center">
                <svg id="barcode-preview"></svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
        <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Photos</h3>
        <div 
          {...getRootProps()} 
          className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] rounded-lg p-8 text-center cursor-pointer transition-colors bg-[var(--color-surface)]"
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-10 w-10 text-[var(--color-text-muted)] mx-auto mb-2" />
          <p className="text-sm font-medium">Click or drag images here to upload</p>
          <p className="text-xs text-[var(--color-text-muted)]">PNG, JPG up to 5MB</p>
        </div>

        {(photos.length > 0 || existingPhotos.length > 0) && (
          <div className="flex gap-4 overflow-x-auto py-2">
            {existingPhotos.map((photo) => (
              <div key={photo.id} className="relative flex-shrink-0">
                <img src={photo.photo_url} alt="preview" className="h-24 w-24 object-cover rounded-lg border border-[var(--color-border)]" />
                <button type="button" onClick={() => removeExistingPhoto(photo.id, photo.photo_url)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors z-10">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photos.map((file, i) => (
              <div key={i} className="relative flex-shrink-0">
                <img src={URL.createObjectURL(file)} alt="preview" className="h-24 w-24 object-cover rounded-lg border border-[var(--color-border)]" />
                <button type="button" onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors z-10">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sizes & Colors */}
      <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Variants (Sizes & Colors)</h3>
          <Button type="button" variant="outline" onClick={() => appendSize({ id: uuidv4(), size_label: "", is_standard: true, price_override: null, colors: [{ id: uuidv4(), color_name: "", color_hex: "#000000" }] })}>
            <Plus className="h-4 w-4 mr-2" /> Add Size
          </Button>
        </div>

        <div className="space-y-6">
          {sizeFields.map((field, sizeIndex) => (
            <div key={field.id} className="p-4 border border-[var(--color-border)] rounded-lg bg-[#fafafa]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div>
                    <label className="block text-xs font-medium mb-1">Size Label (e.g., L, 42, Standard)</label>
                    <Input {...form.register(`sizes.${sizeIndex}.size_label`)} className="bg-white text-sm h-8" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Price Override (Leave empty to use base price)</label>
                    <Input type="number" {...form.register(`sizes.${sizeIndex}.price_override`)} className="bg-white text-sm h-8" />
                  </div>
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeSize(sizeIndex)} disabled={sizeFields.length === 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* COLORS ARRAY FOR THIS SIZE */}
              <ColorsFieldArray control={form.control} sizeIndex={sizeIndex} register={form.register} />
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-6 flex justify-end gap-3 border-t border-[var(--color-border)]">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="min-w-32">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {isLoading ? 'Saving...' : 'Save Product'}
        </Button>
      </div>

    </form>
  )
}

// Sub-component for managing colors array per size
const STANDARD_COLORS = [
  { name: "Noir", hex: "#000000" },
  { name: "Blanc", hex: "#ffffff" },
  { name: "Rouge", hex: "#ff0000" },
  { name: "Bleu", hex: "#0000ff" },
  { name: "Gris", hex: "#808080" }
];

function ColorsFieldArray({ control, sizeIndex, register }: { control: any, sizeIndex: number, register: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sizes.${sizeIndex}.colors`
  })

  return (
    <div className="mt-2 pl-4 border-l-2 border-[var(--color-primary)]/20">
      <div className="flex flex-col gap-2 mb-4">
        <h4 className="text-sm font-medium">Colors for this size</h4>
        <div className="flex flex-wrap gap-2">
          {STANDARD_COLORS.map(c => (
            <Button 
              key={c.name} 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ id: uuidv4(), color_name: c.name, color_hex: c.hex })}
            >
              <div className="w-3 h-3 rounded-full mr-2 border border-gray-300" style={{ backgroundColor: c.hex }}></div>
              {c.name}
            </Button>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => append({ id: uuidv4(), color_name: "Couleur Spéciale", color_hex: "#eeeeee" })}>
            <Plus className="h-3 w-3 mr-1" /> Custom Color
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {fields.map((colorField, colorIndex) => (
          <div key={colorField.id} className="flex flex-wrap items-end gap-3 p-2 bg-white border border-[var(--color-border)] rounded-md shadow-sm">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] uppercase text-gray-500 mb-1">Color Name</label>
              <Input {...register(`sizes.${sizeIndex}.colors.${colorIndex}.color_name`)} placeholder="e.g. Noir" className="bg-white h-8 text-xs" />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-gray-500 mb-1">Hex</label>
              <div className="flex items-center border border-[var(--color-border)] h-8 rounded bg-white overflow-hidden w-24">
                <input type="color" {...register(`sizes.${sizeIndex}.colors.${colorIndex}.color_hex`)} className="w-8 h-8 p-0 border-0 cursor-pointer bg-transparent" />
                <Input {...register(`sizes.${sizeIndex}.colors.${colorIndex}.color_hex`)} className="border-0 h-full text-xs px-2 w-full focus-visible:ring-0" />
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 mb-px" onClick={() => remove(colorIndex)} disabled={fields.length === 1}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
