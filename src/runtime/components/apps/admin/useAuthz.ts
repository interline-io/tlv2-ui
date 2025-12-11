export const OBJECTTYPES: Record<string, number> = {
  empty_object: 0,
  tenant: 1,
  org: 2,
  feed: 3,
  feed_version: 4,
  user: 5
}

export const RELATIONS: Record<string, number> = {
  empty_relation: 0,
  admin: 1,
  member: 2,
  manager: 3,
  viewer: 4,
  editor: 5,
  parent: 6
}

export function useAuthz () {
  const getObjectType = (v: string) => OBJECTTYPES[v]
  const getRelation = (v: string) => RELATIONS[v]

  return {
    OBJECTTYPES,
    RELATIONS,
    getObjectType,
    getRelation
  }
}
