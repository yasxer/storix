export default async function EditEmployeePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">
          Edit Employee
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
           Wait! Editing phone number or names is currently not fully implemented with Supabase Auth yet.
           In the meantime, just delete and recreate to fix typos.
        </p>
      </div>
       <div className="bg-white border flex flex-col items-center justify-center py-12 text-center text-gray-500 border-[var(--color-border)] rounded-lg shadow-sm p-4">
         <p>Edit form is under construction.</p>
       </div>
    </div>
  )
}