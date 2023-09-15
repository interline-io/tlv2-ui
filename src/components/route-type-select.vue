<template>
  <o-select v-model="modelValue" placeholder="Route type">
    <option :value="null">
      All
    </option>
    <option v-for="v,k of routeTypes" :key="k" :value="k">
      {{ v }}
    </option>
  </o-select>
</template>

<script>
const routeTypes = {
  0: 'Tram',
  1: 'Metro',
  2: 'Rail',
  3: 'Bus',
  4: 'Ferry',
  5: 'Cable car',
  6: 'Aerial lift',
  7: 'Funicular',
  11: 'Trolleybus',
  12: 'Monorail'
}

export default {
  data () {
    return {
      routeTypes
    }
  }
}

</script>
