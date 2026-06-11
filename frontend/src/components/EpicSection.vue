<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { apiGet, mediaUrl } from '../services/api'
import type { EpicAvailableDate, EpicImage } from '../types'
import SectionHeading from './SectionHeading.vue'
import StatusBlock from './StatusBlock.vue'

type EpicCollection = 'natural' | 'enhanced' | 'aerosol' | 'cloud'

const collection = ref<EpicCollection>('natural')
const images = ref<EpicImage[]>([])
const availableDates = ref<EpicAvailableDate[]>([])
const selectedDate = ref('')
const selectedIndex = ref(0)
const loading = ref(false)
const error = ref('')

const selected = computed(() => images.value[selectedIndex.value])
const collectionLabels: Record<EpicCollection, string> = {
  natural: 'Cor natural',
  enhanced: 'Cor realçada',
  aerosol: 'Índice de aerossóis',
  cloud: 'Fração de nuvens',
}

function imageUrl(image?: EpicImage, type: 'jpg' | 'png' = 'jpg') {
  if (!image) return ''
  const [date] = image.date.split(' ')
  const [year, month, day] = date.split('-')
  return mediaUrl(
    `https://epic.gsfc.nasa.gov/archive/${collection.value}/${year}/${month}/${day}/${type}/${image.image}.${type}`,
  )
}

function formatDate(value?: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${value.replace(' ', 'T')}Z`))
}

async function loadLatest() {
  await load(() => apiGet<EpicImage[]>(`/epic/${collection.value}`))
}

async function loadDate() {
  if (!selectedDate.value) return
  await load(() => apiGet<EpicImage[]>(`/epic/${collection.value}/date/${selectedDate.value}`))
}

async function changeCollection(next: EpicCollection) {
  collection.value = next
  selectedDate.value = ''
  await Promise.all([loadLatest(), loadAvailableDates()])
}

async function loadAvailableDates() {
  try {
    availableDates.value = await apiGet<EpicAvailableDate[]>(`/epic/${collection.value}/available`)
  } catch {
    availableDates.value = []
  }
}

async function load(loader: () => Promise<EpicImage[]>) {
  loading.value = true
  error.value = ''
  try {
    images.value = await loader()
    selectedIndex.value = 0
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Não foi possível carregar o EPIC.'
  } finally {
    loading.value = false
  }
}

onMounted(() => Promise.all([loadLatest(), loadAvailableDates()]))
</script>

<template>
  <section id="epic" class="epic-section page-section" aria-labelledby="epic-title">
    <div class="content-shell">
      <SectionHeading
        eyebrow="DSCOVR / EPIC"
        title="A Terra inteira, a cada poucas horas."
        description="Imagens do disco completo da Terra observadas do ponto de Lagrange L1, a cerca de 1,5 milhão de quilômetros."
      />

      <div class="epic-controls">
        <div class="epic-tabs" aria-label="Produto EPIC">
          <button
            v-for="(_, key) in collectionLabels"
            :key="key"
            type="button"
            :class="{ active: collection === key }"
            @click="changeCollection(key as EpicCollection)"
          >
            {{ collectionLabels[key as EpicCollection] }}
          </button>
        </div>
        <form class="epic-date" @submit.prevent="loadDate">
          <label for="epic-date">Data disponível</label>
          <select id="epic-date" v-model="selectedDate">
            <option value="">Mais recente</option>
            <option v-for="entry in availableDates.slice(0, 120)" :key="entry.date" :value="entry.date">
              {{ entry.date }}
            </option>
          </select>
          <button type="submit" :disabled="!selectedDate || loading">Observar</button>
        </form>
      </div>

      <StatusBlock v-if="loading && !images.length" state="loading" />
      <StatusBlock v-else-if="error" state="error" :message="error" @retry="loadLatest" />
      <StatusBlock v-else-if="!selected" state="empty" />

      <div v-else class="epic-viewer" :aria-busy="loading">
        <div class="epic-stage">
          <img :src="imageUrl(selected)" :alt="selected.caption">
          <div class="epic-stage__meta">
            <span>{{ collectionLabels[collection] }}</span>
            <span>{{ formatDate(selected.date) }}</span>
          </div>
        </div>
        <div class="epic-information">
          <p class="eyebrow">Imagem {{ selectedIndex + 1 }} de {{ images.length }}</p>
          <h3>{{ selected.caption }}</h3>
          <dl>
            <div>
              <dt>Centro observado</dt>
              <dd>
                {{ selected.centroid_coordinates?.lat?.toFixed(2) ?? 'n/d' }}°,
                {{ selected.centroid_coordinates?.lon?.toFixed(2) ?? 'n/d' }}°
              </dd>
            </div>
            <div>
              <dt>Identificador</dt>
              <dd>{{ selected.identifier }}</dd>
            </div>
          </dl>
          <a :href="imageUrl(selected, 'png')" target="_blank" rel="noreferrer">Abrir resolução completa ↗</a>
        </div>
        <div class="epic-timeline" aria-label="Imagens do dia">
          <button
            v-for="(image, index) in images"
            :key="image.identifier"
            type="button"
            :class="{ active: selectedIndex === index }"
            :aria-label="`Ver imagem de ${formatDate(image.date)}`"
            @click="selectedIndex = index"
          >
            <img :src="imageUrl(image)" alt="" loading="lazy">
            <span>{{ image.date.slice(11, 16) }} UTC</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
