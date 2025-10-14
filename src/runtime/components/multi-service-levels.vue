<template>
  <div>
    <div v-if="showFilters" class="block">
      <o-field grouped expanded>
        <o-field v-if="showServiceRelative" label="Service relative to">
          <o-select v-model="maxAggMode">
            <option value="all">
              All cells
            </option>
            <option value="group">
              Within group
            </option>
          </o-select>
        </o-field>

        <o-field v-if="showDateSelector" label="Start date">
          <o-datepicker
            v-model="displayStartDate"
            :unselectable-days-of-week="[0,2,3,4,5,6]"
            placeholder="Click to select..."
            icon="calendar-today"
            trap-focus
          />
        </o-field>

        <o-field v-if="showDateSelector" label="End date">
          <o-datepicker
            v-model="displayEndDate"
            :unselectable-days-of-week="[1,2,3,4,5,6]"
            placeholder="Click to select..."
            icon="calendar-today"
            trap-focus
          />
        </o-field>

        <!-- label is zero width joiner -->
        <o-field label="‍">
          <span v-if="maxWeeks && displayWeeks.length >= maxWeeks" class="tag">Note: only {{ maxWeeks }} weeks are displayed</span>
        </o-field>
      </o-field>
    </div>

    <div class="clearfix">
      <div v-if="!weekAgg" class="col daylabel">
        <span class="cell month">&nbsp;</span>
        <div>
          <div v-for="(row,i) of colGroups.rowinfo" :key="i">
            <span v-for="(dow,j) of daysOfWeek" :key="j" class="cell rowlabel">
              <template v-if="!weekAgg">
                {{ dow }}
              </template>
            </span>
            <span v-if="!weekAgg" class="cell break">&nbsp;</span>
          </div>
        </div>
      </div>

      <div v-for="col of colGroups.cols" :key="col.key" class="col">
        <span class="cell month">{{ formatMonth(col.key) }}</span>
        <div v-for="(cell,i) of col.rows" :key="i">
          <span v-for="(dayval,j) of cell.vals" :key="j" class="cell value" :style="cmap(dayval / cell.max)">
            <span v-if="cell.feed_version_sha1" class="tt">
              <template v-if="weekAgg">
                Week of
              </template>
              {{ formatDay(col.key, j) }}<br>
              Feed: {{ $filters.shortenName(cell.feed_onestop_id,16) }} ({{ $filters.shortenName(cell.feed_version_sha1,6) }})<br>
              Fetched: {{ $filters.formatDate(cell.fetched_at) }}<br>
              {{ Math.ceil(dayval / 3600) }} service hours <br>
              <template v-if="maxAggMode === 'all'">
                {{ Math.ceil((dayval / cell.max) * 100) }}% of max (all groups)
              </template>
              <template v-else-if="maxAggMode === 'group'">
                {{ Math.ceil((dayval / cell.max) * 100) }}% of max (within group)
              </template>
            </span>
          </span>
          <span v-if="!weekAgg" class="cell break">&nbsp;</span>
        </div>
      </div>

      <div class="col rowlabel">
        <span class="cell month">&nbsp;</span>
        <div v-for="(cell,i) of colGroups.rowinfo" :key="i">
          <span v-for="(dow,j) of daysOfWeek" :key="j" class="cell rowlabel">
            <template v-if="showGroupInfo">
              <nuxt-link :to="{name:'feeds-feedKey-versions-feedVersionKey', hash: '#service', params:{feedKey: cell.feed_onestop_id, feedVersionKey: cell.feed_version_sha1}}">
                Fetched {{ $filters.formatDate(cell.fetched_at) }}
              </nuxt-link>
            </template>
          </span>
          <span v-if="!weekAgg" class="cell break">&nbsp;</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseISO, format, add, isBefore } from 'date-fns'
import { gql } from 'graphql-tag'
import { ref, computed, withDefaults } from 'vue'
import { useQuery } from '@vue/apollo-composable'

// Type definitions

interface Feed {
  id: number
  onestop_id: string
}

interface ServiceLevel {
  start_date: string
  end_date: string
  monday: number
  tuesday: number
  wednesday: number
  thursday: number
  friday: number
  saturday: number
  sunday: number
}

interface FeedVersion {
  id: number
  sha1: string
  fetched_at: string
  url: string
  feed: Feed
  service_levels: ServiceLevel[]
}

interface ExtendedServiceLevel extends ServiceLevel {
  feed_onestop_id: string
  feed_version_sha1: string
  fetched_at: string
  feed_version_id?: number
}

interface CellData extends ExtendedServiceLevel {
  sum: number
  dayvals: number[]
  vals: number[]
  max: number
}

interface RowInfo {
  key: string
  feed_version_id?: number
  feed_version_sha1: string
  feed_onestop_id: string
  fetched_at: string
}

interface ColGroup {
  key: string
  rows: CellData[]
}

