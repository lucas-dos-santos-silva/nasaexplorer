import { flushPromises, mount } from '@vue/test-utils'
import ApodHero from './ApodHero.vue'

describe('ApodHero', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza a APOD e encaminha a imagem pelo backend', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        title: 'Nebulosa de Órion',
        date: '2026-06-10',
        explanation: 'Uma região de formação estelar.',
        media_type: 'image',
        url: 'https://apod.nasa.gov/apod/image.jpg',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const wrapper = mount(ApodHero)
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Nebulosa de Órion')
    expect(wrapper.get('img').attributes('src')).toBe(
      '/api/v1/media?url=https%3A%2F%2Fapod.nasa.gov%2Fapod%2Fimage.jpg',
    )
  })

  it('oferece nova tentativa quando a consulta falha', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'APOD temporariamente indisponível' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const wrapper = mount(ApodHero)
    await flushPromises()

    expect(wrapper.text()).toContain('APOD temporariamente indisponível')
    expect(wrapper.get('button').text()).toContain('Tentar novamente')
  })
})
