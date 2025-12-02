import { haversinePosition } from '../../../geom'
import type { PathwayData, StopData, ProfileFunction, RouteResult } from './types'

export const DefaultWalkingSpeed = 1.3
export const MinEdge = 0.0001

export function DefaultDistance (_pw: PathwayData, d: number, speed?: number): number {
  speed = DefaultWalkingSpeed
  const t = (d / speed)
  return t
}

export function DefaultCost (pw: PathwayData, d: number, speed?: number): number {
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

export function WheelchairProfile (pw: PathwayData, d: number): number {
  const speed = 0.7
  if (pw.pathway_mode === 2) {
    return 0.0
  } else if (pw.pathway_mode === 4) {
    return 0.0
  }
  return DefaultCost(pw, d, speed)
}

export const Profiles: Record<string, ProfileFunction> = {
  'Pathways: Default' (pw: PathwayData, d: number) { return DefaultCost(pw, d, DefaultWalkingSpeed) },
  'Pathways: No Stairs' (pw: PathwayData, d: number) {
    return (pw.pathway_mode === 2) ? 0 : DefaultCost(pw, d, DefaultWalkingSpeed)
  },
  'Pathways: No Stairs/Escalator' (pw: PathwayData, d: number) {
    return (pw.pathway_mode === 2 || pw.pathway_mode === 4) ? 0 : DefaultCost(pw, d, DefaultWalkingSpeed)
  },
  'Pathways: Wheelchair': WheelchairProfile
  // 'Pathways: At 1.0 m/s' (pw, d) { return DefaultCost(pw, d, 1.0) },
}

export class RoutingGraph {
  adjacency: number[][]
  heuristic: number[][]
  distances: number[][]
  pwids: (number | undefined)[][]
  stopsById: Map<number, StopData>
  pwsById: Map<number, PathwayData>
  stopIndex: Record<number, number>

  constructor (stops: StopData[], profile?: ProfileFunction) {
    profile = DefaultDistance
    this.adjacency = []
    this.heuristic = []
    this.distances = []
    this.pwids = []
    // Stops and pathways by ID
    const stopsById = new Map<number, StopData>()
    const pwsById = new Map<number, PathwayData>()
    for (const stop of stops) {
      if (stop.id) {
        stopsById.set(stop.id, stop)
      }
      for (const pw of stop.pathways_from_stop || []) {
        if (pw.id) {
          pwsById.set(pw.id, pw)
        }
      }
      for (const pw of stop.pathways_to_stop || []) {
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
    // console.log('stop Index:', sids)
    // Build graph
    this.buildGraph(allStops, profile)
  }

  aStar (start: number, goal: number): RouteResult {
    // const startStop = this.stopsById.get(start)
    // const goalStop = this.stopsById.get(goal)
    const startIndex = this.stopIndex[start]
    const goalIndex = this.stopIndex[goal]
    if (startIndex == null || goalIndex == null) {
      return {
        error: 'unknown stop',
        path: [],
        distance: null
      }
    }
    // console.log('start:', start, 'startIndex:', startIndex, 'goal:', goal, 'goalIndex:', goalIndex)
    const d = aStar(this.adjacency, this.heuristic, startIndex, goalIndex)
    // init pathway edges
    // console.log('start:', startStop.id, startStop.stop_name, 'end:', goalStop.id, goalStop.stop_name, 'A* distance:', d.distance, 'path:', d.path)
    // for (const i of d.path) {
    //   const sp = stops[i]
    //   console.log(sp.stop_id, sp.stop_name, sp.location_type)
    // }
    d.edges = []
    for (let i = 0; i < d.path.length - 1; i++) {
      const fromIdx = d.path[i]
      const toIdx = d.path[i + 1]
      if (fromIdx !== undefined && toIdx !== undefined) {
        const fromPwids = this.pwids[fromIdx]
        const fromDistances = this.distances[fromIdx]
        if (fromPwids && fromDistances) {
          const pwid = fromPwids[toIdx]
          const cost = fromDistances[toIdx]
          if (pwid !== undefined && cost !== undefined) {
            d.edges.push({
              pathway_id: pwid,
              cost
            })
          }
        }
      }
    }
    return d
  }

  buildGraph (stops: StopData[], profile: ProfileFunction): void {
    if (!stops || stops.length === 0 || !profile) {
      return
    }
    if (stops.length === 0) {
      return
    }
    const g: number[][] = [] // adjacency matrix
    const h: number[][] = [] // heuristic values
    const distances: number[][] = [] // distances
    const pwids: (number | undefined)[][] = []

    // init heuristic
    for (let i = 0; i < stops.length; i++) {
      const fromStop = stops[i]
      g.push([])
      h.push([])
      pwids.push([])
      distances.push([])
      for (let j = 0; j < stops.length; j++) {
        const toStop = stops[j]
        const d = haversinePosition(
          fromStop?.geometry?.coordinates || [0, 0],
          toStop?.geometry?.coordinates || [0, 0]
        )
        distances[i]!.push(d)
        g[i]!.push(0) // init with 0
        h[i]!.push(d / 5) // assume maximum possible speed of 5m/s
      }
    }

    for (let fromIndex = 0; fromIndex < stops.length; fromIndex++) {
      const stop = stops[fromIndex]
      if (stop?.parent?.id && stop.location_type === 4) {
        const toIndex = this.stopIndex[stop.parent.id]
        if (toIndex !== undefined) {
          // console.log('connecting boarding', fromIndex, 'idx to parent ', toIndex, ' idx')
          g[fromIndex]![toIndex] = MinEdge
          // g[toIndex][fromIndex] = MinEdge
        }
      }
    }

    // init pathway edges
    for (const pw of this.pwsById.values()) {
      // console.log('processing pathway:', pw.pathway_id, pw.id, 'mode:', pw.pathway_mode, PathwayModes.get(pw.pathway_mode), 'from:', pw.from_stop.id, 'to:', pw.to_stop.id)
      const fromStop = pw.from_stop?.id ? this.stopsById.get(pw.from_stop.id) : undefined
      const toStop = pw.to_stop?.id ? this.stopsById.get(pw.to_stop.id) : undefined
      if (!fromStop) {
        // console.log('    skipping pw, unknown from_stop', pw.from_stop.id)
        continue
      }
      if (!toStop) {
        // console.log('    skipping pw, unknown to_stop', pw.to_stop.id)
        // console.log(this.stopsById)
        continue
      }

      if (!fromStop.id || !toStop.id) {
        continue
      }
      const fromIndex = this.stopIndex[fromStop.id]
      const toIndex = this.stopIndex[toStop.id]
      if (fromIndex === undefined || toIndex === undefined) {
        continue
      }
      const fromDistances = distances[fromIndex]
      const fromGraph = g[fromIndex]
      const fromPwids = pwids[fromIndex]
      if (!fromDistances || !fromGraph || !fromPwids) {
        continue
      }
      let d = fromDistances[toIndex]
      if (d === undefined) {
        continue
      }
      if (d <= MinEdge) {
        d = MinEdge
      }
      const pathwayCost = profile(pw, d)
      const graphCost = fromGraph[toIndex]
      if (graphCost === undefined) {
        continue
      }
      if (pathwayCost < graphCost || graphCost === 0) {
        // console.log('    setting:', fromIndex, toIndex, 'cost:', pathwayCost.toFixed(0), 'dist', d.toFixed(0))
        fromGraph[toIndex] = pathwayCost
        fromPwids[toIndex] = pw.id
      }
      if (pw.is_bidirectional && pw.is_bidirectional > 0) {
        const toGraph = g[toIndex]
        const toPwids = pwids[toIndex]
        if (!toGraph || !toPwids) {
          continue
        }
        const graphCostReverse = toGraph[fromIndex]
        if (graphCostReverse === undefined) {
          continue
        }
        if (pathwayCost < graphCostReverse || graphCostReverse === 0) {
          // console.log('    setting reverse:', toIndex, fromIndex, 'cost:', pathwayCost.toFixed(0), 'dist', d.toFixed(0))
          toGraph[fromIndex] = pathwayCost
          toPwids[fromIndex] = pw.id
        }
      } else {
        // console.log('    not bidirectional')
      }
    }
    this.adjacency = g
    this.heuristic = h
    this.distances = distances
    this.pwids = pwids
  }
}

/// ////////
/// ////////
/// ////////

// https://www.algorithms-and-technologies.com/a_star/javascript
/**
 * Finds the shortest distance between two nodes using the A-star (A*) algorithm
 * @param graph an adjacency-matrix-representation of the graph where (x,y) is the weight of the edge or 0 if there is no edge.
 * @param heuristic an estimation of distance from node x to y that is guaranteed to be lower than the actual distance. E.g. straight-line distance
 * @param start the node to start from.
 * @param goal the node we're searching for
 * @return The shortest distance to the goal node. Can be easily modified to return the path.
 */
const aStar = function (graph: number[][], heuristic: number[][], start: number, goal: number): RouteResult {
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
  priorities[start] = heuristic[start]![goal]!
  // This contains whether a node was already visited
  const visited: boolean[] = []

  // While there are nodes left to visit...
  while (true) {
    // ... find the node with the currently lowest priority...
    let lowestPriority = Number.MAX_VALUE
    let lowestPriorityIndex = -1
    for (let i = 0; i < priorities.length; i++) {
      // ... by going through all nodes that haven't been visited yet
      if (priorities[i]! < lowestPriority && !visited[i]) {
        lowestPriority = priorities[i]!
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
      return { distance: distances[lowestPriorityIndex]!, path: path.reverse() }
    }

    // console.log('Visiting node ' + lowestPriorityIndex + ' with currently lowest priority of ' + lowestPriority)

    // ...then, for all neighboring nodes that haven't been visited yet....
    for (let i = 0; i < graph[lowestPriorityIndex]!.length; i++) {
      if (graph[lowestPriorityIndex]![i] !== 0 && !visited[i]) {
        // ...if the path over this edge is shorter...
        if (distances[lowestPriorityIndex]! + graph[lowestPriorityIndex]![i]! < distances[i]!) {
          // ...save this path as new shortest path
          distances[i] = distances[lowestPriorityIndex]! + graph[lowestPriorityIndex]![i]!
          // ...and set the priority with which we should continue with this node
          priorities[i] = distances[i]! + heuristic[i]![goal]!
          // console.log('Updating distance of node ' + i + ' to ' + distances[i] + ' and priority to ' + priorities[i])
          paths[i] = lowestPriorityIndex
        }
      }
    }

    // Lastly, note that we are finished with this node.
    visited[lowestPriorityIndex] = true
    // console.log('Visited nodes: ' + visited)
    // console.log('Currently lowest distances: ' + distances)
  }
}
