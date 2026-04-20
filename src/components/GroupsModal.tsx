import { useState, useEffect } from 'react'
import { KitGroup } from '../lib/supabase'
import { fetchGroups, createGroup, updateGroup, deleteGroup } from '../lib/groupService'
import { X, Plus, Edit2, Trash2, Check, AlertCircle, FolderOpen } from 'lucide-react'

interface Props { onClose: () => void; onChange?: () => void }
const COLORS = ['#1e6fcc','#dc2626','#16a34a','#ea580c','#9333ea','#0891b2','#ca8a04','#db2777','#4f46e5','#059669','#d97706','#7c3aed']

export default function GroupsModal({ onClose, onChange }: Props) {
  const [groups, setGroups] = useState<KitGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)

  async function load() {
    try { setLoading(true); setError(null); setGroups(await fetchGroups()) }
    catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function startEdit(g: KitGroup) { setEditingId(g.id); setShowAdd(false); setName(g.name); setDescription(g.description ?? ''); setColor(g.color) }
  function startAdd() { setShowAdd(true); setEditingId(null); setName(''); setDescription(''); setColor(COLORS[0]) }
  function cancel() { setShowAdd(false); setEditingId(null) }

  async function handleSave() {
    if (!name.trim()) { setError('Nome obrigatorio.'); return }
    setSaving(true); setError(null)
    try {
      if (editingId) await updateGroup(editingId, { name, description, color })
      else await createGroup({ name, description, color })
      await load(); cancel(); onChange?.()
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este grupo? Os kits nao serao excluidos, apenas desvinculados.')) return
    try { await deleteGroup(id); await load(); onChange?.() } catch (e: any) { setError(e.message) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div><h2 className="text-base font-semibold text-gray-900">Grupos de kits</h2><p className="text-[11px] text-gray-400 mt-0.5">{groups.length} grupo{groups.length !== 1 ? 's' : ''}</p></div>
          <div className="flex items-center gap-2">
            <button onClick={startAdd} className="h-9 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"><Plus size={13}/> Novo grupo</button>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X size={15}/></button>
          </div>
        </div>
        {(showAdd || editingId) && (
          <div className="p-4 bg-blue-50 border-b border-blue-100 space-y-3">
            <div><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Nome *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Embarcacoes comerciais" className="w-full h-9 border border-gray-200 rounded-lg px-3 text-xs bg-white focus:outline-none focus:border-blue-400"/></div>
            <div><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Descricao</label><input value={description} onChange={e => setDescription(e.target.value)} placeholder="Opcional" className="w-full h-9 border border-gray-200 rounded-lg px-3 text-xs bg-white focus:outline-none focus:border-blue-400"/></div>
            <div><label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Cor</label><div className="flex flex-wrap gap-1.5">{COLORS.map(c => (<button key={c} onClick={() => setColor(c)} className={color === c ? 'w-7 h-7 rounded ring-2 ring-offset-1 ring-gray-900' : 'w-7 h-7 rounded'} style={{ background: c }}/>))}</div></div>
            <div className="flex justify-end gap-2">
              <button onClick={cancel} className="h-9 px-3 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"><Check size={13}/> {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar grupo'}</button>
            </div>
          </div>
        )}
        {error && (<div className="mx-6 my-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-600"><AlertCircle size={13} className="mt-0.5 flex-shrink-0"/>{error}</div>)}
        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="text-center py-10 text-xs text-gray-400">Carregando...</div>
            : groups.length === 0 ? <div className="text-center py-16 px-6"><FolderOpen size={28} className="mx-auto text-gray-300 mb-2"/><p className="text-xs text-gray-400">Nenhum grupo ainda. Crie seu primeiro grupo para organizar os kits.</p></div>
              : groups.map(g => (
                  <div key={g.id} className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="w-3 h-10 rounded flex-shrink-0" style={{ background: g.color }}/>
                    <div className="flex-1 min-w-0"><div className="text-sm font-medium text-gray-900 truncate">{g.name}</div>{g.description && <div className="text-[11px] text-gray-500 truncate">{g.description}</div>}</div>
                    <button onClick={() => startEdit(g)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-blue-600"><Edit2 size={13}/></button>
                    <button onClick={() => handleDelete(g.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={13}/></button>
                  </div>
                ))
          }
        </div>
      </div>
    </div>
  )
}
