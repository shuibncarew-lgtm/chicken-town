import { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  label: string
}

export default function IconButton({ children, label, className = '', ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
