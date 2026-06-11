<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { apiGet } from '../services/api'
import type { ApiProduct, CatalogResponse } from '../types'
import { useRemoteData } from '../composables/useRemoteData'
import SectionHeading from './SectionHeading.vue'
import StatusBlock from './StatusBlock.vue'

const { data: catalog, loading, error, execute } = useRemoteData<CatalogResponse>()
const filter = ref('')

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
          <div>
            <p class="eyebrow">{{ groupLabel(product) }}</p>
            <h3>{{ product.name }}</h3>
          </div>
          <p>{{ product.description }}</p>
          <code>{{ product.route }}</code>
          <span class="catalog-item__arrow" aria-hidden="true">↗</span>
        </article>
      </div>
    </div>
  </section>
</template>
