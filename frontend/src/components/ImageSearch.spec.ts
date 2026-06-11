import { flushPromises, mount } from '@vue/test-utils'
import ImageSearch from './ImageSearch.vue'

describe('ImageSearch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('busca imagens, exibe resultados e usa o proxy de mídia', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        collection: {
          metadata: { total_hits: 1 },
          items: [
            {
              data: [{
                nasa_id: 'WEBB-1',
                title: 'Webb First Deep Field',
                center: 'STScI',
                date_created: '2022-07-11T00:00:00Z',
              }],
              links: [{
                href: 'https://images-assets.nasa.gov/image/WEBB-1.jpg',
                render: 'image',
              }],
            },
          ],
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const wrapper = mount(ImageSearch)
    await wrapper.get('input[type="search"]').setValue('James Webb')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/images/search?q=James+Webb&media_type=image&page=1',
      expect.any(Object),
    )
    expect(wrapper.text()).toContain('Webb First Deep Field')
    expect(wrapper.get('img').attributes('src')).toContain('/api/v1/media?url=')
  })

  it('apresenta estado vazio quando a busca não retorna itens', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        collection: {
          metadata: { total_hits: 0 },
          items: [],
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const wrapper = mount(ImageSearch)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Nenhuma imagem corresponde à sua busca.')
  })
})