interface ColGroups {
  rowinfo: RowInfo[]
  cols: ColGroup[]
}

interface RowMax {
  maxsum: number
  maxday: number
}

interface Props {
  showFilters?: boolean
  showServiceRelative?: boolean
  showGroupInfo?: boolean
  showDateSelector?: boolean
  fvids?: number[]
  maxWeeks?: number | null
  weekAgg?: boolean
  useFeedVersions?: FeedVersion[]
}

const props = withDefaults(defineProps<Props>(), {
  showFilters: true,
  showServiceRelative: true,
  showGroupInfo: true,
  showDateSelector: true,
  fvids: () => [],
  maxWeeks: null,
  weekAgg: true,
  useFeedVersions: () => []
})

const query = gql`
query ($feed_version_ids: [Int!], $start_date: Date, $end_date: Date) {
  feed_versions(limit: 20, ids: $feed_version_ids) {
    id
    sha1
    fetched_at
    url
    feed {
      id
      onestop_id
    }
    service_levels(limit: 1000, where: {start_date:$start_date, end_date:$end_date}) {
      start_date
      end_date
      monday
      tuesday
      wednesday
      thursday
      friday
      saturday
      sunday
    }
  }
}
`

// Constants
const months: Record<number, string> = {
  1: 'Jan',
  2: 'Feb',
  3: 'Mar',
  4: 'Apr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Aug',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec'
}

// Reactive data
const fvAgg = ref<boolean>(false)
const maxAggMode = ref<'all' | 'group'>('all')
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const error = ref<string | null>(null)

// Apollo query - only fetch if not using provided feed versions
const shouldSkipQuery = computed(() => props.useFeedVersions.length > 0)

const queryVariables = computed(() => ({
  feed_version_ids: props.fvids,
  start_date: startDate.value ? format(startDate.value, 'yyyy-MM-dd') : null,
  end_date: endDate.value ? format(endDate.value, 'yyyy-MM-dd') : null
}))

const { result, onError } = useQuery<{ feed_versions: FeedVersion[] }>(
  query,
  queryVariables,
  {
    enabled: computed(() => !shouldSkipQuery.value)
  }
)

// Handle Apollo errors
onError((e) => {
  error.value = e.message
})

// Get feed versions from either Apollo query or props
const feed_versions = computed<FeedVersion[]>(() => {
  if (props.useFeedVersions.length > 0) {
    return props.useFeedVersions
  }
  return result.value?.feed_versions || []
})
// Computed properties
const fvsls = computed<ExtendedServiceLevel[]>(() => {
  const a: ExtendedServiceLevel[] = []
  for (const fv of feed_versions.value) {
    for (const fvsl of fv.service_levels) {
      a.push({
        ...fvsl,
        feed_onestop_id: fv.feed.onestop_id,
        feed_version_sha1: fv.sha1,
        fetched_at: fv.fetched_at
      })
    }
  }
  return a
})

const displayStartDate = computed<Date>({
  get () {
    if (startDate.value) {
      return startDate.value
    }
    const days = fvsls.value.map(s => s.start_date).sort()
    if (days.length > 0) {
      return parseISO(days[0].substr(0, 10))
    }
    return parseISO('2020-01-01')
  },
  set (v: Date) {
    startDate.value = v
  }
})

