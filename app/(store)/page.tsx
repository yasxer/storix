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
      <section className="px-4 py-4 md:py-6">
        <div className="container mx-auto">
          <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden w-full min-h-[450px] md:min-h-[600px] flex items-center bg-gray-900 shadow-xl group">
             {/* Background Image full cover with slider component */}
             <HeroSlider images={heroImages} />
             
             {/* Dark gradient overlay to make text pop */}
             <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-[5] pointer-events-none"></div>

             {/* Text Content over the image */}
             <div className="relative z-10 w-full max-w-2xl p-8 md:p-16 lg:p-24 text-left">
              <span className="inline-block text-white font-bold mb-4 text-xs md:text-sm tracking-widest uppercase bg-red-500/90 backdrop-blur-sm py-1.5 px-4 rounded-full w-max shadow-sm">
                🔥 NOUVEAUTÉ
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] font-display drop-shadow-lg" dir="auto">
                {settings?.hero_banner_text || "Découvrez notre collection"}
              </h1>
              <p className="text-gray-200 text-lg md:text-xl md:text-2xl mb-10 font-medium max-w-lg drop-shadow-md">
                 {settings?.hero_subtitle || "Des offres exceptionnelles sur vos marques préférées"}
              </p>
              <div className="flex gap-4">
                <Link 
                  href={settings?.hero_cta_link || "/boutique"}
                  className="inline-flex bg-white text-black px-8 py-3.5 md:px-10 md:py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-1 text-sm md:text-base uppercase tracking-wider"
                >
                  {settings?.hero_cta_text || "Shop Now"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid - Compact & Elegant */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-xl md:text-2xl font-black font-display text-gray-900 text-center mb-8 uppercase tracking-wide">Découvrez nos catégories</h2>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {categories.map((cat: any) => (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-black group-hover:bg-white group-hover:shadow-md transition-all overflow-hidden p-2.5">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <span className="text-lg md:text-xl font-bold text-gray-400 font-display group-hover:text-black">
                      {cat.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-black tracking-wide" dir="auto">{cat.name}</span>
              </Link>
            ))}
            {/* "All Category" Button */}
            <Link 
                href={`/boutique`}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-black group-hover:bg-white group-hover:shadow-md transition-all">
                  <div className="w-5 h-5 grid grid-cols-2 gap-0.5 cursor-pointer opacity-70 group-hover:opacity-100">
                    <div className="bg-gray-600 rounded-sm group-hover:bg-black transition-colors"></div>
                    <div className="bg-gray-600 rounded-sm group-hover:bg-black transition-colors"></div>
                    <div className="bg-gray-600 rounded-sm group-hover:bg-black transition-colors"></div>
                    <div className="bg-gray-600 rounded-sm group-hover:bg-black transition-colors"></div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-black tracking-wide">Toutes</span>
            </Link>
          </div>
        </section>
      )}

      {/* Main Products Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <h2 className="text-2xl md:text-3xl font-black font-display text-gray-900">Notre Sélection</h2>
          <div className="flex flex-wrap justify-center gap-2 border border-gray-200 rounded-full p-1 bg-gray-50 shadow-sm">
             <button className="px-5 py-2 rounded-full bg-black text-white text-sm font-medium transition-colors">Populaires</button>
             <button className="px-5 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full text-sm font-medium transition-colors">Nouveautés</button>
             <button className="px-5 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full text-sm font-medium transition-colors">Promotions</button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {articles && articles.map((article: any) => (
              <ProductCard key={article.id} article={article} />
            ))}
        </div>
        
        {articles && articles.length > 0 && (
          <div className="mt-16 text-center">
            <Link 
              href="/boutique"
              className="inline-block bg-white text-black border-2 border-black px-10 py-3 rounded-full font-bold hover:bg-black hover:text-white transition-colors uppercase tracking-wider text-sm"
            >
              Voir tous les produits
            </Link>
          </div>
        )}
      </section>

    </div>
  )
}

