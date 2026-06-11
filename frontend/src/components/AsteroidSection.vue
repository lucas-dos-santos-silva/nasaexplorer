<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { apiGet } from '../services/api'
import type { Asteroid, AsteroidFeedResponse, AsteroidResponse } from '../types'
import SectionHeading from './SectionHeading.vue'
import StatusBlock from './StatusBlock.vue'

type ViewMode = 'catalog' | 'today' | 'period'

const mode = ref<ViewMode>('catalog')
const asteroids = ref<Asteroid[]>([])
const total = ref(0)
const currentPage = ref(0)
const totalPages = ref(1)
const loading = ref(false)
const error = ref('')
const selected = ref<Asteroid>()
const detailLoading = ref(false)
const detailError = ref('')
const today = new Date()
const startDate = ref(today.toISOString().slice(0, 10))
const endDate = ref(today.toISOString().slice(0, 10))
const pageSize = 8

const hazardousCount = computed(() =>
  asteroids.value.filter((asteroid) => asteroid.is_potentially_hazardous_asteroid).length,
)

function cleanName(asteroid: Asteroid) {
  return asteroid.name.replace(/[()]/g, '')
}

function diameter(asteroid: Asteroid) {
  const min = asteroid.estimated_diameter?.meters?.estimated_diameter_min
  const max = asteroid.estimated_diameter?.meters?.estimated_diameter_max
  if (min === undefined || max === undefined) {
    return 'n/d'
  }
  return `${Math.round((min + max) / 2).toLocaleString('pt-BR')} m`
}

function approach(asteroid: Asteroid) {
  return asteroid.close_approach_data?.[0]
}

function speed(asteroid: Asteroid) {
  const value = Number(approach(asteroid)?.relative_velocity?.kilometers_per_hour)
  return Number.isFinite(value) ? `${Math.round(value).toLocaleString('pt-BR')} km/h` : 'n/d'
}

function distance(asteroid: Asteroid) {
  const value = Number(approach(asteroid)?.miss_distance?.lunar)
  return Number.isFinite(value) ? `${value.toFixed(1)} distâncias lunares` : 'Sem aproximação futura'
}

function approachDate(asteroid: Asteroid) {
  const value = approach(asteroid)?.close_approach_date
  if (!value) {
    return 'Não informada'
  }
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}

function flattenFeed(response: AsteroidFeedResponse) {
  return Object.entries(response.near_earth_objects || {})
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([, entries]) => entries)
}

async function loadCatalog(page = 0) {
  mode.value = 'catalog'
  currentPage.value = page
  await load(async () => {
    const response = await apiGet<AsteroidResponse>('/asteroids/browse', {
      page,
      size: pageSize,
    })
    asteroids.value = response.near_earth_objects || []
    total.value = response.page?.total_elements || asteroids.value.length
    totalPages.value = response.page?.total_pages || 1
  })
}

async function loadToday() {
  mode.value = 'today'
  await loadFeed('/asteroids/today', {})
}

async function loadPeriod() {
  mode.value = 'period'
  await loadFeed('/asteroids/feed', {
    start_date: startDate.value,
    end_date: endDate.value,
  })
}

async function loadFeed(path: string, params: Record<string, string>) {
  await load(async () => {
    const response = await apiGet<AsteroidFeedResponse>(path, params)
    asteroids.value = flattenFeed(response)
    total.value = response.element_count || asteroids.value.length
    currentPage.value = 0
    totalPages.value = 1
  })
}

async function load(loader: () => Promise<void>) {
  loading.value = true
  error.value = ''
  selected.value = undefined
  try {
    await loader()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Não foi possível consultar os asteroides.'
  } finally {
    loading.value = false
  }
}

async function selectAsteroid(asteroid: Asteroid) {
  if (selected.value?.id === asteroid.id) {
    selected.value = undefined
    detailError.value = ''
    return
  }

  selected.value = asteroid
  detailLoading.value = true
  detailError.value = ''
  try {
    selected.value = await apiGet<Asteroid>(`/asteroids/${asteroid.id}`)
  } catch (reason) {
    detailError.value = reason instanceof Error ? reason.message : 'Detalhes indisponíveis.'
  } finally {
    detailLoading.value = false
  }
}

function retry() {
  if (mode.value === 'today') return loadToday()
  if (mode.value === 'period') return loadPeriod()
  return loadCatalog(currentPage.value)
}

onMounted(() => loadCatalog())
</script>

