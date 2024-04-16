<template>
  <div>
    desc: {{ description }}
    <h2 class="title is-2">
      <slot>{{ title }}</slot>
    </h2>
    <Head>
      <Title>{{ title }} </Title>
      <Meta name="description" :content="description || title" />
      <Meta name="twitter:title" :content="title" />
      <Meta name="twitter:description" :content="description || description" />
      <Meta name="og:title" :content="title" />
      <Meta name="og:description" :content="description || title" />
    </Head>
  </div>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '', required: true },
    description: { type: String, default: '' }
  }
}
</script>

<style scoped>
  h2 {
    margin-top:1em;
    margin-bottom:1em;
    }
</style>
