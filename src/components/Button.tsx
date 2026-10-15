import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
  children: ReactNode
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-pill font-display uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 min-h-[44px] px-6 py-3 text-base'

  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    outline: 'border-2 border-cream text-cream bg-transparent hover:bg-cream hover:text-black',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
