<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { apiGet, mediaUrl } from '../services/api'
import type { Apod } from '../types'
import { useRemoteData } from '../composables/useRemoteData'
import StatusBlock from './StatusBlock.vue'

const { data: apod, loading, error, execute } = useRemoteData<Apod>()

const image = computed(() => {
  if (!apod.value) {
    return ''
  }

  return mediaUrl(apod.value.hdurl || apod.value.url || apod.value.thumbnail_url)
})

const formattedDate = computed(() => {
  if (!apod.value?.date) {
    return ''
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${apod.value.date}T00:00:00Z`))
})

function load() {
  return execute(() => apiGet<Apod>('/apod', { thumbs: true }))
}

onMounted(load)
</script>

<template>
  <section id="topo" class="apod-hero" aria-labelledby="apod-title">
    <div v-if="loading && !apod" class="apod-hero__status">
      <StatusBlock state="loading" />
    </div>
    <div v-else-if="error && !apod" class="apod-hero__status">
      <StatusBlock state="error" :message="error" @retry="load" />
    </div>
    <template v-else-if="apod">
      <img v-if="image" class="apod-hero__image" :src="image" :alt="apod.title">
      <div v-else class="apod-hero__image apod-hero__image--fallback"></div>
      <div class="apod-hero__scrim"></div>
      <div class="apod-hero__topline">
        <span>Imagem astronômica do dia</span>
        <span>{{ formattedDate }}</span>
      </div>
      <div class="apod-hero__content">
        <p class="eyebrow eyebrow--light">{{ apod.media_type === 'video' ? 'Seleção em vídeo' : 'Seleção de hoje' }}</p>
        <h1 id="apod-title">{{ apod.title }}</h1>
        <div class="apod-hero__details">
          <p>{{ apod.explanation }}</p>
          <div class="apod-hero__credit">
            <span>Crédito</span>
            <strong>{{ apod.copyright || 'NASA / domínio público' }}</strong>
          </div>
        </div>
      </div>
      <a class="apod-hero__scroll" href="#imagens">
        Explorar dados
        <span aria-hidden="true">↓</span>
      </a>
    </template>
  </section>
</template>
