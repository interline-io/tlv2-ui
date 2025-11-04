<template>
  <div>
    <nuxt-link to="/places">
      <o-icon icon="arrow-left-thin" /> Back to list of all countries
    </nuxt-link>
    <tl-places
      place-level="ADM0_ADM1"
      :adm0="$route.params.adm0"
    />
  </div>
</template>
