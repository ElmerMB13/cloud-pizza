export const handler = async (_event: any) => {
  try {
    return { deliveryStatus: 'Delivered' }
  } catch (error) {
    console.error('Error delivering pizza:', error)

    throw error
  }
}