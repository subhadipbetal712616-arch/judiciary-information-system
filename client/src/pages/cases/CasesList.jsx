/**
 * CasesList — searchable / filterable table of cases.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Plus, Search, FolderKanban } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Select from '../../components/Select';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { CASE_TYPES, CASE_STATUSES, PRIORITY_BADGE_CLASS } from '../../utils/constants';

export default function CasesList() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    if (search) params.set('search', search);
    api
      .get(`/cases?${params.toString()}`)
      .then((res) => setCases(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load cases.'))
      .finally(() => setLoading(false));
  }, [status, type, search]);

  const columns = useMemo(
    () => [
      {
        key: 'caseNumber',
        header: 'Case No.',
        render: (c) => <span className="font-medium text-gray-900">{c.caseNumber}</span>,
      },
      {
        key: 'title',
        header: 'Title',
        render: (c) => (
          <div>
            <p className="font-medium text-gray-900">{c.title}</p>
            <p className="text-xs text-gray-500">
              {c.plaintiff} v. {c.defendant}
            </p>
          </div>
        ),
      },
      { key: 'caseType', header: 'Type' },
      {
        key: 'judge',
        header: 'Judge',
        render: (c) => c.judge?.name || '—',
      },
      {
        key: 'priority',
        header: 'Priority',
        render: (c) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              PRIORITY_BADGE_CLASS[c.priority]
            }`}
          >
            {c.priority}
          </span>
        ),
      },
      {
        key: 'filingDate',
        header: 'Filed',
        render: (c) => (c.filingDate ? format(parseISO(c.filingDate), 'dd MMM yyyy') : '—'),
      },
      {
        key: 'status',
        header: 'Status',
        render: (c) => <StatusBadge value={c.status} />,
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="label">Search</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search case number, title, parties…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={CASE_STATUSES}
          className="w-44"
        />
        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={CASE_TYPES}
          className="w-44"
        />
        <div className="ml-auto">
          {hasRole('judge', 'registrar', 'admin') && (
            <Button onClick={() => navigate('/cases/new')}>
              <Plus size={16} /> New Case
            </Button>
          )}
        </div>
      </div>

      {error && <div className="card p-4 text-sm text-red-700">{error}</div>}

      <DataTable
        columns={columns}
        data={cases}
        loading={loading}
        onRowClick={(c) => navigate(`/cases/${c._id}`)}
        emptyState={
          <EmptyState
            icon={FolderKanban}
            title="No cases found"
            message="Try adjusting the filters or file a new case."
          />
        }
      />
    </div>
  );
}
