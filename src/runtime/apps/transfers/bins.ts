// Transfer scoring histogram utilities

export interface BinCount {
  binMin: number
  binMax: number
  binName: string
  count: number
  percentOfTotal: number
  scenarioName?: string
}

const breakpointSecondsToMinutes = (b: number): number => {
  if (b < 0 || b > 0) {
    return Number.parseFloat((b / 60).toFixed(1))
  } else {
    return 0
  }
}

const breakpointMinutesToString = (b: number): string => {
  if (b === 0) {
    return '0'
  } else if (b < 0) {
    return b.toString()
  } else if (b > 0) {
    return '+' + b.toString()
  } else {
    return ''
  }
}

const binName = (binMin: number, binMax: number): string => {
  return `${breakpointMinutesToString(
    breakpointSecondsToMinutes(binMin)
  )} to ${breakpointMinutesToString(breakpointSecondsToMinutes(binMax))}`
}

export const binnedCounts = (times: number[], breakpoints: number[]): BinCount[] => {
  const counts: BinCount[] = [
    {
      binMin: breakpoints[0]!,
      binMax: breakpoints[1]!,
      binName: binName(breakpoints[0]!, breakpoints[1]!),
      count: 0,
      percentOfTotal: 0
    },
    {
      binMin: breakpoints[1]!,
      binMax: breakpoints[2]!,
      binName: binName(breakpoints[1]!, breakpoints[2]!),
      count: 0,
      percentOfTotal: 0
    },
    {
      binMin: breakpoints[2]!,
      binMax: breakpoints[3]!,
      binName: binName(breakpoints[2]!, breakpoints[3]!),
      count: 0,
      percentOfTotal: 0
    },
    {
      binMin: breakpoints[3]!,
      binMax: breakpoints[4]!,
      binName: binName(breakpoints[3]!, breakpoints[4]!),
      count: 0,
      percentOfTotal: 0
    }
  ]
  times.forEach((t) => {
    for (let i = 0; i < counts.length; i++) {
      if (t > counts[i]!.binMin && t <= counts[i]!.binMax) {
        counts[i]!.count += 1
      }
    }
  })
  const total = times.length
  const result = counts.map((c) => {
    c.percentOfTotal = c.count / total
    return c
  })
  return result
}
