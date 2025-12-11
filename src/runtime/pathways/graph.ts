/**
 * Graph routing algorithms for station pathways
 * Implements A* pathfinding for optimal route calculation through transit stations
 */

import { haversinePosition } from '../geom'

/**
 * Minimal pathway interface for routing graph construction
 * Contains only the properties needed to build a routable graph
 */
export interface RoutablePathway {
  id?: number
  pathway_id?: string
  pathway_mode?: number
  is_bidirectional?: number
  from_stop: { id?: number }
  to_stop: { id?: number }
}

/**
 * Minimal stop interface for routing graph construction
 * Contains only the properties needed for graph routing and debugging
 */
export interface RoutableStop {
  id?: number
  stop_id?: string
  stop_name?: string
  location_type?: number
  geometry?: { coordinates: number[] }
  parent_station?: number
  parent?: { id?: number }
  pathways_from_stop: RoutablePathway[]
  pathways_to_stop: RoutablePathway[]
}

/**
 * Default walking speed in meters per second
 */
export const DefaultWalkingSpeed = 1.3

/**
 * Minimum edge weight to prevent zero-weight edges
 */
export const MinEdge = 0.0001

/**
 * Cost/profile function signature
 * @param pw - Pathway to calculate cost for
 * @param d - Distance in meters
 * @param speed - Optional walking speed
 * @returns Cost in seconds (or 0 if pathway is inaccessible)
 */
export type CostFunction = (pw: RoutablePathway, d: number, speed?: number) => number

/**
 * Calculate default distance cost (time = distance / speed)
 */
export function DefaultDistance (_pw: RoutablePathway, d: number, speed?: number): number {
  speed = DefaultWalkingSpeed
  const t = (d / speed)
  return t
}

/**
 * Calculate cost based on pathway mode (stairs, escalators, etc.)
 * Applies different penalties based on pathway type
 */
export function DefaultCost (pw: RoutablePathway, d: number, speed?: number): number {
  speed = DefaultWalkingSpeed
  let t = (d / speed)
  if (pw.pathway_mode === 1) {
    // walkway: default
  } else if (pw.pathway_mode === 2) {
    // stairs: reduce speed
    t = t * 1.5
  } else if (pw.pathway_mode === 3) {
    // moving sidewalk: fast walking
    t = t * 0.75
  } else if (pw.pathway_mode === 4) {
    // escalator: add 10 seconds
    t = t + 10
  } else if (pw.pathway_mode === 5) {
    // elevator: add 60 seconds
    t = t + 60
  } else if (pw.pathway_mode === 6) {
    // fare gate: slow and add 10 seconds
    t = (t * 1.5) + 10
  } else if (pw.pathway_mode === 7) {
    // exit gate: add 10 seconds
    t = t + 10
  } else {
    console.log('unknown pathway mode:', pw)
  }
  return t
}

/**
 * Wheelchair-accessible profile
 * Returns 0 (inaccessible) for stairs and escalators
 */
export function WheelchairProfile (pw: RoutablePathway, d: number): number {
  const speed = 0.7
  if (pw.pathway_mode === 2) {
    return 0.0
  } else if (pw.pathway_mode === 4) {
    return 0.0
  }
  return DefaultCost(pw, d, speed)
}

/**
 * Available routing profiles with different accessibility constraints
 */
export const Profiles: Record<string, CostFunction> = {
  'Pathways: Default' (pw, d) { return DefaultCost(pw, d, DefaultWalkingSpeed) },
  'Pathways: No Stairs' (pw, d) {
    return (pw.pathway_mode === 2) ? 0 : DefaultCost(pw, d, DefaultWalkingSpeed)
  },
  'Pathways: No Stairs/Escalator' (pw, d) {
    return (pw.pathway_mode === 2 || pw.pathway_mode === 4) ? 0 : DefaultCost(pw, d, DefaultWalkingSpeed)
  },
  'Pathways: Wheelchair': WheelchairProfile
}

/**
 * Edge information in the routing result
 */
export interface RouteEdge {
  pathway_id: number
  cost: number
}

/**
 * Result from A* pathfinding
 */
export interface AStarResult {
  distance: number | null
  path: number[]
  edges?: RouteEdge[]
  error?: string
}

/**
 * Routing graph for station pathways using A* algorithm
 */
export class RoutingGraph {
  adjacency: number[][]
  heuristic: number[][]
  distances: Record<number, number[]>
  pwids: (number | undefined)[][]
  stopsById: Map<number, RoutableStop>
  pwsById: Map<number, RoutablePathway>
  stopIndex: Record<number, number>

