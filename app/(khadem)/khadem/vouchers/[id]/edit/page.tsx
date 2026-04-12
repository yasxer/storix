import { createClient } from "@/lib/supabase/server"
import { VoucherForm } from "@/components/admin/vouchers/voucher-form"
import { notFound } from "next/navigation"

export default async function EditVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id

  const supabase = await createClient()

  // 1. Fetch voucher with its items
  const { data: voucher } = await supabase
    .from("purchase_vouchers")
    .select(`
      *,
      purchase_voucher_items (*)
    `)
    .eq("id", id)
    .single()

  if (!voucher) notFound()

  // 2. Fetch all articles for the dropdown
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Edit Purchase Voucher</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Modifying this voucher will automatically calculate and adjust product quantities back (remove the old stock, apply the new stock).
        </p>
      </div>

      <VoucherForm articles={articles || []} initialData={voucher} />
    </div>
  )
}
