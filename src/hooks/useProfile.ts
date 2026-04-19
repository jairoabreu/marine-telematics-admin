// src/hooks/useProfile.ts
import { useState, useEffect } from 'react'
import { supabase, Profile } from '../lib/supabase'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (isMounted) { setProfile(null); setLoading(false) }
        return
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      if (!isMounted) return
      if (error || !data) {
        // Fallback: assume first user logging in with a clean db
        setProfile({
          id: user.id,
          email: user.email ?? '',
          full_name: null,
          role: 'user',
          created_at: '',
          updated_at: '',
        })
      } else {
        setProfile(data as Profile)
      }
      setLoading(false)
    }

    load()

    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => { isMounted = false; sub.subscription.unsubscribe() }
  }, [])

  return { profile, isAdmin: profile?.role === 'admin', loading }
}
