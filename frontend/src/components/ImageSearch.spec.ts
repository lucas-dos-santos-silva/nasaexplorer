import { flushPromises, mount } from '@vue/test-utils'
import ImageSearch from './ImageSearch.vue'

describe('ImageSearch', () => {
  const scrollIntoView = vi.fn()

  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoView
  })

  afterEach(() => {
    vi.restoreAllMocks()
    scrollIntoView.mockClear()
    document.body.classList.remove('modal-open')
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
      '/api/v1/images/search?q=James+Webb&media_type=image&page=1&page_size=8',
      expect.any(Object),
    )
    expect(wrapper.text()).toContain('Webb First Deep Field')
    expect(wrapper.get('img').attributes('src')).toContain('/api/v1/media?url=')
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
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

  it('navega entre páginas mantendo o termo pesquisado', async () => {
    const response = (page: number) => new Response(JSON.stringify({
      collection: {
        metadata: { total_hits: 16 },
        items: [{
          data: [{
            nasa_id: `ITEM-${page}`,
            title: `Resultado da página ${page}`,
          }],
        }],
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(response(1))
      .mockResolvedValueOnce(response(2))

    const wrapper = mount(ImageSearch)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    await wrapper.get('.image-pagination button:last-child').trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/v1/images/search?q=Artemis&media_type=image&page=2&page_size=8',
      expect.any(Object),
    )
    expect(wrapper.text()).toContain('Resultado da página 2')
    expect(wrapper.text()).toContain('Página 2 de 2')
  })

  it('mantém a página anterior visível enquanto carrega a próxima', async () => {
    let resolveSecondPage: ((response: Response) => void) | undefined
    const firstPage = new Response(JSON.stringify({
      collection: {
        metadata: { total_hits: 16 },
        items: [{
          data: [{ nasa_id: 'ITEM-1', title: 'Resultado ainda visível' }],
        }],
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
    const secondPage = new Promise<Response>((resolve) => {
      resolveSecondPage = resolve
    })
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(firstPage)
      .mockReturnValueOnce(secondPage)

    const wrapper = mount(ImageSearch)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    await wrapper.get('.image-pagination button:last-child').trigger('click')

    expect(wrapper.text()).toContain('Resultado ainda visível')
    expect(wrapper.text()).toContain('Carregando página 2')
    expect(wrapper.get('.image-grid').classes()).toContain('image-grid--loading')

    resolveSecondPage?.(new Response(JSON.stringify({
      collection: {
        metadata: { total_hits: 16 },
        items: [{
          data: [{ nasa_id: 'ITEM-2', title: 'Novo resultado' }],
        }],
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    await flushPromises()

    expect(wrapper.text()).toContain('Novo resultado')
  })

  it('amplia uma imagem e fecha o destaque com Escape', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        collection: {
          metadata: { total_hits: 1 },
          items: [{
            data: [{
              nasa_id: 'MOON-1',
              title: 'Superfície lunar',
              description: 'Uma visão detalhada da Lua.',
              center: 'JPL',
              date_created: '2024-01-01T00:00:00Z',
            }],
            links: [{
              href: 'https://images-assets.nasa.gov/image/MOON-1.jpg',
              render: 'image',
            }],
          }],
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const wrapper = mount(ImageSearch, { attachTo: document.body })
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    await wrapper.get('.image-card__media').trigger('click')

    expect(document.body.classList.contains('modal-open')).toBe(true)
    expect(document.body.textContent).toContain('Superfície lunar')
    expect(document.body.querySelector('.image-lightbox img')?.getAttribute('src')).toContain(
      '/api/v1/media?url=',
    )

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()

    expect(document.body.querySelector('.image-lightbox')).toBeNull()
    expect(document.body.classList.contains('modal-open')).toBe(false)
    wrapper.unmount()
  })
})
