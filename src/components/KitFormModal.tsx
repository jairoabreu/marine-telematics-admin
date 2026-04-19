// src/components/KitFormModal.tsx

import { useState, useRef } from 'react'
import { Kit, HotspotComponent, getImageUrl } from '../lib/supabase'
import { createKit, updateKit } from '../lib/kitService'
import { X, Upload, FileJson, CheckCircle2, AlertCircle } from 'lucide-react'

interface Props {
  kit?: Kit | null
  onClose: () => void
  onSaved: () => void
}

export default function KitFormModal({ kit, onClose, onSaved }: Props) {
  const isEdit = !!kit
  const [name, setName] = useState(kit?.name ?? '')
  const [description, setDescription] = useState(kit?.description ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(getImageUrl(kit?.image_path ?? null))
  const [hotspots, setHotspots] = useState<HotspotComponent[]>(kit?.hotspots ?? [])
  const [jsonFileName, setJsonFileName] = useState<string | null>(kit?.hotspots ? 'hotspots carregados' : null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleJsonChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setJsonFileName(file.name)
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(parsed)) throw new Error('JSON deve ser um array')
        setHotspots(parsed as HotspotComponent[])
        setError(null)
      } catch (err: any) { setError('JSON invÃ¡lido: ' + err.message) }
    }
    reader.readAsText(file)
  }

  async function handleSubmit() {
    if (!name.trim()) { setError('Nome Ã© obrigatÃ³rio.'); return }
    setLoading(true); setError(null)
    try {
      if (isEdit) { await updateKit(kit!.id, { name, description, imageFile, hotspots, currentImagePath: kit!.image_path }) }
      else { await createKit({ name, description, imageFile, hotspots }) }
      onSaved()
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Editar Kit' : 'Novo Kit'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nome do Kit *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: CM300HD 2 Motores" className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-400"/></div>
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">DescriÃ§Ã£o</label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="InstalaÃ§Ã£o tÃ­pica para..." rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"/></div>
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Imagem do Diagrama</label><div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-300 transition-colors" onClick={() => imgInputRef.current?.click()}>{imagePreview ? <img src={imagePreview} alt="preview" className="w-full h-40 object-cover object-left-top"/> : <div className="h-32 flex flex-col items-center justify-center gap-2 text-gray-400"><Upload size={20}/><span className="text-xs">Clique para enviar imagem</span></div>}</div><input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange}/></div>
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Arquivo de Hotspots (JSON)</label><button onClick={() => jsonInputRef.current?.click()} className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2"><FileJson size={15} className="text-gray-400"/>{jsonFileName ? <span className="text-green-600 font-medium flex items-center gap-1.5"><CheckCircle2 size={13}/>{jsonFileName}</span> : <span>Selecionar .json exportado do editor</span>}</button><input ref={jsonInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleJsonChange}/>{hotspots.length > 0 && <p className="mt-1.5 text-xs text-gray-400">{hotspots.length} componentes carregados</p>}</div>
          {error && <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-600"><AlertCircle size={13} className="mt-0.5 flex-shrink-0"/>{error}</div>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">{loading ? 'Salvando...' : isEdit ? 'Salvar alteraÃ§Ãµes' : 'Criar kit'}</button>
        </div>
      </div>
    </div>
  )
}