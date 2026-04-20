"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateAllowedCategories(userId: string, categoryIds: string[]) {
  const supabase = createAdminClient()
  
  const { error } = await supabase.from("profiles")
    .update({ allowed_categories: categoryIds.length > 0 ? categoryIds : null })
    .eq("id", userId)

  if (error) return { error: error.message }

  revalidatePath("/admin/employees")
  revalidatePath(`/admin/employees/${userId}/edit`)
  return { success: true }
}
