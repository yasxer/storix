import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EditEmployeeForm } from "./edit-employee-form"

export default async function EditEmployeePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Get employee profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", resolvedParams.id)
    .single()

  if (!profile) {
    redirect("/admin/employees")
  }

  // Get all categories to show in multi-select
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">
          Edit Employee: {profile.full_name}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Customize access settings and allowed product categories for this employee.
        </p>
      </div>
      
      <div className="bg-white border text-[var(--color-text)] border-[var(--color-border)] rounded-lg shadow-sm p-6 w-full max-w-2xl">
         <EditEmployeeForm 
           employee={profile}
           categories={categories || []}
         />
      </div>
    </div>
  )
}