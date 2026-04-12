import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/store/product-card"
import { ModelCard } from "@/components/store/model-card"
import { ShoppingBag } from "lucide-react"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = (await createClient()) as any
  const slug = (await params).slug

  // 1. Fetch category by slug
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!category) {
    notFound()
  }

  // 2. See if there are models
  const { data: models } = await supabase
    .from("models")
    .select("id, name, photo_url")
    .eq("category_id", category.id)
    .order("name", { ascending: true })

  // If models exist, we will also fetch article counts per model
  let modelsWithCounts: any[] = []
  if (models && models.length > 0) {
    const { data: countsData } = await supabase
      .from("articles")
      .select("model_id")
      .eq("category_id", category.id)
      .eq("is_published", true)
      
    const modelCounts = countsData?.reduce((acc: any, curr: any) => {
       if (curr.model_id) acc[curr.model_id] = (acc[curr.model_id] || 0) + 1
       return acc
    }, {}) || {}
    
    modelsWithCounts = models.map((m: any) => ({
      ...m,
      articleCount: modelCounts[m.id] || 0
    }))
  }

  let articles: any[] = []
  if (!models || models.length === 0) {
    const { data } = await supabase
      .from("articles")
      .select(`
        *,
        category:categories(name, slug),
        model:models(name),
        photos:article_photos(photo_url, position),
        sizes:article_sizes(
          id, size_label, is_standard, price_override,
          colors:article_size_colors(id, color_name, color_hex, quantity)
        )
      `)
      .eq("category_id", category.id)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
    articles = data || []
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* Category heading with green underline */}
      <div className="mb-8 md:mb-10 text-center md:text-left">
        <h1 
          className="text-2xl md:text-4xl font-bold inline-block relative tracking-tight"
          style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}
        >
           {category.name}
           <div 
             className="h-1 w-[50%] md:w-full mt-2 rounded-full mx-auto md:mx-0"
             style={{ backgroundColor: 'var(--wise-green)' }}
           />
        </h1>
      </div>

      {models && models.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {modelsWithCounts.map((model: any) => (
            <ModelCard
              key={model.id}
              model={model}
              categorySlug={category.slug}
              categoryImage={category.image_url}
              articleCount={model.articleCount}
            />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {articles.map((article: any) => (
            <ProductCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div 
          className="flex flex-col items-center justify-center py-24 text-center h-[40vh]"
          style={{ borderRadius: '30px', boxShadow: 'var(--wise-ring)' }}
        >
          <div 
            className="h-16 w-16 mb-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--wise-mint)' }}
          >
            <ShoppingBag className="h-8 w-8" style={{ color: 'var(--wise-dark-green)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>Bientôt disponible</h2>
          <p className="max-w-sm text-sm" style={{ color: 'var(--wise-gray)' }}>
            Aucun article n'a encore été ajouté à cette catégorie. Revenez plus tard !
          </p>
        </div>
      )}
    </main>
  )
}
