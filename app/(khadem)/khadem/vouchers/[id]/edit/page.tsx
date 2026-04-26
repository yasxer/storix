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

  // 3. Fetch suppliers
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name, phone")
    .order("name")

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-8 px-4 sm:px-0">
        <h1 className="text-3xl font-black font-display text-gray-900">Edit Purchase Voucher</h1>
        <p className="text-base text-gray-500 mt-1 font-medium">
          Modifying this voucher will automatically calculate and adjust product quantities.
        </p>
      </div>

      <VoucherForm 
        articles={articles || []} 
        suppliers={suppliers || []} 
        initialData={voucher} 
        redirectPath="/khadem/vouchers"
      />
    </div>
  )
}
