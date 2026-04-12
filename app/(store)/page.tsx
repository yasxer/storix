import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ProductCard } from "@/components/store/product-card"
import { ArrowRight, ArrowUpRight, Truck, Shield, RotateCcw, Sparkles } from "lucide-react"
import { HeroSlider } from "@/components/store/hero-slider"
import { HomepageAnimations } from "@/components/store/homepage-animations"

export default async function StoreHomepage() {
  const supabase = (await createClient()) as any
  
  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .single()

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true })

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

  const heroImages = [
    settings?.hero_image_url,
    settings?.hero_image_url_2,
    settings?.hero_image_url_3,
    settings?.hero_image_url_4
  ].filter(Boolean)

  // Split articles for different sections
  const featuredArticle = articles?.[0]
  const spotlightArticles = articles?.slice(1, 5) || []
  const restArticles = articles?.slice(5) || []

  const featuredPhoto = featuredArticle?.photos?.[0]?.photo_url
  const featuredPrice = featuredArticle?.sizes?.[0]?.price_override ?? featuredArticle?.base_price

  return (
    <div className="min-h-screen bg-white">
      <HomepageAnimations />

      {/* ═══════════════════════════════════════════
          SECTION 1: MEGA HERO
          Full viewport, massive text, floating product
          ═══════════════════════════════════════════ */}
      <section className="relative w-full min-h-[100svh] md:min-h-[90vh] flex items-end md:items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <HeroSlider images={heroImages} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f0c] via-[#0e0f0c]/60 to-transparent md:bg-gradient-to-r md:from-[#0e0f0c]/90 md:via-[#0e0f0c]/50 md:to-transparent z-10" />
        </div>

        {/* Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-5 md:px-8 pb-12 md:pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-16">
            
            {/* Left: Text */}
            <div className="max-w-2xl">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[9999px] mb-6 hero-fade-in"
                style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)' }}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ fontFeatureSettings: '"calt"' }}>
                  Nouvelle Collection
                </span>
              </div>

              <h1 
                className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[0.9] tracking-tight mb-6 hero-fade-in"
                style={{ fontFeatureSettings: '"calt"', animationDelay: '0.1s' }}
              >
                {settings?.hero_banner_text || "Redéfinissez votre style."}
              </h1>
              
              <p 
                className="text-white/70 text-base md:text-xl font-medium leading-relaxed mb-10 max-w-lg hero-fade-in"
                style={{ fontFeatureSettings: '"calt"', animationDelay: '0.2s' }}
              >
                {settings?.hero_subtitle || "Des collections exclusives pensées pour l'élégance et le confort du quotidien."}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 hero-fade-in" style={{ animationDelay: '0.3s' }}>
                <Link 
                  href={settings?.hero_cta_link || "/boutique"}
                  className="group inline-flex items-center gap-3 px-7 py-4 rounded-[9999px] font-semibold transition-transform duration-200 hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)', fontFeatureSettings: '"calt"' }}
                >
                  <span className="text-base">{settings?.hero_cta_text || "Explorer la boutique"}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45" style={{ backgroundColor: 'var(--wise-dark-green)', color: 'var(--wise-green)' }}>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
                
                <Link 
                  href="/boutique"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-[9999px] font-semibold text-white/90 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                  style={{ border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
                >
                  Voir le catalogue
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 hero-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1">
            <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: SCROLLING MARQUEE
          Auto-scrolling category names
          ═══════════════════════════════════════════ */}
      {categories && categories.length > 0 && (
        <section className="py-6 md:py-8 overflow-hidden" style={{ borderBottom: '1px solid rgba(14,15,12,0.08)' }}>
          <div className="marquee-container">
            <div className="marquee-track">
              {[...categories, ...categories, ...categories].map((cat: any, i: number) => (
                <Link
                  key={`${cat.id}-${i}`}
                  href={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-3 mx-4 md:mx-6 whitespace-nowrap group"
                >
                  {cat.image_url ? (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex-shrink-0 transition-transform duration-300 group-hover:scale-110" style={{ boxShadow: 'var(--wise-ring)' }}>
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--wise-green)' }} />
                  )}
                  <span 
                    className="text-lg md:text-xl font-semibold transition-colors duration-200 group-hover:text-[#163300]"
                    style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}
                  >
                    {cat.name}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--wise-mint)', color: 'var(--wise-dark-green)' }}>
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SECTION 3: FEATURED PRODUCT SPOTLIGHT
          One big product + 4 smaller ones in asymmetric grid
          ═══════════════════════════════════════════ */}
      {featuredArticle && (
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-20">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--wise-green)', fontFeatureSettings: '"calt"' }}>
                Sélection du moment
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
                Tendance Actuelle
              </h2>
            </div>
            <Link 
              href="/boutique" 
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-[9999px] font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(22,51,0,0.06)', color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}
            >
              Tout voir <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-6">
            {/* Big Featured Card */}
            <Link 
              href={`/article/${featuredArticle.id}`}
              className="col-span-2 md:col-span-7 group relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ borderRadius: '30px', boxShadow: 'var(--wise-ring)', background: '#ffffff', minHeight: '480px' }}
            >
              <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#fafaf8' }}>
                {featuredPhoto && (
                  <img 
                    src={featuredPhoto} 
                    alt={featuredArticle.title} 
                    className="w-full h-full object-contain p-8 md:p-12 transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </div>
              
              {/* Green arrow on hover */}
              <div 
                className="absolute top-5 right-5 z-10 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100"
                style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)' }}
              >
                <ArrowUpRight className="w-5 h-5" />
              </div>

              {/* Sale badge */}
              {featuredArticle.is_on_sale && (
                <span 
                  className="absolute top-5 left-5 z-10 text-xs font-bold px-4 py-2 rounded-[9999px] uppercase tracking-wider"
                  style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)' }}
                >
                  -{featuredArticle.sale_percentage}%
                </span>
              )}

              {/* Bottom info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-white via-white/95 to-transparent">
                <span className="text-[11px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--wise-gray)' }}>
                  {featuredArticle.category?.name || 'Produit vedette'}
                </span>
                <h3 className="text-xl md:text-2xl font-bold mb-2 line-clamp-1" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }} dir="auto">
                  {featuredArticle.title}
                </h3>
                <div className="text-lg md:text-xl font-bold" style={{ color: 'var(--wise-dark-green)' }}>
                  {featuredPrice} DA
                </div>
              </div>
            </Link>

            {/* Smaller cards grid */}
            <div className="col-span-2 md:col-span-5 grid grid-cols-2 gap-4 md:gap-6">
              {spotlightArticles.map((article: any) => (
                <ProductCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SECTION 4: VALUE PROPOSITIONS
          3 cards: Delivery, Quality, Returns
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: Truck, title: "Livraison rapide", desc: "Livraison à domicile partout en Algérie" },
            { icon: Shield, title: "Qualité garantie", desc: "Des produits sélectionnés avec soin" },
            { icon: RotateCcw, title: "Échange facile", desc: "Processus d'échange simple et rapide" },
          ].map((item, i) => (
            <div 
              key={i} 
              className="flex items-center gap-4 md:gap-5 p-5 md:p-6 transition-all duration-300 hover:-translate-y-1"
              style={{ borderRadius: '20px', boxShadow: 'var(--wise-ring)', background: '#ffffff' }}
            >
              <div 
                className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--wise-mint)', color: 'var(--wise-dark-green)' }}
              >
                <item.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base mb-0.5" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm" style={{ color: 'var(--wise-gray)' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5: CATEGORIES SHOWCASE
          Large visual category cards
          ═══════════════════════════════════════════ */}
      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-16">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
              Nos catégories
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {categories.map((cat: any) => (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`}
                className="group relative overflow-hidden flex flex-col justify-end transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                style={{ borderRadius: '24px', boxShadow: 'var(--wise-ring)', minHeight: '180px', background: '#fafaf8' }}
              >
                {/* Category image */}
                {cat.image_url && (
                  <img 
                    src={cat.image_url} 
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f0c]/80 via-[#0e0f0c]/20 to-transparent z-10" />
                
                {/* Content */}
                <div className="relative z-20 p-5 flex items-end justify-between">
                  <div>
                    <span className="text-white font-semibold text-sm md:text-base block" style={{ fontFeatureSettings: '"calt"' }}>
                      {cat.name}
                    </span>
                  </div>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100"
                    style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)' }}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SECTION 6: MORE PRODUCTS GRID
          Clean 4-column product grid
          ═══════════════════════════════════════════ */}
      {restArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-16">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
              Découvrez aussi
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {restArticles.map((article: any) => (
              <ProductCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          SECTION 7: FULL-WIDTH GREEN CTA BANNER
          Final push to action
          ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12 mb-8">
        <div 
          className="relative overflow-hidden p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12"
          style={{ borderRadius: '40px', backgroundColor: 'var(--wise-black)' }}
        >
          {/* Decorative green blob */}
          <div className="absolute -right-20 -top-20 w-[300px] h-[300px] rounded-full opacity-20" style={{ backgroundColor: 'var(--wise-green)', filter: 'blur(80px)' }} />
          <div className="absolute -left-10 -bottom-10 w-[200px] h-[200px] rounded-full opacity-10" style={{ backgroundColor: 'var(--wise-green)', filter: 'blur(60px)' }} />
          
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 tracking-tight" style={{ fontFeatureSettings: '"calt"' }}>
              Prêt à découvrir notre collection ?
            </h2>
            <p className="text-sm md:text-base font-medium" style={{ color: 'var(--wise-gray)' }}>
              Des centaines de produits sélectionnés pour vous.
            </p>
          </div>
          
          <Link 
            href="/boutique"
            className="relative z-10 group inline-flex items-center gap-3 px-8 py-4 rounded-[9999px] font-semibold transition-transform duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
            style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)', fontFeatureSettings: '"calt"' }}
          >
            <span className="text-base">Voir la boutique</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45" style={{ backgroundColor: 'var(--wise-dark-green)', color: 'var(--wise-green)' }}>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="md:hidden text-center px-5 pb-6">
        <Link 
          href="/boutique"
          className="inline-flex items-center justify-center w-full py-4 font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ 
            borderRadius: '9999px', 
            backgroundColor: 'var(--wise-green)', 
            color: 'var(--wise-dark-green)',
            fontFeatureSettings: '"calt"',
          }}
        >
          Voir tout le catalogue
        </Link>
      </div>
    </div>
  )
}
