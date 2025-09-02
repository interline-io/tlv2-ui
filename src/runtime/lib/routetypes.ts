import routeTypes from './routetypesdata.json'

interface RouteType {
  code: number
  parent: number
  name: string
}

const routeTypeMap = new Map<Number, RouteType>()
for (const rt of routeTypes) {
  routeTypeMap.set(rt.code ?? 0, rt)
}

export function getRouteType (code: number): RouteType {
  return routeTypeMap.get(code) || { code: -1, name: 'Unknown', parent: -1 }
}

// GetBasicRouteType returns the closest approximate basic route_type for an extended route_type.
export function getBasicRouteType (code: number): { routeType: RouteType, parentType?: RouteType } {
  const routeType = getRouteType(code)
  if (routeType.parent < 0) {
    return { routeType }
  }
  let parentType = routeType
  let count = 0
  while (parentType.parent >= 0) {
    parentType = getRouteType(parentType.parent)
    count += 1
    // safety check
    if (count > 5 || routeType.code === parentType.code) {
      break
    }
  }
  return {
    routeType,
    parentType
  }
}
