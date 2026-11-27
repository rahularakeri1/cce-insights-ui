import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MENU_ICONS, MenuIcon, isKnownIcon } from './menuIcons';

const SEEDED = [
  // the seven insights menus (these are the icons Sidebar.tsx always used)…
  'ChartBarIcon', 'BuildingOffice2Icon', 'ClipboardDocumentCheckIcon', 'ExclamationTriangleIcon', 'SignalIcon', 'CogIcon',
  // …and the admin console's four tabs (the same curated set serves both UIs)
  'UsersIcon', 'ShieldCheckIcon', 'Bars3Icon', 'DocumentTextIcon',
];

describe('menu icons (the same curated set as cce-admin-ui)', () => {
  it('can draw every icon the seeded menus use', () => {
    for (const name of SEEDED) expect(isKnownIcon(name), name).toBe(true);
  });

  it('every name in the set really draws an icon', () => {
    expect(Object.keys(MENU_ICONS).length).toBeGreaterThanOrEqual(60);
    for (const name of Object.keys(MENU_ICONS)) {
      const { container, unmount } = render(<MenuIcon name={name} />);
      expect(container.querySelector('svg'), name).not.toBeNull();
      unmount();
    }
  });

  it('an icon is decoration, hidden from assistive technology', () => {
    const { container } = render(<MenuIcon name="SignalIcon" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('no name, or an unknown one in "blank" mode, draws a blank of the same size', () => {
    for (const name of [null, undefined, '', 'NopeIcon']) {
      const { container, unmount } = render(<MenuIcon name={name} unknown="blank" className="h-4 w-4" />);
      expect(container.querySelector('svg')).toBeNull();
      expect(container.firstElementChild).toHaveClass('h-4', 'w-4');
      unmount();
    }
  });
});
