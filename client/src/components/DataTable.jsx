/**
 * DataTable — reusable table with header config and row rendering.
 * Props:
 *  - columns: [{ key, header, className, render?: (row) => ReactNode }]
 *  - data: any[]
 *  - onRowClick?: (row) => void
 *  - loading?: boolean
 *  - emptyState?: ReactNode
 *  - rowKey?: (row, idx) => string
 */
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  onRowClick,
  loading = false,
  emptyState,
  rowKey,
}) {
  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="p-8 text-center text-sm text-gray-500">Loading…</div>
      </div>
    );
  }
  if (!data.length) {
    return <div className="card overflow-hidden">{emptyState || <EmptyState />}</div>;
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${c.className || ''}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr
                key={rowKey ? rowKey(row, idx) : row._id || idx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3 text-sm text-gray-700 ${c.cellClassName || ''}`}
                  >
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
