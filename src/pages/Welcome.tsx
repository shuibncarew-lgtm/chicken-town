import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Welcome() {
  const navigate = useNavigate()
  const { continueAsGuest } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center">
          <img
            src="/icons/icon-192.png"
            alt="Chicken Town logo"
            className="h-16 w-16 object-contain"
          />
          <h1 className="mt-4 font-display text-[64px] uppercase leading-[0.9] tracking-tight">
            <span className="block text-cream">Chicken</span>
            <span className="block text-brand">Town</span>
          </h1>
        </div>

        <h2 className="mt-8 text-center font-display text-[42px] uppercase leading-[1.05] tracking-tight">
          <span className="block text-cream">Swit yu mot.</span>
          <span className="block text-brand">Swit yu lyf.</span>
        </h2>
      </div>

      <div
        className="flex flex-col gap-3 px-6"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
      >
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
          className="text-center text-cream underline decoration-cream/60 underline-offset-4 transition-colors hover:decoration-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream min-h-[44px] text-base"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}
        >
          Continue as guest
        </button>
      </div>
    </div>
  )
}
