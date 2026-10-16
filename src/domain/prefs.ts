import { LOCALES, THEME_CHOICES, type Locale, type ResolvedTheme, type ThemeChoice } from './types.ts'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return typeof value === 'string' && (THEME_CHOICES as readonly string[]).includes(value)
}

/** English when the device language starts with en. Everything else stays Spanish. */
export function detectLocale(language: string | undefined): Locale {
  return language?.toLowerCase().startsWith('en') ? 'en' : 'es'
}

export function resolveTheme(choice: ThemeChoice, prefersLight: boolean): ResolvedTheme {
  if (choice === 'light' || choice === 'dark') return choice
  return prefersLight ? 'light' : 'dark'
}
