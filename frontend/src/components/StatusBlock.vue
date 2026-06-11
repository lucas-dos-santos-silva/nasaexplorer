<script setup lang="ts">
defineProps<{
  state: 'loading' | 'error' | 'empty'
  message?: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="status-block" role="status" :aria-live="state === 'error' ? 'assertive' : 'polite'">
    <div v-if="state === 'loading'" class="status-block__pulse" aria-hidden="true"></div>
    <span class="eyebrow">{{ state === 'loading' ? 'Recebendo sinal' : state === 'error' ? 'Sinal interrompido' : 'Sem registros' }}</span>
    <p>{{ message || (state === 'loading' ? 'Consultando os serviços da NASA…' : 'Nenhum dado disponível para esta seleção.') }}</p>
    <button v-if="state === 'error'" type="button" class="text-button" @click="emit('retry')">
      Tentar novamente
      <span aria-hidden="true">↗</span>
    </button>
  </div>
</template>
