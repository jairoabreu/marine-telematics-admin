// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// @ts-ignore
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
// @ts-ignore
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============================================================
// Types
// ============================================================
export interface HotspotPoint { x: number; y: number }

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
  group_id: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface KitGroup {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

// ============================================================
// Helpers
// ============================================================
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  const { data } = supabase.storage.from('kit-images').getPublicUrl(path)
  return data.publicUrl
}
