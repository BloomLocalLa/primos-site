const REQUIRED = [
  'DISCORD_BOT_TOKEN', 'DISCORD_PUBLIC_KEY', 'DISCORD_APP_ID',
  'DISCORD_GUILD_ID', 'DISCORD_MOD_ROLE_ID',
  'ANNOUNCE_CHANNEL_ID', 'LINKS_CHANNEL_ID', 'STATS_CHANNEL_ID', 'SALES_CHANNEL_ID',
  'CRON_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
]

export function loadConfig(env = process.env) {
  for (const key of REQUIRED) {
    if (!env[key]) throw new Error(`Missing required environment variable: ${key}`)
  }
  const config = {
    BOT_TOKEN: env.DISCORD_BOT_TOKEN,
    PUBLIC_KEY: env.DISCORD_PUBLIC_KEY,
    APP_ID: env.DISCORD_APP_ID,
    GUILD_ID: env.DISCORD_GUILD_ID,
    MOD_ROLE_ID: env.DISCORD_MOD_ROLE_ID,
    ANNOUNCE_CHANNEL_ID: env.ANNOUNCE_CHANNEL_ID,
    LINKS_CHANNEL_ID: env.LINKS_CHANNEL_ID,
    STATS_CHANNEL_ID: env.STATS_CHANNEL_ID,
    SALES_CHANNEL_ID: env.SALES_CHANNEL_ID,
    CRON_SECRET: env.CRON_SECRET,
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    COLLECTION_SYMBOL: env.VITE_COLLECTION_SYMBOL || 'primos',
    // Holder verification (custom Helius bot). Optional at load time so existing
    // handlers keep working before these are set; the verify endpoints assert the
    // ones they need themselves (see assertVerifyConfig).
    HELIUS_API_KEY: env.HELIUS_API_KEY,
    PRIMOS_COLLECTION_ADDRESS: env.PRIMOS_COLLECTION_ADDRESS,
    TIER_ROLE_PRIMO: env.TIER_ROLE_PRIMO,
    TIER_ROLE_COMPADRE: env.TIER_ROLE_COMPADRE,
    TIER_ROLE_TIO: env.TIER_ROLE_TIO,
    TIER_ROLE_ELJEFE: env.TIER_ROLE_ELJEFE,
    PUBLIC_BASE_URL: env.PUBLIC_BASE_URL || 'https://primos-site.vercel.app',
  }
  // Trim stray whitespace — a trailing newline on a pasted token/secret/ID is a
  // classic cause of silent 401s.
  for (const k of Object.keys(config)) {
    if (typeof config[k] === 'string') config[k] = config[k].trim()
  }
  return config
}

// Verify endpoints need extra env the base bot doesn't. Call this at the top of
// those handlers so a misconfiguration fails loudly instead of silently skipping
// role assignment.
const VERIFY_REQUIRED = [
  'HELIUS_API_KEY', 'PRIMOS_COLLECTION_ADDRESS',
  'TIER_ROLE_PRIMO', 'TIER_ROLE_COMPADRE', 'TIER_ROLE_TIO', 'TIER_ROLE_ELJEFE',
]

export function assertVerifyConfig(config) {
  const missing = VERIFY_REQUIRED.filter((k) => !config[k])
  if (missing.length) {
    throw new Error(`Holder verification not configured — missing: ${missing.join(', ')}`)
  }
  return config
}
