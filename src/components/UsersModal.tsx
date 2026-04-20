// src/components/UsersModal.tsx
import { useState, useEffect } from 'react'
import { Profile } from '../lib/supabase'
import { fetchProfiles, updateProfileRole, inviteUser } from '../lib/profileService'
import { X, UserPlus, Shield, User, Mail, Check, AlertCircle } from 'lucide-react'

interface Props { onClose: () => void }

export default function UsersModal({ onClose }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  // Form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'admin'|'user'>('user')
  const [creating, setCreating] = useState(false)

  async function load() {
    try { setLoading(true); setError(null); setProfiles(await fetchProfiles()) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function toggleRole(p: Profile) {
    const newRole = p.role === 'admin' ? 'user' : 'admin'
    setSavingId(p.id)
    try {
      await updateProfileRole(p.id, newRole)
      setProfiles(profiles.map(x => x.id === p.id ? { ...x, role: newRole } : x))
    } catch (e: any) { setError(e.message) }
    finally { setSavingId(null) }
  }

  async function handleCreate() {
    if (!email.trim() || !password.trim()) { setError('Email e senha obrigatórios.'); return }
    if (password.length < 6) { setError('Senha mínima: 6 caracteres.'); return }
    setCreating(true); setError(null)
    try {
      await inviteUser(email.trim(), password, fullName.trim(), role)
      setEmail(''); setPassword(''); setFullName(''); setRole('user'); setShowAdd(false)
      await load()
    } catch (e: any) { setError(e.message) }
    finally { setCreating(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Usuários</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">{profiles.length} usuário{profiles.length !== 1 ? 's' : ''} cadastrado{profiles.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAdd(!showAdd)} className="h-9 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5">
              <UserPlus size={13}/> Novo usuário
            </button>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X size={15}/></button>
          </div>
        </div>

        {showAdd && (
          <div className="p-4 bg-blue-50 border-b border-blue-100 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Nome completo</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="João Silva" className="w-full h-9 border border-gray-200 rounded-lg px-3 text-xs bg-white focus:outline-none focus:border-blue-400"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Permissão</label>
                <div className="flex gap-1">
                  {(['user','admin'] as const).map(r => (
                    <button key={r} onClick={() => setRole(r)} className={`flex-1 h-9 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${role === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                      {r === 'admin' ? <Shield size={12}/> : <User size={12}/>}
                      {r === 'admin' ? 'Admin' : 'Usuário'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Email *</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@email.com" className="w-full h-9 border border-gray-200 rounded-lg px-3 text-xs bg-white focus:outline-none focus:border-blue-400"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Senha inicial *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="mín. 6 caracteres" className="w-full h-9 border border-gray-200 rounded-lg px-3 text-xs bg-white focus:outline-none focus:border-blue-400"/>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="h-9 px-3 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
              <button onClick={handleCreate} disabled={creating} className="h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5">
                <Check size={13}/> {creating ? 'Criando...' : 'Criar usuário'}
              </button>
            </div>
            <p className="text-[10px] text-blue-700 leading-relaxed">O usuário receberá um email de confirmação. Ao confirmar, poderá fazer login com a senha definida acima.</p>
          </div>
        )}

        {error && (
          <div className="mx-6 my-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-600">
            <AlertCircle size={13} className="mt-0.5 flex-shrink-0"/>{error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading
            ? <div className="text-center py-10 text-xs text-gray-400">Carregando...</div>
            : profiles.length === 0
              ? <div className="text-center py-10 text-xs text-gray-400">Nenhum usuário.</div>
              : profiles.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${p.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      {p.role === 'admin' ? <Shield size={14}/> : <User size={14}/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{p.full_name || p.email}</div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1"><Mail size={10}/>{p.email}</div>
                    </div>
                    <button onClick={() => toggleRole(p)} disabled={savingId === p.id} className={`h-8 px-3 rounded-lg text-[11px] font-medium border transition-colors disabled:opacity-50 ${p.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                      {savingId === p.id ? '...' : (p.role === 'admin' ? 'Admin' : 'Usuário')}
                    </button>
                  </div>
                ))
          }
        </div>
      </div>
    </div>
  )
}
