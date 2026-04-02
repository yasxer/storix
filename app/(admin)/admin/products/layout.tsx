import { createClient } from "@/lib/supabase/server"
import { ReactNode } from "react"

export default async function ProductsLayout({ children }: { children: ReactNode }) {
  await createClient() // Ensure auth session
  return <>{children}</>
}