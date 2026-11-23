/**
 * CaseDetail — full case info, related hearings, and judgment (if any).
 * Judges/admins get "Add Hearing" and "Record Judgment" buttons.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  ArrowLeft,
  Pencil,
  Gavel,
  FileText,
  User,
  Building2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { PRIORITY_BADGE_CLASS, VERDICT_BADGE_CLASS } from '../../utils/constants';

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

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [caseDoc, setCaseDoc] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [judgment, setJudgment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/cases/${id}`),
      api.get(`/hearings?caseId=${id}`),
      api.get(`/judgments?caseId=${id}`).catch(() => ({ data: [] })),
    ])
      .then(([c, h, j]) => {
        setCaseDoc(c.data);
        setHearings(h.data);
        setJudgment(Array.isArray(j.data) && j.data.length ? j.data[0] : null);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load case.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-sm text-gray-500">Loading case…</div>;
  if (error) return <div className="card p-4 text-sm text-red-700">{error}</div>;
  if (!caseDoc) return <div className="card p-4 text-sm text-gray-700">Case not found.</div>;

  const canEdit = hasRole('judge', 'registrar', 'admin');
  const canRecordJudgment = hasRole('judge', 'admin') && !judgment;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <button
            onClick={() => navigate('/cases')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={14} className="mr-1" /> Back to cases
          </button>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">
            {caseDoc.caseNumber} — {caseDoc.title}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge value={caseDoc.status} />
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                PRIORITY_BADGE_CLASS[caseDoc.priority]
              }`}
            >
              {caseDoc.priority} priority
            </span>
            <span className="text-xs text-gray-500">{caseDoc.caseType}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="secondary" onClick={() => navigate(`/cases/${id}/edit`)}>
              <Pencil size={14} /> Edit
            </Button>
          )}
          {canRecordJudgment && (
            <Button onClick={() => navigate(`/judgments/new?caseId=${id}`)}>
              <FileText size={14} /> Record Judgment
            </Button>
          )}
          {hasRole('judge', 'registrar', 'admin') && (
            <Button variant="secondary" onClick={() => navigate(`/hearings/new?caseId=${id}`)}>
              <Gavel size={14} /> Add Hearing
            </Button>
          )}
        </div>
      </div>

      {/* Info grid */}
      <Card title="Case information">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Info label="Plaintiff" value={caseDoc.plaintiff} icon={User} />
          <Info label="Defendant" value={caseDoc.defendant} icon={User} />
          <Info label="Court room" value={caseDoc.courtRoom} icon={Building2} />
          <Info
            label="Filed on"
            value={caseDoc.filingDate ? format(parseISO(caseDoc.filingDate), 'dd MMM yyyy') : '—'}
            icon={Calendar}
          />
          <Info
            label="Next hearing"
            value={caseDoc.nextHearingDate ? format(parseISO(caseDoc.nextHearingDate), 'dd MMM yyyy') : '—'}
            icon={Calendar}
          />
          <Info label="Judge" value={caseDoc.judge?.name} icon={User} />
          <Info label="Lawyer" value={caseDoc.lawyer?.name} icon={User} />
          <Info label="Registrar" value={caseDoc.registrar?.name} icon={User} />
        </div>
        {caseDoc.description && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{caseDoc.description}</p>
          </div>
        )}
      </Card>

      {/* Hearings */}
      <Card
        title="Hearings"
        action={
          <span className="text-xs text-gray-500">{hearings.length} total</span>
        }
      >
        {hearings.length ? (
          <ul className="divide-y divide-gray-100">
            {hearings.map((h) => (
              <li key={h._id} className="py-3">
                <Link
                  to={`/hearings/${h._id}`}
                  className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(parseISO(h.date), 'dd MMM yyyy')} · {h.time}
                    </p>
                    <p className="text-xs text-gray-500">
                      {h.courtRoom} · {h.agenda || 'No agenda set'}
                    </p>
                  </div>
                  <StatusBadge value={h.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={Gavel} title="No hearings" message="Schedule the first hearing for this case." />
        )}
      </Card>

      {/* Judgment */}
      <Card title="Judgment">
        {judgment ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusBadge value={judgment.verdict} classMap={VERDICT_BADGE_CLASS} />
              <span className="text-xs text-gray-500">
                Delivered on {format(parseISO(judgment.judgmentDate), 'dd MMM yyyy')} by{' '}
                {judgment.judge?.name}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{judgment.summary}</p>
            {judgment.sentenceOrRelief && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-xs text-gray-500">Sentence / Relief</p>
                <p className="text-sm text-gray-900 mt-0.5">{judgment.sentenceOrRelief}</p>
              </div>
            )}
            <Link
              to={`/judgments/${judgment._id}`}
              className="inline-flex items-center text-sm text-gray-900 hover:underline"
            >
              <FileText size={14} className="mr-1" /> View full judgment
            </Link>
          </div>
        ) : (
          <EmptyState
            icon={AlertCircle}
            title="No judgment yet"
            message={canRecordJudgment ? 'Record a judgment to dispose this case.' : 'A judgment will appear here once delivered.'}
          />
        )}
      </Card>
    </div>
  );
}
