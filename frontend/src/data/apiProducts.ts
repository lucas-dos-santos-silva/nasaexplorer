import {
  API_PRODUCT_IDS,
  type ApiExampleConfig,
  type ApiExplorerRequest,
  type ApiExplorerResponse,
  type ApiParameterConfig,
  type ApiParameterValue,
  type ApiParameterValues,
  type ApiProductConfig,
  type ApiProductId,
  type JsonValue,
} from '../types/apiExplorer'

const API_ROOT = '/api/v1'

const option = (value: string, label = value) => ({ value, label })

const query = (
  key: string,
  label: string,
  control: ApiParameterConfig['control'],
  config: Omit<ApiParameterConfig, 'key' | 'label' | 'location' | 'control'> = {},
): ApiParameterConfig => ({
  key,
  label,
  location: 'query',
  control,
  ...config,
})

const path = (
  key: string,
  label: string,
  control: ApiParameterConfig['control'],
  config: Omit<ApiParameterConfig, 'key' | 'label' | 'location' | 'control'> = {},
): ApiParameterConfig => ({
  key,
  label,
  location: 'path',
  control,
  required: true,
  ...config,
})

export const apiProducts = [
  {
    id: 'apod',
    name: 'APOD',
    description: 'Imagem ou vídeo astronômico selecionado para o dia.',
    category: 'astronomy',
    examples: [
      {
        id: 'picture-of-the-day',
        name: 'Imagem astronômica do dia',
        description: 'Retorna a seleção diária da NASA e inclui miniatura para vídeos.',
        path: '/apod',
        responseFormat: 'json',
        parameters: [
          query('date', 'Data', 'date'),
          query('thumbs', 'Incluir miniatura de vídeo', 'boolean', { defaultValue: true }),
        ],
      },
    ],
  },
  {
    id: 'asteroids',
    name: 'Asteroids NeoWs',
    description: 'Aproximações de objetos próximos da Terra.',
    category: 'astronomy',
    examples: [
      {
        id: 'browse',
        name: 'Catálogo de asteroides',
        description: 'Navega pela coleção de objetos próximos da Terra.',
        path: '/asteroids/browse',
        responseFormat: 'json',
        parameters: [
          query('page', 'Página', 'number', { defaultValue: 0, min: 0 }),
          query('size', 'Itens por página', 'number', { defaultValue: 12, min: 1, max: 100 }),
        ],
      },
      {
        id: 'feed',
        name: 'Aproximações por período',
        description: 'Lista asteroides em aproximação dentro de um intervalo.',
        path: '/asteroids/feed',
        responseFormat: 'json',
        parameters: [
          query('start_date', 'Data inicial', 'date'),
          query('end_date', 'Data final', 'date'),
        ],
      },
      {
        id: 'asteroid',
        name: 'Asteroide por ID',
        description: 'Consulta os dados de um objeto específico.',
        path: '/asteroids/{asteroidId}',
        responseFormat: 'json',
        parameters: [
          path('asteroidId', 'ID do asteroide', 'text', { defaultValue: '3542519' }),
        ],
      },
    ],
  },
  {
    id: 'donki',
    name: 'DONKI',
    description: 'Eventos de clima espacial e suas análises.',
    category: 'space-weather',
    examples: [
      {
        id: 'events',
        name: 'Eventos de clima espacial',
        description: 'Consulta um dos conjuntos de eventos publicados pelo DONKI.',
        path: '/donki/{event}',
        responseFormat: 'json',
        parameters: [
          path('event', 'Tipo de evento', 'select', {
            defaultValue: 'CME',
            options: [
              'CME',
              'CMEAnalysis',
              'FLR',
              'GST',
              'HSS',
              'IPS',
              'MPC',
              'RBE',
              'SEP',
              'WSAEnlilSimulations',
              'notifications',
            ].map((value) => option(value)),
          }),
          query('startDate', 'Data inicial', 'date'),
          query('endDate', 'Data final', 'date'),
        ],
      },
    ],
  },
  {
    id: 'eonet',
    name: 'EONET',
    description: 'Eventos naturais observados na Terra.',
    category: 'earth',
    examples: [
      {
        id: 'events',
        name: 'Eventos naturais',
        description: 'Lista eventos naturais por estado e quantidade.',
        path: '/eonet/events',
        responseFormat: 'json',
        parameters: [
          query('status', 'Estado', 'select', {
            defaultValue: 'open',
            options: [
              option('open', 'Abertos'),
              option('closed', 'Encerrados'),
              option('all', 'Todos'),
            ],
          }),
          query('limit', 'Limite', 'number', { defaultValue: 10, min: 1, max: 500 }),
          query('days', 'Últimos dias', 'number', { min: 1 }),
        ],
      },
      {
        id: 'categories',
        name: 'Categorias',
        description: 'Lista as categorias usadas para classificar eventos.',
        path: '/eonet/categories',
        responseFormat: 'json',
        parameters: [],
      },
    ],
  },
  {
    id: 'epic',
    name: 'EPIC',
    description: 'Imagens policromáticas da Terra obtidas pelo DSCOVR.',
    category: 'earth',
    examples: [
      {
        id: 'latest',
        name: 'Imagens mais recentes',
        description: 'Lista as imagens mais recentes de uma coleção EPIC.',
        path: '/epic/{collection}',
        responseFormat: 'json',
        parameters: [
          path('collection', 'Coleção', 'select', {
            defaultValue: 'natural',
            options: [option('natural', 'Natural'), option('enhanced', 'Realçada')],
          }),
        ],
      },
      {
        id: 'available',
        name: 'Datas disponíveis',
        description: 'Lista as datas com imagens disponíveis.',
        path: '/epic/{collection}/available',
        responseFormat: 'json',
        parameters: [
          path('collection', 'Coleção', 'select', {
            defaultValue: 'natural',
            options: [option('natural', 'Natural'), option('enhanced', 'Realçada')],
          }),
        ],
      },
    ],
  },
  {
    id: 'exoplanets',
    name: 'Exoplanet Archive',
    description: 'Consultas TAP ao arquivo de exoplanetas confirmados.',
    category: 'astronomy',
    examples: [
      {
        id: 'tap-query',
        name: 'Consulta TAP',
        description: 'Executa uma consulta ADQL no arquivo de exoplanetas.',
        path: '/exoplanets/query',
        responseFormat: 'auto',
        parameters: [
          query('query', 'Consulta ADQL', 'text', {
            required: true,
            defaultValue: 'select top 10 pl_name,hostname,disc_year from ps',
          }),
          query('format', 'Formato', 'select', {
            defaultValue: 'json',
            options: [option('json', 'JSON'), option('csv', 'CSV'), option('tsv', 'TSV')],
          }),
        ],
      },
    ],
  },
  {
    id: 'gibs',
    name: 'GIBS',
    description: 'Camadas globais de imagens de satélite.',
    category: 'earth',
    examples: [
      {
        id: 'capabilities',
        name: 'Capacidades WMTS',
        description: 'Retorna o documento de capacidades para uma projeção.',
        path: '/gibs/capabilities',
        responseFormat: 'text',
        parameters: [
          query('projection', 'Projeção', 'select', {
            defaultValue: 'epsg4326',
            options: ['epsg4326', 'epsg3857', 'epsg3413'].map((value) => option(value)),
          }),
        ],
      },
    ],
  },
  {
    id: 'insight',
    name: 'InSight',
    description: 'Dados meteorológicos históricos da missão InSight.',
    category: 'space-weather',
    examples: [
      {
        id: 'weather',
        name: 'Histórico meteorológico',
        description: 'Consulta o feed histórico da estação meteorológica em Marte.',
        path: '/insight',
        responseFormat: 'json',
        parameters: [
          query('feedtype', 'Formato do feed', 'text', { defaultValue: 'json' }),
          query('ver', 'Versão', 'text', { defaultValue: '1.0' }),
        ],
      },
    ],
  },
  {
    id: 'images',
    name: 'NASA Image and Video Library',
    description: 'Pesquisa de imagens, vídeos e áudios da NASA.',
    category: 'open-science',
    examples: [
      {
        id: 'search',
        name: 'Busca na biblioteca',
        description: 'Pesquisa o acervo público por termo e tipo de mídia.',
        path: '/images/search',
        responseFormat: 'json',
        parameters: [
          query('q', 'Termo de busca', 'text', { defaultValue: 'artemis' }),
          query('media_type', 'Tipo de mídia', 'select', {
            defaultValue: 'image',
            options: [
              option('image', 'Imagem'),
              option('video', 'Vídeo'),
              option('audio', 'Áudio'),
            ],
          }),
          query('page', 'Página', 'number', { defaultValue: 1, min: 1 }),
        ],
      },
      {
        id: 'metadata',
        name: 'Metadados de um item',
        description: 'Obtém os metadados de um item pelo NASA ID.',
        path: '/images/metadata/{nasaId}',
        responseFormat: 'json',
        parameters: [
          path('nasaId', 'NASA ID', 'text', { defaultValue: 'PIA12348' }),
        ],
      },
    ],
  },
  {
    id: 'osdr',
    name: 'Open Science Data Repository',
    description: 'Dados biológicos de experimentos espaciais.',
    category: 'open-science',
    examples: [
      {
        id: 'search',
        name: 'Busca de estudos',
        description: 'Pesquisa estudos e experimentos no repositório.',
        path: '/osdr/search',
        responseFormat: 'json',
        parameters: [
          query('term', 'Termo de busca', 'text', { defaultValue: 'spaceflight' }),
          query('from', 'Posição inicial', 'number', { defaultValue: 0, min: 0 }),
          query('size', 'Quantidade', 'number', { defaultValue: 25, min: 1, max: 100 }),
        ],
      },
      {
        id: 'entity',
        name: 'Entidade de ciência espacial',
        description: 'Consulta uma entidade pelo tipo e identificador.',
        path: '/osdr/entities/{entity}/{identifier}',
        responseFormat: 'json',
        parameters: [
          path('entity', 'Tipo de entidade', 'select', {
            defaultValue: 'mission',
            options: [
              'biospecimen',
              'experiment',
              'hardware',
              'mission',
              'payload',
              'subject',
              'vehicle',
            ].map((value) => option(value)),
          }),
          path('identifier', 'Identificador', 'text', { defaultValue: 'SpaceX-8' }),
        ],
      },
    ],
  },
  {
    id: 'ssc',
    name: 'Satellite Situation Center',
    description: 'Localizações e trajetórias de naves espaciais.',
    category: 'astronomy',
    examples: [
      {
        id: 'observatories',
        name: 'Observatórios',
        description: 'Lista observatórios e naves reconhecidos pelo SSC.',
        path: '/ssc/observatories',
        responseFormat: 'auto',
        parameters: [],
      },
      {
        id: 'locations',
        name: 'Localizações',
        description: 'Consulta posições em um intervalo e sistema de coordenadas.',
        path: '/ssc/locations/{observatories}/{timeRange}/{coordinateSystems}',
        responseFormat: 'auto',
        parameters: [
          path('observatories', 'Observatórios', 'text', { defaultValue: 'iss' }),
          path('timeRange', 'Intervalo UTC', 'text', {
            defaultValue: '20260601T000000Z,20260601T001000Z',
          }),
          path('coordinateSystems', 'Coordenadas', 'text', { defaultValue: 'gse' }),
          query('resolutionFactor', 'Fator de resolução', 'number', { min: 1 }),
        ],
      },
    ],
  },
  {
    id: 'ssd',
    name: 'SSD/CNEOS',
    description: 'Serviços do sistema solar e objetos próximos da Terra.',
    category: 'astronomy',
    examples: [
      {
        id: 'service',
        name: 'Serviço SSD/CNEOS',
        description: 'Executa um dos serviços de consulta do JPL.',
        path: '/ssd/{service}',
        responseFormat: 'json',
        parameters: [
          path('service', 'Serviço', 'select', {
            defaultValue: 'fireball',
            options: [
              'cad',
              'fireball',
              'mdesign',
              'nhats',
              'sbdb',
              'sbdb-query',
              'scout',
              'sentry',
            ].map((value) => option(value)),
          }),
          query('limit', 'Limite', 'number', { defaultValue: 10, min: 1 }),
          query('des', 'Designação', 'text', {
            description: 'Usado por serviços como mdesign.',
          }),
        ],
      },
    ],
  },
  {
    id: 'techport',
    name: 'TechPort',
    description: 'Portfólio de investimentos em tecnologia da NASA.',
    category: 'technology',
    examples: [
      {
        id: 'projects',
        name: 'Projetos',
        description: 'Lista os projetos públicos do TechPort.',
        path: '/techport/projects',
        responseFormat: 'json',
        parameters: [],
      },
      {
        id: 'project',
        name: 'Projeto por ID',
        description: 'Consulta os detalhes de um projeto.',
        path: '/techport/projects/{projectId}',
        responseFormat: 'json',
        parameters: [
          path('projectId', 'ID do projeto', 'number', { defaultValue: 157166, min: 1 }),
        ],
      },
    ],
  },
  {
    id: 'techtransfer',
    name: 'TechTransfer',
    description: 'Patentes, software e tecnologias disponíveis.',
    category: 'technology',
    examples: [
      {
        id: 'search',
        name: 'Busca de tecnologias',
        description: 'Pesquisa tecnologias por coleção e termo.',
        path: '/techtransfer/{transferType}',
        responseFormat: 'json',
        parameters: [
          path('transferType', 'Coleção', 'select', {
            defaultValue: 'patent',
            options: [
              option('patent', 'Patentes'),
              option('patent_issued', 'Patentes emitidas'),
              option('software', 'Software'),
              option('spinoff', 'Spinoffs'),
            ],
          }),
          query('query', 'Termo de busca', 'text', { defaultValue: 'robotics' }),
        ],
      },
    ],
  },
  {
    id: 'tle',
    name: 'TLE API',
    description: 'Elementos orbitais de satélites e objetos espaciais.',
    category: 'astronomy',
    examples: [
      {
        id: 'search',
        name: 'Busca de satélites',
        description: 'Pesquisa elementos orbitais por nome.',
        path: '/tle',
        responseFormat: 'json',
        parameters: [
          query('search', 'Termo de busca', 'text', { defaultValue: 'ISS' }),
          query('page', 'Página', 'number', { defaultValue: 1, min: 1 }),
        ],
      },
      {
        id: 'satellite',
        name: 'Satélite por número',
        description: 'Consulta os elementos orbitais por número NORAD.',
        path: '/tle/{satelliteNumber}',
        responseFormat: 'json',
        parameters: [
          path('satelliteNumber', 'Número NORAD', 'number', {
            defaultValue: 25544,
            min: 1,
          }),
        ],
      },
    ],
  },
  {
    id: 'trek',
    name: 'Vesta, Moon e Mars Trek WMTS',
    description: 'Mapas em mosaico de Marte, Lua e Vesta.',
    category: 'earth',
    examples: [
      {
        id: 'mars-capabilities',
        name: 'Capacidades de Marte',
        description: 'Obtém as capacidades WMTS de um mosaico de Marte.',
        path: '/trek/mars/capabilities',
        responseFormat: 'text',
        parameters: [
          query('mosaic', 'Mosaico', 'text', {
            required: true,
            defaultValue: 'Mars_Viking_MDIM21_ClrMosaic_global_232m',
          }),
        ],
      },
      {
        id: 'vesta-capabilities',
        name: 'Capacidades de Vesta',
        description: 'Obtém as capacidades WMTS de um mosaico de Vesta.',
        path: '/trek/vesta/capabilities',
        responseFormat: 'text',
        parameters: [
          query('mosaic', 'Mosaico', 'text', {
            required: true,
            defaultValue: 'global_LAMO',
          }),
        ],
      },
      {
        id: 'moon-catalog',
        name: 'Catálogo da Lua',
        description: 'Abre a documentação oficial dos serviços disponíveis para a Lua.',
        path: '/trek/moon/capabilities',
        responseFormat: 'text',
        parameters: [
          query('mosaic', 'Mosaico', 'text', {
            required: true,
            defaultValue: 'global',
          }),
        ],
      },
    ],
  },
] as const satisfies readonly ApiProductConfig[]

