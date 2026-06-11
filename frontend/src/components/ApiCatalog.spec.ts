import { flushPromises, mount } from '@vue/test-utils'
import ApiCatalog from './ApiCatalog.vue'

const products = Array.from({ length: 16 }, (_, index) => ({
  id: `product-${index + 1}`,
  name: `API ${index + 1}`,
  description: `Descrição ${index + 1}`,
  route: `/api/v1/product-${index + 1}`,
  example: `/api/v1/product-${index + 1}?limit=10`,
  featured: index < 5,
}))

describe('ApiCatalog', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('oferece uma consulta executável para cada produto do catálogo', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ count: 16, products }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const wrapper = mount(ApiCatalog)
    await flushPromises()

    expect(wrapper.findAll('.catalog-item')).toHaveLength(16)
    expect(wrapper.findAll('.catalog-item__request button')).toHaveLength(16)
  })

  it('executa o exemplo pelo gateway e exibe a resposta', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ count: 16, products }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ records: ['ok'] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    const wrapper = mount(ApiCatalog)
    await flushPromises()
    await wrapper.find('.catalog-item__request button').trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/v1/product-1?limit=10',
      expect.any(Object),
    )
    expect(wrapper.get('pre').text()).toContain('"records"')
    expect(wrapper.get('pre').text()).toContain('"ok"')
  })
})
