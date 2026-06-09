import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// Holder verification page. The member arrives here from the /verify Discord
// command with a one-time ?t= token. They connect a wallet and sign a free
// challenge message (no transaction) to prove ownership; the backend counts their
// Primos via Helius and assigns the matching tier role.

const TIERS = [
  { name: 'Primo', need: '1+' },
  { name: 'Compadre', need: '5+' },
  { name: 'Tío', need: '10+' },
  { name: 'El Jefe', need: '25+' },
]

const ERROR_TEXT = {
  bad_signature: "That signature didn't match. Please try connecting and signing again.",
  wallet_taken: 'That wallet is already linked to a different Discord account.',
  expired: 'This verification link expired. Run /verify in Discord again to get a fresh one.',
  used: 'This link was already used. Run /verify in Discord again.',
  not_found: 'This verification link is invalid. Run /verify in Discord again.',
  bad_request: 'Something was missing from the request. Please try again.',
  server_error: 'Something went wrong on our end. Give it a moment and try again.',
}

function detectProviders() {
  const list = []
  const phantom = window.phantom?.solana || (window.solana?.isPhantom ? window.solana : null)
  if (phantom) list.push({ key: 'phantom', label: 'Phantom', provider: phantom })
  if (window.solflare) list.push({ key: 'solflare', label: 'Solflare', provider: window.solflare })
  return list
}

function toBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
}

export default function Verify() {
  const [params] = useSearchParams()
  const token = params.get('t')

  const [phase, setPhase] = useState('loading') // loading | ready | working | success | error
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [providers, setProviders] = useState([])

  useEffect(() => {
    setProviders(detectProviders())
    if (!token) {
      setPhase('error')
      setError('No verification token. Run /verify in the Primos Discord to get your link.')
      return
    }
    fetch(`/api/discord/verify-challenge?t=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(ERROR_TEXT[body.error] || 'This link is no longer valid.')
        setMessage(body.message)
        setPhase('ready')
      })
      .catch((e) => { setPhase('error'); setError(e.message) })
  }, [token])

  async function connectAndVerify(entry) {
    setError('')
    setPhase('working')
    try {
      const { provider } = entry
      await provider.connect()
      const wallet = provider.publicKey?.toString()
      if (!wallet) throw new Error('Could not read your wallet address.')

      const encoded = new TextEncoder().encode(message)
      const signed = await provider.signMessage(encoded, 'utf8')
      const signature = toBase64(signed?.signature ?? signed)

      const res = await fetch('/api/discord/verify-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: token, wallet, signature }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPhase('error')
        setError(ERROR_TEXT[body.error] || 'Verification failed. Please try again.')
        return
      }
      setResult(body)
      setPhase('success')
    } catch (e) {
      setPhase('error')
      setError(e?.message?.includes('User rejected') ? 'You cancelled the signature.' : (e?.message || 'Something went wrong.'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-lg border-2 md:border-4 border-primo-pink bg-static-black/80 p-6 md:p-10 rounded-lg shadow-[0_0_30px_rgba(233,30,140,0.35)]">
        <h1 className="text-3xl md:text-4xl font-black text-primo-pink glitch-text mb-2">VERIFY YOUR PRIMOS</h1>
        <p className="text-sm text-primo-cyan mb-6">
          Connect your wallet and sign a free message to claim your holder tier. No transaction, no fees — it only proves you own the wallet.
        </p>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {TIERS.map((t) => (
            <div key={t.name} className="border border-primo-purple/60 rounded p-2 text-center">
              <div className="text-xs md:text-sm font-bold text-primo-yellow">{t.name}</div>
              <div className="text-[10px] md:text-xs text-white/70">{t.need}</div>
            </div>
          ))}
        </div>

        {phase === 'loading' && <p className="text-white/80">Loading your verification…</p>}

        {phase === 'error' && (
          <div className="border border-red-500 bg-red-500/10 rounded p-4 text-red-300 text-sm">{error}</div>
        )}

        {(phase === 'ready' || phase === 'working') && (
          <div className="space-y-3">
            {providers.length === 0 && (
              <a
                href="https://phantom.app/" target="_blank" rel="noreferrer"
                className="block text-center bg-primo-purple text-white font-bold py-3 rounded hover:opacity-90"
              >
                No Solana wallet found — install Phantom
              </a>
            )}
            {providers.map((entry) => (
              <button
                key={entry.key}
                disabled={phase === 'working'}
                onClick={() => connectAndVerify(entry)}
                className="w-full bg-primo-pink text-static-black font-black py-3 rounded hover:opacity-90 disabled:opacity-50"
              >
                {phase === 'working' ? 'Check your wallet…' : `Connect ${entry.label} & Verify`}
              </button>
            ))}
          </div>
        )}

        {phase === 'success' && result && (
          <div className="border border-primo-green bg-primo-green/10 rounded p-5 text-center">
            <div className="text-2xl font-black text-primo-green mb-2">✅ Verified!</div>
            {result.tier ? (
              <p className="text-white">
                This wallet holds <span className="font-bold text-primo-yellow">{result.walletCount}</span> Primos.
                {' '}You now hold <span className="font-bold text-primo-yellow">{result.total}</span> across{' '}
                <span className="font-bold">{result.walletsLinked}</span> wallet{result.walletsLinked === 1 ? '' : 's'} —
                {' '}role: <span className="font-bold text-primo-pink">{result.tier}</span>. Head back to Discord!
              </p>
            ) : (
              <p className="text-white/80">
                Wallet linked, but you hold no Primos across your wallets right now, so no tier role was given.
              </p>
            )}
            <p className="text-xs text-primo-cyan mt-3">
              Have more wallets? Run <span className="font-mono">/verify</span> again with each — holdings combine.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
