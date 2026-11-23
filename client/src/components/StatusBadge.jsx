/**
 * StatusBadge — renders a colored pill for any status / verdict value.
 * Falls back to a neutral gray pill for unknown values.
 */
import { STATUS_BADGE_CLASS } from '../utils/constants';

export default function StatusBadge({ value, classMap = STATUS_BADGE_CLASS }) {
  const cls = classMap[value] || 'bg-gray-100 text-gray-700';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}
    >
      {value || '—'}
    </span>
  );
}
