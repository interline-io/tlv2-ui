import { TreeNode } from '~/components/utils/tree'

/**
 * Composable providing route category utility functions and tree structures
 */
export function useRouteCategories () {
  return {
    routeCategoriesTree,
    routeSubcategoriesTree,
    routeRunningWaysTree,
    routeTypesTree,
    getRouteCategory,
    getRouteSubcategory,
    getRouteRunningWay,
    getRouteType
  }
}

function routeCategoriesTree (): TreeNode {
  return new TreeNode({
    children: {
      1: {
        key: '1',
        name: 'Interregional / Intercity',
        desc: 'Services that connect adjacent regions to the nine-county San Francisco Bay Area.',
        children: {
          101: {
            key: '1|101',
            name: 'Default',
            desc: 'This is the only subcategory for category 1 (Interregional or Intercity). This subcategory must be assigned for category 1. '
          }
        }
      },
      2: {
        key: '2',
        name: 'Regional',
        desc: 'Services that generally operate into another agency\'s service area and at least 10 miles in length.',
        children: {
          201: {
            key: '2|201',
            name: 'All Day',
            desc: 'Generally operates from morning to evening'
          },
          202: {
            key: '2|202',
            name: 'Peak',
            desc: 'Operates weekday AM/PM hours only and typically operate directional service based on employment commute demands'
          },
          203: {
            key: '2|203',
            name: 'Owl',
            desc: 'Generally operates between 11 PM to 6 AM.'
          }
        }
      },
      3: {
        key: '3',
        name: 'Local',
        desc: 'Services that generally operate all day schedules, seven days a week with consistent frequency. Local routes typically operate at least every 30 minutes during the peak.',
        children: {
          301: {
            key: '3|301',
            name: 'All Day',
            desc: 'Generally operates from morning to evening.'
          },
          302: {
            key: '3|302',
            name: 'Peak',
            desc: ' Operates weekday AM/PM hours only.'
          },
          303: {
            key: '3|303',
            name: 'Owl',
            desc: 'Generally operates between 11 PM to 6 AM.'
          }
        }
      },
      4: {
        key: '4',
        name: 'Community',
        desc: 'Services that are generally intended to serve lower density areas, may be challenging to serve with larger vehicles, and operate on lower frequencies. These routes are often designed to serve a localized travel need and may only operate on certain days of week or hours of the day (peak/off-peak or weekends only).',
        children: {
          401: {
            key: '4|401',
            name: 'All Day',
            desc: 'Generally operates from morning to afternoon/evening.'
          },
          402: {
            key: '4|402',
            name: 'Special',
            desc: ' Services adds extra capacity to the network during certain times of the day or days of the week, such as supplemental school, rural, or special event trips. They typically operate seasonally with irregular frequencies and are timed around a specific event or bell time.'
          },
          403: {
            key: '4|403',
            name: 'OnDemand',
            desc: 'General public services that don\'t operate on a fixed alignment, require some level of pre-scheduling or request, and are typically booked through an app or call center.'
          }
        }
      },
      5: {
        key: '5',
        name: 'Connector',
        desc: 'Services that typically provide first/last mile timed connections to regional services.',
        children: {
          501: {
            key: '5|501',
            name: 'First Mile/Last Mile Connector',
            desc: 'These routes are often scheduled and prioritized around the regional connection over other local needs and may hold for transfers if delays are experienced on the regional route. These services can include public and non-public transit services.'
          }
        }
      },
      unknown: {
        key: 'unknown',
        desc: 'There is no category associated with this route.',
        name: 'Unknown',
        children: {}
      }
    }
  })
}

/**
 * Get tree of route subcategories
 * Creates a new instance so it can be mutated independently
 */
function routeSubcategoriesTree (): TreeNode {
  return new TreeNode({
    children: {
      101: { key: '101', name: 'Interregional / Intercity' },
      201: { key: '201', name: 'Regional All Day' },
      202: { key: '202', name: 'Regional Peak' },
      203: { key: '203', name: 'Regional Owl' },
      301: { key: '301', name: 'Local All Day' },
      302: { key: '302', name: 'Local Peak' },
      303: { key: '303', name: 'Local Owl' },
      401: { key: '401', name: 'Community All Day' },
      402: { key: '402', name: 'Community Special' },
      403: { key: '403', name: 'Community OnDemand' },
      501: { key: '501', name: 'First Mile/Last Mile Connector' },
      unknown: { key: '', name: 'Unknown route sub-category' }
    }
  })
}

/**
 * Get tree of route running ways
 * Creates a new instance so it can be mutated independently
 */
function routeRunningWaysTree (): TreeNode {
  return new TreeNode({
    children: {
      1: { key: '1', name: 'Fully/Primarily Dedicated' },
      2: { key: '2', name: 'Limited Dedicated: Highway/HOV' },
      3: { key: '3', name: 'Limited Dedicated: Local Roadway' },
      4: { key: '4', name: 'Shared, with Signal Priority' },
      5: { key: '5', name: 'Shared, No Priority' },
      unknown: { key: 'unknown', name: 'Unknown' }
    }
  })
}

/**
 * Get tree of GTFS route types
 * Creates a new instance so it can be mutated independently
 * @see https://gtfs.org/schedule/reference/#routestxt
 */
function routeTypesTree (): TreeNode {
  return new TreeNode({
    children: {
      0: { key: '0', name: 'Light rail' },
      1: { key: '1', name: 'Metro' },
      2: { key: '2', name: 'Commuter rail' },
      3: { key: '3', name: 'Bus' },
      4: { key: '4', name: 'Ferry' },
      5: { key: '5', name: 'Cable car' },
      6: { key: '6', name: 'Gondola' },
      7: { key: '7', name: 'Funicular' },
      11: { key: '11', name: 'Trolleybys' },
      12: { key: '12', name: 'Monorail' },
      unknown: { key: 'unknown', name: 'Unknown' }
    }
  })
}

// Cached tree instances
const rcConst = routeCategoriesTree()
const rtConst = routeTypesTree()
const rwConst = routeRunningWaysTree()

/**
 * Get route category by ID
 */
function getRouteCategory (v: number | string): TreeNode {
  const result = rcConst.children[v]
  if (!result) {
    return rcConst.children.unknown!
  }
  return result
}

/**
 * Get route subcategory by category and subcategory IDs
 */
function getRouteSubcategory (rc: number | string, rsc: number | string): TreeNode | null {
  const cat = rcConst.children[rc]
  if (cat) {
    return cat.children[rsc] || null
  }
  return null
}

/**
 * Get route running way by ID
 */
function getRouteRunningWay (v: number | string): TreeNode {
  const result = rwConst.children[v]
  if (!result) {
    return rwConst.children.unknown!
  }
  return result
}

/**
 * Get route type by ID
 */
function getRouteType (v: number | string): TreeNode {
  const result = rtConst.children[v]
  if (!result) {
    return rtConst.children.unknown!
  }
  return result
}
