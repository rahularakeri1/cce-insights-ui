import { afterEach, describe, expect, it, vi } from 'vitest';
import { logoutRedirectUri } from './keycloak';

describe('logoutRedirectUri', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('is the site root when the router base is "/" (local)', () => {
    vi.stubEnv('VITE_ROUTER_BASE', '/');
    expect(logoutRedirectUri()).toBe(window.location.origin + '/');
  });

  it('defaults to the site root when no router base is set', () => {
    vi.stubEnv('VITE_ROUTER_BASE', '');
    expect(logoutRedirectUri()).toBe(window.location.origin + '/');
  });

  it('keeps /insights when deployed under that base', () => {
    vi.stubEnv('VITE_ROUTER_BASE', '/insights');
    expect(logoutRedirectUri()).toBe(window.location.origin + '/insights');
  });
});
