import { BASE_URL, authHeaders, handleResponse } from './client';

/** One sidebar entry from GET /admin/v1/me/menus — only what the sidebar needs. */
export interface MyMenu {
  id: string;
  label: string;
  path: string;
  icon: string | null;
}

/**
 * The signed-in user's Insights menus, from the admin console's catalog (Milestone 10). Answered by
 * cce-admin-service from the user's DATABASE roles, so a change an admin makes shows on the next call. Goes through the
 * gateway (`/admin/**`) in a deployment, and the Vite proxy for `/admin/v1` in local dev. Errors surface as ApiError:
 * 403 = no matching user in the admin console (or not active) — the caller shows "No access".
 */
export async function getMyMenus(): Promise<MyMenu[]> {
  const res = await fetch(`${BASE_URL}/admin/v1/me/menus?console=INSIGHTS`, { headers: authHeaders() });
  const json = await handleResponse(res);
  return json.data ?? [];
}
