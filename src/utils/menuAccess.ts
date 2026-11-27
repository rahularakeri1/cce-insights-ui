/**
 * Which menu governs which page, for the role-aware sidebar (Milestone 10).
 *
 * Only the seven sidebar paths are governed. A page belongs to the LONGEST of them that prefixes its path
 * ("/" only matches the exact root), so `/compliance/protocols/:id` belongs to Compliance and
 * `/compliance/patients/:id` to Patients — not to Compliance. A page that no sidebar path prefixes
 * (/practitioners, /intelligence, /exports) has no menu entry and stays open to every signed-in user.
 * This is the soft control (what is shown); the data behind each page is still protected at the gateway.
 */
export const GOVERNED_PATHS = [
  '/',
  '/facilities',
  '/compliance',
  '/deviations',
  '/compliance/patients',
  '/events',
  '/ingestion',
] as const;

const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p) || '/';

/** The sidebar path whose menu governs `pathname`, or null if no menu governs it (open page). */
export function governingPath(pathname: string): string | null {
  const path = trim(pathname);
  if (path === '/') return '/';
  let best: string | null = null;
  for (const governed of GOVERNED_PATHS) {
    if (governed === '/') continue;
    if ((path === governed || path.startsWith(governed + '/')) && (!best || governed.length > best.length)) {
      best = governed;
    }
  }
  return best;
}

/** May the user (holding menus at `allowedPaths`) open `pathname`? Ungoverned pages are always open. */
export function isAllowed(pathname: string, allowedPaths: readonly string[]): boolean {
  const governing = governingPath(pathname);
  return governing === null || allowedPaths.includes(governing);
}

/** The menus this app has a page for, in the order given (a menu with no page here would be a dead link). */
export function visibleMenus<T extends { path: string }>(menus: readonly T[]): T[] {
  return menus.filter((m) => (GOVERNED_PATHS as readonly string[]).includes(m.path));
}
