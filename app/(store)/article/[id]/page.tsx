import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ShoppingBag, ChevronRight } from "lucide-react"
import Link from "next/link"
import { AddToCartForm } from "@/components/store/add-to-cart-form"
import { ProductGallery } from "@/components/store/product-gallery"

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
      {/* Breadcrumb */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center flex-wrap gap-2 text-xs md:text-sm w-full">
          <Link href="/" className="transition-colors duration-200 hover:text-[#163300]" style={{ color: 'var(--wise-gray)', fontFeatureSettings: '"calt"' }}>
            Accueil
          </Link>
          <ChevronRight className="h-3 w-3 md:h-4 md:w-4 shrink-0" style={{ color: 'var(--wise-green)' }} />
          <Link 
            href={`/category/${article.category?.slug}`} 
            className="capitalize shrink-0 truncate max-w-[100px] md:max-w-none transition-colors duration-200 hover:text-[#163300]"
            style={{ color: 'var(--wise-gray)', fontFeatureSettings: '"calt"' }}
          >
            {article.category?.name}
          </Link>
          {article.model && (
            <>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 shrink-0" style={{ color: 'var(--wise-green)' }} />
              <Link 
                href={`/category/${article.category?.slug}/${article.model_id}`} 
                className="capitalize shrink-0 truncate max-w-[100px] md:max-w-none transition-colors duration-200 hover:text-[#163300]"
                style={{ color: 'var(--wise-gray)', fontFeatureSettings: '"calt"' }}
              >
                {article.model.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 md:h-4 md:w-4 shrink-0" style={{ color: 'var(--wise-green)' }} />
          <span className="font-semibold truncate max-w-[120px] sm:max-w-[180px] md:max-w-[250px]" style={{ color: 'var(--wise-black)' }}>{article.title}</span>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-14">
        {/* Gallery */}
        <ProductGallery 
          photos={sortedPhotos} 
          title={article.title} 
          isOnSale={article.is_on_sale} 
          salePercentage={article.sale_percentage} 
        />

        
        {/* Info & Add to Cart */}
        <div className="px-1 md:px-0 mt-2 md:mt-2">
           <div className="mb-6 md:mb-8">
             {article.category?.name && (
               <span 
                 className="inline-block text-[11px] font-semibold uppercase tracking-wider mb-3 px-3 py-1 rounded-[9999px]"
                 style={{ backgroundColor: 'var(--wise-mint)', color: 'var(--wise-dark-green)', fontFeatureSettings: '"calt"' }}
               >
                 {article.category.name}
               </span>
             )}
             
             <h1 
               className="text-2xl md:text-3xl font-bold mb-4 leading-tight tracking-tight break-words"
               style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}
             >
               {article.title}
             </h1>
             
             <p className="text-xl md:text-2xl font-bold mb-5">
               {article.is_on_sale ? (
                 <span className="flex items-center flex-wrap gap-2.5">
                  <span style={{ color: 'var(--wise-dark-green)' }}>{(article.base_price * (1 - (article.sale_percentage||0)/100)).toFixed(0)} DA</span>
                  <span className="line-through text-sm md:text-lg font-medium" style={{ color: 'var(--wise-gray)' }}>{article.base_price} DA</span>
                 </span>
               ) : (
                  <span style={{ color: 'var(--wise-black)' }}>{article.base_price} DA</span>
               )}
             </p>
             
             {article.description && (
                <p 
                  className="whitespace-pre-wrap text-[15px] leading-relaxed break-words"
                  style={{ color: 'var(--wise-warm-dark)', fontFeatureSettings: '"calt"' }}
                >
                  {article.description}
                </p>
             )}
           </div>
           
           <div className="space-y-6 pt-6" style={{ borderTop: '1px solid rgba(14,15,12,0.08)' }}>
              <AddToCartForm article={article} />
           </div>
        </div>
      </div>
    </main>
  )
}
