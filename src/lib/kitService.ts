import { supabase, Kit, HotspotComponent } from './supabase'

export async function fetchKits(): Promise<Kit[]> {
  const { data, error } = await supabase.from('kits').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Kit[]
}

interface CreateKitInput {
  name: string
  description?: string | null
  imageFile?: File | null
  hotspots?: HotspotComponent[]
  group_id?: string | null
}

export async function createKit(input: CreateKitInput): Promise<Kit> {
  let image_path: string | null = null
  if (input.imageFile) {
    const ext = input.imageFile.name.split('.').pop() ?? 'png'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
    const { error: upErr } = await supabase.storage.from('kit-images').upload(path, input.imageFile)
    if (upErr) throw upErr
    image_path = path
  }
  const { data, error } = await supabase.from('kits').insert({
    name: input.name,
    description: input.description ?? null,
    image_path,
    hotspots: input.hotspots ?? [],
    group_id: input.group_id ?? null,
  }).select().single()
  if (error) throw error
  return data as Kit
}

interface UpdateKitInput {
  name: string
  description?: string | null
  imageFile?: File | null
  hotspots?: HotspotComponent[]
  group_id?: string | null
  currentImagePath?: string | null
}

export async function updateKit(id: string, input: UpdateKitInput): Promise<Kit> {
  let image_path = input.currentImagePath ?? null
  if (input.imageFile) {
    const ext = input.imageFile.name.split('.').pop() ?? 'png'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
    const { error: upErr } = await supabase.storage.from('kit-images').upload(path, input.imageFile)
    if (upErr) throw upErr
    if (input.currentImagePath) await supabase.storage.from('kit-images').remove([input.currentImagePath])
    image_path = path
  }
  const { data, error } = await supabase.from('kits').update({
    name: input.name,
    description: input.description ?? null,
    image_path,
    hotspots: input.hotspots ?? [],
    group_id: input.group_id ?? null,
  }).eq('id', id).select().single()
  if (error) throw error
  return data as Kit
}

export async function deleteKit(kit: Kit): Promise<void> {
  if (kit.image_path) await supabase.storage.from('kit-images').remove([kit.image_path])
  const { error } = await supabase.from('kits').delete().eq('id', kit.id)
  if (error) throw error
}
