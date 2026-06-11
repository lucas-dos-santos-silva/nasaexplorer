<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { apiGet } from '../services/api'
import type { DonkiNotification } from '../types'
import { useRemoteData } from '../composables/useRemoteData'
import SectionHeading from './SectionHeading.vue'
import StatusBlock from './StatusBlock.vue'

const { data: notifications, loading, error, execute } = useRemoteData<DonkiNotification[]>()
const entries = computed(() => notifications.value?.slice(0, 4) || [])

function formatDate(date?: string) {
  if (!date) {
    return 'Data não informada'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function summary(body?: string) {
  if (!body) {
    return 'Boletim técnico sem resumo disponível.'
  }

  return body
    .replace(/\r?\n+/g, ' ')
    .replace(/##+/g, '')
    .trim()
    .slice(0, 220)
}

function load() {
  return execute(() => apiGet<DonkiNotification[]>('/donki/notifications', { type: 'all' }))
}

onMounted(load)
</script>

<template>
  <section id="clima-espacial" class="weather-section page-section" aria-labelledby="weather-title">
    <div class="content-shell">
      <SectionHeading
        eyebrow="Clima espacial / DONKI"
        title="O Sol também faz tempo."
        description="Notificações sobre erupções, ejeções de massa coronal e perturbações no ambiente espacial."
      />
      <StatusBlock v-if="loading" state="loading" />
      <StatusBlock v-else-if="error" state="error" :message="error" @retry="load" />
      <StatusBlock v-else-if="!entries.length" state="empty" />
      <div v-else class="weather-layout">
        <div class="solar-disc" aria-hidden="true">
          <div class="solar-disc__core"></div>
          <span>DONKI</span>
        </div>
        <ol class="weather-feed">
          <li v-for="(entry, index) in entries" :key="entry.messageID || index">
            <div class="weather-feed__time">
              <span>{{ formatDate(entry.messageIssueTime) }}</span>
              <i></i>
            </div>
            <div class="weather-feed__content">
              <p class="eyebrow">{{ entry.messageType || 'Notificação' }}</p>
              <h3>{{ entry.messageID || `Boletim espacial ${index + 1}` }}</h3>
              <p>{{ summary(entry.messageBody) }}{{ (entry.messageBody?.length || 0) > 220 ? '…' : '' }}</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
