// Stripe Payment Integration for Primos Merch

import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

export { stripePromise }

// Create checkout session
export async function createCheckoutSession(items, customerEmail = null) {
  try {
    // In production, this would call your backend API
    // For now, we'll simulate the checkout
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }))

    // This would be your backend endpoint
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lineItems,
        customerEmail,
        successUrl: `${window.location.origin}/checkout/success`,
        cancelUrl: `${window.location.origin}/merch`,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { sessionId } = await response.json()
    return sessionId
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Redirect to Stripe Checkout
export async function redirectToCheckout(sessionId) {
  const stripe = await stripePromise

  if (!stripe) {
    throw new Error('Stripe failed to load')
  }

  const { error } = await stripe.redirectToCheckout({ sessionId })

  if (error) {
    console.error('Error redirecting to checkout:', error)
    throw error
  }
}

// Format price for display
export function formatPrice(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Validate cart items
export function validateCartItems(items) {
  return items.every((item) => {
    return (
      item.id &&
      item.name &&
      typeof item.price === 'number' &&
      item.price > 0 &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    )
  })
}

// Calculate order total
export function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

// Calculate shipping (simplified)
export function calculateShipping(items, country = 'US') {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Base shipping rates
  const rates = {
    US: 5.99,
    CA: 9.99,
    EU: 14.99,
    OTHER: 19.99,
  }

  const baseRate = rates[country] || rates.OTHER

  // Add $2 per additional item after the first
  return baseRate + Math.max(0, itemCount - 1) * 2
}
