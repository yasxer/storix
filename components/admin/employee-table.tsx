"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, PowerOff, Power, Eye, Pencil, PackagePlus, ShieldAlert, ShieldCheck } from "lucide-react"
import { toggleEmployeeStatus, deleteEmployee, toggleProductAccess } from "@/app/(admin)/admin/employees/actions"
import Link from "next/link"

export function EmployeeTable({ employees }: { employees: any[] }) {
  if (!employees || employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-white shadow-sm mt-4">
        <p className="text-[var(--color-text-muted)]">No employees found. Add one to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border flex flex-col border-[var(--color-border)] rounded-lg shadow-sm mt-4 overflow-x-auto">
      <table className="w-full min-w-[800px] text-sm text-left">
        <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] text-xs uppercase font-semibold border-b border-[var(--color-border)]">
          <tr>
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Role</th>
            <th className="px-6 py-3 font-medium">Phone</th>
            <th className="px-6 py-3 font-medium text-center">Add Product Access</th>
            <th className="px-6 py-3 font-medium text-center">Status</th>
            <th className="px-6 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
          {employees.map((emp) => (
            <EmployeeRow key={emp.id} employee={emp} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmployeeRow({ employee: emp }: { employee: any }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async () => {
    setIsToggling(true)
    const newStatus = !emp.is_active
    const result = await toggleEmployeeStatus(emp.id, newStatus)
    if (result.error) alert(result.error)
    setIsToggling(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to completely delete ${emp.full_name}? They will lose access instantly.`)) return;
    setIsDeleting(true)
    const result = await deleteEmployee(emp.id)
    if (result.error) alert(result.error)
    setIsDeleting(false)
  }

  const handleProductAccessToggle = async () => {
    setIsToggling(true)
    const newAccess = !emp.can_add_products
    const result = await toggleProductAccess(emp.id, newAccess)
    if (result.error) alert(result.error)
    setIsToggling(false)
  }

  return (
    <tr className="hover:bg-[#f8f9fa] transition-colors items-center">
      <td className="px-6 py-4 font-medium flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold flex items-center justify-center select-none uppercase">
          {emp.full_name?.charAt(0) || "K"}
        </div>
        {emp.full_name}
      </td>
      <td className="px-6 py-4">
        <Badge variant={emp.role === "admin" ? "default" : "outline"} className={emp.role === "khadem" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}>
          {emp.role.toUpperCase()}
        </Badge>
      </td>
      <td className="px-6 py-4 text-gray-500">
        {emp.phone || "—"}
      </td>
      <td className="px-6 py-4 text-center">
        {emp.role === "admin" ? (
          <Badge variant="outline" className="bg-gray-50 text-gray-400 border-gray-200">Default (Admin)</Badge>
        ) : emp.can_add_products ? (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none hover:bg-emerald-100 flex items-center justify-center gap-1 w-fit mx-auto cursor-pointer" onClick={handleProductAccessToggle}>
            <ShieldCheck className="h-3 w-3" /> Yes
          </Badge>
        ) : (
          <Badge className="bg-gray-50 text-gray-500 border-gray-200 shadow-none hover:bg-gray-100 flex items-center justify-center gap-1 w-fit mx-auto cursor-pointer" onClick={handleProductAccessToggle}>
            <ShieldAlert className="h-3 w-3" /> No
          </Badge>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        {emp.is_active ? (
          <Badge className="bg-green-50 text-green-700 border-green-200 shadow-none hover:bg-green-100">Active</Badge>
        ) : (
          <Badge className="bg-red-50 text-red-700 border-red-200 shadow-none hover:bg-red-100">Blocked</Badge>
        )}
      </td>
      <td className="px-6 py-4 text-right flex justify-end gap-2">
        <Button asChild type="button" variant="outline" size="icon" title="View Details">
          <Link href={`/admin/employees/${emp.id}`}>
            <Eye className="h-4 w-4 text-blue-600" />
          </Link>
        </Button>
        {emp.role !== 'admin' && ( // Prevent modifying admin
          <>
            <Button asChild type="button" variant="outline" size="icon" title="Edit Employee">
              <Link href={`/admin/employees/${emp.id}/edit`}>
                <Pencil className="h-4 w-4 text-gray-600" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              title={emp.is_active ? "Block Account" : "Activate Account"}
              onClick={handleToggle}
              disabled={isToggling || isDeleting}
              className={emp.is_active ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
            >
              {isToggling ? <Loader2 className="h-4 w-4 animate-spin" /> : (emp.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />)}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Delete Account"
              onClick={handleDelete}
              disabled={isDeleting || isToggling}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </>
        )}
      </td>
    </tr>
  )
}
