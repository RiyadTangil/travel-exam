"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { Loader2, MoreVertical } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { useNarrowViewport } from "@/hooks/use-narrow-viewport"

const NARROW_MAX = 768

export type TableRowActionsProps = {
  className?: string
  /** Narrow tables: single ⋯ menu instead of multiple buttons. If undefined, uses responsive check automatically. */
  compact?: boolean
  /** When false, the View button is not rendered (e.g. expense heads). Default true. */
  showView?: boolean
  /** Dynamic label for the View button. Default "View". */
  viewLabel?: string
  onView?: () => void
  onEdit?: () => void
  /** Disables the Edit control (e.g. while another row is saving). */
  editDisabled?: boolean
  /** Shows a spinner on Edit (e.g. while PUT is in flight for this row). */
  editLoading?: boolean
  onDelete?: () => void | Promise<unknown>
  deleteTitle?: string
  deleteDescription?: string
  deleteDisabled?: boolean
  /** Parent-controlled loading (e.g. row id match) */
  deleteLoading?: boolean
  /** Override the module prefix for permissions */
  permissionPrefix?: string
  /** Custom actions to show before the View button */
  children?: React.ReactNode
}

/**
 * View / Edit / Delete for data tables. Delete uses the same confirm + async pattern as DeleteButton (no import cycle).
 */
export function TableRowActions({
  className = "",
  compact,
  showView = true,
  viewLabel = "View",
  onView,
  onEdit,
  editDisabled = false,
  editLoading = false,
  onDelete,
  deleteTitle = "Confirm delete",
  deleteDescription = "Are you sure you want to delete this record? This cannot be undone.",
  deleteDisabled = false,
  deleteLoading: externalLoading,
  permissionPrefix,
  children,
}: TableRowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [internalLoading, setInternalLoading] = useState(false)
  const isNarrow = useNarrowViewport(NARROW_MAX)
  
  const isCompact = compact !== undefined ? compact : isNarrow
  const busy = !!externalLoading || internalLoading

  const { canEdit, canDelete, canView } = usePermissions(permissionPrefix)

  const isEditDisabled = editDisabled || editLoading || !canEdit
  const isDeleteDisabled = deleteDisabled || busy || !canDelete
  const isViewDisabled = !canView

  const handleConfirmDelete = (e: React.MouseEvent) => {
    if (!onDelete || deleteDisabled) return
    e.preventDefault()
    setInternalLoading(true)
    Promise.resolve(onDelete())
      .then(() => {
        setConfirmOpen(false)
      })
      .finally(() => {
        setInternalLoading(false)
      })
  }

  if (isCompact) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            {children && (
              <div className="flex flex-col gap-1 p-1">
                {children}
              </div>
            )}
            {showView && onView && (
              <DropdownMenuItem disabled={isViewDisabled} onSelect={() => !isViewDisabled && onView()}>
                {viewLabel}
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem disabled={isEditDisabled} onSelect={() => !isEditDisabled && onEdit()}>
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={isDeleteDisabled}
                onSelect={() => !isDeleteDisabled && setConfirmOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {onDelete && (
          <ConfirmationDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={deleteTitle}
            description={deleteDescription}
            confirmText="Delete"
            onConfirm={handleConfirmDelete}
            isLoading={busy}
            loadingText="Deleting..."
            variant="destructive"
          />
        )}
      </>
    )
  }

  return (
    <>
      <div 
        className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        {showView && onView && (
          <Button 
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
            disabled={isViewDisabled}
          >
            {viewLabel}
          </Button>
        )}
        {onEdit && (
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            disabled={isEditDisabled}
          >
            {editLoading ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Editing...
              </>
            ) : (
              "Edit"
            )}
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            disabled={isDeleteDisabled}
            onClick={(e) => {
              e.stopPropagation()
              if (!isDeleteDisabled) setConfirmOpen(true)
            }}
          >
            {busy ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        )}
      </div>

      {onDelete && (
        <ConfirmationDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={deleteTitle}
          description={deleteDescription}
          confirmText="Delete"
          onConfirm={handleConfirmDelete}
          isLoading={busy}
          loadingText="Deleting..."
          variant="destructive"
        />
      )}
    </>
  )
}
