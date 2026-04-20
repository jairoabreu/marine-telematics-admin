// src/lib/profileService.ts
import { supabase, Profile } from './supabase'

export async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function updateProfileRole(id: string, role: 'admin' | 'user'): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) throw error
}

export async function updateProfileName(id: string, full_name: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ full_name }).eq('id', id)
  if (error) throw error
}

export async function inviteUser(email: string, password: string, full_name: string, role: 'admin'|'user'): Promise<void> {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } })
  if (error) throw error
  if (data.user) {
    await supabase.from('profiles').update({ full_name, role }).eq('id', data.user.id)
  }
}
