"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function addEmployee(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const phone = formData.get("phone") as string
  
  if (!email || !password || !fullName) {
    return { error: "Email, password and full name are required." }
  }

  const supabase = createAdminClient()

  // 1. Create User in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) return { error: authError.message }

  const userId = authData.user.id

  // 2. Insert Profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    role: "khadem",
    full_name: fullName,
    phone: phone || null,
    is_active: true
  })

  if (profileError) {
    // Attempt rollback
    await supabase.auth.admin.deleteUser(userId)
    return { error: profileError.message }
  }

  revalidatePath("/admin/employees")
  return { success: true }
}

export async function toggleEmployeeStatus(userId: string, isActive: boolean) {
  const supabase = createAdminClient()
  
  // 1. Update in auth (block login)
  const { error: banError } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: isActive ? 'none' : '876000h' // 100 years if inactive
  })
  
  if (banError) return { error: banError.message }

  // 2. Update profile
  const { error: profileError } = await supabase.from("profiles").update({
    is_active: isActive
  }).eq("id", userId)

  if (profileError) return { error: profileError.message }

  revalidatePath("/admin/employees")
  return { success: true }
}

export async function deleteEmployee(userId: string) {
  const supabase = createAdminClient()
  
  // Just delete auth user. Cascade or triggers shouldn't block, 
  // but let's delete profile just in case although usually id references auth.users
  await supabase.from("profiles").delete().eq("id", userId)
  
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }
  
  revalidatePath("/admin/employees")
  return { success: true }
}
export async function toggleProductAccess(userId: string, canAdd: boolean) {
  const supabase = createAdminClient() as any

  const { error: profileError } = await supabase.from("profiles").update({
    can_add_products: canAdd
  }).eq("id", userId)

  if (profileError) return { error: profileError.message }

  revalidatePath("/admin/employees")
  return { success: true }
}