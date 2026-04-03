import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ShoppingBag, ChevronRight } from "lucide-react"
import Link from "next/link"
import { AddToCartForm } from "@/components/store/add-to-cart-form"

export default async function ArticlePage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const supabase = (await createClient()) as any
  const resolvedParams = await params

  const { data: article } = await supabase
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
    .eq("id", resolvedParams.id)
    .single()

  console.log("---- ARTICLE LOG ----", { id: resolvedParams.id, article })

  if (!article) {
    notFound()
  }
  
  // Sort photos by position
  const sortedPhotos = article.photos?.sort((a: any, b: any) => (a.position || 0) - (b.position || 0)) || [];

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 space-y-4">
        <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <Link href={`/category/${article.category?.slug}`} className="hover:text-foreground transition-colors capitalize">
            {article.category?.name}
          </Link>
          {article.model && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0" />
              <Link href={`/category/${article.category?.slug}/${article.model_id}`} className="hover:text-foreground transition-colors capitalize">
                {article.model.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{article.name}</span>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] relative rounded-2xl overflow-hidden bg-muted">
            {sortedPhotos[0] ? (
              <img 
                src={sortedPhotos[0].photo_url} 
                alt={article.name}
                className="w-full h-full object-cover"
              />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                </div>
            )}
          </div>
          {sortedPhotos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {sortedPhotos.map((photo: any, idx: number) => (
                 <div key={idx} className="aspect-square relative rounded-xl overflow-hidden bg-muted cursor-pointer hover:opacity-90">
                    <img 
                      src={photo.photo_url} 
                      alt={`${article.name} - ${idx}`}
                      className="w-full h-full object-cover"
                    />
                 </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Info & Add to Cart */}
        <div>
           <div className="mb-6">
             <h1 className="text-3xl font-bold mb-2">{article.name}</h1>
             <p className="text-2xl font-semibold mb-4">
               {article.is_on_sale ? (
                 <>
                  <span className="text-red-500 mr-3">{(article.base_price * (1 - (article.sale_percentage||0)/100)).toFixed(0)} DZD</span>
                  <span className="text-gray-400 line-through text-lg">{article.base_price} DZD</span>
                 </>
               ) : (
                  <span>{article.base_price} DZD</span>
               )}
             </p>
             {article.description && (
                <p className="text-muted-foreground whitespace-pre-wrap">{article.description}</p>
             )}
           </div>
           
           <div className="space-y-6 pt-6 border-t border-gray-100">
              <AddToCartForm article={article} />
           </div>
        </div>
      </div>
    </main>
  )
}
