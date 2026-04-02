import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock, PackagePlus, ReceiptText, ShieldAlert, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function InventoryHubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('can_add_products, role')
    .eq('id', user.id)
    .single()

  const hasAccess = profile?.can_add_products || profile?.role === 'admin'

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center px-6">
        <div className="relative">
          <div className="absolute inset-0 bg-red-100 blur-[50px] rounded-full"></div>
          <div className="relative w-28 h-28 bg-white border border-red-100 rounded-[2rem] shadow-xl flex items-center justify-center mb-8 rotate-3 transition-transform hover:rotate-0">
            <ShieldAlert className="h-12 w-12 text-red-500" />
            <div className="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg">
              <Lock size={16} />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-display font-extrabold text-gray-900 mb-3 tracking-tight">Access Denied (Mghlo9a)</h1>
        <p className="text-gray-500 text-lg mb-10 leading-relaxed font-medium">
          You do not have permission to manage inventory or purchase receipts. Contact an administrator to access this module.
        </p>
        
        <Link href="/khadem" className="w-full sm:w-auto">
          <Button size="lg" className="w-full rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg transition-transform hover:-translate-y-1">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-10 space-y-10">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-display font-extrabold text-gray-900 tracking-tight">Inventory & Purchases</h1>
        <p className="text-gray-500 text-lg mt-3 font-medium leading-relaxed">
          Manage the store's product catalog, register wholesale purchases, and restock supplies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Products Card */}
        <div className="group relative border border-gray-200/60 rounded-[2rem] p-8 bg-white shadow-sm hover:shadow-xl hover:border-[var(--color-primary)]/20 transition-all duration-300 flex flex-col h-full overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-[60px] group-hover:bg-[var(--color-primary)]/10 transition-colors -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-gray-50 to-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-2xl flex items-center justify-center mb-6 text-[var(--color-primary)] shadow-sm group-hover:scale-110 transition-transform">
            <PackagePlus size={36} className="stroke-[1.5]" />
          </div>
          
          <h2 className="relative z-10 text-2xl font-bold text-gray-900 mb-3 tracking-tight">Product Catalog</h2>
          <p className="relative z-10 text-gray-500 text-base mb-10 flex-1 leading-relaxed">
            Register new items into the system. Update sizes, colors, and modify basic product details.
          </p>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full mt-auto">
            <Link href="/khadem/products" className="flex-1">
              <Button variant="outline" className="w-full rounded-full h-12 font-semibold text-gray-700 bg-white border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                Browse Items
              </Button>
            </Link>
            <Link href="/khadem/products/new" className="flex-1">
              <Button className="w-full rounded-full h-12 font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-md hover:shadow-lg transition-all gap-2">
                Add Product <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Vouchers / Bons d'Achat Card */}
        <div className="group relative border border-gray-200/60 rounded-[2rem] p-8 bg-white shadow-sm hover:shadow-xl hover:border-[var(--color-success)]/20 transition-all duration-300 flex flex-col h-full overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-success)]/5 rounded-full blur-[60px] group-hover:bg-[var(--color-success)]/10 transition-colors -mr-20 -mt-20"></div>
          
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-gray-50 to-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-2xl flex items-center justify-center mb-6 text-[var(--color-success)] shadow-sm group-hover:scale-110 transition-transform">
            <ReceiptText size={36} className="stroke-[1.5]" />
          </div>
          
          <h2 className="relative z-10 text-2xl font-bold text-gray-900 mb-3 tracking-tight">Purchases (Bon Achat)</h2>
          <p className="relative z-10 text-gray-500 text-base mb-10 flex-1 leading-relaxed">
             Record new merchandise deliveries. Manage invoices from suppliers and automatically restock volumes.
          </p>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full mt-auto">
            <Link href="/khadem/vouchers" className="flex-1">
              <Button variant="outline" className="w-full rounded-full h-12 font-semibold text-gray-700 bg-white border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                View Receipts
              </Button>
            </Link>
            <Link href="/khadem/vouchers/new" className="flex-1">
              <Button className="w-full rounded-full h-12 font-bold bg-[var(--color-success)] hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all gap-2">
                New Bon <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
