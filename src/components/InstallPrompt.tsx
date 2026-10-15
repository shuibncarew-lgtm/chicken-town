import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

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
    <div className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-sm">
      <div className="flex items-center justify-between rounded-card border-2 border-dashed border-black/20 bg-cream p-4">
        <div className="flex-1">
          <p className="text-sm font-bold text-black">Install the app</p>
          <p className="text-xs text-secondary">Add to home screen</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss install prompt"
            className="flex h-9 w-9 items-center justify-center rounded-full text-secondary hover:bg-surface"
          >
            <X size={16} />
          </button>
          <button
            onClick={handleInstall}
            className="rounded-pill bg-black px-4 py-2 text-xs font-bold text-cream"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
