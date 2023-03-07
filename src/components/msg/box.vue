<template>
    <div class="mb-4">
        <article :class="msgClass">
            <div
                class="message-header"
                v-if="title"
            >{{ title }}</div>
            <template v-if="hasIcon">
                <div class="media message-body">
                    <o-icon
                        :icon="getIcon"
                        size="medium"
                        class="media-left"
                    ></o-icon>
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
    </div>
</template>

<script>
export default {
    props: {
        variant: { type: String, default() { return 'info' } },
        title: { type: String, default: null },
        icon: { type: String, default: null },
        noIcon: { type: Boolean, default: false }
    },
    computed: {
        getIcon() {
            if (this.variant === 'info') { return 'information' }
            if (this.variant === 'danger' || this.variant === 'warning') { return 'alert' }
            return this.icon || this.variant
        },
        hasIcon() { return !this.noIcon },
        msgClass() {
            return `message block is-${this.variant}`
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
}

.media-left {
    flex-basis: auto;
    flex-grow: 0;
    flex-shrink: 0;
    padding: 1em;
}
</style>