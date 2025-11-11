import { describe, it, expect } from 'vitest'
import { haversinePosition, haversinePoint, haversineLonLat } from './haversine'
import type { Point } from './geom'

describe('haversine', () => {
  const testCases = [
    {
      name: 'Washington DC: White House to Lincoln Memorial',
      from: { lon: -77.037852, lat: 38.898556 },
      to: { lon: -77.043934, lat: 38.897147 },
      expected: 549.155
    },
    {
      name: 'New York to Los Angeles',
      from: { lon: -74.006, lat: 40.7128 },
      to: { lon: -118.2437, lat: 34.0522 },
      expected: 3935746
    },
    {
      name: 'Equator crossing (2 degrees latitude)',
      from: { lon: 0, lat: 1 },
      to: { lon: 0, lat: -1 },
      expected: 222390
    },
    {
      name: 'Prime meridian crossing (2 degrees longitude)',
      from: { lon: -1, lat: 0 },
      to: { lon: 1, lat: 0 },
      expected: 222390
    },
    {
      name: 'Same location',
      from: { lon: -77.037852, lat: 38.898556 },
      to: { lon: -77.037852, lat: 38.898556 },
      expected: 0
    },
    {
      name: 'Very small distance',
      from: { lon: 0, lat: 0 },
      to: { lon: 0.0001, lat: 0.0001 },
      expected: 15.7
    }
  ]

  describe('haversineLonLat', () => {
    testCases.forEach(({ name, from, to, expected }) => {
      it(`should calculate distance: ${name}`, () => {
        const distance = haversineLonLat(from, to)
        expect(distance).toBeCloseTo(expected, 0)
      })
    })
  })

  describe('haversinePosition', () => {
    testCases.forEach(({ name, from, to, expected }) => {
      it(`should calculate distance: ${name}`, () => {
        const start = [from.lon, from.lat]
        const end = [to.lon, to.lat]
        const distance = haversinePosition(start, end)
        expect(distance).toBeCloseTo(expected, 0)
      })
    })

    it('should handle positions with undefined values', () => {
      const start = [-77.037852, 38.898556]
      const end: number[] = []
      const distance = haversinePosition(start, end)
      expect(distance).toBeGreaterThan(0)
    })
  })

  describe('haversinePoint', () => {
    testCases.forEach(({ name, from, to, expected }) => {
      it(`should calculate distance: ${name}`, () => {
        const fromPoint: Point = { type: 'Point', coordinates: [from.lon, from.lat] }
        const toPoint: Point = { type: 'Point', coordinates: [to.lon, to.lat] }
        const distance = haversinePoint(fromPoint, toPoint)
        expect(distance).toBeCloseTo(expected, 0)
      })
    })
  })
})
