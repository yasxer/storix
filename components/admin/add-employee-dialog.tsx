"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus } from "lucide-react"
import { addEmployee } from "@/app/(admin)/admin/employees/actions"

export function AddEmployeeDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const result = await addEmployee(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setIsOpen(false)
      event.currentTarget.reset()
    }
    
    setIsLoading(false)
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
      >
        <Plus className="h-4 w-4" />
        Add Employee
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-1 text-lg font-bold">New Employee User</h2>
            <p className="mb-4 text-sm text-[var(--color-text-muted)]">
              Create an account for your "Khadem" to access the POS system.
            </p>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Full Name</label>
                <Input name="fullName" required placeholder="e.g. Hakim" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <Input name="email" type="email" required placeholder="hakim@hanot.com" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone (Optional)</label>
                <Input name="phone" placeholder="0555..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <Input name="password" type="password" required minLength={6} placeholder="Min 6 characters" />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
