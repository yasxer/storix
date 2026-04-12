"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getSuppliers() {
  const supabase = await createClient() as any
  const { data } = await supabase.from("suppliers").select("*").order("name")
  return data || []
}

export async function createSupplier(data: { name: string, phone: string, address: string }) {
  const adminSupabase = createAdminClient() as any
  const { error } = await adminSupabase.from("suppliers").insert({
    name: data.name,
    phone: data.phone || null,
    address: data.address || null
  })
  if (error) return { error: error.message }
  revalidatePath("/admin/suppliers")
  return { success: true }
}

export async function deleteSupplier(id: string) {
  const adminSupabase = createAdminClient() as any
  // Check balance first if balance == 0 (to be complex, let's just delete for now and rely on DB constraint ON DELETE RESTRICT)
  const { error } = await adminSupabase.from("suppliers").delete().eq("id", id)
  if (error) {
    if (error.code === '23503') return { error: "Cannot delete: Supplier has associated vouchers or payments." }
    return { error: error.message }
  }
  revalidatePath("/admin/suppliers")
  return { success: true }
}

export async function addSupplierPayment(data: { supplier_id: string, voucher_id?: string, amount: number, notes?: string, payment_date: string }) {
  const supabase = await createClient() as any
  const adminSupabase = createAdminClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await adminSupabase.from("supplier_payments").insert({
    supplier_id: data.supplier_id,
    voucher_id: data.voucher_id || null,
    amount: data.amount,
    payment_date: data.payment_date,
    notes: data.notes || null,
    created_by: user.id
  })

  if (error) return { error: error.message }
  revalidatePath(`/admin/suppliers/${data.supplier_id}`)
  revalidatePath("/admin/vouchers")
  return { success: true }
}
