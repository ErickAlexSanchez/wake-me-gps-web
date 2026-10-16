import { describe, expect, it } from 'vitest'
import { detectLocale, resolveTheme } from './prefs.ts'
import { lead } from './format.ts'
import { translate, catalogsMatch } from '../i18n/catalog.ts'
import { errorKey, leadText } from '../i18n/copy.ts'

describe('locale and theme', () => {
  it('follows English and otherwise stays Spanish', () => {
    expect(detectLocale('en-US')).toBe('en')
    expect(detectLocale('EN')).toBe('en')
    expect(detectLocale('es-MX')).toBe('es')
    expect(detectLocale(undefined)).toBe('es')
  })

  it('lets an explicit theme win over the system', () => {
    expect(resolveTheme('system', true)).toBe('light')
    expect(resolveTheme('system', false)).toBe('dark')
    expect(resolveTheme('dark', true)).toBe('dark')
    expect(resolveTheme('light', false)).toBe('light')
  })
})

describe('copy', () => {
  it('keeps both catalogs on the same keys', () => {
    expect(catalogsMatch).toBe(true)
  })

  it('fills the lead sentence in both languages', () => {
    expect(leadText('es', lead(500, 40_000 / 3600))).toContain('45')
    expect(leadText('en', lead(500, 40_000 / 3600))).toContain('45')
    expect(leadText('en', { kind: 'still' })).toContain('radius')
    expect(translate('es', 'removePlace', { name: 'Zocalo' })).toBe('Quitar Zocalo')
    expect(translate('en', 'removePlace', { name: 'Zocalo' })).toBe('Remove Zocalo')
  })

  it('maps unknown location failures to the generic message', () => {
    expect(errorKey(undefined)).toBe('errorUnavailable')
    expect(errorKey('LOCATION_DENIED')).toBe('errorDenied')
    expect(errorKey('NOPE')).toBe('errorUnavailable')
  })
})
