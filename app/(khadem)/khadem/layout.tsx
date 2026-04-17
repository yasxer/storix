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
    <div className="min-h-[100dvh] bg-[#f7f8f9] flex flex-col pb-16 sm:pb-0">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center shadow-sm">
              <Store size={18} />
            </div>
            <Link href="/khadem" className="group">
              <div className="flex flex-col">
                <span className="font-display font-black text-gray-900 leading-none tracking-[-0.04em] text-lg lg:text-xl">
                  HANOT
                </span>
                <span className="text-[10px] font-black text-[var(--wise-dark-green)] opacity-40 uppercase tracking-[0.3em] leading-none mt-1 group-hover:opacity-70 transition-opacity">
                  POS SYSTEM
                </span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-xs font-bold text-gray-900 hidden sm:flex items-center">
              {profile?.full_name || 'Khadem'}
              <span className="bg-[var(--wise-mint)] text-[var(--wise-dark-green)] px-2 py-0.5 rounded-md ml-2 border border-[var(--wise-green)]">
                {profile?.role}
              </span>
            </div>
            <form action="/auth/logout" method="post">
              <button 
                type="submit"
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden sm:block border-t border-gray-100 bg-white">
          <KhademNav />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full h-[calc(100vh-3.5rem)] sm:h-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
         <KhademNav />
      </div>
    </div>
  )
}
