<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { apiGet } from '../services/api'
import type { Exoplanet } from '../types'
import SectionHeading from './SectionHeading.vue'
import StatusBlock from './StatusBlock.vue'

type View = 'recent' | 'nearby' | 'systems'

const view = ref<View>('recent')
const entries = ref<Exoplanet[]>([])
const selected = ref<Exoplanet>()
const loading = ref(false)
const error = ref('')

const labels: Record<View, string> = {
  recent: 'Últimas adições',
  nearby: 'Mais próximos',
  systems: 'Sistemas múltiplos',
}

const headline = computed(() => {
  if (!entries.value.length) return '—'
  if (view.value === 'systems') return Math.max(...entries.value.map((entry) => entry.sy_pnum || 0))
  if (view.value === 'nearby') return `${entries.value[0].sy_dist?.toFixed(1)} pc`
  return entries.value[0].disc_year || '—'
})

function formatNumber(value?: number, digits = 1) {
  return value === undefined || value === null
    ? 'n/d'
    : value.toLocaleString('pt-BR', { maximumFractionDigits: digits })
}

function classification(entry: Exoplanet) {
  const radius = entry.pl_rade
  if (!radius) return 'Dimensão não informada'
  if (radius < 1.25) return 'Mundo rochoso'
  if (radius < 2) return 'Super-Terra'
  if (radius < 4) return 'Sub-Netuno'
  if (radius < 10) return 'Gigante gasoso'
  return 'Super-Júpiter'
}

async function load(nextView: View = view.value) {
  view.value = nextView
  loading.value = true
  error.value = ''
  selected.value = undefined
  try {
    entries.value = await apiGet<Exoplanet[]>(`/exoplanets/explore/${nextView}`, { limit: 12 })
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Não foi possível consultar o arquivo.'
  } finally {
    loading.value = false
  }
}

function select(entry: Exoplanet) {
  selected.value = selected.value === entry ? undefined : entry
}

onMounted(() => load())
</script>

<template>
  <section id="exoplanetas" class="exoplanet-section page-section" aria-labelledby="exoplanet-title">
    <div class="content-shell">
      <SectionHeading
        eyebrow="NASA Exoplanet Archive"
        title="Outros mundos, em números."
        description="Planetas confirmados além do Sistema Solar, comparados por tamanho, órbita, distância e método de descoberta."
        light
      />

      <div class="exoplanet-tabs">
        <button
          v-for="(label, key) in labels"
          :key="key"
          type="button"
          :class="{ active: view === key }"
          @click="load(key as View)"
        >
          {{ label }}
        </button>
      </div>

      <StatusBlock v-if="loading && !entries.length" state="loading" />
      <StatusBlock v-else-if="error" state="error" :message="error" @retry="load()" />
      <StatusBlock v-else-if="!entries.length" state="empty" />

      <div v-else class="exoplanet-layout">
        <div class="exoplanet-observatory">
          <div class="exoplanet-orbit" aria-hidden="true">
            <span class="exoplanet-star"></span>
            <i v-for="index in 4" :key="index"></i>
            <b></b>
          </div>
          <p>{{ headline }}<small>{{ labels[view] }}</small></p>
        </div>

        <div class="exoplanet-results">
          <article
            v-for="entry in entries"
            :key="`${entry.hostname}-${entry.pl_name || entry.sy_pnum}`"
            :class="{ selected: selected === entry }"
          >
            <button type="button" :aria-expanded="selected === entry" @click="select(entry)">
              <div>
                <p class="eyebrow">{{ entry.discoverymethod || `${entry.sy_pnum} planetas confirmados` }}</p>
                <h3>{{ entry.pl_name || entry.hostname }}</h3>
                <span>{{ entry.pl_name ? entry.hostname : entry.st_spectype || 'Tipo estelar não informado' }}</span>
              </div>
              <dl>
                <div><dt>Distância</dt><dd>{{ formatNumber(entry.sy_dist) }} pc</dd></div>
                <div><dt>{{ view === 'systems' ? 'Planetas' : 'Ano' }}</dt><dd>{{ view === 'systems' ? entry.sy_pnum : entry.disc_year }}</dd></div>
              </dl>
            </button>
            <div v-if="selected === entry" class="exoplanet-detail">
              <p>{{ entry.pl_name ? classification(entry) : 'Sistema planetário confirmado' }}</p>
              <dl>
                <div><dt>Raio</dt><dd>{{ formatNumber(entry.pl_rade, 2) }} R⊕</dd></div>
                <div><dt>Massa</dt><dd>{{ formatNumber(entry.pl_bmasse, 2) }} M⊕</dd></div>
                <div><dt>Período orbital</dt><dd>{{ formatNumber(entry.pl_orbper, 2) }} dias</dd></div>
                <div><dt>Tipo estelar</dt><dd>{{ entry.st_spectype || 'n/d' }}</dd></div>
                <div><dt>Planetas no sistema</dt><dd>{{ entry.sy_pnum || 'n/d' }}</dd></div>
                <div><dt>Publicação</dt><dd>{{ entry.disc_pubdate || 'n/d' }}</dd></div>
              </dl>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
