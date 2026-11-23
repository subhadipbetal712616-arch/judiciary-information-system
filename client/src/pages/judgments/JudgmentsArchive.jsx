/**
 * JudgmentsArchive — searchable list of all judgments.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Search, FileText } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import Select from '../../components/Select';
import EmptyState from '../../components/EmptyState';
import { VERDICTS, VERDICT_BADGE_CLASS } from '../../utils/constants';

export default function JudgmentsArchive() {
  const navigate = useNavigate();
  const [judgments, setJudgments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [verdict, setVerdict] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (verdict) params.set('verdict', verdict);
    if (search) params.set('search', search);
    api
      .get(`/judgments?${params.toString()}`)
      .then((res) => setJudgments(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load judgments.'))
      .finally(() => setLoading(false));
  }, [search, verdict]);

  const columns = useMemo(
    () => [
      {
        key: 'case',
        header: 'Case',
        render: (j) => (
          <div>
            <p className="font-medium text-gray-900">{j.case?.caseNumber}</p>
            <p className="text-xs text-gray-500 truncate max-w-[260px]">{j.case?.title}</p>
          </div>
        ),
      },
      {
        key: 'verdict',
        header: 'Verdict',
        render: (j) => <StatusBadge value={j.verdict} classMap={VERDICT_BADGE_CLASS} />,
      },
      {
        key: 'judge',
        header: 'Judge',
        render: (j) => j.judge?.name || '—',
      },
      {
        key: 'judgmentDate',
        header: 'Date',
        render: (j) => (j.judgmentDate ? format(parseISO(j.judgmentDate), 'dd MMM yyyy') : '—'),
      },
      {
        key: 'summary',
        header: 'Summary',
        render: (j) => <p className="text-xs text-gray-600 line-clamp-2 max-w-md">{j.summary}</p>,
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
              placeholder="Search summary, relief, full text…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <Select
          label="Verdict"
          value={verdict}
          onChange={(e) => setVerdict(e.target.value)}
          options={VERDICTS}
          className="w-52"
        />
      </div>

      {error && <div className="card p-4 text-sm text-red-700">{error}</div>}

      <DataTable
        columns={columns}
        data={judgments}
        loading={loading}
        onRowClick={(j) => navigate(`/judgments/${j._id}`)}
        emptyState={
          <EmptyState icon={FileText} title="No judgments found" message="Try adjusting your search or filters." />
        }
      />
    </div>
  );
}
