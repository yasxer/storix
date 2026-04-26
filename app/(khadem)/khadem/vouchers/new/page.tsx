import { createClient } from "@/lib/supabase/server"
import { VoucherForm } from "@/components/admin/vouchers/voucher-form"

export default async function NewVoucherPage() {
  const supabase = await createClient()

  // Fetch all articles with their sizes and colors to populate the dropdowns
  const { data: articles } = await supabase
    .from("articles")
    .select(`
      id, title, base_price, purchase_price, barcode,
      article_sizes (
        id, size_label,
        article_size_colors (
          id, color_name, color_hex
        )
      )
    `)
    .eq("is_published", true)
    .order("title")

  // Fetch suppliers
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name, phone")
    .order("name")

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-8 px-4 sm:px-0">
        <h1 className="text-3xl font-black font-display text-gray-900">New Purchase Voucher</h1>
        <p className="text-base text-gray-500 mt-1 font-medium">
          Record incoming stock. This will automatically update your inventory counts and prices.
        </p>
      </div>

      <VoucherForm articles={articles || []} suppliers={suppliers || []} redirectPath="/khadem/vouchers" />
    </div>
  )
}

