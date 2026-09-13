"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface StatusSwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  confirmTitle?: string
  confirmDescription?: string
  permissionPrefix?: string
}

const StatusSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  StatusSwitchProps
>(({ className, checked, onCheckedChange, confirmTitle, confirmDescription, permissionPrefix, disabled, ...props }, ref) => {
  const [showConfirm, setShowConfirm] = React.useState(false)
  const { canEdit } = usePermissions(permissionPrefix)

  const isActuallyDisabled = disabled || !canEdit

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isActuallyDisabled) return
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    onCheckedChange?.(!checked)
    setShowConfirm(false)
  }

  return (
    <>
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle || "Confirm Status Change"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription || `Are you sure you want to change the status to ${checked ? "Inactive" : "Active"}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.stopPropagation()
                handleConfirm()
              }}
              className={checked ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SwitchPrimitives.Root
        className={cn(
          "peer inline-flex h-7 w-20 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-green-600" : "bg-red-500",
          className
        )}
        checked={checked}
        onClick={handleToggle}
        disabled={isActuallyDisabled}
        {...props}
        ref={ref}
      >
        <div className={"absolute flex w-20 items-center justify-between checked:ps-0 checked:pe-2 text-[10px] font-bold text-white uppercase select-none pointer-events-none"+(checked?" px-2":" ps-6")}>
          {checked && <span className={cn("transition-opacity duration-200", checked ? "opacity-100" : "opacity-0")}>Active</span>}
         <span className={cn("transition-opacity duration-200", !checked ? "opacity-100" : "opacity-0")}>Inactive</span>
        </div>
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200",
            checked ? "translate-x-[50px]" : "translate-x-0"
          )}
        />
      </SwitchPrimitives.Root>
    </>
  )
})
StatusSwitch.displayName = "StatusSwitch"

export { StatusSwitch }