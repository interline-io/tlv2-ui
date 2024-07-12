// adapted from https://gist.github.com/shinout/f19da7720d130f3925ac
const UP = '1'
const LEFT = '2'
const UL = '4'

interface Options {
  G: number,
  P: number,
  M: number
}

interface Matrix {
  [key: number]: {[key: number]: number}
}

interface Direc {
  [key: number]: {[key: number]: Array<string>}
}

export function NeedlemanWunsch(s1: Array<string>, s2: Array<string>, op: Options): {a: Array<string>, b: Array<string>} {
  op = op || {}
  const G = op.G || 2
  const P = op.P || 1
  const M = op.M || -100
  const mat: Matrix = {}
  const direc: Direc = {}

  // initialization
  for (let i = 0; i < s1.length + 1; i++) {
    mat[i] = { 0: 0 }
    direc[i] = { 0: [] }
    for (let j = 1; j < s2.length + 1; j++) {
      mat[i][j] = (i === 0)
        ? 0
        : (s1[i - 1] === s2[j - 1]) ? P : M
      direc[i][j] = []
    }
  }

  // calculate each value
  for (let i = 0; i < s1.length + 1; i++) {
    for (let j = 0; j < s2.length + 1; j++) {
      const newval = (i === 0 || j === 0)
        ? -G * (i + j)
        : Math.max(mat[i - 1][j] - G, mat[i - 1][j - 1] + mat[i][j], mat[i][j - 1] - G)

      if (i > 0 && j > 0) {
        if (newval === mat[i - 1][j] - G) { direc[i][j].push(UP) }
        if (newval === mat[i][j - 1] - G) { direc[i][j].push(LEFT) }
        if (newval === mat[i - 1][j - 1] + mat[i][j]) { direc[i][j].push(UL) }
      } else {
        direc[i][j].push((j === 0) ? UP : LEFT)
      }
      mat[i][j] = newval
    }
  }

  // get result
  const chars = [new Array<string>(), new Array<string>()]
  let I = s1.length
  let J = s2.length
  while (I > 0 || J > 0) {
    switch (direc[I][J][0]) {
      case UP:
        I--
        chars[0].push(s1[I])
        chars[1].push('-')
        break
      case LEFT:
        J--
        chars[0].push('-')
        chars[1].push(s2[J])
        break
      case UL:
        I--
        J--
        chars[0].push(s1[I])
        chars[1].push(s2[J])
        break
      default: break
    }
  }
  return {
    a: chars[0].reverse(),
    b: chars[1].reverse()
  }
  // return chars.map(function(v) {
  //   return v.reverse()
  // })
}
