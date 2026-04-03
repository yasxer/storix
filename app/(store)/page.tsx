import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ProductCard } from "@/components/store/product-card"
import { ShoppingBag } from "lucide-react"
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

  // Fetch products (max 12 config)
  // According to spec: 1. on_sale, 2. featured, 3. best sellers, 4. random.
  // For now: order by is_on_sale DESC, is_featured DESC, created_at DESC
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
    .limit(12)

  // Gather all hero images
  const heroImages = [
    settings?.hero_image_url,
    settings?.hero_image_url_2,
    settings?.hero_image_url_3,
    settings?.hero_image_url_4
  ].filter(Boolean)

  return (
    <div className="bg-white min-h-screen">
      {/* Top Header Placeholder corresponding to 'Mitra BeliBeli | About BeliBeli | BeliBeli Care | Promo | Sign Up | Login' */}

      {/* Hero Section */}
      <section className="px-3 py-3 md:px-4 md:py-6">
        <div className="container mx-auto">
          <div className="relative rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden w-full min-h-[400px] sm:min-h-[450px] md:min-h-[600px] flex items-end md:items-center bg-gray-900 shadow-2xl group">
             {/* Background Image full cover with slider component */}
             <HeroSlider images={heroImages} />
             
             {/* Dark gradient overlay to make text pop - From bottom for mobile, right for desktop */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent md:bg-gradient-to-r md:from-black/90 md:via-black/50 md:to-transparent z-[5] pointer-events-none"></div>

             {/* Subtle color overlay */}
             <div className="absolute inset-0 bg-blue-900/10 md:bg-blue-900/5 mix-blend-overlay z-[5] pointer-events-none"></div>

             {/* Text Content over the image */}
             <div className="relative z-10 w-full max-w-2xl p-6 sm:p-8 md:p-16 lg:p-24 text-left">
              <span className="inline-block text-white font-bold mb-3 md:mb-4 text-[10px] md:text-sm tracking-widest uppercase bg-gradient-to-r from-rose-500/95 to-orange-500/95 backdrop-blur-md py-1.5 px-3 md:px-4 rounded-full w-max shadow-sm border border-white/20">
                🔥 NOUVEAUTÉ
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-3 md:mb-6 leading-[1.05] font-display drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" dir="auto">
                {settings?.hero_banner_text || "Découvrez notre collection"}
              </h1>
              <p className="text-gray-200 text-sm sm:text-lg md:text-xl md:text-2xl mb-6 md:mb-10 font-medium max-w-[85%] md:max-w-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2 md:line-clamp-none">
                 {settings?.hero_subtitle || "Des offres exceptionnelles sur vos marques préférées"}
              </p>
              <div className="flex gap-4">
                <Link 
                  href={settings?.hero_cta_link || "/boutique"}
                  className="inline-flex items-center bg-white/95 backdrop-blur-sm text-black px-7 py-3 md:px-10 md:py-4 rounded-full font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:-translate-y-1 text-sm md:text-base uppercase tracking-wider group"
                >
                  {settings?.hero_cta_text || "Shop Now"}
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid - Compact & Elegant */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto py-8">
          <div className="px-4 mb-6 md:mb-8 text-center md:text-left md:flex md:justify-center">
            <h2 className="text-xl md:text-2xl font-black font-display text-gray-900 uppercase tracking-wide inline-block relative">
              Découvrez nos catégories
              <div className="h-0.5 w-[40%] bg-gradient-to-r from-rose-400 to-orange-400 mx-auto md:mx-0 md:w-full mt-2 rounded-full md:absolute md:-bottom-2 md:left-0 md:h-1"></div>
            </h2>
          </div>
          
          <div className="grid grid-cols-4 md:flex md:flex-wrap items-start justify-center gap-4 md:gap-8">
            {categories.map((cat: any) => (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 md:gap-3 group"
              >
                <div className="w-[60px] h-[60px] md:w-20 md:h-20 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-rose-200 group-hover:bg-rose-50/30 shadow-[0_2px_10px_rgba(0,0,0,0.02)] group-hover:shadow-[0_8px_20px_rgba(225,29,72,0.1)] transition-all overflow-hidden p-3 relative mx-auto">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out" />
                  ) : (
                    <span className="text-xl md:text-2xl font-bold text-gray-400 font-display group-hover:text-rose-500 transition-colors">
                      {cat.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-[11px] md:text-sm font-semibold text-gray-600 group-hover:text-rose-600 tracking-wide text-center leading-tight transition-colors" dir="auto">{cat.name}</span>
              </Link>
            ))}
            {/* "All Category" Button */}
            <Link 
                href={`/boutique`}
                className="flex flex-col items-center gap-2 md:gap-3 group"
              >
                <div className="w-[60px] h-[60px] md:w-20 md:h-20 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-black group-hover:bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all relative mx-auto">
                  <div className="w-5 h-5 md:w-6 md:h-6 grid grid-cols-2 gap-0.5 md:gap-1 cursor-pointer opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-800 rounded-[2px] group-hover:bg-black transition-colors"></div>
                    <div className="bg-gray-800 rounded-[2px] group-hover:bg-black transition-colors"></div>
                    <div className="bg-gray-800 rounded-[2px] group-hover:bg-black transition-colors"></div>
                    <div className="bg-gray-800 rounded-[2px] group-hover:bg-black transition-colors"></div>
                  </div>
                </div>
                <span className="text-[11px] md:text-sm font-semibold text-gray-600 group-hover:text-black tracking-wide text-center transition-colors">Toutes</span>
            </Link>
          </div>
        </section>
      )}

      {/* Main Products Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-10 gap-5">
          <h2 className="text-2xl md:text-3xl font-black font-display text-gray-900 relative">
            Notre Sélection
            <span className="absolute -bottom-1.5 left-0 w-1/3 h-1 bg-gradient-to-r from-rose-400 to-orange-400 rounded-full hidden md:block"></span>
          </h2>
          <div className="w-full md:w-auto flex flex-wrap justify-center gap-2 md:gap-x-2 border border-gray-100 md:border-gray-200 rounded-2xl md:rounded-full p-1.5 md:p-1 bg-gray-50 shadow-sm md:shadow-inner">
             <button className="px-5 py-2 md:px-6 flex-1 md:flex-none rounded-[10px] md:rounded-full bg-black text-white text-[13px] md:text-sm font-semibold transition-colors shadow-sm">Populaires</button>
             <button className="px-5 py-2 md:px-6 flex-1 md:flex-none text-gray-600 hover:text-black bg-white hover:bg-white rounded-[10px] md:rounded-full text-[13px] md:text-sm font-medium transition-colors border border-gray-100 md:border-none shadow-sm md:shadow-none">Nouveautés</button>
             <button className="px-5 py-2 md:px-6 w-full md:w-auto flex-none text-gray-600 hover:text-black bg-gray-100/50 hover:bg-white rounded-[10px] md:rounded-full text-[13px] md:text-sm font-medium transition-colors border border-transparent md:border-none md:mr-0 mt-1 md:mt-0">Promotions</button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 mt-2 md:mt-0">
            {articles && articles.map((article: any) => (
              <ProductCard key={article.id} article={article} />
            ))}
        </div>
        
        {articles && articles.length > 0 && (
          <div className="mt-10 md:mt-16 text-center">
            <Link 
              href="/boutique"
              className="inline-flex items-center justify-center bg-white text-black border-[1.5px] border-black/80 px-8 md:px-10 py-3 md:py-3.5 rounded-full font-bold hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-widest text-[11px] sm:text-xs md:text-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] group"
            >
              Voir tous les produits
              <svg className="w-4 h-4 md:w-5 md:h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </section>

    </div>
  )
}

