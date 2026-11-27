import { describe, expect, it } from 'vitest';
import { GOVERNED_PATHS, governingPath, isAllowed, visibleMenus } from './menuAccess';

describe('governingPath — which sidebar menu a page belongs to', () => {
  it('maps each sidebar page to itself', () => {
    for (const p of GOVERNED_PATHS) expect(governingPath(p)).toBe(p);
  });

  it('"/" governs only the exact root, not every page', () => {
    expect(governingPath('/')).toBe('/');
    expect(governingPath('/practitioners')).toBeNull();
    expect(governingPath('/exports')).toBeNull();
  });

  it('a detail page belongs to its parent menu', () => {
    expect(governingPath('/compliance/protocols/abc-123')).toBe('/compliance');
  });

  it('the LONGEST sidebar path wins: patients are Patients, not Compliance', () => {
    expect(governingPath('/compliance/patients')).toBe('/compliance/patients');
    expect(governingPath('/compliance/patients/p-42')).toBe('/compliance/patients');
    expect(governingPath('/compliance')).toBe('/compliance');
  });

  it('does not match on a partial segment', () => {
    expect(governingPath('/eventsfoo')).toBeNull();
    expect(governingPath('/facilitiesX/1')).toBeNull();
    expect(governingPath('/compliance-extra')).toBeNull();
  });

  it('ignores a trailing slash', () => {
    expect(governingPath('/events/')).toBe('/events');
    expect(governingPath('/compliance/patients/')).toBe('/compliance/patients');
  });

  it('pages with no menu entry are ungoverned', () => {
    for (const p of ['/practitioners', '/intelligence', '/exports', '/nowhere']) expect(governingPath(p)).toBeNull();
  });
});

describe('isAllowed', () => {
  const facilityAdmin = ['/'];
  const patientsOnly = ['/compliance/patients'];
  const complianceOnly = ['/compliance'];

  it('lets a user open the pages of the menus they hold', () => {
    expect(isAllowed('/', facilityAdmin)).toBe(true);
    expect(isAllowed('/compliance/patients/p-1', patientsOnly)).toBe(true);
    expect(isAllowed('/compliance/protocols/x', complianceOnly)).toBe(true);
  });

  it('refuses a page whose menu the user lacks', () => {
    expect(isAllowed('/events', facilityAdmin)).toBe(false);
    expect(isAllowed('/facilities', facilityAdmin)).toBe(false);
  });

  it('Compliance does not unlock Patients, and Patients does not unlock Compliance', () => {
    expect(isAllowed('/compliance/patients', complianceOnly)).toBe(false);
    expect(isAllowed('/compliance/patients/p-1', complianceOnly)).toBe(false);
    expect(isAllowed('/compliance', patientsOnly)).toBe(false);
    expect(isAllowed('/compliance/protocols/x', patientsOnly)).toBe(false);
  });

  it('a user without Dashboard cannot open the root', () => {
    expect(isAllowed('/', ['/events'])).toBe(false);
  });

  it('pages with no menu entry stay open to everyone, even a user with one menu', () => {
    for (const p of ['/practitioners', '/intelligence', '/exports']) expect(isAllowed(p, facilityAdmin)).toBe(true);
  });

  it('a user with no menus can open only the ungoverned pages', () => {
    expect(isAllowed('/', [])).toBe(false);
    expect(isAllowed('/exports', [])).toBe(true);
  });
});

describe('visibleMenus', () => {
  it('keeps only menus this app has a page for, in the given order', () => {
    const menus = [
      { path: '/events', label: 'Events' },
      { path: '/brand-new', label: 'Brand new' },
      { path: '/', label: 'Dashboard' },
    ];
    expect(visibleMenus(menus).map((m) => m.label)).toEqual(['Events', 'Dashboard']);
  });
});
