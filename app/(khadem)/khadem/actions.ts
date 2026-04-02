'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function openSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/auth/login')

  const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'

  const { error } = await supabase
    .from('daily_sessions')
    .insert({
      khadem_id: user.id,
      date: today,
      is_closed: false,
    })

  if (error) {
    if (error.code === '23505') { // Unique violation, meaning it already exists
       // Ignore, handle gracefully
    } else {
      throw new Error('Failed to open session: ' + error.message)
    }
  }

  redirect('/khadem/pos')
}

export async function closeSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/auth/login')

  const { error } = await supabase
    .from('daily_sessions')
    .update({ is_closed: true })
    .eq('id', sessionId)
    .eq('khadem_id', user.id)

  if (error) {
    throw new Error('Failed to close session: ' + error.message)
  }

  redirect('/khadem')
}
