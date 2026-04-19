// src/components/KitViewerModal.tsx
import { useState } from 'react'
import { Kit, HotspotComponent, getImageUrl } from '../lib/supabase'
import { X, Search } from 'lucide-react'

interface Props { kit: Kit; onClose: () => void }

const IMG_W = 2432, IMG_H = 1508

export default function KitViewerModal({ kit, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [pinnedCode, setPinnedCode] = useState<string | null>(null)
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [zoom, setZoom] = useState(50)
  const imageUrl = getImageUrl(kit.image_path)
  const hotspots = kit.hotspots ?? []
  const activeCode = pinnedCode ?? hoveredCode

  const filtered = hotspots.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)
  )

  function togglePin(code: string) {
    setPinnedCode(prev => prev === code ? null : code)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-200 bg-[#0d2137] flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-white">{kit.name}</h2>
          {kit.description && <p className="text-xs text-white/40 mt-0.5">{kit.description}</p>}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-white/30 font-mono">{hotspots.length} componentes</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X size={15}/>
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-auto bg-gray-50 flex items-start justify-start p-4">
          {imageUrl ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">Zoom</span>
                <input type="range" min={20} max={150} value={zoom} onChange={e => setZoom(+e.target.value)} className="w-28"/>
                <span className="text-xs font-mono text-gray-500">{zoom}%</span>
              </div>
              <svg
                width={IMG_W * zoom / 100}
                height={IMG_H * zoom / 100}
                viewBox={`0 0 ${IMG_W} ${IMG_H}`}
                className="block flex-shrink-0"
                onClick={() => setPinnedCode(null)}
              >
                <image href={imageUrl} x={0} y={0} width={IMG_W} height={IMG_H} preserveAspectRatio="none"/>
                {hotspots.map(comp => {
                  const isActive = comp.code === activeCode
                  const col = comp.color
                  const scale = zoom / 100
                  const sw = (isActive ? 2.5 : 1.5) / scale
                  return comp.polys.map((pts, pi) => {
                    const ps = pts.map(p => `${p.x},${p.y}`).join(' ')
                    return (
                      <g key={`${comp.code}-${pi}`}>
                        <polygon points={ps} fill={isActive ? col+'40' : col+'00'} stroke={isActive ? col : col+'00'}
                          strokeWidth={sw} strokeLinejoin="round" style={{pointerEvents:'none', transition:'fill .15s, stroke .15s'}}/>
                        <polygon points={ps} fill="transparent" stroke="transparent"
                          strokeWidth={Math.max(10, 18/scale)} style={{cursor:'pointer'}}
                          onMouseEnter={() => setHoveredCode(comp.code)}
                          onMouseLeave={() => setHoveredCode(null)}
                          onClick={e => { e.stopPropagation(); togglePin(comp.code) }}
                        />
                      </g>
                    )
                  })
                })}
              </svg>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Sem imagem cadastrada</div>
          )}
        </div>

        <div className="w-80 flex flex-col border-l border-gray-200 bg-white flex-shrink-0">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar componente..."
                className="w-full h-8 border border-gray-200 rounded-lg pl-8 pr-3 text-xs text-gray-800 focus:outline-none focus:border-blue-400"/>
            </div>
          </div>

          <div className="grid grid-cols-[36px_1fr_32px_32px] px-3 py-1.5 border-b border-gray-100 bg-gray-50">
            {['Cód.','Descrição','Un.','Qtd.'].map((h, i) => (
              <span key={h} className={`text-[9px] font-bold text-gray-400 uppercase tracking-wider ${i >= 2 ? 'text-center' : ''}`}>{h}</span>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0
              ? <div className="text-center py-8 text-xs text-gray-400">Nenhum resultado</div>
              : filtered.map(comp => {
                  const isPin = comp.code === pinnedCode
                  const isHov = comp.code === hoveredCode
                  return (
                    <div key={comp.code}
                      className={`grid grid-cols-[36px_1fr_32px_32px] items-center px-3 py-2 cursor-pointer border-b border-gray-100 border-l-2 transition-all ${
                        isPin ? 'bg-amber-50 border-l-amber-400' :
                        isHov ? 'bg-blue-50 border-l-blue-400' :
                        'border-l-transparent hover:bg-gray-50'
                      }`}
                      onMouseEnter={() => setHoveredCode(comp.code)}
                      onMouseLeave={() => setHoveredCode(null)}
                      onClick={() => togglePin(comp.code)}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-[2px] flex-shrink-0" style={{background: comp.color}}/>
                        <span className={`text-[10px] font-mono font-medium ${isPin ? 'text-amber-700' : 'text-gray-400'}`}>{comp.code}</span>
                      </div>
                      <span className={`text-[11px] font-medium leading-tight pr-1 ${isPin ? 'text-amber-800' : 'text-gray-700'}`}>{comp.name}</span>
                      <span className="text-[10px] text-gray-400 text-center font-mono">{comp.unit}</span>
                      <div className={`text-[11px] font-bold text-center h-5 flex items-center justify-center rounded mx-0.5 ${
                        isPin ? 'bg-amber-400 text-white' :
                        isHov ? 'bg-blue-500 text-white' :
                        'bg-gray-100 text-gray-600'
                      }`}>{comp.qty}</div>
                    </div>
                  )
                })
            }
          </div>

          <div className="border-t border-gray-200 bg-[#0d2137] p-4 flex-shrink-0 min-h-[130px] flex flex-col justify-center">
            {activeCode ? (() => {
              const comp = hotspots.find(c => c.code === activeCode)
              if (!comp) return null
              return <>
                <div className="text-[9px] font-mono text-white/30 tracking-widest mb-1">// CÓD. {comp.code}</div>
                <div className="text-sm font-semibold text-white mb-2 leading-snug">{comp.name}</div>
                <div className="flex gap-2 mb-2">
                  <div className="bg-white/8 border border-white/10 rounded px-2 py-1 text-[10px] text-white/40">Unid. <b className="text-white font-mono">{comp.unit}</b></div>
                  <div className="bg-white/8 border border-white/10 rounded px-2 py-1 text-[10px] text-white/40">Qtd. <b className="text-white font-mono">{comp.qty}</b></div>
                  <div className="bg-white/8 border border-white/10 rounded px-2 py-1 text-[10px] text-white/40">Áreas <b className="text-white font-mono">{comp.polys.length}</b></div>
                </div>
                {comp.desc
                  ? <p className="text-[10px] text-white/50 leading-relaxed">{comp.desc}</p>
                  : <p className="text-[10px] text-white/20 italic">Sem descrição cadastrada.</p>
                }
              </>
            })() : (
              <p className="text-[11px] text-white/20 text-center leading-relaxed">Passe o mouse ou clique<br/>em um componente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
