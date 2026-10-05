import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-page-light dark:bg-page-dark">
      <div className="flex flex-1 items-center justify-center bg-fill-light dark:bg-fill-dark">
        <p className="text-muted-light dark:text-muted-dark">Food photo</p>
      </div>

      <div className="rounded-t-[28px] bg-card-light p-5 dark:bg-card-dark">
        <p className="text-sm font-bold tracking-wide text-brand">CHICKEN TOWN</p>
        <h1 className="mt-2 text-[22px] font-bold leading-tight text-ink-light dark:text-ink-dark">
          Hot, fresh and on its way.
        </h1>
        <p className="mt-1 text-sm text-muted-light dark:text-muted-dark">
          Swit u mot, swit u lyf.
        </p>

        <button
          onClick={() => navigate('/sign-up')}
          className="mt-4 w-full rounded-button bg-brand py-3.5 text-center text-sm font-bold text-white"
        >
          Order now
        </button>

        <button
          onClick={() => navigate('/sign-in')}
          className="mt-2 w-full rounded-button bg-fill-light py-3.5 text-center text-sm font-medium text-ink-light dark:bg-fill-dark dark:text-ink-dark"
        >
          Sign in
        </button>

        <button
          onClick={() => navigate('/')}
          className="mt-3 w-full text-center text-sm text-muted-light dark:text-muted-dark"
        >
          Continue as guest
        </button>
      </div>
    </div>
  )
}
