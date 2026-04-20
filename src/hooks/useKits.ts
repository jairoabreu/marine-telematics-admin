import { useState, useEffect, useCallback } from 'react'
import { supabase, Kit } from '../lib/supabase'

export function useKits() {
  const [kits, setKits] = useState<Kit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      // Race against 10s timeout to prevent infinite spinners on page refresh
      const queryPromise = supabase.from('kits').select('*').order('created_at', { ascending: false })
      const timeoutPromise = new Promise<{ data: null; error: any }>(resolve =>
        setTimeout(() => resolve({ data: null, error: new Error('Timeout ao carregar kits. Tente recarregar a pagina.') }), 10000)
      )
      const { data, error: qErr } = await Promise.race([queryPromise, timeoutPromise])
      if (qErr) throw qErr
      setKits((data ?? []) as Kit[])
    } catch (e: any) {
      setError(e.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  return { kits, loading, error, refetch }
}
