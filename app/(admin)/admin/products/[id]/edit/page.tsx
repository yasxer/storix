import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"

// Remove uuid caching issue by enforcing dynamic
export const dynamic = "force-dynamic"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // 1. Fetch dictionaries
  const { data: categories } = await supabase.from("categories").select("*").order("name")
  const { data: models } = await supabase.from("models").select("*").order("name")

  // 2. Fetch the article with all relations
  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      article_photos (
        id, photo_url, position
      ),
      article_sizes (
        id, size_label, is_standard, price_override,
        article_size_colors (
          id, color_name, color_hex, quantity
        )
      )
    `)
    .eq("id", id)
    .single()

  const article = data as any;

  if (error || !article) {
    console.error(error)
    notFound()
  }

  // 3. Format into initialData
  const initialData = {
    id: article.id,
    title: article.title,
    base_price: article.base_price,
    charika: article.charika || "",
    description: article.description || "",
    category_id: article.category_id,
    model_id: article.model_id || "",
    low_stock_threshold: article.low_stock_threshold,
    barcode: article.barcode || "",
    is_published: article.is_published,
    
    existingPhotos: (article.article_photos as any[])?.sort((a,b) => a.position - b.position) || [],
    
    sizes: (article.article_sizes as any[]).map(size => ({
      id: size.id,
      size_label: size.size_label,
      is_standard: size.is_standard,
      price_override: size.price_override,
      colors: size.article_size_colors || []
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">
          Edit Product
        </h1>
      </div>
      
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
        <ProductForm 
          categories={categories || []} 
          models={models || []} 
          initialData={initialData as any} 
        />
      </div>
    </div>
  )
}
