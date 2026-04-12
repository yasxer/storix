"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPurchaseVoucher(data: {
  notes: string,
  items: {
    article_id: string,
    size_id: string,
    color_id: string,
    quantity: number,
    purchase_price: number,
    sale_price: number
  }[]
}) {
  const supabase = await createClient() as any
  const adminSupabase = createAdminClient() as any

  // Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // 1. Create the Voucher Wrapper
  const { data: voucher, error: voucherError } = await adminSupabase
    .from("purchase_vouchers")
    .insert({
      created_by: user.id,
      notes: data.notes || null
    })
    .select()
    .single()

  if (voucherError) return { error: voucherError.message }

  // 2. Insert items
  for (const item of data.items) {
    // Insert item
    await adminSupabase.from("purchase_voucher_items").insert({
      voucher_id: voucher.id,
      article_id: item.article_id,
      size_id: item.size_id,
      color_id: item.color_id,
      quantity: item.quantity,
      purchase_price: item.purchase_price,
      sale_price: item.sale_price
    })

    // Note: Stock quantity is managed automatically by Supabase DB Trigger
    // So we don't update `article_size_colors.quantity` here.

    // Optionally update 'base_price' and 'purchase_price' in articles if you want sale_price to overrule the product price
    await adminSupabase
      .from("articles")
      .update({ base_price: item.sale_price, purchase_price: item.purchase_price })
      .eq("id", item.article_id)
  }

  revalidatePath("/khadem/vouchers")
  revalidatePath("/admin/stock")
  revalidatePath("/khadem/products")

  return { success: true, voucher_id: voucher.id }
}

export async function deletePurchaseVoucher(id: string) {
  const supabase = await createClient() as any
  const adminSupabase = createAdminClient() as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: items } = await adminSupabase
    .from("purchase_voucher_items")
    .select("*")
    .eq("voucher_id", id)

  // Note: Stock quantity revert is managed automatically by Supabase DB Trigger
  // So we don't decrement `article_size_colors.quantity` here.

  // Delete elements
  await adminSupabase.from("purchase_voucher_items").delete().eq("voucher_id", id)
  const { error } = await adminSupabase.from("purchase_vouchers").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/khadem/vouchers")
  revalidatePath("/admin/stock")
  revalidatePath("/khadem/products")

  return { success: true }
}

export async function updatePurchaseVoucher(id: string, data: {
  notes: string,
  items: {
    article_id: string,
    size_id: string,
    color_id: string,
    quantity: number,
    purchase_price: number,
    sale_price: number
  }[]
}) {
  const supabase = await createClient() as any
  const adminSupabase = createAdminClient() as any
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // 1. Delete Old Items (Stock reverting is handled by DB Trigger)
  await adminSupabase.from("purchase_voucher_items").delete().eq("voucher_id", id)

  // 2. Update Voucher Notes
  await adminSupabase.from("purchase_vouchers").update({ notes: data.notes }).eq("id", id)

  // 3. Insert New Items (Stock adding is handled by DB Trigger)
  for (const item of data.items) {
    await adminSupabase.from("purchase_voucher_items").insert({
      voucher_id: id,
      article_id: item.article_id,
      size_id: item.size_id,
      color_id: item.color_id,
      quantity: item.quantity,
      purchase_price: item.purchase_price,
      sale_price: item.sale_price
    })

    // Optionally update 'base_price' and 'purchase_price' in articles
    await adminSupabase.from("articles").update({ 
      base_price: item.sale_price,
      purchase_price: item.purchase_price
    }).eq("id", item.article_id)
  }

  revalidatePath("/khadem/vouchers")
  revalidatePath("/admin/stock")
  revalidatePath("/khadem/products")

  return { success: true }
}
