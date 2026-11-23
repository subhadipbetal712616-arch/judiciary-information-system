/**
 * CaseForm — create or edit a case.
 * Detects mode via :id route param. Loads users for judge/lawyer/registrar
 * dropdowns and pre-populates the form when editing.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, AlertCircle, Save } from 'lucide-react';
import api from '../../services/api';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import { CASE_TYPES, CASE_STATUSES, PRIORITIES } from '../../utils/constants';

const EMPTY = {
  caseNumber: '',
  title: '',
  caseType: 'Civil',
  status: 'Filed',
  plaintiff: '',
  defendant: '',
  description: '',
  judge: '',
  lawyer: '',
  registrar: '',
  filingDate: format(new Date(), 'yyyy-MM-dd'),
  nextHearingDate: '',
  courtRoom: '',
  priority: 'Medium',
};

export default function CaseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY);
  const [users, setUsers] = useState({ judges: [], lawyers: [], registrars: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load users (only admin has /api/users, but judges/registrar/admin need
    // the dropdown. We retry gracefully: fall back to a no-list mode.)
    api
      .get('/users')
      .then((res) => {
        const u = res.data;
        setUsers({
          judges: u.filter((x) => x.role === 'judge'),
          lawyers: u.filter((x) => x.role === 'lawyer'),
          registrars: u.filter((x) => x.role === 'registrar'),
        });
      })
      .catch(() => {
        // Non-admin users: still allow creating cases with free-text fields left blank.
        setUsers({ judges: [], lawyers: [], registrars: [] });
      });

    if (isEdit) {
      api
        .get(`/cases/${id}`)
        .then((res) => {
          const c = res.data;
          setForm({
            ...EMPTY,
            ...c,
            judge: c.judge?._id || '',
            lawyer: c.lawyer?._id || '',
            registrar: c.registrar?._id || '',
            filingDate: c.filingDate ? format(parseISO(c.filingDate), 'yyyy-MM-dd') : '',
            nextHearingDate: c.nextHearingDate ? format(parseISO(c.nextHearingDate), 'yyyy-MM-dd') : '',
          });
        })
        .catch((err) => setError(err.response?.data?.message || 'Failed to load case.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form };
      // Drop empty date strings so Mongoose uses the default / undefined.
      if (!payload.nextHearingDate) delete payload.nextHearingDate;
      if (isEdit) {
        await api.put(`/cases/${id}`, payload);
        navigate(`/cases/${id}`);
      } else {
        const res = await api.post('/cases', payload);
        navigate(`/cases/${res.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save case.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Loading form…</div>;

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <Link to={isEdit ? `/cases/${id}` : '/cases'} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft size={14} className="mr-1" /> Back
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-gray-900">
          {isEdit ? 'Edit case' : 'File new case'}
        </h2>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Case number"
            required
            value={form.caseNumber}
            onChange={update('caseNumber')}
            placeholder="CRL/2024/001"
          />
          <Input label="Title" required value={form.title} onChange={update('title')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select label="Case type" required value={form.caseType} onChange={update('caseType')} options={CASE_TYPES} />
          <Select label="Status" value={form.status} onChange={update('status')} options={CASE_STATUSES} />
          <Select label="Priority" value={form.priority} onChange={update('priority')} options={PRIORITIES} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Plaintiff" required value={form.plaintiff} onChange={update('plaintiff')} />
          <Input label="Defendant" required value={form.defendant} onChange={update('defendant')} />
        </div>

        <Textarea label="Description" value={form.description} onChange={update('description')} rows={4} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Judge"
            value={form.judge}
            onChange={update('judge')}
            options={users.judges.map((u) => ({ value: u._id, label: u.name }))}
          />
          <Select
            label="Lawyer"
            value={form.lawyer}
            onChange={update('lawyer')}
            options={users.lawyers.map((u) => ({ value: u._id, label: u.name }))}
          />
          <Select
            label="Registrar"
            value={form.registrar}
            onChange={update('registrar')}
            options={users.registrars.map((u) => ({ value: u._id, label: u.name }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Filing date" type="date" value={form.filingDate} onChange={update('filingDate')} />
          <Input label="Next hearing date" type="date" value={form.nextHearingDate} onChange={update('nextHearingDate')} />
          <Input label="Court room" value={form.courtRoom} onChange={update('courtRoom')} placeholder="Court Room 1" />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={() => navigate(isEdit ? `/cases/${id}` : '/cases')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save size={14} /> {saving ? 'Saving…' : isEdit ? 'Save changes' : 'File case'}
          </Button>
        </div>
      </form>
    </div>
  );
}
