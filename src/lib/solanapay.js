// Solana Pay Integration for Primos Merch

import { createQR, encodeURL, findReference, validateTransfer } from '@solana/pay'
import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js'
import BigNumber from 'bignumber.js'

// Configuration
const MERCHANT_WALLET = import.meta.env.VITE_MERCHANT_WALLET || 'YOUR_WALLET_ADDRESS'
const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta')

// SOL to USD rate (in production, fetch from an API)
const SOL_USD_RATE = 100 // Example: 1 SOL = $100

// Initialize Solana connection
export function getConnection() {
  return new Connection(RPC_URL, 'confirmed')
}

// Create payment request
export function createPaymentRequest(amountUSD, label, message, memo) {
  const recipient = new PublicKey(MERCHANT_WALLET)

  // Convert USD to SOL
  const amountSOL = amountUSD / SOL_USD_RATE
  const amount = new BigNumber(amountSOL)

  // Generate unique reference for this transaction
  const reference = Keypair.generate().publicKey

  // Create the payment URL
  const url = encodeURL({
    recipient,
    amount,
    reference,
    label: label || 'Primos Merch',
    message: message || 'Thank you for your purchase!',
    memo: memo || `primos-order-${Date.now()}`,
  })

  return {
    url,
    reference,
    amountSOL,
    amountUSD,
  }
}

// Generate QR code for payment
export function generateQRCode(paymentUrl, size = 256) {
  const qr = createQR(paymentUrl, size, 'white', 'black')
  return qr
}

// Render QR code to element
export function renderQRCode(element, paymentUrl, size = 256) {
  const qr = createQR(paymentUrl, size, 'white', 'black')
  qr.append(element)
  return qr
}

// Check for payment
export async function checkPayment(reference, expectedAmount) {
  const connection = getConnection()
  const recipient = new PublicKey(MERCHANT_WALLET)

  try {
    // Find the transaction with the reference
    const signatureInfo = await findReference(connection, reference, { finality: 'confirmed' })

    // Validate the transfer
    const response = await validateTransfer(
      connection,
      signatureInfo.signature,
      {
        recipient,
        amount: new BigNumber(expectedAmount),
        reference,
      },
      { commitment: 'confirmed' }
    )

    return {
      success: true,
      signature: signatureInfo.signature,
      response,
    }
  } catch (error) {
    // Transaction not found yet
    if (error.name === 'FindReferenceError') {
      return { success: false, pending: true }
    }

    // Validation failed
    return { success: false, error: error.message }
  }
}

// Poll for payment completion
export async function waitForPayment(reference, expectedAmount, onStatusChange, maxAttempts = 60) {
  let attempts = 0

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      attempts++

      try {
        const result = await checkPayment(reference, expectedAmount)

        if (result.success) {
          clearInterval(interval)
          onStatusChange?.('confirmed')
          resolve(result)
        } else if (!result.pending) {
          clearInterval(interval)
          onStatusChange?.('failed')
          reject(new Error(result.error || 'Payment failed'))
        } else {
          onStatusChange?.('pending')
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval)
          onStatusChange?.('timeout')
          reject(new Error('Payment timeout'))
        }
      } catch (error) {
        // Continue polling on error
        console.error('Payment check error:', error)
      }
    }, 1000) // Check every second
  })
}

// Format SOL amount for display
export function formatSOL(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount)
}

// Get current SOL price (mock - in production use a price feed)
export async function getSOLPrice() {
  // In production, fetch from CoinGecko, Jupiter, or similar
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
    )
    const data = await response.json()
    return data.solana.usd
  } catch (error) {
    console.error('Error fetching SOL price:', error)
    return SOL_USD_RATE // Fallback
  }
}

// Convert USD to SOL
export async function usdToSOL(usdAmount) {
  const solPrice = await getSOLPrice()
  return usdAmount / solPrice
}

// Validate Solana address
export function isValidSolanaAddress(address) {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}
