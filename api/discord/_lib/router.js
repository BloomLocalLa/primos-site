import { isAuthorized } from './permissions.js'
import { buildStatsEmbed, buildAnnounceEmbed, buildLinksEmbed } from './embeds.js'

const EPHEMERAL = 64

function ephemeral(content) {
  return { type: 4, data: { flags: EPHEMERAL, content } }
}

function optionValue(data, name) {
  const opt = (data.options || []).find((o) => o.name === name)
  return opt ? opt.value : undefined
}

function confirmButtons(confirmId) {
  return [{
    type: 1,
    components: [
      { type: 2, style: 3, label: 'Confirm', custom_id: confirmId },
      { type: 2, style: 4, label: 'Cancel', custom_id: 'cancel' },
    ],
  }]
}

function previewWith(embed, confirmId, note) {
  return { type: 4, data: { flags: EPHEMERAL, content: note, embeds: [embed], components: confirmButtons(confirmId) } }
}

async function handleCommand(interaction, deps) {
  const { config } = deps
  if (!isAuthorized(interaction.member, config.MOD_ROLE_ID)) {
    return ephemeral('🚫 You do not have permission to use this command.')
  }
  const data = interaction.data
  switch (data.name) {
    case 'stats': {
      // Fetch in parallel so we stay well under Discord's 3s interaction-response limit.
      const [stats, holders] = await Promise.all([
        deps.getCollectionStats(config.COLLECTION_SYMBOL),
        deps.getHolderCount(config.COLLECTION_SYMBOL),
      ])
      return { type: 4, data: { embeds: [buildStatsEmbed({ ...stats, holders })] } }
    }
    case 'announce': {
      const embed = buildAnnounceEmbed({
        title: optionValue(data, 'title'),
        message: optionValue(data, 'message'),
        image: optionValue(data, 'image'),
      })
      return previewWith(embed, 'confirm:announce', 'Preview — Confirm to post to #announcements:')
    }
    case 'links': {
      return previewWith(buildLinksEmbed(), 'confirm:links', 'Preview — Confirm to publish/refresh #official-links:')
    }
    case 'say': {
      const channelId = optionValue(data, 'channel')
      const message = optionValue(data, 'message')
      const asEmbed = optionValue(data, 'as_embed') === true
      const embed = { description: message, color: 0xe91e8c }
      const confirmId = `confirm:say:${channelId}:${asEmbed ? 'embed' : 'text'}`
      return previewWith(embed, confirmId, `Preview — Confirm to send to <#${channelId}>:`)
    }
    default:
      return ephemeral('Unknown command.')
  }
}

async function handleComponent(interaction, deps) {
  const { config } = deps
  if (!isAuthorized(interaction.member, config.MOD_ROLE_ID)) {
    return ephemeral('🚫 You do not have permission.')
  }
  const customId = interaction.data.custom_id
  const previewEmbed = interaction.message?.embeds?.[0]

  if (customId === 'cancel') {
    return { type: 7, data: { content: '❌ Cancelled.', embeds: [], components: [] } }
  }
  if (customId === 'confirm:announce') {
    await deps.postMessage(config.ANNOUNCE_CHANNEL_ID, { embeds: [previewEmbed] })
    return { type: 7, data: { content: '✅ Posted to announcements.', embeds: [], components: [] } }
  }
  if (customId === 'confirm:links') {
    const stored = await deps.getState('links_message_id')
    if (stored && stored.id) {
      try {
        await deps.editMessage(config.LINKS_CHANNEL_ID, stored.id, { embeds: [previewEmbed] })
        return { type: 7, data: { content: '✅ Official links updated.', embeds: [], components: [] } }
      } catch (err) {
        // stored message was deleted or unreachable — log and fall through to repost
        console.error('links edit failed, reposting:', err)
      }
    }
    const posted = await deps.postMessage(config.LINKS_CHANNEL_ID, { embeds: [previewEmbed] })
    await deps.setState('links_message_id', { id: posted.id })
    return { type: 7, data: { content: '✅ Official links posted.', embeds: [], components: [] } }
  }
  if (customId.startsWith('confirm:say:')) {
    const [, , channelId, mode] = customId.split(':')
    const payload = mode === 'text' ? { content: previewEmbed.description } : { embeds: [previewEmbed] }
    await deps.postMessage(channelId, payload)
    return { type: 7, data: { content: '✅ Sent.', embeds: [], components: [] } }
  }
  return ephemeral('Unknown action.')
}

export async function handleInteraction(interaction, deps) {
  if (interaction.type === 1) return { type: 1 }
  if (interaction.type === 2) return handleCommand(interaction, deps)
  if (interaction.type === 3) return handleComponent(interaction, deps)
  return ephemeral('Unsupported interaction.')
}
