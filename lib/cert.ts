export interface Secret { id: string; name: string; type: 'api_key' | 'password' | 'certificate' | 'token'; expiresAt?: string; rotated: boolean; status: 'active' | 'expiring' | 'expired' | 'revoked' }
export function daysUntilExpiry(expiresAt: string): number {
  if (!expiresAt) return Infinity;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
export function classifyStatus(expiresAt?: string): 'active' | 'expiring' | 'expired' {
  if (!expiresAt) return 'active';
  const days = daysUntilExpiry(expiresAt);
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring';
  return 'active';
}
export function formatSecret(s: Secret): string { return `${s.name} [${s.type}] expires:${s.expiresAt || 'never'} (${s.status}) rotated:${s.rotated}`; }