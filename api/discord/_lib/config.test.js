import { describe, it, expect, beforeEach } from 'vitest'
import { loadConfig } from './config.js'

describe('loadConfig', () => {
  it('reads values from the provided env object', () => {
    const cfg = loadConfig({
      DISCORD_BOT_TOKEN: 'tok', DISCORD_PUBLIC_KEY: 'pk', DISCORD_APP_ID: 'app',
      DISCORD_GUILD_ID: 'g', DISCORD_MOD_ROLE_ID: 'role',
      ANNOUNCE_CHANNEL_ID: 'a', LINKS_CHANNEL_ID: 'l', STATS_CHANNEL_ID: 's', SALES_CHANNEL_ID: 'sa',
      CRON_SECRET: 'secret', SUPABASE_URL: 'url', SUPABASE_SERVICE_ROLE_KEY: 'key',
    })
    expect(cfg.BOT_TOKEN).toBe('tok')
    expect(cfg.MOD_ROLE_ID).toBe('role')
    expect(cfg.COLLECTION_SYMBOL).toBe('primos')
  })

  it('throws if a required variable is missing', () => {
    expect(() => loadConfig({})).toThrow(/DISCORD_BOT_TOKEN/)
  })
})
