"use client" // Error boundaries must be Client Components

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Admin Panel Error Boundary caught:", error)
  }, [error])

  return (
    <div className="flex bg-white h-[60vh] flex-col items-center justify-center rounded-lg border border-red-200 outline-dashed outline-4 outline-red-100 m-8 p-12 text-center shadow-sm">
      <div className="text-red-500 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      </div>
      <h2 className="text-2xl font-bold font-display text-[var(--color-text)] mb-2">
        Something went wrong!
      </h2>
      <p className="text-[var(--color-text-muted)] max-w-md mx-auto mb-8">
        We encountered an error while trying to load this page. {error.message ? `Details: ${error.message}` : "Please try again or contact support."}
      </p>
      <div className="flex gap-4">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </Button>
        <Button variant={"outline"} onClick={() => window.location.href = '/admin'}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  )
}
