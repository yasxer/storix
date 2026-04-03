"use server"

import { createClient } from "@/lib/supabase/server"

export async function createOrder(data: any, items: any[]) {
  const supabase = (await createClient()) as any

  // 1. Get delivery fee details to verify
  const { data: feeData } = await supabase
    .from("delivery_fees")
    .select("fee_domicile, fee_bureau")
    .eq("wilaya_name", data.wilaya)
    .single()

  const delivery_fee = data.delivery_type === "domicile" 
    ? (feeData?.fee_domicile || 0) 
    : (feeData?.fee_bureau || 0)

  // Calculate total
  const itemsTotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  const total_price = itemsTotal + delivery_fee

  // 2. Insert Order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      client_name: data.client_name,
      client_lastname: data.client_lastname,
      phone: data.phone,
      address: data.address,
      wilaya: data.wilaya,
      delivery_type: data.delivery_type,
      total_price: total_price,
      delivery_fee,
      notes: data.notes || null,
      status: "pending"
    })
    .select()
    .single()

  if (orderErr) return { error: orderErr.message }

  // 3. Insert Items
  const orderItemsData = items.map((item) => ({
    order_id: order.id,
    article_id: item.article_id,
    size_id: item.size_id,
    color_id: item.color_id,
    quantity: item.quantity,
    unit_price: item.unit_price
  }))

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(orderItemsData)

  if (itemsErr) return { error: itemsErr.message }

  // Note: We are letting the DB trigger handle the stock deduction!

  return { success: true, orderId: order.id }
}
