/**
 * Topbar — page header with title + optional right-side actions.
 */
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, subtitle, actions }) {
  const { logout } = useAuth();
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button
          onClick={logout}
          className="btn-secondary"
          title="Sign out"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