const displayEndDate = computed<Date>({
  get () {
    if (endDate.value) {
      return endDate.value
    }
    const days = fvsls.value.map(s => s.end_date).sort()
    if (days.length > 0) {
      return parseISO(days[days.length - 1].substr(0, 10))
    }
    return parseISO('2020-01-01')
  },
  set (v: Date) {
    endDate.value = v
  }
})
const displayWeeks = computed<string[]>(() => {
  const g: string[] = []
  let currentStartDate = displayStartDate.value
  const currentEndDate = displayEndDate.value
  while (isBefore(currentStartDate, currentEndDate)) {
    g.push(format(currentStartDate, 'yyyy-MM-dd'))
    currentStartDate = add(currentStartDate, { days: 7 })
  }
  if (props.maxWeeks) {
    return g.reverse().slice(0, props.maxWeeks).reverse()
  }
  return g
})
const colGroups = computed<ColGroups>(() => {
  // Create a grid of results
  const groups = new Map<string, Map<string, any>>()
  const rowmax = new Map<string, RowMax>()
  const rowinfo: RowInfo[] = []
  let maxday = 1.0
  let maxsum = 1.0

  // Order by feed_version_id
  for (const fvsl of fvsls.value) {
    // Expand
    const key = `${fvsl.feed_version_sha1}-${fvsl.feed_onestop_id}`
    let group = groups.get(key)
    if (!group) {
      rowinfo.push({
        key,
        feed_version_id: fvsl.feed_version_id,
        feed_version_sha1: fvsl.feed_version_sha1,
        feed_onestop_id: fvsl.feed_onestop_id,
        fetched_at: fvsl.fetched_at
      })
      group = new Map()
      groups.set(key, group)
    }

    let currentStartDate = parseISO(fvsl.start_date.substr(0, 10)) // always a monday
    const currentEndDate = parseISO(fvsl.end_date.substr(0, 10))

    while (isBefore(currentStartDate, currentEndDate)) {
      const day = format(currentStartDate, 'yyyy-MM-dd')
      const dayvals = [fvsl.monday, fvsl.tuesday, fvsl.wednesday, fvsl.thursday, fvsl.friday, fvsl.saturday, fvsl.sunday]
      const sum = dayvals.reduce((a, b) => a + b, 0)

      const cell = {
        ...fvsl,
        start_date: day,
        sum,
        dayvals
      }

      group.set(day, cell)
      currentStartDate = add(currentStartDate, { days: 7 })

      // global max
      maxsum = Math.max(maxsum, sum)
      maxday = Math.max(maxday, ...dayvals)

      // row max
      const rm = rowmax.get(key) || { maxsum: 1.0, maxday: 1.0 }
      rm.maxsum = Math.max(rm.maxsum, sum)
      rm.maxday = Math.max(rm.maxday, ...dayvals)
      rowmax.set(key, rm)
    }
  }

  // Regroup into columns
  const cols: ColGroup[] = []
  for (const colkey of displayWeeks.value) {
    const rows: CellData[] = []
    for (const row of rowinfo) {
      const group = groups.get(row.key)
      const rm = rowmax.get(row.key)
      const cell = group?.get(colkey) || {
        sum: 0,
        dayvals: [0, 0, 0, 0, 0, 0, 0],
        // Add required properties for CellData interface
        start_date: '',
        end_date: '',
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
        feed_onestop_id: row.feed_onestop_id,
        feed_version_sha1: row.feed_version_sha1,
        fetched_at: row.fetched_at
      } as CellData

      if (props.weekAgg) {
        cell.vals = [cell.sum || 0]
      } else {
        cell.vals = cell.dayvals || [0, 0, 0, 0, 0, 0, 0]
      }

      cell.max = 1.0
      if (props.weekAgg && maxAggMode.value === 'all') {
        cell.max = maxsum
      } else if (props.weekAgg && maxAggMode.value === 'group') {
        cell.max = rm?.maxsum || 1.0
      } else if (maxAggMode.value === 'all') {
        cell.max = maxday
      } else if (maxAggMode.value === 'group') {
        cell.max = rm?.maxday || 1.0
      }

      rows.push(cell)
    }
    cols.push({
      key: colkey,
      rows
    })
  }

  return {
    rowinfo,
    cols
  }
})
const daysOfWeek = computed<string[]>(() => {
  if (props.weekAgg) {
    return ['']
  }
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
})

// Methods
const formatDay = (start: string, offset: number): string => {
  const d = parseISO(start.substr(0, 10))
  return format(add(d, { days: offset }), 'PPPP')
}

const formatMonth = (v: string): string => {
  const s = v.split('-')
  const t = parseInt(s[1])
  const d = parseInt(s[2])
  if (d > 7) {
    return ''
  }
  if (t === 1) {
    return s[0] + ' ' + months[t]
  }
  return months[t] || ''
}

const cmap = (v: number): { 'background-color': string } => {
  const c = Math.floor((1 - v) * 50) + 50
  return {
    'background-color': `hsl(215,100%,${c}%)`
  }
}
</script>

<style scoped>
.col {
    width: 16px;
    float: left;
    padding-bottom:1px;
}

.cell {
    position: relative;
    display:block;
    width:16px;
    height:16px;
    border:solid 1px #fff;
}

.value:hover {
    border:solid 1px #ff0000;
}

.days {
  font-size:8pt;
  width: 200px !important;
}

.month {
    width:100px;
    font-size:10pt;
    border:none;
  margin-bottom:10px;
}

.daylabel {
  width: 50px;
  font-size:10pt;
}

.rowlabel {
  white-space: nowrap;
  text-overflow: clip;
  width:150px;
  font-size:10pt;
  padding-left: 10px;
  border:none;
}

.break {
  height:1px;
  border-bottom:solid 1px #ccc;
  margin-top:10px;
  margin-bottom:10px;
}

.tt {
  visibility: hidden;
  width: 360px;
  background-color: var(--bulma-schema-main);
  text-align: center;
  border-radius: 6px;
  padding: 5px;

  /* Position the tooltip */
  position: absolute;
  z-index: 1000;
  top: -180px;
  left: -180px;
}

.cell:hover .tt {
  visibility: visible;
}

.datepicker .dropdown-content {
    z-index:100;
    box-shadow: none !important;
}
</style>

<style lang="scss">
.tt {
  background-color: var(--bulma-background) !important;
}
</style>
