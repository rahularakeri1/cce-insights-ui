import { ApiError } from '../api/client';
import { authEnabled } from '../auth/keycloak';
import type { SidebarItem } from '../components/layout/Sidebar';
import { visibleMenus } from '../utils/menuAccess';
import { useMyMenus } from './useMyMenus';

/**
 * What the shell should do about the signed-in user's menus (Milestone 10):
 *  - open:    auth is off (local demo) — today's behaviour, every page, no call
 *  - loading: the menus are still coming — no sidebar entries yet, never a wrong list
 *  - error:   the call failed (5xx, network) — an error with Retry
 *  - none:    the user has no menus, or the service answered 403 (no matching user) — "No access"
 *  - ready:   draw `items`, let the user open only `allowed` paths, send anything else to `first`
 */
export type MenuAccess =
  | { mode: 'open' }
  | { mode: 'loading' }
  | { mode: 'error'; retry: () => void; retrying: boolean }
  | { mode: 'none' }
  | { mode: 'ready'; items: SidebarItem[]; allowed: string[]; first: string };

export function useMenuAccess(): MenuAccess {
  const menus = useMyMenus();
  if (!authEnabled) return { mode: 'open' };

  if (menus.data) {
    // Only menus this app has a page for: another would be a dead link.
    const visible = visibleMenus(menus.data);
    if (visible.length === 0) return { mode: 'none' };
    return {
      mode: 'ready',
      items: visible.map((m) => ({ to: m.path, label: m.label, icon: m.icon })),
      allowed: visible.map((m) => m.path),
      first: visible[0].path,
    };
  }
  if (menus.isLoading) return { mode: 'loading' };
  // 403 = no matching user in the admin console (or not active): an answer, not a failure to retry.
  if (menus.error instanceof ApiError && menus.error.status === 403) return { mode: 'none' };
  return { mode: 'error', retry: () => void menus.refetch(), retrying: menus.isFetching };
}
