import { ApiError, apiGet, mediaUrl } from './api'

describe('api service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('usa exclusivamente a raiz local da API e serializa parâmetros', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await apiGet('/images/search', { q: 'James Webb', page: 1, unused: undefined })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/images/search?q=James+Webb&page=1',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
      }),
    )
  })

  it('transforma toda mídia remota em URL do proxy local', () => {
    expect(mediaUrl('https://images-assets.nasa.gov/image.jpg')).toBe(
      '/api/v1/media?url=https%3A%2F%2Fimages-assets.nasa.gov%2Fimage.jpg',
    )
    expect(mediaUrl('')).toBe('')
  })

  it('expõe erros da API com status e detalhe', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Serviço indisponível' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(apiGet('/apod')).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: 'ApiError',
        message: 'Serviço indisponível',
        status: 503,
      }),
    )
  })

  it('preserva respostas XML como texto', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<Capabilities />', {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }),
    )

    await expect(apiGet<string>('/gibs/capabilities')).resolves.toBe('<Capabilities />')
  })
})
