import { ButtonHTMLAttributes } from 'react'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  children: React.ReactNode
}

export default function Chip({ active = false, children, className = '', ...props }: ChipProps) {
  return (
    <button
      className={`whitespace-nowrap rounded-pill px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand min-h-[44px] ${
        active
          ? 'bg-black text-cream'
          : 'border border-black/20 bg-transparent text-secondary hover:border-black/40'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
