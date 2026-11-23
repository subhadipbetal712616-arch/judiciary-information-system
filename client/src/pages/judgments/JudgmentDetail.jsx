/**
 * JudgmentDetail — full text of a judgment + case context.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, FileText, User, Calendar, Scale } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Card from '../../components/Card';
import { VERDICT_BADGE_CLASS } from '../../utils/constants';

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

export default function JudgmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [judgment, setJudgment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/judgments/${id}`)
      .then((res) => setJudgment(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load judgment.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-sm text-gray-500">Loading judgment…</div>;
  if (error) return <div className="card p-4 text-sm text-red-700">{error}</div>;
  if (!judgment) return <div className="card p-4 text-sm text-gray-700">Judgment not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link to="/judgments" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft size={14} className="mr-1" /> Back to archive
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <Scale size={20} className="text-gray-900" />
          <h2 className="text-xl font-semibold text-gray-900">Judgment</h2>
          <StatusBadge value={judgment.verdict} classMap={VERDICT_BADGE_CLASS} />
        </div>
      </div>

      <Card title="Judgment details">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Info
            label="Delivered on"
            value={format(parseISO(judgment.judgmentDate), 'dd MMM yyyy')}
            icon={Calendar}
          />
          <Info label="Presiding judge" value={judgment.judge?.name} icon={User} />
          <Info label="Verdict" value={judgment.verdict} icon={FileText} />
        </div>

        {judgment.sentenceOrRelief && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-xs text-gray-500">Sentence / Relief</p>
            <p className="text-sm text-gray-900 mt-0.5">{judgment.sentenceOrRelief}</p>
          </div>
        )}
      </Card>

      <Card title="Summary">
        <p className="text-sm text-gray-700 leading-relaxed">{judgment.summary}</p>
      </Card>

      {judgment.fullText && (
        <Card title="Full judgment text">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{judgment.fullText}</p>
        </Card>
      )}

      {judgment.case && (
        <Card title="Linked case">
          <Link to={`/cases/${judgment.case._id}`} className="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded">
            <p className="text-sm font-medium text-gray-900">
              {judgment.case.caseNumber} — {judgment.case.title}
            </p>
            <p className="text-xs text-gray-500">
              {judgment.case.caseType} · {judgment.case.plaintiff} v. {judgment.case.defendant}
            </p>
          </Link>
        </Card>
      )}
    </div>
  );
}
