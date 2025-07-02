"use client"

import { useState, useEffect, useCallback } from "react"
import type { JournalEntry } from "@/lib/supabase"

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/journal")
      if (!response.ok) throw new Error("Failed to fetch entries")

      const { entries } = await response.json()
      setEntries(entries)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  const createEntry = async (content: string) => {
    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) throw new Error("Failed to create entry")

      const { entry } = await response.json()
      setEntries((prev) => [entry, ...prev])
      return entry
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  return {
    entries,
    loading,
    error,
    createEntry,
    refetch: fetchEntries,
  }
}
