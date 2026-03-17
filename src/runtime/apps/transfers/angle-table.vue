<template>
  <table class="table is-striped ttat-angle-table">
    <slot />
  </table>
</template>

<style lang="scss">
.ttat-angle-table {
  width: 100%;

  thead>tr {
    height: 150px;
    white-space: nowrap;
    vertical-align: bottom;
    font-weight: 400;
  }

  th,
  td {
    padding: 0.125em 0.25em !important;
  }

  th>div {
    transform:
      /* Magic Numbers */
      translate(25px, 100px) rotate(-45deg);
    width: 30px;
  }
}
</style>
