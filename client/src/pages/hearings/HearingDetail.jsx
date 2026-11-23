/**
 * HearingDetail — view a single hearing + its case context.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Pencil, Gavel, Building2, User, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Card from '../../components/Card';

function Info({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-xs text-gray-500 flex items-center gap-1">
        {Icon && <Icon size={12} />} {label}
      </p>
      <p className="text-sm text-gray-900 mt-0.5">{value || '—'}</p>
    </div>
  );
}

export default function HearingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [hearing, setHearing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/hearings/${id}`)
      .then((res) => setHearing(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load hearing.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-sm text-gray-500">Loading hearing…</div>;
  if (error) return <div className="card p-4 text-sm text-red-700">{error}</div>;
  if (!hearing) return <div className="card p-4 text-sm text-gray-700">Hearing not found.</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <Link to="/hearings" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft size={14} className="mr-1" /> Back to hearings
          </Link>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">
            Hearing — {format(parseISO(hearing.date), 'dd MMM yyyy')} · {hearing.time}
          </h2>
          <div className="mt-1">
            <StatusBadge value={hearing.status} />
          </div>
        </div>
        {hasRole('judge', 'registrar', 'admin') && (
          <Button variant="secondary" onClick={() => navigate(`/hearings/${id}/edit`)}>
            <Pencil size={14} /> Edit
          </Button>
        )}
      </div>

      <Card title="Hearing details">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Info label="Date" value={format(parseISO(hearing.date), 'dd MMM yyyy')} icon={Calendar} />
          <Info label="Time" value={hearing.time} icon={Calendar} />
          <Info label="Court room" value={hearing.courtRoom} icon={Building2} />
          <Info label="Judge" value={hearing.judge?.name} icon={User} />
          <Info label="Agenda" value={hearing.agenda} icon={Gavel} />
          <Info label="Status" value={hearing.status} />
        </div>

        {hearing.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-700 leading-relaxed">{hearing.notes}</p>
          </div>
        )}
      </Card>

      {hearing.case && (
        <Card title="Linked case">
          <Link to={`/cases/${hearing.case._id}`} className="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded">
            <p className="text-sm font-medium text-gray-900">
              {hearing.case.caseNumber} — {hearing.case.title}
            </p>
            <p className="text-xs text-gray-500">
              {hearing.case.caseType} · {hearing.case.status}
            </p>
          </Link>
        </Card>
      )}
    </div>
  );
}
