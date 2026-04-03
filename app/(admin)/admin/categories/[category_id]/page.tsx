import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ModelsManager } from "@/components/admin/categories/models-manager"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function CategoryModelsPage({
  params
}: {
  params: Promise<{ category_id: string }>
}) {
  const resolvedParams = await params
  const supabase = (await createClient()) as any

  // Load category details
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", resolvedParams.category_id)
    .single()

  if (!category) {
    notFound()
  }

  // Load models for this category
  const { data: models } = await supabase
    .from("models")
    .select(`
      *
    `)
    .eq("category_id", category.id)
    .order("name", { ascending: true })

  // Get article counts for each model
  const { data: countsData } = await supabase
    .from("articles")
    .select("model_id")
    .eq("category_id", category.id)

  const articleCounts = countsData?.reduce((acc: any, curr: any) => {
    if (curr.model_id) {
       acc[curr.model_id] = (acc[curr.model_id] || 0) + 1
    }
    return acc
  }, {}) || {}

  const enrichedModels = models?.map((mod: any) => ({
    ...mod,
    articleCount: articleCounts[mod.id] || 0
  })) || []

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="outline" size="icon" className="w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold md:text-2xl">Catégorie: {category.name} (Modèles)</h1>
      </div>
      
      <div className="flex flex-1 rounded-lg shadow-sm">
         <ModelsManager 
           categoryId={category.id} 
           categoryName={category.name} 
           models={enrichedModels} 
         />
      </div>
    </main>
  )
}
