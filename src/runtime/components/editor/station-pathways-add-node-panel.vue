<template>
  <div>
    <nav class="panel station-editor-panel">
      <p class="panel-heading">
        Add Node
      </p>
      <div class="panel-block is-block">
        <p class="notification">
          To create a node, select which level it will be located on and then click/tap on the map.
        </p>
        <o-field label="Level">
          <o-dropdown
            :model-value="selectedLevel"
            aria-role="list"
            @update:model-value="$emit('update:selected-level', $event)"
          >
            <template #trigger>
              <button class="button" type="button">
                {{ levelName }} &nbsp;
                <o-icon icon="menu-down" />
              </button>
            </template>
            <o-dropdown-item v-for="level of levels" :key="level.id" :value="level.id" aria-role="listitem">
              <h3>{{ level.level_name }}</h3>
              <small> {{ level.stops.length }} nodes</small>
            </o-dropdown-item>
          </o-dropdown>
        </o-field>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  props: {
    selectedLevel: {
      type: [Number, String],
      default: null
    },
    levels: {
      type: Array,
      required: true
    },
    levelIndex: {
      type: Object,
      required: true
    }
  },
  emits: ['update:selected-level'],
  computed: {
    levelName () {
      return this.levelIndex[this.selectedLevel]?.level_name || 'None'
    }
  }
}
</script>
