import { flushPromises, mount } from '@vue/test-utils'
import ExoplanetSection from './ExoplanetSection.vue'

const planets = [{
  pl_name: 'Proxima Cen b',
  hostname: 'Proxima Cen',
  disc_year: 2016,
  disc_pubdate: '2016-08',
  discoverymethod: 'Radial Velocity',
  sy_dist: 1.301,
  pl_rade: 1.02,
  pl_bmasse: 1.055,
  pl_orbper: 11.18,
  st_spectype: 'M5.5 V',
  sy_pnum: 3,
}]

describe('ExoplanetSection', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('carrega descobertas e expande os dados do planeta', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(planets), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const wrapper = mount(ExoplanetSection)
    await flushPromises()
    await wrapper.get('.exoplanet-results article > button').trigger('click')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/exoplanets/explore/recent?limit=12',
      expect.any(Object),
    )
    expect(wrapper.text()).toContain('Proxima Cen b')
    expect(wrapper.text()).toContain('Mundo rochoso')
    expect(wrapper.text()).toContain('11,18 dias')
  })

  it('alterna para os mundos mais próximos', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(planets), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify(planets), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

    const wrapper = mount(ExoplanetSection)
    await flushPromises()
    await wrapper.findAll('.exoplanet-tabs button')[1].trigger('click')
    await flushPromises()

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/v1/exoplanets/explore/nearby?limit=12',
      expect.any(Object),
    )
    expect(wrapper.text()).toContain('1.3 pc')
  })
})
