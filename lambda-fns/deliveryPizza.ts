export const handler = async (throwDeliveryError: any) => {
  try {
    if (throwDeliveryError) {
      throw new Error('Error delivering the pizza')
    }
  
    return { deliveryStatus: 'Delivered' }
  } catch (error) {
    console.error('Error delivering pizza:', error)

    throw error
  }
}