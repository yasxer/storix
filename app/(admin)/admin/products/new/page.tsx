import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/product-form"

export default async function NewProductPage() {
  const supabase = await createClient()

  // Fetch categories and models for the select dropdowns
  const { data: categories } = await supabase.from("categories").select("*").order("name")
  const { data: models } = await supabase.from("models").select("*").order("name")

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Add New Product</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Create a new product, add photos, and setup inventory sizes and colors.
        </p>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm p-6">
        <ProductForm categories={categories || []} models={models || []} />
      </div>
    </div>
  )
}

