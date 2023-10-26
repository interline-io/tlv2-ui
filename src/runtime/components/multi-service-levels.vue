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
            <template v-if="showGroupInfo">.
              <nuxt-link :to="{name:'feeds-feed-versions-version', hash: '#service', params:{feed: cell.feed_onestop_id, version: cell.feed_version_sha1}}">
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

<script>
import { parseISO, format, add, isBefore } from 'date-fns'
import gql from 'graphql-tag'

const q = gql`
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

export default {
  props: {
    showFilters: { type: Boolean, default: true },
    showServiceRelative: { type: Boolean, default: true },
    showGroupInfo: { type: Boolean, default: true },
    showDateSelector: { type: Boolean, default: true },
    fvids: { type: Array, default () { return [] } },
    maxWeeks: { type: Number, default () { return null } },
    weekAgg: { type: Boolean, default () { return true } },
    useFeedVersions: { type: Array, default () { return [] } }
  },
  data () {
    return {
      dowNames,
      feed_versions: this.useFeedVersions,
      fvAgg: false,
      maxAggMode: 'all',
      startDate: null,
      endDate: null
    }
  },
  apollo: {
    feed_versions: {
      client: 'transitland',
      query: q,
      skip () { return this.useFeedVersions.length > 0 },
      variables () {
        return {
          feed_version_ids: this.fvids,
          start_date: this.startDate,
          end_date: this.endDate
        }
      },
      error (e) { this.error = e }
    }
  },
  computed: {
    fvsls () {
      const a = []
      for (const fv of this.feed_versions) {
        for (const fvsl of fv.service_levels) {
          a.push(Object.assign({}, fvsl, { feed_onestop_id: fv.feed.onestop_id, feed_version_sha1: fv.sha1, fetched_at: fv.fetched_at }))
        }
      }
      return a
    },
    displayStartDate: {
      get () {
        if (this.startDate) {
          return this.startDate
        }
        const days = this.fvsls.map((s) => { return s.start_date }).sort()
        if (days.length > 0) {
          return parseISO(days[0].substr(0, 10))
        }
        return parseISO('2020-01-01')
      },
      set (v) {
        this.startDate = v
      }
    },
    displayEndDate: {
      get () {
        if (this.endDate) {
          return this.endDate
        }
        const days = this.fvsls.map((s) => { return s.end_date }).sort()
        if (days.length > 0) {
          return parseISO(days[days.length - 1].substr(0, 10))
        }
        return parseISO('2020-01-01')
      },
      set (v) {
        this.endDate = v
      }
    },
    displayWeeks () {
      const g = []
      let startDate = this.displayStartDate
      const endDate = this.displayEndDate
      while (isBefore(startDate, endDate)) {
        g.push(format(startDate, 'yyyy-MM-dd'))
        startDate = add(startDate, { days: 7 })
      }
      if (this.maxWeeks) {
        return g.reverse().slice(0, this.maxWeeks).reverse()
      }
      return g
    },
    colGroups () {
      // Create a grid of results
      const groups = new Map()
      const rowmax = new Map()
      const rowinfo = []
      let maxday = 1.0
      let maxsum = 1.0
      // Order by feed_version_id
      for (const fvsl of this.fvsls) {
        // Expand
        const key = `${fvsl.feed_version_sha1}-${fvsl.id}`
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
        }
        let startDate = parseISO(fvsl.start_date.substr(0, 10)) // always a monday
        const endDate = parseISO(fvsl.end_date.substr(0, 10))
        while (isBefore(startDate, endDate)) {
          const day = format(startDate, 'yyyy-MM-dd')
          const dayvals = [fvsl.monday, fvsl.tuesday, fvsl.wednesday, fvsl.thursday, fvsl.friday, fvsl.saturday, fvsl.sunday]
          const sum = dayvals.reduce(function (a, b) { return a + b }, 0)
          const cell = Object.assign(
            {},
            fvsl,
            { start_date: day, sum, dayvals }
          )
          group.set(day, cell)
          startDate = add(startDate, { days: 7 })
          // global max
          maxsum = Math.max(maxsum, sum)
          maxday = Math.max(maxday, ...dayvals)
          // row max
          const rm = rowmax.get(key) || { maxsum: 1.0, maxday: 1.0 }
          rm.maxsum = Math.max(rm.maxsum, sum)
          rm.maxday = Math.max(rm.maxday, ...dayvals)
          rowmax.set(key, rm)
        }
        groups.set(key, group)
      }
      // Regroup into columns
      const cols = []
      for (const colkey of this.displayWeeks) {
        const rows = []
        for (const row of rowinfo) {
          const group = groups.get(row.key)
          const rm = rowmax.get(row.key)
          const cell = group.get(colkey) || { sum: null, dayvals: [null, null, null, null, null, null, null] }
          if (this.weekAgg) {
            cell.vals = [cell.sum]
          } else {
            cell.vals = cell.dayvals
          }
          cell.max = 1.0
          if (this.weekAgg && this.maxAggMode === 'all') {
            cell.max = maxsum
          } else if (this.weekAgg && this.maxAggMode === 'group') {
            cell.max = rm.maxsum
          } else if (this.maxAggMode === 'all') {
            cell.max = maxday
          } else if (this.maxAggMode === 'group') {
            cell.max = rm.maxday
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
    },
    daysOfWeek () {
      if (this.weekAgg) {
        return ['']
      }
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  },
  methods: {
    formatDay (start, offset) {
      const d = parseISO(start.substr(0, 10))
      return format(add(d, { days: offset }), 'PPPP')
    },
    formatMonth (v) {
      const s = v.split('-')
      const t = parseInt(s[1])
      const d = parseInt(s[2])
      if (d > 7) {
        return ''
      }
      if (t === 1) {
        return s[0] + ' ' + months[t]
      }
      return months[t]
    },
    cmap (v) {
      const c = Math.floor((1 - (v)) * 50) + 50
      return {
        'background-color': 'hsl(215,100%,' + c + '%)'
      }
    }
  }
}

const dowNames = {
  0: 'Mon',
  1: 'Tue',
  2: 'Wed',
  3: 'Thu',
  4: 'Fri',
  5: 'Sat',
  6: 'Sun'
}

const months = {
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
  background-color: black;
  color: #fff;
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
