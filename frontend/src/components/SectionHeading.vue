<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description?: string
  light?: boolean
}>()
</script>

<template>
  <div class="section-heading" :class="{ 'section-heading--light': light }">
    <div class="section-heading__index" aria-hidden="true">
      <span></span>
      <span></span>
    </div>
    <div>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
      <p v-if="description" class="section-heading__description">{{ description }}</p>
    </div>
  </div>
</template>
