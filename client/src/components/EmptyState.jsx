/**
 * EmptyState — centered "no data" placeholder for tables and lists.
 */
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', message, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon size={32} className="text-gray-300" />
      <p className="mt-3 text-sm font-medium text-gray-900">{title}</p>
      {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
    </div>
  );
}
