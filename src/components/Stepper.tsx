import { Minus, Plus } from 'lucide-react'

interface StepperProps {
  quantity: number
  onChange: (quantity: number) => void
  variant?: 'light' | 'dark'
}

export default function Stepper({ quantity, onChange, variant = 'light' }: StepperProps) {
  const isLight = variant === 'light'
  const bg = isLight ? 'bg-surface' : 'bg-cream'
  const text = isLight ? 'text-black' : 'text-black'
  const btnBg = isLight ? 'bg-cream' : 'bg-surface'

  return (
    <div className={`inline-flex items-center gap-1 rounded-pill ${bg} p-1`}>
      <button
        onClick={() => onChange(Math.max(0, quantity - 1))}
        aria-label="Decrease quantity"
        className={`flex h-9 w-9 items-center justify-center rounded-full ${btnBg} ${text} transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`}
      >
        <Minus size={16} strokeWidth={2.5} />
      </button>
      <span className={`min-w-[24px] text-center text-sm font-bold ${text}`}>{quantity}</span>
      <button
        onClick={() => onChange(quantity + 1)}
        aria-label="Increase quantity"
        className={`flex h-9 w-9 items-center justify-center rounded-full ${btnBg} ${text} transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`}
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}
