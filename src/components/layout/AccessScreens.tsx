import { logout } from '../../auth/keycloak';

/** The signed-in user has no Insights menu (or the service doesn't know them): nothing to show, nothing to retry. */
export function NoAccess() {
  return (
    <div role="status" className="mx-auto mt-16 max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center">
      <h1 className="text-lg font-semibold text-gray-900">No access to CCE Insights</h1>
      <p className="mt-2 text-sm text-gray-600">
        Your role doesn't have any Insights pages yet. Ask an administrator to give it some.
      </p>
      <button
        type="button"
        onClick={() => logout()}
        className="mt-4 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Sign out
      </button>
    </div>
  );
}

/** The menu call failed: we can't tell what the user may open, so we show none — never a wrong list. */
export function MenusError({ onRetry, retrying }: { onRetry: () => void; retrying: boolean }) {
  return (
    <div role="alert" className="mx-auto mt-16 max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <h1 className="text-lg font-semibold text-red-800">Could not load your menus</h1>
      <p className="mt-2 text-sm text-red-700">We can't tell which pages you may open, so none are shown.</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="mt-4 rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
      >
        {retrying ? 'Retrying…' : 'Retry'}
      </button>
    </div>
  );
}
