/**
 * ProtectedRoute — gate that requires an authenticated user.
 * Optional `roles` array restricts to certain roles.
 * Shows a loading spinner while the auth state is being restored.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale } from 'lucide-react';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Scale className="animate-pulse text-gray-400" size={32} />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen text-center px-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Access denied</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your role ({user.role}) is not permitted to view this page.
          </p>
        </div>
      </div>
    );
  }
  return children;
}
