<!-- based on https://vuejs.org/v2/examples/grid-component.html -->

<template>
  <div>
    <div
      v-if="showCsv"
      class="is-pulled-right"
    >
      <tl-csv-download :data="csvData" />
    </div>

    <tl-angle-table>
      <thead>
        <tr>
          <th
            v-for="key in tableColumns"
            :key="key.key"
          >
            <div>{{ forDisplay(key) }}</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in gridData"
          :key="entry.id"
        >
          <td
            v-for="key in tableColumns"
            :key="key.key"
            :class="key.cls"
          >
            <template v-if="key.hide" />
            <template v-else-if="key.link && entry[key.link]">
              <nuxt-link :to="getValue(entry, key)">
                <template v-if="key.key !== 'link'">
                  {{ key.link_text }}
                </template>
              </nuxt-link>
            </template>
            <template v-else-if="key.transform == 'secondsToDuration'">
              {{ secondsToDuration(getValue(entry, key)) }}
            </template>
            <template v-else-if="key.transform == 'secondsToString'">
              {{ secondsToString(getValue(entry, key)) }}
            </template>
            <template v-else-if="key.transform === 'category'">
              <tl-route-category :category="entry.category" />
            </template>
            <template v-else-if="key.transform === 'subcategory'">
              <tl-route-category
                :category="entry.category"
                :show-category="false"
                :subcategory="entry.subcategory"
              />
            </template>
            <template v-else>
              {{ getValue(entry, key) }}
            </template>
          </td>
          <slot :entry="entry" />
        </tr>
      </tbody>
    </tl-angle-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { secondsToDuration, secondsToString } from '../utils/time-format'

interface ColumnDef {
  key: string
  text?: string
  hide?: boolean
  link?: string
  link_text?: string
  transform?: string
  cls?: string
  prefix?: string
}

interface Props {
  showCsv?: boolean
  gridData?: Record<string, any>[]
  columns?: ColumnDef[]
  defaultSortKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  showCsv: true,
  gridData: () => [],
  columns: () => []
})

function getValueFromPath (entry: Record<string, any>, attr: string): any {
  return attr
    .split('.')
    .reduce(
      (obj, k) => (obj && obj[k] !== 'undefined' ? obj[k] : undefined),
      entry
    )
}

const tableColumns = computed<ColumnDef[]>(() => {
  const ret: ColumnDef[] = []
  for (const key of props.columns) {
    if (key.hide) {
      continue
    }
    ret.push(key)
  }
  return ret
})

const csvData = computed<Record<string, any>[]>(() => {
  const ret: Record<string, any>[] = []
  for (const entry of props.gridData) {
    const outRow: Record<string, any> = {}
    for (const key of props.columns) {
      if (key.link) {
        continue
      }
      let v: any = (entry as any)[key.key]
      switch (key.transform) {
        case 'secondsToDuration':
          v = secondsToDuration((entry as any)[key.key])
          break
        case 'secondsToString':
          v = secondsToString((entry as any)[key.key])
          break
      }
      if (typeof v === 'number' && !Number.isInteger(v)) {
        v = v.toFixed(2)
      }
      outRow[key.text || key.key] = v
    }
    ret.push(outRow)
  }
  return ret
})

function forDisplay (str: ColumnDef): string {
  return str.text || str.key.replace(/_/g, ' ')
}

function getValue (entry: Record<string, any>, key: ColumnDef): any {
  const attr = key.key
  let v = getValueFromPath(entry, attr)
  if (typeof v === 'number' && !Number.isInteger(v)) {
    v = v.toFixed(2)
  }
  if (key.prefix) {
    const v2 = getValueFromPath(entry, key.prefix)
    if (v2) {
      v = v2 + ': ' + v
    }
  }
  return v
}
</script>
