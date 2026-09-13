import { Loader2 } from "lucide-react"

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground mt-2">Loading...</p>
    </div>
  )
}

import { cn } from "@/lib/utils"

export function InlineLoader({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin text-muted-foreground", className)} />
  )
}