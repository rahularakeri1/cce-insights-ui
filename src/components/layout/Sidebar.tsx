import { Link, NavLink } from 'react-router-dom';
import mohLogo from '../../assets/rwanda-moh-logo-full.png';
import { MenuIcon } from '../../utils/menuIcons';

export interface SidebarItem {
  to: string;
  label: string;
  /** A Heroicons outline name (e.g. 'ChartBarIcon'); none or unknown draws a blank of the same size. */
  icon?: string | null;
}

/** The seven pages, in their original order: what the sidebar shows when there is no login (local demo). */
export const STATIC_NAV_ITEMS: SidebarItem[] = [
  { to: '/', label: 'Dashboard', icon: 'ChartBarIcon' },
  { to: '/facilities', label: 'Facilities', icon: 'BuildingOffice2Icon' },
  { to: '/compliance', label: 'Compliance', icon: 'ClipboardDocumentCheckIcon' },
  { to: '/deviations', label: 'Deviations', icon: 'ExclamationTriangleIcon' },
  { to: '/compliance/patients', label: 'Patients', icon: 'ClipboardDocumentCheckIcon' },
  { to: '/events', label: 'Events', icon: 'SignalIcon' },
  { to: '/ingestion', label: 'Ingestion', icon: 'CogIcon' },
];

interface SidebarProps {
  /** The entries to show. Defaults to the fixed list, so it is unchanged wherever no menus are passed. */
  items?: SidebarItem[];
  /** `error` shows a message with Retry instead of entries — never a wrong or half list. */
  status?: 'ready' | 'loading' | 'error';
  onRetry?: () => void;
}

export function Sidebar({ items = STATIC_NAV_ITEMS, status = 'ready', onRetry }: SidebarProps = {}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-gray-200 bg-white">
      <Link
        to="/"
        className="flex h-[72px] items-center gap-2 border-b border-gray-100 px-4 transition-colors hover:bg-gray-50"
        aria-label="CCE Insights home"
      >
        <img src={mohLogo} alt="Republic of Rwanda — Ministry of Health" className="h-8 w-8 object-contain" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-[#1d5fae]">CCE Insights</span>
          <span className="text-[11px] text-gray-500">MOH Digital Health</span>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Main" aria-busy={status === 'loading'}>
        {status === 'error' ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            <p className="font-medium">Could not load your menus</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-1.5 rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-100"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-0.5">
            {items.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/' || to === '/compliance'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <MenuIcon name={icon} unknown="blank" className="h-[18px] w-[18px]" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}
