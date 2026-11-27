import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { DateRangeFilter } from './components/shared/DateRangeFilter';
import { DistrictFilter } from './components/shared/DistrictFilter';
import { FacilityFilter } from './components/shared/FacilityFilter';
import { authEnabled, logout } from './auth/keycloak';
import { MenusError, NoAccess } from './components/layout/AccessScreens';
import { useMenuAccess } from './hooks/useMenuAccess';
import { isAllowed } from './utils/menuAccess';
import mohLogo from './assets/rwanda-national-coat-of-arms.png';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ComplianceOverview = lazy(() => import('./pages/ComplianceOverview'));
const ProtocolAnalytics = lazy(() => import('./pages/ProtocolAnalytics'));
const PatientList = lazy(() => import('./pages/PatientList'));
const PatientDetail = lazy(() => import('./pages/PatientDetail'));
const Deviations = lazy(() => import('./pages/Deviations'));
const EventVolume = lazy(() => import('./pages/EventVolume'));
const FacilityAnalytics = lazy(() => import('./pages/FacilityAnalytics'));
const PractitionerAnalytics = lazy(() => import('./pages/PractitionerAnalytics'));
const IngestionPipeline = lazy(() => import('./pages/IngestionPipeline'));
const Exports = lazy(() => import('./pages/Exports'));
const Intelligence = lazy(() => import('./pages/Intelligence'));

export function App() {
  const access = useMenuAccess();
  const { pathname } = useLocation();
  // Filters query data pages: show them only where pages can be shown at all.
  const showPages = access.mode === 'open' || access.mode === 'ready';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        items={access.mode === 'ready' ? access.items : access.mode === 'open' ? undefined : []}
        status={access.mode === 'loading' ? 'loading' : access.mode === 'error' ? 'error' : 'ready'}
        onRetry={access.mode === 'error' ? access.retry : undefined}
      />
      <div className="ml-56 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-[#1d5fae] px-6 py-2.5">
          <div className="flex items-center gap-3">
            <img src={mohLogo} alt="Republic of Rwanda — Ministry of Health" className="h-14 w-14 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-white">Republic of Rwanda</span>
              <span className="text-xs text-blue-100">Ministry of Health</span>
              <span className="text-xs text-blue-100">Care Coordination Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
          {showPages && (
            <>
              <DistrictFilter />
              <FacilityFilter />
              <DateRangeFilter />
            </>
          )}
          {authEnabled && (
            <div className="flex items-center gap-3 border-l border-blue-400/50 pl-4">
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-md border border-white/40 px-3 py-1 text-sm text-white hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          )}
          </div>
        </header>
        <main className="p-6">
          {access.mode === 'loading' && <LoadingSpinner />}
          {access.mode === 'error' && <MenusError onRetry={access.retry} retrying={access.retrying} />}
          {access.mode === 'none' && <NoAccess />}
          {access.mode === 'ready' && !isAllowed(pathname, access.allowed) && <Navigate to={access.first} replace />}
          {(access.mode === 'open' || (access.mode === 'ready' && isAllowed(pathname, access.allowed))) && (
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/compliance" element={<ComplianceOverview />} />
                <Route path="/compliance/protocols/:id" element={<ProtocolAnalytics />} />
                <Route path="/compliance/patients" element={<PatientList />} />
                <Route path="/compliance/patients/:id" element={<PatientDetail />} />
                <Route path="/deviations" element={<Deviations />} />
                <Route path="/events" element={<EventVolume />} />
                <Route path="/facilities" element={<FacilityAnalytics />} />
                <Route path="/practitioners" element={<PractitionerAnalytics />} />
                <Route path="/ingestion" element={<IngestionPipeline />} />
                <Route path="/intelligence" element={<Intelligence />} />
                <Route path="/exports" element={<Exports />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
