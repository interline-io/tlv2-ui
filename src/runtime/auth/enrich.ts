// Pure function to merge GraphQL `me` response into auth0 user claims.
export function enrichUserClaims (
  user: Record<string, any>,
  meData: { id?: string, name?: string, email?: string, roles?: string[] } | null
): Record<string, any> {
  if (!meData) { return user }
  return {
    ...user,
    tlv2_id: meData.id || '',
    tlv2_name: meData.name || '',
    tlv2_email: meData.email || '',
    tlv2_roles: meData.roles || []
  }
}
