
import { createClient } from "@/lib/supabase/server"
import { CategoriesManager } from "@/components/admin/categories/categories-manager"

export default async function CategoriesPage() {
  const supabase = (await createClient()) as any

  // Load all categories with related models & article counts
  const { data: categories } = await supabase
    .from("categories")
    .select(`
      *,
      models(id, name)
    `)
    .order("name", { ascending: true })

  // Also manually get counts for articles if required or just query 
  // We can let the component just display them and rely on the server action check to block deletion.
  // We can enrich categories with article count for UI feedback
  const { data: countsData } = await supabase
     .from("articles")
     .select("category_id")

  const articleCounts = countsData?.reduce((acc: any, curr: any) => {
     acc[curr.category_id] = (acc[curr.category_id] || 0) + 1
     return acc
  }, {}) || {}

  const enrichedCategories = categories?.map((cat: any) => ({
    ...cat,
    articleCount: articleCounts[cat.id] || 0
  })) || []

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Catégories & Modèles</h1>
      </div>
      
      <div className="flex flex-1 rounded-lg shadow-sm">
         <CategoriesManager categories={enrichedCategories} />
      </div>
    </main>
  )
}
