/**
 * HearingForm — create or edit a hearing.
 * Reads ?caseId= from the URL to pre-select a case.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, AlertCircle, Save } from 'lucide-react';
import api from '../../services/api';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { HEARING_STATUSES } from '../../utils/constants';

const EMPTY = {
  case: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '10:00',
  courtRoom: '',
  judge: '',
  status: 'Scheduled',
  agenda: '',
  notes: '',
};

export default function HearingForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ ...EMPTY, case: params.get('caseId') || '' });
  const [cases, setCases] = useState([]);
  const [judges, setJudges] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load cases for the dropdown (and judges if the user can read /users).
    api.get('/cases').then((res) => setCases(res.data)).catch(() => setCases([]));
    api
      .get('/users')
      .then((res) => setJudges(res.data.filter((u) => u.role === 'judge')))
      .catch(() => setJudges([]));

    if (isEdit) {
      api
        .get(`/hearings/${id}`)
        .then((res) => {
          const h = res.data;
          setForm({
            ...EMPTY,
            ...h,
            case: h.case?._id || h.case,
            judge: h.judge?._id || '',
            date: h.date ? format(parseISO(h.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          });
        })
        .catch((err) => setError(err.response?.data?.message || 'Failed to load hearing.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  // When the case changes, pre-fill the judge and court room from the case.
  function onCaseChange(e) {
    const caseId = e.target.value;
    const selected = cases.find((c) => c._id === caseId);
    setForm((f) => ({
      ...f,
      case: caseId,
      judge: selected?.judge?._id || f.judge,
      courtRoom: selected?.courtRoom || f.courtRoom,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.case || !form.date || !form.time || !form.courtRoom) {
      setError('Case, date, time, and court room are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (isEdit) {
        await api.put(`/hearings/${id}`, payload);
        navigate(`/hearings/${id}`);
      } else {
        const res = await api.post('/hearings', payload);
        navigate(`/hearings/${res.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save hearing.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Loading form…</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <Link to={isEdit ? `/hearings/${id}` : '/hearings'} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft size={14} className="mr-1" /> Back
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-gray-900">
          {isEdit ? 'Edit hearing' : 'Schedule new hearing'}
        </h2>
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
          onChange={onCaseChange}
          options={cases.map((c) => ({ value: c._id, label: `${c.caseNumber} — ${c.title}` }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Date" type="date" required value={form.date} onChange={update('date')} />
          <Input label="Time" type="time" required value={form.time} onChange={update('time')} />
          <Input label="Court room" required value={form.courtRoom} onChange={update('courtRoom')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Judge"
            value={form.judge}
            onChange={update('judge')}
            options={judges.map((u) => ({ value: u._id, label: u.name }))}
          />
          <Select label="Status" value={form.status} onChange={update('status')} options={HEARING_STATUSES} />
        </div>

        <Input label="Agenda" value={form.agenda} onChange={update('agenda')} placeholder="e.g. Cross-examination of PW-1" />
        <Textarea label="Notes" value={form.notes} onChange={update('notes')} rows={3} />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={() => navigate(isEdit ? `/hearings/${id}` : '/hearings')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save size={14} /> {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Schedule hearing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
