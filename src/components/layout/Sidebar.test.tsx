import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

// RI-67: MoH branding — the sidebar's home link carries the Rwanda MoH seal plus
// "CCE Insights" / "MOH Digital Health", above the nav list.
describe('Sidebar', () => {
  it('renders the MoH seal and branding text', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img', { name: 'Republic of Rwanda — Ministry of Health' })).toBeInTheDocument();
    expect(screen.getByText('CCE Insights')).toBeInTheDocument();
    expect(screen.getByText('MOH Digital Health')).toBeInTheDocument();
  });

  it('renders all 7 nav links', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );
    for (const label of ['Dashboard', 'Facilities', 'Compliance', 'Deviations', 'Patients', 'Events', 'Ingestion']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('draws an icon beside every link of the default list', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );
    for (const label of ['Dashboard', 'Facilities', 'Compliance', 'Deviations', 'Patients', 'Events', 'Ingestion']) {
      expect(screen.getByRole('link', { name: label }).querySelector('svg'), label).not.toBeNull();
    }
  });

  describe('role-aware (Milestone 10)', () => {
    const renderWith = (props: React.ComponentProps<typeof Sidebar>) =>
      render(
        <MemoryRouter>
          <Sidebar {...props} />
        </MemoryRouter>,
      );

    it('shows exactly the entries it is given, in that order, with their saved icons', () => {
      renderWith({
        items: [
          { to: '/events', label: 'Events', icon: 'SignalIcon' },
          { to: '/', label: 'Home page', icon: 'HomeIcon' },
        ],
      });
      const nav = screen.getByRole('navigation', { name: 'Main' });
      const links = within(nav).getAllByRole('link');
      expect(links.map((a) => a.textContent)).toEqual(['Events', 'Home page']);
      expect(links[0]).toHaveAttribute('href', '/events');
      expect(links.every((a) => a.querySelector('svg') !== null)).toBe(true);
    });

    it('a missing or unknown icon leaves a link with its label and no icon', () => {
      renderWith({
        items: [
          { to: '/events', label: 'Events', icon: null },
          { to: '/', label: 'Dashboard', icon: 'NopeIcon' },
        ],
      });
      for (const label of ['Events', 'Dashboard']) {
        const link = screen.getByRole('link', { name: label });
        expect(link.querySelector('svg')).toBeNull(); // blank, not a ? for a signed-in user
      }
    });

    it('an empty list shows no entries (but keeps the branding)', () => {
      renderWith({ items: [] });
      expect(within(screen.getByRole('navigation', { name: 'Main' })).queryAllByRole('link')).toHaveLength(0);
      expect(screen.getByText('CCE Insights')).toBeInTheDocument();
    });

    it('while loading it shows no entries and says it is busy — never a wrong list', () => {
      renderWith({ items: [], status: 'loading' });
      const nav = screen.getByRole('navigation', { name: 'Main' });
      expect(nav).toHaveAttribute('aria-busy', 'true');
      expect(within(nav).queryAllByRole('link')).toHaveLength(0);
    });

    it('on an error it shows a message with Retry instead of entries', () => {
      const onRetry = vi.fn();
      renderWith({ items: [], status: 'error', onRetry });
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Could not load your menus');
      expect(screen.queryAllByRole('link', { name: /Dashboard|Events/ })).toHaveLength(0);

      fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });
});
