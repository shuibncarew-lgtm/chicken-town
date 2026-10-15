import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Welcome() {
  const navigate = useNavigate()
  const { continueAsGuest } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <div className="flex flex-col items-center px-6 pt-16">
        <h1 className="font-display text-[64px] uppercase leading-[0.9] tracking-tight">
          <span className="block text-cream">Chicken</span>
          <span className="block text-brand">Town</span>
        </h1>
      </div>

      <div className="mx-6 mt-10 flex flex-1 items-center justify-center overflow-hidden rounded-[22px] bg-surface">
        <span className="font-display text-sm uppercase tracking-widest text-black/30">
          Hero photo
        </span>
      </div>

      <div className="px-6 pb-10 pt-10">
        <h2 className="text-center font-display text-[42px] uppercase leading-[1.05] tracking-tight">
          <span className="block text-cream">Swit yu mot.</span>
          <span className="block text-brand">Swit yu lyf.</span>
        </h2>

        <div className="mt-10 flex flex-col gap-3">
          <button
            onClick={() => navigate('/sign-up')}
            className="flex h-14 w-full items-center justify-center rounded-pill bg-brand font-display text-lg uppercase tracking-wide text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Order now
          </button>

          <button
            onClick={() => navigate('/sign-in')}
            className="flex h-14 w-full items-center justify-center rounded-pill border-2 border-cream font-display text-lg uppercase tracking-wide text-cream transition-colors hover:bg-cream hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Sign in
          </button>

          <button
            onClick={continueAsGuest}
            className="mt-2 text-center text-cream underline decoration-cream/60 underline-offset-4 transition-colors hover:decoration-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream min-h-[44px]"
            style={{ fontSize: '48px', lineHeight: '48px' }}
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  )
}
