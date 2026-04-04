import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ProductCard } from "@/components/store/product-card"
import { ArrowRight, Sparkles, Zap, Grid3X3 } from "lucide-react"
import { HeroSlider } from "@/components/store/hero-slider"

export default async function StoreHomepage() {
  const supabase = (await createClient()) as any
  
  // Fetch store settings
  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .single()

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true })

  // Fetch products (max 8 for a clean bento grid)
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
    .order("is_on_sale", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(8)

  // Gather all hero images
  const heroImages = [
    settings?.hero_image_url,
    settings?.hero_image_url_2,
    settings?.hero_image_url_3,
    settings?.hero_image_url_4
  ].filter(Boolean)

  return (
    <div className="bg-[#F3F4F6] min-h-screen py-4 md:py-6 px-4 md:px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-12">
        
        {/* HERO SECTION - FULL BACKGROUND WITH TEXT OVERLAY ON THE LEFT (Professional & Minimalist) */}
        <section className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden aspect-[4/5] sm:aspect-video lg:aspect-[2.5/1] xl:h-[650px] flex flex-col justify-end md:justify-center items-start text-left group shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-slate-900 w-full">
           <HeroSlider images={heroImages} />
           
           {/* Dark gradient overlay starting from bottom/left for text readability */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent transition-colors duration-700 z-10 pointer-events-none"></div>

           {/* Content */}
           <div className="relative z-20 p-6 md:p-16 lg:p-24 w-full flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 text-white font-bold mb-4 md:mb-6 text-[10px] md:text-xs tracking-widest uppercase border border-white/20 bg-black/20 backdrop-blur-md py-1.5 px-4 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Nouvelle Collection
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-[5.5rem] font-black font-display text-white mb-4 md:mb-6 leading-[1.05] tracking-tight drop-shadow-2xl max-w-3xl">
              {settings?.hero_banner_text || "Redéfinissez votre style."}
            </h1>
            
            <p className="text-slate-200 text-sm md:text-lg lg:text-xl mb-8 md:mb-10 max-w-xl font-medium leading-relaxed drop-shadow-lg">
               {settings?.hero_subtitle || "Des collections exclusives pensées pour l'élégance et le confort du quotidien."}
            </p>
            
            <Link 
              href={settings?.hero_cta_link || "/boutique"}
              className="inline-flex items-center justify-between min-w-[200px] bg-white text-slate-900 px-7 py-3.5 md:py-4 rounded-full font-bold hover:bg-slate-100 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 group/btn"
            >
              <span className="text-sm uppercase tracking-widest">{settings?.hero_cta_text || "Découvrir"}</span>
              <div className="w-8 h-8 ml-6 rounded-full bg-slate-900 flex items-center justify-center text-white group-hover/btn:bg-slate-700 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          </div>
        </section>

        {/* MANY CATEGORIES - CIRCULAR HORIZONTAL SCROLL FOR LARGE NUMBERS */}
        {categories && categories.length > 0 && (
          <section className="py-4">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Explorer nos catégories
              </h2>
            </div>
            
            {/* Horizontal scroll container */}
            <div className="flex overflow-x-auto gap-4 md:gap-8 pb-6 px-2 no-scrollbar md:justify-center md:flex-wrap">
              {categories.map((cat: any) => (
                <Link 
                  key={cat.id} 
                  href={`/category/${cat.slug}`}
                  className="flex flex-col items-center flex-shrink-0 group w-[80px] md:w-[100px]"
                >
                  <div className="w-[70px] h-[70px] md:w-[90px] md:h-[90px] rounded-full overflow-hidden bg-white shadow-sm border border-slate-100 group-hover:border-slate-800 transition-colors mb-3 flex items-center justify-center p-1 md:p-1.5 focus:outline-none group-focus-visible:ring-2 ring-slate-900 ring-offset-2">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 relative">
                      {cat.image_url ? (
                        <img 
                          src={cat.image_url} 
                          alt={cat.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 will-change-transform" 
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-300">
                          {cat.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] md:text-xs font-bold text-slate-600 group-hover:text-slate-900 text-center leading-tight tracking-wide uppercase px-1 w-full truncate">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* TRENDING PRODUCTS */}
        <section className="mt-8 md:mt-12">
          <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Tendance Actuelle
            </h2>
            <Link href="/boutique" className="hidden md:flex items-center text-sm font-bold text-slate-500 hover:text-black transition-colors">
              Toute la sélection <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {articles && articles.map((article: any) => (
                <div key={article.id} className="[&>a]:shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                  <ProductCard article={article} />
                </div>
              ))}
          </div>

          <div className="mt-8 md:hidden text-center">
            <Link 
              href="/boutique"
              className="inline-flex items-center justify-center bg-white text-slate-900 w-full py-4 rounded-[1.5rem] font-bold shadow-sm"
            >
              Voir tout le catalogue
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}

