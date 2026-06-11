import { flushPromises, mount } from '@vue/test-utils'
import EpicSection from './EpicSection.vue'

const images = [
  {
    identifier: '20260609003633',
    caption: 'A Terra vista pelo DSCOVR',
    image: 'epic_1b_20260609003633',
    date: '2026-06-09 00:36:33',
    centroid_coordinates: { lat: 4.2, lon: -12.5 },
  },
  {
    identifier: '20260609023000',
    caption: 'Segunda captura da Terra',
    image: 'epic_1b_20260609023000',
    date: '2026-06-09 02:30:00',
  },
]

describe('EpicSection', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exibe as imagens recentes e permite navegar pela linha do tempo', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(images), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ date: '2026-06-09' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

    const wrapper = mount(EpicSection)
    await flushPromises()

    expect(wrapper.text()).toContain('A Terra vista pelo DSCOVR')
    expect(wrapper.get('.epic-stage img').attributes('src')).toContain(
      encodeURIComponent('/archive/natural/2026/06/09/jpg/epic_1b_20260609003633.jpg'),
    )

    await wrapper.findAll('.epic-timeline button')[1].trigger('click')
    expect(wrapper.text()).toContain('Segunda captura da Terra')
  })

  it('consulta uma data disponível', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(images), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ date: '2026-06-09' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify([images[0]]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

    const wrapper = mount(EpicSection)
    await flushPromises()
    await wrapper.get('#epic-date').setValue('2026-06-09')
    await wrapper.get('.epic-date').trigger('submit')
    await flushPromises()

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/v1/epic/natural/date/2026-06-09',
      expect.any(Object),
    )
  })
})
