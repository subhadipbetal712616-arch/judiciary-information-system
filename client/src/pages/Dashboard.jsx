/**
 * Dashboard — role-aware home page with stat cards + lists.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import {
  FolderKanban,
  FolderOpen,
  Gavel,
  FileText,
  Users,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { PRIORITY_BADGE_CLASS } from '../utils/constants';

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <Icon size={18} className="text-gray-400" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

/** Pretty date with "Today"/"Tomorrow" shortcuts. */
function prettyDate(iso) {
  if (!iso) return '—';
  const d = parseISO(iso);
  if (isToday(d)) return `Today, ${format(d, 'HH:mm')}`;
  if (isTomorrow(d)) return `Tomorrow, ${format(d, 'HH:mm')}`;
  return format(d, 'dd MMM yyyy, HH:mm');
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/upcoming-hearings'),
      api.get('/dashboard/recent-cases'),
    ])
      .then(([s, u, r]) => {
        setStats(s.data);
        setUpcoming(u.data);
        setRecent(r.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading dashboard…</div>;
  }
  if (error) {
    return <div className="card p-5 text-sm text-red-700">{error}</div>;
  }

  // Role-aware quick links.
  const quickLinks = [
    { to: '/cases', label: 'Browse cases', icon: FolderKanban, show: true },
    { to: '/cases/new', label: 'File new case', icon: FolderOpen, show: hasRole('judge', 'registrar', 'admin') },
    { to: '/hearings', label: 'View hearings', icon: Gavel, show: true },
    { to: '/hearings/new', label: 'Schedule hearing', icon: Calendar, show: hasRole('judge', 'registrar', 'admin') },
    { to: '/judgments/new', label: 'Record judgment', icon: FileText, show: hasRole('judge', 'admin') },
    { to: '/users', label: 'Manage users', icon: Users, show: hasRole('admin') },
  ].filter((l) => l.show);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}.
        </h2>
        <p className="text-sm text-gray-500">
          You are signed in as <span className="capitalize">{user?.role}</span>.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total cases" value={stats?.totalCases ?? 0} icon={FolderKanban} />
        <StatCard label="Open cases" value={stats?.openCases ?? 0} icon={FolderOpen} />
        <StatCard label="Hearings this week" value={stats?.hearingsThisWeek ?? 0} icon={Gavel} />
        <StatCard label="Judgments this month" value={stats?.judgmentsThisMonth ?? 0} icon={FileText} />
      </div>

      {/* Two-column lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Upcoming hearings"
          action={
            <Link to="/hearings" className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center">
              View all <ArrowRight size={12} className="ml-1" />
            </Link>
          }
        >
          {upcoming.length ? (
            <ul className="divide-y divide-gray-100">
              {upcoming.map((h) => (
                <li key={h._id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <Link
                      to={`/cases/${h.case?._id}`}
                      className="text-sm font-medium text-gray-900 hover:underline truncate block"
                    >
                      {h.case?.caseNumber} — {h.case?.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {prettyDate(h.date)} · {h.courtRoom}
                    </p>
                  </div>
                  <StatusBadge value={h.status} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No upcoming hearings" message="Nothing scheduled in the next week." />
          )}
        </Card>

        <Card
          title="Recently filed cases"
          action={
            <Link to="/cases" className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center">
              View all <ArrowRight size={12} className="ml-1" />
            </Link>
          }
        >
          {recent.length ? (
            <ul className="divide-y divide-gray-100">
              {recent.map((c) => (
                <li key={c._id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <Link
                      to={`/cases/${c._id}`}
                      className="text-sm font-medium text-gray-900 hover:underline truncate block"
                    >
                      {c.caseNumber} — {c.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {c.caseType} · Filed {format(new Date(c.filingDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        PRIORITY_BADGE_CLASS[c.priority]
                      }`}
                    >
                      {c.priority}
                    </span>
                    <StatusBadge value={c.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No cases yet" message="File your first case to get started." />
          )}
        </Card>
      </div>

      {/* Quick links */}
      <Card title="Quick links">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Icon size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
