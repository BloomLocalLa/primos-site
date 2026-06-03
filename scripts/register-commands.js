// Run once (or after changing commands): node scripts/register-commands.js
// Requires env: DISCORD_BOT_TOKEN, DISCORD_APP_ID, DISCORD_GUILD_ID
const TOKEN = process.env.DISCORD_BOT_TOKEN
const APP_ID = process.env.DISCORD_APP_ID
const GUILD_ID = process.env.DISCORD_GUILD_ID

// default_member_permissions "0" hides commands from everyone except admins by
// default; the authoritative gate is the in-code mod-role check.
const commands = [
  {
    name: 'announce', description: 'Post a formatted announcement', default_member_permissions: '0',
    options: [
      { name: 'title', description: 'Announcement title', type: 3, required: true },
      { name: 'message', description: 'Announcement body', type: 3, required: true },
      { name: 'image', description: 'Optional image URL', type: 3, required: false },
    ],
  },
  { name: 'links', description: 'Publish or refresh the official links', default_member_permissions: '0' },
  { name: 'stats', description: 'Post current collection stats', default_member_permissions: '0' },
  {
    name: 'say', description: 'Send a custom message to a channel', default_member_permissions: '0',
    options: [
      { name: 'channel', description: 'Target channel', type: 7, required: true },
      { name: 'message', description: 'Message text', type: 3, required: true },
      { name: 'as_embed', description: 'Send as an embed?', type: 5, required: false },
    ],
  },
]

const res = await fetch(
  `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`,
  {
    method: 'PUT',
    headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  },
)
if (!res.ok) {
  console.error('Failed:', res.status, await res.text())
  process.exit(1)
}
console.log('Registered', (await res.json()).length, 'commands')
