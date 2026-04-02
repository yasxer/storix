import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// This client uses the service role key to bypass RLS and use Auth Admin APIs
export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
