"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { loadPassword } from "@/store/password-slice"

export function PasswordStatus() {
  const dispatch = useAppDispatch()
  const { password, source, status } = useAppSelector((state) => state.password)

  useEffect(() => {
    dispatch(loadPassword())
  }, [dispatch])

  const canRunProtectedAction = password.length > 0

  return (
    <div className="mt-2 space-y-3">
      <div>
        <p className="text-xl font-semibold">
          {status === "loading" ? "Checking..." : source}
        </p>
        <p className="text-xs text-muted-foreground">
          Current password: {password}
        </p>
      </div>
      <Button size="sm" disabled={!canRunProtectedAction}>
        Protected action
      </Button>
    </div>
  )
}
