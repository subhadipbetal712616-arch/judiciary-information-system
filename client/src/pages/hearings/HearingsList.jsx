/**
 * HearingsList — Upcoming and Past sections, with status filter.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isAfter, isToday, startOfToday } from 'date-fns';
import { Plus, Gavel, Search } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Select from '../../components/Select';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { HEARING_STATUSES } from '../../utils/constants';

export default function HearingsList() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    api
      .get(`/hearings?${params.toString()}`)
      .then((res) => setHearings(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load hearings.'))
      .finally(() => setLoading(false));
  }, [status]);

  // Split into upcoming (today + future, scheduled) and past (everything else).
  const today = startOfToday();
  const upcoming = hearings
    .filter((h) => (isAfter(parseISO(h.date), today) || isToday(parseISO(h.date))) && h.status === 'Scheduled')
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = hearings
    .filter((h) => !upcoming.includes(h))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (h) => (
        <div>
          <p className="font-medium text-gray-900">{format(parseISO(h.date), 'dd MMM yyyy')}</p>
          <p className="text-xs text-gray-500">{h.time}</p>
        </div>
      ),
    },
    {
      key: 'case',
      header: 'Case',
      render: (h) => (
        <div>
          <p className="font-medium text-gray-900">{h.case?.caseNumber}</p>
          <p className="text-xs text-gray-500 truncate max-w-[220px]">{h.case?.title}</p>
        </div>
      ),
    },
    { key: 'courtRoom', header: 'Room', render: (h) => h.courtRoom },
    { key: 'agenda', header: 'Agenda', render: (h) => h.agenda || '—' },
    { key: 'judge', header: 'Judge', render: (h) => h.judge?.name || '—' },
    { key: 'status', header: 'Status', render: (h) => <StatusBadge value={h.status} /> },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3">
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={HEARING_STATUSES}
          className="w-44"
        />
        <div className="ml-auto">
          {hasRole('judge', 'registrar', 'admin') && (
            <Button onClick={() => navigate('/hearings/new')}>
              <Plus size={16} /> New Hearing
            </Button>
          )}
        </div>
      </div>

      {error && <div className="card p-4 text-sm text-red-700">{error}</div>}

      {/* Upcoming */}
      <Card
        title="Upcoming hearings"
        action={<span className="text-xs text-gray-500">{upcoming.length} scheduled</span>}
      >
        {loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Loading…</p>
        ) : upcoming.length ? (
          <DataTable
            columns={columns}
            data={upcoming}
            onRowClick={(h) => navigate(`/hearings/${h._id}`)}
          />
        ) : (
          <EmptyState icon={Gavel} title="No upcoming hearings" message="Schedule a hearing to see it here." />
        )}
      </Card>

      {/* Past */}
      <Card
        title="Past hearings"
        action={<span className="text-xs text-gray-500">{past.length} total</span>}
      >
        {loading ? (
          <p className="text-sm text-gray-500 py-6 text-center">Loading…</p>
        ) : past.length ? (
          <DataTable
            columns={columns}
            data={past}
            onRowClick={(h) => navigate(`/hearings/${h._id}`)}
          />
        ) : (
          <EmptyState icon={Search} title="No past hearings" message="Past hearings will be archived here." />
        )}
      </Card>
    </div>
  );
}
