<template>
  <article :class="msgClass">
    <div v-if="title" class="message-header">
      {{ title }}
    </div>
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
  </article>
</template>

<script>
export default {
  props: {
    variant: { type: String, default () { return 'info' } },
    title: { type: String, default: null },
    icon: { type: String, default: null },
    noIcon: { type: Boolean, default: false }
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
</style>
