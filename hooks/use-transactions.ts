"use client"

import { useState } from "react"

export interface Transaction {
  _id: string
  clientId: string
  clientName: string
  date: string
  receivedAmount: number
  refundAmount?: number
  notes: string
  transactionType: "B2C" | "B2B"
  createdAt: string
  updatedAt: string
}

interface UseTransactionsReturn {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  fetchTransactionsForClient: (clientId: string) => Promise<void>
  addTransaction: (transaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">) => Promise<void>
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactionsForClient = async (clientId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/transactions?clientId=${clientId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch transactions")
      }

      setTransactions(data.transactions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = async (transaction: Omit<Transaction, "_id" | "createdAt" | "updatedAt">) => {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to create transaction")
    }

    // Refresh transactions for the client
    await fetchTransactionsForClient(transaction.clientId)
  }

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    const response = await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to update transaction")
    }

    // Update local state
    setTransactions((prev) =>
      prev.map((transaction) => (transaction._id === id ? { ...transaction, ...data } : transaction)),
    )
  }

  const deleteTransaction = async (id: string) => {
    const response = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete transaction")
    }

    // Remove from local state
    setTransactions((prev) => prev.filter((transaction) => transaction._id !== id))
  }

  return {
    transactions,
    loading,
    error,
    fetchTransactionsForClient,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
