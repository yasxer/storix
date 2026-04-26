import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Toaster } from "sonner"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single()

  return (
    <div className="fixed inset-0 flex h-[100dvh] overflow-hidden bg-[var(--color-bg)] flex-col md:flex-row">
      <AdminSidebar profile={profile} userEmail={user.email || ""} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--color-surface-2)]/30">
        <header className="hidden md:flex h-16 shrink-0 items-center justify-between px-8 border-b border-[var(--color-border)] bg-white sticky top-0 z-10">
          <h2 className="font-display font-semibold text-xl text-[var(--color-text)]">
            Dashboard
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
      <Toaster position="bottom-right" richColors />
    </div>
  )
}
