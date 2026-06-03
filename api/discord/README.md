# Primos Discord Bot — Operator Setup

Serverless bot running on Vercel + GitHub Actions cron + Supabase. Zero ongoing cost, no AI.

Commands (all restricted to the configured mod role):
- `/announce title message [image]` — preview, then Confirm to post to #announcements
- `/links` — preview, then Confirm to publish/refresh #official-links (re-editable by the bot)
- `/stats` — posts current floor / volume / holders from Magic Eden
- `/say channel message [as_embed]` — preview, then Confirm to send to any channel

## 1. Create the Discord app & bot
1. https://discord.com/developers/applications → New Application → name it "Primos".
2. On **General Information**, copy the **Application ID** and **Public Key**.
3. **Bot** tab → Add Bot → copy the **Bot Token** (keep secret). Consider disabling "Public Bot".

## 2. Invite the bot
Open this URL (replace `APP_ID`) and add the bot to the Primos server:
```
https://discord.com/api/oauth2/authorize?client_id=APP_ID&scope=bot+applications.commands&permissions=18432
```
(`permissions=18432` = Send Messages + Embed Links.)

## 3. Gather IDs
Enable Developer Mode (Discord → Settings → Advanced → Developer Mode), then right-click → Copy ID for:
- Server (guild) ID — already `1277996118059253821`
- The **mod/team role** allowed to run commands
- Channels for: announcements, official-links, daily stats, sales alerts

## 4. Set environment variables in Vercel
Project → Settings → Environment Variables. Add every variable listed in `.env.example` under the Discord bot section. Generate a long random `CRON_SECRET`.

## 5. Create the Supabase tables
The bot needs `bot_state` and `bot_reminders` tables. Apply the migration via the Supabase MCP (managed by the project maintainer) — do not paste raw SQL into the dashboard manually.

## 6. Deploy
Merge/push to the production branch so Vercel deploys the new `api/discord/*` functions.

## 7. Set the Interactions Endpoint URL
Discord Developer Portal → General Information → **Interactions Endpoint URL**:
```
https://primos-site.vercel.app/api/discord/interactions
```
Save. Discord sends a validation PING that must succeed (this proves signature verification works).

## 8. Register the slash commands
With `DISCORD_BOT_TOKEN`, `DISCORD_APP_ID`, `DISCORD_GUILD_ID` set in your shell, run once:
```
node scripts/register-commands.js
```
The four commands appear immediately in the guild.

## 9. Add GitHub Actions secrets
Repo → Settings → Secrets and variables → Actions:
- `CRON_SECRET` — same value as in Vercel
- `VERCEL_BASE_URL` — `https://primos-site.vercel.app`

The workflow `.github/workflows/discord-cron.yml` then drives daily stats (16:00 UTC), sales alerts (every 5 min), and reminders (hourly). Trigger manually anytime via the Actions tab → Run workflow.

## Scheduled posts
- **Daily stats** → `STATS_CHANNEL_ID`
- **Sales alerts** → `SALES_CHANNEL_ID` (dedup via a Supabase `sales_cursor`)
- **Reminders** → rows in `bot_reminders` with `schedule = 'daily'`, posted to their `channel_id`
