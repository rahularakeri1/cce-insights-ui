import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

// Shared, hoisted so the vi.mock factories below can use them.
const h = vi.hoisted(() => {
  const state = {
    auth: true,
    menus: { data: undefined as unknown, isLoading: false, isFetching: false, error: null as unknown },
    refetch: undefined as unknown as ReturnType<typeof import('vitest').vi.fn>,
    logout: undefined as unknown as ReturnType<typeof import('vitest').vi.fn>,
  };
  const stubPage = (text: string) => () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    return React.createElement('div', null, text);
  };
  return { state, stubPage };
});
const { state } = h;

vi.mock('./auth/keycloak', () => ({
  get authEnabled() {
    return h.state.auth;
  },
  logout: (...a: unknown[]) => (h.state.logout as unknown as (...x: unknown[]) => void)(...a),
  getToken: () => undefined,
  getUsername: () => undefined,
  initAuth: async () => {},
}));
vi.mock('./hooks/useMyMenus', () => ({
  useMyMenus: () => ({ ...h.state.menus, refetch: h.state.refetch }),
}));
vi.mock('./pages/Dashboard', () => ({ default: h.stubPage('Dashboard page') }));
vi.mock('./pages/ComplianceOverview', () => ({ default: h.stubPage('ComplianceOverview page') }));
vi.mock('./pages/ProtocolAnalytics', () => ({ default: h.stubPage('ProtocolAnalytics page') }));
vi.mock('./pages/PatientList', () => ({ default: h.stubPage('PatientList page') }));
vi.mock('./pages/PatientDetail', () => ({ default: h.stubPage('PatientDetail page') }));
vi.mock('./pages/Deviations', () => ({ default: h.stubPage('Deviations page') }));
vi.mock('./pages/EventVolume', () => ({ default: h.stubPage('EventVolume page') }));
vi.mock('./pages/FacilityAnalytics', () => ({ default: h.stubPage('FacilityAnalytics page') }));
vi.mock('./pages/PractitionerAnalytics', () => ({ default: h.stubPage('PractitionerAnalytics page') }));
vi.mock('./pages/IngestionPipeline', () => ({ default: h.stubPage('IngestionPipeline page') }));
vi.mock('./pages/Exports', () => ({ default: h.stubPage('Exports page') }));
vi.mock('./pages/Intelligence', () => ({ default: h.stubPage('Intelligence page') }));
vi.mock('./components/shared/DistrictFilter', () => ({ DistrictFilter: h.stubPage('district-filter') }));
vi.mock('./components/shared/FacilityFilter', () => ({ FacilityFilter: h.stubPage('facility-filter') }));
vi.mock('./components/shared/DateRangeFilter', () => ({ DateRangeFilter: h.stubPage('date-filter') }));

import { App } from './App';
import { ApiError } from './api/client';

const menu = (path: string, label: string, icon: string | null = 'ChartBarIcon') => ({ id: `id-${path}`, label, path, icon });
const ALL = [
  menu('/', 'Dashboard', 'ChartBarIcon'),
  menu('/facilities', 'Facilities', 'BuildingOffice2Icon'),
  menu('/compliance', 'Compliance', 'ClipboardDocumentCheckIcon'),
  menu('/deviations', 'Deviations', 'ExclamationTriangleIcon'),
  menu('/compliance/patients', 'Patients', 'ClipboardDocumentCheckIcon'),
  menu('/events', 'Events', 'SignalIcon'),
  menu('/ingestion', 'Ingestion', 'CogIcon'),
];

const setMenus = (m: Partial<typeof state.menus>) => {
  state.menus = { data: undefined, isLoading: false, isFetching: false, error: null, ...m };
};
const user = (menus: ReturnType<typeof menu>[]) => setMenus({ data: menus });

function Where() {
  return <div data-testid="where">{useLocation().pathname}</div>;
}
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <Where />
    </MemoryRouter>,
  );
}
const nav = () => screen.getByRole('navigation', { name: 'Main' });
const links = () => within(nav()).queryAllByRole('link').map((a) => a.textContent);
const where = () => screen.getByTestId('where').textContent;

beforeEach(() => {
  state.auth = true;
  state.refetch = vi.fn();
  state.logout = vi.fn();
  setMenus({});
});

