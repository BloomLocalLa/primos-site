import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, X, CheckCircle, Loader, AlertCircle } from 'lucide-react'
import { createPaymentRequest, renderQRCode, waitForPayment, formatSOL } from '../lib/solanapay'

export default function SolanaPayButton({ amount, onSuccess, onError, label = 'Pay with Solana' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState('idle') // idle, pending, confirmed, failed
  const [paymentData, setPaymentData] = useState(null)
  const qrRef = useRef(null)

  useEffect(() => {
    if (isOpen && !paymentData) {
      // Create payment request
      const data = createPaymentRequest(
        amount,
        'Primos Merch',
        `Payment for $${amount}`,
        `order-${Date.now()}`
      )
      setPaymentData(data)
    }
  }, [isOpen, amount, paymentData])

  useEffect(() => {
    if (paymentData && qrRef.current && isOpen) {
      // Clear previous QR
      qrRef.current.innerHTML = ''

      // Render QR code
      renderQRCode(qrRef.current, paymentData.url, 256)

      // Start polling for payment
      setStatus('pending')
      waitForPayment(
        paymentData.reference,
        paymentData.amountSOL,
        (newStatus) => {
          if (newStatus === 'confirmed') {
            setStatus('confirmed')
            setTimeout(() => {
              setIsOpen(false)
              onSuccess?.()
            }, 2000)
          } else if (newStatus === 'failed' || newStatus === 'timeout') {
            setStatus('failed')
            onError?.(new Error('Payment failed or timed out'))
          }
        }
      ).catch((error) => {
        setStatus('failed')
        onError?.(error)
      })
    }
  }, [paymentData, isOpen, onSuccess, onError])

  const handleClose = () => {
    setIsOpen(false)
    setPaymentData(null)
    setStatus('idle')
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 bg-gradient-to-r from-primo-purple to-primo-cyan text-white font-display tracking-wider flex items-center justify-center gap-2 border-2 border-white hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-shadow"
      >
        <Wallet size={20} />
        {label}
      </motion.button>

      {/* Payment Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50 bg-static-dark border-4 border-primo-cyan p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Wallet className="text-primo-cyan" size={24} />
                  <span className="font-display text-white text-lg">SOLANA PAY</span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 text-static-gray hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="text-center">
                {status === 'pending' && (
                  <>
                    <p className="text-static-gray mb-4 font-mono">
                      Scan with your Solana wallet
                    </p>

                    {/* QR Code */}
                    <div className="flex justify-center mb-4">
                      <div
                        ref={qrRef}
                        className="bg-white p-4 inline-block"
                      />
                    </div>

                    {/* Amount */}
                    <div className="mb-4">
                      <span className="text-static-gray font-mono text-sm">Amount:</span>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="font-display text-2xl text-primo-cyan">
                          ◎ {paymentData && formatSOL(paymentData.amountSOL)}
                        </span>
                        <span className="text-static-gray font-mono">
                          (${amount})
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center gap-2 text-primo-yellow">
                      <Loader size={16} className="animate-spin" />
                      <span className="font-mono text-sm">Waiting for payment...</span>
                    </div>
                  </>
                )}

                {status === 'confirmed' && (
                  <div className="py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-primo-green mb-4"
                    >
                      <CheckCircle size={64} className="mx-auto" />
                    </motion.div>
                    <h3 className="font-display text-2xl text-white mb-2">PAYMENT CONFIRMED!</h3>
                    <p className="text-static-gray font-mono">Thank you for your purchase.</p>
                  </div>
                )}

                {status === 'failed' && (
                  <div className="py-8">
                    <div className="text-primo-red mb-4">
                      <AlertCircle size={64} className="mx-auto" />
                    </div>
                    <h3 className="font-display text-2xl text-white mb-2">PAYMENT FAILED</h3>
                    <p className="text-static-gray font-mono mb-4">
                      Something went wrong. Please try again.
                    </p>
                    <button
                      onClick={() => {
                        setPaymentData(null)
                        setStatus('idle')
                      }}
                      className="retro-btn"
                    >
                      TRY AGAIN
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              {status === 'pending' && (
                <div className="mt-6 pt-4 border-t border-static-dark text-center">
                  <p className="text-static-gray text-xs font-mono">
                    Powered by Solana Pay • Fast & Feeless
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
