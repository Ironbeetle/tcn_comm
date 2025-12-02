"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function SessionBar() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  const { first_name, last_name, department } = session.user

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-semibold text-gray-900">
            {first_name} {last_name}
          </span>
          <span className="text-gray-500 ml-2">
            • {department.replace('_', ' ')}
          </span>
        </div>
        <Button onClick={() => signOut({ callbackUrl: '/login' })} variant="outline" size="sm">
          Logout
        </Button>
      </div>
    </div>
  )
}
