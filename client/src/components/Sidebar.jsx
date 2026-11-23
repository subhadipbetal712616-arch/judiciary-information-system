/**
 * Sidebar — role-aware navigation. Items are filtered by role.
 * Active item uses gray-900 background + white text.
 */
import { NavLink } from 'react-router-dom';
import {
  Scale,
  LayoutDashboard,
  FolderKanban,
  Gavel,
  FileText,
  Users,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Nav item definitions. `roles` (when present) restricts visibility.
 */
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/cases', label: 'Cases', icon: FolderKanban },
  { to: '/hearings', label: 'Hearings', icon: Gavel },
  { to: '/judgments', label: 'Judgments', icon: FileText },
  { to: '/users', label: 'Users', icon: Users, roles: ['admin'] },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const { user } = useAuth();

  const items = NAV_ITEMS.filter((it) => !it.roles || it.roles.includes(user?.role));

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-200">
        <Scale size={20} className="text-gray-900" />
        <span className="font-semibold text-gray-900">Judiciary IS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer info */}
      <div className="px-5 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">Signed in as</p>
        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
      </div>
    </aside>
  );
}