<template>
  <section id="asteroides" class="asteroid-section page-section" aria-labelledby="asteroid-title">
    <div class="content-shell">
      <SectionHeading
        eyebrow="Vizinhança orbital"
        title="Objetos próximos da Terra"
        description="Explore o catálogo NeoWs, veja aproximações atuais e investigue cada objeto em detalhes."
        light
      />

      <div class="asteroid-tools">
        <div class="asteroid-tabs" role="tablist" aria-label="Visões de asteroides">
          <button :class="{ active: mode === 'catalog' }" type="button" @click="loadCatalog()">Catálogo</button>
          <button :class="{ active: mode === 'today' }" type="button" @click="loadToday">Hoje</button>
          <button :class="{ active: mode === 'period' }" type="button" @click="mode = 'period'">Período</button>
        </div>
        <form v-if="mode === 'period'" class="asteroid-period" @submit.prevent="loadPeriod">
          <label>De <input v-model="startDate" type="date" required></label>
          <label>Até <input v-model="endDate" type="date" required></label>
          <button type="submit" :disabled="loading">Consultar</button>
        </form>
      </div>

      <StatusBlock v-if="loading && !asteroids.length" state="loading" />
      <StatusBlock v-else-if="error" state="error" :message="error" @retry="retry" />
      <StatusBlock v-else-if="!asteroids.length" state="empty" />

      <div v-else class="asteroid-layout">
        <div class="asteroid-orbit">
          <div aria-hidden="true">
            <span class="asteroid-orbit__earth"></span>
            <i v-for="index in 4" :key="index" :class="`asteroid-orbit__line asteroid-orbit__line--${index}`"></i>
            <span class="asteroid-orbit__object"></span>
          </div>
          <p>{{ total.toLocaleString('pt-BR') }}<small>{{ mode === 'catalog' ? 'objetos catalogados' : 'aproximações encontradas' }}</small></p>
          <dl class="asteroid-summary">
            <div><dt>Em exibição</dt><dd>{{ asteroids.length }}</dd></div>
            <div><dt>Potencialmente perigosos</dt><dd>{{ hazardousCount }}</dd></div>
          </dl>
        </div>

        <div>
          <ol class="asteroid-list" :aria-busy="loading">
            <li v-for="(asteroid, index) in asteroids" :key="asteroid.id" :class="{ selected: selected?.id === asteroid.id }">
              <button
                type="button"
                :aria-expanded="selected?.id === asteroid.id"
                :aria-controls="`asteroid-detail-${asteroid.id}`"
                @click="selectAsteroid(asteroid)"
              >
                <div class="asteroid-list__rank">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="asteroid-list__name">
                  <span v-if="asteroid.is_potentially_hazardous_asteroid" class="risk-label">Atenção</span>
                  <h3>{{ cleanName(asteroid) }}</h3>
                  <p>{{ distance(asteroid) }}</p>
                </div>
                <dl>
                  <div><dt>Diâmetro</dt><dd>{{ diameter(asteroid) }}</dd></div>
                  <div><dt>Velocidade</dt><dd>{{ speed(asteroid) }}</dd></div>
                </dl>
              </button>
              <aside
                v-if="selected?.id === asteroid.id"
                :id="`asteroid-detail-${asteroid.id}`"
                class="asteroid-detail"
                aria-live="polite"
              >
                <p class="eyebrow">Ficha orbital</p>
                <h3>{{ cleanName(selected) }}</h3>
                <p v-if="detailLoading">Atualizando dados completos…</p>
                <p v-else-if="detailError" class="asteroid-detail__error">{{ detailError }}</p>
                <dl>
                  <div><dt>ID NASA</dt><dd>{{ selected.id }}</dd></div>
                  <div><dt>Magnitude absoluta</dt><dd>{{ selected.absolute_magnitude_h ?? 'n/d' }}</dd></div>
                  <div><dt>Próxima aproximação</dt><dd>{{ approachDate(selected) }}</dd></div>
                  <div><dt>Corpo orbitado</dt><dd>{{ approach(selected)?.orbiting_body || 'n/d' }}</dd></div>
                  <div><dt>Risco potencial</dt><dd>{{ selected.is_potentially_hazardous_asteroid ? 'Sim' : 'Não' }}</dd></div>
                  <div><dt>Monitorado pelo Sentry</dt><dd>{{ selected.is_sentry_object ? 'Sim' : 'Não' }}</dd></div>
                </dl>
                <a v-if="selected.nasa_jpl_url" :href="selected.nasa_jpl_url" target="_blank" rel="noreferrer">
                  Abrir registro no JPL ↗
                </a>
              </aside>
            </li>
          </ol>

          <nav v-if="mode === 'catalog' && totalPages > 1" class="asteroid-pagination" aria-label="Paginação do catálogo">
            <button type="button" :disabled="currentPage === 0 || loading" @click="loadCatalog(currentPage - 1)">← Anterior</button>
            <span>Página {{ currentPage + 1 }} de {{ totalPages }}</span>
            <button type="button" :disabled="currentPage + 1 >= totalPages || loading" @click="loadCatalog(currentPage + 1)">Próxima →</button>
          </nav>
        </div>
      </div>
    </div>
  </section>
</template>
