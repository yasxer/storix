'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function reopenSession(sessionId: string) {
  // Use admin client in case the RLS policy for 'admin' doesn't allow UPDATE
  const supabase = createAdminClient()

  // @ts-ignore - daily_sessions is not in types mapping yet
  const { data, error } = await supabase
    .from('daily_sessions')
    .update({ is_closed: false })
    .eq('id', sessionId)
    .select()

  if (error) {
    return { success: false, error: error.message }
  }
  
  if (!data || data.length === 0) {
    return { success: false, error: 'Could not update session. It may not exist.' }
  }

  revalidatePath('/admin/history')
  return { success: true }
}
