"use client"

import { useState, useEffect } from "react"

interface ProductivityStats {
  weeklyAverage: number
  monthlyAverage: number
  streak: number
}

export function useStats() {
  const [stats, setStats] = useState<ProductivityStats>({
    weeklyAverage: 0,
    monthlyAverage: 0,
    streak: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
