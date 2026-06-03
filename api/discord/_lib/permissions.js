export function isAuthorized(member, modRoleId) {
  if (!member || !Array.isArray(member.roles)) return false
  return member.roles.includes(modRoleId)
}
