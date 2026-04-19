// src/lib/groupService.ts
import { supabase, KitGroup } from './supabase'

export async function fetchGroups(): Promise<KitGroup[]> {
  const { data, error } = await supabase.from('kit_groups').select('*').order('name')
  if (error) throw error
  return (data ?? []) as KitGroup[]
}

export async function createGroup(input: { name: string; description?: string; color?: string }): Promise<KitGroup> {
  const { data, error } = await supabase.from('kit_groups').insert({
    name: input.name,
    description: input.description ?? null,
    color: input.color ?? '#1e6fcc',
  }).select().single()
  if (error) throw error
  return data as KitGroup
}

export async function updateGroup(id: string, patch: Partial<Pick<KitGroup,'name'|'description'|'color'>>): Promise<KitGroup> {
  const { data, error } = await supabase.from('kit_groups').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data as KitGroup
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase.from('kit_groups').delete().eq('id', id)
  if (error) throw error
}
