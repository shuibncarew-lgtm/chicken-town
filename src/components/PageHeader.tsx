import { ChevronLeft } from 'lucide-react'
import IconButton from './IconButton'

interface PageHeaderProps {
  title: string
  onBack?: () => void
}

export default function PageHeader({ title, onBack }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 pt-6">
      {onBack && (
        <IconButton label="Go back" onClick={onBack} className="border border-black/10 bg-transparent text-black">
          <ChevronLeft size={20} strokeWidth={2} />
        </IconButton>
      )}
      <h1 className="font-display text-2xl uppercase tracking-wide text-black">{title}</h1>
    </div>
  )
}
