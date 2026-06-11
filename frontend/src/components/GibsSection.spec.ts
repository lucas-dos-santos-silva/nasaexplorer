import { mount } from '@vue/test-utils'
import GibsSection from './GibsSection.vue'

describe('GibsSection', () => {
  it('monta a imagem pela rota local e alterna camadas', async () => {
    const wrapper = mount(GibsSection)
    const image = wrapper.get('.gibs-map img')

    expect(image.attributes('src')).toContain('/api/v1/gibs/map?')
    expect(image.attributes('src')).toContain('layer=modis')

    await wrapper.findAll('.gibs-tabs button')[2].trigger('click')

    expect(wrapper.get('.gibs-map img').attributes('src')).toContain('layer=aerosol')
    expect(wrapper.text()).toContain('Aerossóis atmosféricos')
  })

  it('atualiza a data usada pelo mapa', async () => {
    const wrapper = mount(GibsSection)

    await wrapper.get('input[type="date"]').setValue('2026-06-10')

    expect(wrapper.get('.gibs-map img').attributes('src')).toContain('date=2026-06-10')
    expect(wrapper.text()).toContain('2026-06-10')
  })
})
