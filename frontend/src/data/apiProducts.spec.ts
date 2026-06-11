import {
  apiProducts,
  buildApiExplorerRequest,
  readApiExplorerResponse,
} from './apiProducts'

describe('apiProducts', () => {
  it('configura os 16 produtos sem IDs duplicados', () => {
    expect(apiProducts).toHaveLength(16)
    expect(new Set(apiProducts.map((product) => product.id)).size).toBe(16)
    expect(apiProducts.every((product) => product.examples.length > 0)).toBe(true)
  })

  it('monta caminhos e parâmetros de consulta com os padrões do exemplo', () => {
    const product = apiProducts.find(({ id }) => id === 'tle')
    const example = product?.examples.find(({ id }) => id === 'satellite')

    expect(example).toBeDefined()
    expect(buildApiExplorerRequest(example!)).toEqual({
      method: 'GET',
      url: '/api/v1/tle/25544',
      headers: { Accept: 'application/json' },
      responseFormat: 'json',
    })
  })

  it('codifica valores informados pelo usuário', () => {
    const product = apiProducts.find(({ id }) => id === 'images')
    const example = product?.examples.find(({ id }) => id === 'search')

    expect(example).toBeDefined()
    expect(buildApiExplorerRequest(example!, { q: 'moon landing' }).url).toBe(
      '/api/v1/images/search?q=moon+landing&media_type=image&page=1',
    )
  })

  it('detecta respostas textuais pelo content-type', async () => {
    const response = new Response('<xml />', {
      status: 200,
      headers: { 'content-type': 'application/xml' },
    })

    await expect(readApiExplorerResponse(response, 'auto')).resolves.toMatchObject({
      format: 'text',
      data: '<xml />',
    })
  })
})
