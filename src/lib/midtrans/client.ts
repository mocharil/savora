// @ts-ignore
import midtransClient from 'midtrans-client'

export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
})

export interface MidtransTransaction {
  transaction_id: string
  order_id: string
  gross_amount: number
  customer_details: {
    first_name: string
    email?: string
    phone?: string
  }
  item_details: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}

export async function createTransaction(params: MidtransTransaction) {
  try {
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: params.order_id,
        gross_amount: params.gross_amount,
      },
      customer_details: params.customer_details,
      item_details: params.item_details,
    })

    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    }
  } catch (error) {
    console.error('Midtrans create transaction error:', error)
    throw error
  }
}
