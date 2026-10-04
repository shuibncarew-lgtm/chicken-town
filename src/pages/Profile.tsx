import BottomNav from '../components/BottomNav'

export default function Profile() {
  return (
    <div className="min-h-screen bg-page-light pb-28 dark:bg-page-dark">
      <h1 className="px-4 pt-6 text-[22px] font-bold text-ink-light dark:text-ink-dark">Profile</h1>
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-muted-light dark:text-muted-dark">
          Sign in and account features arrive in Phase 6
        </p>
      </div>
      <BottomNav />
    </div>
  )
}
