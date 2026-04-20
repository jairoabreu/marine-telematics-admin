import { useState, useRef, useEffect } from 'react'
import { Kit, HotspotComponent, KitGroup, getImageUrl } from '../lib/supabase'
import { createKit, updateKit } from '../lib/kitService'
import { fetchGroups } from '../lib/groupService'
import { X, Upload, FileJson, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react'
import HotspotEditorModal from './HotspotEditorModal'

interface Props { kit?: Kit | null; onClose: () => void; onSaved: () => void }

export default function KitFormModal({ kit, onClose, onSaved }: Props) {
  const isEdit = !!kit
  const [name, setName] = useState(kit?.name ?? '')
  const [description, setDescription] = useState(kit?.description ?? '')
  const [groupId, setGroupId] = useState<string | null>(kit?.group_id ?? null)
  const [groups, setGroups] = useState<KitGroup[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(getImageUrl(kit?.image_path ?? null))
  const [hotspots, setHotspots] = useState<HotspotComponent[]>(kit?.hotspots ?? [])
  const [jsonFileName, setJsonFileName] = useState<string | null>(kit?.hotspots ? 'hotspots carregados' : null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const imgInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchGroups().then(setGroups).catch(() => {}) }, [])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setImageFile(file); setImagePreview(URL.createObjectURL(file))
  }

  function handleJsonChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setJsonFileName(file.name)
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(parsed)) throw new Error('JSON deve ser um array')
        setHotspots(parsed as HotspotComponent[]); setError(null)
      } catch (err: any) { setError('JSON invalido: ' + err.message) }
    }
    reader.readAsText(file)
  }

  async function handleSubmit() {
    if (!name.trim()) { setError('Nome eh obrigatorio.'); return }
    setLoading(true); setError(null)
    try {
      const payload: any = { name, description, imageFile, hotspots, group_id: groupId }
      if (isEdit) { await updateKit(kit!.id, { ...payload, currentImagePath: kit!.image_path }) }
      else { await createKit(payload) }
      onSaved()
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  return (<>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Editar Kit' : 'Novo Kit'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nome do Kit *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: CM300HD 2 Motores" className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-400"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Grupo</label>
            <select value={groupId ?? ''} onChange={e => setGroupId(e.target.value || null)} className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm bg-white focus:outline-none focus:border-blue-400">
              <option value="">Sem grupo</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Descricao</label>
            <textarea value={description ?? ''} onChange={e => setDescription(e.target.value)} placeholder="Instalacao tipica para..." rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Imagem do Diagrama</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-300 transition-colors bg-gray-50" onClick={() => imgInputRef.current?.click()}>
              {imagePreview ? <img src={imagePreview} alt="preview" className="w-full h-40 object-contain"/> : <div className="h-32 flex flex-col items-center justify-center gap-2 text-gray-400"><Upload size={20}/><span className="text-xs">Clique para enviar imagem</span></div>}
            </div>
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange}/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Hotspots (mapeamento)</label>
            {imagePreview && (
              <button onClick={() => setShowEditor(true)} className="w-full h-10 bg-blue-600 text-white rounded-lg px-3 text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-2">
                <Edit3 size={14}/> {hotspots.length > 0 ? 'Editar hotspots (' + hotspots.length + ')' : 'Desenhar hotspots na imagem'}
              </button>
            )}
            <button onClick={() => jsonInputRef.current?.click()} className="w-full h-9 border border-gray-200 rounded-lg px-3 text-xs text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-2">
              <FileJson size={13} className="text-gray-400"/>
              {jsonFileName ? <span className="text-green-600 font-medium flex items-center gap-1.5"><CheckCircle2 size={12}/>{jsonFileName}</span> : <span>Ou importar JSON existente</span>}
            </button>
            <input ref={jsonInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleJsonChange}/>
            {hotspots.length > 0 && <p className="mt-2 text-xs text-gray-400">{hotspots.length} componente{hotspots.length !== 1 ? 's' : ''} configurado{hotspots.length !== 1 ? 's' : ''}</p>}
          </div>
          {error && <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-600"><AlertCircle size={13} className="mt-0.5 flex-shrink-0"/>{error}</div>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{loading ? 'Salvando...' : isEdit ? 'Salvar alteracoes' : 'Criar kit'}</button>
        </div>
      </div>
    </div>
    {showEditor && imagePreview && (
      <HotspotEditorModal imageUrl={imagePreview} initialHotspots={hotspots} onClose={() => setShowEditor(false)} onSave={(h) => { setHotspots(h); setJsonFileName(h.length + ' componentes desenhados'); setShowEditor(false) }}/>
    )}
  </>)
}
