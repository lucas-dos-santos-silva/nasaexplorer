<script setup lang="ts">
import { computed, ref } from 'vue'
import { apiGet, mediaUrl } from '../services/api'
import type { ImageLibraryItem, ImageLibraryResponse } from '../types'
import { useRemoteData } from '../composables/useRemoteData'
import SectionHeading from './SectionHeading.vue'
import StatusBlock from './StatusBlock.vue'

const query = ref('Artemis')
const submittedQuery = ref('')
const { data: response, loading, error, execute } = useRemoteData<ImageLibraryResponse>()

const items = computed(() => response.value?.collection?.items?.slice(0, 8) || [])
const total = computed(() => response.value?.collection?.metadata?.total_hits || 0)

function itemData(item: ImageLibraryItem) {
  return item.data?.[0]
}

function itemImage(item: ImageLibraryItem) {
  return mediaUrl(item.links?.find((link) => link.render === 'image')?.href || item.links?.[0]?.href)
}

function formatYear(date?: string) {
  return date ? new Date(date).getUTCFullYear() : 'Data n/d'
}

function search() {
  const term = query.value.trim()
  if (term.length < 2) {
    return
  }

  submittedQuery.value = term
  execute(() => apiGet<ImageLibraryResponse>('/images/search', {
    q: term,
    media_type: 'image',
    page: 1,
  }))
}
</script>

<template>
  <section id="imagens" class="image-search page-section" aria-labelledby="image-search-title">
    <div class="content-shell">
      <SectionHeading
        eyebrow="Arquivo visual"
        title="Procure. Encontre. Amplie."
        description="Milhões de registros de missões, pessoas e lugares documentados pela NASA."
      />
      <form class="search-form" role="search" @submit.prevent="search">
        <label for="nasa-search">Buscar na NASA Image Library</label>
        <div class="search-form__control">
          <input
            id="nasa-search"
            v-model="query"
            type="search"
            minlength="2"
            autocomplete="off"
            placeholder="Ex.: Artemis, Webb, Mars"
            required
          >
          <button type="submit" :disabled="loading">
            <span>{{ loading ? 'Buscando' : 'Buscar' }}</span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </form>

      <StatusBlock v-if="loading" state="loading" />
      <StatusBlock v-else-if="error" state="error" :message="error" @retry="search" />
      <StatusBlock v-else-if="submittedQuery && !items.length" state="empty" message="Nenhuma imagem corresponde à sua busca." />

      <div v-else-if="items.length" class="search-results">
        <div class="search-results__meta">
          <p><strong>{{ total.toLocaleString('pt-BR') }}</strong> resultados para “{{ submittedQuery }}”</p>
          <span>Exibindo {{ items.length }}</span>
        </div>
        <ul class="image-grid">
          <li v-for="(item, index) in items" :key="itemData(item)?.nasa_id || index" class="image-card">
            <div class="image-card__media">
              <img v-if="itemImage(item)" :src="itemImage(item)" :alt="itemData(item)?.title || 'Imagem do arquivo NASA'" loading="lazy">
              <span class="image-card__number">0{{ index + 1 }}</span>
            </div>
            <div class="image-card__body">
              <p>{{ itemData(item)?.center || 'NASA' }} · {{ formatYear(itemData(item)?.date_created) }}</p>
              <h3>{{ itemData(item)?.title || 'Registro sem título' }}</h3>
            </div>
          </li>
        </ul>
      </div>

      <div v-else class="image-search__prompt">
        <p class="display-prompt">O arquivo começa com uma palavra.</p>
        <button type="button" class="suggestion" @click="query = 'James Webb'; search()">Experimentar “James Webb” <span aria-hidden="true">→</span></button>
      </div>
    </div>
  </section>
</template>
