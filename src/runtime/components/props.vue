<template>
  <div>
    <table class="table tl-props">
      <tbody>
        <slot />
      </tbody>
    </table>
  </div>
</template>

<style>
.tl-props {
    width:100%;
}

.tl-props td,
.tl-props th {
    padding: 5px;
    border: 0px;
}

.tl-props td:first-child {
    padding-right: 20px;
    font-weight: bold;
    text-align: right;
    width: 160px;
    white-space: nowrap;
    word-wrap: nowrap;
}
</style>
