const MAYAR_PRODUCTION_URL = 'https://api.mayar.id/hl/v1'
const MAYAR_SANDBOX_URL = 'https://api.mayar.club/hl/v1'

function getBaseUrl() {
  return process.env.MAYAR_IS_PRODUCTION === 'true'
    ? MAYAR_PRODUCTION_URL
    : MAYAR_SANDBOX_URL
}

function getApiKey() {
  const key = process.env.MAYAR_API_KEY
  if (!key) throw new Error('MAYAR_API_KEY is not set')
  return key
}

interface MayarPaymentRequest {
  name: string
  amount: number
  redirectUrl: string
  description?: string
  email?: string
  mobile?: string
}

interface MayarPaymentResponse {
  statusCode: number
  messages: string
  data: {
    id: string
    transactionId: string
    link: string
  }
}

export async function createSinglePayment(params: MayarPaymentRequest): Promise<MayarPaymentResponse> {
  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()

  // expiredAt: 24 jam dari sekarang
  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const response = await fetch(`${baseUrl}/payment/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: params.name,
      amount: params.amount,
      redirectURL: params.redirectUrl,
      description: params.description || '',
      email: params.email || 'customer@savora.app',
      mobile: params.mobile || '08000000000',
      expiredAt,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Mayar API error:', response.status, errorText)
    throw new Error(`Mayar API error: ${response.status}`)
  }

  const data: MayarPaymentResponse = await response.json()
  return data
}
