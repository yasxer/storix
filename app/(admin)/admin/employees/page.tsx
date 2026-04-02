import { createClient } from "@/lib/supabase/server"
import { AddEmployeeDialog } from "@/components/admin/add-employee-dialog"
import { EmployeeTable } from "@/components/admin/employee-table"

export default async function EmployeesPage() {
  const supabase = await createClient()

  // Fetch all staff (khadamet + admins)
  const { data: employees } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["admin", "khadem"])
    .order("role", { ascending: true }) // Admins first
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Employees</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage your store staff ("Khedam"). Control their access to point of sale. 
          </p>
        </div>
        <AddEmployeeDialog />
      </div>

      <EmployeeTable employees={employees || []} />
    </div>
  )
}

