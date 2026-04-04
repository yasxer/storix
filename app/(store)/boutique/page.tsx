import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Heart, ArrowRight } from "lucide-react"

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
    <main className="min-h-screen bg-[#F3F4F6] py-6 md:py-10 px-4 md:px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 grid-flow-row-dense auto-rows-max">
          
          {/* Bento Block 1: The Header (Spans 2 columns) */}
          <div className="md:col-span-3 lg:col-span-4 rounded-[2rem] bg-white p-8 md:p-10 flex flex-col justify-center relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-500 min-h-[250px]">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50/80 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-block py-1.5 px-4 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold tracking-widest uppercase mb-5">
                  Collection {new Date().getFullYear()}
                </span>
                <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight leading-[1.1]">
                  Trouvez votre style.
                </h1>
                <p className="text-slate-500 max-w-sm text-sm md:text-base">
                  Découvrez des pièces soigneusement sélectionnées pour vous démarquer.
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-black cursor-pointer w-fit group bg-slate-50 px-5 py-3 rounded-full border border-slate-100 hover:border-slate-200 transition-all">
                Filtrer par catégories
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Products Loop */}
          {articles && articles.length > 0 ? (
            articles.map((article: any, index: number) => {
              // Create a varied grid effect
              const isLarge = index === 3; // Make the 4th product larger (span 2 cols, 2 rows)
              const isHorizontal = index === 6; // Make the 7th product span 2 cols horizontally
              
              const photo = article.photos?.[0]?.photo_url || null
              const displayPrice = article.sizes?.[0]?.price_override ?? article.base_price
              const salePrice = article.is_on_sale
                ? displayPrice * (1 - (article.sale_percentage || 0) / 100)
                : null

              const totalStock = article.sizes?.reduce((sum: number, size: any) => {
                const sizeStock = size.colors?.reduce((colorSum: number, color: any) => colorSum + (color.quantity || 0), 0) || 0;
                return sum + sizeStock;
              }, 0) ?? 0;
              const hasSizes = article.sizes && article.sizes.length > 0;
              const isSoldOut = hasSizes && totalStock <= 0;

              // Base classes for bento cards
              let cardClasses = `group flex relative bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 place-self-stretch w-full ${isSoldOut ? 'opacity-80' : ''}`;
              
              if (isLarge) {
                cardClasses += " md:col-span-2 md:row-span-2 flex-col";
              } else if (isHorizontal) {
                cardClasses += " md:col-span-2 flex-col md:flex-row items-center";
              } else {
                cardClasses += " flex-col";
              }

              return (
                <Link href={`/article/${article.id}`} key={article.id} className={cardClasses}>
                  
                  {/* Image Container */}
                  <div className={`relative flex items-center justify-center p-6 ${isLarge ? 'h-[400px]' : isHorizontal ? 'h-[250px] w-full md:w-1/2' : 'h-[280px]'} ${isSoldOut ? 'bg-slate-100' : 'bg-slate-50'} overflow-hidden`}>
                    
                    {/* Background blob for style */}
                    <div className="absolute inset-0 bg-slate-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    {isSoldOut && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/30 backdrop-blur-sm">
                         <span className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold tracking-widest uppercase text-xs shadow-lg">
                            Épuisé
                         </span>
                      </div>
                    )}
                    
                    {article.is_on_sale && !isSoldOut && (
                       <span className="absolute top-4 left-4 z-10 bg-[#FF6B6B] text-white text-[11px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm">
                         -{article.sale_percentage}%
                       </span>
                    )}

                    <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-rose-500 hover:scale-110 transition-all">
                      <Heart className="w-5 h-5" />
                    </button>

                    {photo ? (
                      <img 
                        src={photo} 
                        alt={article.title} 
                        className={`w-full h-full object-contain transition-transform duration-700 ease-out ${isSoldOut ? 'grayscale mix-blend-normal' : 'mix-blend-multiply group-hover:scale-110'}`} 
                      />
                    ) : (
                       <span className="text-4xl text-slate-300 font-black opacity-20">{article.title.charAt(0)}</span>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className={`p-6 md:p-8 flex flex-col justify-end flex-grow ${isHorizontal ? 'w-full md:w-1/2' : ''}`}>
                    {article.category?.name && (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        {article.category.name}
                      </span>
                    )}
                    
                    <h3 className={`font-bold text-slate-800 line-clamp-2 leading-snug mb-3 ${isLarge ? 'text-2xl' : 'text-lg'}`} dir="auto">
                      {article.title}
                    </h3>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-medium block mb-1">Prix</span>
                        <div className={`font-black tracking-tight text-slate-900 ${isLarge ? 'text-3xl' : 'text-xl'}`}>
                          {article.is_on_sale ? (
                            <div className="flex items-center gap-3">
                              <span className="text-rose-500">{Math.round(salePrice!)} DA</span>
                              <span className="text-sm text-slate-400 line-through font-medium">{displayPrice} DA</span>
                            </div>
                          ) : (
                            <span>{displayPrice} DA</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-slate-700 transition-colors shadow-md">
                        <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-1 md:col-span-3 lg:col-span-4 flex flex-col items-center justify-center py-32 text-center rounded-[2rem] bg-white shadow-sm border border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-slate-800">Boutique en préparation</h2>
              <p className="text-slate-500 max-w-sm">
                Nos nouveaux articles arrivent très bientôt. Restez connectés !
              </p>
            </div>
          )}
          
        </div>
      </div>
    </main>
  )
}
