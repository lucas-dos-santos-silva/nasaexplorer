<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { apiGet, mediaUrl } from '../services/api'
import type { ImageLibraryItem, ImageLibraryResponse } from '../types'
import { useRemoteData } from '../composables/useRemoteData'
import SectionHeading from './SectionHeading.vue'
import StatusBlock from './StatusBlock.vue'

const query = ref('Artemis')
const submittedQuery = ref('')
const currentPage = ref(1)
const requestedPage = ref(1)
const results = ref<HTMLElement>()
const featuredItem = ref<ImageLibraryItem>()
const closeButton = ref<HTMLButtonElement>()
const pageSize = 8
const { data: response, loading, error, execute } = useRemoteData<ImageLibraryResponse>()

const items = computed(() => response.value?.collection?.items || [])
const total = computed(() => response.value?.collection?.metadata?.total_hits || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const pageStart = computed(() => total.value ? ((currentPage.value - 1) * pageSize) + 1 : 0)
const pageEnd = computed(() => Math.min(currentPage.value * pageSize, total.value))

function itemData(item: ImageLibraryItem) {
  return item.data?.[0]
}

function itemImage(item: ImageLibraryItem) {
  return mediaUrl(item.links?.find((link) => link.render === 'image')?.href || item.links?.[0]?.href)
}

function formatYear(date?: string) {
  return date ? new Date(date).getUTCFullYear() : 'Data n/d'
}

async function openFeatured(item: ImageLibraryItem) {
  featuredItem.value = item
  document.body.classList.add('modal-open')
  await nextTick()
  closeButton.value?.focus()
}

function closeFeatured() {
  featuredItem.value = undefined
  document.body.classList.remove('modal-open')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && featuredItem.value) {
    closeFeatured()
  }
}

async function scrollToResults() {
  await nextTick()
  results.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
}

async function loadPage(page: number, shouldScroll = true) {
  requestedPage.value = page
  await execute(() => apiGet<ImageLibraryResponse>('/images/search', {
    q: submittedQuery.value,
    media_type: 'image',
    page,
    page_size: pageSize,
  }))

  if (!error.value) {
    currentPage.value = page
  }

  if (shouldScroll) {
    await scrollToResults()
  }
}

function search() {
  const term = query.value.trim()
  if (term.length < 2) {
    return
  }

  submittedQuery.value = term
  return loadPage(1)
}

function previousPage() {
  if (currentPage.value > 1) {
    return loadPage(currentPage.value - 1)
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    return loadPage(currentPage.value + 1)
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('modal-open')
})
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

      <div ref="results" class="search-results-anchor" tabindex="-1">
        <StatusBlock v-if="loading && !items.length" state="loading" />
        <StatusBlock v-else-if="error" state="error" :message="error" @retry="loadPage(currentPage)" />
        <StatusBlock v-else-if="submittedQuery && !items.length" state="empty" message="Nenhuma imagem corresponde à sua busca." />
      </div>

      <div v-if="!error && items.length" class="search-results" :aria-busy="loading">
        <div v-if="loading" class="search-results__loading" role="status" aria-live="polite">
          Carregando página {{ requestedPage.toLocaleString('pt-BR') }}
        </div>
        <div class="search-results__meta">
          <p><strong>{{ total.toLocaleString('pt-BR') }}</strong> resultados para “{{ submittedQuery }}”</p>
          <span>Exibindo {{ pageStart }}–{{ pageEnd }}</span>
        </div>
        <ul class="image-grid" :class="{ 'image-grid--loading': loading }">
          <li v-for="(item, index) in items" :key="itemData(item)?.nasa_id || index" class="image-card">
            <button
              type="button"
              class="image-card__media"
              :aria-label="`Ampliar ${itemData(item)?.title || 'imagem da NASA'}`"
              @click="openFeatured(item)"
            >
              <img v-if="itemImage(item)" :src="itemImage(item)" :alt="itemData(item)?.title || 'Imagem do arquivo NASA'" loading="lazy">
              <span class="image-card__number">0{{ index + 1 }}</span>
              <span class="image-card__expand" aria-hidden="true">Ampliar ↗</span>
            </button>
            <div class="image-card__body">
              <p>{{ itemData(item)?.center || 'NASA' }} · {{ formatYear(itemData(item)?.date_created) }}</p>
              <h3>{{ itemData(item)?.title || 'Registro sem título' }}</h3>
            </div>
          </li>
        </ul>
        <nav v-if="totalPages > 1" class="image-pagination" aria-label="Paginação dos resultados">
          <button type="button" :disabled="currentPage === 1 || loading" @click="previousPage">
            ← Anterior
          </button>
          <p>
            Página <strong>{{ currentPage.toLocaleString('pt-BR') }}</strong>
            de {{ totalPages.toLocaleString('pt-BR') }}
          </p>
          <button type="button" :disabled="currentPage === totalPages || loading" @click="nextPage">
            Próxima →
          </button>
        </nav>
      </div>

      <div v-else-if="!submittedQuery && !loading" class="image-search__prompt">
        <p class="display-prompt">O arquivo começa com uma palavra.</p>
        <button type="button" class="suggestion" @click="query = 'James Webb'; search()">Experimentar “James Webb” <span aria-hidden="true">→</span></button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="featuredItem"
        class="image-lightbox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="featured-image-title"
        @click.self="closeFeatured"
      >
        <button
          ref="closeButton"
          type="button"
          class="image-lightbox__close"
          aria-label="Fechar imagem ampliada"
          @click="closeFeatured"
        >
          Fechar ×
        </button>
        <figure class="image-lightbox__content">
          <img
            :src="itemImage(featuredItem)"
            :alt="itemData(featuredItem)?.title || 'Imagem ampliada do arquivo NASA'"
          >
          <figcaption>
            <p class="eyebrow">{{ itemData(featuredItem)?.center || 'NASA' }} · {{ formatYear(itemData(featuredItem)?.date_created) }}</p>
            <h2 id="featured-image-title">{{ itemData(featuredItem)?.title || 'Registro sem título' }}</h2>
            <p v-if="itemData(featuredItem)?.description">{{ itemData(featuredItem)?.description }}</p>
          </figcaption>
        </figure>
      </div>
    </Teleport>
  </section>
</template>
