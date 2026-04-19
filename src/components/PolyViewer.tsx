// src/components/PolyViewer.tsx
import { useRef, useEffect, useState, useCallback } from 'react'
import { HotspotComponent } from '../lib/supabase'

const IMG_W = 2432, IMG_H = 1508

export default function PolyViewer({ imageUrl, hotspots, compact = false }: { imageUrl: string; hotspots: HotspotComponent[]; compact?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [pinnedCode, setPinnedCode] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)
  const [dims, setDims] = useState({ w: 800, h: 496 })

  const updateDims = useCallback(() => {
    if (!containerRef.current) return
    const cw = containerRef.current.clientWidth
    const ch = containerRef.current.clientHeight || (compact ? 320 : 600)
    const scale = Math.min(cw / IMG_W, ch / IMG_H)
    setDims({ w: IMG_W * scale, h: IMG_H * scale })
  }, [compact])

  useEffect(() => {
    updateDims()
    const ro = new ResizeObserver(updateDims)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [updateDims])

  const activeCode = pinnedCode ?? hoveredCode
  const scale = dims.w / IMG_W

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: compact ? 320 : '100%', minHeight: compact ? 320 : 400 }}>
      <svg width={dims.w} height={dims.h} viewBox={`0 0 ${IMG_W} ${IMG_H}`} className="block" onClick={() => setPinnedCode(null)}>
        <image href={imageUrl} x={0} y={0} width={IMG_W} height={IMG_H} preserveAspectRatio="none"/>
        {hotspots.map(comp => {
          const isActive = comp.code === activeCode
          const col = comp.color, sw = (isActive ? 2.5 : 1.5) / scale
          return comp.polys.map((pts, pi) => {
            const ps = pts.map(p => `${p.x},${p.y}`).join(' ')
            return (
              <g key={`${comp.code}-${pi}`}>
                <polygon points={ps} fill={isActive ? col+'40' : col+'00'} stroke={isActive ? col : col+'00'} strokeWidth={sw} strokeLinejoin="round" style={{pointerEvents:'none',transition:'fill .15s,stroke .15s'}}/>
                <polygon points={ps} fill="transparent" stroke="transparent" strokeWidth={Math.max(10, 18/scale)} style={{cursor:'pointer'}}
                  onMouseEnter={e => { setHoveredCode(comp.code); setTooltip({ x: e.clientX, y: e.clientY, text: `[${comp.code}] ${comp.name}` }) }}
                  onMouseMove={e => setTooltip(t => t ? {...t, x: e.clientX, y: e.clientY} : null)}
                  onMouseLeave={() => { setHoveredCode(null); setTooltip(null) }}
                  onClick={e => { e.stopPropagation(); setPinnedCode(prev => prev === comp.code ? null : comp.code) }}/>
              </g>
            )
          })
        })}
      </svg>
      {tooltip && <div className="fixed z-50 pointer-events-none bg-[#0d2137] text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg" style={{left: tooltip.x+14, top: tooltip.y-34}}>{tooltip.text}</div>}
    </div>
  )
}