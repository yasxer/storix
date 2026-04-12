import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/store/header"
import { Footer } from "@/components/store/footer"

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient() as any
  
  // Fetch store settings
  const { data: settings } = await supabase
    .from("store_settings")
    .select("*")
    .single()

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true })

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden w-full max-w-full" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
      <Header settings={settings} categories={categories || []} />
      
      <main className="flex-1 w-full max-w-full bg-white overflow-x-hidden">
        {children}
      </main>

      <Footer settings={settings} categories={categories || []} />
    </div>
  )
}