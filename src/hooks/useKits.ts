// src/hooks/useKits.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase, Kit } from '../lib/supabase'

export function useKits() {
  const [kits, setKits] = useState<Kit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchKits = useCallback(async () => {
    setLoading(true); setError(null)
    const { data, error } = await supabase.from('kits').select('*').order('updated_at', {ascending:false})
    if (error) setError(error.message); else setKits(data as Kit[])
    setLoading(false)
  }, [])
  useEffect(() => { fetchKits() }, [fetchKits])
  return { kits, loading, error, refetch: fetchKits }
}
