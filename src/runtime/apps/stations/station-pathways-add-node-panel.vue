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
        <t-field label="Level">
          <t-dropdown
            id="add-node-level"
            :model-value="selectedLevel"
            aria-role="list"
            aria-label="Select level for new node"
            @update:model-value="$emit('update:selected-level', $event)"
          >
            <template #trigger>
              <t-button type="button" aria-haspopup="true" aria-expanded="false">
                {{ levelName }} &nbsp;
                <t-icon icon="menu-down" />
              </t-button>
            </template>
            <t-dropdown-item v-for="level of levels" :key="level.id" :value="level.id" aria-role="listitem">
              <h3>{{ level.level_name }}</h3>
              <small> {{ level.stops.length }} nodes</small>
            </t-dropdown-item>
          </t-dropdown>
        </t-field>
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
