import type { ToneId } from '../domain/types.ts'

export function toneSrc(id: ToneId): string {
  return `/tones/${id}.wav`
}

let player: HTMLAudioElement | null = null
let playerTone: ToneId | null = null

export function primeTone(id: ToneId) {
  const audio = new Audio(toneSrc(id))
  audio.loop = true
  audio.preload = 'auto'
  player = audio
  playerTone = id
  void audio.play().then(() => {
    audio.pause()
    audio.currentTime = 0
  }).catch(() => {
    /* the next play() still rides this gesture if the browser allows it */
  })
}

export function previewTone(id: ToneId) {
  const audio = new Audio(toneSrc(id))
  void audio.play().catch(() => {})
}

export function playTone(id: ToneId) {
  if (!player || playerTone !== id) {
    player = new Audio(toneSrc(id))
    playerTone = id
  }
  player.loop = true
  void player.play().catch(() => {})
}

export function stopTone() {
  if (!player) return
  player.pause()
  player.currentTime = 0
}

let vibrationTimer = 0

export function startVibration() {
  if (!('vibrate' in navigator)) return
  const pattern = [0, 480, 180, 480, 180, 760]
  navigator.vibrate(pattern)
  window.clearInterval(vibrationTimer)
  vibrationTimer = window.setInterval(() => navigator.vibrate(pattern), 2300)
}

export function stopVibration() {
  window.clearInterval(vibrationTimer)
  vibrationTimer = 0
  if ('vibrate' in navigator) navigator.vibrate(0)
}

let wakeLock: WakeLockSentinel | null = null

export async function holdScreen() {
  if (!('wakeLock' in navigator)) return
  try {
    wakeLock = await navigator.wakeLock.request('screen')
  } catch {
    wakeLock = null
  }
}

export async function releaseScreen() {
  try {
    await wakeLock?.release()
  } catch {
    /* already released when the tab hid */
  }
  wakeLock = null
}

export async function reholdScreenIfNeeded() {
  if (document.visibilityState !== 'visible') return
  if (wakeLock && !wakeLock.released) return
  await holdScreen()
}
