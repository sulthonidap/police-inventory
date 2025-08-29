import { useState, useEffect, useCallback, useRef } from 'react'

export function usePendingUsers() {
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const lastFetchTime = useRef<number>(0)
  const cacheTimeout = 30000 // 30 detik cache

  const fetchPendingCount = useCallback(async () => {
    const now = Date.now()
    
    // Skip fetch if we have recent data
    if (now - lastFetchTime.current < cacheTimeout && !loading) {
      return
    }
    
    try {
      const response = await fetch('/api/users/pending-count')
      if (response.ok) {
        const data = await response.json()
        setPendingCount(data.count)
        lastFetchTime.current = now
      }
    } catch (error) {
      console.error('Error fetching pending users count:', error)
    } finally {
      setLoading(false)
    }
  }, [loading])

  useEffect(() => {
    fetchPendingCount()
    
    // Refresh setiap 2 menit untuk mengurangi beban server
    const interval = setInterval(fetchPendingCount, 120000)
    
    // Listen untuk event refresh dari halaman lain
    const handleRefresh = () => {
      fetchPendingCount()
    }
    
    window.addEventListener('refreshPendingCount', handleRefresh)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('refreshPendingCount', handleRefresh)
    }
  }, [fetchPendingCount])

  return { pendingCount, loading }
}
