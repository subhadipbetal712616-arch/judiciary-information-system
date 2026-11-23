/**
 * JudgmentForm — record a new judgment.
 * Only shown to judges/admins (route is gated, but we double-check here).
 * The case dropdown only shows cases that don't already have a judgment;
 * we filter client-side by trying to fetch judgments per case lazily.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, AlertCircle, Save } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { VERDICTS } from '../../utils/constants';

const EMPTY = {
  case: '',
  judge: '',
  judgmentDate: format(new Date(), 'yyyy-MM-dd'),
  verdict: '',
  summary: '',
  fullText: '',
  sentenceOrRelief: '',
};

export default function JudgmentForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, hasRole } = useAuth();

  const [form, setForm] = useState({ ...EMPTY, case: params.get('caseId') || '' });
  const [cases, setCases] = useState([]);
  const [judgedCaseIds, setJudgedCaseIds] = useState(new Set());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hasRole('judge', 'admin')) {
      setError('Only judges and admins can record judgments.');
      return;
    }
    // Load all cases, then mark which ones already have judgments so we
    // can disable them in the dropdown.
    Promise.all([api.get('/cases'), api.get('/judgments')])
      .then(([c, j]) => {
        setCases(c.data);
        setJudgedCaseIds(new Set(j.data.map((x) => x.case?._id).filter(Boolean)));
      })
      .catch(() => {
        /* swallow — form will show no cases */
      });
  }, [hasRole]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.case || !form.verdict || !form.summary) {
      setError('Case, verdict, and summary are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, judge: form.judge || user?._id };
      const res = await api.post('/judgments', payload);
      navigate(`/judgments/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record judgment.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <Link to="/judgments" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft size={14} className="mr-1" /> Back to archive
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-gray-900">Record judgment</h2>
        <p className="text-sm text-gray-500">One judgment per case. Recording marks the case as Disposed.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        <Select
          label="Case"
          required
          value={form.case}
          onChange={update('case')}
          options={cases
            .filter((c) => !judgedCaseIds.has(c._id))
            .map((c) => ({ value: c._id, label: `${c.caseNumber} — ${c.title}` }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Verdict" required value={form.verdict} onChange={update('verdict')} options={VERDICTS} />
          <Input label="Judgment date" type="date" value={form.judgmentDate} onChange={update('judgmentDate')} />
        </div>

        <Textarea
          label="Summary"
          required
          rows={3}
          value={form.summary}
          onChange={update('summary')}
          placeholder="A concise summary of the court's reasoning and decision."
        />

        <Textarea
          label="Full judgment text"
          rows={8}
          value={form.fullText}
          onChange={update('fullText')}
          placeholder="The complete judgment text, including findings of fact, law, and reasoning."
        />

        <Input
          label="Sentence / Relief"
          value={form.sentenceOrRelief}
          onChange={update('sentenceOrRelief')}
          placeholder="e.g. 5 years rigorous imprisonment + fine ₹50,000"
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={() => navigate('/judgments')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save size={14} /> {saving ? 'Saving…' : 'Record judgment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
