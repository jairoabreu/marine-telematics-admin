import { useEffect, useState, useMemo } from 'react'
import { supabase, Kit, KitGroup } from './lib/supabase'
import { useKits } from './hooks/useKits'
import { useProfile } from './hooks/useProfile'
import { fetchGroups } from './lib/groupService'
import KitCard from './components/KitCard'
import KitFormModal from './components/KitFormModal'
import KitViewerModal from './components/KitViewerModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import UsersModal from './components/UsersModal'
import GroupsModal from './components/GroupsModal'
import { Plus, LogOut, Search, Anchor, Loader2, Users as UsersIcon, FolderOpen, Filter } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  const { profile, isAdmin, loading: profileLoading } = useProfile()
  const { kits, loading, error, reload } = useKits()

  const [groups, setGroups] = useState<KitGroup[]>([])
  const [filterGroupId, setFilterGroupId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [modal, setModal] = useState<'create' | 'edit' | 'view' | 'delete' | 'users' | 'groups' | null>(null)
  const [selected, setSelected] = useState<Kit | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setCheckingAuth(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => { setSession(s) })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function loadGroups() {
    try { setGroups(await fetchGroups()) } catch {}
  }
  useEffect(() => { if (session) loadGroups() }, [session])

  const groupMap = useMemo(() => { const m = new Map<string, KitGroup>(); groups.forEach(g => m.set(g.id, g)); return m }, [groups])

  const visibleKits = useMemo(() => {
    let arr = kits
    if (filterGroupId === 'none') arr = arr.filter(k => !k.group_id)
    else if (filterGroupId) arr = arr.filter(k => k.group_id === filterGroupId)
    if (search.trim()) arr = arr.filter(k => k.name.toLowerCase().includes(search.toLowerCase()))
    return arr
  }, [kits, filterGroupId, search])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoggingIn(true); setLoginError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setLoginError(error.message)
    setLoggingIn(false)
  }

  async function handleSignOut() { await supabase.auth.signOut() }

  if (checkingAuth) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" size={24}/></div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d2137] via-[#0d2137] to-[#1a3a5c] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
          <div className="flex items-center gap-2 mb-1"><Anchor size={20} className="text-blue-600"/><h1 className="text-lg font-bold text-gray-900">Marine Telematics</h1></div>
          <p className="text-[11px] text-gray-400 mb-6">Area administrativa</p>
          <div className="space-y-3">
            <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-400" required/></div>
            <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Senha</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-400" required/></div>
            {loginError && <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{loginError}</div>}
            <button type="submit" disabled={loggingIn} className="w-full h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{loggingIn ? 'Entrando...' : 'Entrar'}</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0d2137] border-b border-black/20">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 text-white"><Anchor size={17} className="text-blue-400"/><span className="text-sm font-semibold">Marine Telematics</span></div>
          <div className="ml-auto flex items-center gap-2">
            {isAdmin && (<>
              <button onClick={() => setModal('groups')} className="h-8 px-3 rounded-lg text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 flex items-center gap-1.5"><FolderOpen size={12}/> Grupos</button>
              <button onClick={() => setModal('users')} className="h-8 px-3 rounded-lg text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 flex items-center gap-1.5"><UsersIcon size={12}/> Usuarios</button>
            </>)}
            <span className="text-[11px] text-white/40 font-mono hidden sm:inline">{profile?.email}</span>
            {isAdmin && <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-1 rounded">ADMIN</span>}
            <button onClick={handleSignOut} className="h-8 w-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10" title="Sair"><LogOut size={13}/></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-xl font-bold text-gray-900">Kits</h1>
          <span className="text-xs text-gray-400 font-mono">{visibleKits.length}/{kits.length}</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="h-9 border border-gray-200 rounded-lg pl-9 pr-3 text-sm w-48 focus:outline-none focus:border-blue-400"/></div>
            {isAdmin && <button onClick={() => { setSelected(null); setModal('create') }} className="h-9 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"><Plus size={13}/> Novo Kit</button>}
          </div>
        </div>

        <div className="flex gap-5">
          <aside className="w-48 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2 px-2"><Filter size={11}/> Filtrar por grupo</div>
            <div className="space-y-0.5">
              <button onClick={() => setFilterGroupId(null)} className={(filterGroupId === null ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100') + ' w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2'}>Todos <span className="ml-auto text-[10px] text-gray-400 font-mono">{kits.length}</span></button>
              {groups.map(g => {
                const count = kits.filter(k => k.group_id === g.id).length
                return (<button key={g.id} onClick={() => setFilterGroupId(g.id)} className={(filterGroupId === g.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100') + ' w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2'}><div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }}/>{g.name}<span className="ml-auto text-[10px] text-gray-400 font-mono">{count}</span></button>)
              })}
              <button onClick={() => setFilterGroupId('none')} className={(filterGroupId === 'none' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100') + ' w-full text-left px-3 py-2 rounded-lg text-xs italic flex items-center gap-2'}>Sem grupo <span className="ml-auto text-[10px] text-gray-400 font-mono">{kits.filter(k => !k.group_id).length}</span></button>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 mb-4">Erro ao carregar kits: {error}</div>}
            {loading || profileLoading
              ? <div className="text-center py-20"><Loader2 className="animate-spin text-gray-400 mx-auto" size={20}/></div>
              : visibleKits.length === 0
                ? <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center"><p className="text-sm text-gray-400">Nenhum kit encontrado.</p>{isAdmin && kits.length === 0 && <button onClick={() => { setSelected(null); setModal('create') }} className="mt-3 text-xs text-blue-600 hover:text-blue-800">Criar seu primeiro kit</button>}</div>
                : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{visibleKits.map(k => (<KitCard key={k.id} kit={k} group={k.group_id ? groupMap.get(k.group_id) : null} isAdmin={isAdmin} onView={() => { setSelected(k); setModal('view') }} onEdit={() => { setSelected(k); setModal('edit') }} onDelete={() => { setSelected(k); setModal('delete') }}/>))}</div>
            }
          </main>
        </div>
      </div>

      {modal === 'create' && <KitFormModal onClose={() => setModal(null)} onSaved={() => { setModal(null); reload() }}/>}
      {modal === 'edit' && selected && <KitFormModal kit={selected} onClose={() => setModal(null)} onSaved={() => { setModal(null); reload() }}/>}
      {modal === 'view' && selected && <KitViewerModal kit={selected} onClose={() => setModal(null)}/>}
      {modal === 'delete' && selected && <DeleteConfirmModal kit={selected} onClose={() => setModal(null)} onDeleted={() => { setModal(null); reload() }}/>}
      {modal === 'users' && <UsersModal onClose={() => setModal(null)}/>}
      {modal === 'groups' && <GroupsModal onClose={() => setModal(null)} onChange={loadGroups}/>}
    </div>
  )
}
