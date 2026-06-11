<script setup lang="ts">
import { computed, ref } from 'vue'
import SectionHeading from './SectionHeading.vue'

type GibsLayer = 'modis' | 'viirs' | 'aerosol' | 'precipitation'

const today = new Date()
today.setUTCDate(today.getUTCDate() - 1)

const layer = ref<GibsLayer>('modis')
const selectedDate = ref(today.toISOString().slice(0, 10))
const imageLoaded = ref(false)
const imageError = ref(false)

const layers: Record<GibsLayer, { name: string; description: string; source: string }> = {
  modis: {
    name: 'Terra em cor natural',
    description: 'Mosaico diário do sensor MODIS a bordo do satélite Terra.',
    source: 'Terra / MODIS',
  },
  viirs: {
    name: 'Suomi NPP em cor natural',
    description: 'Observação global diária produzida pelo instrumento VIIRS.',
    source: 'Suomi NPP / VIIRS',
  },
  aerosol: {
    name: 'Aerossóis atmosféricos',
    description: 'Distribuição global da profundidade óptica de aerossóis.',
    source: 'Terra / MODIS Aerosol',
  },
  precipitation: {
    name: 'Taxa de precipitação',
    description: 'Estimativas globais de chuva e neve obtidas pela missão GPM.',
    source: 'GPM / IMERG',
  },
}

const mapUrl = computed(() => {
  const params = new URLSearchParams({
    layer: layer.value,
    date: selectedDate.value,
    width: '1400',
  })
  return `/api/v1/gibs/map?${params}`
})

function changeLayer(next: GibsLayer) {
  layer.value = next
  resetImage()
}

function resetImage() {
  imageLoaded.value = false
  imageError.value = false
}
</script>

<template>
  <section id="gibs" class="gibs-section page-section" aria-labelledby="gibs-title">
    <div class="content-shell">
      <SectionHeading
        eyebrow="Earthdata / GIBS"
        title="O planeta, camada por camada."
        description="Visualizações globais de satélites NASA entregues como mapas científicos prontos para exploração."
      />

      <div class="gibs-controls">
        <div class="gibs-tabs">
          <button
            v-for="(item, key) in layers"
            :key="key"
            type="button"
            :class="{ active: layer === key }"
            @click="changeLayer(key as GibsLayer)"
          >
            {{ item.name }}
          </button>
        </div>
        <label>
          Data da observação
          <input v-model="selectedDate" type="date" @change="resetImage">
        </label>
      </div>

      <div class="gibs-viewer">
        <div class="gibs-map" :aria-busy="!imageLoaded && !imageError">
          <div v-if="!imageLoaded && !imageError" class="gibs-map__status">Montando mosaico global…</div>
          <div v-if="imageError" class="gibs-map__status">Nenhuma visualização disponível para esta data.</div>
          <img
            :key="mapUrl"
            :src="mapUrl"
            :alt="`${layers[layer].name} em ${selectedDate}`"
            @load="imageLoaded = true"
            @error="imageError = true"
          >
          <span class="gibs-map__grid" aria-hidden="true"></span>
        </div>
        <aside class="gibs-information">
          <p class="eyebrow">{{ layers[layer].source }}</p>
          <h3>{{ layers[layer].name }}</h3>
          <p>{{ layers[layer].description }}</p>
          <dl>
            <div><dt>Data</dt><dd>{{ selectedDate }}</dd></div>
            <div><dt>Projeção</dt><dd>EPSG:4326</dd></div>
            <div><dt>Serviço</dt><dd>OGC WMS 1.3.0</dd></div>
            <div><dt>Origem</dt><dd>NASA GIBS</dd></div>
          </dl>
          <a :href="mapUrl" target="_blank" rel="noreferrer">Abrir mapa completo ↗</a>
        </aside>
      </div>
    </div>
  </section>
</template>
