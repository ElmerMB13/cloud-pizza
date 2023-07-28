import { handler } from '../lambda-fns/createPizza'

describe('CreatePizza Lambda', () => {
  it('should return the expected response', async () => {
    const throwCreateError = false

    const response = await handler(throwCreateError)

    expect(response.pizzaStatus).toBe('Created')
    expect(typeof response.pizzaStatus).toBe('string')
  })

  it('should throw an error', async () => {
    const throwCreateError = true

    await expect(handler(throwCreateError)).rejects.toThrow('Error creating the pizza')
  })
})