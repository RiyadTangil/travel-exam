"use client"

import * as React from "react"
import { ClearableSelect } from "./clearable-select"
import { useInfiniteList } from "@/hooks/api/useInfiniteList"
import { useDebounce } from "@/hooks/use-debounce"
import { ENDPOINTS } from "@/lib/api/api-endpoints"

interface UserSelectionProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

interface UserOption {
  value: string
  label: string
}

export function UserSelection({
  value,
  onChange,
  placeholder = "Select User",
  className,
  disabled,
}: UserSelectionProps) {
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 500)
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching
  } = useInfiniteList<UserOption[]>(
    ENDPOINTS.USERS.KEY,
    ENDPOINTS.USERS.URL,
    {
      selection: true,
      search: debouncedSearch,
      limit: 20,
    }
  )

  const options = React.useMemo(() => {
    return (data?.pages.flatMap((page) => page.data) || []).map((u: any) => ({
      value: String(u.id),
      label: u.name
    }))
  }, [data])

  return (
    <ClearableSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder={isLoading && !isFetchingNextPage ? "Loading users..." : placeholder}
      className={className}
      disabled={disabled || isLoading}
      loading={isFetchingNextPage || (isFetching && !isLoading)}
      onSearch={setSearch}
      onBottomReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      }}
    />
  )
}
