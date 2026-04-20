import { useState, useEffect } from 'react'
import { supabase, Profile } from '../lib/supabase'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadFor(userId: string, userEmail: string) {
      try {
        // Race the Supabase query against a 5s timeout to prevent hangs on refresh
        const queryPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
        const timeoutPromise = new Promise<{ data: null; error: any }>(resolve =>
          setTimeout(() => resolve({ data: null, error: new Error('timeout') }), 5000)
        )
        const { data, error } = await Promise.race([queryPromise, timeoutPromise])
        if (cancelled) return
        if (error || !data) {
          setProfile({ id: userId, email: userEmail, full_name: null, role: 'user', created_at: '', updated_at: '' })
        } else {
          setProfile(data as Profile)
        }
      } catch {
        if (!cancelled) setProfile({ id: userId, email: userEmail, full_name: null, role: 'user', created_at: '', updated_at: '' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    async function initialize() {
      try {
        // getSession() is cached and fast - safe to call on every mount
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled) return
        if (!session?.user) {
          setProfile(null); setLoading(false); return
        }
        loadFor(session.user.id, session.user.email ?? '')
      } catch {
        if (!cancelled) { setProfile(null); setLoading(false) }
      }
    }

    initialize()

    // Listen only for SIGNED_IN / SIGNED_OUT events (ignore INITIAL_SESSION to avoid double-load)
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (event === 'SIGNED_OUT') { setProfile(null); setLoading(false); return }
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true)
        loadFor(session.user.id, session.user.email ?? '')
      }
    })

    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [])

  return { profile, isAdmin: profile?.role === 'admin', loading }
}
