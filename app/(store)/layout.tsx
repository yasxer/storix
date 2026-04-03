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
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] font-sans">
      <Header settings={settings} categories={categories || []} />
      
      <main className="flex-1 w-full bg-[var(--color-bg)]">
        {children}
      </main>

      <Footer settings={settings} categories={categories || []} />
    </div>
  )
}