export const apiProductsById = Object.fromEntries(
  apiProducts.map((product) => [product.id, product]),
) as { [Id in ApiProductId]: Extract<(typeof apiProducts)[number], { id: Id }> }

function parameterValue(
  parameter: ApiParameterConfig,
  values: ApiParameterValues,
): ApiParameterValue | undefined {
  return values[parameter.key] ?? parameter.defaultValue
}

function hasValue(value: ApiParameterValue | undefined): value is ApiParameterValue {
  return value !== undefined && value !== ''
}

export function buildApiExplorerRequest(
  example: ApiExampleConfig,
  values: ApiParameterValues = {},
): ApiExplorerRequest {
  let resolvedPath = example.path
  const search = new URLSearchParams()

  example.parameters.forEach((parameter) => {
    const value = parameterValue(parameter, values)

    if (!hasValue(value)) {
      if (parameter.required) {
        throw new Error(`O parâmetro "${parameter.label}" é obrigatório.`)
      }
      return
    }

    if (parameter.location === 'path') {
      resolvedPath = resolvedPath.replace(
        `{${parameter.key}}`,
        encodeURIComponent(String(value)),
      )
      return
    }

    search.set(parameter.key, String(value))
  })

  if (/\{[^}]+\}/.test(resolvedPath)) {
    throw new Error('A URL contém parâmetros de caminho não preenchidos.')
  }

  return {
    method: 'GET',
    url: `${API_ROOT}${resolvedPath}${search.size ? `?${search.toString()}` : ''}`,
    headers: {
      Accept: example.responseFormat === 'json'
        ? 'application/json'
        : 'application/json, text/plain, application/xml',
    },
    responseFormat: example.responseFormat,
  }
}

export async function readApiExplorerResponse(
  response: Response,
  responseFormat: ApiExampleConfig['responseFormat'],
): Promise<ApiExplorerResponse> {
  const contentType = response.headers.get('content-type') ?? ''
  const format = responseFormat === 'auto'
    ? contentType.includes('json') ? 'json' : 'text'
    : responseFormat
  const data = format === 'json'
    ? await response.json() as JsonValue
    : await response.text()

  return {
    status: response.status,
    statusText: response.statusText,
    contentType,
    format,
    data,
  }
}

export function getApiProduct(productId: ApiProductId): ApiProductConfig {
  return apiProductsById[productId]
}

export function getApiExample(
  productId: ApiProductId,
  exampleId: string,
): ApiExampleConfig | undefined {
  return apiProductsById[productId].examples.find((example) => example.id === exampleId)
}

const configuredProductIds = new Set(apiProducts.map((product) => product.id))

if (API_PRODUCT_IDS.some((productId) => !configuredProductIds.has(productId))) {
  throw new Error('A configuração do explorador não cobre todos os produtos.')
}
