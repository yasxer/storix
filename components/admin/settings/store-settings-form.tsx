"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateStoreSettings } from "@/app/(admin)/admin/settings/actions"
import { toast } from "sonner"
import { Save, UploadCloud, X, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useDropzone } from "react-dropzone"
import { v4 as uuidv4 } from "uuid"

export function StoreSettingsForm({ initialData }: { initialData: any }) {      
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    store_name: initialData?.store_name || "",
    store_phone: initialData?.store_phone || "",
    store_address: initialData?.store_address || "",
    low_stock_threshold: initialData?.low_stock_threshold || 5,
    hero_image_url: initialData?.hero_image_url || "",
    hero_image_url_2: initialData?.hero_image_url_2 || "",
    hero_image_url_3: initialData?.hero_image_url_3 || "",
    hero_image_url_4: initialData?.hero_image_url_4 || "",
    hero_banner_text: initialData?.hero_banner_text || "",
    hero_subtitle: initialData?.hero_subtitle || "",
    hero_cta_text: initialData?.hero_cta_text || "تسوقي الآن",
    hero_cta_link: initialData?.hero_cta_link || "/boutique",
  })

  // Group images for easy mapping
  const heroImages = [
    formData.hero_image_url,
    formData.hero_image_url_2,
    formData.hero_image_url_3,
    formData.hero_image_url_4
  ].filter(Boolean)

  const supabase = createClient()

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return
    
    if (heroImages.length >= 4) {
      toast.error("Vous ne pouvez télécharger que 4 images maximum.")
      return
    }

    setUploadingImage(true)
    const file = acceptedFiles[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`

    const { error: uploadError, data } = await supabase.storage
      .from('store-assets')
      .upload(`hero/${fileName}`, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      toast.error(`Image upload failed: ${uploadError.message}`)
      setUploadingImage(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('store-assets')
      .getPublicUrl(`hero/${fileName}`)

    // Assign to the first empty slot
    let updatedData = { ...formData }
    if (!updatedData.hero_image_url) updatedData.hero_image_url = publicUrl
    else if (!updatedData.hero_image_url_2) updatedData.hero_image_url_2 = publicUrl
    else if (!updatedData.hero_image_url_3) updatedData.hero_image_url_3 = publicUrl
    else if (!updatedData.hero_image_url_4) updatedData.hero_image_url_4 = publicUrl

    setFormData(updatedData)
    setUploadingImage(false)
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = [...heroImages]
    newImages.splice(indexToRemove, 1)
    
    setFormData(prev => ({
      ...prev,
      hero_image_url: newImages[0] || "",
      hero_image_url_2: newImages[1] || "",
      hero_image_url_3: newImages[2] || "",
      hero_image_url_4: newImages[3] || ""
    }))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1 // One at a time, but up to 4 total
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await updateStoreSettings(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Store settings updated successfully!")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="store_name">Store Name</Label>
          <Input 
            id="store_name"
            value={formData.store_name}
            onChange={e => setFormData({ ...formData, store_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="store_phone">Store Phone</Label>
          <Input 
            id="store_phone"
            value={formData.store_phone}
            onChange={e => setFormData({ ...formData, store_phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="store_address">Store Address</Label>
        <Input 
          id="store_address"
          value={formData.store_address}
          onChange={e => setFormData({ ...formData, store_address: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold (Quantities &le; X)</Label>
        <Input
          id="low_stock_threshold"
          type="number"
          min="1"
          value={formData.low_stock_threshold}
          onChange={e => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 5 })}
          required
        />
      </div>

      <div className="pt-4 border-t space-y-4">
        <h3 className="text-lg font-semibold">Storefront Config</h3>
        
        <div className="space-y-4">
          <Label>Hero Images (Up to 4)</Label>
          <div className="grid grid-cols-2 gap-4">
             {heroImages.map((img, i) => (
                <div key={i} className="relative group rounded overflow-hidden aspect-[21/9] bg-gray-100">
                  <img src={img} alt={`Hero ${i+1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Button
                       type="button"
                       variant="destructive"
                       size="icon"
                       onClick={(e) => { e.stopPropagation(); handleRemoveImage(i) }}
                     >
                       <X className="w-4 h-4" />
                     </Button>
                  </div>
                </div>
             ))}
          </div>

          {heroImages.length < 4 && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              {uploadingImage ? (
                <div className="flex flex-col items-center justify-center p-4">   
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />       
                  <span className="mt-2 text-sm text-gray-500">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">  
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 5MB) - {4 - heroImages.length} slots left</p>
                </div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="hero_banner_text">Hero Title</Label>
            <Input
              id="hero_banner_text"
              value={formData.hero_banner_text}
              onChange={e => setFormData({ ...formData, hero_banner_text: e.target.value })}
              placeholder="Ex: Nouvelle Collection"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
            <Input
              id="hero_subtitle"
              value={formData.hero_subtitle}
              onChange={e => setFormData({ ...formData, hero_subtitle: e.target.value })}
              placeholder="Ex: Découvrez nos dernières tendances"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hero_cta_text">CTA Button Text</Label>
            <Input
              id="hero_cta_text"
              value={formData.hero_cta_text}
              onChange={e => setFormData({ ...formData, hero_cta_text: e.target.value })}
              placeholder="Ex: تسوقي الآن"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_cta_link">CTA Button Link</Label>
            <Input
              id="hero_cta_link"
              value={formData.hero_cta_link}
              onChange={e => setFormData({ ...formData, hero_cta_link: e.target.value })}
              placeholder="Ex: /boutique"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
