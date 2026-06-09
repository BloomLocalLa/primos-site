# Holder Verification — Deployment Steps

The custom Helius holder-verification bot is built and tested. These are the
one-time config steps to take it live on the new Primos server
(guild `1513322208020135946`). Everything below is account/secret/Discord work
that can't be done from code.

## 1. Helius API key (free)
1. Sign up at https://helius.dev (no card). Create an API key on the free plan.
2. It includes the DAS API (`searchAssets`) at 2 req/s — plenty for this.

## 2. Resolve the collection address
Grab any Primos token's mint (from its Magic Eden/Tensor URL), then:
```powershell
$env:HELIUS_API_KEY="your_key"; node scripts/resolve-collection.js <primos_mint>
```
Copy the printed `PRIMOS_COLLECTION_ADDRESS=...` value.

## 3. Tier role IDs (new server)
Discord → Settings → Advanced → enable **Developer Mode**. Then right-click each
holder role → **Copy ID**:
- Primo → `TIER_ROLE_PRIMO`
- Compadre → `TIER_ROLE_COMPADRE`
- Tío → `TIER_ROLE_TIO`
- El Jefe → `TIER_ROLE_ELJEFE`

## 4. Bot permissions / role hierarchy (important)
- The Primos bot must be **in the new server** with the **Manage Roles** permission.
- In Server Settings → Roles, drag the **bot's role above all four tier roles**.
  Discord refuses to let a bot assign a role that sits above its own.

## 5. Vercel env vars (Project → Settings → Environment Variables)
Add / confirm:
```
HELIUS_API_KEY=...
PRIMOS_COLLECTION_ADDRESS=...        # from step 2
TIER_ROLE_PRIMO=...                  # from step 3
TIER_ROLE_COMPADRE=...
TIER_ROLE_TIO=...
TIER_ROLE_ELJEFE=...
PUBLIC_BASE_URL=https://primos-site.vercel.app
DISCORD_GUILD_ID=1513322208020135946 # new server (was the old dead one)
SUPABASE_URL=https://akupbtypgrzbrgvyjmct.supabase.co  # Primos project
SUPABASE_SERVICE_ROLE_KEY=...        # service-role (secret) key — never client-side
```
Redeploy after changing env.

## 6. Supabase tables
Apply `supabase/migrations/0001_holder_verification.sql` to the **Primos** project
(`akupbtypgrzbrgvyjmct`). The Claude Supabase integration is connected to a
different account, so either:
- paste the SQL into that project's **SQL editor** and run it, or
- connect that Supabase account to the integration so it can run the migration.

## 7. Register the /verify command
With env pointing at the new guild:
```powershell
node scripts/register-commands.js
```

## 8. GitHub Actions secrets (likely already set for the other crons)
`CRON_SECRET` and `VERCEL_BASE_URL` — the nightly-ish re-verify job
(`cron-reverify`, hourly at :15) uses these.

## 9. Test
Run `/verify` in Discord → open the link → connect Phantom/Solflare → sign →
confirm the right tier role lands. Sell/move a Primo and confirm the next
re-verify run adjusts it.
