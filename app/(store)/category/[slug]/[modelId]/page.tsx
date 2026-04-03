import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/store/product-card"
import { ShoppingBag, ChevronRight } from "lucide-react"
import Link from "next/link"

export default async function ModelPage({ 
  params 
}: { 
  params: Promise<{ slug: string; modelId: string }>
}) {
  const supabase = (await createClient()) as any
  const resolvedParams = await params

  // 1. Fetch category by slug
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single()

  if (!category) {
    notFound()
  }

  // 2. Fetch current model
  const { data: model } = await supabase
    .from("models")
    .select("*")
    .eq("id", resolvedParams.modelId)
    .single()

  if (!model) {
    notFound()
  }

  // 3. Fetch articles
  const { data: articles } = await supabase
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
    .eq("model_id", model.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href={`/category/${category.slug}`} className="hover:text-foreground transition-colors capitalize">
            {category.name}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground font-medium capitalize">{model.name}</span>
        </div>
        
        <h1 className="text-3xl font-bold capitalize">{category.name} - {model.name}</h1>
        <p className="text-muted-foreground">{articles?.length || 0} Article(s)</p>
      </div>

      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {articles.map((article: any) => (
            <ProductCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-muted/10 h-[40vh]">
          <div className="h-16 w-16 mb-4 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Bientôt disponible</h2>
          <p className="text-muted-foreground max-w-sm">
            Aucun article n'a encore été ajouté à ce modèle. Revenez plus tard !
          </p>
        </div>
      )}
    </main>
  )
}
