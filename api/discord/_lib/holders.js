import { createClient } from '@supabase/supabase-js'

// Data access for holder verification. Mirrors state.js: a lazily-created default
// client from env, with an injectable client for tests.
//
//   verify_nonces        — single-use, expiring challenges bound to a Discord ID
//   holder_verifications — current linked wallet + tier per Discord ID

let _client = null
function defaultClient() {
  if (!_client) {
    _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }
  return _client
}

// ---- nonces ----------------------------------------------------------------

export async function createNonce({ discordUserId, nonce, expiresAt }, client = defaultClient()) {
  const { data, error } = await client
    .from('verify_nonces')
    .insert({ discord_user_id: discordUserId, nonce, expires_at: expiresAt })
    .select('id, nonce, discord_user_id, expires_at')
    .single()
  if (error) throw new Error(`createNonce: ${error.message}`)
  return data
}

export async function getNonce(id, client = defaultClient()) {
  const { data, error } = await client
    .from('verify_nonces')
    .select('id, discord_user_id, nonce, expires_at, used')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`getNonce: ${error.message}`)
  return data
}

export async function markNonceUsed(id, client = defaultClient()) {
  const { error } = await client.from('verify_nonces').update({ used: true }).eq('id', id)
  if (error) throw new Error(`markNonceUsed: ${error.message}`)
}

// ---- verifications ---------------------------------------------------------

export async function getVerificationByWallet(wallet, client = defaultClient()) {
  const { data, error } = await client
    .from('holder_verifications')
    .select('discord_user_id, wallet, count, tier')
    .eq('wallet', wallet)
    .maybeSingle()
  if (error) throw new Error(`getVerificationByWallet: ${error.message}`)
  return data
}

export async function upsertVerification({ discordUserId, wallet, count, tier, verifiedAt }, client = defaultClient()) {
  const { error } = await client
    .from('holder_verifications')
    .upsert({
      discord_user_id: discordUserId,
      wallet,
      count,
      tier,
      verified_at: verifiedAt || new Date().toISOString(),
    }, { onConflict: 'discord_user_id' })
  if (error) throw new Error(`upsertVerification: ${error.message}`)
}

export async function listVerifications(client = defaultClient()) {
  const { data, error } = await client
    .from('holder_verifications')
    .select('discord_user_id, wallet, count, tier')
  if (error) throw new Error(`listVerifications: ${error.message}`)
  return data || []
}

export async function deleteVerification(discordUserId, client = defaultClient()) {
  const { error } = await client
    .from('holder_verifications')
    .delete()
    .eq('discord_user_id', discordUserId)
  if (error) throw new Error(`deleteVerification: ${error.message}`)
}
