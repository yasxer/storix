"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trash2, UploadCloud, X, RefreshCw, ScanLine, Eye, EyeOff, Wand2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import JsBarcode from "jsbarcode"
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
  is_featured: z.boolean().default(false),
  is_on_sale: z.boolean().default(false),
  sale_percentage: z.coerce.number().int().min(1).max(100).optional().nullable(),

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
  const [localCategories, setLocalCategories] = useState(categories)
  const [localModels, setLocalModels] = useState(models)
  const [photos, setPhotos] = useState<File[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [existingPhotos, setExistingPhotos] = useState<{ id: string; photo_url: string; position: number }[]>(
    initialData?.existingPhotos || []
  )
  
  // Pre-process initialData to matrix format
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
      is_featured: false,
      is_on_sale: false,
      sale_percentage: null,
      matrix_sizes: [{ id: uuidv4(), size_label: "Standard", price_override: null }],
      matrix_colors: [{ id: uuidv4(), color_name: "Default", color_hex: "#000000" }]
    };

    // Extract unique sizes
    const matrix_sizes = (initialData.sizes || []).map((s: any) => ({
      id: s.id,
      size_label: s.size_label,
      price_override: s.price_override
    }));

    // Extract unique colors (taking from the first size as representative)
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

  // Filter models based on selected category
  const selectedCategoryId = form.watch("category_id")
  const filteredModels = localModels.filter(m => m.category_id === selectedCategoryId)

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
      // delete from bucket
      const parts = photoUrl.split('/');
      const fileName = parts.pop();
      if (fileName) {
        await deleteFileFromR2(fileName);
      }
      
      // delete from db
      const { error } = await supabase.from("article_photos").delete().eq("id", photoId)
      if (error) throw error
      
      setExistingPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (err) {
      console.error("Error deleting photo:", err)
      alert("Failed to delete photo")
    }
  }

  const generateBarcode = () => {
    // Generate a 12-digit random number
    const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    form.setValue("barcode", randomBarcode, { shouldValidate: true });
  }

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true)
    try {
      // 1. Upsert Product
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
        is_featured: data.is_featured,
        is_on_sale: data.is_on_sale,
        sale_percentage: data.is_on_sale ? data.sale_percentage : null,
      }, { onConflict: "id" }).select().single()

      if (productErr) throw productErr
      const articleId = product.id

      // 2. Handle Photos
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        const uploadUrl = await getUploadUrl(file.name, file.type)
        
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type }
        })

        if (!uploadRes.ok) throw new Error("Failed to upload photo")
        
        const photoUrl = uploadUrl.split("?")[0]
        const { error: photoErr } = await supabase.from("article_photos").insert({
          article_id: articleId,
          photo_url: photoUrl,
          position: existingPhotos.length + i
        })
        if (photoErr) throw photoErr
      }

      // 3. Upsert Sizes and Colors (Matrix to Hierarchical)
      const currentSizeIds: string[] = []
      
      for (const size of data.matrix_sizes) {
        const { data: upsertedSize, error: sizeErr } = await supabase.from("article_sizes").upsert({
          id: size.id,
          article_id: articleId,
          size_label: size.size_label,
          is_standard: true,
          price_override: size.price_override || null
        }, { onConflict: "id" }).select().single()

        if (sizeErr || !upsertedSize) throw sizeErr || new Error("Failed connecting size")
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

        // Cleanup colors for this size
        const { data: existingColors } = await supabase.from("article_size_colors").select("id").eq("size_id", upsertedSize.id);
        const colorsToDelete = (existingColors || []).filter(c => !currentColorIds.includes(c.id)).map(c => c.id);
        if (colorsToDelete.length > 0) {
          await supabase.from("article_size_colors").delete().in("id", colorsToDelete);
        }
      }

      // Cleanup sizes
      const { data: existingSizes } = await supabase.from("article_sizes").select("id").eq("article_id", articleId);
      const sizesToDelete = (existingSizes || []).filter(s => !currentSizeIds.includes(s.id)).map(s => s.id);
      if (sizesToDelete.length > 0) {
         await supabase.from("article_sizes").delete().in("id", sizesToDelete);
      }

      router.push("/admin/products")
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert(err.message || "An error occurred while saving")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.error(errors);
        const errorMessages = [];
        if (errors.title) errorMessages.push("Title is required");
        if (errors.category_id) errorMessages.push("Category is required");
        if (errors.base_price) errorMessages.push("Base Price is required");
        if (errors.matrix_sizes) errorMessages.push("At least one Size is required");
        if (errors.matrix_colors) errorMessages.push("At least one Color is required");
        
        alert("Please fix validation errors before saving:\n" + (errorMessages.length > 0 ? "- " + errorMessages.join("\n- ") : "Check sizes and colors"));
      })} className="space-y-8 pb-20">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Product Information</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input {...form.register("title")} placeholder="e.g. T-shirt Cotton Premium" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  {...form.register("category_id")}
                  className="w-full h-10 px-3 rounded-md border border-[var(--color-border)] bg-white text-sm"
                >
                  <option value="">Select Category</option>
                  {localCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Model / Brand (Optional)</label>
                <select 
                  {...form.register("model_id")}
                  className="w-full h-10 px-3 rounded-md border border-[var(--color-border)] bg-white text-sm"
                  disabled={!selectedCategoryId}
                >
                  <option value="">Select Model</option>
                  {filteredModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Charika (Company/Provider)</label>
              <Input {...form.register("charika")} placeholder="e.g. Nike, Local Manufacturer" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                {...form.register("description")}
                className="w-full min-h-[100px] p-3 rounded-md border border-[var(--color-border)] bg-white text-sm"
                placeholder="Product details..."
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Inventory & Barcode</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Barcode (Manual or Scan)</label>
                <div className="flex gap-2">
                  <Input {...form.register("barcode")} placeholder="Barcode" className="flex-1" />
                  <Button type="button" variant="outline" size="icon" onClick={() => setIsScanning(true)} title="Scan Barcode">
                    <ScanLine className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" onClick={generateBarcode} title="Generate Barcode">
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Low Stock Alert Threshold</label>
                <Input type="number" {...form.register("low_stock_threshold")} />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Photos */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Pricing</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Selling Price (DA)</label>
              <Input type="number" {...form.register("base_price")} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Price (DA) - Optional</label>
              <Input type="number" {...form.register("purchase_price")} />
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">On Sale</label>
                <input type="checkbox" {...form.register("is_on_sale")} className="h-4 w-4 rounded border-gray-300" />
              </div>
              
              {form.watch("is_on_sale") && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-sm font-medium">Sale Percentage (%)</label>
                  <Input type="number" {...form.register("sale_percentage")} min="1" max="100" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Product Photos</h3>
            
            <div {...getRootProps()} className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <input {...getInputProps()} />
              <UploadCloud className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-500">Drag & drop or click to upload</p>
            </div>

            {/* Photos Preview */}
            <div className="grid grid-cols-3 gap-2">
              {existingPhotos.map((p) => (
                <div key={p.id} className="relative aspect-square rounded-md overflow-hidden border border-[var(--color-border)]">
                  <img src={p.photo_url} alt="Product" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeExistingPhoto(p.id, p.photo_url)}
                    className="absolute top-1 right-1 bg-white/80 p-1 rounded-full shadow-sm hover:bg-white text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-[var(--color-border)]">
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-white/80 p-1 rounded-full shadow-sm hover:bg-white text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[var(--color-border)] shadow-sm space-y-4">
             <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold font-display text-[var(--color-text)]">Published</h3>
                  <p className="text-xs text-gray-500">Visible to customers in the store</p>
                </div>
                <input type="checkbox" {...form.register("is_published")} className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)]" />
             </div>
             <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold font-display text-[var(--color-text)]">Featured</h3>
                  <p className="text-xs text-gray-500">Highlight in home page</p>
                </div>
                <input type="checkbox" {...form.register("is_featured")} className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)]" />
             </div>
          </div>
        </div>
      </div>

      {/* Variants Matrix */}
      <div className="space-y-6 pt-4 border-t border-[var(--color-border)]">
        <h3 className="text-lg font-bold font-display text-[var(--color-text)]">Product Variants (Matrix)</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SIZES COLUMN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[var(--color-primary)] rounded-full" />
                1. Available Sizes
              </h4>
            </div>
            
            <div className="space-y-3">
              {sizeFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3 p-3 bg-[#fafafa] border border-[var(--color-border)] rounded-lg group">
                  <div className="flex-1 space-y-2">
                    <Input 
                      {...form.register(`matrix_sizes.${index}.size_label`)} 
                      placeholder="Size (S, M, 42...)" 
                      className="bg-white h-9"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 uppercase font-medium">Price Override (DA):</span>
                      <Input 
                        type="number"
                        {...form.register(`matrix_sizes.${index}.price_override`)} 
                        placeholder="Base" 
                        className="bg-white h-7 text-xs w-24"
                      />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeSize(index)}
                    disabled={sizeFields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="w-full border-dashed"
                onClick={() => appendSize({ id: uuidv4(), size_label: "", price_override: null })}
              >
                <Plus className="h-3 w-3 mr-2" /> Add Size
              </Button>
            </div>
          </div>

          {/* COLORS COLUMN */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
              <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
              2. Available Colors
            </h4>
            
            <ColorsFieldArray 
              control={form.control} 
              register={form.register} 
              setValue={form.setValue} 
              watch={form.watch} 
            />
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Note:</strong> Every size listed will automatically be available in every color listed. 
            For example, if you have 3 sizes and 2 colors, the system will create 6 product variants.
          </p>
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

      <ScannerModal 
        isOpen={isScanning} 
        onClose={() => setIsScanning(false)} 
        onScan={(code) => {
          form.setValue("barcode", code)
          setIsScanning(false)
        }} 
      />
    </form>
  )
}

// Sub-component for managing colors array
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
  const { fields, append, remove } = useFieldArray({
    control,
    name: "matrix_colors"
  })

  return (
    <div className="mt-2 pl-4 border-l-2 border-[var(--color-primary)]/20">
      <div className="flex flex-col gap-2 mb-4">
        <h4 className="text-sm font-medium">Colors List</h4>
        <div className="flex flex-wrap gap-2">
          {STANDARD_COLORS.map(c => (
            <Button 
              key={c.name} 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ id: uuidv4(), color_name: c.name, color_hex: c.hex })}
            >
              <div className="w-3 h-3 rounded-full mr-2 border border-gray-300" style={
                c.hex.includes(',') || c.hex.includes('/')
                ? { background: `linear-gradient(135deg, ${c.hex.split(/[,/]/)[0].trim()} 50%, ${c.hex.split(/[,/]/)[1].trim()} 50%)` }
                : { backgroundColor: c.hex }
              }></div>
              {c.name}
            </Button>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => append({ id: uuidv4(), color_name: "Couleur Spéciale", color_hex: "#eeeeee" })}>
            <Plus className="h-3 w-3 mr-1" /> Custom Color
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((colorField, colorIndex) => {
          const currentColorHex = watch(`matrix_colors.${colorIndex}.color_hex`);
          const currentColorName = watch(`matrix_colors.${colorIndex}.color_name`);
          const hexParts = (currentColorHex || "").split(/[,/]/).map((s: string) => s.trim());

          return (
            <div key={colorField.id} className="flex flex-wrap items-end gap-3 p-3 bg-white border border-[var(--color-border)] rounded-lg shadow-sm relative group">
              <div className="flex-1 min-w-[120px]">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] uppercase text-gray-500">Color Name</label>
                  <div className="flex gap-1">
                    {STANDARD_COLORS.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        title={c.name}
                        className={`w-3.5 h-3.5 rounded-full border border-gray-200 hover:scale-125 transition-transform ${currentColorName === c.name ? 'ring-2 ring-[var(--color-primary)] ring-offset-1' : ''}`}
                        style={{ backgroundColor: c.hex.split(',')[0] }}
                        onClick={() => {
                          setValue(`matrix_colors.${colorIndex}.color_name`, c.name);
                          setValue(`matrix_colors.${colorIndex}.color_hex`, c.hex);
                        }}
                      />
                    ))}
                  </div>
                </div>
                <Input {...register(`matrix_colors.${colorIndex}.color_name`)} placeholder="e.g. Noir" className="bg-white h-9 text-xs" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-gray-500 mb-1">Hex / Mix</label>
                <div className="flex items-center border border-[var(--color-border)] h-9 rounded bg-white overflow-hidden min-w-[120px]">
                  {/* First Color Picker */}
                  <div className="relative w-8 h-9 flex-shrink-0">
                    <input 
                      type="color" 
                      value={hexParts[0] || "#000000"}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        const parts = [...hexParts];
                        parts[0] = newColor;
                        setValue(`matrix_colors.${colorIndex}.color_hex`, parts.join(","));
                      }}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0 z-10" 
                    />
                    <div 
                      className="w-full h-full border-r border-[var(--color-border)]" 
                      style={{ backgroundColor: hexParts[0] || "#000000" }} 
                    />
                  </div>

                  {/* Second Color Picker (Optional Mix) */}
                  {hexParts.length > 1 && (
                    <div className="relative w-8 h-9 flex-shrink-0 border-l border-[var(--color-border)]">
                      <input 
                        type="color" 
                        value={hexParts[1] || "#ffffff"}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          const parts = [...hexParts];
                          parts[1] = newColor;
                          setValue(`matrix_colors.${colorIndex}.color_hex`, parts.join(","));
                        }}
                        className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0 z-10" 
                      />
                      <div 
                        className="w-full h-full border-r border-[var(--color-border)]" 
                        style={{ backgroundColor: hexParts[1] || "#ffffff" }} 
                      />
                    </div>
                  )}

                  <Input 
                    value={currentColorHex}
                    onChange={(e) => setValue(`matrix_colors.${colorIndex}.color_hex`, e.target.value)}
                    placeholder="#000000"
                    className="border-0 h-full text-[10px] px-2 w-full focus-visible:ring-0 min-w-[80px]" 
                  />
                  
                  {/* Toggle Mix Mode Button */}
                  <button
                    type="button"
                    title="Add/Remove Mix Color"
                    onClick={() => {
                      const parts = [...hexParts];
                      if (parts.length > 1) {
                        setValue(`matrix_colors.${colorIndex}.color_hex`, parts[0]);
                      } else {
                        setValue(`matrix_colors.${colorIndex}.color_hex`, `${parts[0]},#ffffff`);
                        if (!currentColorName || currentColorName === "Default") {
                           setValue(`matrix_colors.${colorIndex}.color_name`, "Mix");
                        }
                      }
                    }}
                    className={`h-full px-2 border-l border-[var(--color-border)] hover:bg-gray-50 flex items-center justify-center transition-colors ${hexParts.length > 1 ? 'text-[var(--color-primary)] bg-blue-50' : 'text-gray-400'}`}
                  >
                    <Plus className={`h-3 w-3 ${hexParts.length > 1 ? 'rotate-45' : ''} transition-transform`} />
                  </button>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 mb-px opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => remove(colorIndex)} disabled={fields.length === 1}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        className="w-full border-dashed mt-4"
        onClick={() => append({ id: uuidv4(), color_name: "", color_hex: "#000000" })}
      >
        <Plus className="h-3 w-3 mr-2" /> Add Color
      </Button>
    </div>
  )
}
