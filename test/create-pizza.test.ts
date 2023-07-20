import { handler } from '../lambda-fns/createPizza'

describe('CreatePizza Lambda', () => {
  it('should return the expected response', async () => {
    const event = {}

    const response = await handler(event)

    expect(response.pizzaStatus).toBe('Created')
    expect(typeof response.pizzaStatus).toBe('string')
  })
})