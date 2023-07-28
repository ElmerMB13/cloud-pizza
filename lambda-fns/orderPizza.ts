export const handler = async (flavour: any) => {
  try {
    const containsPineapple = flavour === 'pineapple' || flavour === 'hawaiian'

    return { 'containsPineapple': containsPineapple }
  } catch (error) {
    console.error('Error ordering the pizza:', error)

    throw error
  }
}