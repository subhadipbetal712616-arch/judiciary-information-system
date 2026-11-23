/**
 * NotFound — simple 404 page.
 */
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <Compass size={40} className="mx-auto text-gray-300" />
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="mt-4 inline-block btn-primary">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
