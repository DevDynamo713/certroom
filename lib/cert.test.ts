import { describe, it, expect } from 'vitest';
import { daysUntilExpiry, classifyStatus, formatSecret } from './cert';
describe('cert', () => {
  it('daysUntilExpiry future date', () => {
    const future = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysUntilExpiry(future)).toBeGreaterThanOrEqual(59);
  });
  it('daysUntilExpiry past date', () => {
    const past = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysUntilExpiry(past)).toBeLessThan(0);
  });
  it('classifyStatus active', () => {
    const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    expect(classifyStatus(future)).toBe('active');
  });
  it('classifyStatus expiring within 30 days', () => {
    const soon = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
    expect(classifyStatus(soon)).toBe('expiring');
  });
  it('classifyStatus expired', () => {
    const past = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(classifyStatus(past)).toBe('expired');
  });
  it('formats correctly', () => {
    const s = { id: '1', name: 'stripe-key', type: 'api_key', expiresAt: '2027-01-01', rotated: true, status: 'active' };
    expect(formatSecret(s)).toBe('stripe-key [api_key] expires:2027-01-01 (active) rotated:true');
  });
});