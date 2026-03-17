/**
 * Set utility functions
 */

/**
 * Returns the symmetric difference of two sets (elements in either set but not both)
 */
export function symmetricDifference<T> (setA: Set<T>, setB: Set<T>): Set<T> {
  const _difference = new Set(setA)
  for (const elem of setB) {
    if (_difference.has(elem)) {
      _difference.delete(elem)
    } else {
      _difference.add(elem)
    }
  }
  return _difference
}

/**
 * Returns the intersection of two sets (elements common to both sets)
 */
export function intersection<T> (setA: Set<T>, setB: Set<T>): Set<T> {
  const _intersection = new Set<T>()
  for (const elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem)
    }
  }
  return _intersection
}
