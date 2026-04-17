import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { ProductRowActions } from "@/components/admin/product-row-actions"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const query = typeof resolvedParams.q === "string" ? resolvedParams.q : ""
  const modelId = typeof resolvedParams.model_id === "string" ? resolvedParams.model_id : ""

  const supabase = await createClient()

  // Build the query
  let articlesQuery = supabase
    .from("articles")
    .select(`
      *,
      models(name),
      categories(name)
    `)
    .order("created_at", { ascending: false })

  if (query) {
    articlesQuery = articlesQuery.ilike("title", `%${query}%`)
  }

  if (modelId) {
    articlesQuery = articlesQuery.eq("model_id", modelId)
  }

  const { data: articles } = await articlesQuery

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Products</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage your store catalog, pricing, and variations.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 text-gray-900">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <form action="/admin/products" method="GET">
              <Input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search products by title..."
                className="pl-9 w-full bg-[var(--color-surface)] border-[var(--color-border)]"
              />
            </form>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" className="w-full md:w-auto flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Category / Model</th>
                <th className="px-6 py-3 font-medium">Base Price</th>
                <th className="px-6 py-3 font-medium">Barcode</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
              {articles?.map((article) => (
                <tr key={article.id} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-6 py-4 font-medium">{article.title}</td>
                  <td className="px-6 py-4">
                    {article.categories?.name} / {article.models?.name}
                  </td>
                  <td className="px-6 py-4">{article.base_price.toLocaleString()} DA</td>
                  <td className="px-6 py-4 text-[var(--color-text-muted)]">
                    {article.barcode || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={article.is_published ? "success" : "default"}>
                      {article.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ProductRowActions 
                      articleId={article.id} 
                      barcode={article.barcode} 
                      title={article.title} 
                      price={article.base_price}
                    />
                  </td>
                </tr>
              ))}

              {(!articles || articles.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-3 p-3 bg-gray-50/50 rounded-b-xl border-t border-gray-100">
          {(!articles || articles.length === 0) ? (
             <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
               No products found.
             </div>
          ) : (
            articles.map((article) => (
               <div key={article.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 relative group transition-all">
                  <div className="flex justify-between items-start pr-8">
                     <div>
                       <h3 className="font-bold text-gray-900 text-[13px] leading-tight line-clamp-2">{article.title}</h3>
                       <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider truncate">
                         {article.categories?.name} / {article.models?.name}
                       </div>
                     </div>
                     <div className="absolute right-4 top-4">
                       <ProductRowActions 
                         articleId={article.id} 
                         barcode={article.barcode} 
                         title={article.title} 
                         price={article.base_price}
                       />
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-end mt-1">
                     <div className="flex flex-col gap-1.5">
                        <Badge variant={article.is_published ? "success" : "default"} className={`w-max text-[10px] px-2 py-0 ${article.is_published ? 'bg-[var(--wise-mint)] text-[var(--wise-dark-green)] border-none' : ''}`}>
                          {article.is_published ? "Published" : "Draft"}
                        </Badge>
                        <span className="text-[10px] text-gray-400 font-mono tracking-tight bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 inline-block">
                          {article.barcode || "No Barcode"}
                        </span>
                     </div>
                     
                     <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Base Price</span>
                        <span className="font-black text-[var(--wise-dark-green)] text-sm">{article.base_price.toLocaleString()} <span className="text-xs opacity-60 font-semibold">DA</span></span>
                     </div>
                  </div>
               </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
