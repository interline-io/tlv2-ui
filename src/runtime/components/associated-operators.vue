<template>
  <div>
    <div v-if="associatedOperators?.length > 0" class="table-container">
      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Operator name</th>
            <th>Operator Onestop ID</th>
            <th class="has-text-right">
              Links to view
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(operator, i) of associatedOperatorsToDisplay" :key="i">
            <td>
              <strong>{{ operator.name }}</strong> {{ operator.short_name ? `(${operator.short_name})` : '' }}
            </td>
            <td>
              <tl-safelink :text="operator.onestop_id" />
            </td>
            <td class="has-text-right">
              <nuxt-link class="button is-primary is-small" :to="{ name: 'operators-operatorKey', params: { operatorKey: operator.onestop_id } }">
                Operator
              </nuxt-link> <nuxt-link class="button is-primary is-small" :to="{ name: 'operators-operatorKey', hash: '#map', params: { operatorKey: operator.onestop_id } }">
                Map
              </nuxt-link> <nuxt-link class="button is-primary is-small" :to="{ name: 'operators-operatorKey', hash: '#routes', params: { operatorKey: operator.onestop_id } }">
                Routes
              </nuxt-link> <nuxt-link class="button is-primary is-small" :to="{ name: 'operators-operatorKey', hash: '#stops', params: { operatorKey: operator.onestop_id } }">
                Stops
              </nuxt-link>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="associatedOperators.length > associatedOperatorsToDisplay.length">
          <tr>
            <td colspan="3">
              <div>
                <a class="button is-primary is-small is-fullwidth" @click="showAllRows = true">Show all operators</a>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <tl-msg-info v-else>
      There are no operators associated with this feed.
    </tl-msg-info>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// TypeScript interfaces
interface Operator {
  id: number
  name: string
  short_name?: string | null
  onestop_id: string
}

const props = withDefaults(defineProps<{
  associatedOperators?: Operator[]
}>(), {
  associatedOperators: () => []
})

// Reactive state
const showAllRows = ref(false)

// Computed properties
const associatedOperatorsToDisplay = computed((): Operator[] => {
  if (showAllRows.value) {
    return props.associatedOperators
  } else {
    return props.associatedOperators.slice(0, 5)
  }
})
</script>
