// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface HotspotPoint {
  x: number
  y: number
}

export interface HotspotComponent {
  code: string
  name: string
  unit: string
  qty: number
  color: string
  desc: string
  polys: HotspotPoint[][]
}

export interface Kit {
  id: string
  name: string
  description: string | null
  image_path: string | null
  hotspots: HotspotComponent[] | null
  created_at: string
  updated_at: string
}

export function getImageUrl(path: string | null): string | null {
  if (!path) return null
  const { data } = supabase.storage.from('kit-images').getPublicUrl(path)
  return data.publicUrl
}
