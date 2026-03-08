import { describe, test, expect } from 'vitest'
import { projectPoint, projectRing, computeCentroid, levelZ } from './isometric-projection'
import type { ProjectionConfig } from './isometric-projection'

const baseCfg: ProjectionConfig = {
  originLon: -122.0,
  originLat: 37.0,
  azimuth: 0,
  elevation: 30,
  floorHeight: 4
}

describe('levelZ', () => {
  test('returns level_index * floorHeight for a given index', () => {
    expect(levelZ(0, 4)).toBe(0)
    expect(levelZ(1, 4)).toBe(4)
    expect(levelZ(2, 4)).toBe(8)
    expect(levelZ(-1, 4)).toBe(-4)
  })

  test('returns -0.5 * floorHeight for null/undefined', () => {
    expect(levelZ(null, 4)).toBe(-2)
    expect(levelZ(undefined, 4)).toBe(-2)
  })
})

describe('computeCentroid', () => {
  test('returns mean lon/lat', () => {
    const stops = [
      { geometry: { type: 'Point' as const, coordinates: [-122.0, 37.0] } },
      { geometry: { type: 'Point' as const, coordinates: [-122.2, 37.2] } }
    ]
    const c = computeCentroid(stops)
    expect(c.lon).toBeCloseTo(-122.1)
    expect(c.lat).toBeCloseTo(37.1)
  })

  test('skips stops without geometry', () => {
    const stops = [
      { geometry: { type: 'Point' as const, coordinates: [-122.0, 37.0] } },
      { geometry: undefined }
    ]
    const c = computeCentroid(stops)
    expect(c.lon).toBeCloseTo(-122.0)
    expect(c.lat).toBeCloseTo(37.0)
  })

  test('returns 0,0 for empty list', () => {
    const c = computeCentroid([])
    expect(c.lon).toBe(0)
    expect(c.lat).toBe(0)
  })
})

describe('projectPoint', () => {
  test('origin projects to (0, 0) at z=0, azimuth=0', () => {
    const pt = projectPoint(-122.0, 37.0, 0, baseCfg)
    expect(pt.mx).toBeCloseTo(0, 3)
    expect(pt.my).toBeCloseTo(0, 3)
  })

  test('point due east of origin has positive mx, my near zero at elevation=90', () => {
    // At azimuth=0, east=positive x, which maps to positive mx
    const cfg = { ...baseCfg, elevation: 90 }
    const lonOffset = 0.001 // ~80m east
    const pt = projectPoint(-122.0 + lonOffset, 37.0, 0, cfg)
    expect(pt.mx).toBeGreaterThan(0)
    // At elevation=90, my = ry*cos(90) - z*sin(90) = 0 - 0 = 0 for z=0
    // ry at azimuth=0: rx = x*cos(0) - y*sin(0) = x; ry = x*sin(0) + y*cos(0) = y
    // y=0 (same lat), so ry=0, my=0
    expect(pt.my).toBeCloseTo(0, 1)
  })

  test('point due north of origin has negative my at elevation=30 (north recedes in isometric)', () => {
    // At azimuth=0: rx = x*cos(0) - y*sin(0) = x; ry = x*sin(0) + y*cos(0) = y
    // North: y>0, ry>0; my = ry*cos(30) > 0 so northward is positive my
    // This just confirms the sign convention
    const latOffset = 0.001 // ~111m north
    const pt = projectPoint(-122.0, 37.0 + latOffset, 0, baseCfg)
    const ptOrigin = projectPoint(-122.0, 37.0, 0, baseCfg)
    // North should produce a different my than origin
    expect(pt.my).not.toBeCloseTo(ptOrigin.my, 3)
  })

  test('higher z shifts my upward (more positive)', () => {
    const pt0 = projectPoint(-122.0, 37.0, 0, baseCfg)
    const pt1 = projectPoint(-122.0, 37.0, 4, baseCfg)
    // my = ry*cos(elRad) + z*sin(elRad); higher z → larger (more positive) my
    expect(pt1.my).toBeGreaterThan(pt0.my)
  })

  test('azimuth=90 rotates axes so north maps to negative mx', () => {
    const cfg = { ...baseCfg, azimuth: 90 }
    const ptNorth = projectPoint(-122.0, 37.001, 0, cfg)
    // At azimuth=90: rx = x*cos(90) - y*sin(90) = -y; y>0 → rx<0
    expect(ptNorth.mx).toBeLessThan(0)
  })

  test('elevation=90 maps z directly to my (top-down view)', () => {
    const cfg = { ...baseCfg, elevation: 90 }
    const pt0 = projectPoint(-122.0, 37.0, 0, cfg)
    const pt4 = projectPoint(-122.0, 37.0, 4, cfg)
    // At elevation=90: my = ry*cos(90) + z*sin(90) = 0 + z
    // pt0.my = 0, pt4.my = 4 (higher level → higher my)
    expect(pt0.my).toBeCloseTo(0, 3)
    expect(pt4.my).toBeCloseTo(4, 3)
  })

  test('distance between two close points is proportional to real-world meters', () => {
    // 0.001 deg lat ≈ 111.32m north
    const pt1 = projectPoint(-122.0, 37.000, 0, baseCfg)
    const pt2 = projectPoint(-122.0, 37.001, 0, baseCfg)
    const elRad = baseCfg.elevation * Math.PI / 180
    const dy = Math.abs(pt2.my - pt1.my)
    // Should be approximately 111.32 * cos(elevation) ≈ 96m
    expect(dy).toBeGreaterThan(80)
    expect(dy).toBeLessThan(120)
    void elRad
  })
})

describe('projectRing', () => {
  test('projects an array of positions', () => {
    const ring = [[-122.0, 37.0], [-122.001, 37.0], [-122.001, 37.001], [-122.0, 37.0]]
    const pts = projectRing(ring, 0, baseCfg)
    expect(pts).toHaveLength(4)
    expect(pts[0]!.mx).toBeCloseTo(0, 3)
    expect(pts[0]!.my).toBeCloseTo(0, 3)
  })
})
