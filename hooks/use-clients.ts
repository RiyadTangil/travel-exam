"use client"

import { useState, useEffect } from "react"

export interface B2CClient {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  passportNumber: string
  destination: string
  visaType: string
  clientType: "saudi-kuwait" | "other-countries" | "omra-visa"
  clientCategory: "B2C"
  associatedB2BId?: string
  status: string
  contractAmount: number
  dueAmount: number
  notes: string
  statusHistory: Array<{
    status: string
    date: string
    notes: string
  }>
  isArchived?: boolean
  archivedAt?: string
  archivedReason?: string
  hadTransactions?: boolean
  createdAt: string
  updatedAt: string
}

export interface B2BClient {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  businessType: string
  clientCategory: "B2B"
  contractAmount: number
  dueAmount: number
  notes: string
  createdAt: string
  updatedAt: string
}

export type Client = B2CClient | B2BClient

interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  fetchClients: (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    category?: string
    includeArchived?: boolean
  }) => Promise<void>
  createB2CClient: (data: Partial<B2CClient>) => Promise<B2CClient>
  createB2BClient: (data: Partial<B2BClient>) => Promise<B2BClient>
  updateClient: (id: string, data: Partial<Client>, type: "B2C" | "B2B") => Promise<void>
  deleteClient: (id: string, type: "B2C" | "B2B") => Promise<any>
  getClientById: (id: string, type: "B2C" | "B2B") => Promise<Client>
  restoreClient: (id: string, type: "B2C" | "B2B") => Promise<any>
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const fetchClients = async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    category?: string
    includeArchived?: boolean
  }) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set("page", params.page.toString())
      if (params?.limit) searchParams.set("limit", params.limit.toString())
      if (params?.search) searchParams.set("search", params.search)
      if (params?.status) searchParams.set("status", params.status)

      // Fetch B2C clients
      const b2cResponse = await fetch(`/api/clients/b2c?${searchParams}`)
      const b2cData = await b2cResponse.json()

      if (!b2cResponse.ok) {
        throw new Error(b2cData.error || "Failed to fetch B2C clients")
      }

      // Fetch B2B clients for dropdown (without pagination)
      const b2bResponse = await fetch(`/api/clients/b2b`)
      const b2bData = await b2bResponse.json()

      if (!b2bResponse.ok) {
        console.warn("Failed to fetch B2B clients:", b2bData.error)
      }

      // Combine clients for dropdown purposes
      const allClients = [...b2cData.clients, ...(b2bData.clients || [])]

      setClients(allClients)
      setPagination(b2cData.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const createB2CClient = async (data: Partial<B2CClient>): Promise<B2CClient> => {
    const response = await fetch("/api/clients/b2c", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to create client")
    }

    return result.client
  }

  const createB2BClient = async (data: Partial<B2BClient>): Promise<B2BClient> => {
    const response = await fetch("/api/clients/b2b", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to create client")
    }

    return result.client
  }

  const updateClient = async (id: string, data: Partial<Client>, type: "B2C" | "B2B"): Promise<void> => {
    const endpoint = type === "B2C" ? `/api/clients/b2c/${id}` : `/api/clients/b2b/${id}`

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to update client")
    }
  }

  const deleteClient = async (id: string, type: "B2C" | "B2B"): Promise<any> => {
    const endpoint = type === "B2C" ? `/api/clients/b2c/${id}` : `/api/clients/b2b/${id}`

    const response = await fetch(endpoint, {
      method: "DELETE",
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to archive client")
    }
    
    return result;
  }

  const getClientById = async (id: string, type: "B2C" | "B2B"): Promise<Client> => {
    const endpoint = type === "B2C" ? `/api/clients/b2c/${id}` : `/api/clients/b2b/${id}`

    const response = await fetch(endpoint)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch client")
    }

    return result.client
  }

  const restoreClient = async (id: string, type: "B2C" | "B2B"): Promise<any> => {
    const endpoint = type === "B2C" ? `/api/clients/b2c/${id}/restore` : `/api/clients/b2b/${id}/restore`

    const response = await fetch(endpoint, {
      method: "POST",
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to restore client")
    }
    
    return result;
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return {
    clients,
    loading,
    error,
    pagination,
    fetchClients,
    createB2CClient,
    createB2BClient,
    updateClient,
    deleteClient,
    getClientById,
    restoreClient,
  }
}
