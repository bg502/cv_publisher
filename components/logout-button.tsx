"use client"

import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button variant="outline" size="sm" className="gap-2">
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </form>
  )
}
