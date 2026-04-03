
"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export async function createCategory(data: { name: string, image_url?: string }) {
  const supabase = (await createClient()) as any
  const slug = data.name.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "")
  const { error } = await supabase.from("categories").insert({
    name: data.name,
    slug: slug,
    image_url: data.image_url,
    position: 0
  })
  if (error) return { error: error.message }
  revalidatePath("/admin/categories")
  revalidatePath("/")
  return { success: true }
}

export async function updateCategory(data: { id: string, name: string, image_url?: string }) {
  const supabase = (await createClient()) as any
  const slug = data.name.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "")
  const { error } = await supabase.from("categories").update({
    name: data.name,
    slug: slug,
    image_url: data.image_url
  }).eq("id", data.id)

  if (error) return { error: error.message }
  revalidatePath("/admin/categories")
  revalidatePath("/")
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = (await createClient()) as any

  // Check if there are articles in this category 
  const { count: articleCount, error: articleErr } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id)

  if (articleErr) return { error: articleErr.message }
  if ((articleCount || 0) > 0) {
    return { error: "Cannot delete category because it contains products." }
  }

  // Same for any dependent models just in case
  const { count: modelCount, error: modelErr } = await supabase
    .from("models")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id)
  
  if (modelErr) return { error: modelErr.message }
  if ((modelCount || 0) > 0) {
    return { error: "Cannot delete category because it has models associated. Delete or reassign models first." }
  }

  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/admin/categories")
  revalidatePath("/")
  return { success: true }
}

export async function createModel(data: { name: string, category_id: string, photo_url?: string }) {
  const supabase = (await createClient()) as any
  const { error } = await supabase.from("models").insert({
    name: data.name,
    category_id: data.category_id,
    photo_url: data.photo_url || null
  })
  if (error) return { error: error.message }
  revalidatePath("/admin/categories")
  revalidatePath(`/admin/categories/${data.category_id}`)
  return { success: true }
}

export async function updateModel(data: { id: string, name: string, photo_url?: string, category_id: string }) {
  const supabase = (await createClient()) as any
  const { error } = await supabase.from("models").update({
    name: data.name,
    photo_url: data.photo_url
  }).eq("id", data.id)
  if (error) return { error: error.message }
  revalidatePath("/admin/categories")
  revalidatePath(`/admin/categories/${data.category_id}`)
  return { success: true }
}

export async function deleteModel(id: string) {
  const supabase = (await createClient()) as any
  
  const { count: articleCount } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("model_id", id)

  if ((articleCount || 0) > 0) {
    return { error: "Cannot delete model because it contains products." }
  }

  const { error } = await supabase.from("models").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/admin/categories")
  return { success: true }
}