describe('App — role-aware sidebar (Milestone 10)', () => {
  it('SUPER_ADMIN (all seven menus) sees them all, in the saved order, and the page', async () => {
    user(ALL);
    renderAt('/');
    expect(links()).toEqual(['Dashboard', 'Facilities', 'Compliance', 'Deviations', 'Patients', 'Events', 'Ingestion']);
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
    expect(screen.getByText('district-filter')).toBeInTheDocument();
  });

  it('FACILITY_ADMIN (Dashboard only) sees only Dashboard', async () => {
    user([menu('/', 'Dashboard')]);
    renderAt('/');
    expect(links()).toEqual(['Dashboard']);
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
  });

  it('typing a page the user has no menu for redirects to their first allowed page', async () => {
    user([menu('/', 'Dashboard')]);
    renderAt('/events');
    expect(where()).toBe('/');
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
    expect(screen.queryByText('EventVolume page')).not.toBeInTheDocument();
  });

  it('a user without Dashboard who opens the root lands on their first menu', async () => {
    user([menu('/events', 'Events', 'SignalIcon'), menu('/ingestion', 'Ingestion', 'CogIcon')]);
    renderAt('/');
    expect(where()).toBe('/events');
    expect(await screen.findByText('EventVolume page')).toBeInTheDocument();
  });

  it('Patients does not unlock Compliance, and Compliance does not unlock Patients', async () => {
    user([menu('/compliance/patients', 'Patients')]);
    const first = renderAt('/compliance');
    expect(where()).toBe('/compliance/patients');
    first.unmount();

    user([menu('/compliance', 'Compliance')]);
    renderAt('/compliance/patients/p-1');
    expect(where()).toBe('/compliance');
  });

  it('a detail page follows its parent menu', async () => {
    user([menu('/compliance', 'Compliance')]);
    renderAt('/compliance/protocols/abc');
    expect(where()).toBe('/compliance/protocols/abc');
    expect(await screen.findByText('ProtocolAnalytics page')).toBeInTheDocument();
  });

  it('pages with no menu entry stay open to a user with a single menu', async () => {
    user([menu('/', 'Dashboard')]);
    for (const [path, text] of [
      ['/practitioners', 'PractitionerAnalytics page'],
      ['/intelligence', 'Intelligence page'],
      ['/exports', 'Exports page'],
    ] as const) {
      const r = renderAt(path);
      expect(where()).toBe(path);
      expect(await screen.findByText(text)).toBeInTheDocument();
      r.unmount();
    }
  });

  it('follows the catalog: renamed labels and a new order are shown as given', async () => {
    user([menu('/events', 'Event volume', 'SignalIcon'), menu('/', 'Home', 'HomeIcon')]);
    renderAt('/events');
    expect(links()).toEqual(['Event volume', 'Home']);
  });

  it('a menu this app has no page for is not shown and never becomes the redirect target', async () => {
    user([menu('/brand-new', 'Brand new'), menu('/events', 'Events', 'SignalIcon')]);
    renderAt('/');
    expect(links()).toEqual(['Events']);
    expect(where()).toBe('/events');
  });

  it('draws each saved icon beside its link', async () => {
    user([menu('/', 'Dashboard', 'ChartBarIcon'), menu('/events', 'Events', null)]);
    renderAt('/');
    expect(within(nav()).getByRole('link', { name: 'Dashboard' }).querySelector('svg')).not.toBeNull();
    expect(within(nav()).getByRole('link', { name: 'Events' }).querySelector('svg')).toBeNull();
  });

  describe('when there is nothing to show', () => {
    it('a user with no menus gets "No access" with Sign out, no entries and no data page or filters', async () => {
      user([]);
      renderAt('/');
      expect(screen.getByRole('heading', { name: /No access to CCE Insights/ })).toBeInTheDocument();
      expect(links()).toEqual([]);
      expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument();
      expect(screen.queryByText('district-filter')).not.toBeInTheDocument();

      const inScreen = within(screen.getByRole('status')).getByRole('button', { name: 'Sign out' });
      fireEvent.click(inScreen);
      expect(state.logout).toHaveBeenCalled();
    });

    it('a 403 (the admin console has no such user) is the same: an answer, not an error to retry', async () => {
      setMenus({ error: new ApiError(403, { code: 'FORBIDDEN', message: 'Access denied' }) });
      renderAt('/');
      expect(screen.getByRole('heading', { name: /No access to CCE Insights/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });

    it('only menus this app has no page for also means no access', async () => {
      user([menu('/brand-new', 'Brand new')]);
      renderAt('/');
      expect(screen.getByRole('heading', { name: /No access to CCE Insights/ })).toBeInTheDocument();
    });

    it('while the menus load there is a spinner and no sidebar entries — never the wrong list', async () => {
      setMenus({ isLoading: true });
      const { container } = renderAt('/');
      expect(links()).toEqual([]);
      expect(nav()).toHaveAttribute('aria-busy', 'true');
      expect(container.querySelector('.animate-spin')).not.toBeNull();
      expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument();
    });

    it('a failed call shows an error with Retry (in the sidebar and the page), and Retry asks again', async () => {
      setMenus({ error: new ApiError(500, { code: 'INTERNAL', message: 'boom' }) });
      renderAt('/');
      expect(links()).toEqual([]);
      const retries = screen.getAllByRole('button', { name: 'Retry' });
      expect(retries).toHaveLength(2);
      expect(screen.getByRole('heading', { name: 'Could not load your menus' })).toBeInTheDocument();
      expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument();

      fireEvent.click(retries[1]);
      expect(state.refetch).toHaveBeenCalledTimes(1);
    });

    it('a background refresh that fails keeps the menus already on screen', async () => {
      setMenus({ data: [menu('/', 'Dashboard')], error: new ApiError(500, { code: 'INTERNAL', message: 'boom' }) });
      renderAt('/');
      expect(links()).toEqual(['Dashboard']);
      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });
  });

  describe('auth off (local demo): unchanged', () => {
    it('shows all seven links and every page, ignoring any menus data', async () => {
      state.auth = false;
      user([menu('/', 'Dashboard')]); // would restrict the user if auth were on
      renderAt('/events');
      expect(links()).toEqual(['Dashboard', 'Facilities', 'Compliance', 'Deviations', 'Patients', 'Events', 'Ingestion']);
      expect(where()).toBe('/events');
      expect(await screen.findByText('EventVolume page')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
    });
  });

  it('shows Sign out in the header whenever auth is on', async () => {
    user(ALL);
    renderAt('/');
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });
});
