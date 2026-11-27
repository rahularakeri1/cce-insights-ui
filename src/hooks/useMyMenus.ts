import { useQuery } from '@tanstack/react-query';
import { getMyMenus } from '../api/menus';
import { authEnabled } from '../auth/keycloak';

/**
 * The signed-in user's menus. Not called at all when auth is off (local demo: the sidebar shows everything).
 * Re-read whenever the browser tab regains focus and never served stale, so a role or menu change an admin just made
 * shows without a manual reload.
 */
export function useMyMenus() {
  return useQuery({
    queryKey: ['me', 'menus', 'INSIGHTS'],
    queryFn: getMyMenus,
    enabled: authEnabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
