"use client"

import { useState, useEffect } from "react"
import type { B2BClient, B2CClient } from "./use-clients"

interface UseB2BClientsReturn {
  b2bClients: B2BClient[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  fetchB2BClients: (params?: {
    page?: number
    limit?: number
    search?: string
  }) => Promise<void>
  getB2BClientWithAssociatedClients: (id: string) => Promise<{
    client: B2BClient
    associatedB2CClients: B2CClient[]
  }>
}

export function useB2BClients(): UseB2BClientsReturn {
  const [b2bClients, setB2BClients] = useState<B2BClient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const fetchB2BClients = async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set("page", params.page.toString())
      if (params?.limit) searchParams.set("limit", params.limit.toString())
      if (params?.search) searchParams.set("search", params.search)

      const response = await fetch(`/api/clients/b2b?${searchParams}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch B2B clients")
      }

      setB2BClients(data.clients)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getB2BClientWithAssociatedClients = async (id: string) => {
    const response = await fetch(`/api/clients/b2b/${id}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch B2B client")
    }

    return data
  }

  useEffect(() => {
    fetchB2BClients()
  }, [])

  return {
    b2bClients,
    loading,
    error,
    pagination,
    fetchB2BClients,
    getB2BClientWithAssociatedClients,
  }
}
