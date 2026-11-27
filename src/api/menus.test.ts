import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../auth/keycloak', () => ({ authEnabled: true, getToken: () => 'tok-123' }));

import { getMyMenus } from './menus';
import { ApiError } from './client';

const respond = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body });

describe('getMyMenus', () => {
  beforeEach(() => vi.stubGlobal('fetch', respond(200, { data: [] })));
  afterEach(() => vi.unstubAllGlobals());

  it('asks the admin service for the INSIGHTS menus with the user\'s own token', async () => {
    const fetchMock = respond(200, {
      data: [{ id: 'm-1', label: 'Dashboard', path: '/', icon: 'ChartBarIcon' }],
    });
    vi.stubGlobal('fetch', fetchMock);

    const menus = await getMyMenus();

    expect(menus).toEqual([{ id: 'm-1', label: 'Dashboard', path: '/', icon: 'ChartBarIcon' }]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/admin\/v1\/me\/menus\?console=INSIGHTS$/);
    expect((init as RequestInit).headers).toMatchObject({ Authorization: 'Bearer tok-123' });
  });

  it('answers an empty list when the user has none', async () => {
    expect(await getMyMenus()).toEqual([]);
  });

  it('a 403 (no matching user in the admin console) surfaces as an ApiError with that status', async () => {
    vi.stubGlobal('fetch', respond(403, { error: { code: 'FORBIDDEN', message: 'Access denied' } }));
    const err = await getMyMenus().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(403);
    expect(err.message).toBe('Access denied');
  });

  it('a 5xx surfaces as an ApiError too', async () => {
    vi.stubGlobal('fetch', respond(500, { error: { code: 'INTERNAL', message: 'boom' } }));
    const err = await getMyMenus().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(500);
  });
});
