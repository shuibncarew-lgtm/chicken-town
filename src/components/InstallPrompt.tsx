import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt || dismissed) return null

  const handleInstall = async () => {
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="flex items-center gap-3 rounded-card border border-line-light bg-card-light p-3 shadow-floating dark:border-line-dark dark:bg-card-dark">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand text-white">
          <Download size={18} strokeWidth={1.7} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-ink-light dark:text-ink-dark">Install app</p>
          <p className="text-xs text-muted-light dark:text-muted-dark">Add Chicken Town to your home screen</p>
        </div>
        <button
          onClick={handleInstall}
          className="rounded-button bg-brand px-4 py-2 text-xs font-bold text-white"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-light dark:text-muted-dark"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
