<template>
  <tl-msg-box variant="info" no-icon>
    <div class="columns">
      <div class="column is-8">
        <p>
          <slot name="desc" />
        </p>
      </div>
      <div class="column is-4 has-text-right">
        <slot name="action" />
      </div>
    </div>
  </tl-msg-box>
</template>
