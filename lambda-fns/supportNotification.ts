export const handler = async (event: any) => {
  try {
    console.log('Sending support notification:', event)

    return event
  } catch (error) {
    console.error('Error notifying production support:', error)

    throw error
  }
}