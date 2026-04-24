import TrackingForm from "./tracking-form"

export const metadata = {
  title: "Suivi de Commande - Hanot",
  description: "Suivez l'état d'avancement de votre commande en temps réel."
}

export default function SuiviCommandePage() {
  return (
    <div className="bg-white">
      <TrackingForm />
    </div>
  )
}
