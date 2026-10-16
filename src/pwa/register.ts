import { Capacitor } from '@capacitor/core'

export function registerServiceWorker() {
  if (Capacitor.isNativePlatform()) return
  if (!('serviceWorker' in navigator)) return
  void import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  })
}

export function bindInstallPrompt(onReady: (install: () => Promise<void>) => void) {
  if (Capacitor.isNativePlatform()) return () => {}
  const onPrompt = (event: Event) => {
    event.preventDefault()
    const promptEvent = event as BeforeInstallPromptEvent
    onReady(async () => {
      await promptEvent.prompt()
    })
  }
  window.addEventListener('beforeinstallprompt', onPrompt)
  return () => window.removeEventListener('beforeinstallprompt', onPrompt)
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}
