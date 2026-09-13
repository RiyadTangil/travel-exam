"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { cn } from "@/lib/utils"

interface PrintButtonProps {
  className?: string
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  label?: string
  onClick?: () => void
}

export function PrintButton({
  className,
  variant = "outline",
  size = "sm",
  label = "Print",
  onClick,
}: PrintButtonProps) {
  const handlePrint = () => {
    if (onClick) {
      onClick()
    } else {
      window.print()
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("bg-sky-500 hover:bg-sky-600 text-white border-none", className)}
      onClick={handlePrint}
    >
      <Printer className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
