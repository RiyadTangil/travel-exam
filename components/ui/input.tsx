import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onKeyDown, onChange, onFocus, value, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent invalid chars in number input
      if (type === "number" && ["e", "E", "+", "-"].includes(e.key)) {
        e.preventDefault()
      }

      onKeyDown?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type !== "number") {
        onChange?.(e)
        return
      }

      let val = e.target.value
      if (val !== "") {
        // Remove leading zeros but preserve decimals and single "0"
        // Example: "007" -> "7", "0.5" -> "0.5", "00.5" -> "0.5", "0" -> "0"
        val = val.replace(/^0+(?=\d)/, "")
      }

      // To pass the modified value to react-hook-form or other listeners,
      // we override the target value and call the original onChange.
      const target = e.target
      target.value = val
      onChange?.(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (type === "number") {
        // Delay selection slightly to bypass browser default focus behaviors
        setTimeout(() => {
          e.target.select()
        }, 0)
      }
      onFocus?.(e)
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onFocus={handleFocus}
        value={value}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }