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
      <div className="mb-6 md:mb-8 space-y-4">
        <div className="flex items-center flex-wrap gap-2 text-xs md:text-sm text-muted-foreground w-full">
          <Link href="/" className="hover:text-foreground transition-colors shrink-0">
            Accueil
          </Link>
          <ChevronRight className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
          <Link href={`/category/${article.category?.slug}`} className="hover:text-foreground transition-colors capitalize shrink-0 truncate max-w-[100px] md:max-w-none">
            {article.category?.name}
          </Link>
          {article.model && (
            <>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
              <Link href={`/category/${article.category?.slug}/${article.model_id}`} className="hover:text-foreground transition-colors capitalize shrink-0 truncate max-w-[100px] md:max-w-none">
                {article.model.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[120px] sm:max-w-[180px] md:max-w-[250px]">{article.title}</span>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 md:gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-3 md:space-y-4 -mx-4 md:mx-0 px-4 md:px-0">
          <div className="aspect-[4/5] relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm flex items-center justify-center">
            {sortedPhotos[0] ? (
              <img 
                src={sortedPhotos[0].photo_url} 
                alt={article.title}
                className="w-full h-full object-contain p-2"
              />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                </div>
            )}
          </div>
          {sortedPhotos.length > 1 && (
            <div className="grid grid-cols-4 gap-2.5">
              {sortedPhotos.map((photo: any, idx: number) => (
                 <div key={idx} className="aspect-square relative rounded-[10px] md:rounded-xl overflow-hidden bg-white border border-gray-100 cursor-pointer hover:border-black transition-colors shadow-sm flex items-center justify-center">
                    <img 
                      src={photo.photo_url} 
                      alt={`${article.title} - ${idx}`}
                      className="w-full h-full object-contain p-1"
                    />
                 </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Info & Add to Cart */}
        <div className="px-1 md:px-0 mt-2 md:mt-2">
           <div className="mb-6 md:mb-8">
             <h1 className="text-2xl md:text-3xl font-black mb-2.5 text-gray-900 leading-tight tracking-tight break-words">{article.title}</h1>
             <p className="text-xl md:text-2xl font-black mb-4 md:mb-6">
               {article.is_on_sale ? (
                 <span className="flex items-center flex-wrap gap-2">
                  <span className="text-red-500">{(article.base_price * (1 - (article.sale_percentage||0)/100)).toFixed(0)} DA</span>
                  <span className="text-gray-400 line-through text-sm md:text-lg font-medium">{article.base_price} DA</span>
                 </span>
               ) : (
                  <span>{article.base_price} DA</span>
               )}
             </p>
             {article.description && (
                <p className="text-gray-600 font-medium whitespace-pre-wrap text-[15px] leading-relaxed break-words break-all">{article.description}</p>
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
