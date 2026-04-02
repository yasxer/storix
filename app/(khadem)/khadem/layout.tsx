import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, Store } from 'lucide-react'
import Link from 'next/link'
import { KhademNav } from '@/components/khadem/khadem-nav'

export default async function KhademLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, can_add_products')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-[var(--color-border)] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-primary)] text-white rounded flex items-center justify-center">
              <Store size={20} />
            </div>
            <Link href="/khadem" className="font-display font-semibold text-lg hover:text-[var(--color-primary)] transition-colors">
              Hanot Point of Sale
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-[var(--color-text)] hidden sm:block">
              {profile?.full_name || 'Khadem'}
              <span className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)] text-xs px-2 py-0.5 rounded-full ml-2">
                {profile?.role}
              </span>
            </div>
            <form action="/auth/logout" method="post">
              <button 
                type="submit"
                className="p-2 text-[var(--color-text-muted)] hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </form>
          </div>
        </div>
        
        {/* Navigation Bar */}
        <div className="border-t border-[var(--color-border)] bg-gray-50/50 backdrop-blur-md">
          <KhademNav />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full pt-4 md:pt-6">
        {children}
      </main>
    </div>
  )
}
