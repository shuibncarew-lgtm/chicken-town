import { Plus } from 'lucide-react'
import { MenuItem } from '../types'
import { formatLe } from '../lib/currency'

interface ProductCardProps {
  item: MenuItem
  onAdd: (item: MenuItem) => void
  onClick: () => void
}

export default function ProductCard({ item, onAdd, onClick }: ProductCardProps) {
  return (
    <div className="rounded-card bg-white p-3 shadow-sm">
      <button onClick={onClick} className="block w-full text-left">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-surface">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span className="font-display text-lg text-black/15">CT</span>
          )}
        </div>
        <p className="mt-2 font-display text-[15px] uppercase leading-tight tracking-wide text-black">
          {item.name}
        </p>
        <div className="mt-1 flex items-end justify-between">
          <p className="font-display text-[15px] uppercase text-black">
            {formatLe(item.price)}
          </p>
        </div>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onAdd(item) }}
        aria-label={`Add ${item.name} to cart`}
        className="mt-2 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>
    </div>
  )
}
