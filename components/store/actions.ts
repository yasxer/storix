"use server"

import { createClient } from "@/lib/supabase/server"

export async function searchProductsClient(query: string) {
  if (!query || query.length < 2) return []
  
  const supabase = await createClient() as any
  
  // We need to search securely. Since we want wildcard search, we use ilike on title, barcode.
  // We can also fetch categories to check names. For this simple setup, we'll search title and barcode.
  const queryWords = query.trim().split(/\s+/).map(w => `%${w}%`)
  
  const { data, error } = await supabase
    .from("articles")
    .select(`
      id, title, base_price, is_on_sale, sale_percentage, barcode,
      category:categories(name, slug),
      model:models(name),
      photos:article_photos(photo_url, position)
    `)
    .eq("is_published", true)
    .or(`title.ilike.%${query}%,barcode.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(5)
    
  if (error) {
    console.error("Search error:", error)
    return []
  }
  
  return data
}