import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { StockTable } from "@/components/admin/stock-table"

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const query = typeof resolvedParams.q === "string" ? resolvedParams.q : ""

  const supabase = await createClient()

  // Build the query to get all articles + their sizes and colors.
  let articlesQuery = supabase
    .from("articles")
    .select(`
      id,
      title,
      charika,
      is_published,
      models(name),
      categories(name),
      article_sizes (
        id,
        size_label,
        article_size_colors (
          id,
          color_name,
          color_hex,
          quantity
        )
      )
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
          <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Stock Management</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            View available inventory. Quantities can be adjusted individually if needed.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm">
        <div className="p-4 border-b border-[var(--color-border)] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full text-[var(--color-text)]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <form action="/admin/stock" method="GET">
              <Input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search products by title..."
                className="pl-9 bg-white"
              />
            </form>
          </div>
        </div>

        <div className="overflow-x-auto">
          <StockTable articles={articles || []} />
        </div>
      </div>
    </div>
  )
}

