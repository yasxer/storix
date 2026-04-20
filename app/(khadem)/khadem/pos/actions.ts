'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function searchArticles(query: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Check if they have allowed categories
  const { data: profile } = await supabase.from('profiles').select('allowed_categories').eq('id', user.id).single()
  const allowedCategories = profile?.allowed_categories || []

  // First try exact barcode match if query is at least 2 chars
  if (query && query.length >= 2) {
    let q = supabase
      .from('articles')
      .select(`
        id, title, barcode, base_price, is_published,
        category:categories(name),
        model:models(name),
        sizes:article_sizes(
          id, size_label, is_standard, price_override,
          colors:article_size_colors(id, color_name, color_hex, quantity)
        )
      `)
      .eq('is_published', true)
      .eq('barcode', query.trim())
      .limit(1)

    if (allowedCategories && allowedCategories.length > 0) {
      q = q.in('category_id', allowedCategories)
    }
    
    let { data: products } = await q

    // If no barcode match, text search on title, charika
    if (!products || products.length === 0) {
      let q2 = supabase
        .from('articles')
        .select(`
          id, title, barcode, base_price, is_published,
          category:categories(name),
          model:models(name),
          sizes:article_sizes(
            id, size_label, is_standard, price_override,
            colors:article_size_colors(id, color_name, color_hex, quantity)
          )
        `)
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,charika.ilike.%${query}%`)
        .limit(15)
        
      if (allowedCategories && allowedCategories.length > 0) {
        q2 = q2.in('category_id', allowedCategories)
      }
      
      const { data: searchResults } = await q2
      products = searchResults
    }

    return mapProducts(products)
  }

  // If no query, return the most recent 100 available items for the initial view
  let recentQ = supabase
    .from('articles')
    .select(`
      id, title, barcode, base_price, is_published,
      category:categories(name),
      model:models(name),
      sizes:article_sizes(
        id, size_label, is_standard, price_override,
        colors:article_size_colors(id, color_name, color_hex, quantity)
      )
    `)
    .eq('is_published', true)
    
  if (allowedCategories && allowedCategories.length > 0) {
    recentQ = recentQ.in('category_id', allowedCategories)
  }
  
  const { data: recentProducts } = await recentQ
    .order('created_at', { ascending: false })
    .limit(100)

  return mapProducts(recentProducts)
}

function mapProducts(products: any[] | null) {
  // Map to a friendlier format for POS
  // Filter out sizes/colors with 0 stock to avoid selling out-of-stock items
  return (products || []).map(p => {
    const availableSizes = p.sizes
      ?.map((s: any) => ({
        ...s,
        colors: s.colors?.filter((c: any) => c.quantity > 0) || []
      }))
      .filter((s: any) => s.colors.length > 0) // only include sizes that have at least one color with stock

    return {
      id: p.id,
      title: p.title,
      barcode: p.barcode,
      base_price: p.base_price,
      sizes: availableSizes,
      categoryName: p.category ? (p.category as any).name : '',
      modelName: p.model ? (p.model as any).name : ''
    }
  }).filter(p => (p.sizes?.length || 0) > 0)
}

export async function createBon(khademId: string, sessionId: string, total: number, items: any[]) {
  const supabase = await createClient()

  // 1. Create the bon
  const { data: bon, error: bonError } = await supabase
    .from('bons')
    .insert({
      khadem_id: khademId,
      session_id: sessionId, // ADDED: Required session_id column
      total_price: total,
      is_deleted: false,
    })
    .select('id')
    .single()

  if (bonError) {
    return { success: false, error: bonError.message }
  }

  // 2. Create the bon items
  const bonItemsToInsert = items.map(item => ({
    bon_id: bon.id,
    article_id: item.articleId,
    size_id: item.sizeId,
    color_id: item.colorId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    discount_amount: 0
  }))

  // Note: the stock quantity reduction triggers automatically over at the database
  const { error: itemsError } = await supabase
    .from('bon_items') // If types.ts complains, we ignore typecheck using any or cast
    .insert(bonItemsToInsert as any)

  if (itemsError) {
    // Attempt rollback since Supabase RPC/Transaction wasn't explicitly provided 
    await supabase.from('bons').delete().eq('id', bon.id)
    return { success: false, error: itemsError.message }
  }

  revalidatePath('/khadem')
  return { success: true, bonId: bon.id }
}
