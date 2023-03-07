<template>
    <div>
        props: {{ props }}
        args: {{ args }}
        <o-field
            grouped
            :label="filteringByOperatorLocation ? 'Filter by operator location' : 'Search by operator name or location'"
        >
            <tl-search-bar
                v-model="args.search"
                placeholder="e.g. Bay Area Rapid Transit"
            />

            <o-dropdown
                position="bottom-left"
                append-to-body
                aria-role="menu"
                trap-focus
            >
                <template #trigger="{ active }">
                    <o-button
                        label="Options"
                        variant="primary"
                        :icon-left="active ? 'menu-up' : 'menu-down'"
                    />
                </template>

                <o-dropdown-item
                    aria-role="menu-item"
                    custom
                >
                    <div class="field">
                        <o-checkbox v-model="merged">
                            Group agencies by operator
                        </o-checkbox>
                    </div>

                    <div class="field">
                        <o-checkbox v-model="unmatched">
                            Show operators without agency matches
                        </o-checkbox>
                    </div>
                </o-dropdown-item>
            </o-dropdown>
        </o-field>

        <o-field>
            <o-field
                v-if="search"
                expanded
            >
                <tl-tag
                    attached
                    closable
                    aria-close-label="Close tag"
                    @close="clearQuery"
                >
                    {{ search }}
                </tl-tag>
            </o-field>
            <o-field
                v-if="adm0Name"
                expanded
            >
                <tl-tag
                    attached
                    closable
                    aria-close-label="Close tag"
                    @close="clearQuery"
                >
                    Country: {{ adm0Name }}
                </tl-tag>
            </o-field>
            <o-field
                v-if="adm1Name"
                expanded
            >
                <tl-tag
                    attached
                    closable
                    aria-close-label="Close tag"
                    @close="clearQuery"
                >
                    State/Province: {{ adm1Name }}
                </tl-tag>
            </o-field>
            <o-field
                v-if="cityName"
                expanded
            >
                <tl-tag
                    attached
                    closable
                    aria-close-label="Close tag"
                    @close="clearQuery"
                >
                    City: {{ cityName }}
                </tl-tag>
            </o-field>

        </o-field>

        <tl-msg-error v-if="error">{{ error }}</tl-msg-error>

        <table
            class="table is-striped"
            style="width:100%"
        >
            <thead>
                <tr>
                    <th>Operator Name (Short Name)</th>
                    <th>City</th>
                    <th>State / Province</th>
                    <th>Country</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="row of entities"
                    :key="row.id"
                >
                    <td>
                        <nuxt-link :to="{ name: 'operators-onestop_id', params: { onestop_id: row.onestop_id } }">
                            {{ row.name }}
                        </nuxt-link>
                        <span v-if="row.short_name">&nbsp;({{ row.short_name }})</span>
                    </td>
                    <td>
                        {{ row.city_name }}
                    </td>
                    <td>
                        {{ row.adm1_name }}
                    </td>
                    <td>
                        <o-tooltip
                            :label="row.other_places.filter((s) => { return s.city_name }).map((s) => { return s.city_name }).join(', ')"
                            dashed
                        >
                            {{ row.adm0_name }}
                        </o-tooltip>
                    </td>
                </tr>
            </tbody>
        </table>
        <tl-show-more
            v-if="entities.length >= limit"
            :limit="entities.length"
            @click="limit += 100"
        />
        <o-loading
            :full-page="false"
            v-model:active="loading"
        ></o-loading>
    </div>
</template>

<script setup>
import gql from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { ref, watch, computed } from "vue"

const query = gql`
query ($limit: Int, $after: Int, $search: String, $merged: Boolean, $adm0_name: String, $adm1_name: String, $city_name: String) {
  entities: operators(after: $after, limit: $limit, where: {search: $search, merged: $merged, adm0_name: $adm0_name, adm1_name: $adm1_name, city_name: $city_name}) {
    id
    onestop_id
    name
    short_name
    agencies {
      places(where:{min_rank:0.2}) {
        city_name
        adm0_name
        adm1_name
        rank
      }
    }
  }
}
`

const nullString = function (v) {
    if (!v || v.length === 0) {
        return null
    }
    return v
}

const nullBool = function (v) {
    if (v === 'true') {
        return true
    } else if (v === 'false') {
        return false
    }
    return null
}

const props = defineProps({
    modelValue: { type: Object, default() { return {} } },
    search: String,
    adm0Name: String,
    adm1Name: String,
    cityName: String,
    limit: { type: Number, default: 10 }
})

const args = ref({
    test: 123,
    search: props.search,
    adm1Name: props.modelValue.adm1Name,
})

// shadow props
let search = ref(props.search)
const adm0Name = ref(props.adm0Name)
const adm1Name = ref(props.adm1Name)
const cityName = ref(props.cityName)
const limit = ref(props.limit)
const unmatched = ref(false)
const merged = ref(false)

const emit = defineEmits([
    'update:modelValue',
    'update:search',
    'update:adm0Name',
    'update:adm1Name',
    'update:cityName'
])

watch(args, () => {
    console.log('args update')
    emit('update:modelValue', args)
}, { deep: true })
watch(search, (v) => { emit('update:search', v) })
watch(adm0Name, (v) => { emit('update:adm0Name', v) })
watch(adm1Name, (v) => { emit('update:adm1Name', v) })
watch(cityName, (v) => { emit('update:cityName', v) })

const { result, loading, error } = useQuery(
    query,
    () => ({
        search: nullString(search.value),
        merged: nullBool(merged.value),
        adm0_name: nullString(adm0Name.value),
        adm1_name: nullString(adm1Name.value),
        city_name: nullString(cityName.value),
        limit: limit.value,
        //   merged: this.merged,
        //   limit: this.limit        
    }))

const filteringByOperatorLocation = computed(() => {
    return adm0Name.value || adm1Name.value || cityName.value
})

const clearQuery = function () {
    search.value = null
    adm0Name.value = null
    adm1Name.value = null
    cityName.value = null
}

const entities = computed(() => {
    return (result.value?.entities ?? []).map((s) => {
        const entity = {
            name: s.name,
            short_name: s.short_name,
            agencies: s.agencies,
            onestop_id: s.onestop_id
        }
        let places = []
        for (const a of s.agencies || []) {
            for (const p of a.places || []) {
                places.push(p)
            }
        }
        places = places.sort(function (a, b) { return a.rank - b.rank })
        if (places.length > 0) {
            entity.adm0_name = places[0].adm0_name
            entity.adm1_name = places[0].adm1_name
            entity.city_name = places[0].city_name
        }
        entity.other_places = places
        return entity
    })
})
</script>