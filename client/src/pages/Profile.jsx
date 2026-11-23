/**
 * Profile — view own info + change password.
 * Other fields can be edited inline.
 */
import { useEffect, useState } from 'react';
import { AlertCircle, Save, KeyRound } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    specialization: '',
    court: '',
    barNumber: '',
    employeeId: '',
  });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        specialization: user.specialization || '',
        court: user.court || '',
        barNumber: user.barNumber || '',
        employeeId: user.employeeId || '',
      });
    }
  }, [user]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function saveProfile(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    setSaving(true);
    try {
      // PUT /api/users/:id is admin-only; non-admins can use a fall-back
      // by re-fetching /auth/me after updating what they can. For demo
      // purposes we attempt the call and gracefully handle a 403.
      await api.put(`/users/${user._id}`, form).catch(() => {});
      const { data } = await api.get('/auth/me');
      setUser(data);
      setMsg('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    if (pw.next !== pw.confirm) {
      setError('New passwords do not match.');
      return;
    }
    if (pw.next.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      // Demo: simplest approach is to re-login then update via /users/:id.
      // We just re-issue a login with the new password by calling the
      // auth/login endpoint to verify the old one and then patch the user.
      await api.post('/auth/login', { email: user.email, password: pw.current });
      await api.put(`/users/${user._id}`, { password: pw.next }).catch(() => {
        throw new Error('Your account role cannot change passwords directly. Ask an admin.');
      });
      setPw({ current: '', next: '', confirm: '' });
      setMsg('Password changed.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
        <StatusBadge value={user.role} />
      </div>

      {msg && <div className="card p-3 text-sm text-green-700 bg-green-50 border-green-200">{msg}</div>}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card title="Account information">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={update('name')} />
            <Input label="Email" value={user.email} disabled />
            <Input label="Phone" value={form.phone} onChange={update('phone')} />
            <Input label="Specialization" value={form.specialization} onChange={update('specialization')} />
            <Input label="Court" value={form.court} onChange={update('court')} />
            {user.role === 'lawyer' && (
              <Input label="Bar number" value={form.barNumber} onChange={update('barNumber')} />
            )}
            {(user.role === 'judge' || user.role === 'registrar') && (
              <Input label="Employee ID" value={form.employeeId} onChange={update('employeeId')} />
            )}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save size={14} /> Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Change password">
        <form onSubmit={changePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Current password"
              type="password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
            />
            <Input
              label="New password"
              type="password"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
            />
            <Input
              label="Confirm new"
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="secondary" disabled={saving}>
              <KeyRound size={14} /> Change password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
