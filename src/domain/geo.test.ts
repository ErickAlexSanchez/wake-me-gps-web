import { describe, expect, it } from 'vitest'
import { evaluateFix, haversineM, leadSeconds } from './geo.ts'
import { parsePhoton, rankByDistance } from './photon.ts'

describe('haversineM', () => {
  it('is zero for the same point', () => {
    expect(haversineM(19.43, -99.13, 19.43, -99.13)).toBe(0)
  })

  it('measures the Zócalo to the Ángel within a city block', () => {
    const meters = haversineM(19.4326, -99.1332, 19.427, -99.1677)
    expect(meters).toBeGreaterThan(3400)
    expect(meters).toBeLessThan(3900)
  })
})

describe('evaluateFix', () => {
  it('fires on the second reading inside the radius', () => {
    const first = evaluateFix({ streak: 0, suppress: false }, 40, 100, 15)
    expect(first).toEqual({ streak: 1, suppress: false, fire: false })
    const second = evaluateFix(first, 40, 100, 15)
    expect(second.fire).toBe(true)
    expect(second.streak).toBe(2)
  })

  it('resets the streak when a reading falls outside', () => {
    const next = evaluateFix({ streak: 1, suppress: false }, 180, 100, 10)
    expect(next).toEqual({ streak: 0, suppress: false, fire: false })
  })

  it('does not fire while waiting to leave and re-enter', () => {
    const stillInside = evaluateFix({ streak: 0, suppress: true }, 20, 100, 10)
    expect(stillInside).toEqual({ streak: 0, suppress: true, fire: false })
    const left = evaluateFix(stillInside, 200, 100, 10)
    expect(left).toEqual({ streak: 0, suppress: false, fire: false })
    const back = evaluateFix(left, 20, 100, 10)
    expect(back.fire).toBe(false)
    expect(evaluateFix(back, 20, 100, 10).fire).toBe(true)
  })

  it('ignores a fix coarser than the radius', () => {
    const next = evaluateFix({ streak: 1, suppress: false }, 10, 100, 250)
    expect(next).toEqual({ streak: 1, suppress: false, fire: false })
  })
})

describe('leadSeconds', () => {
  it('turns 500 m at 40 km/h into about 45 seconds', () => {
    const seconds = leadSeconds(500, 40_000 / 3600)
    expect(seconds).not.toBeNull()
    expect(seconds!).toBeGreaterThan(44)
    expect(seconds!).toBeLessThan(46)
  })

  it('stays quiet when the phone is barely moving', () => {
    expect(leadSeconds(500, 0.2)).toBeNull()
    expect(leadSeconds(500, null)).toBeNull()
  })
})

describe('parsePhoton', () => {
  it('reads a name and swaps GeoJSON coordinate order', () => {
    const hits = parsePhoton({
      features: [
        {
          geometry: { coordinates: [-99.1332, 19.4326] },
          properties: { name: 'Zócalo', city: 'Ciudad de México', country: 'México' },
        },
      ],
    })
    expect(hits).toEqual([
      { name: 'Zócalo', detail: 'Ciudad de México, México', lat: 19.4326, lng: -99.1332 },
    ])
  })

  it('ranks a nearby namesake ahead of a far one', () => {
    const ranked = rankByDistance(
      [
        { name: 'Cozumel', detail: 'Quintana Roo', lat: 20.5, lng: -86.95 },
        { name: 'Cozumel', detail: 'cerca', lat: 19.44, lng: -99.14 },
      ],
      { lat: 19.43, lng: -99.13 },
    )
    expect(ranked[0]?.detail).toBe('cerca')
  })

  it('returns nothing for a broken payload', () => {
    expect(parsePhoton(null)).toEqual([])
    expect(parsePhoton({ features: 'no' })).toEqual([])
  })
})
