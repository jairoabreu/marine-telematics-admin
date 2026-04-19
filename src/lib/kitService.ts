// src/lib/kitService.ts
import { supabase, Kit, HotspotComponent } from './supabase'

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('kit-images').upload(path, file)
  if (error) throw new Error(error.message)
  return path
}

export async function deleteImage(path: string): Promise<void> {
  await supabase.storage.from('kit-images').remove([path])
}

export async function createKit(params: { name: string; description: string; imageFile: File | null; hotspots: HotspotComponent[] }): Promise<Kit> {
  let image_path: string | null = null
  if (params.imageFile) image_path = await uploadImage(params.imageFile)
  const { data, error } = await supabase.from('kits').insert({ name: params.name, description: params.description || null, image_path, hotspots: params.hotspots }).select().single()
  if (error) throw new Error(error.message)
  return data as Kit
}

export async function updateKit(id: string, params: { name?: string; description?: string; imageFile?: File | null; hotspots?: HotspotComponent[]; currentImagePath?: string | null }): Promise<Kit> {
  const updates: Partial<Kit> = {}
  if (params.name !== undefined) updates.name = params.name
  if (params.description !== undefined) updates.description = params.description || null
  if (params.hotspots !== undefined) updates.hotspots = params.hotspots
  if (params.imageFile) {
    if (params.currentImagePath) await deleteImage(params.currentImagePath)
    updates.image_path = await uploadImage(params.imageFile)
  }
  const { data, error } = await supabase.from('kits').update(updates).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data as Kit
}

export async function deleteKit(kit: Kit): Promise<void> {
  if (kit.image_path) await deleteImage(kit.image_path)
  const { error } = await supabase.from('kits').delete().eq('id', kit.id)
  if (error) throw new Error(error.message)
}
