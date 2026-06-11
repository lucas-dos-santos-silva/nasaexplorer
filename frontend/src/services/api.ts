const API_ROOT = '/api/v1'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiGet<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value))
    }
  })

  const response = await fetch(`${API_ROOT}${path}${query.size ? `?${query}` : ''}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    let message = 'Não foi possível carregar os dados.'

    try {
      const payload = await response.json() as {
        detail?: string
        message?: string
        error?: { message?: string }
      }
      message = payload.error?.message || payload.detail || payload.message || message
    } catch {
      message = response.statusText || message
    }

    throw new ApiError(message, response.status)
  }

  return response.json() as Promise<T>
}

export function mediaUrl(url?: string): string {
  if (!url) {
    return ''
  }

  if (url.startsWith(`${API_ROOT}/media?url=`)) {
    return url
  }

  return `${API_ROOT}/media?url=${encodeURIComponent(url)}`
}
