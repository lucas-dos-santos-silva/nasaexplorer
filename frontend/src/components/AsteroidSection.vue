<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { apiGet } from '../services/api'
import type { Asteroid, AsteroidResponse } from '../types'
import { useRemoteData } from '../composables/useRemoteData'
import SectionHeading from './SectionHeading.vue'
import StatusBlock from './StatusBlock.vue'

const { data: response, loading, error, execute } = useRemoteData<AsteroidResponse>()
const asteroids = computed(() => response.value?.near_earth_objects?.slice(0, 5) || [])

function diameter(asteroid: Asteroid) {
  const min = asteroid.estimated_diameter?.meters?.estimated_diameter_min
  const max = asteroid.estimated_diameter?.meters?.estimated_diameter_max
  if (min === undefined || max === undefined) {
    return 'n/d'
  }
  return `${Math.round((min + max) / 2)} m`
}

function speed(asteroid: Asteroid) {
  const value = Number(asteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour)
  return Number.isFinite(value) ? `${Math.round(value).toLocaleString('pt-BR')} km/h` : 'n/d'
}

function distance(asteroid: Asteroid) {
  const value = Number(asteroid.close_approach_data?.[0]?.miss_distance?.lunar)
  return Number.isFinite(value) ? `${value.toFixed(1)} distâncias lunares` : 'Sem aproximação futura'
}

function load() {
  return execute(() => apiGet<AsteroidResponse>('/asteroids/browse', { page: 0, size: 12 }))
}

onMounted(load)
</script>

<template>
  <section id="asteroides" class="asteroid-section page-section" aria-labelledby="asteroid-title">
    <div class="content-shell">
      <SectionHeading
        eyebrow="Vizinhança orbital"
        title="Objetos próximos da Terra"
        description="Uma leitura do catálogo NeoWs: escala, velocidade e risco em perspectiva."
        light
      />
      <StatusBlock v-if="loading" state="loading" />
      <StatusBlock v-else-if="error" state="error" :message="error" @retry="load" />
      <StatusBlock v-else-if="!asteroids.length" state="empty" />
      <div v-else class="asteroid-layout">
        <div class="asteroid-orbit" aria-hidden="true">
          <span class="asteroid-orbit__earth"></span>
          <i v-for="index in 4" :key="index" :class="`asteroid-orbit__line asteroid-orbit__line--${index}`"></i>
          <span class="asteroid-orbit__object"></span>
          <p>{{ response?.page?.total_elements?.toLocaleString('pt-BR') || '—' }}<small>objetos catalogados</small></p>
        </div>
        <ol class="asteroid-list">
          <li v-for="(asteroid, index) in asteroids" :key="asteroid.id">
            <div class="asteroid-list__rank">0{{ index + 1 }}</div>
            <div class="asteroid-list__name">
              <span v-if="asteroid.is_potentially_hazardous_asteroid" class="risk-label">Atenção</span>
              <h3>{{ asteroid.name.replace(/[()]/g, '') }}</h3>
              <p>{{ distance(asteroid) }}</p>
            </div>
            <dl>
              <div>
                <dt>Diâmetro</dt>
                <dd>{{ diameter(asteroid) }}</dd>
              </div>
              <div>
                <dt>Velocidade</dt>
                <dd>{{ speed(asteroid) }}</dd>
              </div>
            </dl>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
