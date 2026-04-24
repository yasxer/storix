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

  let totalAmount = 0
  const descParts: string[] = []

  for (const item of data.items) {
    totalAmount += item.quantity * item.price
    descParts.push(`${item.quantity}x ${item.name}`)

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

  const { data: tx, error } = await supabase.from("client_transactions").insert({
    client_id: data.client_id,
    type: "purchase",
    amount: totalAmount,
    description: description,
  }).select().single()

  if (error || !tx) {
    return { error: error?.message || "Transaction failed" }
  }

  // Save structured items for later modification
  for (const item of data.items) {
    await supabase.from("client_purchase_items").insert({
      transaction_id: tx.id,
      color_id: item.color_id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
    })
  }

  revalidatePath(`/khadem/clients/${data.client_id}`)
  revalidatePath("/khadem/clients")
  revalidatePath("/admin/stock")
  revalidatePath("/khadem/stock")
  return { success: true }
}

export async function modifyClientPurchase(data: {
  transaction_id: string
  client_id: string
  items: { color_id: string, quantity: number, price: number, name: string }[]
}) {
  const supabase = await createClient()

  // 1. Restore stock for old items
  const { data: oldItems } = await supabase
    .from("client_purchase_items")
    .select("*")
    .eq("transaction_id", data.transaction_id)

  for (const oldItem of (oldItems || [])) {
    const { data: colorData } = await supabase
      .from("article_size_colors")
      .select("quantity")
      .eq("id", oldItem.color_id)
      .single()
    if (colorData) {
      await supabase.from("article_size_colors")
        .update({ quantity: colorData.quantity + oldItem.quantity })
        .eq("id", oldItem.color_id)
    }
  }

  // 2. Delete old items
  await supabase.from("client_purchase_items")
    .delete()
    .eq("transaction_id", data.transaction_id)

  // 3. Apply new items and deduct stock
  let totalAmount = 0
  const descParts: string[] = []

  for (const item of data.items) {
    totalAmount += item.quantity * item.price
    descParts.push(`${item.quantity}x ${item.name}`)

    const { data: colorData } = await supabase
      .from("article_size_colors")
      .select("quantity")
      .eq("id", item.color_id)
      .single()

    if (colorData) {
      const newQ = Math.max(0, colorData.quantity - item.quantity)
      await supabase.from("article_size_colors").update({ quantity: newQ }).eq("id", item.color_id)
    }

    await supabase.from("client_purchase_items").insert({
      transaction_id: data.transaction_id,
      color_id: item.color_id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
    })
  }

  // 4. Update transaction
  const { error } = await supabase.from("client_transactions")
    .update({
      amount: totalAmount,
      description: descParts.join(", ") || "Bon modifié",
    })
    .eq("id", data.transaction_id)

  if (error) return { error: error.message }

  revalidatePath(`/khadem/clients/${data.client_id}`)
  revalidatePath("/khadem/clients")
  revalidatePath("/admin/stock")
  revalidatePath("/khadem/stock")
  return { success: true }
}



