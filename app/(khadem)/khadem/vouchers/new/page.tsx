import { createClient } from "@/lib/supabase/server"
import { VoucherForm } from "@/components/admin/vouchers/voucher-form"

export default async function NewVoucherPage() {
  const supabase = await createClient()

  // Fetch all articles with their sizes and colors to populate the dropdowns
  const { data: articles } = await supabase
    .from("articles")
    .select(`
      id, title, base_price, barcode,
      article_sizes (
        id, size_label,
        article_size_colors (
          id, color_name, color_hex
        )
      )
    `)
    .eq("is_published", true)
    .order("title")

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">New Purchase Voucher</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Record incoming stock. This will automatically update your inventory counts and prices.
        </p>
      </div>

      <VoucherForm articles={articles || []} redirectPath="/khadem/vouchers" />
    </div>
  )
}

