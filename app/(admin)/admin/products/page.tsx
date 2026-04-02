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
        <div className="p-4 border-b border-[var(--color-border)] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 text-[var(--color-text)]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
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

        <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] whitespace-nowrap text-sm text-left">
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
      </div>
    </div>
  )
}
