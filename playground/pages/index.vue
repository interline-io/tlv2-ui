<template>
  <div class="container">
    <section class="section">
      <h1 class="title is-1">
        TLv2-UI Component Library
      </h1>
      <p class="subtitle">
        Interactive demos and testing playground for all t-* components
      </p>

      <div class="content">
        <h2 class="title is-3">
          Form Controls
        </h2>
        <div class="buttons">
          <NuxtLink to="/controls/button" class="button is-primary">
            <t-icon icon="gesture-tap" />
            <span>Button</span>
          </NuxtLink>
          <NuxtLink to="/controls/checkbox" class="button is-primary">
            <t-icon icon="checkbox-marked" />
            <span>Checkbox</span>
          </NuxtLink>
          <NuxtLink to="/controls/radio" class="button is-primary">
            <t-icon icon="radiobox-marked" />
            <span>Radio</span>
          </NuxtLink>
          <NuxtLink to="/controls/switch" class="button is-primary">
            <t-icon icon="toggle-switch" />
            <span>Switch</span>
          </NuxtLink>
          <NuxtLink to="/controls/input" class="button is-primary">
            <t-icon icon="form-textbox" />
            <span>Input</span>
          </NuxtLink>
          <NuxtLink to="/controls/textarea" class="button is-primary">
            <t-icon icon="text" />
            <span>Textarea</span>
          </NuxtLink>
          <NuxtLink to="/controls/select" class="button is-primary">
            <t-icon icon="form-select" />
            <span>Select</span>
          </NuxtLink>
          <NuxtLink to="/controls/field" class="button is-primary">
            <t-icon icon="form-textbox-password" />
            <span>Field</span>
          </NuxtLink>
          <NuxtLink to="/controls/slider" class="button is-primary">
            <t-icon icon="tune" />
            <span>Slider</span>
          </NuxtLink>
        </div>

        <h2 class="title is-3">
          Layout & Navigation
        </h2>
        <div class="buttons">
          <NuxtLink to="/controls/tabs" class="button is-info">
            <t-icon icon="tab" />
            <span>Tabs</span>
          </NuxtLink>
          <NuxtLink to="/controls/dropdown" class="button is-info">
            <t-icon icon="menu-down" />
            <span>Dropdown</span>
          </NuxtLink>
          <NuxtLink to="/controls/modal" class="button is-info">
            <t-icon icon="window-restore" />
            <span>Modal</span>
          </NuxtLink>
          <NuxtLink to="/controls/card" class="button is-info">
            <t-icon icon="card" />
            <span>Card</span>
          </NuxtLink>
        </div>

        <h2 class="title is-3">
          Data Display
        </h2>
        <div class="buttons">
          <NuxtLink to="/controls/table" class="button is-success">
            <t-icon icon="table" />
            <span>Table</span>
          </NuxtLink>
          <NuxtLink to="/controls/tag" class="button is-success">
            <t-icon icon="tag" />
            <span>Tag</span>
          </NuxtLink>
          <NuxtLink to="/controls/notification" class="button is-success">
            <t-icon icon="bell" />
            <span>Notification</span>
          </NuxtLink>
          <NuxtLink to="/controls/msg" class="button is-success">
            <t-icon icon="message" />
            <span>Message</span>
          </NuxtLink>
        </div>

        <h2 class="title is-3">
          Utilities
        </h2>
        <div class="buttons">
          <NuxtLink to="/controls/icon" class="button is-warning">
            <t-icon icon="emoticon-happy" />
            <span>Icon</span>
          </NuxtLink>
          <NuxtLink to="/controls/loading" class="button is-warning">
            <t-icon icon="loading" />
            <span>Loading</span>
          </NuxtLink>
          <NuxtLink to="/controls/tooltip" class="button is-warning">
            <t-icon icon="tooltip" />
            <span>Tooltip</span>
          </NuxtLink>
          <NuxtLink to="/controls/search-bar" class="button is-warning">
            <t-icon icon="magnify" />
            <span>Search Bar</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.button {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
