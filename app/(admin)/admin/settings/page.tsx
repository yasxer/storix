import { createClient } from "@/lib/supabase/server"
import { StoreSettingsForm } from "@/components/admin/settings/store-settings-form"
import { DeliveryFeesTable } from "@/components/admin/settings/delivery-fees-table"
import { seedWilayas } from "@/app/(admin)/admin/settings/actions"

export default async function SettingsPage() {
  const supabase = await createClient() as any

  // 1) Ensure store settings exists
  let { data: storeSettings, error: ssError } = await supabase
    .from("store_settings")
    .select("*")
    .limit(1)
    .single()

  if (!storeSettings) {
      // First try to insert
      await supabase.from("store_settings").insert({ store_name: "Hanot Dz" })
      const res = await supabase.from("store_settings").select("*").limit(1).single()
      storeSettings = res.data
  }

  // 2) Ensure Wilayas exist
  let { data: wilayas } = await supabase
    .from("delivery_fees")
    .select("*")
    .order("wilaya_code", { ascending: true })

  if (!wilayas || wilayas.length === 0) {
      await seedWilayas()
      const wRes = await supabase.from("delivery_fees").select("*").order("wilaya_code", { ascending: true })
      wilayas = wRes.data
  }

  // numeric sort for code properly handling "1" vs "10"
  wilayas?.sort((a: any, b: any) => parseInt(a.wilaya_code) - parseInt(b.wilaya_code))

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage global e-commerce configurations and delivery fees.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Store Settings Section */}
        <section>
           <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4 border-b pb-2 border-gray-100 flex items-center">
             <span className="bg-[var(--color-primary)] w-3 h-6 rounded-sm inline-block mr-2 opacity-80" />
             General Configuration
           </h2>
           <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-border)]">
              <StoreSettingsForm initialData={storeSettings} />
           </div>
        </section>

        {/* Delivery Fees Section */}
        <section>
           <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4 border-b pb-2 border-gray-100 flex items-center">
             <span className="bg-blue-500 w-3 h-6 rounded-sm inline-block mr-2 opacity-80" />
             Delivery Fees (58 Wilayas)
           </h2>
           <p className="text-sm text-gray-500 mb-4 max-w-2xl">
             Set specific pricing for home delivery ("Domicile") and pickup point delivery ("Bureau") for each Algerian Wilaya.
           </p>

           <DeliveryFeesTable wilayas={wilayas || []} />
        </section>

      </div>
    </div>
  )
}

