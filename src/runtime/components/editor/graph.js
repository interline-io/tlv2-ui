import haversine from 'haversine'

export const DefaultWalkingSpeed = 1.3
export const MinEdge = 0.0001

export function DefaultDistance (_pw, d, speed) {
  speed = DefaultWalkingSpeed
  const t = (d / speed)
  return t
}

export function DefaultCost (pw, d, speed) {
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

export function WheelchairProfile (pw, d) {
  const speed = 0.7
  if (pw.pathway_mode === 2) {
    return 0.0
  } else if (pw.pathway_mode === 4) {
    return 0.0
  }
  return DefaultCost(pw, d, speed)
}

export const Profiles = {
  'Pathways: Default' (pw, d) { return DefaultCost(pw, d, DefaultWalkingSpeed) },
  'Pathways: No Stairs' (pw, d) {
    return (pw.pathway_mode === 2) ? 0 : DefaultCost(pw, d, DefaultWalkingSpeed)
  },
  'Pathways: No Stairs/Escalator' (pw, d) {
    return (pw.pathway_mode === 2 || pw.pathway_mode === 4) ? 0 : DefaultCost(pw, d, DefaultWalkingSpeed)
  },
  'Pathways: Wheelchair': WheelchairProfile
  // 'Pathways: At 1.0 m/s' (pw, d) { return DefaultCost(pw, d, 1.0) },
}

export class RoutingGraph {
  constructor (stops, profile) {
    profile = DefaultDistance
    this.adjacency = []
    this.heuristic = []
    this.distances = {}
    // Stops and pathways by ID
    const stopsById = new Map()
    const pwsById = new Map()
    for (const stop of stops) {
      stopsById.set(stop.id, stop)
      for (const pw of stop.pathways_from_stop) {
        pwsById.set(pw.id, pw)
      }
      for (const pw of stop.pathways_to_stop) {
        pwsById.set(pw.id, pw)
      }
    }
    this.stopsById = stopsById
    this.pwsById = pwsById
    // Stop index order
    const allStops = Array.from(stopsById.values())
    const sids = {}
    for (let i = 0; i < allStops.length; i++) {
      sids[allStops[i].id] = i
    }
    this.stopIndex = sids
    // console.log('stop Index:', sids)
    // Build graph
    this.buildGraph(allStops, profile)
  }

  aStar (start, goal) {
    // const startStop = this.stopsById.get(start)
    // const goalStop = this.stopsById.get(goal)
    const startIndex = this.stopIndex[start]
    const goalIndex = this.stopIndex[goal]
    if (startIndex == null || goalIndex == null) {
      return {
        error: 'unknown stop',
        path: []
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
      const pwid = this.pwids[d.path[i]][d.path[i + 1]]
      const cost = this.distances[d.path[i]][d.path[i + 1]]
      // console.log('pwid:', pwid)
      if (pwid) {
        d.edges.push({
          pathway_id: pwid,
          cost
        })
      }
    }
    return d
  }

  buildGraph (stops, profile) {
    if (!stops || stops.length === 0 || !profile || profile === '') {
      return
    }
    if (stops.length === 0) {
      return
    }
    const g = [] // adjacency matrix
    const h = [] // heuristic values
    const distances = [] // distances
    const pwids = []

    // init heuristic
    for (let i = 0; i < stops.length; i++) {
      const fromStop = stops[i]
      g.push([])
      h.push([])
      pwids.push([])
      distances.push([])
      for (let j = 0; j < stops.length; j++) {
        const toStop = stops[j]
        const d = haversine({
          latitude: fromStop.geometry.coordinates[1],
          longitude: fromStop.geometry.coordinates[0]
        }, {
          latitude: toStop.geometry.coordinates[1],
          longitude: toStop.geometry.coordinates[0]
        }, { unit: 'meter' })
        distances[i].push(d)
        g[i].push(0) // init with 0
        h[i].push(d / 5) // assume maximum possible speed of 5m/s
      }
    }

    for (let fromIndex = 0; fromIndex < stops.length; fromIndex++) {
      const stop = stops[fromIndex]
      if (stop.parent?.id && stop.location_type === 4) {
        const toIndex = this.stopIndex[stop.parent.id]
        // console.log('connecting boarding', fromIndex, 'idx to parent ', toIndex, ' idx')
        g[fromIndex][toIndex] = MinEdge
        // g[toIndex][fromIndex] = MinEdge
      }
    }

    // init pathway edges
    for (const pw of this.pwsById.values()) {
      // console.log('processing pathway:', pw.pathway_id, pw.id, 'mode:', pw.pathway_mode, PathwayModes.get(pw.pathway_mode), 'from:', pw.from_stop.id, 'to:', pw.to_stop.id)
      const fromStop = this.stopsById.get(pw.from_stop.id)
      const toStop = this.stopsById.get(pw.to_stop.id)
      if (!fromStop) {
        // console.log('    skipping pw, unknown from_stop', pw.from_stop.id)
        continue
      }
      if (!toStop) {
        // console.log('    skipping pw, unknown to_stop', pw.to_stop.id)
        // console.log(this.stopsById)
        continue
      }

      const fromIndex = this.stopIndex[fromStop.id]
      const toIndex = this.stopIndex[toStop.id]
      let d = distances[fromIndex][toIndex]
      if (d <= MinEdge) {
        d = MinEdge
      }
      const pathwayCost = profile(pw, d)
      const graphCost = g[fromIndex][toIndex]
      if (pathwayCost < graphCost || graphCost === 0) {
        // console.log('    setting:', fromIndex, toIndex, 'cost:', pathwayCost.toFixed(0), 'dist', d.toFixed(0))
        g[fromIndex][toIndex] = pathwayCost
        pwids[fromIndex][toIndex] = pw.id
      }
      if (pw.is_bidirectional > 0) {
        const graphCostReverse = g[toIndex][fromIndex]
        if (pathwayCost < graphCostReverse || graphCostReverse === 0) {
          // console.log('    setting reverse:', toIndex, fromIndex, 'cost:', pathwayCost.toFixed(0), 'dist', d.toFixed(0))
          g[toIndex][fromIndex] = pathwayCost
          pwids[toIndex][fromIndex] = pw.id
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
const aStar = function (graph, heuristic, start, goal) {
  // This contains the distances from the start node to all other nodes
  const distances = []
  // Initializing with a distance of "Infinity"
  for (let i = 0; i < graph.length; i++) { distances.push(Number.MAX_VALUE) }
  // The distance from the start node to itself is of course 0
  distances[start] = 0
  // The current paths
  const paths = []
  for (let i = 0; i < graph.length; i++) { paths.push(null) }

  // This contains the priorities with which to visit the nodes, calculated using the heuristic.
  const priorities = []
  // Initializing with a priority of "Infinity"
  for (let i = 0; i < graph.length; i++) { priorities[i] = Number.MAX_VALUE }
  // start node has a priority equal to straight line distance to goal. It will be the first to be expanded.
  priorities[start] = heuristic[start][goal]
  // This contains whether a node was already visited
  const visited = []

  // While there are nodes left to visit...
  while (true) {
    // ... find the node with the currently lowest priority...
    let lowestPriority = Number.MAX_VALUE
    let lowestPriorityIndex = -1
    for (let i = 0; i < priorities.length; i++) {
      // ... by going through all nodes that haven't been visited yet
      if (priorities[i] < lowestPriority && !visited[i]) {
        lowestPriority = priorities[i]
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
        a = paths[a]
        path.push(a)
      }
      return { distance: distances[lowestPriorityIndex], path: path.reverse() }
    }

    // console.log('Visiting node ' + lowestPriorityIndex + ' with currently lowest priority of ' + lowestPriority)

    // ...then, for all neighboring nodes that haven't been visited yet....
    for (let i = 0; i < graph[lowestPriorityIndex].length; i++) {
      if (graph[lowestPriorityIndex][i] !== 0 && !visited[i]) {
        // ...if the path over this edge is shorter...
        if (distances[lowestPriorityIndex] + graph[lowestPriorityIndex][i] < distances[i]) {
          // ...save this path as new shortest path
          distances[i] = distances[lowestPriorityIndex] + graph[lowestPriorityIndex][i]
          // ...and set the priority with which we should continue with this node
          priorities[i] = distances[i] + heuristic[i][goal]
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
