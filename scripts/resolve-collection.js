// Resolve the Primos on-chain collection address for the PRIMOS_COLLECTION_ADDRESS
// env var (what Helius groups holdings by).
//
// Grab any Primos token's mint address (e.g. from its Magic Eden or Tensor URL),
// then run — PowerShell:
//   $env:HELIUS_API_KEY="your_key"; node scripts/resolve-collection.js <primos_mint>
//
// It prints a ready-to-paste line:  PRIMOS_COLLECTION_ADDRESS=<address>

const KEY = process.env.HELIUS_API_KEY
const mint = process.argv[2]
if (!KEY) { console.error('Set HELIUS_API_KEY first.'); process.exit(1) }
if (!mint) { console.error('Usage: node scripts/resolve-collection.js <primos_mint_address>'); process.exit(1) }

const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 'resolve', method: 'getAsset', params: { id: mint } }),
})
const json = await res.json()
if (json.error) { console.error('Helius error:', JSON.stringify(json.error)); process.exit(1) }

const grouping = json.result?.grouping || []
const collection = grouping.find((g) => g.group_key === 'collection')?.group_value
if (!collection) {
  console.error('No collection grouping found on that mint — is it a Primos NFT?')
  console.error('grouping was:', JSON.stringify(grouping))
  process.exit(1)
}
console.log('PRIMOS_COLLECTION_ADDRESS=' + collection)
