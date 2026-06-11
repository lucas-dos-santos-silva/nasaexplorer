<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { apiProducts, buildApiExplorerRequest } from '../data/apiProducts'
import { apiGet } from '../services/api'
import type { ApiProduct, CatalogResponse } from '../types'
import type { ApiExampleConfig } from '../types/apiExplorer'
import { useRemoteData } from '../composables/useRemoteData'
import SectionHeading from './SectionHeading.vue'
import StatusBlock from './StatusBlock.vue'

const { data: catalog, loading, error, execute } = useRemoteData<CatalogResponse>()
const filter = ref('')
const requests = reactive<Record<string, {
  exampleId: string
  path: string
  loading: boolean
  error: string
  result: unknown
}>>({})

const products = computed(() => {
  const term = filter.value.trim().toLocaleLowerCase('pt-BR')
  const all = catalog.value?.products || []

  if (!term) {
    return all
  }

  return all.filter((product) =>
    [product.name, product.description, product.id].some((value) =>
      value.toLocaleLowerCase('pt-BR').includes(term),
    ),
  )
})

function groupLabel(product: ApiProduct) {
  if (['apod', 'asteroids', 'exoplanets', 'ssd'].includes(product.id)) {
    return 'Astronomia'
  }
  if (['eonet', 'epic', 'gibs', 'insight'].includes(product.id)) {
    return 'Terra'
  }
  if (['donki', 'tle', 'ssc'].includes(product.id)) {
    return 'Espaço'
  }
  if (['techport', 'techtransfer', 'trek'].includes(product.id)) {
    return 'Tecnologia'
  }
  return 'Ciência aberta'
}

function load() {
  return execute(() => apiGet<CatalogResponse>('/catalog'))
}

function requestFor(product: ApiProduct) {
  const configuredProduct = apiProducts.find(({ id }) => id === product.id)
  const example = configuredProduct?.examples[0]
  requests[product.id] ||= {
    exampleId: example?.id || 'catalog-example',
    path: example
      ? buildApiExplorerRequest(example).url.replace('/api/v1', '')
      : product.example.replace('/api/v1', ''),
    loading: false,
    error: '',
    result: undefined,
  }
  return requests[product.id]
}

function examplesFor(product: ApiProduct): readonly ApiExampleConfig[] {
  return apiProducts.find(({ id }) => id === product.id)?.examples || []
}

function selectExample(product: ApiProduct) {
  const state = requestFor(product)
  const example = examplesFor(product).find(({ id }) => id === state.exampleId)

  if (example) {
    state.path = buildApiExplorerRequest(example).url.replace('/api/v1', '')
    state.result = undefined
    state.error = ''
  }
}

function splitRequest(value: string) {
  const [path, queryString = ''] = value.trim().replace(/^\/api\/v1/, '').split('?')
  const params = Object.fromEntries(new URLSearchParams(queryString))
  return { path: path.startsWith('/') ? path : `/${path}`, params }
}

function formattedResult(result: unknown) {
  return typeof result === 'string' ? result : JSON.stringify(result, null, 2)
}

async function run(product: ApiProduct) {
  const state = requestFor(product)
  state.loading = true
  state.error = ''

  try {
    const { path, params } = splitRequest(state.path)
    state.result = await apiGet<unknown>(path, params)
  } catch (requestError) {
    state.error = requestError instanceof Error ? requestError.message : 'Não foi possível executar a consulta.'
  } finally {
    state.loading = false
  }
}

onMounted(load)
</script>

<template>
  <section id="catalogo" class="catalog-section page-section" aria-labelledby="catalog-title">
    <div class="content-shell">
      <div class="catalog-header">
        <SectionHeading
          eyebrow="Catálogo de acesso"
          title="Uma porta para cada pergunta."
          description="Explore os produtos disponíveis neste gateway. Todos os caminhos permanecem dentro da API local."
        />
        <label class="catalog-filter">
          <span>Filtrar APIs</span>
          <input v-model="filter" type="search" placeholder="Nome ou assunto">
        </label>
      </div>
      <StatusBlock v-if="loading" state="loading" />
      <StatusBlock v-else-if="error" state="error" :message="error" @retry="load" />
      <StatusBlock v-else-if="!products.length" state="empty" message="Nenhuma API corresponde ao filtro." />
      <div v-else class="catalog-list">
        <article v-for="(product, index) in products" :key="product.id" class="catalog-item">
          <span class="catalog-item__number">{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="catalog-item__title">
            <p class="eyebrow">{{ groupLabel(product) }}</p>
            <h3>{{ product.name }}</h3>
          </div>
          <p class="catalog-item__description">{{ product.description }}</p>
          <div class="catalog-item__console">
            <label v-if="examplesFor(product).length > 1" :for="`api-example-${product.id}`">
              Forma de uso
            </label>
            <select
              v-if="examplesFor(product).length > 1"
              :id="`api-example-${product.id}`"
              v-model="requestFor(product).exampleId"
              @change="selectExample(product)"
            >
              <option v-for="example in examplesFor(product)" :key="example.id" :value="example.id">
                {{ example.name }}
              </option>
            </select>
            <label :for="`api-path-${product.id}`">Consulta local</label>
            <div class="catalog-item__request">
              <input
                :id="`api-path-${product.id}`"
                v-model="requestFor(product).path"
                :aria-label="`Consulta de ${product.name}`"
              >
              <button type="button" :disabled="requestFor(product).loading" @click="run(product)">
                {{ requestFor(product).loading ? 'Consultando' : 'Executar' }}
              </button>
            </div>
            <p v-if="requestFor(product).error" class="catalog-item__error" role="alert">
              {{ requestFor(product).error }}
            </p>
            <details v-else-if="requestFor(product).result !== undefined" open>
              <summary>Resposta de {{ product.name }}</summary>
              <pre>{{ formattedResult(requestFor(product).result) }}</pre>
            </details>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
