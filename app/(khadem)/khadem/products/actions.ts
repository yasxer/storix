"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleProductPublish(articleId: string, isPublished: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("articles")
    .update({ is_published: isPublished })
    .eq("id", articleId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/khadem/products")
  revalidatePath("/admin/products")
  return { success: true }
}
