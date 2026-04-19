// src/App.tsx
import { useEffect, useState } from 'react'
import { supabase, Kit } from './lib/supabase'
import { useKits } from './hooks/useKits'
import KitCard from './components/KitCard'
import KitFormModal from './components/KitFormModal'
import KitViewerModal from './components/KitViewerModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import { Plus, LogOut, Search, LayoutGrid, List, Anchor, Loader2 } from 'lucide-react'

function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0d2137] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Anchor size={24} className="text-white"/>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Marine Telematics</h1>
          <p className="text-sm text-gray-400 mt-1">Área Administrativa</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              placeholder="seu@email.com"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              placeholder="••••••••"/>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full h-11 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin"/> : null}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Dashboard() {
  const { kits, loading, error, refetch } = useKits()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showForm, setShowForm] = useState(false)
  const [editKit, setEditKit] = useState<Kit | null>(null)
  const [viewKit, setViewKit] = useState<Kit | null>(null)
  const [deleteKit, setDeleteKit] = useState<Kit | null>(null)

  async function handleLogout() { await supabase.auth.signOut() }

  const filtered = kits.filter(k => !search || k.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-[#0d2137] border-b border-white/5 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <Anchor size={14} className="text-white"/>
            </div>
            <span className="text-sm font-semibold text-white">Marine Telematics</span>
            <span className="text-white/20 text-sm">·</span>
            <span className="text-xs text-white/40">Admin</span>
          </div>
          <div className="ml-auto">
            <button onClick={handleLogout}
              className="flex items-center gap-2 h-8 px-3 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <LogOut size={13}/> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
          <h1 className="text-base font-semibold text-gray-900 mr-2">Kits de Controle</h1>
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar kit..."
              className="w-full h-9 border border-gray-200 rounded-lg pl-8 pr-3 text-sm focus:outline-none focus:border-blue-400"/>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
                <LayoutGrid size={14}/>
              </button>
              <button onClick={() => setViewMode('list')}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}>
                <List size={14}/>
              </button>
            </div>
            <button onClick={() => setShowForm(true)}
              className="h-9 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus size={15}/> Novo Kit
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 size={20} className="animate-spin"/> Carregando kits...
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            Erro ao carregar kits: {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Anchor size={28} className="text-gray-300"/>
            </div>
            <h3 className="text-sm font-semibold text-gray-500 mb-1">
              {search ? 'Nenhum kit encontrado' : 'Nenhum kit cadastrado'}
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              {search ? 'Tente outro termo de busca' : 'Crie o primeiro kit de controle'}
            </p>
            {!search && (
              <button onClick={() => setShowForm(true)}
                className="h-9 px-5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                <Plus size={14}/> Criar primeiro kit
              </button>
            )}
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          viewMode === 'grid'
            ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map(kit => (
                  <KitCard key={kit.id} kit={kit}
                    onView={setViewKit}
                    onEdit={k => { setEditKit(k); setShowForm(true) }}
                    onDelete={setDeleteKit}/>
                ))}
              </div>
            : <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Kit','Componentes','Atualizado','Ações'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(kit => (
                      <tr key={kit.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{kit.name}</div>
                          {kit.description && <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{kit.description}</div>}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{kit.hotspots?.length ?? 0} componentes</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(kit.updated_at).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => setViewKit(kit)} className="h-7 px-3 rounded-lg text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">Ver</button>
                            <button onClick={() => { setEditKit(kit); setShowForm(true) }} className="h-7 px-3 rounded-lg text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Editar</button>
                            <button onClick={() => setDeleteKit(kit)} className="h-7 px-2 rounded-lg text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">✕</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        )}
      </main>

      {showForm && (
        <KitFormModal kit={editKit}
          onClose={() => { setShowForm(false); setEditKit(null) }}
          onSaved={() => { setShowForm(false); setEditKit(null); refetch() }}/>
      )}
      {viewKit && <KitViewerModal kit={viewKit} onClose={() => setViewKit(null)}/>}
      {deleteKit && (
        <DeleteConfirmModal kit={deleteKit}
          onClose={() => setDeleteKit(null)}
          onDeleted={() => { setDeleteKit(null); refetch() }}/>
      )}
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState<any>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#0d2137] flex items-center justify-center">
        <Loader2 size={24} className="text-blue-400 animate-spin"/>
      </div>
    )
  }
  return session ? <Dashboard/> : <AuthPage/>
}
