import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/store/product-card"

export default async function BoutiquePage() {
  const supabase = (await createClient()) as any

  // Fetch all published articles
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
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-6 md:mb-8 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-black font-display uppercase inline-block relative">
           Boutique
           <div className="h-0.5 w-[40%] bg-gradient-to-r from-rose-400 to-orange-400 mx-auto md:mx-0 md:w-full mt-1.5 rounded-full md:absolute md:-bottom-2 md:left-0 md:h-1"></div>
        </h1>
        <p className="text-muted-foreground mt-3 md:mt-4 text-sm md:text-base">Découvrez tous nos articles et nouveautés</p>
      </div>

      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 lg:gap-8">
          {articles.map((article: any) => (
            <ProductCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-muted/10 h-[40vh]">
          <h2 className="text-xl font-semibold mb-2">Bientôt disponible</h2>
          <p className="text-muted-foreground max-w-sm">
            Aucun article n'est disponible pour le moment. Revenez plus tard !
          </p>
        </div>
      )}
    </main>
  )
}
