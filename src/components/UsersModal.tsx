import { useState, useEffect } from 'react'
import { Profile, supabase } from '../lib/supabase'
import { fetchProfiles, updateProfile, deleteProfile, inviteUser } from '../lib/profileService'
import { X, UserPlus, Shield, User, Mail, Check, AlertCircle, Pencil, Trash2 } from 'lucide-react'

interface Props { onClose: () => void }

export default function UsersModal({ onClose }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'admin'|'user'>('user')
  const [saving, setSaving] = useState(false)

  async function load() {
    try { setLoading(true); setError(null); setProfiles(await fetchProfiles()) }
    catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [])

  function startAdd() {
    setMode('add'); setEditingId(null)
    setEmail(''); setPassword(''); setFullName(''); setRole('user')
    setError(null)
  }

  function startEdit(p: Profile) {
    setMode('edit'); setEditingId(p.id)
    setEmail(p.email); setPassword('')
    setFullName(p.full_name ?? '')
    setRole(p.role)
    setError(null)
  }

  function cancel() { setMode('list'); setEditingId(null); setError(null) }

  async function handleSave() {
    setError(null)
    if (mode === 'add') {
      if (!email.trim() || !password.trim()) { setError('Email e senha obrigatorios.'); return }
      if (password.length < 6) { setError('Senha minima: 6 caracteres.'); return }
      setSaving(true)
      try {
        await inviteUser(email.trim(), password, fullName.trim(), role)
        await load(); cancel()
      } catch (e: any) { setError(e.message) } finally { setSaving(false) }
    } else if (mode === 'edit' && editingId) {
      setSaving(true)
      try {
        await updateProfile(editingId, { full_name: fullName.trim(), role })
        await load(); cancel()
      } catch (e: any) { setError(e.message) } finally { setSaving(false) }
    }
  }

  async function handleDelete(id: string) {
    if (id === currentUserId) { setError('Voce nao pode deletar sua propria conta.'); return }
    if (!confirm('Remover este usuario? Ele perdera todos os acessos imediatamente. (A conta de login continua existindo no Supabase — remova manualmente em Authentication > Users para limpeza total.)')) return
    setDeletingId(id); setError(null)
    try { await deleteProfile(id); await load() }
    catch (e: any) { setError(e.message) } finally { setDeletingId(null) }
  }

  const formOpen = mode !== 'list'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Usuarios</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">{profiles.length} usuario{profiles.length !== 1 ? 's' : ''} cadastrado{profiles.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {!formOpen && <button onClick={startAdd} className="h-9 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"><UserPlus size={13}/> Novo usuario</button>}
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X size={15}/></button>
          </div>
        </div>

        {formOpen && (
          <div className="p-4 bg-blue-50 border-b border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-blue-900">{mode === 'add' ? 'Novo usuario' : 'Editar usuario'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Nome completo</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Joao Silva" className="w-full h-9 border border-gray-200 rounded-lg px-3 text-xs bg-white focus:outline-none focus:border-blue-400"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Permissao</label>
                <div className="flex gap-1">
                  {(['user','admin'] as const).map(r => (
                    <button key={r} onClick={() => setRole(r)} className={`flex-1 h-9 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${role === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                      {r === 'admin' ? <Shield size={12}/> : <User size={12}/>}{r === 'admin' ? 'Admin' : 'Usuario'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {mode === 'add' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Email *</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@email.com" className="w-full h-9 border border-gray-200 rounded-lg px-3 text-xs bg-white focus:outline-none focus:border-blue-400"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Senha inicial *</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="min. 6 caracteres" className="w-full h-9 border border-gray-200 rounded-lg px-3 text-xs bg-white focus:outline-none focus:border-blue-400"/>
                </div>
              </div>
            )}
            {mode === 'edit' && (
              <div className="text-[11px] text-blue-700 bg-blue-100 border border-blue-200 rounded-lg px-3 py-2">Email: <b className="font-mono">{email}</b> — nao pode ser alterado aqui.</div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={cancel} className="h-9 px-3 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
                <Check size={13}/> {saving ? 'Salvando...' : mode === 'add' ? 'Criar usuario' : 'Salvar alteracoes'}
              </button>
            </div>
            {mode === 'add' && <p className="text-[10px] text-blue-700 leading-relaxed">O usuario recebera um email de confirmacao. Ao confirmar, podera fazer login com a senha definida acima.</p>}
          </div>
        )}

        {error && (
          <div className="mx-6 my-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-600">
            <AlertCircle size={13} className="mt-0.5 flex-shrink-0"/>{error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="text-center py-10 text-xs text-gray-400">Carregando...</div>
            : profiles.length === 0 ? <div className="text-center py-10 text-xs text-gray-400">Nenhum usuario.</div>
              : profiles.map(p => {
                  const isMe = p.id === currentUserId
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${p.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        {p.role === 'admin' ? <Shield size={14}/> : <User size={14}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
                          {p.full_name || p.email}
                          {isMe && <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">VOCE</span>}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1"><Mail size={10}/>{p.email}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${p.role === 'admin' ? 'text-blue-700 bg-blue-100' : 'text-gray-600 bg-gray-100'}`}>
                        {p.role === 'admin' ? 'ADMIN' : 'USUARIO'}
                      </span>
                      <button onClick={() => startEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors" title="Editar"><Pencil size={13}/></button>
                      <button onClick={() => handleDelete(p.id)} disabled={isMe || deletingId === p.id} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400" title={isMe ? 'Voce nao pode se deletar' : 'Remover usuario'}><Trash2 size={13}/></button>
                    </div>
                  )
                })
          }
        </div>
      </div>
    </div>
  )
}