  constructor (stops: RoutableStop[], profile?: CostFunction) {
    profile = DefaultDistance
    this.adjacency = []
    this.heuristic = []
    this.distances = {}
    this.pwids = []

    // Stops and pathways by ID
    const stopsById = new Map<number, RoutableStop>()
    const pwsById = new Map<number, RoutablePathway>()
    for (const stop of stops) {
      if (stop.id) {
        stopsById.set(stop.id, stop)
      }
      for (const pw of stop.pathways_from_stop) {
        if (pw.id) {
          pwsById.set(pw.id, pw)
        }
      }
      for (const pw of stop.pathways_to_stop) {
        if (pw.id) {
          pwsById.set(pw.id, pw)
        }
      }
    }
    this.stopsById = stopsById
    this.pwsById = pwsById

    // Stop index order
    const allStops = Array.from(stopsById.values())
    const sids: Record<number, number> = {}
    for (let i = 0; i < allStops.length; i++) {
      const stop = allStops[i]
      if (stop?.id) {
        sids[stop.id] = i
      }
    }
    this.stopIndex = sids
    console.log('stop Index:', sids)

    // Build graph
    this.buildGraph(allStops, profile)
  }

  /**
   * Find shortest path between two stops using A* algorithm
   */
  aStar (start: number, goal: number): AStarResult {
    const startIndex = this.stopIndex[start]
    const goalIndex = this.stopIndex[goal]
    if (startIndex == null || goalIndex == null) {
      return {
        error: 'unknown stop',
        path: [],
        distance: null
      }
    }

    const d = aStar(this.adjacency, this.heuristic, startIndex, goalIndex)

    // Build edge list
    d.edges = []
    for (let i = 0; i < d.path.length - 1; i++) {
      const currentIdx = d.path[i]
      const nextIdx = d.path[i + 1]
      if (currentIdx === undefined || nextIdx === undefined) continue
      const pwid = this.pwids[currentIdx]?.[nextIdx]
      const cost = this.distances[currentIdx]?.[nextIdx]
      if (pwid && cost !== undefined) {
        d.edges.push({
          pathway_id: pwid,
          cost
        })
      }
    }
    return d
  }

  /**
   * Build adjacency matrix and heuristic values
   */
  buildGraph (stops: RoutableStop[], profile: CostFunction): void {
    if (!stops || stops.length === 0 || !profile) {
      return
    }

    const g: number[][] = [] // adjacency matrix
    const h: number[][] = [] // heuristic values
    const distances: number[][] = [] // distances
    const pwids: (number | undefined)[][] = []

    // init heuristic
    for (let i = 0; i < stops.length; i++) {
      const fromStop = stops[i]
      const gRow: number[] = []
      const hRow: number[] = []
      const pwRow: (number | undefined)[] = []
      const distRow: number[] = []

      for (let j = 0; j < stops.length; j++) {
        const toStop = stops[j]
        if (!fromStop?.geometry || !toStop?.geometry) {
          distRow.push(0)
          gRow.push(0)
          hRow.push(0)
          continue
        }
        const d = haversinePosition(fromStop.geometry.coordinates, toStop.geometry.coordinates)
        distRow.push(d)
        gRow.push(0) // init with 0
        hRow.push(d / 5) // assume maximum possible speed of 5m/s
      }

      g.push(gRow)
      h.push(hRow)
      pwids.push(pwRow)
      distances.push(distRow)
    }

    // Connect boarding areas to parent stations
    for (let fromIndex = 0; fromIndex < stops.length; fromIndex++) {
      const stop = stops[fromIndex]
      if (stop?.parent_station && stop.location_type === 4) {
        const toIndex = this.stopIndex[stop.parent_station]
        const gRow = g[fromIndex]
        if (toIndex !== undefined && gRow) {
          console.log('connecting boarding', fromIndex, 'idx to parent ', toIndex, ' idx')
          gRow[toIndex] = MinEdge
        }
      }
    }

    // init pathway edges
    for (const pw of this.pwsById.values()) {
      console.log('processing pathway:', pw.pathway_id, pw.id, 'mode:', pw.pathway_mode, 'from:', pw.from_stop.id, 'to:', pw.to_stop.id)
      const fromStop = this.stopsById.get(pw.from_stop.id!)
      const toStop = this.stopsById.get(pw.to_stop.id!)
      if (!fromStop) {
        console.log('    skipping pw, unknown from_stop', pw.from_stop.id)
        continue
      }
      if (!toStop) {
        console.log('    skipping pw, unknown to_stop', pw.to_stop.id)
        console.log(this.stopsById)
        continue
      }

      const fromIndex = this.stopIndex[fromStop.id!]
      const toIndex = this.stopIndex[toStop.id!]
      if (fromIndex === undefined || toIndex === undefined) continue

      let d = distances[fromIndex]?.[toIndex] ?? MinEdge
      if (d <= MinEdge) {
        d = MinEdge
      }
      const pathwayCost = profile(pw, d)
      const graphCost = g[fromIndex]?.[toIndex] ?? 0
      if (pathwayCost < graphCost || graphCost === 0) {
        console.log('    setting:', fromIndex, toIndex, 'cost:', pathwayCost.toFixed(0), 'dist', d.toFixed(0))
        if (g[fromIndex] && pwids[fromIndex]) {
          g[fromIndex][toIndex] = pathwayCost
          pwids[fromIndex][toIndex] = pw.id
        }
      }
      if (pw.is_bidirectional) {
        const graphCostReverse = g[toIndex]?.[fromIndex] ?? 0
        if (pathwayCost < graphCostReverse || graphCostReverse === 0) {
          console.log('    setting reverse:', toIndex, fromIndex, 'cost:', pathwayCost.toFixed(0), 'dist', d.toFixed(0))
          if (g[toIndex] && pwids[toIndex]) {
            g[toIndex][fromIndex] = pathwayCost
            pwids[toIndex][fromIndex] = pw.id
          }
        }
      } else {
        console.log('    not bidirectional')
      }
    }

    this.adjacency = g
    this.heuristic = h
    this.distances = distances
    this.pwids = pwids
  }
}

