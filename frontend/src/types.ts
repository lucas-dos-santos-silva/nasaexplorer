export interface Apod {
  title: string
  date: string
  explanation: string
  media_type: 'image' | 'video'
  url?: string
  hdurl?: string
  thumbnail_url?: string
  copyright?: string
}

export interface ImageLibraryItem {
  href?: string
  data?: Array<{
    nasa_id: string
    title: string
    description?: string
    date_created?: string
    media_type?: string
    photographer?: string
    center?: string
  }>
  links?: Array<{
    href: string
    rel?: string
    render?: string
  }>
}

export interface ImageLibraryResponse {
  collection?: {
    metadata?: {
      total_hits?: number
    }
    items?: ImageLibraryItem[]
  }
}

export interface Asteroid {
  id: string
  name: string
  nasa_jpl_url?: string
  absolute_magnitude_h?: number
  is_sentry_object?: boolean
  is_potentially_hazardous_asteroid?: boolean
  estimated_diameter?: {
    meters?: {
      estimated_diameter_min?: number
      estimated_diameter_max?: number
    }
  }
  close_approach_data?: Array<{
    close_approach_date?: string
    relative_velocity?: {
      kilometers_per_hour?: string
    }
    miss_distance?: {
      kilometers?: string
      lunar?: string
    }
    orbiting_body?: string
  }>
}

export interface AsteroidResponse {
  near_earth_objects?: Asteroid[]
  element_count?: number
  page?: {
    total_elements?: number
    total_pages?: number
    number?: number
  }
}

export interface AsteroidFeedResponse {
  element_count?: number
  near_earth_objects?: Record<string, Asteroid[]>
}

export interface DonkiNotification {
  messageType?: string
  messageID?: string
  messageURL?: string
  messageIssueTime?: string
  messageBody?: string
}

export interface EonetEvent {
  id: string
  title: string
  description?: string
  link?: string
  closed?: string
  categories?: Array<{
    id?: string
    title?: string
  }>
  sources?: Array<{
    id?: string
    url?: string
  }>
  geometry?: Array<{
    date?: string
    type?: string
    coordinates?: unknown
    magnitudeValue?: number
    magnitudeUnit?: string
  }>
}

export interface EonetResponse {
  events?: EonetEvent[]
}

export interface EpicImage {
  identifier: string
  caption: string
  image: string
  date: string
  centroid_coordinates?: {
    lat?: number
    lon?: number
  }
  dscovr_j2000_position?: {
    x?: number
    y?: number
    z?: number
  }
}

export interface EpicAvailableDate {
  date: string
}

export interface Exoplanet {
  pl_name?: string
  hostname: string
  disc_year?: number
  disc_pubdate?: string
  discoverymethod?: string
  sy_dist?: number
  pl_rade?: number
  pl_bmasse?: number
  pl_orbper?: number
  st_spectype?: string
  sy_pnum?: number
}

export interface ApiProduct {
  id: string
  name: string
  description: string
  route: string
  example: string
  featured: boolean
}

export interface CatalogResponse {
  count: number
  products: ApiProduct[]
}
