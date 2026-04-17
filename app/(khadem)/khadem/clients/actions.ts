"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function addClient(data: { name: string; phone: string }) {
  const supabase = await createClient()

  const { error } = await supabase.from("clients").insert({
    name: data.name,
    phone: data.phone || null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/khadem/clients")
  return { success: true }
}

export async function addClientTransaction(data: {
  client_id: string
  type: string
  amount: number
  description: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from("client_transactions").insert({
    client_id: data.client_id,
    type: data.type,
    amount: data.amount,
    description: data.description,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/khadem/clients/${data.client_id}`)
  revalidatePath("/khadem/clients")
  return { success: true }
}

export async function deleteClient(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("clients").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/khadem/clients")
  return { success: true }
}

export async function updateClientTransaction(data: {
  id: string
  client_id: string
  amount: number
  description: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("client_transactions")
    .update({
      amount: data.amount,
      description: data.description,
    })
    .eq("id", data.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/khadem/clients/${data.client_id}`)
  revalidatePath("/khadem/clients")
  return { success: true }
}

export async function deleteClientTransaction(id: string, client_id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("client_transactions").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/khadem/clients/${client_id}`)
  revalidatePath("/khadem/clients")
  return { success: true }
}

export async function addClientPurchaseWithStock(data: {
  client_id: string
  items: { color_id: string, quantity: number, price: number, name: string }[]  
}) {
  const supabase = await createClient()

  // 1. Calculate amount and description
  let totalAmount = 0;
  const descParts: string[] = [];

  for (const item of data.items) {
    totalAmount += item.quantity * item.price;
    descParts.push(`${item.quantity}x ${item.name}`);

    // Update stock
    // Since we cant easily do Math in supabase update without RPC, we select then update
    const { data: colorData } = await supabase
      .from("article_size_colors")
      .select("quantity")
      .eq("id", item.color_id)
      .single()

    if (colorData) {
      const newQ = Math.max(0, colorData.quantity - item.quantity)
      await supabase.from("article_size_colors").update({ quantity: newQ }).eq("id", item.color_id)
    }
  }

  const description = descParts.join(", ")

  // 2. Add client transaction
  const { error } = await supabase.from("client_transactions").insert({
    client_id: data.client_id,
    type: "purchase",
    amount: totalAmount,
    description: description,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/khadem/clients/${data.client_id}`)
  revalidatePath("/khadem/clients")
  revalidatePath("/admin/stock")
  revalidatePath("/khadem/stock")
  return { success: true }
}