/**
 * Graph interface returned by NewGraph (legacy)
 */
export interface Graph {
  nodes: RoutableStop[]
  adjacency: number[][]
  heuristic: number[][]
  distances: number[][]
  aStar: (start: number, goal: number) => AStarResult
}

/**
 * Create a routing graph (legacy function, use RoutingGraph class instead)
 * @deprecated Use RoutingGraph class
 */
export function NewGraph (stops: RoutableStop[], profile: CostFunction): Graph | null {
  if (!stops || stops.length === 0 || !profile) {
    return null
  }

  const g: number[][] = [] // adjacency matrix
  const h: number[][] = [] // heuristic values
  const distances: number[][] = [] // distances
  const pwids: (number | undefined)[][] = []
  const sids: Record<number, number> = {}

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    if (stop?.id) {
      sids[stop.id] = i
    }
  }

  // init heuristic
  for (let i = 0; i < stops.length; i++) {
    const fromStop = stops[i]
    if (fromStop?.id) {
      sids[fromStop.id] = i
    }
    const gRow: number[] = []
    const hRow: number[] = []
    const pwRow: (number | undefined)[] = []
    const distRow: number[] = []

    for (let j = 0; j < stops.length; j++) {
      const toStop = stops[j]
      if (!fromStop?.geometry || !toStop?.geometry) {
        distRow.push(0)
        gRow.push(0)
        hRow.push(0)
        continue
      }
      const d = haversinePosition(fromStop.geometry.coordinates, toStop.geometry.coordinates)
      distRow.push(d)
      gRow.push(0) // init with 0
      hRow.push(d / 5) // assume maximum possible speed of 5m/s
    }

    g.push(gRow)
    h.push(hRow)
    pwids.push(pwRow)
    distances.push(distRow)
  }

  // init pathway edges
  const stopIndex = new Map<number, RoutableStop>()
  const pwIndex = new Map<number, RoutablePathway>()
  for (const stop of stops) {
    if (stop.id) {
      stopIndex.set(stop.id, stop)
    }
    for (const pw of stop.pathways_from_stop) {
      if (pw.id) {
        pwIndex.set(pw.id, pw)
      }
    }
    for (const pw of stop.pathways_to_stop) {
      if (pw.id) {
        pwIndex.set(pw.id, pw)
      }
    }
  }

  for (const pw of pwIndex.values()) {
    console.log('processing pathway:', pw.id, 'mode:', pw.pathway_mode)
    const fromStop = stopIndex.get(pw.from_stop.id!)
    const toStop = stopIndex.get(pw.to_stop.id!)
    if (!fromStop) {
      console.log('    skipping pw, unknown from_stop', pw.from_stop.id)
      continue
    }
    if (!toStop) {
      console.log('    skipping pw, unknown to_stop', pw.to_stop.id)
      continue
    }

    const fromIndex = sids[fromStop.id!]
    const toIndex = sids[toStop.id!]
    if (fromIndex === undefined || toIndex === undefined) continue

    let d = distances[fromIndex]?.[toIndex] ?? MinEdge
    if (d <= MinEdge) {
      d = MinEdge
    }
    const pathwayCost = profile(pw, d)
    const graphCost = g[fromIndex]?.[toIndex] ?? 0
    if (pathwayCost < graphCost || graphCost === 0) {
      console.log('    setting:', fromIndex, toIndex, 'cost:', pathwayCost.toFixed(0), 'less than', graphCost, 'sld', d.toFixed(0))
      if (g[fromIndex] && pwids[fromIndex]) {
        g[fromIndex][toIndex] = pathwayCost
        pwids[fromIndex][toIndex] = pw.id
      }
    }
    if (pw.is_bidirectional) {
      const graphCostReverse = g[toIndex]?.[fromIndex] ?? 0
      if (pathwayCost < graphCostReverse || graphCostReverse === 0) {
        console.log('    setting reverse:', fromIndex, toIndex, 'cost:', pathwayCost.toFixed(0), 'less than', graphCostReverse, 'sld', d.toFixed(0))
        if (g[toIndex] && pwids[toIndex]) {
          g[toIndex][fromIndex] = pathwayCost
          pwids[toIndex][fromIndex] = pw.id
        }
      }
    } else {
      console.log('    not bidirectional')
    }
  }

  return {
    nodes: stops,
    adjacency: g,
    heuristic: h,
    distances,
    aStar (start: number, goal: number): AStarResult {
      const startIdx = sids[start]
      const goalIdx = sids[goal]
      if (startIdx === undefined || goalIdx === undefined) {
        return { distance: null, path: [], error: 'unknown stop' }
      }
      const d = aStar(g, h, startIdx, goalIdx)
      d.edges = []
      for (let i = 0; i < d.path.length - 1; i++) {
        const currentIdx = d.path[i]
        const nextIdx = d.path[i + 1]
        if (currentIdx === undefined || nextIdx === undefined) continue
        const pwid = pwids[currentIdx]?.[nextIdx]
        const cost = g[currentIdx]?.[nextIdx]
        if (pwid && cost !== undefined) {
          d.edges.push({
            pathway_id: pwid,
            cost
          })
        }
      }
      return d
    }
  }
}

