import { flushPromises, mount } from '@vue/test-utils'
import AsteroidSection from './AsteroidSection.vue'

function asteroid(id: string, name = `Asteroide ${id}`) {
  return {
    id,
    name,
    absolute_magnitude_h: 21.4,
    is_potentially_hazardous_asteroid: id === '1',
    estimated_diameter: {
      meters: {
        estimated_diameter_min: 100,
        estimated_diameter_max: 200,
      },
    },
    close_approach_data: [{
      close_approach_date: '2026-06-11',
      relative_velocity: { kilometers_per_hour: '25000' },
      miss_distance: { lunar: '4.2' },
      orbiting_body: 'Earth',
    }],
  }
}

describe('AsteroidSection', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('carrega o catálogo e consulta detalhes do objeto selecionado', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({
        page: { total_elements: 40, total_pages: 5, number: 0 },
        near_earth_objects: [asteroid('1')],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ...asteroid('1', 'Objeto detalhado'),
        nasa_jpl_url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html',
        is_sentry_object: true,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    const wrapper = mount(AsteroidSection)
    await flushPromises()
    await wrapper.get('.asteroid-list li > button').trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/v1/asteroids/browse?page=0&size=8',
      expect.any(Object),
    )
    expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/asteroids/1', expect.any(Object))
    expect(wrapper.text()).toContain('Objeto detalhado')
    expect(wrapper.text()).toContain('Monitorado pelo Sentry')
    expect(wrapper.get('.asteroid-list li').find('.asteroid-detail').exists()).toBe(true)

    await wrapper.get('.asteroid-list li > button').trigger('click')

    expect(wrapper.find('.asteroid-detail').exists()).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('alterna para as aproximações de hoje', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({
        page: { total_elements: 1, total_pages: 1 },
        near_earth_objects: [asteroid('1')],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        element_count: 1,
        near_earth_objects: { '2026-06-11': [asteroid('2', 'Visitante de hoje')] },
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    const wrapper = mount(AsteroidSection)
    await flushPromises()
    await wrapper.findAll('.asteroid-tabs button')[1].trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenLastCalledWith('/api/v1/asteroids/today', expect.any(Object))
    expect(wrapper.text()).toContain('Visitante de hoje')
    expect(wrapper.text()).toContain('aproximações encontradas')
  })

  it('consulta um período e pagina o catálogo', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({
        page: { total_elements: 16, total_pages: 2 },
        near_earth_objects: [asteroid('1')],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        page: { total_elements: 16, total_pages: 2, number: 1 },
        near_earth_objects: [asteroid('2', 'Página seguinte')],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        element_count: 1,
        near_earth_objects: { '2026-06-10': [asteroid('3', 'Objeto do período')] },
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    const wrapper = mount(AsteroidSection)
    await flushPromises()
    await wrapper.find('.asteroid-pagination button:last-child').trigger('click')
    await flushPromises()
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/v1/asteroids/browse?page=1&size=8',
      expect.any(Object),
    )

    await wrapper.findAll('.asteroid-tabs button')[2].trigger('click')
    await wrapper.get('.asteroid-period').trigger('submit')
    await flushPromises()

    expect(fetchMock.mock.calls[2][0]).toContain('/api/v1/asteroids/feed?')
    expect(wrapper.text()).toContain('Objeto do período')
  })
})
