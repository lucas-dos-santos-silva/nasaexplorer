export const API_PRODUCT_IDS = [
  'apod',
  'asteroids',
  'donki',
  'eonet',
  'epic',
  'exoplanets',
  'gibs',
  'insight',
  'images',
  'osdr',
  'ssc',
  'ssd',
  'techport',
  'techtransfer',
  'tle',
  'trek',
] as const

export type ApiProductId = typeof API_PRODUCT_IDS[number]
export type ApiResponseFormat = 'json' | 'text' | 'auto'
export type ApiParameterLocation = 'path' | 'query'
export type ApiParameterControl = 'text' | 'number' | 'date' | 'boolean' | 'select'
export type ApiParameterValue = string | number | boolean
export type ApiParameterValues = Record<string, ApiParameterValue | undefined>

export interface ApiParameterOption {
  label: string
  value: string
}

export interface ApiParameterConfig {
  key: string
  label: string
  location: ApiParameterLocation
  control: ApiParameterControl
  required?: boolean
  defaultValue?: ApiParameterValue
  placeholder?: string
  description?: string
  options?: readonly ApiParameterOption[]
  min?: number
  max?: number
  step?: number
}

export interface ApiExampleConfig {
  id: string
  name: string
  description: string
  path: string
  responseFormat: ApiResponseFormat
  parameters: readonly ApiParameterConfig[]
}

export interface ApiProductConfig {
  id: ApiProductId
  name: string
  description: string
  category: 'astronomy' | 'earth' | 'space-weather' | 'open-science' | 'technology'
  examples: readonly ApiExampleConfig[]
}

export interface ApiExplorerRequest {
  method: 'GET'
  url: string
  headers: {
    Accept: string
  }
  responseFormat: ApiResponseFormat
}

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

export interface ApiExplorerResponse {
  status: number
  statusText: string
  contentType: string
  format: Exclude<ApiResponseFormat, 'auto'>
  data: JsonValue | string
}
