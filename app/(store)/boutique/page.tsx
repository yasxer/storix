import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowUpRight, ShoppingBag } from "lucide-react"

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
    <main className="min-h-screen bg-white py-6 md:py-10 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 grid-flow-row-dense auto-rows-max">
          
          {/* Header Card */}
          <div 
            className="md:col-span-3 lg:col-span-4 p-8 md:p-10 flex flex-col justify-center relative overflow-hidden min-h-[220px]"
            style={{ borderRadius: '40px', boxShadow: 'var(--wise-ring)', background: '#ffffff' }}
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" style={{ backgroundColor: 'rgba(159,232,112,0.08)' }} />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span 
                  className="inline-block py-1.5 px-4 rounded-[9999px] text-[11px] font-semibold tracking-wider uppercase mb-5"
                  style={{ backgroundColor: 'var(--wise-mint)', color: 'var(--wise-dark-green)', fontFeatureSettings: '"calt"' }}
                >
                  Collection {new Date().getFullYear()}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-[0.95]" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
                  Trouvez votre style.
                </h1>
                <p className="max-w-sm text-sm md:text-base" style={{ color: 'var(--wise-gray)' }}>
                  Découvrez des pièces soigneusement sélectionnées pour vous démarquer.
                </p>
              </div>
            </div>
          </div>

          {/* Products Loop */}
          {articles && articles.length > 0 ? (
            articles.map((article: any, index: number) => {
              const isLarge = index === 3;
              const isHorizontal = index === 6;
              
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

              let spanClasses = "";
              if (isLarge) {
                spanClasses = "md:col-span-2 md:row-span-2";
              } else if (isHorizontal) {
                spanClasses = "md:col-span-2";
              }

              return (
                <Link 
                  href={`/article/${article.id}`} 
                  key={article.id} 
                  className={`group flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1 place-self-stretch w-full ${spanClasses} ${isSoldOut ? 'opacity-75' : ''}`}
                  style={{ borderRadius: '30px', boxShadow: 'var(--wise-ring)', background: '#ffffff' }}
                >
                  
                  {/* Image */}
                  <div 
                    className={`relative flex items-center justify-center overflow-hidden ${isLarge ? 'h-[400px]' : isHorizontal ? 'h-[280px]' : 'h-[280px]'}`}
                    style={{ backgroundColor: isSoldOut ? '#f2f2f0' : '#fafaf8' }}
                  >
                    {isSoldOut && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/30 backdrop-blur-sm">
                         <span 
                           className="px-5 py-2.5 rounded-[9999px] font-semibold tracking-wider uppercase text-xs"
                           style={{ backgroundColor: 'var(--wise-black)', color: '#ffffff' }}
                         >
                            Épuisé
                         </span>
                      </div>
                    )}
                    
                    {article.is_on_sale && !isSoldOut && (
                       <span 
                         className="absolute top-4 left-4 z-10 text-[11px] font-bold px-3.5 py-1.5 rounded-[9999px] uppercase tracking-wider"
                         style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)' }}
                       >
                         -{article.sale_percentage}%
                       </span>
                    )}

                    <div 
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100"
                      style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)' }}
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </div>

                    {photo ? (
                      <img 
                        src={photo} 
                        alt={article.title} 
                        className={`w-full h-full object-contain p-6 transition-transform duration-700 ease-out ${isSoldOut ? 'grayscale' : 'group-hover:scale-105'}`} 
                      />
                    ) : (
                       <span className="text-4xl font-bold opacity-10" style={{ color: 'var(--wise-black)' }}>{article.title.charAt(0)}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`p-5 md:p-6 flex flex-col justify-end flex-grow`}>
                    {article.category?.name && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--wise-gray)', fontFeatureSettings: '"calt"' }}>
                        {article.category.name}
                      </span>
                    )}
                    
                    <h3 
                      className={`font-semibold line-clamp-2 leading-snug mb-4 ${isLarge ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}`} 
                      style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}
                      dir="auto"
                    >
                      {article.title}
                    </h3>

                    <div className="mt-auto pt-4 flex items-end justify-between" style={{ borderTop: '1px solid rgba(14,15,12,0.08)' }}>
                      <div>
                        <span className="text-[11px] font-medium block mb-1" style={{ color: 'var(--wise-gray)' }}>Prix</span>
                        <div className={`font-bold tracking-tight ${isLarge ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`} style={{ color: 'var(--wise-black)' }}>
                          {article.is_on_sale ? (
                            <div className="flex items-center gap-2">
                              <span style={{ color: 'var(--wise-dark-green)' }}>{Math.round(salePrice!)} DA</span>
                              <span className="text-xs font-medium line-through" style={{ color: 'var(--wise-gray)' }}>{displayPrice} DA</span>
                            </div>
                          ) : (
                            <span>{displayPrice} DA</span>
                          )}
                        </div>
                      </div>
                      
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                        style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)' }}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div 
              className="col-span-1 md:col-span-3 lg:col-span-4 flex flex-col items-center justify-center py-32 text-center"
              style={{ borderRadius: '30px', boxShadow: 'var(--wise-ring)' }}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--wise-mint)' }}
              >
                <ShoppingBag className="w-8 h-8" style={{ color: 'var(--wise-dark-green)' }} />
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>Boutique en préparation</h2>
              <p style={{ color: 'var(--wise-gray)' }} className="max-w-sm">
                Nos nouveaux articles arrivent très bientôt. Restez connectés !
              </p>
            </div>
          )}
          
        </div>
      </div>
    </main>
  )
}
