<template>
    <div>
        <nuxt-link to="/places">
            <o-icon icon="arrow-left-thin" /> Back to list of all countries
        </nuxt-link>
        <tl-places
            place-level="ADM0_ADM1_CITY"
            :adm0="$route.params.adm0"
            :adm1="$route.params.adm1"
            :city="$route.params.city"
        />
    </div>
</template>