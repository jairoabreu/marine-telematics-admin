// src/components/HotspotEditorModal.tsx
import { useState, useRef, useEffect } from 'react'
import { HotspotComponent, HotspotPoint } from '../lib/supabase'
import { X, Plus, Trash2, Check, Undo, Edit3 } from 'lucide-react'

interface Props {
  imageUrl: string
  initialHotspots: HotspotComponent[]
  onClose: () => void
  onSave: (hotspots: HotspotComponent[]) => void
}

const COLORS = ['#1e6fcc','#dc2626','#16a34a','#ea580c','#9333ea','#0891b2','#ca8a04','#db2777','#4f46e5','#059669','#d97706','#7c3aed','#be123c']

export default function HotspotEditorModal({ imageUrl, initialHotspots, onClose, onSave }: Props) {
  const [components, setComponents] = useState<HotspotComponent[]>(initialHotspots.length ? initialHotspots : [])
  const [selectedIdx, setSelectedIdx] = useState<number>(-1)
  const [currentPoly, setCurrentPoly] = useState<HotspotPoint[]>([])
  const [imgDims, setImgDims] = useState({ w: 2432, h: 1508 })
  const [zoom, setZoom] = useState(50)
  const imgRef = useRef<HTMLImageElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Load image dimensions
  useEffect(() => {
    const img = new Image()
    img.onload = () => setImgDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = imageUrl
  }, [imageUrl])

  function addComponent() {
    const code = String(components.length ? Math.max(...components.map(c => parseInt(c.code) || 0)) + 1 : 1)
    const newComp: HotspotComponent = {
      code,
      name: 'Novo componente',
      unit: 'UN',
      qty: 1,
      color: COLORS[components.length % COLORS.length],
      desc: '',
      polys: []
    }
    setComponents([...components, newComp])
    setSelectedIdx(components.length)
    setCurrentPoly([])
  }

  function updateSelected(patch: Partial<HotspotComponent>) {
    if (selectedIdx < 0) return
    const copy = [...components]
    copy[selectedIdx] = { ...copy[selectedIdx], ...patch }
    setComponents(copy)
  }

  function removeComponent(idx: number) {
    const copy = components.filter((_, i) => i !== idx)
    setComponents(copy)
    if (selectedIdx === idx) { setSelectedIdx(-1); setCurrentPoly([]) }
    else if (selectedIdx > idx) setSelectedIdx(selectedIdx - 1)
  }

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if (selectedIdx < 0) return
    const rect = svgRef.current!.getBoundingClientRect()
    const scale = imgDims.w / rect.width
    const x = Math.round((e.clientX - rect.left) * scale)
    const y = Math.round((e.clientY - rect.top) * scale)
    setCurrentPoly([...currentPoly, { x, y }])
  }

  function handleSvgDoubleClick(e: React.MouseEvent<SVGSVGElement>) {
    e.preventDefault()
    if (selectedIdx < 0 || currentPoly.length < 3) return
    const copy = [...components]
    copy[selectedIdx] = { ...copy[selectedIdx], polys: [...copy[selectedIdx].polys, currentPoly] }
    setComponents(copy)
    setCurrentPoly([])
  }

  function undoLastPoint() { setCurrentPoly(currentPoly.slice(0, -1)) }

  function removeLastPoly() {
    if (selectedIdx < 0) return
    const copy = [...components]
    copy[selectedIdx] = { ...copy[selectedIdx], polys: copy[selectedIdx].polys.slice(0, -1) }
    setComponents(copy)
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(components, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'hotspots.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const selected = selectedIdx >= 0 ? components[selectedIdx] : null
  const scaledW = imgDims.w * zoom / 100
  const scaledH = imgDims.h * zoom / 100

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 bg-[#0d2137] flex-shrink-0">
        <Edit3 size={16} className="text-blue-400"/>
        <h2 className="text-sm font-semibold text-white">Editor de Hotspots</h2>
        <span className="text-xs text-white/40">{components.length} componentes · clique para adicionar ponto, duplo-clique para fechar polígono</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-white/40">Zoom</span>
          <input type="range" min={20} max={100} value={zoom} onChange={e => setZoom(+e.target.value)} className="w-24"/>
          <span className="text-xs font-mono text-white/60 w-10">{zoom}%</span>
          <button onClick={exportJson} className="h-8 px-3 rounded-lg text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors">
            Exportar JSON
          </button>
          <button onClick={() => onSave(components)} className="h-8 px-4 rounded-lg text-xs bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5">
            <Check size={13}/> Salvar {components.length} componentes
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X size={15}/>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-50 flex items-start justify-start p-4">
          <svg
            ref={svgRef}
            width={scaledW}
            height={scaledH}
            viewBox={`0 0 ${imgDims.w} ${imgDims.h}`}
            className="block flex-shrink-0 cursor-crosshair"
            onClick={handleSvgClick}
            onDoubleClick={handleSvgDoubleClick}
          >
            <image href={imageUrl} x={0} y={0} width={imgDims.w} height={imgDims.h} preserveAspectRatio="xMidYMid meet"/>

            {/* All completed polygons */}
            {components.map((c, ci) => c.polys.map((pts, pi) => (
              <polygon
                key={`${ci}-${pi}`}
                points={pts.map(p => `${p.x},${p.y}`).join(' ')}
                fill={c.color + '40'}
                stroke={c.color}
                strokeWidth={2 * 100/zoom}
                strokeLinejoin="round"
                style={{ pointerEvents: 'none' }}
              />
            )))}

            {/* Current polygon being drawn */}
            {currentPoly.length > 0 && selected && (
              <>
                <polyline
                  points={currentPoly.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={selected.color}
                  strokeWidth={2 * 100/zoom}
                  strokeDasharray={`${6 * 100/zoom} ${4 * 100/zoom}`}
                  style={{ pointerEvents: 'none' }}
                />
                {currentPoly.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={5 * 100/zoom} fill={selected.color} style={{ pointerEvents: 'none' }}/>
                ))}
              </>
            )}
          </svg>
        </div>

        {/* Sidebar */}
        <div className="w-96 flex flex-col border-l border-gray-200 bg-white flex-shrink-0 overflow-hidden">

          <div className="p-3 border-b border-gray-100 flex items-center gap-2">
            <button onClick={addComponent} className="h-9 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5">
              <Plus size={14}/> Novo componente
            </button>
            <button onClick={undoLastPoint} disabled={currentPoly.length === 0} className="h-9 px-3 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 disabled:opacity-40 transition-colors flex items-center gap-1.5">
              <Undo size={13}/> Desfazer ponto
            </button>
          </div>

          {/* Component list */}
          <div className="flex-1 overflow-y-auto">
            {components.length === 0 && (
              <div className="text-center py-10 px-6">
                <p className="text-xs text-gray-400 leading-relaxed">Clique em "Novo componente" para começar. Depois clique na imagem para adicionar pontos, duplo-clique para fechar o polígono.</p>
              </div>
            )}
            {components.map((c, idx) => (
              <div
                key={idx}
                onClick={() => { setSelectedIdx(idx); setCurrentPoly([]) }}
                className={`border-b border-gray-100 px-3 py-2.5 cursor-pointer transition-colors ${selectedIdx === idx ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded flex-shrink-0" style={{ background: c.color }}/>
                  <span className="text-xs font-mono font-semibold text-gray-500">{c.code}</span>
                  <span className="text-xs font-medium text-gray-800 flex-1 truncate">{c.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{c.polys.length} áreas</span>
                  <button onClick={e => { e.stopPropagation(); removeComponent(idx) }} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={11}/>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Selected component editor */}
          {selected && (
            <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-2 flex-shrink-0 max-h-[360px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Código</label>
                  <input value={selected.code} onChange={e => updateSelected({ code: e.target.value })} className="w-full h-8 border border-gray-200 rounded-lg px-2 text-xs font-mono focus:outline-none focus:border-blue-400"/>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Cor</label>
                  <div className="flex gap-1 flex-wrap">
                    {COLORS.map(col => (
                      <button key={col} onClick={() => updateSelected({ color: col })} className={`w-6 h-6 rounded ${selected.color === col ? 'ring-2 ring-offset-1 ring-gray-900' : ''}`} style={{ background: col }}/>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Nome</label>
                <input value={selected.name} onChange={e => updateSelected({ name: e.target.value })} className="w-full h-8 border border-gray-200 rounded-lg px-2 text-xs focus:outline-none focus:border-blue-400"/>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Unidade</label>
                  <input value={selected.unit} onChange={e => updateSelected({ unit: e.target.value })} className="w-full h-8 border border-gray-200 rounded-lg px-2 text-xs focus:outline-none focus:border-blue-400"/>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Quantidade</label>
                  <input type="number" min={1} value={selected.qty} onChange={e => updateSelected({ qty: +e.target.value })} className="w-full h-8 border border-gray-200 rounded-lg px-2 text-xs font-mono focus:outline-none focus:border-blue-400"/>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Descrição</label>
                <textarea value={selected.desc} onChange={e => updateSelected({ desc: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400 resize-none leading-relaxed"/>
              </div>
              {selected.polys.length > 0 && (
                <button onClick={removeLastPoly} className="w-full h-8 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5">
                  <Trash2 size={11}/> Remover última área ({selected.polys.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