/**
 * A* pathfinding algorithm implementation
 * Finds the shortest path between two nodes in a weighted graph
 *
 * @param graph - Adjacency matrix where (x,y) is the weight of the edge or 0 if no edge
 * @param heuristic - Estimated distance from node x to y (must be admissible)
 * @param start - Starting node index
 * @param goal - Goal node index
 * @returns Distance and path from start to goal
 */
const aStar = function (graph: number[][], heuristic: number[][], start: number, goal: number): AStarResult {
  // This contains the distances from the start node to all other nodes
  const distances: number[] = []
  // Initializing with a distance of "Infinity"
  for (let i = 0; i < graph.length; i++) { distances.push(Number.MAX_VALUE) }
  // The distance from the start node to itself is of course 0
  distances[start] = 0

  // The current paths
  const paths: (number | null)[] = []
  for (let i = 0; i < graph.length; i++) { paths.push(null) }

  // This contains the priorities with which to visit the nodes, calculated using the heuristic.
  const priorities: number[] = []
  // Initializing with a priority of "Infinity"
  for (let i = 0; i < graph.length; i++) { priorities[i] = Number.MAX_VALUE }
  // start node has a priority equal to straight line distance to goal. It will be the first to be expanded.
  const heuristicValue = heuristic[start]?.[goal]
  if (heuristicValue !== undefined) {
    priorities[start] = heuristicValue
  }

  // This contains whether a node was already visited
  const visited: boolean[] = []

  // While there are nodes left to visit...
  while (true) {
    // ... find the node with the currently lowest priority...
    let lowestPriority = Number.MAX_VALUE
    let lowestPriorityIndex = -1
    for (let i = 0; i < priorities.length; i++) {
      // ... by going through all nodes that haven't been visited yet
      const priority = priorities[i]
      if (priority !== undefined && priority < lowestPriority && !visited[i]) {
        lowestPriority = priority
        lowestPriorityIndex = i
      }
    }

    if (lowestPriorityIndex === -1) {
      // There was no node not yet visited --> Node not found
      return { distance: null, path: [] }
    } else if (lowestPriorityIndex === goal) {
      // Goal node found
      let a = goal
      const path = [a]
      while (a !== start) {
        a = paths[a]!
        path.push(a)
      }
      return { distance: distances[lowestPriorityIndex] ?? null, path: path.reverse() }
    }

    // ...then, for all neighboring nodes that haven't been visited yet....
    const graphRow = graph[lowestPriorityIndex]
    if (!graphRow) continue

    for (let i = 0; i < graphRow.length; i++) {
      const edgeWeight = graphRow[i]
      if (edgeWeight !== undefined && edgeWeight !== 0 && !visited[i]) {
        // ...if the path over this edge is shorter...
        const currentDist = distances[lowestPriorityIndex]
        const neighborDist = distances[i]
        if (currentDist !== undefined && neighborDist !== undefined && currentDist + edgeWeight < neighborDist) {
          // ...save this path as new shortest path
          const newDist = currentDist + edgeWeight
          distances[i] = newDist
          // ...and set the priority with which we should continue with this node
          const hVal = heuristic[i]?.[goal]
          if (hVal !== undefined) {
            priorities[i] = newDist + hVal
          }
          paths[i] = lowestPriorityIndex
        }
      }
    }

    // Lastly, note that we are finished with this node.
    visited[lowestPriorityIndex] = true
  }
}
