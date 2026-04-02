'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Unlock } from 'lucide-react'
import { reopenSession } from '@/app/(admin)/admin/history/actions'
import { useRouter } from 'next/navigation'

export function ReopenShiftButton({ sessionId, isClosed }: { sessionId: string, isClosed: boolean }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!isClosed) return null

  const handleReopen = () => {
    if (!confirm("Are you sure you want to reopen this shift for the Khadem?")) return

    startTransition(async () => {
      const res = await reopenSession(sessionId)
      if (!res.success) {
        alert(res.error || "Failed to reopen shift.")
      } else {
        // Explicitly refresh to update the page
        router.refresh()
      }
    })
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-amber-600 border-amber-600 hover:bg-amber-50"
      onClick={handleReopen}
      disabled={isPending}
    >
      <Unlock size={14} className="mr-1.5" />
      {isPending ? 'Updating...' : 'Reopen Shift'}
    </Button>
  )
}
