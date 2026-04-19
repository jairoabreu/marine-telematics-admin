// src/components/DeleteConfirmModal.tsx
import { useState } from 'react'
import { Kit } from '../lib/supabase'
import { deleteKit } from '../lib/kitService'
import { Trash2, X, AlertTriangle } from 'lucide-react'
interface Props { kit: Kit; onClose: () => void; onDeleted: () => void }
export default function DeleteConfirmModal({ kit, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function handleDelete() {
    setLoading(true); setError(null)
    try { await deleteKit(kit); onDeleted() }
    catch (err: any) { setError(err.message); setLoading(false) }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-red-600"><AlertTriangle size={16}/><span className="text-sm font-semibold">Excluir kit</span></div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X size={15}/></button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 leading-relaxed mb-1">Tem certeza que deseja excluir o kit</p>
          <p className="text-sm font-semibold text-gray-900 mb-4">"{kjit.name}"?</p>
          <p className="text-xs text-gray-400">Esta ação é irreversível. A imagem e todos os dados de mapeamento serão removidos.</p>
          {error && <p className="mt-3 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 h-10 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bv-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"><Trash2 size={13}/>{loading ? 'Excluindo...' : 'Excluir'}</button>
        </div>
      </div>
    </div>
  )
}