import type { Locale, ResolvedTheme } from '../domain/types.ts'

export const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: '#f4efe2',
  dark: '#0e1412',
}

export function applyDocument(locale: Locale, theme: ResolvedTheme) {
  const root = document.documentElement
  root.lang = locale
  root.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
}
