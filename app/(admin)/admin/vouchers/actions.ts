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

  // 2. Insert items and Update stock quantities
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

    // Auto-update standard stock
    // Since we need to incrementally add to the existing quantity we fetch first then update
    const { data: colorData } = await adminSupabase
      .from("article_size_colors")
      .select("quantity")
      .eq("id", item.color_id)
      .single()

    if (colorData) {
      await adminSupabase
        .from("article_size_colors")
        .update({ quantity: colorData.quantity + item.quantity })
        .eq("id", item.color_id)
    }

    // Optionally update 'base_price' in articles if you want sale_price to overrule the product price
    await adminSupabase
      .from("articles")
      .update({ base_price: item.sale_price })
      .eq("id", item.article_id)
  }

  revalidatePath("/admin/vouchers")
  revalidatePath("/admin/stock")
  revalidatePath("/admin/products")

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

  // Revert Stock
  if (items) {
    for (const item of items) {
      const { data: colorData } = await adminSupabase
        .from("article_size_colors")
        .select("quantity")
        .eq("id", item.color_id)
        .single()
        
      if (colorData) {
        await adminSupabase
          .from("article_size_colors")
          .update({ quantity: Math.max(0, colorData.quantity - item.quantity) }) // Safely deduct
          .eq("id", item.color_id)
      }
    }
  }

  // Delete elements
  await adminSupabase.from("purchase_voucher_items").delete().eq("voucher_id", id)
  const { error } = await adminSupabase.from("purchase_vouchers").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/admin/vouchers")
  revalidatePath("/admin/stock")
  revalidatePath("/admin/products")

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

  // We are going to revert old stock, delete old items, then insert new items & add new stock.
  // 1. Fetch old items
  const { data: oldItems } = await adminSupabase
    .from("purchase_voucher_items")
    .select("*")
    .eq("voucher_id", id)

  // 2. Revert Old Stock
  if (oldItems) {
    for (const item of oldItems) {
      const { data: colorData } = await adminSupabase.from("article_size_colors").select("quantity").eq("id", item.color_id).single()
      if (colorData) {
        await adminSupabase.from("article_size_colors").update({ quantity: Math.max(0, colorData.quantity - item.quantity) }).eq("id", item.color_id)
      }
    }
  }

  // 3. Delete Old Items
  await adminSupabase.from("purchase_voucher_items").delete().eq("voucher_id", id)

  // 4. Update Voucher Notes
  await adminSupabase.from("purchase_vouchers").update({ notes: data.notes }).eq("id", id)

  // 5. Insert New Items & Add Stock
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

    const { data: colorData } = await adminSupabase.from("article_size_colors").select("quantity").eq("id", item.color_id).single()
    if (colorData) {
      await adminSupabase.from("article_size_colors").update({ quantity: colorData.quantity + item.quantity }).eq("id", item.color_id)
    }

    await adminSupabase.from("articles").update({ base_price: item.sale_price }).eq("id", item.article_id)
  }

  revalidatePath("/admin/vouchers")
  revalidatePath("/admin/stock")
  revalidatePath("/admin/products")

  return { success: true }
}