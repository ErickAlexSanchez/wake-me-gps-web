import { useState, type ReactNode } from 'react'
import { LOCALES, THEME_CHOICES, type Locale, type ThemeChoice } from '../domain/types.ts'
import type { MessageKey } from '../i18n/catalog.ts'
import { useTranslate } from '../i18n/use-translate.ts'
import { useAlarm } from '../state/alarm-context.ts'

const LOCALE_KEY: Record<Locale, MessageKey> = {
  es: 'localeEs',
  en: 'localeEn',
}

const THEME_KEY: Record<ThemeChoice, MessageKey> = {
  system: 'themeSystem',
  light: 'themeLight',
  dark: 'themeDark',
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string; text: string }[]
  onChange: (value: T) => void
}) {
  const [focus, setFocus] = useState(value)

  return (
    <div role="radiogroup" aria-label={label} className="segment">
      {options.map((option, index) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            tabIndex={option.value === focus ? 0 : -1}
            onClick={() => {
              setFocus(option.value)
              onChange(option.value)
            }}
            onKeyDown={(event) => {
              const key = event.key
              if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'ArrowDown' && key !== 'ArrowUp') return
              event.preventDefault()
              const delta = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : -1
              const next = options[(index + delta + options.length) % options.length]
              if (!next) return
              setFocus(next.value)
              onChange(next.value)
              const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
              buttons?.[options.indexOf(next)]?.focus()
            }}
          >
            {option.text}
          </button>
        )
      })}
    </div>
  )
}

export function Chrome(): ReactNode {
  const { prefs, setLocale, setTheme } = useAlarm()
  const t = useTranslate()

  return (
    <div className="chrome">
      <Segmented
        label={t('language')}
        value={prefs.locale}
        onChange={setLocale}
        options={LOCALES.map((locale) => ({
          value: locale,
          label: t(LOCALE_KEY[locale]),
          text: locale === 'es' ? 'ES' : 'EN',
        }))}
      />
      <Segmented
        label={t('appearance')}
        value={prefs.theme}
        onChange={setTheme}
        options={THEME_CHOICES.map((theme) => ({
          value: theme,
          label: t(THEME_KEY[theme]),
          text: t(THEME_KEY[theme]),
        }))}
      />
    </div>
  )
}
