"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createSupplierOrder(data: {
  supplier_name: string
  notes: string
  total_estimated_amount: number
  items: { article_name: string, expected_quantity: number, expected_price: number }[]
}) {
  const supabase = await createClient()

  // 1. Insert order
  const { data: order, error: orderError } = await supabase
    .from("supplier_orders")
    .insert({
      supplier_name: data.supplier_name,
      notes: data.notes,
      total_estimated_amount: data.total_estimated_amount
    })
    .select("id")
    .single()

  if (orderError) return { error: orderError.message }

  // 2. Insert items
  const itemsToInsert = data.items.map(item => ({
    order_id: order.id,
    ...item
  }))

  const { error: itemsError } = await supabase
    .from("supplier_order_items")
    .insert(itemsToInsert)

  if (itemsError) return { error: itemsError.message }

  revalidatePath("/admin/documents/bon-commande")
  return { success: true, orderId: order.id }
}
