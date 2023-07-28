export const handler = async (throwCreateError: any) => {
  try {
    if (throwCreateError) {
      throw new Error('Error creating the pizza')
    }

    return { pizzaStatus: 'Created' }
  } catch (error) {
    console.error('Error creating the pizza:', error)

    throw error
  }
}