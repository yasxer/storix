"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Eye, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateOrderStatus } from "@/app/(admin)/admin/orders/actions"
import { toast } from "sonner"

export function OrderRowActions({ order }: { order: any }) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled") => {
    setIsUpdating(true)
    const toastId = toast.loading("Updating status...")
    const res = await updateOrderStatus(order.id, newStatus)
    
    if (res.error) {
      toast.error(res.error, { id: toastId })
    } else {
      toast.success(`Order marked as ${newStatus}`, { id: toastId })
    }
    setIsUpdating(false)
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const

  return (
    <div className="flex items-center gap-2 justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isUpdating} className="h-8 gap-1">
            <span className={`w-2 h-2 rounded-full ring-2 ring-white ${statusColors[order.status]?.split(' ')[0]}`}></span>
            <span className="capitalize">{order.status}</span>
            <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statuses.map(status => (
            <DropdownMenuItem 
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={order.status === status}
              className="capitalize"
            >
              Mark as {status}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="icon" onClick={() => router.push(`/admin/orders/${order.id}`)}>
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  )
}

