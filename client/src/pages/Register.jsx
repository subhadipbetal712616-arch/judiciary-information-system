/**
 * Register page — create a new account.
 * First user ever is auto-promoted to admin by the backend.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { ROLES } from '../utils/constants';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'lawyer',
    barNumber: '',
    employeeId: '',
    phone: '',
    specialization: '',
    court: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Scale size={24} className="text-gray-900" />
          <span className="text-lg font-semibold text-gray-900">Judiciary Information System</span>
        </div>

        <div className="card p-6">
          <h1 className="text-lg font-semibold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">
            The first account created becomes the system admin.
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <Input label="Full name" required value={form.name} onChange={update('name')} />
            <Input label="Email" type="email" required value={form.email} onChange={update('email')} />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                required
                value={form.password}
                onChange={update('password')}
              />
              <Input
                label="Confirm"
                type="password"
                required
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
              />
            </div>

            <Select
              label="Role"
              value={form.role}
              onChange={update('role')}
              options={ROLES.filter((r) => r !== 'admin')}
            />

            {form.role === 'lawyer' && (
              <Input
                label="Bar number"
                value={form.barNumber}
                onChange={update('barNumber')}
                placeholder="e.g. MAH/2015/0456"
              />
            )}
            {(form.role === 'judge' || form.role === 'registrar') && (
              <Input
                label="Employee ID"
                value={form.employeeId}
                onChange={update('employeeId')}
                placeholder="e.g. JUD101"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input label="Phone" value={form.phone} onChange={update('phone')} />
              <Input
                label="Specialization"
                value={form.specialization}
                onChange={update('specialization')}
                placeholder="e.g. Criminal Law"
              />
            </div>

            <Input
              label="Court"
              value={form.court}
              onChange={update('court')}
              placeholder="e.g. High Court - Mumbai"
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-4 text-sm text-gray-500 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
