<template>
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">
        <slot name="trigger" />
      </p>
    </header>
    <div class="card-content">
      <slot name="default" />
    </div>
  </div>
</template>
