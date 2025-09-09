<template>
  <article :class="msgClass">
    <div
      v-if="title || collapsible"
      class="message-header"
      :class="{ 'is-clickable': collapsible }"
      @click="collapsible && toggleCollapsed()"
    >
      <span>{{ title || defaultTitle }}</span>
      <o-icon
        v-if="collapsible"
        :icon="isCollapsed ? 'chevron-down' : 'chevron-up'"
        class="collapse-icon"
      />
    </div>
    <div
      v-if="!collapsible || !isCollapsed"
      :class="collapsible ? 'collapsible-content' : ''"
    >
      <template v-if="hasIcon">
        <div class="media message-body">
          <o-icon :icon="getIcon" size="medium" class="media-left" />
          <div class="media-content">
            <slot />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="message-body">
          <slot />
        </div>
      </template>
    </div>
  </article>
</template>

<script>
export default {
  props: {
    variant: { type: String, default () { return 'info' } },
    title: { type: String, default: null },
    icon: { type: String, default: null },
    noIcon: { type: Boolean, default: false },
    collapsible: { type: Boolean, default: false },
    collapsed: { type: Boolean, default: false },
    defaultTitle: { type: String, default: 'Information' }
  },
  emits: ['toggle'],
  data () {
    return {
      isCollapsed: this.collapsed
    }
  },
  computed: {
    getIcon () {
      if (this.variant === 'info') { return 'information' }
      if (this.variant === 'danger' || this.variant === 'warning') { return 'alert' }
      return this.icon || this.variant
    },
    hasIcon () { return !this.noIcon },
    msgClass () {
      if (this.variant) {
        return `message mb-4 is-${this.variant}`
      }
      return `message mb-4`
    }
  },
  methods: {
    toggleCollapsed () {
      this.isCollapsed = !this.isCollapsed
      this.$emit('toggle', this.isCollapsed)
    }
  }
}
</script>

<style scoped>
.media {
    align-items: flex-start;
    display: flex;
}

.media-content {
    flex-basis: auto;
    flex-grow: 1;
    flex-shrink: 1;
    overflow:hidden; /* hack */
}

.media-left {
    flex-basis: auto;
    flex-grow: 0;
    flex-shrink: 0;
    padding: 1em;
}

/* Collapsible styles */
.message-header.is-clickable {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background-color 0.2s ease;
}

.message-header.is-clickable:hover {
    opacity: 0.8;
}

.collapse-icon {
    transition: transform 0.2s ease;
}

.collapsible-content {
    transition: all 0.2s ease;
}
</style>
