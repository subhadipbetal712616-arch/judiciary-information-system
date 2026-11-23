/**
 * Layout — shell with Sidebar + Topbar wrapping the routed page.
 * Uses `Outlet` so nested routes render into the content area.
 */
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

// Map the top-level path segment to a title/subtitle.
const TITLES = {
  '': { title: 'Dashboard', subtitle: 'Overview of your judiciary workspace' },
  cases: { title: 'Cases', subtitle: 'Manage and track all case files' },
  hearings: { title: 'Hearings', subtitle: 'Scheduled and past court sessions' },
  judgments: { title: 'Judgments', subtitle: 'Final verdicts and judgment archive' },
  users: { title: 'Users', subtitle: 'Manage court personnel accounts' },
  profile: { title: 'Profile', subtitle: 'Your account details' },
};

export default function Layout() {
  const { pathname } = useLocation();
  const first = pathname.split('/')[1] || '';
  const meta = TITLES[first] || { title: 'Judiciary IS', subtitle: '' };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
