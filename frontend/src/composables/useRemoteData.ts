import { ref, shallowRef } from 'vue'

export function useRemoteData<T>() {
  const data = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function execute(loader: () => Promise<T>) {
    loading.value = true
    error.value = ''

    try {
      data.value = await loader()
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : 'Ocorreu um erro inesperado.'
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    execute,
  }
}
