const DISCORD_API = 'https://discord.com/api/v10'

async function discordFetch(path, { method, token, body, fetchImpl = fetch }) {
  const res = await fetchImpl(`${DISCORD_API}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Discord ${method} ${path} failed: ${res.status} ${detail}`)
  }
  return res.json()
}

export function postMessage(channelId, payload, { token, fetchImpl } = {}) {
  return discordFetch(`/channels/${channelId}/messages`, { method: 'POST', token, body: payload, fetchImpl })
}

export function editMessage(channelId, messageId, payload, { token, fetchImpl } = {}) {
  return discordFetch(`/channels/${channelId}/messages/${messageId}`, { method: 'PATCH', token, body: payload, fetchImpl })
}
