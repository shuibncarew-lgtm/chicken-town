import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    if (!fullName || !phone || !email || !password) return
    setLoading(true)
    setError('')
    try {
      await signUp(email, password, fullName, phone)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-page-light dark:bg-page-dark">
      <div className="flex items-center gap-3 px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-fill-light text-ink-light dark:bg-fill-dark dark:text-ink-dark"
        >
          <ChevronLeft size={20} strokeWidth={1.7} />
        </button>
        <p className="text-sm font-bold tracking-wide text-brand">CHICKEN TOWN</p>
      </div>

      <div className="mt-4 px-4">
        <h1 className="text-[22px] font-bold text-ink-light dark:text-ink-dark">Create account</h1>

        <div className="mt-3 flex gap-6">
          <button
            onClick={() => navigate('/sign-in')}
            className="pb-1 text-base font-medium text-muted-light dark:text-muted-dark"
          >
            Sign in
          </button>
          <button className="border-b-[2.5px] border-brand pb-1 text-base font-bold text-ink-light dark:text-ink-dark">
            Sign up
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
            <label className="text-xs text-muted-light dark:text-muted-dark">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
            />
          </div>

          <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
            <label className="text-xs text-muted-light dark:text-muted-dark">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+232 ..."
              className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
            />
          </div>

          <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
            <label className="text-xs text-muted-light dark:text-muted-dark">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
            />
          </div>

          <div className="rounded-field bg-fill-light px-3 py-2.5 dark:bg-fill-dark">
            <label className="text-xs text-muted-light dark:text-muted-dark">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm text-ink-light outline-none dark:text-ink-dark"
            />
          </div>

          {error && <p className="text-sm text-brand">{error}</p>}
        </div>
      </div>

      <div className="mt-auto px-4 pb-6 pt-4">
        <button
          onClick={handleSignUp}
          disabled={loading || !fullName || !phone || !email || !password}
          className="w-full rounded-button bg-brand py-3.5 text-center text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </div>
  )
}
