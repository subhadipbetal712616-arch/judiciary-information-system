/**
 * Login page — centered card with email/password form.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scale, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Scale size={24} className="text-gray-900" />
          <span className="text-lg font-semibold text-gray-900">Judiciary Information System</span>
        </div>

        <div className="card p-6">
          <h1 className="text-lg font-semibold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-500 mt-1">Use your judiciary account to continue.</p>

          {error && (
            <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={update('email')}
                  className="input pl-9"
                  placeholder="you@judiciary.gov"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={update('password')}
                  className="input pl-9"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-4 text-sm text-gray-500 text-center">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-gray-900 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Default seeded login: admin@judiciary.gov / password123
        </p>
      </div>
    </div>
  );
}
