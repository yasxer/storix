"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, newStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled") {
  const supabase = await createClient() as any

  // First verify the order exists and get its current status
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single()

  if (fetchError || !order) {
    return { error: fetchError?.message || "Order not found" }
  }

  // Update status in orders table
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Here you could add logic to increment/decrement stock depending on status changes 
  // (e.g. freeing up reserved stock if cancelled) if you tracked those states.

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  
  return { success: true }
}
