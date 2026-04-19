// src/components/KitCard.tsx
import { Kit, getImageUrl } from '../lib/supabase'
import { Eye, Pencil, Trash2, Layers, Calendar } from 'lucide-react'
interface Props { kit: Kit; onView: (kit: Kit) => void; onEdit: (kit: Kit) => void; onDelete: (kit: Kit) => void }
export default function KitCard({ kit, onView, onEdit, onDelete }: Props) {
  const imageUrl = getImageUrl(kit.image_path)
  const compCount = kit.hotspots?.length ?? 0
  const date = new Date(kit.updated_at).toLocaleDateString('pt-BR')
  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-200">
      <div className="relative h-44 bg-gray-50 overflow-hidden cursor-pointer" onClick={() => onView(kit)}>
        {imageUrl ? <img src={imageUrl} alt={kit.name} className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"/> : <div className="w-full h-full flex items-center justify-center text-gray-300"><svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>}
        <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors flex items-center justify-center"><div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700 flex items-center gap-1.5"><Eye size={12}/> Visualizar</div></div>
        {compCount > 0 && <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-2 py-0.5 text-xs font-semibold text-gray-600 flex items-center gap-1"><Layers size={10}/>{compCount}</div>}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-1">{kit.name}</h3>
        {kit.description ? <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{kit.description}</p> : <p className="text-xs text-gray-300 italic mb-3">Sem descriÃ§Ã£o</p>}
        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-3"><Calendar size={10}/> Atualizado em {date}</div>
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button onClick={() => onView(kit)} className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bs-blue-100 transition-colors"><Eye size={12}/> Ver</button>
          <button onClick={() => onEdit(kit)} className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"><Pencil size={12}/> Editar</button>
          <button onClick={() => onDelete(kit)} className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bv-red-50 hover:text-red-600 transition-colors"><Trash2 size={13}/></button>
        </div>
      </div>
    </div>
  )
}