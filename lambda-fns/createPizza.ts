export const handler = async (_event: any) => {
  try {
    return { pizzaStatus: 'Created' }
  } catch (error) {
    console.error('Error creating the pizza:', error)

    throw error
  }
}