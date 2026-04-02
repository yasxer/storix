import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EmployeeDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: employee } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", resolvedParams.id)
    .single()

  if (!employee) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">
          {employee.full_name}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Role: {employee.role.toUpperCase()}
        </p>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 shadow-sm flex flex-col items-center justify-center py-12 text-center text-gray-500">
         <p>This page will show all statistics, order history, and daily sessions for {employee.full_name}.</p>
         <p className="text-sm mt-2">More details coming soon...</p>
      </div>
    </div>
  )
}