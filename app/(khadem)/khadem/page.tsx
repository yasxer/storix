import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { openSession, closeSession } from './actions'
import { Clock, CheckCircle2, Play, Lock, Eye, Plus, ArrowRight, Receipt, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default async function KhademHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]

  const { data: session } = await supabase
    .from('daily_sessions')
    .select('*')
    .eq('khadem_id', user.id)
    .eq('date', today)
    .maybeSingle()

  const isSessionOpen = session && !session.is_closed

  let bons: any[] = []
  if (session) {
    const { data: bonsData } = await supabase
      .from('bons')
      .select('*, bon_items(quantity)')
      .eq('session_id', session.id)
      .order('created_at', { ascending: false })
      
    if (bonsData) bons = bonsData
  }

  const totalRecette = bons?.filter(b => !b.is_deleted).reduce((sum, bon) => sum + (bon.total_price || 0), 0) || 0

  return (
    <div className="flex-1 flex flex-col xl:flex-row gap-8 items-start p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">      
      {/* Left Column: Session Card */}
      <div className="w-full xl:w-[420px] shrink-0 space-y-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp size={120} />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2 relative z-10">
            Hi, {profile?.full_name?.split(' ')[0] || 'Khadem'}! ??
          </h1>
          <p className="text-blue-100 text-sm mb-6 relative z-10 max-w-[280px]">
            {isSessionOpen 
               ? "Your shift is active. Tap the button below to start taking orders."
               : "A new day begins. Open your session to start registering sales."}
          </p>
          
          {isSessionOpen && (
            <Link href="/khadem/pos" className="relative z-10 block">
              <Button size="lg" className="w-full h-14 text-lg font-semibold gap-2 bg-white text-blue-700 hover:bg-blue-50 shadow-lg transition-transform hover:scale-[1.02]"> 
                <Plus size={22} className="stroke-[3]" />
                New POS Receipt
              </Button>
            </Link>
          )}
          {!session && (
            <form action={openSession} className="relative z-10 w-full">
              <Button type="submit" size="lg" className="w-full h-14 text-lg font-semibold gap-2 bg-white text-blue-700 hover:bg-blue-50 shadow-lg transition-transform hover:scale-[1.02]">
                <Play size={20} className="fill-current" />
                Start Shift (Open Session)
              </Button>
            </form>
          )}
        </div>

        <Card className="w-full text-left shadow-sm border-none ring-1 ring-gray-200/50 rounded-2xl overflow-hidden">
          {!session ? (
            <CardContent className="flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
              <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                <Clock size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Shift Not Started</h3>
              <p className="text-sm text-gray-500">Your total sales will appear here once you open your shift.</p>
            </CardContent>
          ) : isSessionOpen ? (
            <CardContent className="p-0">
               <div className="p-8 bg-white text-center border-b border-gray-100">
                   <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-2">Today's Revenue</p>
                   <p className="text-5xl font-black text-gray-900 tracking-tight">{totalRecette.toLocaleString()}<span className="text-2xl text-gray-400 ml-2 font-medium">DA</span></p>
               </div>
               <div className="p-4 bg-gray-50/50 flex justify-between items-center px-8">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    Shift Active
                  </div>
                  <form action={closeSession.bind(null, session.id)}>
                    <Button type="submit" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm h-8 rounded-full px-4 font-medium transition-colors">
                      <Lock size={14} className="mr-2" />
                      Close Shift
                    </Button>
                  </form>
               </div>
            </CardContent>
          ) : (
            <CardContent className="p-0 text-center">
              <div className="p-8 bg-gray-50">
                <div className="w-16 h-16 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Shift Closed</h3>
                <p className="text-sm text-gray-500 mb-6">Enjoy the rest of your day!</p>
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                   <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Final Revenue</p>
                   <p className="text-3xl font-bold text-gray-800">{totalRecette.toLocaleString()} DA</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Right Column: Bons Table */}
      {session && (
        <div className="flex-1 w-full bg-white border-none ring-1 ring-gray-200/60 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                 <Receipt size={20} />
               </div>
               <div>
                  <h2 className="font-bold text-lg text-gray-900 leading-tight">Sale Receipts</h2>
                  <p className="text-sm text-gray-500">{bons.length} items logged today</p>
               </div>
             </div>
             
             {isSessionOpen && (
               <Link href="/khadem/pos">
                 <Button className="rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-md transition-all gap-2 px-5">
                   New Bon <ArrowRight size={16} />
                 </Button>
               </Link>
             )}
          </div>
          
          <div className="flex-1 overflow-x-auto p-4 px-8">
            <table className="w-full text-sm text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-400 font-medium">
                  <th className="px-4 py-2 font-medium bg-transparent">Time</th>
                  <th className="px-4 py-2 font-medium bg-transparent">Receipt ID</th>
                  <th className="px-4 py-2 font-medium bg-transparent text-center">Items</th>
                  <th className="px-4 py-2 font-medium bg-transparent text-right">Total</th>
                  <th className="px-4 py-2 font-medium bg-transparent text-right">Action</th>  
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {bons?.map((bon: any) => {
                  const itemsCount = bon.bon_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0

                  return (
                    <tr key={bon.id} className={`group transition-all ${bon.is_deleted ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-4 whitespace-nowrap bg-gray-50 group-hover:bg-blue-50/50 rounded-l-2xl transition-colors">  
                        <div className="font-medium text-gray-900">{format(new Date(bon.created_at), "HH:mm")}</div>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-gray-500 bg-gray-50 group-hover:bg-blue-50/50 transition-colors">
                        <span className="bg-white px-2 py-1 rounded-md border border-gray-200">...{bon.id.slice(-8)}</span>
                        {bon.is_deleted && <span className="ml-2 text-red-500 font-semibold px-2 py-1 bg-red-50 rounded-md">Deleted</span>}
                      </td>
                      <td className="px-4 py-4 text-center bg-gray-50 group-hover:bg-blue-50/50 transition-colors">
                        <span className="inline-flex items-center justify-center bg-white border border-gray-200 w-8 h-8 rounded-full font-medium text-gray-700 shadow-sm">{itemsCount}</span>
                      </td>
                      <td className="px-4 py-4 text-right bg-gray-50 group-hover:bg-blue-50/50 transition-colors">       
                        <span className="font-bold text-gray-900">{bon.total_price.toLocaleString()} <span className="text-gray-500 font-medium text-xs">DA</span></span>
                      </td>
                      <td className="px-4 py-4 text-right bg-gray-50 group-hover:bg-blue-50/50 rounded-r-2xl transition-colors">
                        <Link href={`/khadem/bons/${bon.id}`}>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-full h-8 px-4 font-medium">
                            View <ArrowRight size={14} className="ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}

                {(!bons || bons.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                          <Receipt size={32} className="text-gray-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">No Sales Yet</h3>
                          <p className="text-gray-500 text-sm mt-1">When you make sales using the POS terminal, the receipts will appear here.</p>
                        </div>
                        {isSessionOpen && (
                          <Link href="/khadem/pos">
                            <Button variant="outline" className="rounded-full mt-2 font-medium">Open POS System</Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
