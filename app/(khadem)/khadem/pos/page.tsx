import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PosClient from './pos-client'

export default async function PosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Ensure session is open today
  const today = new Date().toISOString().split('T')[0]
  const { data: session } = await supabase
    .from('daily_sessions')
    .select('id, is_closed')
    .eq('khadem_id', user.id)
    .eq('date', today)
    .maybeSingle()

  if (!session || session.is_closed) {
    redirect('/khadem') // Must open session first
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <PosClient sessionId={session.id} khademId={user.id} />
    </div>
  )
}
