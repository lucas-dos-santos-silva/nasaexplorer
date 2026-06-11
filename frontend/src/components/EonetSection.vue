<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { apiGet } from '../services/api'
import type { EonetEvent, EonetResponse } from '../types'
import { useRemoteData } from '../composables/useRemoteData'
import SectionHeading from './SectionHeading.vue'
import StatusBlock from './StatusBlock.vue'

const { data: response, loading, error, execute } = useRemoteData<EonetResponse>()
const events = computed(() => response.value?.events?.slice(0, 6) || [])

function latestGeometry(event: EonetEvent) {
  return event.geometry?.[event.geometry.length - 1]
}

function formatDate(date?: string) {
  if (!date) {
    return 'Em monitoramento'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function load() {
  return execute(() => apiGet<EonetResponse>('/eonet/events', {
    status: 'open',
    limit: 12,
  }))
}

onMounted(load)
</script>

<template>
  <section id="terra" class="eonet-section page-section" aria-labelledby="eonet-title">
    <div class="content-shell">
      <SectionHeading
        eyebrow="Earth Observatory / EONET"
        title="A Terra, agora."
        description="Eventos naturais abertos reunidos a partir de observações e fontes científicas globais."
      />
      <StatusBlock v-if="loading" state="loading" />
      <StatusBlock v-else-if="error" state="error" :message="error" @retry="load" />
      <StatusBlock v-else-if="!events.length" state="empty" />
      <div v-else class="eonet-grid">
        <article v-for="(event, index) in events" :key="event.id" class="event-card">
          <div class="event-card__visual" :class="`event-card__visual--${index % 3}`" aria-hidden="true">
            <span>{{ event.categories?.[0]?.title?.slice(0, 1) || 'E' }}</span>
            <i></i>
          </div>
          <div class="event-card__body">
            <p class="eyebrow">{{ event.categories?.[0]?.title || 'Evento natural' }}</p>
            <h3>{{ event.title }}</h3>
            <dl>
              <div>
                <dt>Atualização</dt>
                <dd>{{ formatDate(latestGeometry(event)?.date) }}</dd>
              </div>
              <div>
                <dt>Fonte</dt>
                <dd>{{ event.sources?.[0]?.id || 'EONET' }}</dd>
              </div>
            </dl>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
