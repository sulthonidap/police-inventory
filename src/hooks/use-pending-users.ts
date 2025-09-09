import { useState, useEffect, useCallback, useRef } from 'react'

export function usePendingUsers() {
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(false) // Start with false to avoid blocking sidebar
  const lastFetchTime = useRef<number>(0)
  const cacheTimeout = 60000 // 1 menit cache untuk mengurangi API calls
  const isInitialized = useRef(false)

  const fetchPendingCount = useCallback(async () => {
    const now = Date.now()
    
    // Skip fetch if we have recent data
    if (now - lastFetchTime.current < cacheTimeout && isInitialized.current) {
      return
    }
    
    // Don't show loading on subsequent fetches
    if (!isInitialized.current) {
      setLoading(true)
    }
    
    try {
      const response = await fetch('/api/users/pending-count', {
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        const data = await response.json()
        setPendingCount(data.count || 0)
        lastFetchTime.current = now
        isInitialized.current = true
      } else {
        // Fallback to 0 if API fails
        setPendingCount(0)
      }
    } catch (error) {
      console.error('Error fetching pending users count:', error)
      // Fallback to 0 on error
      setPendingCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchPendingCount()
    
    // Refresh setiap 3 menit untuk mengurangi beban server
    const interval = setInterval(fetchPendingCount, 180000)
    
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
