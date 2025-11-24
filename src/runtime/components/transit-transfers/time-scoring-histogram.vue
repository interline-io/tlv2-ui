<template>
  <div>
    <div :id="name" class="histogram" />
  </div>
</template>

<script setup lang="ts">
import vegaEmbed from 'vega-embed'
import { useDebounceFn } from '@vueuse/core'
import {
  NewScenario
} from './scenario'
import type { Scenario } from './scenario'
import { binnedCounts, type BinCount } from './bins'

interface Transfer {
  buffer_time: number
}

interface TransferGroup {
  transfers: Transfer[]
}

interface Props {
  name?: string
  scenario?: Scenario
  transferGroups?: TransferGroup[]
  binnedCountsGroupedByScenarios?: Record<string, BinCount[]>
}

const props = withDefaults(defineProps<Props>(), {
  name: 'histogram',
  scenario: () => NewScenario({}),
  transferGroups: () => [],
  binnedCountsGroupedByScenarios: undefined
})

const domWidthForBarChart = ref(0)
const el = ref<HTMLElement>()

const binnedCountsComputed = computed(() => {
  const ret: number[] = []
  for (const tg of props.transferGroups) {
    for (const t of tg.transfers) {
      ret.push(t.buffer_time)
    }
  }
  const bc = binnedCounts(
    ret,
    props.scenario.transferScoringBreakpoints
  )
  return bc
})

const binnedCountsGroupedByScenariosArray = computed(() => {
  const arr: BinCount[] = []
  if (props.binnedCountsGroupedByScenarios) {
    for (const value of Object.values(props.binnedCountsGroupedByScenarios)) {
      if (value) {
        value.forEach((bin) => {
          arr.push(Object.assign({}, bin))
        })
      }
    }
  }
  return arr
})
const vegaSpec = computed(() => {
  if (props.binnedCountsGroupedByScenarios) {
    const width = (
      domWidthForBarChart.value - 24 /* container padding */ - 250 /* y axis */
    ) / (
      binnedCountsGroupedByScenariosArray.value.length / 4
    )
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
      data: {
        values: binnedCountsGroupedByScenariosArray.value
      },
      facet: {
        column: {
          field: 'scenarioName',
          title: null,
          sort: ['scenarioNumber']
        }
      },
      spec: {
        width,
        height: 300,
        encoding: {
          x: {
            field: 'binName',
            type: 'nominal',
            title: 'Wait Time (Minutes)',
            axis: {
              titleFontSize: 14,
              labelAngle: 45,
              labelFontSize: 12
            },
            sort: {
              field: 'binMin'
            }
          },
          y: {
            field: 'count',
            type: 'quantitative',
            title: 'Total Transfers',
            axis: {
              titleFontSize: 14,
              labelFontSize: 10
            }
          },
          color: {
            legend: null,
            title: 'Wait Time (Minutes)',
            field: 'binMin',
            scale: {
              range: [
                'red',
                'green',
                'yellowgreen',
                'orange'
              ]
            }
          }
        },
        layer: [
          {
            mark: 'bar'
          },
          {
            transform: [
              {
                calculate: 'format(datum.percentOfTotal, \'.0%\')',
                as: 'perc_total'
              },
              {
                calculate: 'datum.count+\' (\' +datum.perc_total +\')\'',
                as: 'countPercentText'
              }
            ],
            mark: {
              type: 'text',
              align: 'center',
              yOffset: -10,
              fontSize: 14
            },
            encoding: {
              text: {
                field: 'countPercentText',
                type: 'ordinal'
              }
            }
          }
        ]
      }
    }
  } else {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
      width: 'container',
      height: 'container',
      data: { values: binnedCountsComputed.value },
      layer: [{
        mark: 'bar'
      }, {
        transform: [
          {
            calculate: 'format(datum.percentOfTotal, \'.0%\')',
            as: 'perc_total'
          },
          {
            calculate: 'datum.count+\' (\' +datum.perc_total +\')\'',
            as: 'countPercentText'
          }
        ],
        mark: {
          type: 'text',
          align: 'center',
          yOffset: -10,
          fontSize: 18
        },
        encoding: {
          text: {
            field: 'countPercentText',
            type: 'ordinal'
          }
        }
      }],
      encoding: {
        x: {
          field: 'binName',
          type: 'nominal',
          title: 'Wait Time for Transfer (Minutes)',
          axis: {
            titleFontSize: 18,
            labelAngle: 0,
            labelFontSize: 14
          },
          sort: {
            field: 'binMin'
          }
        },
        y: {
          field: 'count',
          type: 'quantitative',
          title: 'Total Transfers',
          axis: {
            titleFontSize: 18,
            labelFontSize: 14
          }
        },
        color: {
          legend: false,
          field: 'binMin',
          scale: {
            range: [
              // 'gray',
              'red',
              'green',
              'yellowgreen',
              'orange',
              'gray'
            ]
          }
        }
      }
    }
  }
})

const renderVega = () => {
  domWidthForBarChart.value = el.value?.parentElement?.getBoundingClientRect().width ?? 0
  vegaEmbed('#' + props.name, vegaSpec.value as any, { actions: false })
}

const debouncedRenderVega = useDebounceFn(renderVega, 150)

watch(vegaSpec, () => {
  renderVega()
})

onMounted(() => {
  renderVega()
  window.addEventListener('resize', debouncedRenderVega)
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedRenderVega)
})
</script>

<style scoped>
.histogram {
  width: 100%;
  height: 300px;
}
</style>
