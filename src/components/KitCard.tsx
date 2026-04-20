import { Kit, KitGroup, getImageUrl } from '../lib/supabase'
import { Eye, Pencil, Trash2, ImageOff } from 'lucide-react'

interface Props {
  kit: Kit
  group?: KitGroup | null
  isAdmin: boolean
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function KitCard({ kit, group, isAdmin, onView, onEdit, onDelete }: Props) {
  const imageUrl = getImageUrl(kit.image_path)
  const hotspotsCount = Array.isArray(kit.hotspots) ? kit.hotspots.length : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-40 bg-gray-50 border-b border-gray-100 overflow-hidden cursor-pointer" onClick={onView}>
        {imageUrl
          ? <img src={imageUrl} alt={kit.name} className="w-full h-full object-contain"/>
          : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff size={24}/></div>
        }
        {group && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] font-medium text-gray-700 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: group.color }}/>
            {group.name}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 leading-tight truncate mb-1">{kit.name}</h3>
        <p className="text-[11px] text-gray-400 line-clamp-2 min-h-[2.2em]">{kit.description || 'Sem descricao'}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] font-mono text-gray-400">{hotspotsCount} componente{hotspotsCount !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-1">
            <button onClick={onView} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Visualizar"><Eye size={13}/></button>
            {isAdmin && (<>
              <button onClick={onEdit} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Editar"><Pencil size={13}/></button>
              <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Excluir"><Trash2 size={13}/></button>
            </>)}
          </div>
        </div>
      </div>
    </div>
  )
}
